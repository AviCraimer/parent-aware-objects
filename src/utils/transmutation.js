const _ = require('lodash');
const {isBasicData} = require('./introspection')
//These functions should never be exposed outside the PAO module.




// mapValuesDeep = (value, callback) => {
//     if (Array.isArray(value)) {
//       return value.map(innerValue => mapValuesDeep(innerValue, callback));
//     } else if (_.isObject(value)) {
//       return   _.mapValues(value, val => mapValuesDeep(val, callback));
//     } else {
//       return callback(value);
//     }
// };



//Should copy object and properties with prototype. Transforming values with the callback
mapValuesDeep = (value, cbs={}) => {
    if (Array.isArray(value)) {
        const mappedArray = value.map(innerValue => mapValuesDeep(innerValue, cbs));
        if (cbs.arrayCallback) {
            return cbs.arrayCallback(mappedArray);
        } else {
            return mappedArray;
        }
    } else if (_.isObject(value)) {
        const proto = Object.getPrototypeOf( value );
        const mappedObj = Object.create(proto );

        //Copy mapped properties to copied object
        Object.assign(mappedObj,  _.mapValues(value, val => mapValuesDeep(val, cbs)) )
        if (cbs.objCallback) {
            return cbs.objCallback(mappedObj);
        } else {
            return mappedObj;
        }
    } else {
        if (cbs.litCallback) {
            return cbs.litCallback(value);
        } else {
            return value
        }
    }
};





module.exports = {
    mapValuesDeep
}