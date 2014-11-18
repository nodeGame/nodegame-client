/**
 * # ErrorManager
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Handles the runtime errors
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;

    parent.NodeGameRuntimeError = NodeGameRuntimeError;
    parent.NodeGameStageCallbackError = NodeGameStageCallbackError;
    parent.NodeGameMisconfiguredGameError = NodeGameMisconfiguredGameError;
    parent.NodeGameIllegalOperationError = NodeGameIllegalOperationError;

    parent.ErrorManager = ErrorManager;

    /**
     * ## ErrorManager constructor
     *
     * Creates a new instance of ErrorManager
     *
     * @param {NodeGameClient} node Reference to the active node object.
     */
    function ErrorManager(node) {

        /**
         * ### ErrorManager.lastError
         *
         * Reference to the last error occurred.
         */
        this.lastError = null;

        this.init(node);
    }

    // ## ErrorManager methods

    /**
     * ### ErrorManager.init
     *
     * Starts catching run-time errors
     *
     * @param {NodeGameClient} node Reference to the active node object.
     */
    ErrorManager.prototype.init = function(node) {
        var that;
        if (J.isNodeJS()) {
            that = this;
            process.on('uncaughtException', function(err) {
                that.lastError = err;
                node.err('Caught exception: ' + err);
                if (node.debug) {
                    throw err;
                }
            });
        }
        else {
            window.onerror = function(msg, url, linenumber) {
                var msg;
                msg = url + ' ' + linenumber + ': ' + msg;
                this.lastError = msg;
                node.err(msg);
                return !node.debug;
            };
        }
    }

    /**
     * ## NodeGameRuntimeError
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


    /**
     * ## NodeGameStageCallbackError
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


    /**
     * ## NodeGameMisconfiguredGameError
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


    /**
     * ## NodeGameIllegalOperationError
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

// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
