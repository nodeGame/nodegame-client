/**
 * # Setup
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` configuration module
 * 
 * ---
 * 
 */

(function (exports, node) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	Player = node.Player,
	Game = node.Game,
	GameMsgGenerator = node.GameMsgGenerator,
	J = node.JSUS;

// TODO: check this
var frozen = false;

/**
 * ### node.setup
 * 
 * Setups the nodeGame object
 * 
 * Configures a specific feature of nodeGame and and stores 
 * the settings in `node.conf`.
 * 
 * See the examples folder for all available configuration options.
 * 
 * @param {string} property The feature to configure
 * @param {mixed} options The value of the option to configure
 * @return{boolean} TRUE, if configuration is successful
 * 
 * @see node.setup.register
 * 
 */	
	node.setup = function(property, options) {
		if (frozen) {
			node.err('nodeGame configuration is frozen. No modification allowed.');
			return false;
		}
		
		if (property === 'register') {
			node.warn('cannot setup property "register"');
			return false;
		}
		
		if (!node.setup[property]) {
			node.warn('no such property to configure: ' + property);
			return false;
		}
		
		var result = node.setup[property].call(exports, options);
		
		if (property !== 'nodegame') {
			node.conf[property] = result;
		}
		
		return true;
	};
	
/**
 * ### node.setup.register
 * 
 * Registers a configuration function
 * 
 * @param {string} property The feature to configure
 * @param {mixed} options The value of the option to configure
 * @return{boolean} TRUE, if configuration is successful
 * 
 * @see node.setup
 */	
	node.setup.register = function(property, func) {
		if (!property || !func) {
			node.err('cannot register empty setup function');
			return false;
		}
		
		if (property === 'register') {
			node.err('cannot overwrite register function');
			return false;
		}
		
		node.setup[property] = func;
		return true;
	};	

// ## Configuration functions	

// ### node.setup.nodegame
// Runs all the registered configuration functions	
// Matches the keys of the configuration objects with the name of the registered 
// functions and executes them. If no match is found, the configuration function 
// will set the default values
	node.setup.register('nodegame', function(options) {
		for (var i in node.setup) {
			if (node.setup.hasOwnProperty(i)) {
				if (i !== 'register' && i !== 'nodegame') {
					node.conf[i] = node.setup[i].call(exports, options[i]);
				}
			}
		}
		
		
	});
	
// ### node.setup.socket	
// Configures the socket connection to the nodegame-server
// @see node.Socket
// @see node.SocketFactory
	node.setup.register('socket', function(conf) {
		if (!conf) return;
		node.socket.setup(conf);
		return conf;
	});

// ### node.setup.host
// Sets the uri of the host
// If no value is passed, it will try to set the host from the window object
// in the browser enviroment. 
	node.setup.register('host', function(host) {		
		// URL
		if (!host) {
			if ('undefined' !== typeof window) {
				if ('undefined' !== typeof window.location) {
					host = window.location.href;
				}
			}
		}
			
		if (host) {
			var tokens = host.split('/').slice(0,-2);
			// url was not of the form '/channel'
			if (tokens.length > 1) {
				host = tokens.join('/');
			}
			
			// Add a trailing slash if missing
			if (host.lastIndexOf('/') !== host.length) {
				host = host + '/';
			}
		}
		
		return host;
	});
	
// ### node.setup.verbosity
// Sets the verbosity level for nodegame	
	node.setup.register('verbosity', function(level){
		if ('undefined' !== typeof level) {
			node.verbosity = level;
		}
		return level;
	});
	
// ### node.setup.env	
// Defines global variables to be stored in `node.env[myvar]`	
	node.setup.register('env', function(conf){
		if ('undefined' !== typeof conf) {
			for (var i in conf) {
				if (conf.hasOwnProperty(i)) {
					node.env[i] = conf[i];
				}
			}
		}
		
		return conf;
	});

// ### node.setup.events
// Configure the EventEmitter object
// @see node.EventEmitter
	node.setup.register('events', function(conf){
		conf = conf || {};
		if ('undefined' === typeof conf.history) {
			conf.history = false;
		}
		
		if ('undefined' === typeof conf.dumpEvents) {
			conf.dumpEvents = false;
		}
		
		return conf;
	});
	
// ### node.setup.window
// Configure the node.window object, if existing
// @see GameWindow
	node.setup.register('window', function(conf){
		if (!node.window) {
			node.warn('node.window not found, cannot configure it.');
			return;
		}
		conf = conf || {};
		if ('undefined' === typeof conf.promptOnleave) {
			conf.promptOnleave = false;
		}
		
		if ('undefined' === typeof conf.noEscape) {
			conf.noEscape = true;
		}
		
		node.window.init(conf);
		
		return conf;
	});
	
	
// ### node.setup.game
// Creates the `node.game` object
// The input parameter can be either an object (function) or 
// a stringified object (function)
	node.setup.register('game', function(game) {
		if (!game) return {};
		
		// Trying to parse the string, maybe it
		// comes from a remote setup
		if ('string' === typeof game) {
			game = J.parse(game);
			
			if ('function' !== typeof game) {
				node.err('Error while parsing the game object/string');
				return false;
			}
		}
		
		if ('function' === typeof game) {
			// creates the object
			game = new game();
		}
		
		node.game = new Game(game);
		node.emit('NODEGAME_GAME_CREATED');
		return node.game;
	});
		
// ### node.setup.player
// Creates the `node.player` object
// @see node.Player
// @see node.createPlayer
	node.setup.register('player', node.createPlayer);


/**
 * ### node.remoteSetup
 * 
 * Sends a setup configuration to a connected client
 * 
 * @param {string} property The feature to configure
 * @param {mixed} options The value of the option to configure
 * @param {string} to The id of the remote client to configure
 * 
 * @return{boolean} TRUE, if configuration is successful
 *
 * @see node.setup
 */	
	node.remoteSetup = function (property, options, to) {
	    var msg, payload;

	    if (!property) {
		node.err('cannot send remote setup: empty property');
		return false;
	    }
	    if (!to) {
		node.err('cannot send remote setup: empty recipient');
		return false;
	    }
	    
	    payload = J.stringify(options);
	    
	    if (!payload) {
		node.err('an error occurred while stringifying payload for remote setup');
		return false;
	    }
	    
	    msg = node.msg.create({
		target: node.target.SETUP,
		to: to,
		text: property,
		data: payload
	    });
		
	    return node.socket.send(msg);
	};
		

})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);
