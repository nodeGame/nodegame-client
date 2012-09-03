/**
 * # nodeGame
 * 
 * Copyright(c) 2012 Stefano Balietti MIT Licensed
 * 
 * ### nodeGame: Web Experiments in the Browser
 * 
 * *nodeGame* is a free, open source, event-driven javascript framework for on
 * line, multiplayer games in the browser.
 */
(function (node) {
	
	// Declaring variables
	// //////////////////////////////////////////
		
	var EventEmitter = node.EventEmitter;
	var GameSocketClient = node.GameSocketClient;
	var GameState = node.GameState;
	var GameMsg = node.GameMsg;
	var Game = node.Game;
	var Player = node.Player;
	var GameSession = node.GameSession;
	
	
	// Adding constants directly to node
	// ////////////////////////////////////////
	
	node.actions 	= GameMsg.actions;
	node.IN 		= GameMsg.IN;
	node.OUT 		= GameMsg.OUT;
	node.targets 	= GameMsg.targets;		
	node.states 	= GameState.iss;
	
	// Creating EventEmitter
	// /////////////////////////////////////////
	
	var ee = node.events = node._ee = new EventEmitter();


	// Creating objects
	// /////////////////////////////////////////
	
	node.msg		= node.GameMsgGenerator;	
	node.gsc 		= new GameSocketClient();

	node.game 		= null;
	node.player 	= null;
	
	Object.defineProperty(node, 'state', {
    	get: function() {
    		return (node.game) ? node.game.state : false;
    	},
    	configurable: false,
    	enumerable: true,
	});
	
	node.env = function (env, func, ctx, params) {
		if (!env || !func || !node.env[env]) return;
		ctx = ctx || node;
		params = params || [];
		func.apply(ctx, params);
	};
	
	// Adding methods
	// /////////////////////////////////////////
	
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
		if (conf.host && conf.host.lastIndexOf('/') !== host.length) {
			conf.host = conf.host + '/';
		}
		
		// VERBOSITY
		if ('undefined' !== typeof conf.verbosity) {
			node.verbosity = conf.verbosity;
		}
		
		
		// Environments
		if ('undefined' !== typeof conf.env) {
			for (var i in conf.env) {
				if (conf.env.hasOwnProperty(i)) {
					node.env[i] = conf.env[i];
				}
			}
		}
		
		this.conf = conf;
		return conf;
	};
	
	
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
		
		// node.gsc.connect(conf);
		
		node.game = new Game(game);
		node.emit('NODEGAME_GAME_CREATED');
		
		
		// INIT the game
		node.game.init.call(node.game);
		node.gsc.connect(conf); // was node.gsc.setGame(node.game);
		
		node.log('game loaded...');
		node.log('ready.');
	};	
	
// node.observe = function (conf, game) {
// node._analyzeConf(conf);
//		
// var game = game || {loops: {1: {state: function(){}}}};
// node.gsc = that.gsc = new GameSocketClient(conf);
//		
// node.game = that.game = new Game(game, that.gsc);
// node.gsc.setGame(that.game);
//		
// node.on('NODEGAME_READY', function(){
//			
// // Retrieve the game and set is as observer
// node.get('LOOP', function(game) {
//				
// // alert(game);
// // console.log('ONLY ONE');
// // console.log(game);
// // var game = game.observer = true;
// // node.game = that.game = game;
// //
// // that.game.init();
// //
// // that.gsc.setGame(that.game);
// //
// // node.log('nodeGame: game loaded...');
// // node.log('nodeGame: ready.');
// });
// });
		
		
// node.onDATA('GAME', function(data){
// alert(data);
// console.log(data);
// });
		
// node.on('DATA', function(msg){
// console.log('--------->Eh!')
// console.log(msg);
// });
// };
	
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
	
	node.replay = function (reset) {
		if (reset) node.game.memory.clear(true);
		node.goto(new GameState({state: 1, step: 1, round: 1}));
	}
	
	node.goto = function (state) {
		node.game.updateState(state);
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
	};
		
	node.log(node.version + ' loaded', 'ALWAYS');
	
})('undefined' != typeof node ? node : module.parent.exports);
