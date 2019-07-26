// const {proxyObjSym, entitySym} = require('../constants/symbols-old');
const _ = require( 'lodash');


function isRegularObject (value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}

function getBuiltInClass (value) {

    //Works for Object, String, Number, Null, Array, Function, Undefined, BigInt, Map, WeakMap, Set, Date, Math
    // Does not work for Proxy because the proxy gives the value for it's target. If you could somehow force it to be called on the proxy itself it might give the right value.

    let type = Object.prototype.toString.call(value);
    return type.split(' ')[1].split(']')[0];
}

function isLiteral (value) {
    const literalTypes =  ['string', 'number', 'bigint', 'boolean',  'undefined', 'symbol'];
    if (literalTypes.includes(typeof value) || value === null) {
        return true;
    } else {
        return false;
    }
}

function isBasicData (value) {
   //Very similar to isLiteral, but allows the Date type and RegExp.

    const types =  ['String', 'Number', 'BigInt', 'Boolean',  'Undefined', 'Symbol', 'Date', 'Null', 'RegExp'];
   if (types.includes(getBuiltInClass(value)) ) {
       return true;
   } else {
       return false;
   }
}

// isProxy = function (value) {
//     if (value[proxyObjSym] === true) {
//         return true;
//     } else {
//         return false;
//     }
// }

// isEntity = function (value) {
//     if (value[entitySym] === true) {
//         return true;
//     } else {
//         return false;
//     }
// }


module.exports = {
    isRegularObject,
    getBuiltInClass,
    isLiteral,
    isBasicData
}