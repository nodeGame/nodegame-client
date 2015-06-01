/**
 * # Setup
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` configuration module
 */

(function(exports, node) {

    "use strict";

    // ## Global scope

    var GameMsg = node.GameMsg,
    Player = node.Player,
    Game = node.Game,
    GamePlot = node.GamePlot,
    Stager = node.Stager,
    GameMsgGenerator = node.GameMsgGenerator,
    J = node.JSUS;

    var NGC = node.NodeGameClient;

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
     */
    NGC.prototype.setup = function(property) {
        var res, func;

        if ('string' !== typeof property) {
            throw new Error('node.setup: expects a string as first parameter.');
        }

        if (frozen) {
            throw new Error('node.setup: nodeGame configuration is frozen. ' +
                            'Calling setup is not allowed.');
        }

        if (property === 'register') {
            throw new Error('node.setup: cannot setup property "register".');
        }

        func = this.setup[property];
        if (!func) {
            throw new Error('node.setup: no such property to configure: '
                            + property + '.');
        }

        // Setup the property using rest of arguments:
        res = func.apply(this, Array.prototype.slice.call(arguments, 1));

        if (property !== 'nodegame') {
            this.conf[property] = res;
        }

        return true;
    };

    /**
     * ### node.registerSetup
     *
     * Registers a configuration function
     *
     * Setup functions can be invoked remotely with in.say.SETUP messages
     * and the name property stated in `msg.text`.
     *
     * @param {string} property The feature to configure
     * @param {mixed} options The value of the option to configure
     *
     * @see node.setup
     */
    NGC.prototype.registerSetup = function(property, func) {
        var that;
        if ('string' !== typeof property) {
            throw new TypeError('node.registerSetup: property must be string.');
        }
        if ('function' !== typeof func) {
            throw new TypeError('node.registerSetup: func must be function.');
        }
        that = this;
        this.setup[property] = function() {
            that.info('setup ' + property + '.');
            return func.apply(that, arguments);
        }

    };

    /**
     * ### node.deregisterSetup
     *
     * Registers a configuration function
     *
     * @param {string} feature The name of the setup feature to deregister
     *
     * @see node.setup
     */
    NGC.prototype.deregisterSetup = function(feature) {
        var that;
        if ('string' !== typeof feature) {
            throw new TypeError('node.deregisterSetup: property must ' +
                                'be string.');
        }
        if (!this.setup[feature]) {
            this.warn('node.deregisterSetup: feature ' + property + ' not ' +
                      'previously registered.');
            return;
        }
        delete this.setup[feature];
    };

    /**
     * ### node.remoteSetup
     *
     * Sends a setup configuration to a connected client
     *
     * Accepts any number of extra parameters that are sent as option values.
     *
     * @param {string} property The feature to configure
     * @param {string|array} to The id of the remote client to configure
     *
     * @return{boolean} TRUE, if configuration is successful
     *
     * @see node.setup
     * @see JSUS.stringifyAll
     */
    NGC.prototype.remoteSetup = function(property, to) {
        var msg, payload;

        if ('string' !== typeof 'property') {
            throw new TypeError('node.remoteSetup: property must be string.');
        }
        if ('string' !== typeof to && !J.isArray(to)) {
            throw new TypeError('node.remoteSetup: to must be string or ' +
                                'array.');
        }

        payload = J.stringifyAll(Array.prototype.slice.call(arguments, 2));

        if (!payload) {
            this.err('node.remoteSetup: an error occurred while ' +
                     'stringifying payload.');
            return false;
        }

        msg = this.msg.create({
            target: this.constants.target.SETUP,
            to: to,
            text: property,
            data: payload
        });

        return this.socket.send(msg);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
