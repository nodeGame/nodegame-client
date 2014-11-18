/**
 * # Alias
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` aliasing module
 */
(function(exports, node) {

    "use strict";

    // ## Global scope

    var GameMsg = node.GameMsg,
    Player = node.Player,
    GameMsgGenerator = node.GameMsgGenerator,
    J = node.JSUS;

    var NGC = node.NodeGameClient;

    /**
     * ### node.alias
     *
     * Creates event listeners aliases
     *
     * This method creates a new property to the `node.on` object named
     * after the alias. The alias can be used as a shortcut to register
     * to new listeners on the given events.
     *
     *
     * ```javascript
     *   // The node.on.data alias example with modifier function
     *   // only DATA msg with the right label will be fired.
     *   this.alias('data', ['in.say.DATA', 'in.set.DATA'], function(text, cb) {
     *       return function(msg) {
     *           if (msg.text === text) {
     *               cb.call(that.game, msg);
     *           }
     *       };
     *   });
     *
     * 	node.on.data('myLabel', function(){ ... };
     * 	node.once.data('myLabel', function(){ ... };
     * ```	
     *
     * @param {string} alias The name of alias
     * @param {string|array} events The event/s under which the listeners
     *   will be registered
     * @param {function} modifier Optional. A function that makes a closure
     *   around its own input parameters, and returns a function that will
     *   actually be invoked when the aliased event is fired.
     */
    NGC.prototype.alias = function(alias, events, modifier) {
	var that, func;
        if ('string' !== typeof alias) {
            throw new TypeError('node.alias: alias must be string.');
	}
        if ('string' === typeof events) {
            events = [events];
        }
        if (!J.isArray(events)) {
            throw new TypeError('node.alias: events must be array or string.');
        }
        if (modifier && 'function' !== typeof modifier) {
            throw new TypeError(
                'node.alias: modifier must be function or undefined.');
        }

        that = this;
        if (!J.isArray(events)) events = [events];

        this.on[alias] = function(func) {
            // If set, we use the callback returned by the modifier.
            // Otherwise, we assume the first parameter is the callback.
            if (modifier) {
                func = modifier.apply(that.game, arguments);
            }
            J.each(events, function(event) {
                that.on(event, function() {
                    func.apply(that.game, arguments);
                });
            });
        };

        this.once[alias] = function(func) {
            // If set, we use the callback returned by the modifier.
            // Otherwise, we assume the first parameter is the callback.
            if (modifier) {
                func = modifier.apply(that.game, arguments);
            } 
            J.each(events, function(event) {
                that.once(event, function() {
                    func.apply(that.game, arguments);
                });
            });
        };
    };
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
