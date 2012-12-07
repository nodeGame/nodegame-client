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
	


})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
  , 'undefined' != typeof io ? io : module.parent.exports.io
);