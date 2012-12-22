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

	node.setup.register('nodegame', function(options) {
		for (var i in node.setup) {
			if (node.setup.hasOwnProperty(i)) {
				if (i !== 'register' && i !== 'nodegame') {
					node.setup[i].call(exports, options[i]);
				}
			}
		}
		
		
	});
	
	
	node.setup.register('socket', function(conf) {
		if (!conf) return;
		node.socket.setup(conf);
	});
	
	node.setup.register('host', function(conf) {
		conf = conf || {};
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
			
			// Add a trailing slash if missing
			if (conf.host && conf.host.lastIndexOf('/') !== host.length) {
				conf.host = conf.host + '/';
			}
		}
		
		return conf;
	});
	
	
	node.setup.register('verbosity', function(level){
		// VERBOSITY
		if ('undefined' !== typeof level) {
			node.verbosity = level;
		}
		
		return level;
	});
	
	
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
	
	node.setup.register('events', function(conf){
		conf = conf || {};
		if ('undefined' === conf.history) {
			conf.history = false;
		}
		
		if ('undefined' === conf.dumpEvents) {
			conf.dumpEvents = false;
		}
		
		return conf;
	});
	
	
/**
 * ### node.setup.game
 * 
 * 
 */	
	node.setup.register('game', function(game) {
		if (!game) return {};
		node.game = new Game(game);
		node.emit('NODEGAME_GAME_CREATED');
		return node.game;
	});
		
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
		if (!property) {
			node.err('cannot send remote setup: empty property');
			return false;
		}
		if (!to) {
			node.err('cannot send remote setup: empty recipient');
			return false;
		}
		var msg = node.msg.create({
			target: node.target.SETUP,
			to: to,
			text: property,
			data: options
		});
		
		return node.socket.send(msg);
	};
		

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);