/**
 * # Timer
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Timing-related utility functions
 *
 *  ---
 */
(function(exports, parent) {

    // ## Global scope

    // Exposing Timer constructor
    exports.Timer = Timer;

    var constants = parent.constants;

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

        settings = settings || {};
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
     *
     * @see GameTimer
     */
    Timer.prototype.createTimer = function(options) {
        var gameTimer, pausedCb, resumedCb;

        // Create the GameTimer:
        gameTimer = new this.node.GameTimer(options);

        // Attach pause / resume listeners:
        pausedCb = function() {
            // TODO: Possible problem: Pausing before starting?
            if (!gameTimer.isPaused()) {
                gameTimer.pause();
            }
        };
        this.node.on('PAUSED', pausedCb);

        resumedCb = function() {
            if (gameTimer.isPaused()) {
                gameTimer.resume();
            }
        };
        this.node.on('RESUMED', resumedCb);

        // Attach listener handlers to GameTimer object so they can be
        // unregistered later:
        gameTimer.timerPausedCallback = pausedCb;
        gameTimer.timerResumedCallback = resumedCb;

        return gameTimer;
    };

    /**
     * ### Timer.destroyTimer
     *
     * Stops and removes a GameTimer
     *
     * The event handlers listening on PAUSED/RESUMED that are attached to
     * the given GameTimer object are removed.
     */
    Timer.prototype.destroyTimer = function(gameTimer) {
        // Stop timer:
        if (!gameTimer.isStopped()) {
            gameTimer.stop();
        }

        // Detach listeners:
        this.node.off('PAUSED', gameTimer.timerPausedCallback);
        this.node.off('RESUMED', gameTimer.timerResumedCallback);
    };

    // Common handler for randomEmit and randomExec
    function randomFire(hook, maxWait, emit) {
        var that = this;
        var waitTime;
        var callback;
        var timerObj;

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

        // Create and run timer:
        timerObj = this.createTimer({
            milliseconds: waitTime,
            timeup: callback
        });
        timerObj.start();
    }

    /**
     * ### Timer.randomEmit
     *
     * Emits an event after a random time interval between 0 and maxWait
     *
     * Respects pausing / resuming.
     *
     * @param {string} event The name of the event
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before emitting the event. to Defaults, 6000
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
     *   to wait before executing the callback. to Defaults, 6000
     */
    Timer.prototype.randomExec = function(func, maxWait) {
        randomFire.call(this, func, maxWait, false);
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
