/**
 * # Timer
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Timing-related utility functions
 *  ---
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;
    var constants = parent.constants;

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
         * Collection of currently active timers created with `Timer.createTimer`
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
     * @param {object} options The options that are given to GameTimer
     * @return {GameTimer} timer The requested timer
     *
     * @see GameTimer
     */
    Timer.prototype.createTimer = function(options) {
        var gameTimer, pausedCb, resumedCb;
        options = options || {};
        options.name = options.name || 
            J.uniqueKey(this.timers, 'timer_' + J.randomInt(0, 10000000));

        if (this.timers[options.name]) {
            throw new Error('Timer.createTimer: timer ' + options.name +
                            ' already existing.');
        }

        // Create the GameTimer:
        gameTimer = new GameTimer(this.node, options);

        // Attach pause / resume listeners:
        pausedCb = function() {
            if (!gameTimer.isPaused()) {
                gameTimer.pause();
            }
        };
        this.node.on('PAUSED', pausedCb);

        resumedCb = function() {
            // startPaused=true also counts as a "paused" state:
            if (gameTimer.isPaused() || gameTimer.startPaused) {
                gameTimer.resume();
            }
        };
        this.node.on('RESUMED', resumedCb);

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
        
        // Stop timer:
        if (!gameTimer.isStopped()) {
            gameTimer.stop();
        }
        
        // Detach listeners:
        this.node.off('PAUSED', gameTimer.timerPausedCallback);
        this.node.off('RESUMED', gameTimer.timerResumedCallback);
        // Delete reference in this.timers.
        delete this.timers[gameTimer.name];
    };

    /**
     * ### Timer.destroyAllTimers
     *
     * Stops and removes all registered GameTimers
     */
    Timer.prototype.destroyAllTimers = function(confirm) {
        if (!confirm) {
            node.warn('Timer.destroyAllTimers: confirm must be true to ' +
                      'proceed. No timer destroyed.');
            return false;
        }
        for (var i in this.timers) {
            this.destroyTimer(this.timers[i]);
        }
    };

    // Common handler for randomEmit and randomExec
    function randomFire(hook, maxWait, emit) {
        var that = this;
        var waitTime;
        var callback;
        var timerObj;
        var tentativeName;

        // Get time to wait:
        maxWait = maxWait || 6000;
        waitTime = Math.random() * maxWait;

        // Define timeup callback:
        if (emit) {
            callback = function() {
                that.destroyTimer(timerObj);
                that.node.emit(hook);
            };
        }
        else {
            callback = function() {
                that.destroyTimer(timerObj);
                hook.call();
            };
        }

        tentativeName = emit 
            ? 'rndEmit_' + hook + '_' + J.randomInt(0, 1000000)
            : 'rndExec_' + J.randomInt(0, 1000000);       

        // Create and run timer:
        timerObj = this.createTimer({
            milliseconds: waitTime,
            timeup: callback,
            name: J.uniqueKey(this.timers, tentativeName)
        });

        // TODO: check if this condition is ok.
        if (this.node.game.isReady()) {
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
     * @param {string} event The name of the event
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before emitting the event. Defaults, 6000
     */
    Timer.prototype.randomEmit = function(event, maxWait) {
        randomFire.call(this, event, maxWait, true);
    };

    /**
     * ### Timer.randomExec
     *
     * Executes a callback function after a random time interval between 0 and maxWait
     *
     * Respects pausing / resuming.
     *
     * @param {function} The callback function to execute
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before executing the callback. Defaults, 6000
     */
    Timer.prototype.randomExec = function(func, maxWait) {
        randomFire.call(this, func, maxWait, false);
    };

    /**
     * # GameTimer Class
     *
     * Copyright(c) 2014 Stefano Balietti
     * MIT Licensed
     *
     * Creates a controllable timer object for nodeGame.
     * ---
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
         *
         */
        this.updateStart = 0;

        /**
         * ### GameTimer.startPaused
         *
         * Whether to enter the pause state when starting
         *
         */
        this.startPaused = false;

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
     *      // How often to update the time counter. Defaults, milliseconds.
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
     *  }
     *  // Units are in milliseconds
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
        // Event to be fired when timer expires.
        this.timeup = options.timeup || 'TIMEUP';
        // TODO: update and milliseconds must be multiple now
        if (options.hooks) {
            len = options.hooks.length;
            for (i = 0; i < len; i++){
                this.addHook(options.hooks[i]);
            }
        }

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
     * If it is a string it is emitted as an event,
     * otherwise it called as a function.
     *
     * @param {mixed} h The hook to fire
     */
    GameTimer.prototype.fire = function(h) {
        var hook, ctx;
        if (!h) {
            throw new Error('GameTimer.fire: missing argument');
        }
        hook = h.hook || h;
        if ('function' === typeof hook) {
            ctx = h.ctx || this.node.game;
            hook.call(ctx);
        }
        else {
            this.node.emit(hook);
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

        this.status = GameTimer.LOADING;

        // Remember time of start (used by this.pause, so set it before calling
        // that):
        this.updateStart = (new Date()).getTime();

        if (this.startPaused) {
            this.pause();
            return;
        }

        // Fires the event immediately if time is zero.
        // Double check necessary in strict mode.
        if ('undefined' !== typeof this.options.milliseconds &&
            this.options.milliseconds === 0) {
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
     */
    GameTimer.prototype.addHook = function(hook, ctx) {
        if (!hook) {
            throw new Error('GameTimer.addHook: missing argument');
        }

        ctx = ctx || this.node.game;
        if (hook.hook) {
            ctx = hook.ctx || ctx;
            hook = hook.hook;
        }
        this.hooks.push({hook: hook, ctx: ctx});
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

            this.status = GameTimer.PAUSED;

            // Save time of pausing:
            timestamp = (new Date()).getTime();
            this.updateRemaining = timestamp - this.updateStart;
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
                that.start();
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
     *
     */
    GameTimer.prototype.stop = function() {
        if (this.isStopped()) {
            throw new Error('GameTimer.stop: timer was not running');
        }

        this.status = GameTimer.STOPPED;
        clearInterval(this.timerId);
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
