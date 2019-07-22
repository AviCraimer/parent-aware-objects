const  {mapValuesDeep, origToMappedStatus} = require(  '../../src/utils/transmutation');


const testProto = {
    bark () {
        console.log('woof woof');
    }
 }


let fido = Object.create(testProto);

const alan = {
    name: 'alan',
    pets: [fido]
}

Object.assign(  fido, {
    name: 'fido',
    owners: [alan] //Set up a circular relationship
} )


const callbacks = {
    // litCallback (value) {
    //     return value
    // },
    arrayCallback (arr) {
        arr.push('george');
        return arr;
    },
    objCallback (obj) {
        obj.collar = 'diamond';
        return obj;
    }
}



const fidoCopy =   mapValuesDeep(fido, callbacks);

console.log('Fido:\n',  fido);
console.log('Copy:\n',  fidoCopy);
fidoCopy.bark();

console.log(origToMappedStatus())