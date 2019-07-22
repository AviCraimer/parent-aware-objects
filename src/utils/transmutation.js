const _ = require('lodash');
const {isBasicData} = require('./introspection')
const uuid = require('uuid/v1');





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



const flattenObject = function (obj) {
    let containerObj = {
        entryPointId: "",
        lookupTable: {}
    };
    let origToId = new Map();

    const firstPass = function (value) {
        if (Array.isArray(value) || _.isObject(value)) {
            if (origToId.get(value)) {
                //Value has already been processed so terminate. This avoids circular reference loops.
                return;
            }
            flatObj =  Array.isArray(value) ? [] : {};

            const id = uuid();
            origToId.set(value, id);
            containerObj.lookupTable[id] = flatObj;
            Object.values(value).forEach(val => firstPass(val) );
        }
    }


    firstPass(obj);

    //Set the entry point id based on the top level value that was passed in.
    containerObj.entryPointId = origToId.get(obj);

    const secondPass = function (current) {
        if (Array.isArray(current) || _.isObject(current)) {
            const currentId  = origToId.get(current);

            const currentFlat = containerObj.lookupTable[currentId];

            if (Object.keys(currentFlat).length !== 0) {
                //If this is the first time the object has been encountered in the second path it should be an empty object or array.
                return;
            }

            Object.entries(current).forEach(
                ([key, value]) => {
                    if (Array.isArray(value) || _.isObject(value)) {

                        const nestedId = origToId.get(value);
                        currentFlat[key] = {objectRef: nestedId };
                        secondPass(value);
                    } else {
                        currentFlat[key] = value;
                    }

                });
        } else {
            return value;
        }
    }

    secondPass(obj);

    return containerObj;
}


const unflattenObject = function (obj) {
    if (typeof obj === 'string') {
        obj = JSON.parse(obj);
    }
    const deepObj = {};
    const {lookupTable, entryPointId} = obj;
    const entryPoint = lookupTable[entryPointId];
    const newLookup = {...lookupTable};
    const finished = new Set();
    const firstPass = function (obj) {
        if (finished.has(obj)) {
            return;
        }
//I need to think about this!
    Object
        .entries(obj)
        .forEach(([key, value]) => {
            if (_.isObject(value)) {

                firstPass(lookupTable[value.objectRef])
            } else {
                newLookup[key]
            }
        });
    finished.add(obj);
}

    firstPass(entryPoint);

}



module.exports = {
    mapValuesDeep,
    origToMappedStatus,
    flattenObject
}