const {paoStamp} = require('./paoStamp');
const {paObjectHandlers} = require('../proxyHandlers/paObjectHandlers');
const  { targetFromProxy, isProxy, parents, proxyFromTarget } =  require('../constants/symbols');

const pao = paoStamp(paObjectHandlers);

//These are temporary for dev purposes
pao.isProxy = isProxy;
pao.targetFromProxy = targetFromProxy;
pao.parentsSym = parents;
pao.proxyFromTarget = proxyFromTarget;


pao.parents = function (objProxy) {
    let parentsMap = objProxy[parents];

    return new Proxy(parentsMap, readOnlyHandlers);
}

module.exports = {
    pao
}