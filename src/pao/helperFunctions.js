const  { targetFromProxy, isProxy, parents, proxyFromTarget } =  require('../constants/symbols');
const {isBasicData} = require('../utils/introspection');


const {handlers} = require('../proxyHandlers/paObjectHandlers');

const paoSetup = function (obj) {
    if (obj[isProxy]) {  //But if it is a proxy, will it be copied properly in mapValuesDeep?
        obj = obj[targetFromProxy];
    }

    //This sets up the proxy and the parents map, but it doesn't populate the parents map with anything.
    const paoProxy =  new Proxy(obj, handlers);
    obj[proxyFromTarget] = paoProxy;
    obj[parents] = new Map();
    return obj;
}

const traverseAddParents  = function (obj, parents) {
    if (!parents) {
        parents = [obj];
    }
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


const addToParentsMap = function (child, parent, key) {
    const parentsMap = child[parents];
    const parentProxy = parent[proxyFromTarget];
    const paths = child[parents].get(parentProxy) || [];
    if (!paths.includes(key)) {
        paths.push(key);
        parentsMap.set(parentProxy,paths);
    }
}

module.exports = {
    paoSetup,
    traverseAddParents,
    addToParentsMap
}