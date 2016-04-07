/* dot notation with computation for global

{"type":"Program",
 "body":[
   {"type":"VariableDeclaration",
    "declarations":[
       {"type":"VariableDeclarator",
        "id":{"type":"Identifier",
              "name":"a"},
        "init":{"type":"Literal",
                "value":8,
                "raw":"8"}}],
    "kind":"var"},
   {"type":"ExpressionStatement",
    "expression":{
        "type":"MemberExpression",
        "computed":true,
        "object":{"type":"Identifier",
                  "name":"global"},
        "property":{
            "type":"Literal",
            "value":"a",
            "raw":"'a'"}}}],
 "sourceType":"script"}

*/
var ab = 8;
global['a' + 'b'];
