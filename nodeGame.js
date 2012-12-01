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
		
	var EventEmitter = node.EventEmitter,
		GameSocketClient = node.GameSocketClient,
		GameState = node.GameState,
		GameMsg = node.GameMsg,
		Game = node.Game,
		Player = node.Player,
		GameSession = node.GameSession;
	
	
	// Adding constants directly to node
	// ////////////////////////////////////////
	
	node.actions 	= GameMsg.actions;
	node.IN 		= GameMsg.IN;
	node.OUT 		= GameMsg.OUT;
	node.targets 	= GameMsg.targets;		
	node.states 	= GameState.iss;
	
	// Creating EventEmitter
	// /////////////////////////////////////////
	
	node.events = new EventEmitter();


	// Creating objects
	// /////////////////////////////////////////
	
	node.msg	= node.GameMsgGenerator;	
	node.socket = node.gsc = new GameSocketClient();
	
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
		
		if (!conf.events) { conf.events = {}; };
		
		if ('undefined' === conf.events.history) {
			conf.events.history = false;
		}
		
		if ('undefined' === conf.events.dumpEvents) {
			conf.events.dumpEvents = false;
		}
		
		this.conf = conf;
		return conf;
	};
	
	
	node.on = function (event, listener) {
		// It is in the init function;
		if (!node.game || !node.game.state || (GameState.compare(node.game.state, new GameState(), true) === 0 )) {
			node.events.add(event, listener);
			// node.log('global');
		}
		else {
			node.events.addLocal(event, listener);
			// node.log('local');
		}
	};
	
	node.once = function (event, listener) {
		node.on(event, listener);
		node.on(event, function(event, listener) {
			node.events.remove(event, listener);
		});
	};
	
	node.off = node.removeListener = function (event, func) {
		return node.events.remove(event, func);
	};
	
	// TODO: create conf objects
	node.connect = node.play = function (conf, game) {	
		node._analyzeConf(conf);
		
		// node.socket.connect(conf);
		
		node.game = new Game(game);
		node.emit('NODEGAME_GAME_CREATED');
		
		
		// INIT the game
		node.game.init.call(node.game);
		node.socket.connect(conf); // was node.socket.setGame(node.game);
		
		node.log('game loaded...');
		node.log('ready.');
	};	
	
// node.observe = function (conf, game) {
// node._analyzeConf(conf);
//		
// var game = game || {loops: {1: {state: function(){}}}};
// node.socket = that.gsc = new GameSocketClient(conf);
//		
// node.game = that.game = new Game(game, that.gsc);
// node.socket.setGame(that.game);
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
		node.events.emit(event, p1, p2, p3);
	};	
	
	node.say = function (data, what, whom) {
		node.events.emit('out.say.DATA', data, whom, what);
	};
	
/**
 * ### node.set
 * 
 * Store a key, value pair in the server memory
 * 
 * @param {string} key An alphanumeric (must not be unique)
 * @param {mixed} The value to store (can be of any type)
 * 
 */
	node.set = function (key, value) {
		// TODO: parameter to say who will get the msg
		node.events.emit('out.set.DATA', value, null, key);
	};
	
	
	node.get = function (key, func) {
		node.events.emit('out.get.DATA', key);
		
		var listener = function(msg) {
			if (msg.text === key) {
				func.call(node.game, msg.data);
				node.events.remove('in.say.DATA', listener);
			}
			// node.events.printAll();
		};
		
		node.on('in.say.DATA', listener);
	};

/**
 * ### node.replay
 * 
 * Moves the game state to 1.1.1
 * 
 * @param {boolean} rest TRUE, to erase the game memory before update the game state
 */	
	node.replay = function (reset) {
		if (reset) node.game.memory.clear(true);
		node.goto(new GameState({state: 1, step: 1, round: 1}));
	}

/**
 * ### node.goto
 * 
 * Moves the game to the specified game state
 * 
 * @param {string|GameState} The state to go to
 * 
 */	
	node.goto = function (state) {
		node.game.updateState(state);
	};
	
/**
 * ### node.redirect
 * 
 * Redirects a player to the specified url
 * 
 * Works only if it is a monitor client to send
 * the message, i.e. players cannot redirect each 
 * other.
 * 
 * Examples
 *  
 * 	// Redirect to http://mydomain/mygame/missing_auth
 * 	node.redirect('missing_auth', 'xxx'); 
 * 
 *  // Redirect to external urls
 *  node.redirect('http://www.google.com');
 * 
 * @param {string} url the url of the redirection
 * @param {string} who A player id or 'ALL'
 * @return {boolean} TRUE, if the redirect message is sent
 */	
	node.redirect = function (url, who) {
		if (!url || !who) return false;
		
		var msg = node.msg.create({
			target: node.targets.REDIRECT,
			data: url,
			to: who
		});
		node.socket.send(msg);
		return true;
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
				func.call(node.game, msg);
			}
		});
		
		node.on('in.set.DATA', function(msg) {
			if (text && msg.text === text) {
				func.call(node.game, msg);
			}
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
