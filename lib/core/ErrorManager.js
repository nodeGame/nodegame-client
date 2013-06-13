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

    node.NodeGameRuntimeError = NodeGameRuntimeError;
    node.NodeGameStageCallbackError = NodeGameStageCallbackError;
    node.NodeGameMisconfiguredGameError = NodeGameMisconfiguredGameError;
    node.NodeGameIllegalOperationError = NodeGameIllegalOperationError;

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


    /*
     * ### NodeGameMisconfiguredGameError
     *
     * An error occurred during the configuration of the Game
     */
    function NodeGameMisconfiguredGameError() {
        Error.apply(this, arguments);
        this.stack = (new Error()).stack;
    }

    NodeGameMisconfiguredGameError.prototype = new Error();
    NodeGameMisconfiguredGameError.prototype.constructor = NodeGameMisconfiguredGameError;
    NodeGameMisconfiguredGameError.prototype.name = 'NodeGameMisconfiguredGameError';


    /*
     * ### NodeGameIllegalOperationError
     *
     * An error occurred during the configuration of the Game
     */
    function NodeGameIllegalOperationError() {
        Error.apply(this, arguments);
        this.stack = (new Error()).stack;
    }

    NodeGameIllegalOperationError.prototype = new Error();
    NodeGameIllegalOperationError.prototype.constructor = NodeGameIllegalOperationError;
    NodeGameIllegalOperationError.prototype.name = 'NodeGameIllegalOperationError';

    if (J.isNodeJS()) {
	// TODO fix this
        //process.on('uncaughtException', function (err) {
        //    node.err('Caught exception: ' + err);
        //    if (node.debug) {
        //        throw err;
        //    }
        //});
    }
    else {
        window.onerror = function(msg, url, linenumber) {
            node.err(url + ' ' + linenumber + ': ' + msg);
            return !node.debug;
        };
    }

// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
