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

    var GameTimer = parent.GameTimer;

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
     */
    Timer.prototype.createTimer = function(options) {
        var result;

        // Create the GameTimer:
        result = new GameTimer(options);

        // Attach pause / resume listeners:
        this.node.on('PAUSED', function() {
            // TODO: Check whether not paused
            // Possible problem: Pausing before starting?
            result.pause();
        });
        this.node.on('RESUMED', function() {
            // TODO: Check whether paused
            result.resume();
        });

        return result;
    };

    // TODO: random* functions below:

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
        maxWait = maxWait || 6000;

        setTimeout(function(event) {
            node.emit(event);
        }, Math.random() * maxWait, event);
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
        maxWait = maxWait || 6000;
        setTimeout(function(func) {
            func.call();
        }, Math.random() * maxWait, func);
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
