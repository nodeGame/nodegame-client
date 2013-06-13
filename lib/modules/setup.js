/**
 * # Setup
 *
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` configuration module
 *
 * ---
 *
 */

(function(exports, node) {

// ## Global scope

var GameMsg = node.GameMsg,
    Player = node.Player,
    Game = node.Game,
    GamePlot = node.GamePlot,
    Stager = node.Stager,
    GameMsgGenerator = node.GameMsgGenerator,
    J = node.JSUS;

// TODO: check this
var frozen = false;

/**
 * ### node.setup
 *
 * Setups the nodeGame object
 *
 * Configures a specific feature of nodeGame and and stores
 * the settings in `node.conf`.
 *
 * Accepts any number of extra parameters that are passed to the callback
 * function.
 *
 * See the examples folder for all available configuration options.
 *
 * @param {string} property The feature to configure
 * @return {boolean} TRUE, if configuration is successful
 *
 * @see node.setup.register
 *
 */
node.setup = function(property) {
    var res;

    if (frozen) {
        node.err('nodeGame configuration is frozen. No modification allowed.');
        return false;
    }

    if (property === 'register') {
        node.warn('cannot setup property "register"');
        return false;
    }

    if (!node.setup[property]) {
        node.warn('no such property to configure: ' + property);
        return false;
    }

    // Setup the property using rest of arguments:
    res = node.setup[property].apply(exports, Array.prototype.slice.call(arguments, 1));

    if (property !== 'nodegame') {
        node.conf[property] = res;
    }

    return true;
};

/**
 * ### node.setup.register
 *
 * Registers a configuration function
 *
 * An incoming event listener in.say.SETUP is added automatically.
 *
 * @param {string} property The feature to configure
 * @param {mixed} options The value of the option to configure
 * @return{boolean} TRUE, if configuration is successful
 *
 * @see node.setup
 */
node.setup.register = function(property, func) {
    if (!property || !func) {
        node.err('cannot register empty setup function');
        return false;
    }

    if (property === 'register') {
        node.err('cannot overwrite register function');
        return false;
    }

    node.setup[property] = func;
    return true;
};

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
node.setup.register('nodegame', function(options) {
    for (var i in node.setup) {
        if (node.setup.hasOwnProperty(i)) {
            if (i !== 'register' && i !== 'nodegame') {
                node.conf[i] = node.setup[i].call(exports, options[i]);
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
node.setup.register('socket', function(conf) {
    if (!conf) return;
    node.socket.setup(conf);
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
node.setup.register('host', function(host) {
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
node.setup.register('verbosity', function(level) {
    if ('undefined' !== typeof level) {
        node.verbosity = level;
    }
    return level;
});

/**
 * ### node.setup.verbosity
 *
 * Sets the verbosity level for nodegame
 */
node.setup.register('debug', function(enable) {
    enable = enable || false;
    if ('boolean' !== typeof enable) {
        throw new TypeError("node.debug must be of type boolean");
    }
    node.debug = enable;
    return enable;
});

/**
 * ### node.setup.env
 *
 * Defines global variables to be stored in `node.env[myvar]`
 */
node.setup.register('env', function(conf) {
    if ('undefined' !== typeof conf) {
        for (var i in conf) {
            if (conf.hasOwnProperty(i)) {
                node.env[i] = conf[i];
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
node.setup.register('events', function(conf) {
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
 * @see GameWindow
 */
node.setup.register('window', function(conf) {
    if (!node.window) {
        node.warn('node.window not found, cannot configure it.');
        return;
    }
    conf = conf || {};
    if ('undefined' === typeof conf.promptOnleave) {
        conf.promptOnleave = false;
    }

    if ('undefined' === typeof conf.noEscape) {
        conf.noEscape = true;
    }

    node.window.init(conf);

    return conf;
});


/**
 * ### node.setup.game_settings
 *
 * Sets up `node.game.settings`
 */
node.setup.register('game_settings', function(settings) {
    if (!node.game) {
        node.warn("register('game_settings') called before node.game was initialized");
        throw new NodeGameMisconfiguredGameError("node.game non-existent");
    }

    if (settings) {
        J.mixin(node.game.settings, settings);
    }

    return node.game.settings;
});

/**
 * ### node.setup.game_metadata
 *
 * Sets up `node.game.metadata`
 */
node.setup.register('game_metadata', function(metadata) {
    if (!node.game) {
        node.warn("register('game_metadata') called before node.game was initialized");
        throw new NodeGameMisconfiguredGameError("node.game non-existent");
    }

    if (metadata) {
        J.mixin(node.game.metadata, metadata);
    }

    return node.game.metadata;
});

/**
 * ### node.setup.player
 *
 * Creates the `node.player` object
 *
 * @see node.Player
 * @see node.createPlayer
 */
node.setup.register('player', function(player) {
    if (!player) {
        return null;
    }

    return node.createPlayer(player);
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
node.setup.register('plot', function(stagerState, updateRule) {
    if (!node.game) {
        node.warn("register('plot') called before node.game was initialized");
        throw new NodeGameMisconfiguredGameError("node.game non-existent");
    }

    stagerState = stagerState || {};

    if (!node.game.plot) {
        node.game.plot = new GamePlot();
    }

    if (!node.game.plot.stager) {
        node.game.plot.stager = new Stager();
    }

    node.game.plot.stager.setState(stagerState, updateRule);

    return node.game.plot;
});

/**
 * ### node.setup.plist
 *
 * Updates the PlayerList in Game
 *
 * @param {PlayerList} playerList The new PlayerList
 * @param {string} updateRule Optional. Whether to 'replace' (default) or
 *  to 'append'.
 *
 * @see node.game.plot
 * @see Stager.setState
 */
node.setup.register('plist', function(playerList, updateRule) {
    if (!node.game || !node.game.pl) {
        node.warn("register('plist') called before node.game was initialized");
        throw new NodeGameMisconfiguredGameError("node.game non-existent");
    }

    if (playerList) {
        if (!updateRule || updateRule === 'replace') {
            node.game.pl.clear(true);
        }
        else if (updateRule !== 'append') {
            throw new NodeGameMisconfiguredGameError(
                    "register('plist') got invalid updateRule");
        }

        node.game.pl.importDB(playerList);
    }

    return node.game.pl;
});

/**
 * ### node.setup.mlist
 *
 * TODO: docs, merge with plist
 * Updates the PlayerList in Game
 *
 * @param {PlayerList} playerList The new PlayerList
 * @param {string} updateRule Optional. Whether to 'replace' (default) or
 *  to 'append'.
 *
 * @see node.game.plot
 * @see Stager.setState
 */
node.setup.register('mlist', function(playerList, updateRule) {
    if (!node.game || !node.game.ml) {
        node.warn("register('mlist') called before node.game was initialized");
        throw new NodeGameMisconfiguredGameError("node.game non-existent");
    }

    if (playerList) {
        if (!updateRule || updateRule === 'replace') {
            node.game.ml.clear(true);
        }
        else if (updateRule !== 'append') {
            throw new NodeGameMisconfiguredGameError(
                    "register('plist') got invalid updateRule");
        }

        node.game.ml.importDB(playerList);
    }

    return node.game.ml;
});


/**
 * ### node.remoteSetup
 *
 * Sends a setup configuration to a connected client
 *
 * Accepts any number of extra parameters that are sent as option values.
 *
 * @param {string} property The feature to configure
 * @param {string} to The id of the remote client to configure
 *
 * @return{boolean} TRUE, if configuration is successful
 *
 * @see node.setup
 * @see JSUS.stringifyAll
 */
node.remoteSetup = function(property, to) {
    var msg, payload;

    if (!property) {
        node.err('cannot send remote setup: empty property');
        return false;
    }
    if (!to) {
        node.err('cannot send remote setup: empty recipient');
        return false;
    }

    payload = J.stringifyAll(Array.prototype.slice.call(arguments, 2));

    if (!payload) {
        node.err('an error occurred while stringifying payload for remote setup');
        return false;
    }

    msg = node.msg.create({
        target: node.target.SETUP,
        to: to,
        text: property,
        data: payload
    });

    return node.socket.send(msg);
};


})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports,
    'undefined' != typeof io ? io : module.parent.exports.io
);
