const _ = require('lodash');

//These functions should never be exposed outside the PAO module.
exports.mapValuesDeep = (obj, callback) => {
    if (Array.isArray(obj)) {
      return obj.map(innerObj => mapValuesDeep(innerObj, callback));
    } else if (_.isObject(obj)) {
      return _.mapValues(obj, val => mapValuesDeep(val, callback));
    } else {
      return callback(obj);
    }
  };



exports.getEntity = function (proxyObj) {
    return proxiesToEntitiesMap.get(proxyObj);
}

exports.transmuteToEntity = function (unknown) {
    if (Array.isArray(unknown)) {
        return unknown.map(item => {
            //Get the original tree item and replace the proxy with it
            if (isProxy(value)) {
                return getEntity(item);
            } else {
                return item;
            }
        });
    } else if (Object.prototype.toString.call(unknown) === "[object Object]" ||Object.prototype.toString.call(unknown) === "[object Map]") {//This determines that it is a regular object or a Map, not an array or function or set etc
        newObj = {};
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                const value = object[key];
                if (isProxy(value)) {
                    newObj[key] = getEntity(value);
                } else {
                    newObj[key] = value;
                }
            }
        }
    }

    else {
        return item;
    }


}

exports.transmuteToProxy = function (unknown) {
    return unknown.map(item => {
        //Get the original tree item and replace the proxy with it
        if (isEntity(value)) {
            return  item[proxyObjSym]; //Every tree entity carries its proxy on this symbol keyed property
        } else {
            return item;
        }
    });
}