/* anonymous function creation then invocation

{"type":"Program",
 "body":[
   {"type":"VariableDeclaration",
    "declarations":[
        {"type":"VariableDeclarator",
         "id":{"type":"Identifier","name":"bar"},
         "init":{
           "type":"FunctionExpression",
           "id":null,
           "params":[
              {"type":"Identifier","name":"y"}],
           "defaults":[],
           "body":{
             "type":"BlockStatement",
             "body":[{
               "type":"ReturnStatement",
               "argument":{
                 "type":"BinaryExpression",
                 "operator":"+",
                 "left":{"type":"Identifier","name":"y"},
                 "right":{"type":"Literal","value":1,"raw":"1"}}}]},
           "generator":false,
           "expression":false}}],
    "kind":"var"},
   {"type":"ExpressionStatement",
    "expression":{
       "type":"CallExpression",
       "callee":{"type":"Identifier","name":"bar"},
       "arguments":[{"type":"Literal","value":11,"raw":"11"}]}}],
 "sourceType":"script"}

*/

var bar = function (y) { 
    return y+1;
};
bar(11);
