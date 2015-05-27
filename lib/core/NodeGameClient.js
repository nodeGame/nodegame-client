/**
 * # NodeGameClient
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * nodeGame: Social Experiments in the Browser!
 *
 * `nodeGame` is a free, open source javascript framework for online,
 * multiplayer games in the browser.
 */
(function(exports, parent) {

    "use strict";

    // ## Exposing Class
    exports.NodeGameClient = NodeGameClient;

    var ErrorManager = parent.ErrorManager,
        EventEmitterManager = parent.EventEmitterManager,
        EventEmitter = parent.EventEmitter,
        GameMsgGenerator = parent.GameMsgGenerator,
        Socket = parent.Socket,
        GameStage = parent.GameStage,
        GameMsg = parent.GameMsg,
        Game = parent.Game,
        Timer = parent.Timer,
        Player = parent.Player,
        GameSession = parent.GameSession,
        J = parent.JSUS,
        constants = parent.constants;

    /**
     * ## NodeGameClient constructor
     *
     * Creates a new NodeGameClient object
     */
    function NodeGameClient() {
        var that = this;

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
         * Instance of the EventEmitter class
         *
         * Takes care of emitting the events and calling the
         * proper listener functions
         *
         * @see EventEmitter
         */
        this.events = new EventEmitterManager(this);

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
         */
        this.session = new GameSession(this);

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
         * ### node.game
         *
         * Instance of node.Game
         *
         * @see Game
         */
        this.game = new Game(this);

        /**
         * ### node.timer
         *
         * Instance of node.Timer
         *
         * @see Timer
         */
        this.timer = new Timer(this);

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

        // ## Configuration functions

        this.info('node: registering setup functions.');

        /**
         * ### node.setup.nodegame
         *
         * Runs all the registered configuration functions
         *
         * Matches the keys of the configuration objects with the name
         * of the registered functions and executes them.
         * If no match is found, the configuration function will set
         * the default values.
         *
         * @param {object} options The configuration object
         */
        this.registerSetup('nodegame', function(options) {
            var i, setupOptions;
            if (options && 'object' !== typeof options) {
                throw new TypeError('node.setup.nodegame: options must ' +
                                    'object or undefined.');
            }
            options = options || {};
            for (i in this.setup) {
                if (this.setup.hasOwnProperty(i)) {
                    // Old Operas loop over the prototype property as well.
                    if (i !== 'register' &&
                        i !== 'nodegame' &&
                        i !== 'prototype') {
                        // Like this browsers do not complain in strict mode.
                        setupOptions = 'undefined' === typeof options[i] ?
                            undefined : options[i];
                        this.conf[i] = this.setup[i].call(this, setupOptions);
                    }
                }
            }
        });

        /**
         * ### node.setup.socket
         *
         * Configures the socket connection to the nodegame-server
         *
         * @see node.Socket
         * @see node.SocketFactory
         */
        this.registerSetup('socket', function(conf) {
            if (!conf) return;
            this.socket.setup(conf);
            return conf;
        });

        /**
         * ### node.setup.host
         *
         * Sets the uri of the host
         *
         * If no value is passed, it will try to set the host from
         * the window object in the browser enviroment.
         */
        this.registerSetup('host', function(host) {
            var tokens;
            // URL
            if (!host) {
                if ('undefined' !== typeof window) {
                    if ('undefined' !== typeof window.location) {
                        host = window.location.href;
                    }
                }
            }

            if (host) {
                tokens = host.split('/').slice(0,-2);
                // url was not of the form '/channel'
                if (tokens.length > 1) {
                    host = tokens.join('/');
                }

                // Add a trailing slash if missing
                if (host.lastIndexOf('/') !== host.length) {
                    host = host + '/';
                }
            }

            return host;
        });

        /**
         * ### node.setup.verbosity
         *
         * Sets the verbosity level for nodegame
         */
        this.registerSetup('verbosity', function(level) {
            if ('string' === typeof level &&
                constants.verbosity_levels.hasOwnProperty(level)) {

                this.verbosity = constants.verbosity_levels[level];
            }
            else if ('number' === typeof level) {
                this.verbosity = level;
            }
            return level;
        });

        /**
         * ### node.setup.nodename
         *
         * Sets the name for nodegame
         */
        this.registerSetup('nodename', function(newName) {
            newName = newName || 'ng';
            if ('string' !== typeof newName) {
                throw new TypeError('node.nodename must be of type string.');
            }
            this.nodename = newName;
            return newName;
        });

        /**
         * ### node.setup.debug
         *
         * Sets the debug flag for nodegame
         */
        this.registerSetup('debug', function(enable) {
            enable = enable || false;
            if ('boolean' !== typeof enable) {
                throw new TypeError('node.debug must be of type boolean.');
            }
            this.debug = enable;
            return enable;
        });

        /**
         * ### node.setup.env
         *
         * Defines global variables to be stored in `node.env[myvar]`
         */
        this.registerSetup('env', function(conf) {
            var i;
            if ('undefined' !== typeof conf) {
                for (i in conf) {
                    if (conf.hasOwnProperty(i)) {
                        this.env[i] = conf[i];
                    }
                }
            }

            return conf;
        });

        /**
         * ### node.setup.events
         *
         * Configure the EventEmitter object
         *
         * @see node.EventEmitter
         */
        this.registerSetup('events', function(conf) {
            conf = conf || {};
            if ('undefined' === typeof conf.history) {
                conf.history = false;
            }

            if ('undefined' === typeof conf.dumpEvents) {
                conf.dumpEvents = false;
            }

            return conf;
        });

        /**
         * ### node.setup.game_settings
         *
         * Sets up `node.game.settings`
         */
        this.registerSetup('settings', function(settings) {
            if (!this.game) {
                this.warn('setup("settings") called before ' +
                          'node.game was initialized.');
                throw new node.NodeGameMisconfiguredGameError(
                    "node.game non-existent");
            }

            if (settings) {
                J.mixin(this.game.settings, settings);
            }

            return this.game.settings;
        });

        /**
         * ### node.setup.metadata
         *
         * Sets up `node.game.metadata`
         */
        this.registerSetup('metadata', function(metadata) {
            if (!this.game) {
                this.warn('setup("metadata") called before ' +
                          'node.game was initialized');
                throw new node.NodeGameMisconfiguredGameError(
                    "node.game non-existent");
            }

            if (metadata) {
                J.mixin(this.game.metadata, metadata);
            }

            return this.game.metadata;
        });

        /**
         * ### node.setup.player
         *
         * Creates the `node.player` object
         *
         * @see node.Player
         * @see node.createPlayer
         */
        this.registerSetup('player', function(player) {
            if (!player) return null;
            return this.createPlayer(player);
        });

        /**
         * ### node.setup.timer
         *
         * Setup a timer object
         *
         * @see node.timer
         * @see node.GameTimer
         */
        this.registerSetup('timer', function(name, data) {
            var timer;
            if (!name) return null;
            timer = this.timer.timers[name];
            if (!timer) return null;
            if (timer.options) {
                timer.init(data.options);
            }

            switch (timer.action) {
            case 'start':
                timer.start();
                break;
            case 'stop':
                timer.stop();
                break;
            case 'restart':
                timer.restart();
                break;
            case 'pause':
                timer.pause();
                break;
            case 'resume':
                timer.resume();
            }

            // Last configured timer options.
            return {
                name: name,
                data: data
            };
        });

        /**
         * ### node.setup.plot
         *
         * Creates the `node.game.plot` object
         *
         * It can either replace current plot object, or append to it.
         * Updates are not possible for the moment.
         *
         * TODO: allows updates in plot.
         *
         * @param {object} stagerState Stager state which is passed
         *   to `Stager.setState`
         * @param {string} updateRule Optional. Accepted: <replace>, <append>.
         *   Default: 'replace'
         *
         * @see node.game.plot
         * @see Stager.setState
         */
        this.registerSetup('plot', function(stagerState, updateRule) {
            if (!this.game) {
                throw new Error("node.setup.plot: node.game not found.");
            }

            stagerState = stagerState || {};

            if (!this.game.plot) {
                this.game.plot = new GamePlot();
            }

            if (!this.game.plot.stager) {
                this.game.plot.stager = new Stager();
            }

            this.game.plot.stager.setState(stagerState, updateRule);

            return this.game.plot;
        });

        /**
         * ### node.setup.plist
         *
         * Updates the player list in Game
         *
         * @param {PlayerList} playerList The new player list
         * @param {string} updateRule Optional. Accepted: <replace>, <append>.
         *   Default: 'replace'
         */
        this.registerSetup('plist', function(playerList, updateRule) {
            updatePlayerList.call(this, 'pl', playerList, updateRule);
        });

        /**
         * ### this.setup.mlist
         *
         * Updates the monitor list in Game
         *
         * @param {PlayerList} monitorList The new monitor list
         * @param {string} updateRule Optional. Accepted: <replace>, <append>.
         *   Default: 'replace'
         */
        this.registerSetup('mlist', function(monitorList, updateRule) {
            updatePlayerList.call(this, 'ml', monitorList, updateRule);
        });

        /**
         * ### this.setup.lang
         *
         * Sets the default language
         *
         * @param {object} language The language object to set as default.
         */
        this.registerSetup('lang', function(language) {
            if (!language) return null;
            return this.setLanguage(language);
        });

        // Utility for setup.plist and setup.mlist:
        function updatePlayerList(dstListName, srcList, updateRule) {
            var dstList;

            if (!this.game) {
                this.warn('updatePlayerList called before ' +
                          'node.game was initialized.');
                throw new this.NodeGameMisconfiguredGameError(
                    'node.game non-existent.');
            }

            if (dstListName === 'pl')      dstList = this.game.pl;
            else if (dstListName === 'ml') dstList = this.game.ml;
            else {
                this.warn('updatePlayerList called with invalid dstListName.');
                throw new this.NodeGameMisconfiguredGameError(
                    "invalid dstListName.");
            }

            if (!dstList) {
                this.warn('updatePlayerList called before ' +
                          'node.game was initialized.');
                throw new this.NodeGameMisconfiguredGameError(
                    'dstList non-existent.');
            }

            if (srcList) {
                if (!updateRule || updateRule === 'replace') {
                    dstList.clear(true);
                }
                else if (updateRule !== 'append') {
                    throw new this.NodeGameMisconfiguredGameError(
                        "setup('plist') got invalid updateRule.");
                }

                // automatic cast from Object to Player
                dstList.importDB(srcList);
            }

            return dstList;
        }

        this.info('node: adding emit/on functions.');

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


        // ADD ALIASES

        // TODO: move aliases into a separate method,
        // like addDefaultIncomingListeners
        this.info('node: adding default alias.');

        // ### node.on.txt
        this.alias('txt', 'in.say.TXT');

        // ### node.on.data
        this.alias('data', ['in.say.DATA', 'in.set.DATA'], function(text, cb) {
            return function(msg) {
                if (msg.text === text) {
                    cb.call(that.game, msg);
                }
            };
        });

        // ### node.on.stage
        this.alias('stage', 'in.set.STAGE');

        // ### node.on.plist
        this.alias('plist', ['in.set.PLIST', 'in.say.PLIST']);

        // ### node.on.pconnect
        this.alias('pconnect', 'in.say.PCONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.pdisconnect
        this.alias('pdisconnect', 'in.say.PDISCONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.preconnect
        this.alias('preconnect', 'in.say.PRECONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.mconnect
        this.alias('mconnect', 'in.say.MCONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.mreconnect
        this.alias('mreconnect', 'in.say.MRECONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.mdisconnect
        this.alias('mdisconnect', 'in.say.MDISCONNECT', function(cb) {
            return function(msg) {
                cb.call(that.game, msg.data);
            };
        });

        // ### node.on.stepdone
        // Uses the step rule to determine when a step is DONE.
        this.alias('stepdone', 'UPDATED_PLIST', function(cb) {
            return function() {
                if (that.game.shouldStep()) {
                    cb.call(that.game, that.game.pl);
                }
            };
        });

        // ### node.on.lang
        // Gets language information.
        this.alias('lang','in.say.LANG');

        // LISTENERS.
        this.info('node: adding default listeners.');

        this.addDefaultIncomingListeners();
        this.addDefaultInternalListeners();

        this.info('node: created.');
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
 ,  'undefined' != typeof node ? node : module.parent.exports
);
