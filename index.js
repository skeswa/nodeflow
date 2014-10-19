var fs = require('fs'),
    escodegen = require('escodegen'),
    esprima = require('esprima'),
    flow = require('./flow.js');

var SEQ_REGEX = /thread(?:(?:\s+([$_\w\d]*)\s*)|(?:\s*))\(/i;
var THREAD_PREFIX = '$__thread__$_';

var functionize = function(text) {
    var i = 1;
    var functionName;

    while (match = text.match(SEQ_REGEX)) {
        functionName = match[1];
        if (!functionName || functionName.length === 0) {
            functionName = THREAD_PREFIX + (i++);
        } else {
            functionName = THREAD_PREFIX + functionName;
        }
        text = text.replace(match[0], 'function ' + functionName + '(');
    }

    return text;
};

var data = fs.readFileSync('test.js', {
    encoding: 'utf8'
});

exports.require = function(path) {
    var data = fs.readFileSync(path, {
        encoding: 'utf8'
    });
    var data = functionize(data);
    var tree = esprima.parse(data);
    flow.recurseTree(tree);
    var output = escodegen.generate(tree);
    output = output.replace(/\$\_\_thread\_\_\$\_(\d+)?/ig, '');
    console.log(output);
};