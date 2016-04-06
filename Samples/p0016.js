/* creation of a global variable without previous declaration

{"type":"Program",
 "body":[
  {"type":"BlockStatement",
   "body":[
     {"type":"ExpressionStatement",
      "expression":{
          "type":"AssignmentExpression",
          "operator":"=",
          "left":{
              "type":"Identifier",
              "name":"a"},
          "right":{
              "type":"Literal",
              "value":2,
              "raw":"2"}}},
     {"type":"ExpressionStatement",
      "expression":{
          "type":"Identifier",
          "name":"a"}}]}],
 "sourceType":"script"}

*/
{
    a = 2;
    a;
}
