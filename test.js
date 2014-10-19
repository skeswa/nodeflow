var mongo = require('mongodb');
var db = new mongo.Db('turbodev', new mongo.Server('kahana.mongohq.com', 10039, {}), {});

thread myThread() {
    var openRes = db.open(_);
    var authRes = db.authenticate('test', 'pass', _);
    var colRes = openRes[1].collection("docs", _);
    var doc = {
        woo: 'yeahh'
    };
    var finalRes = colRes[1].insert(doc, _);

    return finalRes, colRes;
}

module.exports.myThread = myThread;
module.exports.thing = 'thing';