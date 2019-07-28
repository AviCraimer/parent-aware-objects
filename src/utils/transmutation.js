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

mutateValuesDeep = (value, cbs={}, parents=[]) => {

    if (parents.length === 0) {
        //This implies that it is the outer most function call, each recursively nested function call will have at least one element in the parents array.
        origToMapped = new Map();
    }

    if (!isBasicData(value)) {
        if (parents.includes(value)) {
            //Value has alreadry been mapped so return the already mapped object. This prevents endless loop from circular object references
            return parents[value];
        }
        let callback;
        if (Array.isArray(value) && cbs.arrayCallback) {
            callback = cbs.arrayCallback;
        } else if (cbs.objCallback)  {
            callback = cbs.objCallback;
        }

        const newParents = [...parents, value];
        if (callback) {
            //Mutate array or object with callback
            callback(value, [...parents]);
        }

        //Mutate values
        Object.entries(value).forEach(([key, innerValue]) =>{
            //Call mutate values on each
            value[key] = mutateValuesDeep(innerValue, cbs, newParents);
        });

        return value;
    }  else {
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

const symbolEntries = function (obj) {
    const symArr = Object.getOwnPropertySymbols(obj);

    return symArr.map(sym => [sym, obj[sym]])
}

const flattenObject = function (obj, symbolValuesKey='__symbolValues__') {
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
            symbolEntries(value).forEach(([, val]) => firstPass(val))
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


            Object.entries(current)
            .forEach(
                ([key, value]) => {
                    if (Array.isArray(value) || _.isObject(value)) {

                        const nestedId = origToId.get(value);
                        currentFlat[key] = {objectRef: nestedId };
                        secondPass(value);
                    } else {
                        currentFlat[key] = value;
                    }

            });
            currentFlat[symbolValuesKey] = [];
            symbolEntries(current)
            .forEach( ([sym, value]) => {
                if (Array.isArray(value) || _.isObject(value)) {

                    const nestedId = origToId.get(value);
                    currentFlat[symbolValuesKey].push ( {
                        objectRef: nestedId,
                        symbolDescription: sym.description
                    });
                    secondPass(value);
                } else {
                    currentFlat[symbolValuesKey].push({
                        symbolDescription: sym.description,
                        value
                    });
                }
            });
        } else {
            return value;
        }
    }

    secondPass(obj);

    return containerObj;
}


const unflattenObject = function (
    obj,
    descriptionToSymbol={},
    symbolValuesKey='__symbolValues__'
) {
    if (typeof obj === 'string') {
        obj = JSON.parse(obj);
    }
    const {lookupTable, entryPointId} = obj;
    const entryPoint = lookupTable[entryPointId];
    const initObj = (obj) => Array.isArray(obj) ? []:  {};

    const deepObj = initObj(entryPoint);

    const inProcess = new Map();
    const assignToUnflat = function (lookupObj, unflatObj) {
        if (inProcess.has(lookupObj)) {
            //This shouldn't actually be necessary since we never call the function on objects that are already in the inProcess Map.
            console.warn("Already has object. Shouldn't fire.")
            return;
        }
        inProcess.set(lookupObj, unflatObj);

        const refObjectAssign = function (key, objId) {

            const refLookupObj = lookupTable[objId];

            if (inProcess.get(refLookupObj)) {
                //If the object has already been processed or is in process, get it from the map.

                unflatObj[key] = inProcess.get(refLookupObj);
            } else {
                //If the object doesn't exist yet, call first pass on it.

                const refUnflatObj = initObj(refLookupObj);
                unflatObj[key] = refUnflatObj;
                assignToUnflat(refLookupObj, refUnflatObj );
            }
        }

        Object
        .entries(lookupObj)
        .forEach(([key, value]) => {
            if (key === symbolValuesKey) {
                const symbolValuesDescription = lookupObj[symbolValuesKey];
                symbolValuesDescription.forEach(({symbolDescription, value, objectRef  }) => {
                    //Checks for symbol description in the descriptionToSymbol argument, if it isn't there creates a new symbol.
                   //Add each newly created symbol to the descriptionToSymbol object. It is a fair assumption that we'll want only as many symbols as there are unique descriptions.
                    let sym;

                    if (descriptionToSymbol[symbolDescription]) {
                        sym = descriptionToSymbol[symbolDescription];
                    } else {
                       sym =  Symbol(symbolDescription);
                       descriptionToSymbol[symbolDescription] = sym;
                    }

                    if (objectRef) {
                        refObjectAssign(sym, objectRef);
                    } else if (value) {
                        unflatObj[sym] = value;
                    }
                });

            } else if (_.isObject(value) && value.objectRef) {
                refObjectAssign(key, value.objectRef);

            } else {
                //When it is a literal
                unflatObj[key] = value;
            }
        });
    }
    assignToUnflat(entryPoint, deepObj);
    return deepObj;
}



module.exports = {
    mapValuesDeep,
    origToMappedStatus,
    flattenObject,
    unflattenObject,
    mutateValuesDeep
}