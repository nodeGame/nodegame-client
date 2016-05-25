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

    var J = parent.JSUS,
    GamePlot = parent.GamePlot,
    Stager = parent.Stager;

    var constants = parent.constants;

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
                    if (i !== 'nodegame' && i !== 'prototype') {
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
            if ('undefined' === typeof conf) return;
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
         *
         * TODO: what happens if there is a basedir?
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
                if ('string' !== typeof host) {
                    throw new TypeError('node.setup.host: if set, host must ' +
                                        'be string. Found: ' + host);
                }
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
            if ('undefined' === typeof level) return this.verbosity;
            if ('string' === typeof level) {
                if (!constants.verbosity_levels.hasOwnProperty(level)) {
                    throw new Error('node.setup.verbosity: level not found: ' +
                                    level);
                }
                this.verbosity = constants.verbosity_levels[level];
            }
            else if ('number' === typeof level) {
                this.verbosity = level;
            }
            else {
                throw new TypeError('node.setup.verbosity: level must be ' +
                                    'number or string. Found: ' + level);
            }
            return level;
        });

        /**
         * ### node.setup.nodename
         *
         * Sets the name for nodegame
         */
        this.registerSetup('nodename', function(newName) {
            newName = newName || constants.nodename;
            if ('string' !== typeof newName) {
                throw new TypeError('node.setup.nodename: newName must be ' +
                                    'string. Found: ' + newName);
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
            enable = !!enable || false;
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
            if ('undefined' === typeof conf) return;
            if ('object' !== typeof conf) {
                throw new TypeError('node.setup.env: conf must be object ' +
                                    'or undefined. Found: ' + conf);
            }
            for (i in conf) {
                if (conf.hasOwnProperty(i)) {
                    this.env[i] = conf[i];
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
            if (conf) {
                if ('object' !== typeof conf) {
                    throw new TypeError('node.setup.events: conf must be ' +
                                        'object or undefined. Found: ' + conf);
                }
            }
            else {
                conf = {};
            }
            if ('undefined' === typeof conf.history) {
                conf.history = this.conf.history || false;
            }
            if ('undefined' === typeof conf.dumpEvents) {
                conf.dumpEvents = this.conf.dumpEvents || false;
            }
            return conf;
        });

        /**
         * ### node.setup.game_settings
         *
         * Sets up `node.game.settings`
         */
        this.registerSetup('settings', function(settings) {
            if ('undefined' !== typeof settings) {
                if ('object' !== typeof settings) {
                    throw new TypeError('node.setup.settings: settings must ' +
                                        'be object or undefined. Found: ' +
                                        settings);
                }
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
            if ('undefined' !== typeof metadata) {
                if ('object' !== typeof metadata) {
                    throw new TypeError('node.setup.metadata: metadata must ' +
                                        'be object or undefined. Found: ' +
                                        metadata);
                }
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
         * @see node.player
         * @see node.createPlayer
         */
        this.registerSetup('player', function(player) {
            if ('undefined' !== typeof player) {
                if ('object' !== typeof player) {
                    throw new TypeError('node.setup.player: player must ' +
                                        'be object or undefined. Found: ' +
                                        player);
                }
                this.createPlayer(player);
            }
            return this.player;
        });

        /**
         * ### node.setup.lang
         *
         * Setups the language of the client
         *
         * The `lang` parameter can either be an array containing
         * input parameters for the method `setLanguage`, or an object,
         * and in that case, it is only the first parameter (the language
         * object).
         *
         * @see node.player
         * @see node.setLanguage
         */
        this.registerSetup('lang', function(lang) {
            if ('undefined' !== typeof lang) {
                if (J.isArray(lang)) {
                    this.setLanguage(lang[0], lang[1]);
                }
                else if ('string' === typeof lang) {
                    this.setLanguage(lang);
                }
                else {
                    throw new TypeError('node.setup.lang: lang must be ' +
                                        'string, array, or undefined. Found: ' +
                                        lang);
                }
            }
            return this.player.lang;
        });

        /**
         * ### node.setup.timer
         *
         * Setup a timer object
         *
         * Accepts one configuration parameter of the type:
         *
         *  - name: name of the timer. Default: node.game.timer.name
         *  - options: configuration options to pass to the init method
         *  - action: an action to call on the timer (e.g. start, stop, etc.)
         *
         * @see node.timer
         * @see node.GameTimer
         */
        this.registerSetup('timer', function(opts) {
            var name, timer;
            if (!opts) return;
            if ('object' !== typeof opts) {
                throw new TypeError('node.setup.timer: opts must object or ' +
                                    'undefined. Found: ' + opts);
            }
            name = opts.name || node.game.timer.name;
            if ('string' !== typeof name) {
                throw new TypeError('node.setup.timer: name must string ' +
                                   'or undefined. Found: ' + name);
            }
            timer = this.timer.timers[name];
            if (!timer) {
                this.warn('node.setup.timer: timer not found: ' + name);
                return null;
            }

            if (opts.options) {
                timer.init(opts.options);
            }

            switch (opts.action) {
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
            return opts;
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
            stagerState = stagerState || {};

            this.game.plot.stager.setState(stagerState, updateRule);

            return this.game.plot.stager;
        });

        (function(node) {

            /**
             * ### node.setup.plist
             *
             * Updates the player list in Game
             *
             * @param {PlayerList} list The new player list
             * @param {string} updateRule Optional. Accepted: <replace>,
             *   <append>. Default: 'replace'
             */
            node.registerSetup('plist', function(list, updateRule) {
                return updatePlayerList.call(this, 'pl', list, updateRule);
            });

            /**
             * ### this.setup.mlist
             *
             * Updates the monitor list in Game
             *
             * @param {PlayerList} list The new monitor list
             * @param {string} updateRule Optional. Accepted: <replace>,
             *   <append>. Default: 'replace'
             */
            node.registerSetup('mlist', function(list, updateRule) {
                return updatePlayerList.call(this, 'ml', list, updateRule);
            });

            // Utility for setup.plist and setup.mlist:
            function updatePlayerList(dstListName, srcList, updateRule) {
                var dstList;
                // Initial setup call. Nothing to do.
                if (!srcList && !updateRule) return;

                dstList = dstListName === 'pl' ? this.game.pl : this.game.ml;
                updateRule = updateRule || 'replace';

                if (updateRule === 'replace') {
                    dstList.clear(true);
                }
                else if (updateRule !== 'append') {
                    throw new Error('setup.' + dstListName + 'ist: invalid ' +
                                    'updateRule: ' + updateRule + '.');
                }

                // Import clients (if any).
                // Automatic cast from Object to Player.
                if (srcList) dstList.importDB(srcList);

                return { updateRule: updateRule, list: srcList };
            }
        })(this);

        this.conf.setupsAdded = true;
        this.silly('node: setup functions added.');
        return true;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
