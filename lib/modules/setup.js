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
        var res;
        

        if (frozen) {
            this.err('nodeGame configuration is frozen. No modification allowed.');
            return false;
        }

        if (property === 'register') {
            this.warn('cannot setup property "register"');
            return false;
        }

        if (!this.setup[property]) {
            this.warn('no such property to configure: ' + property);
            return false;
        }
        
        // Setup the property using rest of arguments:
        res = this.setup[property].apply(this, Array.prototype.slice.call(arguments, 1));

        if (property !== 'nodegame') {
            this.conf[property] = res;
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
    NGC.prototype.registerSetup = function(property, func) {
        if (!property || !func) {
            this.err('cannot register empty setup function');
            return false;
        }
        this.setup[property] = func;
        return true;
    };

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
    NGC.prototype.remoteSetup = function(property, to) {
        var msg, payload;

        if (!property) {
            this.err('cannot send remote setup: empty property');
            return false;
        }
        if (!to) {
            this.err('cannot send remote setup: empty recipient');
            return false;
        }

        payload = J.stringifyAll(Array.prototype.slice.call(arguments, 2));

        if (!payload) {
            this.err('an error occurred while stringifying payload for remote setup');
            return false;
        }

        msg = this.msg.create({
            target: this.target.SETUP,
            to: to,
            text: property,
            data: payload
        });

        return this.socket.send(msg);
    };


  
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports,
    'undefined' != typeof io ? io : module.parent.exports.io
);
