/**
 * # EventEmitter
 *
 * Event emitter engine for `nodeGame`
 *
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Keeps a register of events listeners.
 * ---
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    var NDDB = parent.NDDB,
    GameStage = parent.GameStage;

    exports.EventEmitter = EventEmitter;
    exports.EventEmitterManager = EventEmitterManager;

    /**
     * ## EventEmitter constructor
     *
     * Creates a new instance of EventEmitter
     */
    function EventEmitter(name, node) {

        this.node = node;

        // ## Public properties

        this.name = 'undefined' !== typeof name ? name : 'EE';

        /**
         * ### EventEmitter.listeners
         *
         * Event listeners collection
         */
        this.events = {};

        /**
         * ### EventEmitter.history
         *
         * Database of emitted events
         *
         * @see NDDB
         * @see EventEmitter.EventHistory
         * @see EventEmitter.store
         */
        this.history = new EventHistory(this.node);
    }

    // ## EventEmitter methods

    /**
     * ### EventEmitter.add
     *
     * Registers a global listener for an event
     *
     * Listeners registered with this method are valid for the
     * whole length of the game
     *
     * @param {string} type The event name
     * @param {function} listener The function to emit
     */
    EventEmitter.prototype.on = function(type, listener) {
        if ('string' !== typeof type) {
            throw TypeError('EventEmitter.on: type must be a string.');
        }
        if ('function' !== typeof listener) {
            throw TypeError('EventEmitter.on: listener must be a function.');
        }

        if (!this.events[type]) {
            // Optimize the case of one listener.
            // Don't need the extra array object.
            this.events[type] = listener;
        }
        else if (typeof this.events[type] === 'object') {
            // If we've already got an array, just append.
            this.events[type].push(listener);
        }
        else {
            // Adding the second element, need to change to array.
            this.events[type] = [this.events[type], listener];
        }

        this.node.silly('ee.' + this.name + ' added listener: ' +
                        type + ' ' + listener);
    };

    /**
     * ### EventEmitter.once
     *
     * Registers an event listener that will be removed
     * after its first invocation
     *
     * @param {string} event The name of the event
     * @param {function} listener The callback function
     *
     * @see EventEmitter.on
     * @see EventEmitter.off
     */
    EventEmitter.prototype.once = function(type, listener) {
        var node = this.node;
        function g() {
            this.remove(type, g);
            listener.apply(node.game, arguments);
        }
        this.on(type, g);
    };

    /**
     * ### EventEmitter.emit
     *
     * Fires all the listeners associated with an event
     *
     * The first parameter be the name of the event as _string_,
     * followed by any number of parameters that will be passed to the
     * handler callback.
     *
     * Return values of each callback are aggregated and returned as an
     * array. If the array contains less than 2 elements, the only element
     * or _undefined_ is returned instead.
     *
     * Technical notice: classic EventEmitter classes do not return any value.
     * Returning a value creates an overhead when multiple listeners are
     * registered under the same event, and an array needs to be managed.
     * Such overhead is anyway very small, and can be neglected (for now).
     *
     * @return {mixed} The return value of the callback/s
     */
    EventEmitter.prototype.emit = function() {

        var handler, len, args, i, listeners, type, ctx, node;
        var res, tmpRes;

        type = arguments[0];
        handler = this.events[type];

        if ('undefined' === typeof handler) return;

        node = this.node;
        ctx = node.game;

        // Useful for debugging.
        if (this.node.conf.events && this.node.conf.events.dumpEvents) {
            this.node.log('F - ' + this.name + ': ' + type);
        }

        if ('function' === typeof handler) {

            switch (arguments.length) {
                // fast cases
            case 1:
                res = handler.call(ctx);
                break;
            case 2:
                res = handler.call(ctx, arguments[1]);
                break;
            case 3:
                res = handler.call(ctx, arguments[1], arguments[2]);
                break;
            case 4:
                res = handler.call(ctx, arguments[1], arguments[2],
                                   arguments[3]);
                break;

            default:
                // slower
                len = arguments.length;
                args = new Array(len - 1);
                for (i = 1; i < len; i++) {
                    args[i - 1] = arguments[i];
                }
                res = handler.apply(ctx, args);
            }
        }
        else if ('object' === typeof handler) {
            len = arguments.length;
            args = new Array(len - 1);
            for (i = 1; i < len; i++) {
                args[i - 1] = arguments[i];
            }
            listeners = handler.slice();
            len = listeners.length;
            // If more than one event listener is registered,
            // we will return an array.
            res = [];
            for (i = 0; i < len; i++) {
                tmpRes = listeners[i].apply(node.game, args);
                if ('undefined' !== typeof tmpRes)
                res.push(tmpRes);
            }
            // If less than 2 listeners returned a value, compact the result.
            if (!res.length) res = undefined;
            else if (res.length === 1) res = res[0];
        }

        // Log the event into node.history object, if present.
        if (node.conf && node.conf.events
            && node.conf.events.history) {
            this.history.insert({
                stage: node.game.getCurrentGameStage(),
                args: arguments
            });
        }

        return res;
    };

    /**
     * ### EventEmitter.remove
     *
     * Deregisters one or multiple event listeners
     *
     * @param {string} type The event name
     * @param {function} listener Optional. The specific function
     *   to deregister
     *
     * @return Boolean TRUE, if the removal is successful
     */
    EventEmitter.prototype.remove = EventEmitter.prototype.off =
    function(type, listener) {

        var listeners, len, i, type, node;
        node = this.node;

        if ('string' !== typeof type) {
            throw TypeError('EventEmitter.remove (' + this.name +
                            '): type must be a string');
        }

        if (!this.events[type]) {
            node.warn('EventEmitter.remove (' + this.name +
                      '): unexisting event ' + type);
            return false;
        }

        if (!listener) {
            delete this.events[type];
            node.silly('Removed listener ' + type);
            return true;
        }

        if (listener && 'function' !== typeof listener) {
            throw TypeError('EventEmitter.remove (' + this.name +
                            '): listener must be a function');
        }

        if ('function' === typeof this.events[type] ) {
            if (listener == this.events[type]) {
                delete this.events[type];
                node.silly('ee.' + this.name + ' removed listener: ' +
                           type + ' ' + listener);
                return true;
            }
        }
        else {
            // array
            listeners = this.events[type];
            len = listeners.length;
            for (i = 0; i < len; i++) {
                if (listeners[i] == listener) {
                    listeners.splice(i, 1);
                    node.silly('ee.' + this.name + ' removed ' +
                               'listener: ' + type + ' ' + listener);
                    return true;
                }
            }
        }

        node.warn('EventEmitter.remove (' + this.name + '): no ' +
                  'listener-match found for event ' + type);
        return false;
    };

    /**
     * ### EventEmitter.clear
     *
     * Removes all registered event listeners
     */
    EventEmitter.prototype.clear = function() {
        this.events = {};
    };

    /**
     * ### EventEmitter.printAll
     *
     * Prints to console all the registered functions
     */
    EventEmitter.prototype.printAll = function() {
        var i, len;
        for (i in this.events) {
            if (this.events.hasOwnProperty(i)) {
                len = this.events[i].length ? this.events[i].length : 1;
                console.log(i + ': ' + len + ' listener/s');
            }
        }
    };

    /**
     * # EventEmitterManager constructor
     *
     * @param {NodeGameClient} A reference to the node object
     */
    function EventEmitterManager(node) {

        this.node = node;

        this.ee = {};
        this.createEE('ng');
        this.createEE('game');
        this.createEE('stage');
        this.createEE('step');

        this.createEEGroup('game', 'step', 'stage', 'game');
        this.createEEGroup('stage', 'stage', 'game');
    };

    // ## EventEmitterManager methods

    /**
     * ### EventEmitterManager.createEEGroup
     *
     * Creates a group of event emitters
     *
     * Accepts a variable number of input parameters.
     *
     * Adds _global_ methods: emit, on, once, remove, printAll methods to be
     * applied to every element of the group
     *
     * @param {string} groupName
     * @param {string} The name of the event emitter precendtly created
     * @return {object} A reference to the event emitter group
     *
     * @see EventEmitterManager.createEE
     */
    EventEmitterManager.prototype.createEEGroup = function(groupName) {
        var i, len, that, args;
        len = arguments.length, that = this;

        if (!len) {
            throw new Error('EEGroup needs a name and valid members.');
        }
        if (len === 1) {
            throw new Error('EEGroup needs at least one member.');
        }

        // Checking if each ee exist.
        for (i = 1; i < len; i++) {
            if ('string' !== typeof arguments[i]) {
                throw new TypeError(
                    'EventEmitter name must be a string');
            }
            if (!this.ee[arguments[i]]) {
                throw new Error('EventEmitterManager.createEEGroup: ' +
                                'non-existing EventEmitter in group ' +
                                groupName + ': ' + arguments[i]);
            }
        }

        // Copying the args obj into an array.
        args = new Array(len - 1);
        for (i = 1; i < len; i++) {
            args[i - 1] = arguments[i];
        }

        switch (len) {
            // Fast cases.
        case 2:
            this[groupName] = this.ee[args[0]];
            break;
        case 3:
            this[groupName] = {
                emit: function() {
                    that.ee[args[0]].emit(arguments);
                    that.ee[args[1]].emit(arguments);
                },
                on: this.ee[args[0]].on,
                once: this.ee[args[1]].once,
                clear: function() {
                    that.ee[args[0]].clear();
                    that.ee[args[1]].clear();
                },
                remove: function() {
                    that.ee[args[0]].remove(arguments);
                    that.ee[args[1]].remove(arguments);
                },
                printAll: function() {
                    that.ee[args[0]].printAll();
                    that.ee[args[1]].printAll();
                }
            };
            break;
        case 4:
            this[groupName] = {
                emit: function() {
                    that.ee[args[0]].emit(arguments);
                    that.ee[args[1]].emit(arguments);
                    that.ee[args[2]].emit(arguments);
                },
                on: this.ee[args[0]].on,
                once: this.ee[args[1]].once,
                clear: function() {
                    that.ee[args[0]].clear();
                    that.ee[args[1]].clear();
                    that.ee[args[2]].clear();
                },
                remove: function() {
                    that.ee[args[0]].remove(arguments);
                    that.ee[args[1]].remove(arguments);
                    that.ee[args[2]].remove(arguments);
                },
                printAll: function() {
                    that.ee[args[0]].printAll();
                    that.ee[args[1]].printAll();
                    that.ee[args[2]].printAll();
                }
            };
            break;
        default:
            // Slower.
            len = args.len;
            this[groupName] = {
                emit: function() {
                    for (i = 0; i < len; i++) {
                        that.ee[args[i]].emit(arguments);
                    }
                },
                on: this.ee[args[0]].on,
                once: this.ee[args[1]].once,
                clear: function() {
                    for (i = 0; i < len; i++) {
                        that.ee[args[i]].clear();
                    }

                },
                remove: function() {
                    for (i = 0; i < len; i++) {
                        that.ee[args[i]].remove(arguments);
                    }
                },
                printAll: function() {
                    for (i = 0; i < len; i++) {
                        that.ee[args[i]].printAll();
                    }
                }
            };
        }
        return this[groupName];
    };

    /**
     * ### EventEmitterManager.createEE
     *
     * Creates and registers an event emitter
     *
     * A double reference is added to _this.ee_ and to _this_.
     *
     * @param {string} name The name of the event emitter
     * @return {EventEmitter} A reference to the newly created event emitter
     *
     * @see EventEmitter constructor
     */
    EventEmitterManager.prototype.createEE = function(name) {
        this.ee[name] = new EventEmitter(name, this.node);
        this[name] = this.ee[name];
        return this.ee[name];
    };

    /**
     * ### EventEmitterManager.destroyEE
     *
     * Removes an existing event emitter
     *
     * @param {string} name The name of the event emitter
     * @return {boolean} TRUE, on success
     *
     * @see EventEmitterManager.createEE
     *
     * TODO: the event emitter should be removed by the group
     */
    EventEmitterManager.prototype.destroyEE = function(name) {
        var ee;
        ee = this.ee[name];
        if ('string' !== typeof name) {
            this.node.warn('EventEmitterManager.destroyEE: name must be ' +
                           'string.');
            return false;
        }
        delete this[name];
        delete this.ee[name];
        return true;
    };

    /**
     * ### EventEmitterManager.clear
     *
     * Removes all registered event listeners from all registered event emitters
     */
    EventEmitterManager.prototype.clear = function() {
        var i;
        for (i in this.ee) {
            if (this.ee.hasOwnProperty(i)) {
                this.ee[i].clear();
            }
        }
    };

    /**
     * ### EventEmitterManager.emit
     *
     * Emits an event on all registered event emitters
     *
     * Accepts a variable number of input parameters.
     *
     * @param {string} The name of the event
     * @return {mixed} The values returned by all fired event listeners
     */
    EventEmitterManager.prototype.emit = function() {
        var i, event, tmpRes, res;
        event = arguments[0];
        if ('string' !== typeof event) {
            throw new TypeError(
                'EventEmitterManager.emit: event must be string.');
        }
        res = [];
        for (i in this.ee) {
            if (this.ee.hasOwnProperty(i)) {
                tmpRes = this.ee[i].emit.apply(this.ee[i], arguments);
                if (tmpRes) res.push(tmpRes);
            }
        }
        // If there are less than 2 elements, unpack the array.
        // res[0] is either undefined or some value.
        return res.length < 2 ? res[0] : res;
    };

    /**
     * ### EventEmitterManager.remove
     *
     * Removes an event / event listener from all registered event emitters
     *
     * @param {string} The name of the event
     * @param {function} listener Optional A reference of the function to remove
     */
    EventEmitterManager.prototype.remove = function(event, listener) {
        var i;
        if ('string' !== typeof event) {
            throw new TypeError('EventEmitterManager.remove: ' +
                                'event must be string.');
        }
        if (listener && 'function' !== typeof listener) {
            throw new TypeError('EventEmitterManager.remove: ' +
                                'listener must be function.');
        }
        for (i in this.ee) {
            if (this.ee.hasOwnProperty(i)) {
                this.ee[i].remove(event, listener);
            }
        }
    };

    /**
     * # EventHistory constructor
     *
     * TODO: might require updates.
     */
    function EventHistory(node) {

        this.node = node;

        /**
         * ### EventHistory.history
         *
         * Database of emitted events
         *
         * @see NDDB
         * @see EventEmitter.store
         *
         */
        this.history = new NDDB();

        this.history.h('stage', function(e) {
            var stage;
            if (!e) return;
            stage = 'object' === typeof e.stage ?
                e.stage : this.node.game.stage;
            return node.GameStage.toHash(stage, 'S.s.r');
        });

    }

    EventHistory.prototype.remit = function(stage, discard, keep) {
        var hash, db, remit, node;
        node = this.node;
        if (!this.history.count()) {
            node.log('no event history was found to remit', 'WARN');
            return false;
        }

        node.silly('remitting ' + node.events.history.count() + ' events');

        if (stage) {

            this.history.rebuildIndexes();

            hash = new GameStage(session.stage).toHash('S.s.r');

            if (!this.history.stage) {
                node.silly('No past events to re-emit found.');
                return false;
            }
            if (!this.history.stage[hash]){
                node.silly('Current stage ' + hash + ' has no events ' +
                           'to re-emit');
                return false;
            }

            db = this.history.stage[hash];
        }
        else {
            db = this.history;
        }

        // cleaning up the events to remit
        // @TODO NDDB commands have changed, update
        if (discard) {
            db.select('event', 'in', discard).remove();
        }

        if (keep) {
            db = db.select('event', 'in', keep);
        }

        if (!db.count()){
            node.silly('no valid events to re-emit after cleanup');
            return false;
        }

        remit = function() {
            node.silly('re-emitting ' + db.count() + ' events');
            // We have events that were fired at the stage when
            // disconnection happened. Let's fire them again
            db.each(function(e) {
                node.emit(e.event, e.p1, e.p2, e.p3);
            });
        };

        if (node.game.isReady()) {
            remit.call(node.game);
        }
        else {
            node.on('LOADED', function(){
                remit.call(node.game);
            });
        }

        return true;
    };

    // ## Closure

})(
    'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
