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

var buffer,
	session;



function Socket() {
	
	this.url = null;
}


Socket.prototype.connect = function(url) {
	
	if (!url) {
		node.log('cannot connect to empty url.', 'ERR');
		return false;
	}
	
	this.url = url;
	node.log('connecting to ' + url);
	
    this.attachFirstListeners(this.io);
    return this.io;
};

Socket.prototype.disconnect = function() {
	
};


Socket.prototype.registerServer = function() {
	// Setting global info
	that.servername = msg.from;
	// Keep serverid = msg.from for now
	that.serverid = msg.from;
};


Socket.prototype.secureParse = secureParse = function (msg) {
	
	var gameMsg;
	try {
		gameMsg = GameMsg.clone(JSON.parse(msg));
		node.info(gameMsg, 'R: ');
	}
	catch(e) {
		return logSecureParseError('Malformed msg received',  e);
	}
	
	if (this.session && gameMsg.session !== this.session) {
		return logSecureParseError('Local session id does not match incoming message session id');
	}
	
	return gameMsg;
};











})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
  , 'undefined' != typeof io ? io : module.parent.exports.io
);