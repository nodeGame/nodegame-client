/**
 * # Setup
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` setup module
 * 
 * ---
 * 
 */

(function (exports, node) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	GameState = node.GameState,
	Player = node.Player,
	GameMsgGenerator = node.GameMsgGenerator,
	J = node.JSUS;
//## Extra

node.random = {};

/**
* ### node.random.emit
* 
* Emits an event after a random time interval between 0 and maxWait 
* 
* @param {string} event The name of the event
* @param {number} maxWait Optional. The maximum time (in milliseconds)
* 	to wait before emitting the event. to Defaults, 6000
*/	
	node.random.emit = function (event, maxWait){
		maxWait = maxWait || 6000;
		setTimeout(function(event) {
			node.emit(event);
		}, Math.random() * maxWait, event);
	};

/**
* ### node.random.exec 
* 
* Executes a callback function after a random time interval between 0 and maxWait 
* 
* @param {function} The callback function to execute
* @param {number} maxWait Optional. The maximum time (in milliseconds) 
* 	to wait before executing the callback. to Defaults, 6000
*/	
	node.random.exec = function (func, maxWait) {
		maxWait = maxWait || 6000;
		setTimeout(function(func) {
			func.call();
		}, Math.random() * maxWait, func);
	};	


})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);