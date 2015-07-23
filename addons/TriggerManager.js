/**
 * # TriggerManager
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Manages a collection of trigger functions to be called sequentially
 *
 * ## Note for developers
 *
 * Triggers are functions that operate on a common object, and each
 * sequentially adds further modifications to it.
 *
 * If the TriggerManager were a beauty saloon, the first trigger function
 * would wash the hair, the second would cut the washed hair, and the third
 * would style it. All these operations needs to be done sequentially, and
 * the TriggerManager takes care of handling this process.
 *
 * If `TriggerManager.returnAt` is set equal to `TriggerManager.first`,
 * the first trigger function returning a truthy value will stop the process
 * and the target object will be immediately returned. In these settings,
 * if a trigger function returns `undefined`, the target is passed to the next
 * trigger function.
 *
 * Notice: TriggerManager works as a *LIFO* queue, i.e. new trigger functions
 * will be executed first.
 */
(function(exports, node) {

    "use strict";

    // ## Global scope

    exports.TriggerManager = TriggerManager;

    TriggerManager.first = 'first';
    TriggerManager.last = 'last';

    /**
     * ## TriggerManager constructor
     *
     * Creates a new instance of TriggerManager
     *
     * @param {object} options Configuration options
     */
    function TriggerManager(options) {
        // ## Public properties

        /**
         * ### TriggerManager.options
         *
         * Reference to current configuration
         */
        this.options = options || {};

        /**
         * ### TriggerManager.triggers
         *
         * Array of trigger functions
         */
        this.triggers = [];

        /**
         * ### TriggerManager.returnAt
         *
         * Controls the behavior of TriggerManager.pullTriggers
         *
         * By default it is equal to `TriggerManager.first`
         */
        this.returnAt = TriggerManager.first;

        this.init();
    };

    // ## TriggerManager methods


    /**
     * ### TriggerManager.size
     *
     * Returns the number of registered trigger functions
     */
    TriggerManager.prototype.size = function() {
        return this.triggers.length;
    };

    /**
     * ### TriggerManager.init
     *
     * Configures the TriggerManager instance
     *
     * Takes the configuration as an input parameter or recycles the settings
     * in `this.options`.
     *
     * The configuration object is of the type:
     *
     *  var options = {
     *      returnAt: 'last',
     *      triggers: [ myFunc, myFunc2 ]
     *  };
     *
     * @param {object} options Optional. Configuration object
     */
    TriggerManager.prototype.init = function(options) {
        if (options && 'object' !== typeof options) {
            throw new TypeError('TriggerManager.init: options must be ' +
                                'object or undefined.');
        }

        if (options) {
            if (options.returnAt) {
                this.setReturnAt(options.returnAt);
            }
            this.options = options;
        }

        this.resetTriggers();
    };


    /**
     * ### TriggerManager.setReturnAt
     *
     * Verifies and sets the returnAt option.x
     *
     * @param {string} returnAt The value of the returnAt policy
     *
     * @see TriggerManager.first
     * @see TriggerManager.last
     */
    TriggerManager.prototype.setReturnAt = function(returnAt) {
        var f =  TriggerManager.first, l = TriggerManager.last;
        if ('string' !== typeof returnAt) {
            throw new TypeError('TriggerManager.setReturnAt: returnAt must ' +
                                'be string.');
        }
        if (returnAt !== f && returnAt !== l) {
            throw new TypeError('TriggerManager.setReturnAt: returnAt must ' +
                                'be ' + f + ' or ' + l + '. Given: ' +
                                returnAt + '.');
        }
        this.returnAt = returnAt;
    };

    /**
     * ### TriggerManager.initTriggers
     *
     * Adds a collection of trigger functions to the trigger array
     *
     * @param {function|array} triggers An array of trigger functions
     *   or a single function.
     */
    TriggerManager.prototype.initTriggers = function(triggers) {
        var i;
        if (!triggers) return;
        if (!(triggers instanceof Array)) {
            triggers = [triggers];
        }
        for (i = 0 ; i < triggers.length ; i++) {
            this.triggers.push(triggers[i]);
        }
    };

    /**
     * ### TriggerManager.resetTriggers
     *
     * Resets the trigger array to initial configuration
     *
     * Delete existing trigger functions and re-add the ones
     * contained in `TriggerManager.options.triggers`.
     */
    TriggerManager.prototype.resetTriggers = function() {
        this.triggers = [];
        if ('undefined' !== typeof this.options.triggers) {
            this.initTriggers(this.options.triggers);
        }
    };

    /**
     * ### TriggerManager.clear
     *
     * Clears the trigger array
     *
     * Requires a boolean parameter to be passed for confirmation
     *
     * @param {boolean} clear TRUE, to confirm clearing
     * @return {boolean} TRUE, if clearing was successful
     */
    TriggerManager.prototype.clear = function(clear) {
        if (!clear) {
            node.warn('Do you really want to clear the current ' +
                      'TriggerManager obj? Please use clear(true)');
            return false;
        }
        this.triggers = [];
        return clear;
    };

    /**
     * ### TriggerManager.addTrigger
     *
     * Pushes a trigger into the trigger array
     *
     * @param {function} trigger The function to add
     * @param {number} pos Optional. The index of the trigger in the array
     * @return {boolean} TRUE, if insertion is successful
     */
    TriggerManager.prototype.addTrigger = function(trigger, pos) {
        if (!trigger) return false;
        if (!('function' === typeof trigger)) return false;
        if (!pos) {
            this.triggers.push(trigger);
        }
        else {
            this.triggers.splice(pos, 0, trigger);
        }
        return true;
    };

    /**
     * ### TriggerManager.removeTrigger
     *
     * Removes a trigger from the trigger array
     *
     * @param {function} trigger The function to remove
     * @return {boolean} TRUE, if removal is successful
     */
    TriggerManager.prototype.removeTrigger = function(trigger) {
        var i;
        if (!trigger) return false;
        for (i = 0 ; i < this.triggers.length ; i++) {
            if (this.triggers[i] == trigger) {
                return this.triggers.splice(i,1);
            }
        }
        return false;
    };

    /**
     * ### TriggerManager.pullTriggers
     *
     * Fires the collection of trigger functions on the target object
     *
     * Triggers are fired according to a LIFO queue, i.e. new trigger
     * functions are fired first.
     *
     * Depending on the value of `TriggerManager.returnAt`, some trigger
     * functions may not be called. In fact a value is returned:
     *
     *  - 'first': after the first trigger returns a truthy value
     *  - 'last': after all triggers have been executed
     *
     * If no trigger is registered the target object is returned unchanged
     *
     * @param {object} o The target object
     * @return {object} The target object after the triggers have been fired
     */
    TriggerManager.prototype.pullTriggers = function(o) {
        var i, out;
        if ('undefined' === typeof o) return;
        if (!this.size()) return o;

        for (i = this.triggers.length; i > 0; i--) {
            out = this.triggers[(i-1)].call(this, o);
            if ('undefined' !== typeof out) {
                if (this.returnAt === TriggerManager.first) {
                    return out;
                }
            }
        }
        // Safety return.
        return ('undefined' !== typeof out) ? out : o;
    };

    // <!-- old pullTriggers
    //TriggerManager.prototype.pullTriggers = function(o) {
    //  if (!o) return;
    //
    //  for (var i = triggersArray.length; i > 0; i--) {
    //          var out = triggersArray[(i-1)].call(this, o);
    //          if (out) {
    //                  if (this.returnAt === TriggerManager.first) {
    //                          return out;
    //                  }
    //          }
    //  }
    //  // Safety return
    //  return o;
    //};
    //-->

})(
    ('undefined' !== typeof node) ? node : module.exports
    , ('undefined' !== typeof node) ? node : module.parent.exports
);
