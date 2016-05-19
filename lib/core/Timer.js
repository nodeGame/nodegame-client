/**
 * # Timer
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Timing-related utility functions
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;

    // Exposing Timer constructor
    exports.Timer = Timer;

    /**
     * ## Timer constructor
     *
     * Creates a new instance of Timer
     *
     * @param {NodeGameClient} node. A valid NodeGameClient object
     * @param {object} settings Optional. A configuration object
     */
    function Timer(node, settings) {
        this.node = node;

        this.settings = settings || {};

        /**
         * ### Timer.timers
         *
         * Collection of currently active timers created by `Timer.createTimer`
         * @see Timer.createTimer
         */
        this.timers = {};

        /**
         * ### Timer.timestamps
         *
         * Named timestamp collection
         *
         * Maps names to numbers (milliseconds since epoch)
         *
         * @see Timer.setTimestamp
         * @see Timer.getTimestamp
         * @see Timer.getTimeSince
         */
        this.timestamps = {};
    }

    // ## Timer methods

    /**
     * ### Timer.createTimer
     *
     * Returns a new GameTimer
     *
     * The GameTimer instance is automatically paused and resumed on
     * the respective events.
     *
     * Timer creation is flexible, and input parameter can be a full
     * configuration object, the number of millieconds or nothing. In the
     * latter case, the new timer will need to be configured manually. If
     * only the number of milliseconds is passed the timer will fire a 'TIMEUP'
     * event once the time expires.
     *
     * @param {mixed} options The configuration object passed to the GameTimer
     *   constructor. Alternatively, it is possble to pass directly the number
     *   of milliseconds and the remaining settings will be added, or to leave
     *   it undefined.
     *
     * @return {GameTimer} timer The requested timer
     *
     * @see GameTimer
     */
    Timer.prototype.createTimer = function(options) {
        var gameTimer, pausedCb, resumedCb;
        var ee;

        if (options &&
            ('object' !== typeof options && 'number' !== typeof options)) {

            throw new TypeError('Timer.createTimer: options must be ' +
                                'undefined, object or number.');
        }

        if ('number' === typeof options) options = { milliseconds: options };
        options = options || {};

        options.name = options.name ||
            J.uniqueKey(this.timers, 'timer_' + J.randomInt(0, 10000000));

        if (this.timers[options.name]) {
            throw new Error('Timer.createTimer: timer ' + options.name +
                            ' already existing.');
        }

        // If game is paused add options startPaused, unless user
        // specified a value in the options object.
        if (this.node.game && this.node.game.paused) {
            if ('undefined' === typeof options.startPaused) {
                options.startPaused = true;
            }
        }

        ee = this.node.getCurrentEventEmitter();

        options.eventEmitterName = ee.name;

        // Create the GameTimer:
        gameTimer = new GameTimer(this.node, options);

        // Attach pause / resume listeners:
        pausedCb = function() {
            if (!gameTimer.isPaused()) {
                gameTimer.pause();
            }
        };
        resumedCb = function() {
            // startPaused=true also counts as a "paused" state:
            if (gameTimer.isPaused() || gameTimer.startPaused) {
                gameTimer.resume();
            }
        };

        ee.on('PAUSED', pausedCb);
        ee.on('RESUMED', resumedCb);

        // Attach listener handlers to GameTimer object so they can be
        // unregistered later:
        gameTimer.timerPausedCallback = pausedCb;
        gameTimer.timerResumedCallback = resumedCb;

        // Add a reference into this.timers.
        this.timers[gameTimer.name] = gameTimer;

        return gameTimer;
    };

    /**
     * ### Timer.destroyTimer
     *
     * Stops and removes a GameTimer
     *
     * The event handlers listening on PAUSED/RESUMED that are attached to
     * the given GameTimer object are removed.
     *
     * @param {object|string} gameTimer The gameTimer object or the name of
     *   the gameTimer created with Timer.createTimer
     */
    Timer.prototype.destroyTimer = function(gameTimer) {
        var eeName;
        if ('string' === typeof gameTimer) {
            if (!this.timers[gameTimer]) {
                throw new Error('node.timer.destroyTimer: gameTimer not ' +
                                'found: ' + gameTimer + '.');
            }
            gameTimer = this.timers[gameTimer];
        }
        if ('object' !== typeof gameTimer) {
            throw new Error('node.timer.destroyTimer: gameTimer must be ' +
                            'string or object.');
        }

        // Stop timer.
        if (!gameTimer.isStopped()) {
            gameTimer.stop();
        }

        eeName = gameTimer.eventEmitterName;
        // Detach listeners.
        if (eeName) {
            // We know where the timer was registered.
            this.node.events.ee[eeName].remove('PAUSED',
                                               gameTimer.timerPausedCallback);
            this.node.events.ee[eeName].remove('RESUMED',
                                               gameTimer.timerResumedCallback);
        }
        else {
            // We try to unregister from all.
            this.node.off('PAUSED', gameTimer.timerPausedCallback);
            this.node.off('RESUMED', gameTimer.timerResumedCallback);
        }

        // Remove listener syncing with stager (if any).
        gameTimer.syncWithStager(false);

        // Delete reference in this.timers.
        delete this.timers[gameTimer.name];
    };

    /**
     * ### Timer.destroyAllTimers
     *
     * Stops and removes all registered GameTimers
     */
    Timer.prototype.destroyAllTimers = function() {
        for (var i in this.timers) {
            if (this.timers.hasOwnProperty(i)) {
                this.destroyTimer(this.timers[i]);
            }
        }
    };

    // ## Helper Methods.

    /**
     * ### randomFire
     *
     * Common handler for randomEmit, randomExec, randomDone
     *
     * @param {string} method The name of the method invoking randomFire
     * @param {string|function} hook The function to call or the event to emit
     * @param {number} maxWait Optional. The max number of milliseconds
     *   to wait before firing
     * @param {boolean} emit TRUE, if it is an event to emit
     * @param {object|function} ctx Optional. The context of execution for
     *   the function
     */
    function randomFire(method, hook, maxWait, emit, ctx, args) {
        var that;
        var waitTime;
        var callback;
        var timerObj;
        var tentativeName;

        that = this;

        if ('undefined' === typeof maxWait) {
            maxWait = 6000;
        }
        else if ('number' !== typeof maxWait) {
            throw new TypeError('Timer.' + method + ': maxWait must ' +
                                    'be number or undefined.');
        }

        waitTime = Math.random() * maxWait;

        // Define timeup callback:
        if (emit) {
            callback = function() {
                that.destroyTimer(timerObj);
                if (args) {
                    that.node.emit.apply(that.node.events, [hook].concat(args));
                }
                else {
                    that.node.emit(hook);
                }
            };
        }
        else {
            callback = function() {
                that.destroyTimer(timerObj);
                hook.apply(ctx, args);
            };
        }

        tentativeName = method + '_' + hook + '_' + J.randomInt(0, 1000000);


        // Create and run timer:
        timerObj = this.createTimer({
            milliseconds: waitTime,
            timeup: callback,
            name: J.uniqueKey(this.timers, tentativeName)
        });

        // TODO: check if this condition is ok.
        if (this.node.game && this.node.game.isReady()) {
            timerObj.start();
        }
        else {
            // TODO: this is not enough. Does not cover all use cases.
            this.node.once('PLAYING', function() {
                timerObj.start();
            });
        }
    }

    /**
     * ### Timer.setTimestamp
     *
     * Adds or changes a named timestamp
     *
     * @param {string} name The name of the timestamp
     * @param {number|undefined} time Optional. The time in ms as returned by
     *   Date.getTime(). Default: Current time.
     */
    Timer.prototype.setTimestamp = function(name, time) {
        // Default time: Current time
        if ('undefined' === typeof time) time = (new Date()).getTime();

        // Check inputs:
        if ('string' !== typeof name) {
            throw new Error('Timer.setTimestamp: name must be a string');
        }
        if ('number' !== typeof time) {
            throw new Error('Timer.setTimestamp: time must be a number or ' +
                            'undefined');
        }

        this.timestamps[name] = time;
    };

    /**
     * ### Timer.getTimestamp
     *
     * Retrieves a named timestamp
     *
     * @param {string} name The name of the timestamp
     *
     * @return {number|null} The time associated with the timestamp,
     *   NULL if it doesn't exist
     */
    Timer.prototype.getTimestamp = function(name) {
        // Check input:
        if ('string' !== typeof name) {
            throw new Error('Timer.getTimestamp: name must be a string');
        }

        if (this.timestamps.hasOwnProperty(name)) {
            return this.timestamps[name];
        }
        else {
            return null;
        }
    };

    /**
     * ### Timer.getAllTimestamps
     *
     * Returns the map with all timestamps
     *
     * Do not change the returned object.
     *
     * @return {object} The timestamp map
     */
    Timer.prototype.getAllTimestamps = function() {
        return this.timestamps;
    };

    /**
     * ### Timer.getTimeSince
     *
     * Gets the time in ms since a timestamp
     *
     * @param {string} name The name of the timestamp
     *
     * @return {number|null} The time since the timestamp in ms,
     *   NULL if it doesn't exist
     *
     * @see Timer.getTimeDiff
     */
    Timer.prototype.getTimeSince = function(name) {
        var currentTime;

        // Get current time:
        currentTime = (new Date()).getTime();

        // Check input:
        if ('string' !== typeof name) {
            throw new TypeError('Timer.getTimeSince: name must be string.');
        }

        if (this.timestamps.hasOwnProperty(name)) {
            return currentTime - this.timestamps[name];
        }
        else {
            return null;
        }
    };

    /**
     * ### Timer.getTimeDiff
     *
     * Returns the time difference between two registered timestamps
     *
     * @param {string} nameFrom The name of the first timestamp
     * @param {string} nameTo The name of the second timestamp
     *
     * @return {number} The time difference between the timestamps
     */
    Timer.prototype.getTimeDiff = function(nameFrom, nameTo) {
        var timeFrom, timeTo;

        // Check input:
        if ('string' !== typeof nameFrom) {
            throw new TypeError('Timer.getTimeDiff: nameFrom must be string.');
        }
        if ('string' !== typeof nameTo) {
            throw new TypeError('Timer.getTimeDiff: nameTo must be string.');
        }

        timeFrom = this.timestamps[nameFrom];

        if ('undefined' === typeof timeFrom || timeFrom === null) {
            throw new Error('Timer.getTimeDiff: nameFrom does not resolve to ' +
                            'a valid timestamp.');
        }

        timeTo = this.timestamps[nameTo];

        if ('undefined' === typeof timeTo || timeTo === null) {
            throw new Error('Timer.getTimeDiff: nameTo does not resolve to ' +
                            'a valid timestamp.');
        }

        return timeTo - timeFrom;
    };

    /**
     * ### Timer.getTimer
     *
     * Returns a reference to a previosly registered game timer.
     *
     * @param {string} name The name of the timer
     *
     * @return {GameTimer|null} The game timer with the given name, or
     *   null if none is found
     */
    Timer.prototype.getTimer = function(name) {
        if ('string' !== typeof name) {
            throw new TypeError('Timer.getTimer: name must be string.');
        }
        return this.timers[name] || null;
    };

    /**
     * ### Timer.randomEmit
     *
     * Emits an event after a random time interval between 0 and maxWait
     *
     * Respects pausing / resuming.
     *
     * Additional parameters are passed to the
     *
     * @param {string} event The name of the event
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before emitting the event. Default: 6000
     *
     * @see randomFire
     */
    Timer.prototype.randomEmit = function(event, maxWait) {
        var args, i, len;
        if ('string' !== typeof event) {
            throw new TypeError('Timer.randomEmit: event must be string.');
        }
        len = arguments.length;
        if (len == 3) {
            args = [arguments[2]];
        }
        else if (len === 4) {
            args = [arguments[2], arguments[3]];
        }
        else if (len > 4) {
            i = -1, len = (len-2);
            args = new Array(len);
            for ( ; ++i < len ; ) {
                args[i] = arguments[i+2];
            }
        }
        randomFire.call(this, 'randomEmit', event, maxWait, true, null, args);
    };

    /**
     * ### Timer.randomExec
     *
     * Executes a callback function after a random time interval
     *
     * Respects pausing / resuming.
     *
     * @param {function} func The callback function to execute
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before executing the callback. Default: 6000
     * @param {object|function} ctx Optional. The context of execution of
     *   of the callback function. Default node.game
     *
     * @see randomFire
     */
    Timer.prototype.randomExec = function(func, maxWait, ctx) {
        var args, i, len;
        if ('function' !== typeof func) {
            throw new TypeError('Timer.randomExec: func must be function.');
        }
        if ('undefined' === typeof ctx) {
            ctx = this.node.game;
        }
        else if ('object' !== typeof ctx && 'function' !== typeof ctx) {
            throw new TypeError('Timer.randomExec: ctx must be object, ' +
                                'function or undefined.');
        }
        len = arguments.length;
        if (len == 4) {
            args = [arguments[3]];
        }
        else if (len === 5) {
            args = [arguments[3], arguments[4]];
        }
        else if (len > 5) {
            i = -1, len = (len-3);
            args = new Array(len);
            for ( ; ++i < len ; ) {
                args[i] = arguments[i+3];
            }
        }
        randomFire.call(this, 'randomExec', func, maxWait, false, ctx, args);
    };

    /**
     * ### Timer.randomDone
     *
     * Executes node.done after a random time interval
     *
     * Respects pausing / resuming.
     *
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before executing the callback. Default: 6000
     *
     * @see randomFire
     */
    Timer.prototype.randomDone = function(maxWait) {
        var args, i, len;
        len = arguments.length;
        if (len == 2) {
            args = [arguments[1]];
        }
        else if (len === 3) {
            args = [arguments[1], arguments[2]];
        }
        else if (len > 3) {
            i = -1, len--;
            args = new Array(len);
            for ( ; ++i < len ; ) {
                args[i] = arguments[i+1];
            }
        }
        randomFire.call(this, 'randomDone', this.node.done,
                        maxWait, false, this.node, args);
    };

    /**
     * # GameTimer
     *
     * Copyright(c) 2015 Stefano Balietti
     * MIT Licensed
     *
     * Creates a controllable timer object for nodeGame.
     */
    exports.GameTimer = GameTimer;

    /**
     * ### GameTimer status levels
     * Numerical levels representing the state of the GameTimer
     *
     * @see GameTimer.status
     */
    GameTimer.STOPPED = -5;
    GameTimer.PAUSED = -3;
    GameTimer.UNINITIALIZED = -1;
    GameTimer.INITIALIZED = 0;
    GameTimer.LOADING = 3;
    GameTimer.RUNNING = 5;

    /**
     * ## GameTimer constructor
     *
     * Creates an instance of GameTimer
     *
     * @param {object} options. Optional. A configuration object
     */
    function GameTimer(node, options) {
        options = options || {};

        // ## Public properties

        /**
         * ### node
         *
         * Internal reference to node.
         */
        this.node = node;

        /**
         * ### name
         *
         * Internal name of the timer.
         */
        this.name = options.name || 'timer_' + J.randomInt(0, 1000000);

        /**
         * ### GameTimer.status
         *
         * Numerical index keeping the current the state of the GameTimer obj.
         */
        this.status = GameTimer.UNINITIALIZED;

        /**
         * ### GameTimer.options
         *
         * The current settings for the GameTimer.
         */
        this.options = options;

        /**
         * ### GameTimer.timerId
         *
         * The ID of the javascript interval.
         */
        this.timerId = null;

        /**
         * ### GameTimer.timeLeft
         *
         * Milliseconds left before time is up.
         */
        this.timeLeft = null;

        /**
         * ### GameTimer.timePassed
         *
         * Milliseconds already passed from the start of the timer.
         */
        this.timePassed = 0;

        /**
         * ### GameTimer.update
         *
         * The frequency of update for the timer (in milliseconds).
         */
        this.update = undefined;

        /**
         * ### GameTimer.updateRemaining
         *
         * Milliseconds remaining for current update.
         */
        this.updateRemaining = 0;

        /**
         * ### GameTimer.updateStart
         *
         * Timestamp of the start of the last update
         */
        this.updateStart = 0;

        /**
         * ### GameTimer.startPaused
         *
         * Whether to enter the pause state when starting
         */
        this.startPaused = null;

        /**
         * ### GameTimer.timeup
         *
         * Event string or function to fire when the time is up
         *
         * @see GameTimer.fire
         */
        this.timeup = 'TIMEUP';

        /**
         * ### GameTimer.hooks
         *
         * Array of hook functions to fire at every update
         *
         * The array works as a LIFO queue
         *
         * @see GameTimer.fire
         */
        this.hooks = [];

        /**
         * ### GameTimer.hookNames
         *
         * Object containing all names used for the hooks
         *
         * @see GameTimer.hooks
         */
        this.hookNames = {};

        /**
         * ### GameTimer.hookNames
         *
         * The name of the event emitter where the timer was registered
         *
         * @see EventEmitter
         */
        this.eventEmitterName = null;

        /**
         * ## GameTimer.stagerSync
         *
         * TRUE if the timer is synced with stager
         *
         * It will use GameTimer.stagerProperty to sync
         *
         * @see GameTimer.stagerProperty
         * @see GameTimer.syncWithStager
         */
        this.stagerSync = false;

        /**
         * ## GameTimer.stagerProperty
         *
         * The name of the property used to sync with the stager
         *
         * @see GameTimer.stagerSync
         */
        this.stagerProperty = 'timer';

        // Init!
        this.init();
    }

    // ## GameTimer methods

    /**
     * ### GameTimer.init
     *
     * Inits the GameTimer
     *
     * Takes the configuration as an input parameter or
     * recycles the settings in `this.options`.
     *
     * The configuration object is of the type
     *
     *  var options = {
     *      // The length of the interval.
     *      milliseconds: 4000,
     *      // How often to update the time counter. Default: milliseconds
     *      update: 1000,
     *      // An event or function to fire when the timer expires.
     *      timeup: 'MY_EVENT',
     *      hooks: [
     *              // Array of functions or events to fire at every update.
     *              myFunc,
     *              'MY_EVENT_UPDATE',
     *              { hook: myFunc2,
     *                ctx: that, },
     *              ],
     *      // Sync with the 'timer' property of the stager
     *      stagerSync: true,
     *      // Name of the property to listen to (Default 'timer')
     *      stagerProperty: 'timer'
     *  }
     *  // Units are in milliseconds.
     *
     * Note: if `milliseconds` is a negative number the timer fires
     * immediately.
     *
     * @param {object} options Optional. Configuration object
     *
     * @see GameTimer.addHook
     */
    GameTimer.prototype.init = function(options) {
        var i, len;
        options = options || this.options;

        this.status = GameTimer.UNINITIALIZED;
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.milliseconds = options.milliseconds;
        this.update = options.update || this.update || this.milliseconds;
        this.timeLeft = this.milliseconds;
        this.timePassed = 0;
        this.updateStart = 0;
        this.updateRemaining = 0;
        // Event to be fired when timer expires.
        this.timeup = options.timeup || 'TIMEUP';
        // TODO: update and milliseconds must be multiple now.
        if (options.hooks) {
            len = options.hooks.length;
            for (i = 0; i < len; i++) {
                this.addHook(options.hooks[i]);
            }
        }

        // Set startPaused option. if specified. Default: FALSE
        this.startPaused = 'undefined' !== options.startPaused ?
            options.startPaused : false;

        // Only set status to INITIALIZED if all of the state is valid and
        // ready to be used by this.start etc.
        if (checkInitialized(this) === null) {
            this.status = GameTimer.INITIALIZED;
        }

        if ('string' === typeof options.eventEmitterName) {
            this.eventEmitterName = options.eventEmitterName;
        }

        // Stager sync options.
        if ('undefined' !== typeof options.stagerSync) {
            this.syncWithStager(options.stagerSync);
        }
        if ('undefined' !== typeof options.stagerProperty) {
            this.setStagerProperty(options.stagerProperty);
        }
    };


    /**
     * ### GameTimer.fire
     *
     * Fires a registered hook
     *
     * If hook is a string it is emitted as an event,
     * otherwise it is called as a function.
     *
     * @param {mixed} h The hook to fire (object, function, or string)
     */
    GameTimer.prototype.fire = function(h) {
        var hook, ctx;

        if ('object' === typeof h) {
            hook = h.hook;
            ctx = h.ctx;
            h = hook;
        }

        if ('function' === typeof h) {
            h.call(ctx || this.node.game);
        }
        else if ('string' === typeof h) {
            this.node.emit(h);
        }
        else {
            throw new TypeError('GameTimer.fire: h must be function, string ' +
                                'or object.');
        }
    };

    /**
     * ### GameTimer.start
     *
     * Starts the timer
     *
     * Updates the status of the timer and calls `setInterval`
     * At every update all the registered hooks are fired, and
     * time left is checked.
     *
     * When the timer expires the timeup event is fired, and the
     * timer is stopped
     *
     * @see GameTimer.status
     * @see GameTimer.timeup
     * @see GameTimer.fire
     */
    GameTimer.prototype.start = function() {
        var error, that;

        // Check validity of state
        error = checkInitialized(this);
        if (error !== null) {
            throw new Error('GameTimer.start: ' + error);
        }

        if (this.isRunning()) {
            throw new Error('GameTimer.start: timer is already running.');
        }

        this.status = GameTimer.LOADING;

        if (this.startPaused) {
            this.pause();
            return;
        }

        // Remember time of start (used by this.pause to compute remaining time)
        this.updateStart = (new Date()).getTime();

        // Fires the event immediately if time is zero.
        // Double check necessary in strict mode.
        if ('undefined' !== typeof this.options.milliseconds &&
                this.options.milliseconds === 0) {
            this.stop();
            this.fire(this.timeup);
            return;
        }

        this.updateRemaining = this.update;

        that = this;
        // It is not possible to pass extra parameters to updateCallback,
        // by adding them after _this.update_. In IE does not work.
        this.timerId = setInterval(function() {
            updateCallback(that);
        }, this.update);
    };

    /**
     * ### GameTimer.addHook
     *
     * Add an hook to the hook list after performing conformity checks.
     * The first parameter hook can be a string, a function, or an object
     * containing an hook property.
     *
     * @params {mixed} hook Either the hook to be called or an object containing
     *  at least the hook to be called and possibly even ctx and name
     * @params {object} ctx A reference to the context wherein the hook is
     *  called.
     * @params {string} name The name of the hook. If not provided, this method
     *  provides an uniqueKey for the hook
     *
     * @returns {mixed} The name of the hook, if it was added; false otherwise.
     */
    GameTimer.prototype.addHook = function(hook, ctx, name) {
        var i;

        if (!hook) {
            throw new Error('GameTimer.addHook: missing argument');
        }
        ctx = ctx || this.node.game;
        if (hook.hook) {
            ctx = hook.ctx || ctx;
            if(hook.name) {
                name = hook.name;
            }
            hook = hook.hook;
        }
        if (!name) {
            name = J.uniqueKey(this.hookNames, 'timerHook');
        }
        for (i = 0; i < this.hooks.length; i++) {
            if (this.hooks[i].name === name) {
                return false;
            }
        }
        this.hookNames[name] = true;
        this.hooks.push({hook: hook, ctx: ctx, name: name});
        return name;
    };

    /*
     * ### GameTimer.removeHook
     *
     * Removes a hook given its' name
     *
     * @param {string} name Name of the hook to be removed
     * @return {mixed} the hook if it was removed; false otherwise.
     */
    GameTimer.prototype.removeHook = function(name) {
        var i;
        if (this.hookNames[name]) {
            for (i = 0; i < this.hooks.length; i++) {
                if (this.hooks[i].name === name) {
                    delete this.hookNames[name];
                    return this.hooks.splice(i,1);
                }
            }
        }
        return false;
    };

    /**
     * ### GameTimer.pause
     *
     * Pauses the timer
     *
     * If the timer was running, clear the interval and sets the
     * status property to `GameTimer.PAUSED`.
     */
    GameTimer.prototype.pause = function() {
        var timestamp;

        if (this.isRunning()) {
            clearInterval(this.timerId);
            clearTimeout(this.timerId);
            this.timerId = null;

            this.status = GameTimer.PAUSED;

            // Save time of pausing.
            // If start was never called, or called with startPaused on.
            if (this.updateStart === 0) {
                this.updateRemaining = this.update;
            }
            else {
                // Save the difference of time left.
                timestamp = (new Date()).getTime();
                this.updateRemaining =
                    this.update - (timestamp - this.updateStart);
            }
        }
        else if (this.status === GameTimer.STOPPED) {
            // If the timer was explicitly stopped, we ignore the pause:
            return;
        }
        else if (!this.isPaused()) {
            // pause() was called before start(); remember it:
            this.startPaused = true;
        }
        else {
            throw new Error('GameTimer.pause: timer was already paused');
        }
    };

    /**
     * ### GameTimer.resume
     *
     * Resumes a paused timer
     *
     * If the timer was paused, restarts it with the current configuration
     *
     * @see GameTimer.restart
     */
    GameTimer.prototype.resume = function() {
        var that = this;

        // Don't start if the initialization is incomplete (invalid state):
        if (this.status === GameTimer.UNINITIALIZED) {
            this.startPaused = false;
            return;
        }

        if (!this.isPaused() && !this.startPaused) {
            throw new Error('GameTimer.resume: timer was not paused');
        }

        this.status = GameTimer.LOADING;

        this.startPaused = false;

        this.updateStart = (new Date()).getTime();

        // Run rest of this "update" interval:
        this.timerId = setTimeout(function() {
            if (updateCallback(that)) {
                // start() needs the timer to not be running.
                that.status = GameTimer.INITIALIZED;

                that.start();

                // start() sets status to LOADING, so change it back to RUNNING.
                that.status = GameTimer.RUNNING;
            }
        }, this.updateRemaining);
    };

    /**
     * ### GameTimer.stop
     *
     * Stops the timer
     *
     * If the timer was paused or running, clear the interval, sets the
     * status property to `GameTimer.STOPPED`, and reset the time passed
     * and time left properties
     */
    GameTimer.prototype.stop = function() {
        if (this.isStopped()) {
            throw new Error('GameTimer.stop: timer was not running');
        }

        this.status = GameTimer.STOPPED;
        clearInterval(this.timerId);
        clearTimeout(this.timerId);
        this.timerId = null;
        this.timePassed = 0;
        this.timeLeft = null;
    };

    /**
     * ### GameTimer.restart
     *
     * Restarts the timer
     *
     * Uses the input parameter as configuration object,
     * or the current settings, if undefined
     *
     * @param {object} options Optional. A configuration object
     *
     * @see GameTimer.init
     */
    GameTimer.prototype.restart = function(options) {
        if (!this.isStopped()) {
            this.stop();
        }
        this.init(options);
        this.start();
    };

    /**
     * ### GameTimer.isRunning
     *
     * Returns whether timer is running
     *
     * Running means either LOADING or RUNNING.
     */
    GameTimer.prototype.isRunning = function() {
        return (this.status > 0);
    };

    /**
     * ### GameTimer.isStopped
     *
     * Returns whether timer is stopped
     *
     * Stopped means either UNINITIALIZED, INITIALIZED or STOPPED.
     *
     * @see GameTimer.isPaused
     */
    GameTimer.prototype.isStopped = function() {
        if (this.status === GameTimer.UNINITIALIZED ||
            this.status === GameTimer.INITIALIZED ||
            this.status === GameTimer.STOPPED) {

            return true;
        }
        else {
            return false;
        }
    };

    /**
     * ### GameTimer.isPaused
     *
     * Returns whether timer is paused
     */
    GameTimer.prototype.isPaused = function() {
        return this.status === GameTimer.PAUSED;
    };

    /**
     * ### GameTimer.isPaused
     *
     * Return TRUE if the time expired
     */
    GameTimer.prototype.isTimeup = function() {
        // return this.timeLeft !== null && this.timeLeft <= 0;
        return this.timeLeft <= 0;
    };

    /**
     * ## GameTimer.syncWithStager
     *
     * Enables listeners to events and reads options from stager
     *
     * @param {boolean|undefined} sync TRUE to sync, FALSE to remove sync.
     *    If undefined no operation is performed, and simply the current
     *    value is returned.
     * @param {string} property Optiona. Name of the property of the stager
     *    from which load timer information. Default: 'timer'
     *
     * @return {boolean} TRUE if synced, FALSE otherwise
     *
     * @see GameTimer.setStagerProperty
     */
    GameTimer.prototype.syncWithStager = function(sync, property) {
        var node, that, ee;
        if ('undefined' === typeof sync) return this.stagerSync;
        if ('boolean' !== typeof sync) {
            throw new TypeError('GameTimer.syncWithStager: sync must be ' +
                                'boolean or undefined.');
        }
        if (property) {
            if ('string' !== typeof property) {
                throw new TypeError('GameTimer.syncWithStager: property ' +
                                    'must be string or undefined.');
            }
            this.setStagerProperty(property);
        }
        // Do nothing if no change of status is required.
        if (this.syncWithStager() === sync) return sync;
        node = this.node;
        ee = node.events[this.eventEmitterName];
        if (sync === true) {
            that = this;
            ee.on('PLAYING', function() {
                var options, step, prop;
                prop = that.getStagerProperty();
                step = node.game.getCurrentGameStage();
                options = processStepOptions(node, step, prop);
                if (options && options.startOnPlaying !== false) {
                    that.restart(options);
                }
            }, this.name + '_PLAYING');

            ee.on('REALLY_DONE', function() {

  //              if (that.options.stopOnDone) {

                    if (!that.isStopped()) {
                        // that.startWaiting();
                        that.stop();
                    }

//                }
            }, this.name + '_REALLY_DONE');
        }
        else {
            ee.off('PLAYING', this.name + '_PLAYING');
            ee.off('REALLY_DONE', this.name + '_REALLY_DONE');
        }

        // Store value.
        this.stagerSync = sync;
        return sync;
    };

    /**
     * ## GameTimer.setStagerProperty
     *
     * Sets the value of stagerProperty
     *
     * @param {string} property The property to set
     *
     * @see GameTimer.stagerProperty
     * @see GameTimer.getStagerProperty
     */
    GameTimer.prototype.setStagerProperty = function(property) {
        if ('string' === typeof property) {
            throw new TypeError('GameTimer.setStageProperty: property must ' +
                                'be string.');
        }
        this.stagerProperty = property;
    };

    /**
     * ## GameTimer.getStagerProperty
     *
     * Returns the current value of the stager property
     *
     * @return {string} stagerProperty
     *
     * @see GameTimer.setStagerProperty
     */
    GameTimer.prototype.getStagerProperty = function() {
        return this.stagerProperty;
    };

    // ## Helper methods.

    /**
     * ### processStepOptions
     *
     * Clones and cleans user options
     *
     * Adds the default 'timeup' function as `node.done`.
     *
     * @param {NodeGameClient} node Reference to node
     * @param {object} step current game step
     * @param {string} prop The name of the property containing timer info
     *
     * @return {object} options Validated configuration object, or null
     *   if no timer info is found for current step
     */
    function processStepOptions(node, step, prop) {
        var timer, options, typeofOptions, timeup;
        timer = node.game.plot.getProperty(step, prop);
        if (!timer) return null;

        // Build object.
        options = {};
        typeofOptions = typeof timer;
        switch (typeofOptions) {

        case 'number':
            options.milliseconds = timer;
            break;
        case 'object':
            if ('function' === typeof timer.milliseconds) {
                options.milliseconds = timer.milliseconds.call(node.game);
            }
            if (timer.timeup && 'function' !== typeof timer.timeup) {
                throw new TypeError('GameTimer processStepOptions: timeup ' +
                                    'must be function or undefined. Found: ' +
                                timer.timup);
            }
            options.timeup = timer.timeup;
            break;
        case 'function':
            options.milliseconds = timer.call(node.game);
            break;
        case 'string':
            options.milliseconds = Number(timer);
            break;
        }

        if (!options.milliseconds || options.milliseconds < 0) {
            throw new Error('GameTimer processStepOptions: milliseconds ' +
                            'must be a number >= 0. Found: ' +
                            options.milliseconds);
        }

        if ('undefined' === typeof options.timeup) {
            timer = node.game.plot.getProperty(step, 'timeup');
            options.timeup = timeup || function() { node.done(); };
        }
        if ('undefined' === typeof options.startOnPlaying) {
            options.startOnPlaying = true;
        }

        return options;
    }

    // Do a timer update.
    // Return false if timer ran out, true otherwise.
    function updateCallback(that) {
        that.status = GameTimer.RUNNING;
        that.timePassed += that.update;
        that.timeLeft -= that.update;
        that.updateStart = (new Date()).getTime();
        // Fire custom hooks from the latest to the first if any
        for (var i = that.hooks.length; i > 0; i--) {
            that.fire(that.hooks[(i-1)]);
        }
        // Fire Timeup Event
        if (that.timeLeft <= 0) {
            // First stop the timer and then call the timeup
            that.stop();
            that.fire(that.timeup);
            return false;
        }
        else {
            return true;
        }
    }

    // Check whether the timer has a valid initialized state.
    // Returns null if true, an error string otherwise.
    function checkInitialized(that) {
        if ('number' !== typeof that.milliseconds) {
            return 'this.milliseconds must be a number';
        }
        if (that.update > that.milliseconds) {
            return 'this.update must not be greater than this.milliseconds';
        }

        return null;
    }


    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
