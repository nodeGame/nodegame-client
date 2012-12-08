var node  = require('./index.js');

var opt = {
	socket: {
		type: 'SocketIo'
	}
};



//node.setup(opt);

node.socket.open(opt);

node.connect('http://localhost:8080/ultimatum/');
