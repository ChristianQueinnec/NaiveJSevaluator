/* assignment with dot notation

{"type":"Program",
 "body":[
   {"type":"ExpressionStatement",
    "expression":{
       "type":"AssignmentExpression",
       "operator":"=",
       "left":{
          "type":"MemberExpression",
          "computed":false,
          "object":{
             "type":"Identifier",
             "name":"global"},
          "property":{
             "type":"Identifier",
                    "name":"a"}},
       "right":{
          "type":"Literal",
          "value":9,
          "raw":"9"}}},
   {"type":"ExpressionStatement",
    "expression":{
       "type":"Identifier",
       "name":"a"}}],
 "sourceType":"script"}

*/
global.a = 9;
a
