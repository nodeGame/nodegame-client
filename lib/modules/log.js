/**
 * # Log
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` logging module
 * 
 * ---
 * 
 */

(function (exports, node) {
	


// ## Logging system

/**
 * ### node.verbosity_levels
 * 
 * ALWAYS, ERR, WARN, INFO, DEBUG
 */  
	node.verbosity_levels = {
			ALWAYS: -(Number.MIN_VALUE + 1), 
			ERR: -1,
			WARN: 0,
			INFO: 1,
			DEBUG: 100,
			NEVER: Number.MIN_VALUE - 1
	};	
	
/**
 *  ### node.verbosity
 *  
 *  The minimum level for a log entry to be displayed as output
 *   
 *  Defaults, only errors are displayed.
 *  
 */
	node.verbosity = node.verbosity_levels.WARN;


 
/**
 * ### node.remoteVerbosity
 *
 *  The minimum level for a log entry to be reported to the server
 *   
 *  Defaults, only errors are displayed.
 */	
	node.remoteVerbosity = node.verbosity_levels.WARN;
		
/**
 * ### node.log
 * 
 * Default nodeGame standard out, override to redirect
 * 
 * Logs entries are displayed to the console if their level is 
 * smaller than `node.verbosity`.
 * 
 * Logs entries are forwarded to the server if their level is
 * smaller than `node.remoteVerbosity`.
 * 
 * @param {string} txt The text to output
 * @param {string|number} level Optional. The verbosity level of this log. Defaults, level = 0
 * @param {string} prefix Optional. A text to display at the beginning of the log entry. Defaults prefix = 'nodeGame: ' 
 * 
 */
	node.log = function (txt, level, prefix) {
		if ('undefined' === typeof txt) return false;
		
		level 	= level || 0;
		prefix 	= ('undefined' === typeof prefix) 	? 'ng> '
													: prefix;
		
		if ('string' === typeof level) {
			level = node.verbosity_levels[level];
		}
		if (node.verbosity > level) {
			console.log(prefix + txt);
		}
//		if (node.remoteVerbosity > level) {
//			var remoteMsg = node.msg.create({
//				target: node.target.LOG,
//				text: level,
//				data: txt,
//				to: 'SERVER'
//			});
//			console.log(txt)
//			node.socket.send(remoteMsg);
//		}
	};

/**
 * ### node.info
 * 
 * Logs an INFO message
 */
	node.info = function (txt, prefix) {
		node.log(txt, node.verbosity_levels.INFO, prefix);
	};

/**
 * ### node.warn
 * 
 * Logs a WARNING message
 */
	node.warn = function (txt, prefix) {
		node.log(txt, node.verbosity_levels.WARN, prefix);
	};

/**
 * ### node.err
 * 
 * Logs an ERROR message
 */
	node.err = function (txt, prefix) {
		node.log(txt, node.verbosity_levels.ERR, prefix);
	};

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);