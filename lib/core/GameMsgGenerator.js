/**
 * # GameMsgGenerator
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` component rensponsible creating messages 
 * 
 * Static factory of objects of type `GameMsg`.
 * 
 * All message are reliable, but TXT messages.
 * 
 * 	@see GameMSg
 * 	@see node.target
 * 	@see node.action
 * 
 * ---
 *
 */
(function (exports, node) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	GameStage = node.GameStage,
	Player = node.Player,
	JSUS = node.JSUS;

var target = node.target,
	action = node.action;

exports.GameMsgGenerator = GameMsgGenerator; 

/**
 * ## GameMsgGenerator constructor
 * 
 * Creates an instance of GameMSgGenerator
 * 
 */
function GameMsgGenerator () {}

// ## General methods

/**
 * ### GameMsgGenerator.create 
 * 
 * Primitive for creating any type of game-message
 * 
 * Merges a set of default settings with the object passed
 * as input parameter
 * 
 */
GameMsgGenerator.create = function (msg) {

  return new GameMsg({
      session: ('undefined' !== typeof msg.session) ? msg.session : node.socket.session, 
      stage: msg.stage || node.game.stage,
      action: msg.action || action.SAY,
      target: msg.target || target.DATA,
      from: node.player.sid, // TODO change to id
      to: ('undefined' !== typeof msg.to) ? msg.to : 'SERVER',
      text: msg.text || null,
      data: msg.data || null,
      priority: msg.priority || null,
      reliable: msg.reliable || 1
  });

};

// ## Closure
})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);
