/**
 * # Alias
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` aliasing module
 */
(function(exports, node) {

    "use strict";

    // ## Global scope

    var J = node.JSUS;

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
     * Note: aliases cannot return values to the emit call.
     * TODO: node.on aliases could do it without problem, node.once aliases
     * have the problem that the return value is currently used to detect
     * whether the modifier function actually executed the user callback.
     *
     * ```javascript
     *   // The node.on.data alias example with modifier function
     *   // only DATA msg with the right label will be fired.
     *   this.alias('data', ['in.say.DATA', 'in.set.DATA'], function(text, cb) {
     *       return function(msg) {
     *           if (msg.text === text) cb.call(that.game, msg);
     *           else return false;
     *       };
     *   });
     *
     *  node.on.data('myLabel', function() { ... };
     *  node.once.data('myLabel', function() { ... };
     * ```
     *
     * @param {string} alias The name of alias
     * @param {string|array} events The event/s under which the listeners
     *   will be registered
     * @param {function} modifier Optional. A function that makes a closure
     *   around its own input parameters, and returns a function that will
     *   actually be invoked when the aliased event is fired. It should return
     *   FALSE if it does not executes the user callback.
     */
    NGC.prototype.alias = function(alias, events, modifier) {
        var that;
        if ('string' !== typeof alias) {
            throw new TypeError('node.alias: alias must be string. Found: ' +
                                alias);
        }
        if ('string' === typeof events) {
            events = [events];
        }
        if (!J.isArray(events)) {
            throw new TypeError('node.alias: events must be array or string. ' +
                                'Found: ' + events);
        }
        if (modifier && 'function' !== typeof modifier) {
            throw new TypeError(
                'node.alias: modifier must be function or undefined. Found: ' +
                    modifier);
        }

        that = this;

        this.on[alias] = function(func) {
            var i, len, args;

            // If set, we use the callback returned by the modifier.
            // Otherwise, we assume the first parameter is the callback.
            if (modifier) {
                args = [];
                i = -1, len = arguments.length;
                for ( ; ++i < len ; ) {
                    args[i] = arguments[i];
                }
                func = modifier.apply(that.game, args);
            }

            J.each(events, function(event) {
                that.on(event, function() {
                    func.apply(that.game, arguments);
                });
            });

        };
        this.once[alias] = function(func) {
            var i, len, args;

            // If set, we use the callback returned by the modifier.
            // Otherwise, we assume the first parameter is the callback.
            if (modifier) {
                args = [];
                i = -1, len = arguments.length;
                for ( ; ++i < len ; ) {
                    args[i] = arguments[i];
                }
                func = modifier.apply(that.game, args);
            }

            J.each(events, function(event) {
                // We redo the once method manually because otherwise
                // the first call to once will remove all once listeners
                // defined with this alias. Normal one calls the listener
                // that wraps the modifier which may or may not execute the
                // user-defined function. We introduce that if the modifier
                // return false, it means the user-defined function was not
                // executed and therefore it should not be removed.
                function g() {
                    var i, len, args, toRemove;
                    args = [];
                    i = -1, len = arguments.length;
                    for ( ; ++i < len ; ) {
                        args[i] = arguments[i];
                    }
                    toRemove = func.apply(that.game, args);
                    // If a modifier returns false it has not executed the
                    // user-defined listener, so we should not remove it.
                    if (!modifier || toRemove !== false) that.off(event, g);
                }
                that.on(event, g);
            });
        };

        // attachAlias(this, 'on', events, modifier, alias);
        // attachAlias(this, 'once', events, modifier, alias);

        // this.on[alias] = function(func) {
        //     var i, len, args;
        //     args = [];
        //     i = -1, len = arguments.length;
        //     for ( ; ++i < len ; ) {
        //         args[i] = arguments[i];
        //     }
        //     // If set, we use the callback returned by the modifier.
        //     // Otherwise, we assume the first parameter is the callback.
        //     if (modifier) func = modifier.apply(that.game, args);
        //
        //     // Optimized.
        //     if (eventsLen < 3) {
        //         that.on(event[0], function() {
        //             func.apply(that.game, args);
        //         });
        //         if (eventsLen === 2) {
        //             that.on(event[1], function() {
        //                 func.apply(that.game, args);
        //             });
        //         }
        //     }
        //     else {
        //         for ( ; ++i < len ; ) {
        //             that.on(event[i], function() {
        //                 func.apply(that.game, args);
        //             });
        //         }
        //     }
        // };

        // TODO: remove code duplication?
        // this.once[alias] = function(func) {
        //     var i, len, args;
        //     args = [];
        //     i = -1, len = arguments.length;
        //     for ( ; ++i < len ; ) {
        //         args[i] = arguments[i];
        //     }
        //     // If set, we use the callback returned by the modifier.
        //     // Otherwise, we assume the first parameter is the callback.
        //     if (modifier) func = modifier.apply(that.game, args);
        //
        //     // Optimized.
        //     if (eventsLen < 3) {
        //         that.once(event[0], function() {
        //             func.apply(that.game, args);
        //         });
        //         if (eventsLen === 2) {
        //             that.once(event[1], function() {
        //                 func.apply(that.game, args);
        //             });
        //         }
        //     }
        //     else {
        //         for ( ; ++i < len ; ) {
        //             that.once(event[i], function() {
        //                 func.apply(that.game, args);
        //             });
        //         }
        //     }
        // };



    };

    // function attachAlias(that, method, events, modifier, alias) {
    //     var eventsLen = events.length;
    //     that[method][alias] = function(func) {
    //         var i, len, args;
    //         // Cloning arguments array.
    //         i = -1;
    //         len = arguments.length;
    //         args = new Array(len);
    //         for ( ; ++i < len ; ) {
    //             args[i] = arguments[i];
    //         }
    //         // If set, we use the callback returned by the modifier.
    //         // Otherwise, we assume the first parameter is the callback.
    //         if (modifier) func = modifier.apply(that.game, args);
    //
    //         // Optimized.
    //         if (eventsLen < 3) {
    //             that[method](events[0], function() {
    //                 func.apply(that.game, arguments);
    //             });
    //             if (eventsLen === 2) {
    //                 that[method](events[1], function() {
    //                     func.apply(that.game, arguments);
    //                 });
    //             }
    //         }
    //         else {
    //             for ( ; ++i < len ; ) {
    //                 that[method](events[i], function() {
    //                     func.apply(that.game, arguments);
    //                 });
    //             }
    //         }
    //     };
    // }


    // function attachAlias(that, method, events, modifier, alias) {
    //     var eventsLen = events.length;
    //     that[method][alias] = function(func) {
    //         var i;
    //         // Cloning arguments array.
    //         // i = -1;
    //         // len = arguments.length;
    //         // args = new Array(len);
    //         // for ( ; ++i < len ; ) {
    //         //     args[i] = arguments[i];
    //         // }
    //         // If set, we use the callback returned by the modifier.
    //         // Otherwise, we assume the first parameter is the callback.
    //         // if (modifier) func = modifier.apply(that.game, args);
    //
    //         // Optimized.
    //
    //         that[method](events[0], function() {
    //             if (modifier) {
    //                 func = modifier.apply(that.game, arguments);
    //                 if (!func) return;
    //             }
    //             func.apply(that.game, arguments);
    //         });
    //         if (eventsLen === 2) {
    //             that[method](events[1], function() {
    //                 if (modifier) {
    //                     func = modifier.apply(that.game, arguments);
    //                     if (!func) return;
    //                 }
    //                 func.apply(that.game, arguments);
    //             });
    //         }
    //         else {
    //             i = 0;
    //             for ( ; ++i < eventsLen ; ) {
    //                 that[method](events[i], function() {
    //                     if (modifier) {
    //                         func = modifier.apply(that.game, arguments);
    //                         if (!func) return;
    //                     }
    //                     func.apply(that.game, arguments);
    //                 });
    //             }
    //         }
    //     };
    // }
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
