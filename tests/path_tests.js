const _ = require('lodash');
const {parsePath} = require('../utils/paths');


let testPath = "a.b[1223][34].c[234234].hello dolly";

const target = [
    {type: 'object', key: 'a'},
    {type: 'object', key: 'b'},
    {type: 'array', key: 1223},
    {type: 'array', key: 34},
    {type: 'object', key: 'c'},
    {type: 'array', key: 234234},
    {type: 'object', key: 'hello dolly'}
]

let test = parsePath(testPath);

const result =    _.isEqual (test, target  );

console.log(result, 'Test:', test, '\nTarget', target);