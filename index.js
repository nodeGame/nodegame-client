/**
 * # nodeGame
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * ### nodeGame: Web Experiments in the Browser
 * 
 * *nodeGame* is a free, open source, event-driven javascript framework for on line, 
 * multiplayer games in the browser.
 * 
 */

(function (node) {
	
	// #### nodeGame init
	
	node.version = '0.7.5';
	
	node.verbosity = 0;
	
	node.verbosity_levels = {
			// <!-- It is not really always... -->
			ALWAYS: -(Number.MIN_VALUE+1), 
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
	
	// It will be overwritten later
	node.game = {};
	node.gsc = {};
	node.session = {};
	node.player = {};
	
	// Memory related operations
	// Will be initialized later
	node.memory = {};
	
	// Load the auxiliary library if available in the browser
	if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
	if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
	if ('undefined' !== typeof store) node.store = store;
	
	// if node
	if ('object' === typeof module && 'function' === typeof require) {
	    require('./init.node.js');
	    require('./nodeGame.js');
	}
	// end node
	
})('object' === typeof module ? module.exports : (window.node = {}));	