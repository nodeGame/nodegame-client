/**
 * # nodeGame: Social Experiments in the Browser!
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` is a free, open source javascript framework for on line,
 * multiplayer games in the browser.
 * ---
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
        J = parent.JSUS;

    /**
     * ## NodeGameClient constructor
     *
     * Creates a new NodeGameClient object.
     */       
    function NodeGameClient() {
        
        var that = this;
        
        /**
         * ### node.verbosity_levels
         *
         * ALWAYS, ERR, WARN, INFO, DEBUG
         */
        this.verbosity_levels = {
            ALWAYS: -(Number.MIN_VALUE + 1),
            ERR: -1,
            WARN: 0,
            INFO: 1,
            SILLY: 10,
            DEBUG: 100,
            NEVER: Number.MIN_VALUE - 1
        };

        /**
         * ### node.verbosity
         *
         * The minimum level for a log entry to be displayed as output
         *
         * Defaults, only errors are displayed.
         */
        this.verbosity = this.verbosity_levels.WARN;

        /**
         * ### node.nodename
         *
         * The name of this node, used in logging output
         *
         * Defaults, 'ng'
         */
        this.nodename = 'ng';

        /**
         * ### node.remoteVerbosity
         *
         * The minimum level for a log entry to be reported to the server
         *
         * Defaults, only errors are reported.
         *
         * @experimental
         */
        this.remoteVerbosity = this.verbosity_levels.WARN;

        /**
         * ### node.errorManager
         *
         * Catches run-time errors.
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

        /**
         * ### node.setup.nodegame
         *
         * Runs all the registered configuration functions
         *
         * Matches the keys of the configuration objects with the name of the registered
         * functions and executes them. If no match is found, the configuration function
         * will set the default values.
         */
        this.registerSetup('nodegame', function(options) {
            options = options || {};
            for (var i in this.setup) {
                if (this.setup.hasOwnProperty(i)) {
                    if (i !== 'register' && i !== 'nodegame') {
                        this.conf[i] = this.setup[i].call(this, options[i]);
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
         * If no value is passed, it will try to set the host from the window object
         * in the browser enviroment.
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
            if ('undefined' !== typeof level) {
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
            if ('undefined' !== typeof conf) {
                for (var i in conf) {
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
         * ### node.setup.window
         *
         * Configure the node.window object, if existing
         *
         * TODO: move in GameWindow
         *
         * @see GameWindow
         */
        this.registerSetup('window', function(conf) {
            if (!this.window) {
                this.warn('node.setup.window: window not found, ' +
                          'are you in a browser?');
                return;
            }
            conf = conf || {};
            if ('undefined' === typeof conf.promptOnleave) {
                conf.promptOnleave = false;
            }

            if ('undefined' === typeof conf.noEscape) {
                conf.noEscape = true;
            }

            this.window.init(conf);

            return conf;
        });


        /**
         * ### node.setup.game_settings
         *
         * Sets up `node.game.settings`
         */
        this.registerSetup('game_settings', function(settings) {
            if (!this.game) {
                this.warn("register('game_settings') called before node.game was initialized");
                throw new node.NodeGameMisconfiguredGameError("node.game non-existent");
            }

            if (settings) {
                J.mixin(this.game.settings, settings);
            }

            return this.game.settings;
        });

        /**
         * ### node.setup.game_metadata
         *
         * Sets up `node.game.metadata`
         */
        this.registerSetup('game_metadata', function(metadata) {
            if (!this.game) {
                this.warn("register('game_metadata') called before node.game was initialized");
                throw new node.NodeGameMisconfiguredGameError("node.game non-existent");
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
            if (!player) {
                return null;
            }

            return this.createPlayer(player);
        });

        /**
         * ### node.setup.plot
         *
         * Creates the `node.game.plot` object
         *
         * @param {object} stagerState Stager state which is passed to `Stager.setState`
         * @param {string} updateRule Optional. Whether to 'replace' (default) or
         *  to 'append'.
         *
         * @see node.game.plot
         * @see Stager.setState
         */
        this.registerSetup('plot', function(stagerState, updateRule) {
            if (!this.game) {
                this.warn("register('plot') called before node.game was initialized");
                throw new node.NodeGameMisconfiguredGameError("node.game non-existent");
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
         * @param {string} updateRule Optional. Whether to 'replace' (default) or
         *  to 'append'.
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
         * @param {string} updateRule Optional. Whether to 'replace' (default) or
         *  to 'append'.
         */
        this.registerSetup('mlist', function(monitorList, updateRule) {
            updatePlayerList.call(this, 'ml', monitorList, updateRule);
        });

        // Utility for setup.plist and setup.mlist:
        function updatePlayerList(dstListName, srcList, updateRule) {
            var dstList;

            if (!this.game) {
                this.warn('updatePlayerList called before node.game was initialized');
                throw new this.NodeGameMisconfiguredGameError('node.game non-existent');
            }

            if (dstListName === 'pl')      dstList = this.game.pl;
            else if (dstListName === 'ml') dstList = this.game.ml;
            else {
                this.warn('updatePlayerList called with invalid dstListName');
                throw new this.NodeGameMisconfiguredGameError("invalid dstListName");
            }

            if (!dstList) {
                this.warn('updatePlayerList called before node.game was initialized');
                throw new this.NodeGameMisconfiguredGameError('dstList non-existent');
            }

            if (srcList) {
                if (!updateRule || updateRule === 'replace') {
                    dstList.clear(true);
                }
                else if (updateRule !== 'append') {
                    throw new this.NodeGameMisconfiguredGameError(
                        "register('plist') got invalid updateRule");
                }

                // automatic cast from Object to Player
                dstList.importDB(srcList);
            }

            return dstList;
        }


        // ALIAS


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

        // ### node.on.stepdone
        this.alias('stepdone', 'UPDATED_PLIST', function(cb) {
            return function() {
                if (that.game.shouldStep()) {
                    cb.call(that.game, that.game.pl);
                }
            };
        });
        // LISTENERS

        this.addDefaultIncomingListeners();
        this.addDefaultInternalListeners();
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
 ,  'undefined' != typeof node ? node : module.parent.exports
);
