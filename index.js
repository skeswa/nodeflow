var fs = require('fs'),
    escodegen = require('escodegen'),
    esprima = require('esprima'),
    flow = require('./flow.js');

var SEQ_REGEX = /thread(?:(?:\s+([$_\w\d]*)\s*)|(?:\s*))\(/;
var RETURN_REGEX = /return\s([$_\w\d\s\,]*);/;
var THREAD_PREFIX = '$__thrd__$_';
var CALLBACK_PREFIX = '$__cb__$';

var functionize = function(text) {
    var i = 1,
        startIndex, endIndex, result, match, newMatch;
    var functionName, functionProto, functionBlock;

    while (match = text.match(SEQ_REGEX)) {
        functionName = match[1];
        startIndex = match.index;
        result = readTillEndOfParams(text, startIndex);
        endIndex = result.endIndex;
        functionProto = text.substring(startIndex, endIndex);
        text = text.replace(functionProto, functionProto + (result.commaCount > 0 ? ', ' : '') + '$__cb__$');
        startIndex = endIndex;
        endIndex = readTillEndOfBlock(text, startIndex);
        functionBlock = text.substring(startIndex, endIndex);
        if (newMatch = functionBlock.match(RETURN_REGEX)) {
            text = text.replace(functionBlock, functionBlock.replace(newMatch[0], '$__cb__$(null, ' + newMatch[1] + ');'));
        } else {
            text = text.replace(functionBlock, functionBlock + '$__cb__$();');
        }

        if (!functionName || functionName.length === 0) {
            functionName = THREAD_PREFIX + (i++);
        } else {
            functionName = THREAD_PREFIX + functionName;
        }
        text = text.replace(match[0], 'function ' + functionName + '(');
    }

    return text;
};

var readTillEndOfParams = function(text, startIndex) {
    var balance = 0,
        commaCount = 0;
    for (var i = startIndex; i < text.length; i++) {
        if (text[i] === '(') balance++;
        else if (text[i] === ',') commaCount++;
        else if (text[i] === ')') {
            balance--;
            if (balance <= 0) {
                return {
                    endIndex: i,
                    commaCount: commaCount
                };
            }
        }
    }
    return {
        endIndex: -1,
        commaCount: commaCount
    };
}

var readTillEndOfBlock = function(text, startIndex) {
    var balance = 0;
    for (var i = startIndex; i < text.length; i++) {
        if (text[i] === '{') balance++;
        else if (text[i] === '}') {
            balance--;
            if (balance <= 0) {
                return i;
            }
        }
    }
    return -1;
}

function requireFromString(src, filename) {
    var Module = module.constructor;
    var m = new Module();
    m._compile(src, filename);
    return m.exports;
}

exports.require = function(path) {
    var data = fs.readFileSync(path, {
        encoding: 'utf8'
    });
    var data = functionize(data);
    var tree = esprima.parse(data);
    flow.recurseTree(tree);
    var output = escodegen.generate(tree);
    output = output.replace(/\$\_\_thrd\_\_\$\_(\d+)?/ig, '');
    console.log(output);
    // fs.mkdirSync('.flow');
    fs.writeFileSync('./.flow/test.js', output);
    return require('./.flow/test.js');
};