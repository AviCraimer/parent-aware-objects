const  { targetFromProxy, isProxy, parents, proxyFromTarget } =  require('../constants/symbols');
const {isRegularObject,getBuiltInClass,isLiteral,isBasicData} = require('../utils/introspection');
const {mapValuesDeep} = require( '../utils/transmutation');
const {paoSetup, traverseAddParents} = require('./helperFunctions');


const pao = function (obj={}) {
    //This doesn't set up the parents.
    let mappedObj = mapValuesDeep(obj, {arrayCallback: paoSetup, objCallback: paoSetup});
    traverseAddParents(mappedObj);

    return mappedObj[proxyFromTarget];
}
pao.isProxy = isProxy;
pao.targetFromProxy = targetFromProxy;
pao.parents = parents;
pao.proxyFromTarget = proxyFromTarget;
module.exports = {
    pao,
    paoSetup
}