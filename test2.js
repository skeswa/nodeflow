var mongo = require('mongodb');
var db = new mongo.Db('turbodev', new mongo.Server('kahana.mongohq.com', 10039, {}), {});

function example(callback) {
	db.open(function(err, client) {
		db.authenticate('test', 'pass', function(err, result) {
			client.collection("docs", function(err, col) {
				var doc = {
					woo: 'yeahh'
				};
				col.insert(doc, function() {
					callback(null, doc);
				});
			});
		});
	});
}

example(function(err, doc) {
	console.log('the doc is', doc);
});