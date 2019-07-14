const {proxyObjSym, entityIdSym} = require('../constants/symbols-old');

exports.pao = function (path, obj) { //Second argument is optional. If only first argument is provided it gets the proxy for that path, if second argument is provided it sets the value of the tree with that object
    if (obj[proxyObjSym] === true) {
        //Get the entity and add it to the path given
    } else if (obj.toString === "[object Object]"  ){
        if (obj.__proto__ !== Object.prototype) {
            console.warn('You have passed an object with a set proto, be warned that inside the pao tree, prototype methods and properties will not be preserved.', obj );
        }

        //Create entity from object and add it to the tree.


    } else if (obj !== undefined) {
        console.error('When the second argument is provided it must be a plain object. You passed:', obj);
    } else { //Second argument is undefined so it will get a proxy object in the tree.

    }

}