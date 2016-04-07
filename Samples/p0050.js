/* function definition then invocation

{"type":"Program",
 "body":[
   {"type":"FunctionDeclaration",
    "id":{"type":"Identifier",
          "name":"foo"},
    "params":[
       {"type":"Identifier","name":"x"}],
    "defaults":[],
    "body":
      {"type":"BlockStatement",
       "body":[
         {"type":"ReturnStatement",
          "argument":
              {"type":"BinaryExpression",
               "operator":"+",
               "left":{"type":"Identifier","name":"x"},
               "right":{"type":"Literal","value":1,"raw":"1"}}}]},
       "generator":false,
       "expression":false},
   {"type":"ExpressionStatement",
    "expression":
       {"type":"CallExpression",
        "callee":
          {"type":"Identifier","name":"foo"},
          "arguments":[
              {"type":"Literal","value":10,"raw":"10"}]}}],
 "sourceType":"script"}

*/

function foo (x) {
    return (x+1);
}
foo(10);
