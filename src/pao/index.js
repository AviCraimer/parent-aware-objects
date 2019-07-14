const  {objectsToProxies} =  require('../lookupMaps');
const  { targetFromProxy, isProxy, parents } =  require('../constants/symbols');
const {isRegularObject,getBuiltInClass,isLiteral,isBasicData} = require('../utils/introspection');
const {handlers} = require('../proxyHandlers/paObject');


const pao = function () {
    const newPaoInstance = {[parents]: new Map() }
    const paoProxy =  new Proxy(newPaoInstance, handlers);
    objectsToProxies.set(newPaoInstance, paoProxy);
    return paoProxy;
}
pao.isProxy = isProxy;
pao.targetFromProxy = targetFromProxy;
pao.parents = parents;
module.exports = {
    pao
}