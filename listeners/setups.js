/**
 * # setups
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Listeners for incoming messages
 *
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var J = parent.JSUS;

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
         * ### setup("nodegame")
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
                throw new TypeError('node.setup("nodegame"): options must ' +
                                    'object or undefined.');
            }
            options = options || {};
            for (i in this._setup) {
                if (this._setup.hasOwnProperty(i) &&
                    'function' === typeof this._setup[i]) {

                    // Old Operas loop over the prototype property as well.
                    if (i !== 'nodegame' && i !== 'prototype') {

                        // Like this browsers do not complain in strict mode.
                        setupOptions = 'undefined' === typeof options[i] ?
                            undefined : options[i];

                        this.conf[i] = this._setup[i].call(this, setupOptions);
                    }
                }
            }
        });

        /**
         * ### setup("socket")
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
         * ### setup("host")
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
                    throw new TypeError('node.setup("host"): if set, host ' +
                                        'must be string. Found: ' + host);
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
         * ### setup("verbosity")
         *
         * Sets the verbosity level for nodegame
         */
        this.registerSetup('verbosity', function(level) {
            if ('undefined' === typeof level) return this.verbosity;
            if ('string' === typeof level) {
                if (!constants.verbosity_levels.hasOwnProperty(level)) {
                    throw new Error('setup("verbosity"): level not found: ' +
                                    level);
                }
                this.verbosity = constants.verbosity_levels[level];
            }
            else if ('number' === typeof level) {
                this.verbosity = level;
            }
            else {
                throw new TypeError('node.setup("verbosity"): level must be ' +
                                    'number or string. Found: ' + level);
            }
            return level;
        });

        /**
         * ### setup("nodename")
         *
         * Sets the name for nodegame
         */
        this.registerSetup('nodename', function(newName) {
            newName = newName || constants.nodename;
            if ('string' !== typeof newName) {
                throw new TypeError('setup("nodename"): newName must be ' +
                                    'string. Found: ' + newName);
            }
            this.nodename = newName;
            return newName;
        });

        /**
         * ### setup("debug")
         *
         * Sets the debug flag for nodegame
         */
        this.registerSetup('debug', function(enable) {
            enable = !!enable || false;
            this.debug = enable;
            return enable;
        });

        /**
         * ### setup("env")
         *
         * Setups environmental variables to be accessible in `node.env`
         */
        this.registerSetup('env', function(conf) {
            var i;
            if ('undefined' === typeof conf) return;
            if ('object' !== typeof conf) {
                throw new TypeError('node.setup("env"): conf must be object ' +
                                    'or undefined. Found: ' + conf);
            }
            for (i in conf) {
                if (conf.hasOwnProperty(i)) {
                    this._env[i] = conf[i];
                }
            }
            return conf;
        });

        /**
         * ### setup("events")
         *
         * Configure the EventEmitter object
         *
         * @see node.EventEmitter
         */
        this.registerSetup('events', function(conf) {
            if (conf) {
                if ('object' !== typeof conf) {
                    throw new TypeError('node.setup("events"): conf must be ' +
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
         * ### setup("settings")
         *
         * Sets up `node.game.settings`
         */
        this.registerSetup('settings', function(settings) {
            if ('undefined' !== typeof settings) {
                if ('object' !== typeof settings) {
                    throw new TypeError('node.setup("settings"): settings ' +
                                        'must be object or undefined. Found: ' +
                                        settings);
                }
                J.mixin(this.game.settings, settings);
            }
            return this.game.settings;
        });

        /**
         * ### setup("metadata")
         *
         * Sets up `node.game.metadata`
         */
        this.registerSetup('metadata', function(metadata) {
            if ('undefined' !== typeof metadata) {
                if ('object' !== typeof metadata) {
                    throw new TypeError('node.setup("metadata"): metadata ' +
                                        'must be object or undefined. Found: ' +
                                        metadata);
                }
                J.mixin(this.game.metadata, metadata);
            }
            return this.game.metadata;
        });

        /**
         * ### setup("player")
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
                    throw new TypeError('setup("player"): player must ' +
                                        'be object or undefined. Found: ' +
                                        player);
                }
                this.createPlayer(player);
            }
            return this.player;
        });

        /**
         * ### setup("lang")
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
                else if ('string' === typeof lang || 'object' === typeof lang) {
                    this.setLanguage(lang);
                }
                else {
                    throw new TypeError('setup("lang"): lang must be string, ' +
                                        'array, object or undefined. Found: ' +
                                        lang);
                }
            }
            return this.player.lang;
        });

        (function(node) {

            /**
             * ### setup("timer")
             *
             * Setup a timer object
             *
             * Accepts one configuration parameter of the type:
             *
             *  - name: name of the timer. Default: node.game.timer.name
             *  - options: configuration options to pass to the init method
             *  - action: an action to call on the timer (start, stop, etc.)
             *
             * @see node.timer
             * @see node.GameTimer
             */
            node.registerSetup('timer', function(opts) {
                var i, len, res;
                if (!opts) return;
                if ('object' !== typeof opts) {
                    throw new TypeError('setup("timer"): opts must object or ' +
                                        'undefined. Found: ' + opts);
                }
                if (J.isArray(opts)) {
                    res = true;
                    i = -1, len = opts.length;
                    for ( ; ++i < len ; ) {
                        res = res && setupTimer(opts[i]);
                    }
                }
                else {
                    res = setupTimer(opts);
                }

                // Last configured timer options, or null if an error occurred.
                return res ? opts : null;
            });

            // Helper function to setup a single timer.
            function setupTimer(opts) {
                var name, timer;
                name = opts.name || node.game.timer.name;
                timer = node.timer.getTimer(name);

                if (!timer) {
                    node.warn('setup("timer"): timer not found: ' + name);
                    return false;
                }

                if (opts.options) timer.init(opts.options);

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

                return true;
            }

        })(this);

        /**
         * ### setup("plot")
         *
         * Updates the `node.game.plot` object
         *
         * It can either replace entirely the current plot object,
         * append to it, or update single properties.
         *
         * @param {object} stagerState The update for the stager. Depending
         *   on the rule, it will be passed to `Stager.setState`, or to
         *   `GamePlot.setStepProperty`, `GamePlot.setStageProperty`.
         * @param {string} rule Optional. The update rule. Valid rules:
         *
         *    - 'replace', **default**
         *    - 'append',
         *    - 'updateStep',
         *    - 'updateStage'.
         *
         * @param {string} rule Optional. Accepted: <replace>, <append>,
         *   Default: 'replace'
         *
         * @see node.game.plot
         * @see Stager.setState
         *
         * TODO: check if all options work as described.
         */
        this.registerSetup('plot', function(stagerState, rule, gameStage) {
            var plot, prop;
            stagerState = stagerState || {};
            plot = this.game.plot;
            rule = rule || 'replace';
            switch(rule) {
            case 'replace':
            case 'append':
                plot.stager.setState(stagerState, rule);
                break;
            case 'tmpCache':
                for (prop in stagerState) {
                    if (stagerState.hasOwnProperty(prop)) {
                        plot.tmpCache(prop, stagerState[prop]);
                    }
                }
                break;
            case 'updateStep':
                gameStage = gameStage || this.game.getCurrentGameStage();
                for (prop in stagerState) {
                    if (stagerState.hasOwnProperty(prop)) {
                        plot.setStepProperty(gameStage, prop,
                                             stagerState[prop]);
                    }
                }
                break;
            case 'updateStage':
                gameStage = gameStage || this.game.getCurrentGameStage();
                for (prop in stagerState) {
                    if (stagerState.hasOwnProperty(prop)) {
                        plot.setStageProperty(gameStage, prop,
                                              stagerState[prop]);
                    }
                }
                break;
            default:
                throw new Error('setup("plot"): invalid rule: ' + rule);
            }
            return this.game.plot.stager;
        });

        (function(node) {

            /**
             * ### setup("plist")
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
             * ### setup("mlist")
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
                    throw new Error('setup("' + dstListName + '") is invalid ' +
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
