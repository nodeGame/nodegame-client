/*!
 * nodeGame
 */

(function (exports, io) {
	
	var node = exports;

	// if node
	
	if ('object' === typeof module && 'function' === typeof require) {
	
		/**
	     * Expose Socket.io-client
	     *
	     * @api public
	     */
	
	    node.io = require('socket.io-client');
		
		/**
	     * Expose EventEmitter
	     *
	     * @api public
	     */
	
	    node.EventEmitter = require('./EventEmitter').EventEmitter;
		
	    /**
	     * Expose Utils
	     *
	     * @api public
	     */
	
	    node.Utils = require('./Utils').Utils;
	
	    /**
	     * Expose GameState.
	     *
	     * @api public
	     */
	
	    node.GameState = require('./GameState').GameState;
	
	    /**
	     * Expose PlayerList.
	     *
	     * @api public
	     */
	
	    node.PlayerList = require('./PlayerList').PlayerList;
	    
	    /**
	     * Expose Player.
	     *
	     * @api public
	     */
	
	    node.Player = require('./PlayerList').Player;
	
	    
	    /**
	     * Expose GameMsg
	     *
	     * @api public
	     */
	
	     node.GameMsg = require('./GameMsg').GameMsg;
	
	    /**
	     * Expose GameLoop
	     *
	     * @api public
	     */
	
	    node.GameLoop = require('./GameLoop').GameLoop;
	
	    
	    /**
	     * Expose GameMsgGenerator
	     *
	     * @api public
	     */
	
	    node.GameMsgGenerator = require('./GameMsgGenerator').GameMsgGenerator;
	    
	    /**
	     * Expose GameSocketClient
	     *
	     * @api public
	     */
	
	    node.GameSocketClient = require('./GameSocketClient').GameSocketClient;
	    
	    /**
	     * Expose GameStorage
	     *
	     * @api public
	     */
	
	    node.GameStorage = require('./GameStorage').GameStorage;
	    
	    /**
	     * Expose Game
	     *
	     * @api public
	     */
	
	    node.Game = require('./Game').Game;
	
	  }
	  // end node
		
	
	var EventEmitter = node.EventEmitter;
	var GameSocketClient = node.GameSocketClient;
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var Game = node.Game;
	
	/**
	 * Expose constructor
	 * 
	 */
	exports.nodeGame = nodeGame;
	
	/**
	 *  Exposing constants
	 */	
	exports.actions = GameMsg.actions;
	exports.IN = GameMsg.IN;
	exports.OUT = GameMsg.OUT;
	exports.targets = GameMsg.targets;		
	exports.states = GameState.iss;
	
	
	// Constructor
	nodeGame.prototype.__proto__ = EventEmitter.prototype;
	nodeGame.prototype.constructor = nodeGame;
	
	function nodeGame() {
		EventEmitter.call(this);
		this.gsc = null;
		this.game = null;
	};
	
	
	/**
	 * Creating an object
	 */
	var that = node.node = new nodeGame();
	
	node.state = function() {
		return (that.game) ? node.node.game.gameState : false;
	};
	
	node.on = function(event,listener) {
		var state = this.state();
		//console.log(state);
		
		// It is in the init function;
		if (!state || (GameState.compare(state, new GameState(), true) === 0 )) {
			that.addListener(event, listener);
			//console.log('global');
		}
		else {
			that.addLocalListener(event, listener);
			//console.log('local');
		}
		
		
	};
	
	node.play = function (conf, game) {	
		node.gsc = that.gsc = new GameSocketClient(conf);
		
		// TODO Check why is not working...
		node.game = that.game = new Game(game, that.gsc);
		that.game.init();
		
		that.gsc.setGame(that.game);
		
		console.log('nodeGame: game loaded...');
		console.log('nodeGame: ready.');
	};	
	
	node.fire = node.emit = function (event, p1, p2, p3) {	
		that.emit(event, p1, p2, p3);
	};	
	
	node.set = function (key, value) {
		var data = {}; // necessary, otherwise the key is called key
		data[key] = value;
		that.emit('out.set.DATA', data);
	}

	node.get = function (key, value) {
		that.emit('out.get.DATA')
	}
	
	node.dump = function () {
		return node.game.dump();
	}
	
//	/**
//	 * Stores data for the client.
//	 *
//	 * @api public
//	 */
//	node.set = function (key, value, fn) {
//	  node.store.set(key, value, fn);
//	};
//
//	/**
//	 * Retrieves data for the client
//	 *
//	 * @api public
//	 */
//	node.get = function (key, fn) {
//		node.store.get(key, fn);
//	};
//
//	/**
//	 * Checks data for the client
//	 *
//	 * @api public
//	 */
//	
//	node.has = function (key, fn) {
//	  node.store.has(key, fn);
//	};
//	
//	/**
//	 * Deletes data for the client
//	 *
//	 * @api public
//	 */
//	
//	node.del = function (key, fn) {
//	  node.store.del(key, fn);
//	};
//	
	// *Aliases*
	//
	// Conventions:
	//
	// - Direction:
	// 		'in' for all
	//
	// - Target:
	// 		DATA and TXT are 'say' as default
	// 		STATE and PLIST are 'set' as default
	
	
	// Sending
		
	
//	this.setSTATE = function(action,state,to){	
//		var stateEvent = GameMsg.OUT + action + '.STATE'; 
//		fire(stateEvent,action,state,to);
//	};
	
	// Receiving
	
	// Say
	
	node.onTXT = node.onTXTin = function(func) {
		node.on("in.say.TXT", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.onDATA = node.onDATAin = function(func) {
		node.on("in.say.DATA", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	// Set
	
	node.onSTATE = node.onSTATEin = function(func) {
		node.on("in.set.STATE", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.onPLIST = node.onPLISTin = function(func) {
		node.on("in.set.PLIST", function(msg) {
			func.call(that.game,msg);
		});
		
		node.on("in.say.PLIST", function(msg) {
			func.call(that.game,msg);
		});
	};
	
	node.DONE = function (text) {
		node.fire("DONE",text);
	};
	
	node.TXT = function (text, to) {
		node.fire('out.say.TXT', text, to);
	};
	
	
})('undefined' != typeof node ? node : module.exports);
//})('object' === typeof module ? module.exports : (window.node = {}));

	