/**
 * # GameTimer
 *
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 *
 * Creates a controllable timer object for nodeGame
 *
 * ---
 *
 */

(function (exports, node) {

// ## Global scope

    exports.GameTimer = GameTimer;

    var JSUS = node.JSUS;

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
function GameTimer (options) {
    options = options || {};

// ## Public properties

/**
 * ### GameTimer.status
 *
 * Numerical index representing the current the state of the GameTimer object
 *
 */
    this.status = GameTimer.UNINITIALIZED;

/**
 * ### GameTimer.options
 *
 * The current settings for the GameTimer
 *
 */
    this.options = options;

/**
 * ### GameTimer.timer
 *
 * The ID of the javascript interval
 *
 */
    this.timer = null;

/**
 * ### GameTimer.timeLeft
 *
 * Milliseconds left before time is up
 *
 */
    this.timeLeft = null;

/**
 * ### GameTimer.timePassed
 *
 * Milliseconds already passed from the start of the timer
 *
 */
    this.timePassed = 0;

/**
 * ### GameTimer.update
 *
 * The frequency of update for the timer (in milliseconds)
 *
 */
    this.update = 1000;

/**
 * ### GameTimer.updateRemaining
 *
 * Milliseconds remaining for current update
 *
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

    this.init();
    // TODO: remove into a new addon
    this.listeners();
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
 *      milliseconds: 4000, // The length of the interval
 *      update: 1000, // How often to update the time counter. Defaults to milliseconds
 *      timeup: 'MY_EVENT', // An event or function to fire when the timer expires
 *      hooks: [ myFunc, // Array of functions or events to fire at every update
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
GameTimer.prototype.init = function (options) {
    options = options || this.options;

    this.status = GameTimer.UNINITIALIZED;
    if (this.timer) clearInterval(this.timer);
    this.milliseconds = options.milliseconds;
    this.update = options.update || this.milliseconds;
    this.timeLeft = this.milliseconds;
    this.timePassed = 0;
    this.timeup = options.timeup || 'TIMEUP'; // event to be fired when timer expires
    // TODO: update and milliseconds must be multiple now
    if (options.hooks) {
        for (var i=0; i < options.hooks.length; i++){
            this.addHook(options.hooks[i]);
        }
    }

    this.status = GameTimer.INITIALIZED;
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
 *
 */
GameTimer.prototype.fire = function (h) {
    if (!h) {
        throw new Error('GameTimer.fire: missing argument');
    }

    var hook = h.hook || h;
    if ('function' === typeof hook) {
        var ctx = h.ctx || node.game;
        hook.call(ctx);
    }
    else {
        node.emit(hook);
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
 *
 */
GameTimer.prototype.start = function() {
    // Check validity of state
    if ('number' !== typeof this.milliseconds) {
        throw new Error('GameTimer.start: this.milliseconds must be a number');
    }
    if (this.update > this.milliseconds) {
        throw new Error('GameTimer.start: this.update must not be greater ' +
                        'than this.milliseconds');
    }

    this.status = GameTimer.LOADING;
    // fire the event immediately if time is zero
    if (this.options.milliseconds === 0) {
        this.fire(this.timeup);
        return;
    }

    // Remember time of start:
    this.updateStart = (new Date()).getTime();
    this.updateRemaining = this.update;

    this.timer = setInterval(updateCallback, this.update, this);
};

/**
 * ### GameTimer.addHook
 *
 *
 * Add an hook to the hook list after performing conformity checks.
 * The first parameter hook can be a string, a function, or an object
 * containing an hook property.
 */
GameTimer.prototype.addHook = function (hook, ctx) {
    if (!hook) {
        throw new Error('GameTimer.addHook: missing argument');
    }

    ctx = ctx || node.game;
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
 * status property to `GameTimer.PAUSED`
 *
 */
GameTimer.prototype.pause = function() {
    var timestamp;

    if (this.status > 0) {
        clearInterval(this.timer);
        clearTimeout(this.timer);

        this.status = GameTimer.PAUSED;

        // Save time of pausing:
        timestamp = (new Date()).getTime();
        this.updateRemaining -= timestamp - this.updateStart;
    }
    else {
        throw new Error('GameTimer.pause: timer was not running');
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

    if (this.status !== GameTimer.PAUSED) {
        throw new Error('GameTimer.resume: timer was not paused');
    }

    this.status = GameTimer.LOADING;

    this.updateStart = (new Date()).getTime();

    // Run rest of this "update" interval:
    this.timer = setTimeout(function() {
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
    clearInterval(this.timer);
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
GameTimer.prototype.restart = function (options) {
    this.init(options);
    this.start();
};

/**
 * ### GameTimer.listeners
 *
 * Experimental. Undocumented (for now)
 *
 */
GameTimer.prototype.listeners = function () {
    var that = this;
// <!--
//      node.on('GAME_TIMER_START', function() {
//          that.start();
//      });
//
//      node.on('GAME_TIMER_PAUSE', function() {
//          that.pause();
//      });
//
//      node.on('GAME_TIMER_RESUME', function() {
//          that.resume();
//      });
//
//      node.on('GAME_TIMER_STOP', function() {
//          that.stop();
//      });

//      node.on('DONE', function(){
//          that.pause();
//      });

    // TODO: check what is right behavior for this
//      node.on('WAITING...', function(){
//          that.pause();
//      });
// -->

};

/**
 * ### GameTimer.isStopped
 *
 * Returns whether timer is stopped
 *
 * Paused doesn't count as stopped.
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

// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
