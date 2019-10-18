/**
 * # Timer
 * Copyright(c) 2017 Stefano Balietti
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
        var that;
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

        /**
         * ### Timer.pausedTimestamps
         *
         * Collection of timestamps existing while game is paused
         *
         * Will be cleared on resume
         *
         * @see Timer.setTimestamp
         * @see Timer.getTimestamp
         * @see Timer.getTimeSince
         */
        this._pausedTimestamps = {};

        /**
         * ### Timer.cumulPausedTimestamps
         *
         * List of timestamps that had a paused time in between
         *
         * Persists after resume
         *
         * @see Timer.setTimestamp
         * @see Timer.getTimestamp
         * @see Timer.getTimeSince
         */
        this._cumulPausedTimestamps = {};

        /**
         * ### Timer._effectiveDiffs
         *
         * List of time differences between timestamps minus paused time
         *
         * Persists after resume
         *
         * @see Timer.setTimestamp
         * @see Timer.getTimestamp
         * @see Timer.getTimeSince
         */
        this._effectiveDiffs = {};

        that = this;
        this.node.on('PAUSED', function() {
            var i, ts;
            ts = that.getTimestamp('paused');
            for (i in that.timestamps) {
                if (that.timestamps.hasOwnProperty(i)) {
                    that._pausedTimestamps[i] = ts;
                }
            }
        });
        this.node.on('RESUMED', function() {
            var i, time, pt, cpt, pausedTime;
            pt = that._pausedTimestamps;
            cpt = that._cumulPausedTimestamps;
            time = J.now();
            for (i in pt) {
                if (pt[i] && pt.hasOwnProperty(i)) {
                    pausedTime = time - pt[i];
                    if (!cpt[i]) cpt[i] = pausedTime;
                    else cpt[i] += pausedTime;
                }
            }
            that._pausedTimestamps = {};
        });
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
     *   constructor. Alternatively, it is possible to pass directly the number
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
                                'undefined, object or number. Found: ' +
                                options);
        }

        if ('number' === typeof options) options = { milliseconds: options };
        options = options || {};

        options.name = options.name ||
            J.uniqueKey(this.timers, 'timer_' + J.randomInt(0, 10000000));

        if (this.timers[options.name]) {
            throw new Error('Timer.createTimer: timer name already in use: ' +
                            options.name);
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
                                'found: ' + gameTimer);
            }
            gameTimer = this.timers[gameTimer];
        }
        if ('object' !== typeof gameTimer) {
            throw new Error('node.timer.destroyTimer: gameTimer must be ' +
                            'string or object. Found: ' + gameTimer);
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


        // Set status to DESTROYED and make object unusable
        // (in case external references to the object still exists).
        gameTimer.status = GameTimer.DESTROYED;

        // Delete reference in this.timers.
        delete this.timers[gameTimer.name];
    };

    /**
     * ### Timer.destroyAllTimers
     *
     * Stops and removes all registered GameTimers
     *
     * By default, node.game.timer is not removed.
     *
     * @param {boolean} all Removes really all timers, including
     *    node.game.timer
     */
    Timer.prototype.destroyAllTimers = function(all) {
        var i;
        for (i in this.timers) {
            if (this.timers.hasOwnProperty(i)) {
                // Skip node.game.timer, unless so specified.
                if (!all && i === this.node.game.timer.name) continue;
                this.destroyTimer(this.timers[i]);
            }
        }
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
            throw new TypeError('Timer.getTimer: name must be string. Found: ' +
                                name);
        }
        return this.timers[name] || null;
    };

    /**
     * ### Timer.setTimestamp
     *
     * Adds or changes a named timestamp
     *
     * @param {string} name The name of the timestamp
     * @param {number|undefined} time Optional. The time in ms as returned by
     *   Date.getTime(). Default: Current time.
     *
     * @return {number} time The value of the timestamp set
     *
     * @see Timer.getTimestamp
     */
    Timer.prototype.setTimestamp = function(name, time) {
        var i;
        // Default time: Current time
        if ('undefined' === typeof time) time = J.now();

        // Check inputs:
        if ('string' !== typeof name) {
            throw new Error('Timer.setTimestamp: name must be a string. ' +
                            'Found: ' + name);
        }
        if ('number' !== typeof time) {
            throw new Error('Timer.setTimestamp: time must be a number or ' +
                            'undefined. Found: ' + time);
        }

        // We had at least one pause.
        if (this.node.game.pauseCounter) {
            // Remove records of paused timestamps.
            if (this._pausedTimestamps[name]) {
                this._pausedTimestamps[name] = null;
            }
            if (this._cumulPausedTimestamps[name]) {
                this._cumulPausedTimestamps[name] = null;
            }
            // Mark timestamp as paused since the beginning, if game is paused.
            if (this.node.game.isPaused()) this._pausedTimestamps[name] = time;

            // Diffs are updated immediately.
            this._effectiveDiffs[name] = {};
            for (i in this.timestamps) {
                if (this.timestamps.hasOwnProperty(i)) {
                    this._effectiveDiffs[name][i] = this.getTimeSince(i, true);
                }
            }
        }
        this.timestamps[name] = time;
        return time;
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
            throw new Error('Timer.getTimestamp: name must be a string. ' +
                            'Found: ' + name);
        }
        if (this.timestamps.hasOwnProperty(name)) return this.timestamps[name];
        else return null;
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
     * @param {boolean} effective Optional. If set, effective time
     *    is returned, i.e. time minus paused time. Default: false.
     *
     * @return {number|null} The time since the timestamp in ms,
     *   NULL if it doesn't exist
     *
     * @see Timer.getTimeDiff
     */
    Timer.prototype.getTimeSince = function(name, effective) {
        var currentTime;

        // Get current time:
        currentTime = J.now();

        // Check input:
        if ('string' !== typeof name) {
            throw new TypeError('Timer.getTimeSince: name must be string. ' +
                                'Found: ' + name);
        }

        if (this.timestamps.hasOwnProperty(name)) {
            if (effective) {
                if (this._pausedTimestamps[name]) {
                    currentTime -= (currentTime - this._pausedTimestamps[name]);
                }
                if (this._cumulPausedTimestamps[name]) {
                    currentTime -= this._cumulPausedTimestamps[name];
                }
            }
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
     * @param {boolean} effective Optional. If set, effective time
     *    is returned, i.e. time diff minus paused time. Default: false.
     *
     * @return {number} The time difference between the timestamps
     */
    Timer.prototype.getTimeDiff = function(nameFrom, nameTo, effective) {
        var timeFrom, timeTo, ed;

        // Check input:
        if ('string' !== typeof nameFrom) {
            throw new TypeError('Timer.getTimeDiff: nameFrom must be string.' +
                               'Found: ' + nameFrom);
        }
        if ('string' !== typeof nameTo) {
            throw new TypeError('Timer.getTimeDiff: nameTo must be string. ' +
                                'Found: ' + nameTo);
        }

        timeFrom = this.timestamps[nameFrom];

        if ('undefined' === typeof timeFrom || timeFrom === null) {
            throw new Error('Timer.getTimeDiff: nameFrom does not resolve to ' +
                            'a valid timestamp: ' + nameFrom);
        }

        timeTo = this.timestamps[nameTo];

        if ('undefined' === typeof timeTo || timeTo === null) {
            throw new Error('Timer.getTimeDiff: nameTo does not resolve to ' +
                            'a valid timestamp: ' + nameTo);
        }

        if (effective) {
            ed = this._effectiveDiffs;
            if (ed[nameFrom] && ed[nameFrom][nameTo]) {
                return ed[nameFrom][nameTo];
            }
            else if (ed[nameTo] && ed[nameTo][nameFrom]) {
                return ed[nameTo][nameFrom];
            }
        }

        return timeTo - timeFrom;
    };

    /**
     * ### Timer.randomEmit
     *
     * Emits an event after a random time interval between 0 and maxWait
     *
     * Respects pausing / resuming.
     *
     * Additional parameters are passed to the node.emit
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
            throw new TypeError('Timer.randomEmit: event must be string. ' +
                                'Found: ' + event);
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
     * Additional parameters are passed to the the callback function.
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
            throw new TypeError('Timer.randomExec: func must be function. ' +
                               'Found: ' + func);
        }
        if ('undefined' === typeof ctx) {
            ctx = this.node.game;
        }
        else if ('object' !== typeof ctx && 'function' !== typeof ctx) {
            throw new TypeError('Timer.randomExec: ctx must be object, ' +
                                'function or undefined. Found: ' + ctx);
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
     * Additional parameters are passed to the the done event listener.
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
     * ## Timer.parseInput
     *
     * Resolves an unknown value to a valid time quantity (number >=0)
     *
     * Valid types and operation:
     *   - number (as is),
     *   - string (casted),
     *   - object (property _name_ is parsed),
     *   - function (will be invoked with `node.game` context)
     *
     * Parsed value must be a number >= 0
     *
     * @param {string} name The name of the property if value is object
     * @param {number} value The value to parse
     * @param {string} methodName Optional. The name of the method invoking
     *   the function for the error messsage. Default: Timer.parseInput
     *
     * @param {number} The parsed value
     */
    Timer.prototype.parseInput = function(name, value, methodName) {
        var typeofValue, num;
        if ('string' !== typeof name) {
            throw new TypeError((methodName || 'Timer.parseInput') +
                                ': name must be string. Found: ' + name);
        }
        typeofValue = typeof value;
        switch (typeofValue) {

        case 'number':
            num = value;
            break;
        case 'object':
            if (null !== value) {
                if ('function' === typeof value[name]) {
                    num = value[name].call(this.node.game);
                }
            }
            break;
        case 'function':
            num = value.call(this.node.game);
            break;
        case 'string':
            num = Number(options);
            break;
        }

        if ('number' !== typeof num || num < 0) {
            throw new Error((methodName || 'Timer.parseInput') +
                            ': ' + name + ' must be number >= 0. Found: ' +
                           num);
        }

        return num;
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
                                'be number or undefined. Found: ' + maxWait);
        }

        waitTime = Math.random() * maxWait;

        // Timeup callback: Emit.
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
        // Timeup callback: Exec.
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
     * # GameTimer
     *
     * Copyright(c) 2016 Stefano Balietti
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
    GameTimer.DESTROYED = 10;

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
         * Internal reference to node
         */
        this.node = node;

        /**
         * ### name
         *
         * Internal name of the timer
         */
        this.name = options.name || 'timer_' + J.randomInt(0, 1000000);

        /**
         * ### GameTimer.status
         *
         * Numerical index keeping the current the state of the GameTimer obj
         */
        this.status = GameTimer.UNINITIALIZED;

        /**
         * ### GameTimer.options
         *
         * The current settings for the GameTimer
         */
        this.options = options;

        /**
         * ### GameTimer.timerId
         *
         * The ID of the javascript interval
         */
        this.timerId = null;

        /**
         * ### GameTimer.timeLeft
         *
         * Total running time of timer
         */
        this.milliseconds = null;

        /**
         * ### GameTimer.timeLeft
         *
         * Milliseconds left before time is up
         */
        this.timeLeft = null;

        /**
         * ### GameTimer.timeLeft
         *
         * Milliseconds left when the last stop was called
         */
        this.timeLeftAtStop = null;

        /**
         * ### GameTimer.timePassed
         *
         * Milliseconds already passed from the start of the timer
         */
        this.timePassed = 0;

        /**
         * ### GameTimer.timePassed
         *
         * Milliseconds already passed when the last stop was called
         */
        this.timePassedAtStop = null;

        /**
         * ### GameTimer.update
         *
         * The frequency of update for the timer (in milliseconds)
         */
        this.update = undefined;

        /**
         * ### GameTimer.updateRemaining
         *
         * Milliseconds remaining for current update
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
        this.init(this.options);
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
        var i, len, node;
        checkDestroyed(this, 'init');
        this.status = GameTimer.UNINITIALIZED;
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        if (options) {
            if ('object' !== typeof options) {
                throw new TypeError('GameTimer.init: options must be object ' +
                                    'or undefined. Found: ' + options);
            }
            node = this.node;
            if ('undefined' !== typeof options.milliseconds) {
                this.milliseconds = node.timer.parseInput('milliseconds',
                                                          options.milliseconds);
            }
            if ('undefined' !== typeof options.update) {
                this.update = node.timer.parseInput('update', options.update);
            }
            else {
                // We keep the current update if not modified.
                this.update = this.update || this.milliseconds;
            }

            // Event to be fired when timer expires.
            if (options.timeup) {
                if ('function' === typeof options.timeup ||
                    'string' === typeof options.timeup) {

                    this.timeup = options.timeup;
                }
                else {
                    throw new TypeError('GameTimer.init: options.timeup must ' +
                                        'be function or undefined. Found: ' +
                                        options.timeup);
                }
            }
            else {
                this.timeup = this.timeup || 'TIMEUP';
            }

            if (options.hooks) {
                if (J.isArray(options.hooks)) {
                    len = options.hooks.length;
                    for (i = 0; i < len; i++) {
                        this.addHook(options.hooks[i]);
                    }
                }
                else {
                    this.addHook(options.hooks);
                }
            }

            // Set startPaused option. if specified. Default: FALSE
            this.startPaused = 'undefined' !== options.startPaused ?
                options.startPaused : false;

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

        }

        // TODO: check if this TODO is correct.
        // TODO: update and milliseconds must be multiple now.

        this.timeLeft = this.milliseconds;
        this.timePassed = 0;
        this.updateStart = 0;
        this.updateRemaining = 0;
        this._timeup = false;

        // Only set status to INITIALIZED if all of the state is valid and
        // ready to be used by this.start etc.
        if (checkInitialized(this) === null) {
            this.status = GameTimer.INITIALIZED;
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
        checkDestroyed(this, 'fire');
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
                                'or object. Found: ' + h);
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
        checkDestroyed(this, 'start');
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
        this.updateStart = J.now();

        // Fires the event immediately if time is zero.
        // Double check necessary in strict mode.
        if ('undefined' !== typeof this.options.milliseconds &&
                this.options.milliseconds === 0) {
            this.doTimeup();
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
     * Add an hook to the hook list after performing conformity checks
     *
     * The first parameter can be a string, a function, or an object
     * containing an hook property.
     *
     * @params {string|function|object} hook The hook (string or function),
     *   or an object containing a `hook` property (others: `ctx` and `name`)
     * @params {object} ctx The context wherein the hook is called.
     *   Default: node.game
     * @params {string} name The name of the hook. Default: a random name
     *   starting with 'timerHook'
     *
     * @returns {string} The name of the hook
     */
    GameTimer.prototype.addHook = function(hook, ctx, name) {
        var i;
        checkDestroyed(this, 'addHook');
        if ('undefined' === typeof hook) {
            throw new TypeError('GameTimer.addHook: hook must be function, ' +
                                'string or object. Found: ' + hook);
        }
        ctx = ctx || this.node.game;
        if (hook.hook) {
            ctx = hook.ctx || ctx;
            if (hook.name) name = hook.name;
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
     * Removes a hook by its name
     *
     * @param {string} name Name of the hook to be removed
     *
     * @return {mixed} the hook if it was removed; false otherwise.
     */
    GameTimer.prototype.removeHook = function(name) {
        var i;
        checkDestroyed(this, 'removeHook');
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
        checkDestroyed(this, 'pause');
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
                timestamp = J.now();
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
        var that;
        checkDestroyed(this, 'resume');

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

        this.updateStart = J.now();

        that = this;
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
        checkDestroyed(this, 'stop');
        if (this.isStopped()) {
            throw new Error('GameTimer.stop: timer was not running');
        }

        this.status = GameTimer.STOPPED;
        clearInterval(this.timerId);
        clearTimeout(this.timerId);
        this.timerId = null;
        this.timePassedAtStop = this.timePassed;
        this.timePassed = 0;
        this.timeLeftAtStop = this.timeLeft;
        this.timeLeft = null;
        this.startPaused = null;
        this.updateRemaining = 0;
        this.updateStart = 0;
    };

    /**
     * ### GameTimer.reset
     *
     * Resets the timer
     *
     * Stops the timer, sets the status to UNINITIALIZED, and
     * sets the following properties to default: milliseconds,
     * update, timeup, hooks, hookNames.
     *
     * Does **not** change properties: eventEmitterName, and
     * stagerSync.
     */
    GameTimer.prototype.reset = function() {
        checkDestroyed(this, 'reset');
        if (!this.isStopped()) this.stop();
        this.options = {};
        this.milliseconds = null;
        this.update = undefined;
        this.timeup = 'TIMEUP';
        this.hooks = [];
        this.hookNames = {};
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
        checkDestroyed(this, 'restart');
        if (!this.isStopped()) this.stop();
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
        checkDestroyed(this, 'isRunning');
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
        checkDestroyed(this, 'isStopped');
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
        checkDestroyed(this, 'isPaused');
        return this.status === GameTimer.PAUSED;
    };

    /**
     * ### GameTimer.isTimeUp | isTimeup
     *
     * Return TRUE if the time expired
     *
     * If timer was stopped before expiring returns FALSE
     *
     * @return {boolean} TRUE if a timeup occurred from last initialization
     */
    GameTimer.prototype.isTimeUp = GameTimer.prototype.isTimeup = function() {
        checkDestroyed(this, 'isTimeup');
        return this._timeup;
    };

    /**
     * ## GameTimer.syncWithStager
     *
     * Enables listeners to events and reads options from stager
     *
     * @param {boolean|undefined} sync TRUE to sync, FALSE to remove sync.
     *    If undefined no operation is performed, and simply the current
     *    value is returned.
     * @param {string} property Optional. Name of the property of the stager
     *    from which load timer information. Default: 'timer'
     *
     * @return {boolean} TRUE if synced, FALSE otherwise
     *
     * @see GameTimer.setStagerProperty
     */
    GameTimer.prototype.syncWithStager = function(sync, property) {
        var node, that, ee;
        checkDestroyed(this, 'syncWithStager');
        if ('undefined' === typeof sync) return this.stagerSync;
        if ('boolean' !== typeof sync) {
            throw new TypeError('GameTimer.syncWithStager: sync must be ' +
                                'boolean or undefined. Found: ' + sync);
        }
        if (property) {
            if ('string' !== typeof property) {
                throw new TypeError('GameTimer.syncWithStager: property ' +
                                    'must be string or undefined. Found: ' +
                                    property);
            }
            this.setStagerProperty(property);
        }
        // Do nothing if no change of status is required.
        if (this.syncWithStager() === sync) return sync;
        node = this.node;
        ee = node.events[this.eventEmitterName];
        if (sync === true) {
            that = this;

            // On PLAYING starts.
            ee.on('PLAYING', function() {
                var options;
                options = that.getStepOptions();
                if (options) that.restart(options);
            }, this.name + '_PLAYING');

            // On REALLY_DONE stops.
            ee.on('REALLY_DONE', function() {
                if (!that.isStopped()) that.stop();
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
     * ### GameTimer.doTimeUp | doTimeup
     *
     * Stops the timer and calls the timeup
     *
     * It will call timeup even if the game is paused/stopped,
     * but not if timeup was already called.
     *
     * @see GameTimer.isTimeup
     * @see GameTimer.stop
     * @see GameTimer.fire
     */
    GameTimer.prototype.doTimeUp = GameTimer.prototype.doTimeup = function() {
        checkDestroyed(this, 'doTimeup');
        if (this.isTimeup()) return;
        if (!this.isStopped()) this.stop();
        this._timeup = true;
        this.fire(this.timeup);
    };

    // TODO: improve.

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
        checkDestroyed(this, 'setStagerProperty');
        if ('string' === typeof property) {
            throw new TypeError('GameTimer.setStageProperty: property must ' +
                                'be string. Found: ' + property);
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
        checkDestroyed(this, 'getStagerProperty');
        return this.stagerProperty;
    };

    /**
     * ### GameTimer.getStepOptions
     *
     * Makes an object out of step properties 'timer' and 'timeup'
     *
     * Looks up property 'timer' in the game plot. If it is not an object,
     * makes it an object with property 'milliseconds'. Makes sure
     * 'milliseconds' is a number, otherwise returns null.
     *
     * If property 'timeup' is not defined, it looks it up in the game plot.
     *
     * If property 'update' is not defined, it sets it equals to 'milliseconds'.
     *
     * For example:
     *
     * ```javascript
     * {
     *     milliseconds: 2000,
     *     update: 2000,
     *     timeup: function() {}
     *     // Additional properties as specified.
     * }
     * ```
     *
     * @param {mixed} step Optional. Game step. Default current game stepx
     * @param {string} prop Optional. The name of the property to look up
     *    in the plot containing 'timer' info. Default: `this.stagerProperty`
     *
     * @return {object} options Validated configuration object, or NULL
     *   if no timer info is found for current step
     */
    GameTimer.prototype.getStepOptions = function(step, prop) {
        var timer, timeup;
        checkDestroyed(this, 'getStepOptions');
        step = 'undefined' !== typeof step ?
            step : this.node.game.getCurrentGameStage();
        prop = prop || this.getStagerProperty();

        timer = this.node.game.plot.getProperty(step, prop);
        if (null === timer) return null;

        // If function, it can return a full object,
        // a function, or just the number of milliseconds.
        if ('function' === typeof timer) {
            timer = timer.call(this.node.game);
            if (null === timer) return null;
        }
        else if ('object' === typeof timer) {
            // Manual clone.
            timer = {
                milliseconds: timer.milliseconds,
                update: timer.update,
                timeup: timer.timeup,
                hooks: timer.hooks
            };
            if ('function' === typeof timer.milliseconds) {
                timer.milliseconds = timer.milliseconds.call(this.node.game);
            }
        }

        if ('function' === typeof timer) timer = timer.call(this.node.game);
        if ('number' === typeof timer) timer = { milliseconds: timer };

        if ('object' !== typeof timer ||
            'number' !== typeof timer.milliseconds ||
            timer.milliseconds < 0) {

            this.node.warn('GameTimer.getStepOptions: invalid value for ' +
                           'milliseconds. Found: ' + timer.milliseconds);
            return null;
        }

        // Make sure update and timer are the same.
        if ('undefined' === typeof timer.update) {
            timer.update = timer.milliseconds;
        }

        if ('undefined' === typeof timer.timeup) {
            timeup = this.node.game.plot.getProperty(step, 'timeup');
            if (timeup) timer.timeup = timeup;
        }

        return timer;
    };

    // ## Helper methods.

    /**
     * ### updateCallback
     *
     * Updates the timer object
     *
     * @param {GameTimer} that The game timer instance
     *
     * @return {boolean} FALSE if timer ran out, TRUE otherwise
     */
    function updateCallback(that) {
        var i;
        that.status = GameTimer.RUNNING;
        that.timePassed += that.update;
        that.timeLeft -= that.update;
        that.updateStart = J.now();
        // Fire custom hooks from the latest to the first if any.
        for (i = that.hooks.length; i > 0; i--) {
            that.fire(that.hooks[(i-1)]);
        }
        // Fire Timeup Event
        if (that.timeLeft <= 0) {
            that.doTimeup();
            return false;
        }
        else {
            return true;
        }
    }

    /**
     * ### checkInitialized
     *
     * Check whether the timer has a valid initialized state
     *
     * @param {GameTimer} that The game timer instance
     *
     * @return {string|null} Returns null if timer is in valid,
     *    state, or an error string otherwise.
     */
    function checkInitialized(that) {
        if ('number' !== typeof that.milliseconds) {
            return 'this.milliseconds must be a number';
        }
        if (that.update > that.milliseconds) {
            return 'this.update must not be greater than this.milliseconds';
        }
        return null;
    }

    /**
     * ### checkDestroyed
     *
     * Check whether the timer has been destroyed and throws an error if so
     *
     * @param {GameTimer} that The game timer instance
     * @param {string} method The name of the method invoking it
     */
    function checkDestroyed(that, method) {
        if (that.status === GameTimer.DESTROYED) {
            throw new Error('GameTimer.' + method + ': gameTimer ' +
                            'marked as destroyed: ' + that.name);
        }
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
