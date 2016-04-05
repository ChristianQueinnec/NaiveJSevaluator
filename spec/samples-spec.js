// Evaluate all files in Samples/p*.js
// Check their value wrt Samples/p.result (a string or a regexp)
// and their printed output wrt Samples/p.out

// CAUTION: This file is written in es5 not in es6!

var fs = require('fs');
var evaluator = require('../dist/main.js');

var samplesDir = './Samples';

describe("Naive ECMAscript evaluator:", function () {

    it("process all samples", function (done) {
        fs.accessSync(samplesDir);
        fs.readdir(samplesDir, function (err, files) {
            expect(err).toBeNull();
            expect(files.length).toBeGreaterThan(2);
            var samples = files.filter(function (file) {
                return /[.]js$/.exec(file);
            });
            expect(samples.length).toBeGreaterThan(0);

// QNC exercise! samples.forEach and readfile
// QNC exercise! makeProcess and process to pass file

            function makeProcess(file) {
                function process (err, content) {
                    expect(err).toBeNull();
                    readExpectations(file, function (expected, out) {
                        console.log("Expected: " + expected); // DEBUG
                        console.log("Out: " + out); // DEBUG
                        try {
                            var result = evaluator.evaluate(content);
                            var resultValue = result.value.toString();
                            console.log("Result is " + result); // DEBUG
                            expect(result.out).toBe(out);
                            if ( expected instanceof RegExp ) {
                                expect(resultValue).toMatch(expected);
                            } else {
                                expect(resultValue).toBe(expected);
                            }
                            next();
                        } catch (exc) {
                            fail(exc);
                        }
                    });
                }
                return process;
            }
            function next () {
                if ( samples.length > 0 ) {
                    console.log("Considering " + samples[0]); // DEBUG
                    var sample = samplesDir + '/' + samples[0];
                    samples = samples.splice(1);
                    var process = makeProcess(sample);
                    fs.readFile(sample, process);
                } else {
                    done();
                }
            }
            function readExpectations (file, cb) {
                file = file.replace(/[.]js$/, '.result');
                fs.readFile(file, function (err, expected) {
                    expect(err).toBeNull();
                    expected = expected.toString().trim();
                    // expected may be a regexp or a string:
                    if ( /^\/(.*)\/$/.exec(expected) ) {
                        expected = expected.replace(/^\/(.*)\/$/, "$1");
                        expected = new RegExp(expected);
                    }
                    file = file.replace(/[.]result$/, '.out');
                    fs.readFile(file, function (err, out) {
                        expect(err).toBeNull();
                        out = out.toString().trim();
                        // return pair expected, output
                        cb(expected, out);
                    });
                });
            }
            next();
        });
    }, 50);

});
