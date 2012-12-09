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

(function (exports, node) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	GameState = node.GameState,
	Player = node.Player,
	GameMsgGenerator = node.GameMsgGenerator;

function SocketDirect(options) {
	options = options || {};
	
	this.socket = options.socket;
}

SocketDirect.prototype.connect = function(url, options) {
	
	// already connected
		
	node.info('socket.direct connection open'); 
	    
    this.socket.on('message', function(msg) {
    	node.socket.onMessage(msg);
    });

    this.socket.on('disconnect', node.socket.onDisconnect);
	
};

SocketDirect.prototype.send = function (msg) {
	this.socket.emit('message', msg);
};


node.SocketFactory.register('SocketDirect', SocketDirect);


})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);