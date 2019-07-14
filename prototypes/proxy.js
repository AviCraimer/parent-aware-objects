const {proxiesToEntitiesMap} = require('../src/lookupMaps';
const {isProxy, isEntity} = require('../utils/introspection');
const {getEntity, transmuteToEntity, transmuteToProxy} = require('../utils/transmutation');
const {proxyObjSym, entitySym} = require('../src/constants/symbols-old');


const proxySpecialProto =  {
    [proxyObjSym]: true,//Indicates that it is a proxy object
    replace () {

    }
}



const proxyObjectInterface = {

    assign (...objs) {
        //For each object, check if it is a proxy, if so get the original.

        //Each object passed in will be assigned in order to the tree object
        return Object.assign(getEntity(this), ...objs);
    },

    getOwnPropertyDescriptor () {

    },
    getOwnPropertyDescriptors () {

    },
    getOwnPropertyNames () {

    },
    getOwnPropertySymbols () {

    },
    keys () {
        //Gets the keys
    },
    entries () {
        //Gets the entries, but value are proxies for entities or copies for non-entity collections
    },
    values () {

    },

    //Object methods
    __defineGetter__ (){

    },
    __defineSetter__ (){

    },
    hasOwnProperty (){

    },
    __lookupGetter__ (){

    },
    __lookupSetter__ (){

    },
    isPrototypeOf (){

    },
    propertyIsEnumerable (){

    },
    toString (){

    },
    valueOf (){

    },
    toLocaleString (){

    }
}

exports.proxyProto = {...proxyObjectInterface,  ...proxySpecialProto};