/*!
 * nodeGame
 */

(function (node) {
	
	
	// Init
	///////////////////////////////////////////////////////////////////////
	
	node.version = '0.7.5';
	
	node.verbosity = 0;
	
	node.verbosity_levels = {
			ALWAYS: -(Number.MIN_VALUE+1), // Actually, it is not really
											// always...
			ERR: -1,
			WARN: 0,
			INFO: 1,
			DEBUG: 3
	};
	
	node.log = function (txt, level, prefix) {
		if ('undefined' === typeof txt) return false;
		
		var level 	= level || 0;
		var prefix 	= ('undefined' === typeof prefix) 	? 'nodeGame'
														: prefix;
		if ('string' === typeof level) {
			var level = node.verbosity_levels[level];
		}
		if (node.verbosity > level) {
			console.log(prefix + ': ' + txt);
		}
	};
	
	// Memory related operations
	// Will be initialized later
	node.memory = {};
	
	// It will be overwritten later
	node.game = {};
	node.gsc = {};
	node.session = {};
	node.player = {};
	
	// Load the auxiliary library if available in the browser
	if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
	if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
	if ('undefined' !== typeof store) node.store = store;
	
	
	/////////////////////////////////////////////////////////////////////
	
    
	// if node
	if ('object' === typeof module && 'function' === typeof require) {
	
	    /**
		 * Expose JSU
		 * 
		 * @api public
		 */
	
	    node.JSUS = require('JSUS').JSUS;
		
		/**
		 * Expose NDDB
		 * 
		 * @api public
		 */
	  	
	    node.NDDB = require('NDDB').NDDB;
		
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
		 * Expose GameDB
		 * 
		 * @api public
		 */
	
	    node.GameDB = require('./GameDB').GameDB;
	    
	    /**
		 * Expose GameBit
		 * 
		 * @api public
		 */
	
	    node.GameBit = require('./GameDB').GameBit;
	    
	    /**
		 * Expose Game
		 * 
		 * @api public
		 */
	
	    node.Game = require('./Game').Game;
	    
	    
	    // TODO: add a method to scan the addons directory. Based on
		// configuration
	    node.GameTimer = require('./addons/GameTimer').GameTimer;
	    
	    
	    /**
		 * Expose GameSession
		 * 
		 * @api public
		 */
	
	    require('./GameSession').GameSession;
	    

	  }
	  // end node
		
	var EventEmitter = node.EventEmitter;
	var GameSocketClient = node.GameSocketClient;
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var Game = node.Game;
	var Player = node.Player;
	var GameSession = node.GameSession;
	
	
	/**
	 * Exposing constants
	 */	
	node.actions = GameMsg.actions;
	node.IN = GameMsg.IN;
	node.OUT = GameMsg.OUT;
	node.targets = GameMsg.targets;		
	node.states = GameState.iss;
	
	
	// Constructor
//	nodeGame.prototype.__proto__ = EventEmitter.prototype;
//	nodeGame.prototype.constructor = nodeGame;
//	
//	function nodeGame() {
//		EventEmitter.call(this);
//	};
//	
	
	// Creating EventEmitter
	///////////////////////////////////////////
	
	var ee = node._ee = new EventEmitter();

	
	node.gsc 		= new GameSocketClient();
	//node.session	= new GameSession();
	node.game 		= null;
	node.player 	= null;
	
	Object.defineProperty(node, 'state', {
    	get: function(){
    		return (node.game) ? node.game.gameState : false;
    	},
    	configurable: false,
    	enumerable: true,
	});
	
	
	node.on = function (event, listener) {
		// It is in the init function;
		if (!node.state || (GameState.compare(node.state, new GameState(), true) === 0 )) {
			ee.addListener(event, listener);
			// node.log('global');
		}
		else {
			ee.addLocalListener(event, listener);
			// node.log('local');
		}
	};
	
	node.once = function (event, listener) {
		node.on(event, listener);
		node.on(event, function(event, listener) {
			ee.removeListener(event, listener);
		});
	};
	
	node.removeListener = function (event, func) {
		return ee.removeListener(event, func);
	};
	
	// TODO: create conf objects
	node.play = function (conf, game) {	
		node._analyzeConf(conf);
		
		//node.gsc.connect(conf);
		
		node.game = new Game(game);
		node.emit('NODEGAME_GAME_CREATED');
		
		
		// INIT the game
		node.game.init.call(node.game);
		node.gsc.connect(conf); // was node.gsc.setGame(node.game);
		
		node.log('game loaded...');
		node.log('ready.');
	};	
	
//	node.observe = function (conf, game) {
//		node._analyzeConf(conf);
//		
//		var game = game || {loops: {1: {state: function(){}}}};
//		node.gsc = that.gsc = new GameSocketClient(conf);
//		
//		node.game = that.game = new Game(game, that.gsc);
//		node.gsc.setGame(that.game);
//		
//		node.on('NODEGAME_READY', function(){
//			
//			// Retrieve the game and set is as observer
//			node.get('LOOP', function(game) {
//				
//				// alert(game);
//				// console.log('ONLY ONE');
//				// console.log(game);
//	// var game = game.observer = true;
//	// node.game = that.game = game;
//	//			
//	// that.game.init();
//	//			
//	// that.gsc.setGame(that.game);
//	//			
//	// node.log('nodeGame: game loaded...');
//	// node.log('nodeGame: ready.');
//			});
//		});
		
		
// node.onDATA('GAME', function(data){
// alert(data);
// console.log(data);
// });
		
// node.on('DATA', function(msg){
// console.log('--------->Eh!')
// console.log(msg);
// });
//	};	
	
	node.emit = function (event, p1, p2, p3) {	
		ee.emit(event, p1, p2, p3);
	};	
	
	node.say = function (data, what, whom) {
		ee.emit('out.say.DATA', data, whom, what);
	};
	
	/**
	 * Set the pair (key,value) into the server
	 * 
	 * @value can be an object literal.
	 * 
	 * 
	 */
	node.set = function (key, value) {
		// TODO: parameter to say who will get the msg
		ee.emit('out.set.DATA', value, null, key);
	};
	
	
	node.get = function (key, func) {
		ee.emit('out.get.DATA', key);
		
		var listener = function(msg) {
			if (msg.text === key) {
				func.call(node.game, msg.data);
				ee.removeListener('in.say.DATA',listener);
			}
			// ee.printAllListeners();
		};
		
		node.on('in.say.DATA', listener);
	};
	
	// *Aliases*
	//
	// Conventions:
	//
	// - Direction:
	// 'in' for all
	//
	// - Target:
	// DATA and TXT are 'say' as default
	// STATE and PLIST are 'set' as default
	
	
	// Sending
		
	
// this.setSTATE = function(action,state,to){
// var stateEvent = GameMsg.OUT + action + '.STATE';
// fire(stateEvent,action,state,to);
// };
	
	// Receiving
	
	// Say
	
	node.onTXT = function(func) {
		node.on("in.say.TXT", function(msg) {
			func.call(node.game,msg);
		});
	};
	
	node.onDATA = function(text, func) {
		node.on('in.say.DATA', function(msg) {
			if (text && msg.text === text) {
				func.call(node.game,msg);
			}
		});
		
		node.on('in.set.DATA', function(msg) {
			func.call(node.game,msg);
		});
	};
	
	// Set
	
	node.onSTATE = function(func) {
		node.on("in.set.STATE", function(msg) {
			func.call(node.game, msg);
		});
	};
	
	node.onPLIST = function(func) {
		node.on("in.set.PLIST", function(msg) {
			func.call(node.game, msg);
		});
		
		node.on("in.say.PLIST", function(msg) {
			func.call(node.game, msg);
		});
	};
	
	node.DONE = function (text) {
		node.emit("DONE",text);
	};
	
	node.TXT = function (text, to) {
		node.emit('out.say.TXT', text, to);
	};	
	
	node.random = {};
	
	// Generates event at RANDOM timing in milliseconds
	// if timing is missing, default is 6000
	node.random.emit = function (event, timing){
		var timing = timing || 6000;
		setTimeout(function(event) {
			node.emit(event);
		}, Math.random()*timing, event);
	};
	
	node.random.exec = function (func, timing) {
		var timing = timing || 6000;
		setTimeout(function(func) {
			func.call();
		}, Math.random()*timing, func);
	}
	
	node.replay = function (reset) {
		if (reset) node.game.memory.clear(true);
		node.goto(new GameState({state: 1, step: 1, round: 1}));
	}
	
	node.goto = function (state) {
		node.game.updateState(state);
	};
	
	/**
	 * Parses the a node configuration object and add default and missing
	 * values. Stores the final configuration in node.conf.
	 * 
	 */
	node._analyzeConf = function (conf) {
		if (!conf) {
			node.log('Invalid configuration object found.', 'ERR');
			return false;
		}
		
		// URL
		if (!conf.host) {
			if ('undefined' !== typeof window) {
				if ('undefined' !== typeof window.location) {
					var host = window.location.href;
				}
			}
			else {
				var host = conf.url;
			}
			if (host) {
				var tokens = host.split('/').slice(0,-2);
				// url was not of the form '/channel'
				if (tokens.length > 1) {
					conf.host = tokens.join('/');
				}
			}
		}
		
		
		// Add a trailing slash if missing
		if (conf.host.lastIndexOf('/') !== host.length) {
			conf.host = conf.host + '/';
		}
		
		// VERBOSITY
		if ('undefined' !== typeof conf.verbosity) {
			node.verbosity = conf.verbosity;
		}
		
		this.conf = conf;
		return conf;
	};
	
	// if node
	if ('object' === typeof module && 'function' === typeof require) {
		
		 /**
			 * Enable file system operations
			 */
	
	    node.csv = {};
	    node.fs = {};
	    
	    var fs = require('fs');
	    var path = require('path');
	    var csv = require('ya-csv');
	    
	    
	    /**
		 * Takes an obj and write it down to a csv file;
		 */
	    node.fs.writeCsv = function (path, obj) {
	    	var writer = csv.createCsvStreamWriter(fs.createWriteStream( path, {'flags': 'a'}));
	    	var i;
	        for (i=0;i<obj.length;i++) {
	    		writer.writeRecord(obj[i]);
	    	}
	    };
	    
	    node.memory.dump = function (path) {
			node.fs.writeCsv(path, node.game.memory.split().fetchValues());
	    }
	  
	}
	// end node
	
	node.log(node.version + ' loaded', 'ALWAYS');
	
})('undefined' != typeof node ? node : module.exports);
