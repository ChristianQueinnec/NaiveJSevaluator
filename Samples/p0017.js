/* Use of var before using the declared variable

  {"type":"Program",
   "body":[
     {"type":"VariableDeclaration",
      "declarations":[{
          "type":"VariableDeclarator",
          "id":{"type":"Identifier","name":"a"},
          "init":null}],
      "kind":"var"},
     {"type":"ExpressionStatement",
      "expression":{
         "type":"AssignmentExpression",
         "operator":"=",
         "left":{
            "type":"Identifier",
            "name":"a"},
         "right":{
            "type":"Literal",
            "value":3,
            "raw":"3"}}},
     {"type":"ExpressionStatement",
      "expression":{
        "type":"Identifier",
        "name":"a"}}],
   "sourceType":"script"}
*/
var a;
a = 3;
a
