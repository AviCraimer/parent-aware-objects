const  { targetFromProxy, isProxy, parents, proxyFromTarget } =  require('../constants/symbols');
const {isBasicData} = require('../utils/introspection');
const { mutateValuesDeep} = require( '../utils/transmutation');

const {cloneDeep} = require('lodash');

const paObjectHandlers = {};

const addToParentsMap = function (child, parent, key) {
    const parentsMap = child[parents];
    const parentProxy = parent[proxyFromTarget];
    const paths = child[parents].get(parentProxy) || [];
    if (!paths.includes(key)) {
        paths.push(key);
        parentsMap.set(parentProxy,paths);
    }
}

const traverseAddParents  = function (obj, parents = [obj]) {

    const entries = Object.entries(obj);
    entries.forEach( ([key, val]) => {
        if (!isBasicData(val)) {
            //Add to the parents property of the child value
            addToParentsMap(val, obj, key);

            if (!parents.includes(val)) {//To avoid infinate recursion with circular object references
                //Go into the nested object
                traverseAddParents(val, [...parents, val]);
            }
        }
    });
}

const newPaoFromObj = function (obj) {
        const objCopy = cloneDeep(obj);
        mutateValuesDeep(
            objCopy,
            {arrayCallback: paoProxySetup, objCallback: paoProxySetup}
        );
        traverseAddParents(objCopy);
        return objCopy[proxyFromTarget];
}

const refreshPaoParents = function (paoProxy) {
    traverseAddParents(paoProxy[targetFromProxy]);
    return paoProxy;
}


const paoProxySetup =  function (obj) {
    if (obj[isProxy]) {  //But if it is a proxy, will it be copied properly in mapValuesDeep?
        obj = obj[targetFromProxy];
    }

    //This sets up the proxy and the parents map, but it doesn't populate the parents map with anything.
    const paoProxy =  new Proxy(obj, paObjectHandlers);
    obj[proxyFromTarget] = paoProxy;
    obj[parents] = new Map();
    return obj;
};


//Used in deleteProperty and set
const parentRemovalFromDescendents = function (parent, child, ancestors = []) {
    //If the value of the deleted property has no parents, it is effectively out of the tree. Therefore, it's children (the grandchildren of the original target) should have the deleted property value removed from their parent's array. This propogates down.

    const parentsMap = child[parents];
    parentProxy = parent[proxyFromTarget];

    let paths = parentsMap.get(parentProxy);

    //Remove the path
    paths = paths.filter(path => path !== property);
    if (paths.length > 0) {
        parentsMap.set(parentProxy, paths);
    } else {
        parentsMap.delete(parent[proxyFromTarget]);

        if (parentsMap.size === 0 && !ancestors.includes(parent)) {

            Object.values( child ).forEach(grandchild => {
                if (!isBasicData(grandchild)) {
                    parentRemovalFromDescendents(child, grandchild, [...ancestors, parent]);
                }
            });
        }

    }


    console.log(parent, child, child[parents]);


}

module.exports = {
    paObjectHandlers,
    addToParentsMap,
    traverseAddParents,
    newPaoFromObj,
    refreshPaoParents,
    paoProxySetup,
    parentRemovalFromDescendents
}