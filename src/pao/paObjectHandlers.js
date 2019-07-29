const  { targetFromProxy, isProxy, parents, proxyFromTarget } = require( '../constants/symbols');
const {isRegularObject,getBuiltInClass,isLiteral,isBasicData} = require('../utils/introspection');
const {
    paObjectHandlers,
    addToParentsMap,
    traverseAddParents,
    makeNewPao,
    refreshPaoParents,
    paoProxySetup,
    parentRemovalFromDescendents
} = require('./paoUtils');



paObjectHandlers.setPrototypeOf = function () {
    console.warn('Not allowed to set prototype of object');
}
    // A trap for Object.setPrototypeOf.
// paObjectHandlers.isExtensible = function () {

// }
    // A trap for Object.isExtensible.
// paObjectHandlers.preventExtensions = function () {

// }
    // A trap for Object.preventExtensions.
paObjectHandlers.getOwnPropertyDescriptor = function (target, prop) {
    // let exampleDescriptor = {
    //     "value": {
    //         "bar": "baz"
    //     },
    //     "writable": true,
    //     "enumerable": true,
    //     "configurable": true
    //   }
    const descriptor = Reflect.getOwnPropertyDescriptor(target, prop);

    if (!isBasicData(descriptor.value) ) {
        //Ensures that the proxy is returned rather than the actual object.
        //For future I should add checks and things in case the object isn't in the map
        descriptor.value = descriptor.value[proxyFromTarget];
    }

    return descriptor;
}

paObjectHandlers.defineProperty = function (target, property, descriptor) {
    // I have to make sure that it works if you pass a descriptor with an object value. But for now I'm leaving it blank to disble
}

// paObjectHandlers.has = function (target, prop) {
// A trap for the in operator.
// }

paObjectHandlers.get = function (target, property, proxy) {
    if (property === targetFromProxy) {
        return target;
    }
    if (property === isProxy) {
        return true;
    }
    if (property === parents) {
        return Reflect.get(target, parents);
    }

    const defaultGet = Reflect.get(target, property);

    //Trapping methods
    if (typeof defaultGet === "function") {
        return function (...args) {
            //original method with the proxy as the value of "this";
            return defaultGet.apply(proxy, args);
        }
    }

    if (isBasicData(defaultGet) || property === parents) {
       return defaultGet;
    } else {
        return defaultGet[proxyFromTarget];
    }


}

paObjectHandlers.set = function (target, property, value, proxy) {
    let valueLiteral, valueProxy, valueTarget;
    if (isBasicData(value)) {
        valueLiteral = value;
        valueTarget = value;
    } else if (value[isProxy] === true) {
        valueProxy = value;

        //Call paoFactory to update the parent's arrays of any objects who's refs might have been previously deleted due to the delete operator.
        valueTarget = paoFactory( value[targetFromProxy]) ;
        // console.log('proxy value', valueProxy, valueTarget )
    } else if (value[proxyFromTarget]) {
        //Not a proxy, but already has a proxy. In general this shouldn't happen since the targets are not exposed, but just in case.
        valueTarget = paoFactory(value);
        valueProxy = value[proxyFromTarget];
    } else  { //Not a proxy and doesn't have a proxy already
        //The value is an object but it is not wrapped in a proxy so make a proxy for the value
        valueTarget = paoFactory(value);
        valueProxy  = valueTarget[proxyFromTarget];
    }

    //Now we need to check if there is an existing value at that key, and if it is an object with a parents property

    if (!isBasicData(target[property])) { //Check if there is an existing value at that property key which is a trackable object.
        const existingTrackableObject = target[property];

        if (existingTrackableObject === valueTarget ) {
            //In this case, the value is being set to the same, we know it's an object since we tested it with isBasicData.
            //No need to set anything.
            return (valueProxy);
        } else { //Book keeping on the old value to keep it's parents array up to date

        parentRemovalFromDescendents(target, existingTrackableObject);



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





paObjectHandlers.deleteProperty = function (target, property) {
    const child = Reflect.get(target, property);
    if (!isBasicData(child)) {
        parentRemovalFromDescendents(target, child);
    }

    Reflect.deleteProperty(target, property);
    return true;
}
// paObjectHandlers.ownKeys = function (target) {


    // A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.

// }
// paObjectHandlers.apply = function () {



    // A trap for a function call.

// }


// paObjectHandlers.construct = function () {
    // A trap for the new operator.

// }





module.exports = {
      paObjectHandlers: handlers
}