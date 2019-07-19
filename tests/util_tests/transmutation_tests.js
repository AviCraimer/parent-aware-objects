const  {mapValuesDeep} = require(  '../../src/utils/transmutation');


const testProto = {
    bark () {
        console.log('woof woof');
    }
 }


const fido = Object.create(testProto);

Object.assign(  fido, {
    name: 'fido',
    owners: ['fred', 'alan']
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