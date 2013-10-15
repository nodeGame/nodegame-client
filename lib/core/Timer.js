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
     * ### Timer.getTimer
     *
     * Returns a GameTimer
     *
     * The GameTimer instance is automatically paused and resumed on
     * the respective events.
     */
    Timer.prototype.getTimer = function(options) {
        // TODO
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
