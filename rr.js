var node  = require('./index.js');


//var io = require('socket.io-client');
//var socket = io.connect('http://localhost:8080/ultimatum/');
//console.log(socket)

var opt = {
	socket: {
		type: 'SocketIo'
	},
	verbosity: 100
};

node.verbosity = 100;

//node.setup(opt);

node.socket.open(opt);

console.log(node.verbosity)


node.connect('http://localhost:8080/ultimatum');
