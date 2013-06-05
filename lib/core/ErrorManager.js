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
    exports.NodeGameMisconfiguredGameError = NodeGameMisconfiguredGameError;

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
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
