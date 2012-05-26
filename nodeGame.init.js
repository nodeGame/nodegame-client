(function (node) {
	
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
	
	node.log = function (txt, level) {
		var level = level || 0;
		if ('string' === typeof level) {
			var level = node.verbosity_levels[level];
		}
		if (node.verbosity > level) {
			console.log(txt);
		}
	};
	
	// Memory related operations
	// Will be initialized later
	node.memory = {};
	
	// It will be overwritten later
	node.game = {};
	
	// Load the auxiliary library if available in the browser
	if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
	if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
	if ('undefined' !== typeof store) node.store = store;
	
	
	if ('object' === typeof module && 'function' === typeof require) {
		node.JSUS = require('JSUS').JSUS;
		node.NDDB = require('NDDB').NDDB;
		node.io = require('socket.io-client');
	}
	
	

})('object' === typeof module ? module.exports.node = {} : (window.node = window.nodeGame = {}));
