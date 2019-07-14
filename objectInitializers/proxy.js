const {proxyProto}  = require('../prototypes/proxy');
const {proxiesToEntitiesMap} = require('../src/lookupMaps');
const {proxyObjSym, entityIdSym} = require('../src/constants/symbols-old');



const proxyHandlers = {

get() {

}
 //     A trap for getting property values.
// handler.set()
//     A trap for setting property values.


// handler.getPrototypeOf()
//     A trap for Object.getPrototypeOf.
// handler.setPrototypeOf()
//     A trap for Object.setPrototypeOf.
// handler.isExtensible()
//     A trap for Object.isExtensible.
// handler.preventExtensions()
//     A trap for Object.preventExtensions.
// handler.getOwnPropertyDescriptor()
//     A trap for Object.getOwnPropertyDescriptor.
// handler.defineProperty()
//     A trap for Object.defineProperty.
// handler.has()
//     A trap for the in operator.

// handler.deleteProperty()
//     A trap for the delete operator.
// handler.ownKeys()
//     A trap for Object.getOwnPropertyNames and Object.getOwnPropertySymbols.
// handler.apply()
//     A trap for a function call.
// handler.construct()
//     A trap for the new operator.
}

const proxyInitializer = function () {

}

const proxyInitializerOld  = function (entity) {
    if (typeof entity[proxyObjSym] !== 'object' ) {
        const newProxy = Object.create(proxyProto);
        newProxy[entityIdSym] = entity[entityIdSym]; //Inclue the UUID string on the proxy, this could be useful for getting JSON
        Object.freeze(newProxy);//Make the proxy immutable

        proxiesToEntitiesMap.set(newProxy, entity);
        entity[proxyObjSym] = newProxy;
        return newProxy
    } else {
        console.error('ProxyInitializer was called on an object that already has proxy object property. The existing proxyObjSym value will be returned\n', entity, entity[proxyObjSym] );

        return entity[proxyObjSym];
    }
}

