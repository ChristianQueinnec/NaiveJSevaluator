/* use of a previously declared but uninitialized variable

 {"type":"Program",
  "body":[
     {"type":"VariableDeclaration",
      "declarations":[
         {"type":"VariableDeclarator",
          "id":{"type":"Identifier",
                "name":"a"},
          "init":null}],
      "kind":"var"},
     {"type":"ExpressionStatement",
      "expression":{
           "type":"Identifier",
           "name":"a"}}],
  "sourceType":"script"}
*/
var a;
a;
