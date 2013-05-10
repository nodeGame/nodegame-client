/**
 * # nodeGame
 * 
 * Social Experiments in the Browser
 * 
 * Copyright(c) 2012 Stefano Balietti MIT Licensed
 * 
 * *nodeGame* is a free, open source, event-driven javascript framework for on
 * line, multiplayer games in the browser.
 * 
 * ---
 * 
 */
(function (exports, node) {
		
	var EventEmitter = node.EventEmitter,
		Socket = node.Socket,
		GameStage = node.GameStage,
		GameMsg = node.GameMsg,
		Game = node.Game,
		Player = node.Player,
		GameSession = node.GameSession,
		J = node.JSUS;		
	
// ## Methods
	
	
/**
 * ### nove.env
 * 
 * Executes a block of code conditionally to nodeGame environment variables  
 * 
 * @param env {string} The name of the environment
 * @param func {function} The callback function to execute
 * @param ctx {object} Optional. The context of execution
 * @param params {array} Optional. An array of additional parameters for the callback
 * 
 */	
	node.env = function (env, func, ctx, params) {
		if (!env || !func || !node.env[env]) return;
		ctx = ctx || node;
		params = params || [];
		func.apply(ctx, params);
	};
	
		
/**
 * ### node.createPlayer
 * 
 * Mixes in default properties for the player object and
 * additional configuration variables from node.conf.player
 * 
 * Writes the node.player object
 * 
 * Properties: `id`, `sid`, `ip` can never be overwritten.
 * 
 * Properties added as local configuration cannot be further
 * modified during the game. 
 * 
 * Only the property `name`, can be changed.
 * 
 */
	node.createPlayer = function (player) {
		
		player = new Player(player);
		
		if (node.conf && node.conf.player) {			
			var pconf = node.conf.player;
			for (var key in pconf) {
				if (pconf.hasOwnProperty(key)) {
					if (J.inArray(key, ['id', 'sid', 'ip'])) {
						continue;
					} 
					
					// Cannot be overwritten properties previously 
					// set in other sessions (recovery)
//						if (player.hasOwnProperty(key)) {
//							continue;
//						}
					if (node.support.defineProperty) {
						Object.defineProperty(player, key, {
					    	value: pconf[key],
					    	enumerable: true
						});
					}
					else {
						player[key] = pconf[key];
					}
				}
			}
		}
		
		
		if (node.support.defineProperty) {
			Object.defineProperty(node, 'player', {
		    	value: player,
		    	enumerable: true
			});
		}
		else {
			node.player = player;
		}
		
		node.emit('PLAYER_CREATED', player);
		
		return player;
	};	
	
/**
 * ### node.connect
 * 
 * Establishes a connection with a nodeGame server
 * 
 * @param {object} conf A configuration object
 * @param {object} game The game object
 */		
	node.connect = function (url) {	
		if (node.socket.connect(url)) {
			node.emit('NODEGAME_CONNECTED');
		}
	};	

	
/**
 * ### node.play
 * 
 * Starts a game
 * 
 * @param {object} conf A configuration object
 * @param {object} game The game object
 */	
	node.play = function(game) {	
		
		node.setup.game(game);
		
		node.game.start();
	};
	
/**
 * ### node.replay
 * 
 * Moves the game stage to 1.1.1
 * 
 * @param {boolean} rest TRUE, to erase the game memory before update the game stage
 */	
	node.replay = function (reset) {
		var stage111 = node.gameLoop.get("1.1.1");
		if (reset) node.game.memory.clear(true);
		node.game.execStage(stage111);
	};	
	
	
/**
 * ### node.emit
 * 
 * Emits an event locally
 *
 * @param {string} event The name of the event to emit
 * @param {object} p1 Optional. A parameter to be passed to the listener
 * @param {object} p2 Optional. A parameter to be passed to the listener
 * @param {object} p3 Optional. A parameter to be passed to the listener
 */	
	node.emit = function (event, p1, p2, p3) {	
		node.events.emit(event, p1, p2, p3);
	};	
	
/**
 * ### node.say
 * 
 * Sends a DATA message to a specified recipient
 * 
 * @param {mixed} data The content of the DATA message
 * @param {string} what The label associated to the message
 * @param {string} whom Optional. The recipient of the message
 *  
 */	
	node.say = function (data, what, whom) {
		node.events.emit('out.say.DATA', data, whom, what);
	};
	
/**
 * ### node.set
 * 
 * Stores a key-value pair in the server memory
 * 
 * 
 * 
 * @param {string} key An alphanumeric (must not be unique)
 * @param {mixed} The value to store (can be of any type)
 * 
 */
	node.set = function (key, value) {
		// TODO: parameter to say who will get the msg
		node.events.emit('out.set.DATA', value, null, key);
	};
	

/**
 * ### node.get
 * 
 * Sends a GET message to a recipient and listen to the reply 
 * 
 * @param {string} key The label of the GET message
 * @param {function} func The callback function to handle the return message
 */	
	node.get = function (key, func) {
		if (!key || !func) return;
		
		node.events.emit('out.get.DATA', key);
		
		var listener = function(msg) {
			if (msg.text === key) {
				func.call(node.game, msg.data);
				node.events.remove('in.say.DATA', listener);
			}
		};
		
		node.on('in.say.DATA', listener);
	};

/**
 * ### node.on
 * 
 * Registers an event listener
 * 
 * Listeners registered before a game is started, e.g. in
 * the init function of the game object, will stay valid 
 * throughout the game. Listeners registered after the game 
 * is started will be removed after the game has advanced
 * to its next stage. 
 * 
 * @param {string} event The name of the event
 * @param {function} listener The callback function
 */	
	node.on = function (event, listener) {
		
		if (!event) { 
			node.err('undefined event'); 
			return;
		}
		if ('function' !== typeof listener) { 
			node.err('callback must be of time function'); 
			return;
		}
		
		// It is in the init function;
		if (!node.game || !node.game.currentStepObj || (GameStage.compare(node.game.currentStepObj, new GameStage(), true) === 0 )) {
			node.events.add(event, listener);
		}
		else {
			node.events.addLocal(event, listener);
		}
	};

/**
 * ### node.once
 * 
 * Registers an event listener that will be removed 
 * after its first invocation
 * 
 * @param {string} event The name of the event
 * @param {function} listener The callback function
 * 
 * @see node.on
 * @see node.off
 */		
	node.once = function (event, listener) {
		if (!event || !listener) return;
		node.on(event, listener);
		node.on(event, function(event, listener) {
			node.events.remove(event, listener);
		});
	};
	
/**
 * ### node.off
 * 
 * Deregisters one or multiple event listeners
 * 
 * @param {string} event The name of the event
 * @param {function} listener The callback function
 * 
 * @see node.on
 * @see node.EventEmitter.remove
 */			
	node.off = node.removeListener = function (event, func) {
		return node.events.remove(event, func);
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
			target: node.target.REDIRECT,
			data: url,
			to: who
		});
		node.socket.send(msg);
		return true;
	};
	
	node.info(node.version + ' loaded');
	
	
	// Creating the objects
	// <!-- object commented in index.js -->
	node.events = new EventEmitter();

	node.msg	= node.GameMsgGenerator;	
	
	node.session = new GameSession();
	
	node.socket = node.gsc = new Socket();
	
	node.game = new Game();
	
	
})(
		this
	, 	'undefined' != typeof node ? node : module.parent.exports
);
