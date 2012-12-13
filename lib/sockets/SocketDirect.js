/**
 * # SocketDirect
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Implementation of a direct socket communicating directly through
 * a shared event-emitter object
 * 
 * ---
 * 
 */

(function (exports, node) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	GameState = node.GameState,
	Player = node.Player,
	GameMsgGenerator = node.GameMsgGenerator;

function SocketDirect(options) {
	options = options || {};
	
	this.socket = options.socket;
	this.connected = false;
}

SocketDirect.prototype.connect = function(socket, options) {
	
	if (socket) {
		this.socket = socket;
	}
	
	if (!this.socket) {
		node.err('cannot connect: empty socket');
		return false;
	}
	
	this.connected = true;
	this.socket.connect(this);
	node.info('socket.direct connection open'); 
	
};

SocketDirect.prototype.message = function(msg) {
	if (!this.connected || !this.socket) return;
	node.socket.onMessage(msg);
};

SocketDirect.prototype.disconnect = function(msg) {
	this.connected = false;
	node.socket.onDisconnect(msg);
};


SocketDirect.prototype.send = function(msg) {
	if (!this.connected || !this.socket) return;
	var gameMsg;
	try {
		gameMsg = JSON.stringify(msg);
	}
	catch(e) {
		node.err('An error has occurred. Cannot send message: ' + msg);
		return false;
	}
	this.socket.message(gameMsg);
};


node.SocketFactory.register('SocketDirect', SocketDirect);


})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);