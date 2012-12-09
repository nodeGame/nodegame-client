/**
 * # GameSocketClient
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` component rensponsible for dispatching events and messages 
 * 
 * ---
 * 
 */

(function (exports, node, io) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	GameState = node.GameState,
	Player = node.Player,
	GameMsgGenerator = node.GameMsgGenerator;

exports.SocketIo = SocketIo;



function SocketIo(options) {
	this.socket = null;
}

SocketIo.prototype.connect = function(url, options) {
	var that = this;
	
	this.socket = io.connect(url, options); //conf.io
	
	this.socket.on('connect', function (msg) {
			
	    node.info('socket.io connection open'); 
	    
	    that.socket.on('message', function(msg) {
	    	node.socket.onMessage(msg);
	    });
	    
	});
	
    this.socket.on('disconnect', node.socket.onDisconnect);
	
};

SocketIo.prototype.send = function (msg) {
	this.socket.send(msg.stringify());
};


node.SocketFactory.register('SocketIo', SocketIo);


})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
  , 'undefined' != typeof io ? io : module.parent.exports.io
);