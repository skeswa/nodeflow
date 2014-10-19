var fs = require('fs'),
    escodegen = require('escodegen'),
    data = require('./tom.json');

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

console.log(functionize(data));
// var js = escodegen.generate(data);
// console.log(js);