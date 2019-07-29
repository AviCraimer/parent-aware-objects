const {    addToParentsMap,
    traverseAddParents,
    newPaoFromObj,
    refreshPaoParents,
    paoProxySetup} = require('./paoUtils');
const  { targetFromProxy, isProxy, parents, proxyFromTarget } =  require('../constants/symbols');

const pao = function (obj) {
    return newPaoFromObj(obj)
}

//These are temporary for dev purposes
pao.isProxy = isProxy;
pao.targetFromProxy = targetFromProxy;
pao.proxyFromTarget = proxyFromTarget;


pao.getParents = function (objProxy) {
    let parentsMap = objProxy[parents];

    // return new Proxy(parentsMap, readOnlyHandlers);
    return parentsMap;
}

module.exports = {
    pao
}