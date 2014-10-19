var flow = require('./index.js');

var test = flow.require('test.js');
test.myThread(function(err, doc) {
    console.log('the doc is', doc);
});