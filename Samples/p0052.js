/* alternative and missing argument

{"type":"IfStatement",
 "test":{"type":"Identifier","name":"x"},
 "consequent":{
    "type":"BlockStatement",
    "body":[{
       "type":"ReturnStatement",
       "argument":{
          "type":"BinaryExpression",
          "operator":"+",
          "left":{"type":"Literal","value":13,"raw":"13"},
          "right":{"type":"Identifier","name":"x"}}}]},
 "alternate":{
    "type":"BlockStatement",
    "body":[{
      "type":"ReturnStatement",
      "argument":{"type":"Literal","value":13,"raw":"13"}}]}}

*/

function foo (x) {
    if ( x ) {
        return (13+x);
    } else {
        return 13;
    }
}
foo();
