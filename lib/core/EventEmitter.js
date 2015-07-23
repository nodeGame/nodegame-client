/**
 * # EventEmitter
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Event emitter engine for `nodeGame`
 *
 * Keeps a register of events listeners.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS,
    NDDB = parent.NDDB,
    GameStage = parent.GameStage;

    exports.EventEmitter = EventEmitter;
    exports.EventEmitterManager = EventEmitterManager;

    /**
     * ## EventEmitter constructor
     *
     * Creates a new instance of EventEmitter
     */
    function EventEmitter(name, node) {
        if ('string' !== typeof name) {
            throw new TypeError('EventEmitter constructor: ' +
                                'name must be string.');
        }

        this.node = node;

        // ## Public properties

        this.name = name;

        /**
         * ### EventEmitter.listeners
         *
         * Event listeners collection
         */
        this.events = {};

        /**
         * ## EventEmitter.recordChanges
         *
         * If TRUE, keeps tracks of addition and deletion of listeners
         *
         * @see EventEmitter.changes
         */
        this.recordChanges = false;

        /**
         * ## EventEmitter.changes
         *
         * If TRUE, keeps tracks of addition and deletion of listeners
         *
         * @see EventEmitter.recordChanges
         */
        this.changes = {
            added: [],
            removed: []
        };

        /**
         * ### EventEmitter.history
         *
         * Database of emitted events
         *
         * @experimental
         *
         * @see NDDB
         * @see EventEmitter.EventHistory
         * @see EventEmitter.store
         */
        this.history = new EventHistory(this.node);
    }

    // ## EventEmitter methods

    /**
     * ### EventEmitter.on
     *
     * Registers a callback function for an event (event listener)
     *
     * @param {string} type The event name
     * @param {function} listener The function to emit
     */
    EventEmitter.prototype.on = function(type, listener) {
        if ('string' !== typeof type) {
            throw new TypeError('EventEmitter.on: type must be string.');
        }
        if ('function' !== typeof listener) {
            throw new TypeError('EventEmitter.on: listener must be function.');
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

        // Storing changes if necessary.
        if (this.recordChanges) {
            this.changes.added.push({type: type, listener: listener});
        }

        this.node.silly(this.name + '.on: added: ' + type + '.');
    };

    /**
     * ### EventEmitter.once
     *
     * Registers an event listener that will be removed after its first call
     *
     * @param {string} event The name of the event
     * @param {function} listener The callback function
     *
     * @see EventEmitter.on
     * @see EventEmitter.off
     */
    EventEmitter.prototype.once = function(type, listener) {
        var that = this;
        function g() {
            that.remove(type, g);
            listener.apply(that.node.game, arguments);
        }
        this.on(type, g);
    };

    /**
     * ### EventEmitter.emit
     *
     * Fires all the listeners associated with an event
     *
     * The first parameter is the name of the event as _string_,
     * followed by any number of parameters that will be passed to the
     * callback.
     *
     * Return values of each callback are aggregated and returned as
     * an array. If the array contains less than 2 elements, only
     * element or _undefined_ is returned.
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
            this.node.info('F: ' + this.name + ': ' + type);
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
        if (node.conf && node.conf.events &&
            node.conf.events.history) {

            this.history.insert({
                stage: node.game.getCurrentGameStage(),
                args: arguments
            });
        }

        return res;
    };

    /**
     * ### EventEmitter.emitAsync
     *
     * Fires all the listeners associated with an event asynchronously
     *
     * Unlike normal emit, it does not return a value.
     *
     * @see EventEmitter.emit
     */
    EventEmitter.prototype.emitAsync = function() {
        var that, len, args, i;
        var arg1, arg2, arg3;
        len = arguments.length;
        if (!len) return;

        that = this;

        // The arguments object must not be passed or leaked anywhere.
        // Therefore, we recreate an args array here. We have a different
        // timeout in a different branch for optimization.
        switch(len) {

        case 1:
            arg1 = arguments[0];
            setTimeout(function() { that.emit(arg1); }, 0);
            break;
        case 2:
            arg1 = arguments[0], arg2 = arguments[1];
            setTimeout(function() { that.emit(arg1, arg2); }, 0);
            break;
        case 3:
            arg1 = arguments[0], arg2 = arguments[1], arg3 = arguments[2];
            setTimeout(function() { that.emit(arg1, arg2, arg3); }, 0);
            break;
        default:
            args = new Array(len);
            for (i = -1 ; ++i < len ; ) {
                args[i] = arguments[i];
            }
            setTimeout(function() { that.emit.apply(that, args); }, 0);
        }
    };

    /**
     * ### EventEmitter.off || remove
     *
     * Deregisters one or multiple event listeners
     *
     * @param {string} type The event name
     * @param {mixed} listener Optional. The specific function
     *   to deregister, its name, or undefined to remove all listeners
     *
     * @return {array} The array of removed listener/s
     */
    EventEmitter.prototype.remove = EventEmitter.prototype.off =
    function(type, listener) {

        var listeners, len, i, node, found, name, removed;

        removed = [];
        node = this.node;

        if ('string' !== typeof type) {
            throw new TypeError('EventEmitter.remove (' + this.name +
                      '): type must be string.');
        }

        if (listener &&
            ('function' !== typeof listener && 'string' !== typeof listener)) {
            throw new TypeError('EventEmitter.remove (' + this.name +
                                '): listener must be function, string, or ' +
                               'undefined.');
        }

        if ('string' === typeof listener && listener.trim() === '') {
            throw new Error('EventEmitter.remove (' + this.name + '): ' +
                            'listener cannot be an empty string.');
        }

        if (this.events[type]) {

            if (!listener) {
                found = true;
                removed.push(this.events[type]);
                delete this.events[type];
            }

            else {
                // Handling multiple cases:
                // this.events[type] can be array or function,
                // and listener can be function or string.

                if ('function' === typeof this.events[type]) {

                    if ('function' === typeof listener) {
                        if (listener == this.events[type]) found = true;
                    }
                    else {
                        // String.
                        name = J.funcName(this.events[type]);
                        if (name === listener) found = true;
                    }

                    if (found) {
                        removed.push(this.events[type]);
                        delete this.events[type];
                    }
                }
                // this.events[type] is an array.
                else {
                    listeners = this.events[type];
                    len = listeners.length;
                    for (i = 0; i < len; i++) {
                        if ('function' === typeof listener) {
                            if (listeners[i] == listener) found = true;
                        }
                        else {
                            // String.
                            name = J.funcName(listeners[i]);
                            if (name === listener) found = true;
                        }

                        if (found) {
                            removed.push(listeners[i]);
                            if (len === 1) {
                                delete this.events[type];
                            }
                            else {
                                listeners.splice(i, 1);
                                // Update indexes,
                                // because array size has changed.
                                len--;
                                i--;
                            }
                        }
                    }
                }
            }
        }

        if (found) {
            // Storing changes if necessary.
            if (this.recordChanges) {
                i = -1, len = removed.length;
                for ( ; ++i < len ; ) {
                    this.changes.removed.push({
                        type: type,
                        listener: removed[i]
                    });
                }
            }
            node.silly('ee.' + this.name + ' removed listener: ' + type + '.');
        }
        else {
            node.warn('EventEmitter.remove (' + this.name + '): requested ' +
                      'listener was not found for event ' + type + '.');
        }

        return removed;
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
     *
     * @return {number} The total number of registered functions
     */
    EventEmitter.prototype.printAll = function() {
        var i, len, totalLen, str;
        totalLen = 0, str = '';
        for (i in this.events) {
            if (this.events.hasOwnProperty(i)) {
                len = ('function' === typeof this.events[i]) ?
                    1 : this.events[i].length;
                totalLen += len;
                str += i + ': ' + len + "\n";
            }
        }
        console.log('[' + this.name + '] ' + totalLen + ' listener/s.');
        if (str) console.log(str);
        return totalLen;
    };

    /**
     * ### EventEmitter.getChanges
     *
     * Returns the list of added and removed event listeners
     *
     * @param {boolean} clear Optional. If TRUE, the list of current changes
     *   is cleared. Default FALSE
     *
     * @return {object} Object containing list of additions and deletions,
     *   or null if no changes have been recorded
     */
    EventEmitter.prototype.getChanges = function(clear) {
        var changes;
        if (this.changes.added.length || this.changes.removed.length) {
            changes = this.changes;
            if (clear) {
                this.changes = {
                    added: [],
                    removed: []
                };
            }
        }
        return changes;
    };

    /**
     * ### EventEmitter.setRecordChanges
     *
     * Sets the value of recordChanges and returns it
     *
     * If called with undefined, just returns current value.
     *
     * @param {boolean} record If TRUE, starts recording changes. Default FALSE
     *
     * @return {boolean} Current value of recordChanges
     *
     * @see EventEmitter.recordChanges
     */
    EventEmitter.prototype.setRecordChanges = function(record) {
        if ('boolean' === typeof record) this.recordChanges = record;
        else if ('undefined' !== typeof record) {
            throw new TypeError('EventEmitter.setRecordChanged: record must ' +
                                'be boolean or undefined');
        }
        return this.recordChanges;
    };


    /**
     * ## EventEmitterManager constructor
     *
     * @param {NodeGameClient} node A reference to the node object
     */
    function EventEmitterManager(node) {

        this.node = node;

        this.ee = {};

        this.createEE('ng');
        this.createEE('game');
        this.createEE('stage');
        this.createEE('step');

        // Groups disabled for the moment.
        // this.createEEGroup('game', 'step', 'stage', 'game');
        // this.createEEGroup('stage', 'stage', 'game');
    }

    // ## EventEmitterManager methods

    /**
     * ### EventEmitterManager.createEEGroup
     *
     * Creates a group of event emitters
     *
     * Accepts a variable number of input parameters.
     * These are the names of existing event emitters.
     *
     * Adds _global_ methods: emit, on, once, remove, printAll methods to be
     * applied to every element of the group
     *
     * @param {string} groupName The name of the event emitter group
     *
     * @return {object} A reference to the event emitter group
     *
     * @see EventEmitterManager.createEE
     *
     * TODO: check if this code is still valid.
     */
    EventEmitterManager.prototype.createEEGroup = function(groupName) {
        var i, len, that, args;
        len = arguments.length, that = this;

        if (!len) {
            throw new Error('EventEmitterManager.createEEGroup: ' +
                            'EEGroup needs a name and valid members.');
        }
        if (len === 1) {
            throw new Error('EventEmitterManager.createEEGroup: ' +
                            'EEGroup needs at least one member.');
        }

        // Checking if each ee exist.
        for (i = 1; i < len; i++) {
            if ('string' !== typeof arguments[i]) {
                throw new TypeError('EventEmitterManager.createEEGroup: ' +
                                    'EventEmitter name must be string.');
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
     * @param {string} eventName The name of the event
     *
     * @return {mixed} The values returned by all fired event listeners
     *
     * @see EventEmitterManager.emit
     */
    EventEmitterManager.prototype.emit = function(eventName) {
        var i, tmpRes, res, args, len, ees;

        if ('string' !== typeof eventName) {
            throw new TypeError(
                'EventEmitterManager.emit: eventName must be string.');
        }
        res = [];

        len = arguments.length;

        // The scope might `node` if this method is invoked from `node.emit`.
        ees = this.ee || this.events.ee;

        // The arguments object must not be passed or leaked anywhere.
        switch(len) {

        case 1:
            tmpRes = ees.ng.emit(eventName);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.game.emit(eventName);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.stage.emit(eventName);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.step.emit(eventName);
            if (tmpRes) res.push(tmpRes);
            break;
        case 2:
            tmpRes = ees.ng.emit(eventName, arguments[1]);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.game.emit(eventName, arguments[1]);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.stage.emit(eventName, arguments[1]);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.step.emit(eventName, arguments[1]);
            if (tmpRes) res.push(tmpRes);
            break;
        case 3:
            tmpRes = ees.ng.emit(eventName, arguments[1], arguments[2]);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.game.emit(eventName, arguments[1], arguments[2]);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.stage.emit(eventName, arguments[1], arguments[2]);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.step.emit(eventName, arguments[1], arguments[2]);
            if (tmpRes) res.push(tmpRes);
            break;
        default:
            args = new Array(len);
            for (i = -1 ; ++i < len ; ) {
                args[i] = arguments[i];
            }
            tmpRes = ees.ng.emit.apply(ees.ng, args);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.game.emit.apply(ees.game, args);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.stage.emit.apply(ees.stage, args);
            if (tmpRes) res.push(tmpRes);
            tmpRes = ees.step.emit.apply(ees.step, args);
            if (tmpRes) res.push(tmpRes);
        }

        // If there are less than 2 elements, unpack the array.
        // res[0] is either undefined or some value.
        return res.length < 2 ? res[0] : res;
    };

    /**
     * ### EventEmitterManager.emitAsync
     *
     * Emits an event on all registered event emitters asynchrounsly
     *
     * Accepts a variable number of input parameters.
     *
     * @param {string} eventName The name of the event
     *
     * @see EventEmitterManager.emit
     */
    EventEmitterManager.prototype.emitAsync = function(eventName) {
        var i, len, args, ees;

        if ('string' !== typeof eventName) {
            throw new TypeError(
                'EventEmitterManager.emit: eventName must be string.');
        }

        len = arguments.length;

        // The scope might `node` if this method is invoked from `node.emit`.
        ees = this.ee || this.events.ee;

        // The arguments object must not be passed or leaked anywhere.
        switch(len) {

        case 1:
            ees.ng.emitAsync(eventName);
            ees.game.emitAsync(eventName);
            ees.stage.emitAsync(eventName);
            ees.step.emitAsync(eventName);
            break;
        case 2:
            ees.ng.emitAsync(eventName, arguments[1]);
            ees.game.emitAsync(eventName, arguments[1]);
            ees.stage.emitAsync(eventName, arguments[1]);
            ees.step.emitAsync(eventName, arguments[1]);
            break;
        case 3:
            ees.ng.emitAsync(eventName, arguments[1], arguments[2]);
            ees.game.emitAsync(eventName, arguments[1], arguments[2]);
            ees.stage.emitAsync(eventName, arguments[1], arguments[2]);
            ees.step.emitAsync(eventName, arguments[1], arguments[2]);
            break;
        default:
            args = new Array(len);
            for (i = -1 ; ++i < len ; ) {
                args[i] = arguments[i];
            }
            ees.ng.emitAsync.apply(ees.ng, args);
            ees.game.emitAsync.apply(ees.game, args);
            ees.stage.emitAsync.apply(ees.stage, args);
            ees.step.emitAsync.apply(ees.step, args);
        }
    };

    /**
     * ### EventEmitterManager.remove
     *
     * Removes an event / event listener from all registered event emitters
     *
     * @param {string} eventName The name of the event
     * @param {function} listener Optional A reference of the function to remove
     *
     * @return {boolean} TRUE if the listener was found and removed
     */
    EventEmitterManager.prototype.remove = function(eventName, listener) {
        var i, res, tmpRes;
        if ('string' !== typeof eventName) {
            throw new TypeError('EventEmitterManager.remove: ' +
                                'eventName must be string.');
        }
        if (listener &&
            ('function' !== typeof listener && 'string' !== typeof listener)) {
            throw new TypeError('EventEmitter.remove (' + this.name +
                                '): listener must be function, string, or ' +
                               'undefined.');
        }
        res = false;
        for (i in this.ee) {
            if (this.ee.hasOwnProperty(i)) {
                tmpRes = this.ee[i].remove(eventName, listener);
                res = res || !!tmpRes.length;
            }
        }
        return res;
    };

    /**
     * ### EventEmitterManager.remove
     *
     * Prints all registered events
     *
     * @param {string} eventEmitterName Optional The name of the event emitter
     */
    EventEmitterManager.prototype.printAll = function(eventEmitterName) {
        var i, total;
        if (eventEmitterName && 'string' !== typeof eventEmitterName) {
            throw new TypeError('EventEmitterManager.printAll: ' +
                                'eventEmitterName must be string or ' +
                                'undefined.');
        }
        if (eventEmitterName && !this.ee[eventEmitterName]) {
            throw new TypeError('EventEmitterManager.printAll: event' +
                                'emitter not found: ' + eventEmitterName + '.');
        }
        if (eventEmitterName) {
            this.ee[eventEmitterName].printAll();
        }
        else {
            total = 0;
            for (i in this.ee) {
                if (this.ee.hasOwnProperty(i)) {
                    total += this.ee[i].printAll();
                }
            }
            console.log('Total number of registered listeners: ' + total + '.');
        }
    };

    /**
     * ### EventEmitterManager.getAll
     *
     * Returns all registered events
     *
     * @param {string} eventEmitterName Optional The name of the event emitter
     */
    EventEmitterManager.prototype.getAll = function(eventEmitterName) {
        var i, events;
        if (eventEmitterName && 'string' !== typeof eventEmitterName) {
            throw new TypeError('EventEmitterManager.printAll: ' +
                                'eventEmitterName must be string or ' +
                                'undefined.');
        }
        if (eventEmitterName && !this.ee[eventEmitterName]) {
            throw new TypeError('EventEmitterManager.printAll: event' +
                                'emitter not found: ' + eventEmitterName + '.');
        }
        if (eventEmitterName) {
            events = this.ee[eventEmitterName].events;
        }
        else {
            events = {};
            for (i in this.ee) {
                if (this.ee.hasOwnProperty(i)) {
                    events[i] = this.ee[i].events;
                }
            }
        }
        return events;
    };

    /**
     * ### EventEmitterManager.getChanges
     *
     * Returns the list of changes from all event emitters
     *
     * Considered event emitters: ng, game, stage, step.
     *
     * @param {boolean} clear Optional. If TRUE, the list of current changes
     *   is cleared. Default FALSE
     *
     * @return {object} Object containing changes for all event emitters, or
     *   null if no changes have been recorded
     *
     * @see EventEmitter.getChanges
     */
    EventEmitterManager.prototype.getChanges = function(clear) {
        var changes, tmp;
        changes = {};
        tmp = this.ee.ng.getChanges(clear);
        if (tmp) changes.ng = tmp;
        tmp = this.ee.game.getChanges(clear);
        if (tmp) changes.game = tmp;
        tmp = this.ee.stage.getChanges(clear);
        if (tmp) changes.stage = tmp;
        tmp = this.ee.step.getChanges(clear);
        if (tmp) changes.step = tmp;
        return J.isEmpty(changes) ? null : changes;
    };

    /**
     * ### EventEmitterManager.setRecordChanges
     *
     * Sets the value of recordChanges for all event emitters and returns it
     *
     * If called with undefined, just returns current value.
     *
     * @param {boolean} record If TRUE, starts recording changes. Default FALSE
     *
     * @return {object} Current values of recordChanges for all event emitters
     *
     * @see EventEmitter.recordChanges
     */
    EventEmitterManager.prototype.setRecordChanges = function(record) {
        var out;
        out = {};
        out.ng = this.ee.ng.setRecordChanges(record);
        out.game = this.ee.game.setRecordChanges(record);
        out.stage = this.ee.stage.setRecordChanges(record);
        out.step = this.ee.step.setRecordChanges(record);
        return out;
    };

    /**
     * ## EventHistory constructor
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
            node.warn('no event history was found to remit');
            return false;
        }

        node.silly('remitting ' + node.events.history.count() + ' events');

        if (stage) {

            this.history.rebuildIndexes();

            hash = new GameStage(stage).toHash('S.s.r');

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
        // TODO NDDB commands have changed, update
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
