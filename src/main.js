//

let parser = require('./parser.js');

function evaluate (string) {
    let ast = parser.parse(string);
    var result = {
        value: JSON.stringify(ast),
        out: ""
    };
    return result;
}

exports.evaluate = evaluate;
