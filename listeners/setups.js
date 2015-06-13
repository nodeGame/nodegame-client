/**
 * # setups
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Listeners for incoming messages
 *
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var GameMsg = parent.GameMsg,
    GameSage = parent.GameStage,
    PlayerList = parent.PlayerList,
    Player = parent.Player,
    J = parent.JSUS;

    /**
     * ## NodeGameClient.addDefaultSetupFunctions
     *
     * Adds a battery of setup functions
     *
     * Setup functions also add a listener on `in.say.SETUP` for remote setup
     *
     * @param {boolean} force Whether to force re-adding the listeners
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultSetupFunctions = function(force) {

        if (this.conf.setupsAdded && !force) {
            this.err('node.addDefaultSetups: setup functions already ' +
                     'added. Use the force flag to re-add.');
            return false;
        }

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
                if (this.setup.hasOwnProperty(i) &&
                    'function' === typeof this.setup[i]) {

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

        (function(node) {

            /**
             * ### node.setup.plist
             *
             * Updates the player list in Game
             *
             * @param {PlayerList} playerList The new player list
             * @param {string} updateRule Optional. Accepted: <replace>,
             *   <append>. Default: 'replace'
             */
            node.registerSetup('plist', function(playerList, updateRule) {
                updatePlayerList.call(this, 'pl', playerList, updateRule);
            });

            /**
             * ### this.setup.mlist
             *
             * Updates the monitor list in Game
             *
             * @param {PlayerList} monitorList The new monitor list
             * @param {string} updateRule Optional. Accepted: <replace>,
             *   <append>. Default: 'replace'
             */
            node.registerSetup('mlist', function(monitorList, updateRule) {
                updatePlayerList.call(this, 'ml', monitorList, updateRule);
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
                    this.warn('updatePlayerList: invalid dstListName.');
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
        })(this);

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

        this.conf.setupsAdded = true;
        this.silly('node: setup functions added.');
        return true;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
