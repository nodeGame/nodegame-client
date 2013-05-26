/**
 * # Stager
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` container of game-state functions, and parameters
 * 
 * ---
 * 
 */
(function (exports, node) {
	
// ## Global scope
    var J = node.JSUS;

    node.debug = false;

    exports.NodeGameRuntimeError = NodeGameRuntimeError;
    exports.NodeGameStageCallbackError = NodeGameStageCallbackError;

    /* 
     * ### NodeGameRuntimeError
     * 
     * An error occurred during the execution of nodeGame
     */
    function NodeGameRuntimeError() {
	Error.apply(this, arguments);
	this.stack = (new Error()).stack;
    }

    NodeGameRuntimeError.prototype = new Error();
    NodeGameRuntimeError.prototype.constructor = NodeGameRuntimeError;
    NodeGameRuntimeError.prototype.name = 'NodeGameRuntimeError';


    /* 
     * ### NodeGameStageCallbackError
     * 
     * An error occurred during the execution of one of the stage callbacks
     */
    function NodeGameStageCallbackError() {
	Error.apply(this, arguments);
	this.stack = (new Error()).stack;
    }

    NodeGameStageCallbackError.prototype = new Error();
    NodeGameStageCallbackError.prototype.constructor = NodeGameStageCallbackError;
    NodeGameStageCallbackError.prototype.name = 'NodeGameStageCallbackError';

    if (J.isNodeJS()) {
	process.on('uncaughtException', function (err) {
	    console.log('Caught exception: ' + err);
	});
    }
    else {
	window.onerror = function(msg, url, linenumber) {
	    node.err(url + ' ' + linenumber + ': ' + msg);
	    return !node.debug;
	};
    }

// ## Closure	
})(
    'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);