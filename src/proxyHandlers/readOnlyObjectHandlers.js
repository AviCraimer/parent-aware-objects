const handlers = {};

const readOnlyWarning = function () {
    console.warn("Object is read only, cannot perform operation.\nTo get a writable copy, use Object.assign.");
}

// handlers.getPrototypeOf = function () {

// }
    // A trap for Object.getPrototypeOf.
handlers.setPrototypeOf = function () {
    readOnlyWarning();
}



handlers.defineProperty = function (target, property, descriptor) {
    readOnlyWarning();
}


handlers.set = function (target, property, value, proxy) {
    readOnlyWarning();
}


handlers.deleteProperty = function () {
    readOnlyWarning();

}

handlers.apply = function () {
    // A trap for a function call.
    //Not sure what to put here

}


handlers.construct = function () {

}

module.exports = {
    readOnlyHandlers: handlers
}