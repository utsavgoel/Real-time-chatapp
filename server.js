var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(3000).sockets;

console.log('working');

mongo.connect('mongodb://127.0.0.1/chat', function(err, database) {
	const myAwesomeDB = database.db('chat');
  
	if(err) throw err;

	client.on('connection', function(socket) {

		var col = myAwesomeDB.collection('messages'),
		sendStatus = function(s) {
			socket.emit('status', s);
		};

		// emit all messages
		col.find().limit(100).sort({_id: 1}).toArray(function(err, res) {
			if(err) throw err;
			socket.emit('output', res);
		});

		// wait for input
		socket.on('input', function(data) {
			var name = data.name,
			message = data.message,
			whitespacePattern = /^\s*$/;

			if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
				sendStatus('Name and message is required');
			} else {
				col.insert({name : name, message : message}, function() {
					// emit latest message to ALL clients
					client.emit('output', [data]);

					sendStatus({
						message : 'Message sent',
						clear : true
					});
				});
			}
		});
	});
});