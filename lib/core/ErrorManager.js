/**
 * # ErrorManager
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Handles the runtime errors.
 * ---
 */
(function(exports, parent) {

// ## Global scope
    var J = parent.JSUS;

    parent.NodeGameRuntimeError = NodeGameRuntimeError;
    parent.NodeGameStageCallbackError = NodeGameStageCallbackError;
    parent.NodeGameMisconfiguredGameError = NodeGameMisconfiguredGameError;
    parent.NodeGameIllegalOperationError = NodeGameIllegalOperationError;

    /*
     * ### NodeGameRuntimeError
     *
     * An error occurred during the execution of nodeGame
     */
    function NodeGameRuntimeError(msg) {
        //Error.apply(this, arguments);
        this.msg = msg;
        this.stack = (new Error()).stack;
        throw new Error('Runtime: ' + msg);
    }

    NodeGameRuntimeError.prototype = new Error();
    NodeGameRuntimeError.prototype.constructor = NodeGameRuntimeError;
    NodeGameRuntimeError.prototype.name = 'NodeGameRuntimeError';


    /*
     * ### NodeGameStageCallbackError
     *
     * An error occurred during the execution of one of the stage callbacks
     */
    function NodeGameStageCallbackError(msg) {
        //Error.apply(this, arguments);
        this.msg = msg;
        this.stack = (new Error()).stack;
        throw 'StageCallback: ' + msg;
    }

    NodeGameStageCallbackError.prototype = new Error();
    NodeGameStageCallbackError.prototype.constructor = NodeGameStageCallbackError;
    NodeGameStageCallbackError.prototype.name = 'NodeGameStageCallbackError';


    /*
     * ### NodeGameMisconfiguredGameError
     *
     * An error occurred during the configuration of the Game
     */
    function NodeGameMisconfiguredGameError(msg) {
        //Error.apply(this, arguments);
        this.msg = msg;
        this.stack = (new Error()).stack;
        throw 'MisconfiguredGame: ' + msg;
    }

    NodeGameMisconfiguredGameError.prototype = new Error();
    NodeGameMisconfiguredGameError.prototype.constructor = NodeGameMisconfiguredGameError;
    NodeGameMisconfiguredGameError.prototype.name = 'NodeGameMisconfiguredGameError';


    /*
     * ### NodeGameIllegalOperationError
     *
     * An error occurred during the configuration of the Game
     */
    function NodeGameIllegalOperationError(msg) {
        //Error.apply(this, arguments);
        this.msg = msg;
        this.stack = (new Error()).stack;
        throw 'IllegalOperation: ' + msg;
    }

    NodeGameIllegalOperationError.prototype = new Error();
    NodeGameIllegalOperationError.prototype.constructor = NodeGameIllegalOperationError;
    NodeGameIllegalOperationError.prototype.name = 'NodeGameIllegalOperationError';

    if (J.isNodeJS()) {
	// TODO fix this
        process.on('uncaughtException', function (err) {
            node.err('Caught exception: ' + err);
            if (node.debug) {
                throw err;
            }
        });
    }
    else {
        window.onerror = function(msg, url, linenumber) {
            console.log(node, msg);
            node.err(url + ' ' + linenumber + ': ' + msg);
            return !node.debug;
        };
    }

// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);