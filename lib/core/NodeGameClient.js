/**
 * # NodeGameClient
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * nodeGame: Online Real-Time Synchronous Experiments.
 *
 * http://nodegame.org
 */
(function(exports, parent) {

    "use strict";

    // ## Exposing Class
    exports.NodeGameClient = NodeGameClient;

    var ErrorManager = parent.ErrorManager,
        EventEmitterManager = parent.EventEmitterManager,
        GameMsgGenerator = parent.GameMsgGenerator,
        Socket = parent.Socket,
        Game = parent.Game,
        Timer = parent.Timer,
        constants = parent.constants;

    /**
     * ## NodeGameClient constructor
     *
     * Creates a new NodeGameClient object
     */
    function NodeGameClient() {

        this.info('node: loading.');

        /**
         * ### node.nodename
         *
         * The name of this node, used in logging output
         *
         * Default: 'ng'
         */
        this.nodename = 'ng';

        /**
         * ### node.verbosity
         *
         * The minimum level for a log entry to be displayed as output
         *
         * Default: only warnings and errors are displayed
         */
        this.verbosity = constants.verbosity_levels.warn;

        /**
         * ### node.remoteVerbosity
         *
         * The minimum level for a log entry to be reported to the server
         *
         * Default: errors and warnings are reported
         */
        this.remoteVerbosity = constants.verbosity_levels.error;

        /**
         * ### node.remoteVerbosity
         *
         * Maps remotely logged messages to avoid infinite recursion
         *
         * In normal conditions this should always stay empty.
         */
        this.remoteLogMap = {};

        /**
         * ### node.errorManager
         *
         * Catches run-time errors
         *
         * In debug mode errors are re-thrown.
         */
        this.errorManager = new ErrorManager(this);

        /**
         * ### node.events
         *
         * Instance of the EventEmitterManager class
         *
         * Takes care of emitting the events and calling the
         * proper listener functions
         *
         * @see EventEmitter
         */
        this.events = new EventEmitterManager(this);

        /**
         * ### NodeGameClient.emit
         *
         * Emits an event locally on all registered event handlers
         *
         * The first parameter be the name of the event as _string_,
         * followed by any number of parameters that will be passed to the
         * handler callback.
         *
         * @see NodeGameClient.emitAsync
         * @see EventEmitterManager.emit
         */
        this.emit = this.events.emit;

        /**
         * ### NodeGameClient.emitAsync
         *
         * Emits an event locally on all registered event handlers
         *
         * Unlike normal emit, it does not return a value.
         *
         * @see NodeGameClient.emit
         * @see EventEmitterManager.emitSync
         */
        this.emitAsync = this.events.emitAsync;

        /**
         * ### NodeGameClient.on
         *
         * Registers an event listener on the active event emitter
         *
         * Different event emitters are active during the game. For
         * example, before a game is started, e.g. in the init
         * function of the game object, the `game` event emitter is
         * active. Events registered with the `game` event emitter
         * stay valid throughout the whole game. Listeners registered
         * after the game is started will be removed after the game
         * has advanced to its next stage or step.
         *
         * @param {string} event The name of the event
         * @param {function} listener The callback function
         *
         * @see NodeGameClient.off
         */
        this.on = function(event, listener) {
            var ee;
            ee = this.getCurrentEventEmitter();
            ee.on(event, listener);
        };

        /**
         * ### NodeGameClient.once
         *
         * Registers an event listener that will be removed after its first call
         *
         * @param {string} event The name of the event
         * @param {function} listener The callback function
         *
         * @see NodeGameClient.on
         * @see NodeGameClient.off
         */
        this.once = function(event, listener) {
            var ee;
            ee = this.getCurrentEventEmitter();
            ee.once(event, listener);
        };

        /**
         * ### NodeGameClient.off
         *
         * Deregisters one or multiple event listeners
         *
         * @param {string} event The name of the event
         * @param {function} listener The callback function
         *
         * @see NodeGameClient.on
         * @see NodeGameClient.EventEmitter.remove
         */
        this.off = function(event, func) {
            return this.events.remove(event, func);
        };

        /**
         * ### node.msg
         *
         * Factory of game messages
         *
         * @see GameMsgGenerator
         */
        this.msg = new GameMsgGenerator(this);

        /**
         * ### node.socket
         *
         * Instantiates the connection to a nodeGame server
         *
         * @see GameSocketClient
         */
        this.socket = new Socket(this);

        /**
         * ### node.session
         *
         * Contains a reference to all session variables
         *
         * Session variables can be saved and restored at a later stage
         *
         * @experimental
         */
        // TODO: not used for now.
        // this.session = new GameSession(this);

        /**
         * ### node.player
         * Instance of node.Player
         *
         * Contains information about the player
         *
         * @see PlayerList.Player
         */
        this.player = { placeholder: true };

        /**
         * ### node.timer
         *
         * Instance of node.Timer
         *
         * @see Timer
         */
        this.timer = new Timer(this);

        /**
         * ### node.game
         *
         * Instance of node.Game
         *
         * @see Game
         */
        this.game = new Game(this);

        /**
         * ### node.store
         *
         * Makes the nodeGame session persistent, saving it
         * to the browser local database or to a cookie
         *
         * @see shelf.js
         */
        this.store = function() {};

        /**
         * ### node.conf
         *
         * A reference to the current nodegame configuration
         *
         * @see NodeGameClient.setup
         */
        this.conf = {};

        /**
         * ### node.support
         *
         * A collection of features that are supported by the current browser
         */
        this.support = {};

        /**
         * ### node._setup
         *
         * Object containing registered setup functions
         *
         * @see NodeGameClient.setup
         * @see NodeGameClient.registerSetup
         *
         * @api private
         */
        this._setup = {};

        /**
         * ### node._env
         *
         * Object containing registered environmental variables
         *
         * @see NodeGameClient.setup.env
         * @see NodeGameClient.env
         *
         * @api private
         */
        this._env = {};

        // ## Configuration.

        // ### Setup functions.
        this.addDefaultSetupFunctions();
        // ### Aliases.
        this.addDefaultAliases();
        // ### Listeners.
        this.addDefaultIncomingListeners();
        this.addDefaultInternalListeners();

        this.info('node: object created.');
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
 ,  'undefined' != typeof node ? node : module.parent.exports
);
