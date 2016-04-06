//

let parser = require('./parser.js');

let verbose = 0;

function evaluate (string) {
    let ast = parser.parse(string);
    if ( verbose > 5 ) {
        console.log(JSON.stringify(ast));
    }
    _output = '';
    let initial = mkInitial();
    var result = {
        value: process(ast, initial.r, initial.r, initial.k, initial.c),
        out: _output
    };
    return result;
}

// {{{ Preparation of the initial state of the interpreter

function mkInitial () {
    function k0 (value) {
        return value;
    }
    var r0 = mkInitialEnv();
    var c0 = {
        catcher: function (exc) {
            console.log("Uncaught exception " + exc);
            throw new Error(exc);
        },
        finalizer: null,
        next: null
    };
    return {
        r: r0,
        k: k0,
        c: c0
    };
}

var _output = '';            // stream instead ??
function mkInitialEnv () {
    let r0 = new GlobalEnvironment(null);
    r0.adjoinVarVariable('console', {
        log: function (arg) {
            let s = arg.toString();
            _output += s;
        }
    });
    r0.adjoinVarVariable('global', r0);
    return r0;
}

//     {{{ Environment
// Implemented as a linked list of hashtables.

class Environment {
    constructor (next) {
        this.next = next;
        this.variables = {};
    }
    lookup (variableName) {
        if ( this.variables.hasOwnProperty(variableName) ) {
            return this.variables[variableName];
        } else if ( this.next ) {
            return this.next.lookup(variableName);
        } else {
            throw new Error("No such variable " + variableName);
        }
    }
    update (variableName, value) {
        if ( this.variables.hasOwnProperty(variableName) ) {
            return ( this.variables[variableName] = value );
        } else if ( this.next ) {
            return this.next.update(variableName, value);
        } else {
            this.adjoinVarVariable(variableName, value);
            return value;
        }
    }
}
class GlobalEnvironment extends Environment {
    adjoinVarVariable (variableName, value) {
        this.variables[variableName] = value;
    }
    adjoinLetVariable (variableName, value) {
        this.variables[variableName] = value;
    }
}
class FunctionCallEnvironment extends Environment {
    adjoinVarVariable (variableName, value) {
        this.variables[variableName] = value;
    }
    adjoinLetVariable (variableName, value) {
        this.variables[variableName] = value;
    }
}
class BlockEnvironment extends Environment {
    adjoinVarVariable (variableName, value) {
        this.adjoinVarVariable(variableName, value);
    }
    adjoinLetVariable (variableName, value) {
        this.variables[variableName] = value;
    }
}

//     }}}
// }}}
// {{{ Predefined operators
// NOTA: they are implemented lazily with the usual Javascript operators
// therefore they take care of coercions and other weird cases.

let _unaryOperator = {};
function getUnaryOperator (unaryOperatorName) {
    var f = _unaryOperator[unaryOperatorName];
    if ( f ) {
        return f;
    }
    // Create unary operators on the fly:
    f = new Function("argument", 
                     `return ${unaryOperatorName} argument;`);
    _unaryOperator[unaryOperatorName] = f;
    return f;
}

let _binaryOperator = {};
function getBinaryOperator (binaryOperatorName) {
    var f = _binaryOperator[binaryOperatorName];
    if ( f ) {
        return f;
    }
    // Create binary operators on the fly:
    f = new Function("left, right", 
                     `return left ${binaryOperatorName} right;`);
    _binaryOperator[binaryOperatorName] = f;
    return f;
}

// }}}
// {{{ Evaluation methods
// NOTA: the AST just use plain objects without inheritance (see 
// http://lisperator.net/blog/uglifyjs-why-not-switching-to-spidermonkey-ast/)
// 

let dispatcher = {};

function process (ast, self, r, k, c) {
    let method = dispatcher['process' + ast.type];
    if ( typeof method === 'function' ) {
        if ( verbose > 20 ) {
            function ktrace (value) {
                console.log("<== " + value);
                return k(value);
            }
            console.log("==> " + JSON.stringify(ast));
            return method(ast, self, r, ktrace, c);
        } else {
            return method(ast, self, r, k, c);
        }
    } else {
        // So we may see what is missing!
        throw new Error("Cannot process " + ast.type);
    }
}

function processProgram (ast, self, r, k, c) {
    return processSequenceExpression(ast.body, self, r, k, c);
}
dispatcher.processProgram = processProgram;

function processBlockStatement (ast, self, r, k, c) {
    return processSequenceExpression(ast.body, self, r, k, c);
}
dispatcher.processProgram = 
    dispatcher.processBlockStatement = processProgram;

function processSequenceExpression (asts, self, r, k, c) {
    let n = asts.length;
    if ( n === 0 ) {
        return k(null);
    } else if ( n === 1 ) {
        return process(asts[0], self, r, k, c);
    } else {
        function knext (ignore) {
            return processSequenceExpression(asts.splice(1), self, r, k, c);
        }
        return process(asts[0], self, r, knext, c);
    }
}
dispatcher.processSequenceExpression = processSequenceExpression;

function processExpressionStatement (ast, self, r, k, c) {
    return process(ast.expression, self, r, k, c);
}
dispatcher.processExpressionStatement = processExpressionStatement;

function processLiteral (ast, self, r, k, c) {
    return k(ast.value);
}
dispatcher.processLiteral = processLiteral;

function processUnaryExpression (ast, self, r, k, c) {
    function kapply (argument) {
        let op = getUnaryOperator(ast.operator);
        return k(op(argument));
    }
    return process(ast.argument, self, r, kapply, c);
}
dispatcher.processUnaryExpression = processUnaryExpression;

function processBinaryExpression (ast, self, r, k, c) {
    function kright (left) {
        function kapply (right) {
            let op = getBinaryOperator(ast.operator);
            return k(op(left, right));
        }
        return process(ast.right, self, r, kapply, c);
    }
    return process(ast.left, self, r, kright, c);
}
dispatcher.processBinaryExpression = processBinaryExpression;

function processIdentifier (ast, self, r, k, c) {
    return k(r.lookup(ast.name));
}
dispatcher.processIdentifier = processIdentifier;

function processAssignmentExpression (ast, self, r, k, c) {
    function kassign (value) {
        return k(r.update(ast.left.name, value));
    }
    return process(ast.right, self, r, kassign, c);
}
dispatcher.processAssignmentExpression = processAssignmentExpression;

exports.evaluate = evaluate;
