/**
 * # Log
 * 
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` logging module
 * 
 * ---
 */
(function (exports, parent) {

    var NGC = parent.NodeGameClient;
    var constants = parent.constants;
    
    /**
     * ### NodeGameClient.log
     * 
     * Default nodeGame standard out, override to redirect
     * 
     * Logs entries are displayed to the console if their level is 
     * smaller than `this.verbosity`.
     * 
     * TODO: Logs entries are forwarded to the server if their level is
     * smaller than `this.remoteVerbosity`.
     * 
     * @param {string} txt The text to output
     * @param {string|number} level Optional. The verbosity level of this log. Defaults, level = 0
     * @param {string} prefix Optional. A text to display at the beginning of the log entry. Defaults 'ng> ' 
     * 
     */
    NGC.prototype.log = function (txt, level, prefix) {
	if ('undefined' === typeof txt) return false;
	
	level  = level || 0;
	prefix = ('undefined' === typeof prefix) ? this.nodename + '> ' : prefix;
	
	if ('string' === typeof level) {
	    level = this.verbosity_levels[level];
	}
	if (this.verbosity > level) {
	    console.log(prefix + txt);
	}
        //		if (this.remoteVerbosity > level) {
        //			var remoteMsg = this.msg.create({
        //				target: this.target.LOG,
        //				text: level,
        //				data: txt,
        //				to: 'SERVER'
        //			});
        //			console.log(txt)
        //			this.socket.send(remoteMsg);
        //		}
    };

    /**
     * ### NodeGameClient.info
     * 
     * Logs an INFO message
     */
    NGC.prototype.info = function (txt, prefix) {
	prefix = this.nodename + (prefix ? '|' + prefix : '') + '> info - ';
	this.log(txt, this.verbosity_levels.INFO, prefix);
    };
    
    /**
     * ### NodeGameClient.warn
     * 
     * Logs a WARNING message
     */
    NGC.prototype.warn = function (txt, prefix) {
	prefix = this.nodename + (prefix ? '|' + prefix : '') + '> warn - ';
	this.log(txt, this.verbosity_levels.WARN, prefix);
    };

    /**
     * ### NodeGameClient.err
     * 
     * Logs an ERROR message
     */
    NGC.prototype.err = function (txt, prefix) {
	prefix = this.nodename + (prefix ? '|' + prefix : '') + '> error - ';
        this.log(txt, this.verbosity_levels.ERR, prefix);
    };

    /**
     * ### NodeGameClient.debug
     * 
     * Logs a DEBUG message
     */
    NGC.prototype.silly = function (txt, prefix) {
	prefix = this.nodename + (prefix ? '|' + prefix : '') + '> silly - ';
	this.log(txt, this.verbosity_levels.SILLY, prefix);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
