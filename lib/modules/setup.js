/**
 * # Setup
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` configuration module
 */

(function(exports, node) {

    "use strict";

    // ## Global scope

    var J = node.JSUS;

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
        var i, len, args;

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

        func = this._setup[property];
        if (!func) {
            throw new Error('node.setup: no such property to configure: ' +
                            property + '.');
        }

        // Setup the property using rest of arguments.
        len = arguments.length;
        switch(len) {
        case 1:
            res = func.call(this);
            break;
        case 2:
            res = func.call(this, arguments[1]);
            break;
        case 3:
            res = func.call(this, arguments[1], arguments[2]);
            break;
        default:
            len = len - 1;
            args = new Array(len);
            for (i = -1 ; ++i < len ; ) {
                args[i] = arguments[i+1];
            }
            res = func.apply(this, args);
        };

        if (property !== 'nodegame') this.conf[property] = res;

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
        if ('string' !== typeof property) {
            throw new TypeError('node.registerSetup: property must be string.');
        }
        if ('function' !== typeof func) {
            throw new TypeError('node.registerSetup: func must be function.');
        }
        this._setup[property] = func;
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
        if ('string' !== typeof feature) {
            throw new TypeError('node.deregisterSetup: property must ' +
                                'be string.');
        }
        if (!this._setup[feature]) {
            this.warn('node.deregisterSetup: feature ' + feature + ' not ' +
                      'previously registered.');
            return;
        }
        this._setup[feature] = null;
    };

    /**
     * ### node.remoteSetup
     *
     * Sends a setup configuration to a connected client
     *
     * Accepts any number of extra parameters that are sent as option values.
     *
     * @param {string} feature The feature to configure
     * @param {string|array} to The id of the remote client to configure
     *
     * @return{boolean} TRUE, if configuration is successful
     *
     * @see node.setup
     * @see JSUS.stringifyAll
     */
    NGC.prototype.remoteSetup = function(feature, to) {
        var msg, payload, len;

        if ('string' !== typeof feature) {
            throw new TypeError('node.remoteSetup: feature must be string.');
        }
        if ('string' !== typeof to && !J.isArray(to)) {
            throw new TypeError('node.remoteSetup: to must be string or ' +
                                'array.');
        }
        len = arguments.length;
        if (len > 2) {
            if (len === 3) payload = [arguments[2]];
            else if (len === 4) payload = [arguments[2], arguments[3]];
            else {
                payload = new Array(len - 2);
                for (i = 2; i < len; i++) {
                    payload[i - 2] = arguments[i];
                }
            }
            payload = J.stringifyAll(payload);

            if (!payload) {
                this.err('node.remoteSetup: an error occurred while ' +
                         'stringifying payload.');
                return false;
            }
        }

        msg = this.msg.create({
            target: this.constants.target.SETUP,
            to: to,
            text: feature,
            data: payload
        });

        return this.socket.send(msg);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
