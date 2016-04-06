/* use of var with an explicit initialization

{"type":"Program",
 "body":[
    {"type":"VariableDeclaration",
     "declarations":[
        {"type":"VariableDeclarator",
         "id":{"type":"Identifier",
               "name":"a"},
         "init":{
            "type":"BinaryExpression",
            "operator":"+",
            "left":{
               "type":"Literal",
               "value":1,
               "raw":"1"},
            "right":{
               "type":"Literal",
               "value":3,
               "raw":"3"}}}],
     "kind":"var"},
    {"type":"ExpressionStatement",
     "expression":{"type":"Identifier",
                   "name":"a"}}],
 "sourceType":"script"}
*/
var a = 1+3;
a
