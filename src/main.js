//

let parser = require('./parser.js');

let verbose = 446;

function evaluate (string) {
    let ast = parser.parse(string);
    if ( verbose > 5 ) {
        console.log(JSON.stringify(ast));
    }
    let stdout = new StdOut();
    let initial = mkInitial(stdout);
    var result = {
        value: process(ast, initial.r, initial.r, initial.k, initial.c),
    };
    result.output = stdout.toString();
    return result;
}

exports.evaluate = evaluate;

// {{{ Preparation of the initial state of the interpreter

function mkInitial (stdout) {
    function k0 (value) {
        return value;
    }
    var r0 = mkInitialEnv(stdout);
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

function mkInitialEnv (stdout) {
    let r0 = new GlobalEnvironment();
    r0.adjoinVarVariable('console', {
        log: function (args, self, k, c) {
            for ( let arg of args ) {
                stdout.append(arg.toString());
            }
            return k(null);
        }
    });
    r0.adjoinVarVariable('global', r0.variables);
    return r0;
}

// }}}
// {{{ stdout

class StdOut {
    constructor () {
        this.output = '';
    }
    toString () {
        return this.output;
    }
    append (s) {
        this.output += s;
    }
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
    constructor () {
        super(null);
    }
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
    let rblock = new BlockEnvironment(r);
    return processSequenceExpression(ast.body, self, rblock, k, c);
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

function processExpressions (asts, self, r, k, c) {
    let n = asts.length;
    if ( n === 0 ) {
        return k([]);
    } else {
        function knext (arg) {
            function kgather (args) {
                args.unshift(arg);
                return k(args);
            }
            return processExpressions(asts.splice(1), self, r, kgather, c);
        }
        return process(asts[0], self, r, knext, c);
    }
}

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
    function knext (place) {
        function kassign (value) {
            return k(place(value));
        }
        return process(ast.right, self, r, kassign, c);
    }
    return computePlace(ast.left, self, r, knext, c);
}
dispatcher.processAssignmentExpression = processAssignmentExpression;

function processVariableDeclaration (ast, self, r, k, c) {
    function processDeclarations (kind, asts) {
        function processVariableDeclarator (ast, self, r, k, c) {
            function kdeclare (value) {
                if ( kind === 'let' ) {
                    r.adjoinLetVariable(ast.id.name, value);
                } else {
                    r.adjoinVarVariable(ast.id.name, value);
                }
                return k(value);
            }
            if ( ast.init ) {
                return process(ast.init, self, r, kdeclare, c);
            } else {
                return kdeclare(undefined);
            }
        }
        let n = asts.length;
        if ( n === 0 ) {
            return k(null);
        } else {
            function knext () {
                return processDeclarations(kind, asts.splice(1));
            }
            return processVariableDeclarator(asts[0], self, r, knext, c);
        }
    }
    return processDeclarations(ast.kind, ast.declarations);
}
dispatcher.processVariableDeclaration = processVariableDeclaration;

function processMemberExpression (ast, self, r, k, c) {
    function kmember (object) {
        function kfetch (key) {
            return k(object[key]);
        }
        if ( ast.computed ) {
            return process(ast.property, self, r, kfetch, c);
        } else {
            return kfetch(ast.property.name);
        }
    }
    return process(ast.object, self, r, kmember, c);
}
dispatcher.processMemberExpression = processMemberExpression;

function computePlace (ast, self, r, k, c) {
    if ( ast.type === 'Identifier' ) {
        function write (value) {
            return r.update(ast.name, value);
        }
        return k(write);
    } else if ( ast.type === 'MemberExpression' ) {
        function knext (object) {
            function kwrite (key) {
                function write (value) {
                    return (object[key] = value);
                }
                return k(write);
            }
            if ( ast.computed ) {
                return process(ast.property, self, r, kwrite, c);
            } else {
                return kwrite(ast.property.name);
            }
        }
        return process(ast.object, self, r, knext, c);
    } else {
        throw new Error("Cannot computePlace " + ast);
    }
}

function processFunctionDeclaration (ast, self, r, k, c) {
    function f (args, self, k, c) {
        let newr = new FunctionCallEnvironment(r);
        newr.adjoinLetVariable(ast.id.name, f);
        let n = args.length
        for ( let i=0 ; i<ast.params.length ; i++ ) {
            let varName = ast.params[i].name;
            let value = undefined;
            if ( i < n ) {
                value = args[i];
            }
            newr.adjoinVarVariable(varName, value);
        }
        console.log(newr);//DEBUG
        return process(ast.body, undefined, newr, k, c);
    }
    r.adjoinVarVariable(ast.id.name, f);
    return k(f);
}
dispatcher.processFunctionDeclaration = processFunctionDeclaration;

function processFunctionExpression (ast, self, r, k, c) {
    function f (args, self, k, c) {
        let newr = new FunctionCallEnvironment(r);
        let n = args.length
        for ( let i=0 ; i<ast.params.length ; i++ ) {
            let varName = ast.params[i].name;
            let value = undefined;
            if ( i < n ) {
                value = args[i];
            }
            newr.adjoinVarVariable(varName, value);
        }
        return process(ast.body, undefined, newr, k, c);
    }
    return k(f);
}
dispatcher.processFunctionExpression = processFunctionExpression;

function processReturnStatement (ast, self, r, k, c) {
    return process(ast.argument, self, r, k, c);
}
dispatcher.processReturnStatement = processReturnStatement;

function processCallExpression (ast, self, r, k, c) {
    function karguments (f) {
        let n = ast.arguments.length;
        if ( n === 0 ) {
            return f([], undefined, k, c);
        } else {
            function kapply (args) {
                return f(args, undefined, k, c);
            }
            return processExpressions(ast.arguments, self, r, kapply, c);
        }
    }
    return process(ast.callee, self, r, karguments, c);
}
dispatcher.processCallExpression = processCallExpression;

function processIfStatement (ast, self, r, k, c) {
    function kchoice (value) {
        if ( value ) {
            return process(ast.consequent, self, r, k, c);
        } else {
            return process(ast.alternate, self, r, k, c);
        }
    }
    return process(ast.test, self, r, kchoice, c);
}
dispatcher.processIfStatement = processIfStatement;

function processWhileStatement (ast, self, r, k, c) {
    function kwhile (ignore) {
        return process(ast.test, self, r, kbody, c);
    }
    function kbody (value) {
        if ( value ) {
            return process(ast.body, self, r, kwhile, c);
        } else {
            return k(null);
        }
    }
    return process(ast.test, self, r, kbody, c);
}
dispatcher.processWhileStatement = processWhileStatement;

function processUpdateExpression (ast, self, r, k, c) {
    let variableName = ast.argument.name;
    let variableValue = r.lookup(variableName);
    return k(r.update(variableName, variableValue+1));
}
dispatcher.processUpdateExpression = processUpdateExpression;

// }}}
// end of main.js
