/* dot notation for global

{"type":"Program",
 "body":[
   {"type":"VariableDeclaration",
    "declarations":[
       {"type":"VariableDeclarator",
        "id":{"type":"Identifier",
              "name":"a"},
        "init":{"type":"Literal",
                "value":7,
                "raw":"7"}}],
    "kind":"var"},
   {"type":"ExpressionStatement",
    "expression":{
      "type":"MemberExpression",
      "computed":false,
      "object":{
         "type":"Identifier",
         "name":"global"},
      "property":{
           "type":"Identifier",
           "name":"a"}}}],
 "sourceType":"script"}

*/
var a = 7;
global.a;

