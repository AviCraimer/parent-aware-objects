// const  {objectsToProxies} =  require('../lookupMaps');
const  { targetFromProxy, isProxy, parents, proxyFromTarget } =  require('../constants/symbols');
const {isRegularObject,getBuiltInClass,isLiteral,isBasicData} = require('../utils/introspection');
const {handlers} = require('../proxyHandlers/paObject');


const pao = function () {
    const newPaoInstance = {[parents]: new Map() }
    const paoProxy =  new Proxy(newPaoInstance, handlers);
    newPaoInstance[proxyFromTarget] = paoProxy;
    return paoProxy;
}
pao.isProxy = isProxy;
pao.targetFromProxy = targetFromProxy;
pao.parents = parents;
pao.proxyFromTarget = proxyFromTarget;
module.exports = {
    pao
}