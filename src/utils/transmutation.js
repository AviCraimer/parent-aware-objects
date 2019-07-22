const _ = require('lodash');
const {isBasicData} = require('./introspection')






//Should copy object and properties with prototype. Transforming values with the callback
let origToMapped = undefined;
mapValuesDeep = (value, cbs={}, parents=[]) => {

    if (parents.length === 0) {
        //This implies that it is the outer most function call, each recursively nested function call will have at least one element in the parents array.
        origToMapped = new Map();
    }

    if (Array.isArray(value)) {
        if (parents.includes(value)) {
            //Value has alreadry been mapped so return the already mapped object. This prevents endless loop from circular object references
            return origToMapped.get(value);
        }

        const newParents = [...parents, value];
        let mappedArray = [];
        origToMapped.set(value, mappedArray);//Create the object referecne between arrays
        console.log(value)
        value.forEach((innerValue, i) =>{
            mappedArray[i] =  mapValuesDeep(innerValue, cbs, newParents);
        });

        if (cbs.arrayCallback) {
            mappedArray =  cbs.arrayCallback(mappedArray, [...parents]);
        }
        if (parents.length === 0) {origToMapped = undefined;}
        return mappedArray;
    } else if (_.isObject(value)) {
        if (parents.includes(value)) {
            //Value has alreadry been mapped so just return it without futher mapping. This prevents endless loop from circular object references
            return  origToMapped.get(value);
        }

        const newParents = [...parents, value];
        const proto = Object.getPrototypeOf( value );
        let mappedObj = Object.create(proto );
        origToMapped.set(value, mappedObj);
        //Copy mapped properties to copied object
        Object.assign(mappedObj,  _.mapValues(value, val => mapValuesDeep(val, cbs, newParents)) )
        if (cbs.objCallback) {
            mappedObj =  cbs.objCallback(mappedObj, [...parents]);
        }
        if (parents.length === 0) {origToMapped = undefined;}
        return mappedObj;
    } else {
        if (cbs.litCallback) {
            return cbs.litCallback(value, [...parents]);
        } else {
            return value
        }
    }
};


const origToMappedStatus = function () {
    //For testing
    console.log('origToMapped: ',origToMapped);
    return '';
}





const callbacksForMakePao = {
    arrayCallback(arr) {

    },
    objCallback (obj) {
        if ( isBasicData(obj)) {
            //For dates and regexs
            return obj;
        }


    },
    litCallback (value) {

    }
}






const flattenObject = function (value) {
    let flatArray = [];
    let origToFlattened = new Map();
    //I should map to the UUID. And make the flat array a flat object. This is better for exporting.
    const firstPass = function (value) {
        if (Array.isArray(value) || _.isObject(value)) {
            flatObj =  Array.isArray(value) ? [] : {};
            origToFlattened.set(value, flatObj);
            Object.values(value).forEach(val => firstPass(val) );
        }
    }

    firstPass(value);

    const secondPass = function (value) {
        if (Array.isArray(value)) {
            const flatArr = origToFlattened.get(value);
            value.forEach( (val, i) => {
                [i] = secondPass(val);
            } );

        } else if (_.isObject(value)) {

        } else {
            return value;
        }
    }
}


module.exports = {
    mapValuesDeep,
    origToMappedStatus
}