/**
 * # nodeGame
 * 
 * Web Experiments in the Browser
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * nodeGame is a free, open source, event-driven javascript framework for on line, 
 * multiplayer games in the browser.
 * 
 * 
 */

(function (node) {

// ### version	
node.version = '0.4.8';

// ## Logging system

/**
 *  ### node.verbosity
 *  
 *  The minimum level for a log entry to be displayed as output.
 *   
 *  Defaults, only errors are displayed.
 *  
 */
node.verbosity = 0;


/**
 * ### node.verbosity_levels
 * 
 * ALWAYS, ERR, WARN, INFO, DEBUG
 */  
node.verbosity_levels = {
		// <!-- It is not really always... -->
		ALWAYS: -(Number.MIN_VALUE+1), 
		ERR: -1,
		WARN: 0,
		INFO: 1,
		DEBUG: 100
};


/**
 * ### node.log
 * 
 * Default nodeGame standard out, override to redirect
 * 
 * Logs entries are displayed only if their verbosity level is 
 * greater than `node.verbosity`
 * 
 * @param {string} txt The text to output
 * @param {string|number} level Optional. The verbosity level of this log. Defaults, level = 0
 * @param {string} prefix Optional. A text to display at the beginning of the log entry. Defaults prefix = 'nodeGame: ' 
 * 
 */
node.log = function (txt, level, prefix) {
	if ('undefined' === typeof txt) return false;
	
	level 	= level || 0;
	prefix 	= ('undefined' === typeof prefix) 	? 'nodeGame: '
												: prefix;
	if ('string' === typeof level) {
		level = node.verbosity_levels[level];
	}
	if (node.verbosity > level) {
		console.log(prefix + txt);
	}
};

/**
 * ### node.info
 * 
 * Logs an INFO message
 */
node.info = function (txt, prefix) {
	node.log(txt, node.verbosity_levels.INFO, prefix);
}

/**
 * ### node.warn
 * 
 * Logs a WARNING message
 */
node.warn = function (txt, prefix) {
	node.log(txt, node.verbosity_levels.WARN, prefix);
}

/**
 * ### node.err
 * 
 * Logs an ERROR message
 */
node.err = function (txt, prefix) {
	node.log(txt, node.verbosity_levels.ERR, prefix);
}

// ## Objects

/**
 * ### node.events
 * 
 * Instance of the EventEmitter class
 * 
 * Takes care of emitting the events and calling the
 * proper listener functions 
 * 
 * @see node.EventEmitter
 */	
node.events = {};
	
/**
 * ### node.msg
 * 
 * Static factory of game messages
 * 
 * @see node.GameMsgGenerator
 */	
node.msg = {};
	

/**
 * ### node.socket
 * 
 * Instantiates the connection to a nodeGame server
 * 
 * @see node.GameSocketClient
 */	
node.socket = node.gsc = {};

/**
 * ### node.session
 * 
 * Contains a reference to all session variables
 * 
 * Session variables can be saved and restored at a later stage
 */
node.session 	= {};

/**
 * ### node.player
 * Instance of node.Player
 * 
 * Contains information about the player
 * 
 * @see node.PlayerList.Player
 */
node.player 	= {};

/**
 * ### node.memory
 * 
 * Instance of node.GameDB database
 * 
 * @see node.GameDB
 */
node.memory 	= {};

/**
 * ### node.support 
 * 
 * A collection of features that are supported by the current browser
 */
node.support	= {};


// ## Dependencies 
// Load dependencies

if ('object' === typeof module && 'function' === typeof require) {
	// <!-- Node.js -->
	require('./init.node.js');
    require('./nodeGame.js');
    require('./listeners/incoming.js');
    require('./listeners/internal.js');
    require('./listeners/outgoing.js');
}
else {
	// <!-- Browser -->
	if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
	if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
	if ('undefined' !== typeof store) node.store = store;
	
	node.support = JSUS.compatibility();
}

	
})('object' === typeof module ? module.exports : (window.node = {}));	