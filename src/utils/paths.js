const _ = require('lodash');

exports.parsePath = function (pathStr) {
    const multiLevel =   pathStr.split('.')
    // ["a","b[1223][34]","c[234234]","hello dolly"]
        .map(str =>  {

            let arrayIndexes = str.match(/\[\d+\]/g);

            if (arrayIndexes === null) {
                return {
                    type: 'object',
                    key: str
                }
            } else  {
                const steps = arrayIndexes.map(s => {
                    return {
                        type: 'array',
                        key: Number(s.match(/\d+/)[0])
                    }
                });
                let stem = str.split('[')[0];
                if (stem !== "") {
                    steps.unshift({
                            type: 'object',
                            key: stem
                        });
                }
                return steps;
            }
        })
        return _.flatten(multiLevel);
}

// let testPath = "a.b[1223][34].c[234234].hello dolly";

// const target = [
//     {type: 'object', key: 'a'},
//     {type: 'object', key: 'b'},
//     {type: 'array', key: 1223},
//     {type: 'array', key: 34},
//     {type: 'object', key: 'c'},
//     {type: 'array', key: 234234},
//     {type: 'object', key: 'hello dolly'}
// ]