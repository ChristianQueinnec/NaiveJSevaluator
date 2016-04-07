/* let, while loop and incrementation

{"type":"Program",
 "body":[
    {"type":"VariableDeclaration",
     "declarations":[{
        "type":"VariableDeclarator",
        "id":{"type":"Identifier","name":"a"},
        "init":{"type":"Literal","value":85,"raw":"85"}}],
     "kind":"let"},
    {"type":"WhileStatement",
     "test":{
        "type":"BinaryExpression",
        "operator":"<",
        "left":{"type":"Identifier","name":"a"},
        "right":{"type":"Literal","value":90,"raw":"90"}},
     "body":{
        "type":"BlockStatement",
        "body":[{
           "type":"ExpressionStatement",
           "expression":{
               "type":"UpdateExpression",
               "operator":"++",
               "argument":{
                  "type":"Identifier","name":"a"},
               "prefix":false}}]}},
    {"type":"ExpressionStatement",
     "expression":{
       "type":"Identifier","name":"a"}}],
 "sourceType":"script"}

*/
let a = 85;
while ( a < 90 ) {
    a++;
}
a
