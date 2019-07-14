const { entityIdSym, proxyObjSym, entitySym, entityParents} = require('../constants/symbols-old');
const _ = require('lodash');
const uuid = require('uuid/v1');//Check this
const {proxyInitializer} = require('./proxy');

const entityInitializer = function (obj) {
    if (Object.prototype.toString.call(unknown) !== "[object Object]") {
        console.error(obj, `was passed to entityInitializer, but it is not a plain object.\n It is ${Object.prototype.toString.call(unknown)}
        `)
    } else if (obj[proxyObjSym] === true) {
        console.error(obj, "was passed to entityInitializer but it is a PAO proxy, it's entity already exists in the PAO tree");
    } else if (obj[entitySym] === true) {
        console.error(obj, "was passed to entityInitializer but it is a PAO entity already. No new entity was created.");
    } else {
        const entity = {...obj};
        entity[entitySym] = true;
        entity[entityIdSym] = uuid();
        entity[proxyObjSym] = proxyInitializer(entity);
        entity[entityParents] = null; //The newly created object doesn't have a place in the tree yet so it has no parents  ---But
    }
}