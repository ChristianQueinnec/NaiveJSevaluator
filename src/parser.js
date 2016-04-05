// 

import * as fs from 'fs';
import * as esprima from 'esprima';         // BSD licence

function string2ast (string) {
    let ast = esprima.parse(string);
    return ast;
}

function file2ast (filename) {
    return '';////////////////////
}

export let parse = string2ast;
