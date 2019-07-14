const  {objectsToProxies} = require( '../../lookupMaps');
const  { targetFromProxy, isProxy, parents } = require( '../../constants/symbols');
const {isRegularObject,getBuiltInClass,isLiteral,isBasicData} = require('../../utils/introspection');

const handlers = {};


// handlers.getPrototypeOf = function () {

// }
    // A trap for Object.getPrototypeOf.
handlers.setPrototypeOf = function () {
    console.warn('Not allowed to set prototype of object');
}
    // A trap for Object.setPrototypeOf.
// handlers.isExtensible = function () {

// }
    // A trap for Object.isExtensible.
// handlers.preventExtensions = function () {

// }
    // A trap for Object.preventExtensions.
handlers.getOwnPropertyDescriptor = function (target, prop) {
    // let exampleDescriptor = {
    //     "value": {
    //         "bar": "baz"
    //     },
    //     "writable": true,
    //     "enumerable": true,
    //     "configurable": true
    //   }
    const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

    if (typeof descriptor.value === 'object') {
        //Ensures that the proxy is returned rather than the actual object.
        //For future I should add checks and things in case the object isn't in the map
        descriptor.value = objectsToProxies.get(descriptor.value);
    }

    return descriptor;
}

handlers.defineProperty = function (target, property, descriptor) {
    // I have to make sure that it works if you pass a descriptor with an object value. But for now I'm leaving it blank to disble
}

// handlers.has = function (target, prop) {
// A trap for the in operator.
// }

handlers.get = function (target, property, proxy) {
    if (property === targetFromProxy) {
        return target;
    }
    if (property === isProxy) {
        return true;
    }
    const defaultGet = Reflect.get(target, property);

    if (isBasicData(defaultGet) || property === parents) {
       return defaultGet;
    } else {
        return objectsToProxies.get(defaultGet);
    }
}

handlers.set = function (target, property, value, proxy) {
    let valueLiteral, valueProxy, valueTarget;
    if (isBasicData(value)) {
        valueLiteral = value;
        valueTarget = value;
    } else if (value[isProxy] === true) {
        valueProxy = value;
        valueTarget = value[targetFromProxy];
        // console.log('proxy value', valueProxy, valueTarget )
    } else  { //Not a proxy
        //The value is an object but it is not wrapped in a proxy so make a proxy for the value

        valueTarget = value;
        //We have to check for nested objects.
        //For now I'm just simplifying assuming the value has no nested objects.
        valueProxy =  new Proxy(valueTarget, handlers);
        objectsToProxies.set(valueTarget, valueProxy);
        //We know that if target is wrapped in proxy then it already has the parents property added to it, but it is not wrapped we must add the parent's proxy. Still I'll check for good measure
        if (valueTarget[parents] === undefined) {
            //A map from parent proxy objects to an array of property names or symbols
            valueTarget[parents] = new Map();
        }
    }

    //Now we need to check if there is an existing value at that key, and if it is an object with a parents property

    if (!isBasicData(target[property])) { //Check if there is an existing value at that property key which is a trackable object.
        const existingTrackableObject = target[property];
        if (existingTrackableObject === valueTarget ) {
            //In this case, the value is being set to the same, we know it's an object since we tested it with isBasicData.
            //No need to set anything.
            return (valueProxy);
        } else { //Book keeping on the old value to keep it's parents array up to date
            let paths = existingTrackableObject[parents].get(proxy);
            //Remove the path
            paths = paths.filter(path => path !== property);
            if (paths.length > 0) {
                existingTrackableObject[parents].set(proxy, paths);
            } else {
                //Delete the proxy parent as there are no more paths
                existingTrackableObject[parents].delete(proxy);
            }

        }

    }

    if (!valueLiteral) {
        // Add the parent proxy  and the property name to the parents symbol property of the value
        const paths = valueTarget[parents].get(proxy) || []; //Make new array if proxy doesn't exist
        if (!paths.includes(property)) {
            //If the paths do not already include the property add it
            paths.push(property);
            valueTarget[parents].set(proxy,paths);
        }
    }

    //Set the value, this works for both objects and literals.
    Reflect.set( target, property, valueTarget);
    console.log('target[property]',  target[property])
    console.log('Reflect.get', Reflect.get( target, property));
    return valueProxy || valueLiteral; //Retrun proxy or literal
}


handlers.deleteProperty = function () {
    // A trap for the delete operator.

}
handlers.ownKeys = function () {
    // A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.

}
handlers.apply = function () {
    // A trap for a function call.

}


handlers.construct = function () {
    // A trap for the new operator.

}

module.exports = {
    handlers
}