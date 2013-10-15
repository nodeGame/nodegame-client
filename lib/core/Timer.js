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
        this.node.events.ng.on('NODEGAME_GAMECOMMAND_' +
                constants.gamecommand.pause, function() {
                    result.pause();
                });
        this.node.events.ng.on('NODEGAME_GAMECOMMAND_' +
                constants.gamecommand.resume, function() {
                    result.resume();
                });

        return result;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
