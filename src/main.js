const {pao} = require('./pao');
const {flattenObject} = require('./utils/transmutation');
// window.pao = pao;
// console.log(pao);
window.flat = flattenObject;
window.pao = pao;

window.obj1Proxy = pao();

window.obj1 = obj1Proxy[pao.targetFromProxy];

window.obj2 = {
    hello: 'world'
}

obj1Proxy.cat = "furry";
obj1Proxy.nested = obj2;

// console.log('Nested is set to object:',  obj1)

// console.log('getting nested, should get proxy', obj1Proxy.nested );

window.obj2Proxy = obj1Proxy.nested;

window.tree = pao();

tree.people = [];

const Person = function (name) {
    return {
        name
    }
}

let people = [Person('Leo Tolstoy'), Person('Ted Chiang'), Person('Avi Craimer'), Person('Kate McGee')]

for (const person of people) {
    tree.people[tree.people.length] = person;
}

//Ted Chiang twice
tree.people[tree.people.length] = people[1];

// console.log(tree.people);

// console.log(tree.people[pao.targetFromProxy]);

//Over
const tolstoy = tree.people[0];

tree.people[0] = Person('Leo Trotsky');

// console.log(tree.people[pao.targetFromProxy]);
// console.log('Check parents',  tolstoy[pao.targetFromProxy]);



window.fido = {}

window.alan = {
    name: 'alan',
    pets: [fido]
}

Object.assign(  fido, {
    name: 'fido',
    owners: [alan] //Set up a circular relationship
} )


