/**
 * # ErrorManager
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Handles runtime errors
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;

    parent.ErrorManager = ErrorManager;

    /**
     * ## ErrorManager constructor
     *
     * Creates a new instance of ErrorManager
     *
     * @param {NodeGameClient} node Reference to the active node object.
     */
    function ErrorManager(node) {

        /**
         * ### ErrorManager.lastError
         *
         * Reference to the last error occurred.
         */
        this.lastError = null;

        this.init(node);
    }

    // ## ErrorManager methods

    /**
     * ### ErrorManager.init
     *
     * Starts catching run-time errors
     *
     * Only active in the browser's window.
     * In node.js, the ServerNode Error Manager is active.
     *
     * @param {NodeGameClient} node Reference to the active node object.
     */
    ErrorManager.prototype.init = function(node) {
        var that;
        that = this;
        if (!J.isNodeJS()) {
            window.onerror = function(msg, url, linenumber) {
                msg = url + ' ' + linenumber + ': ' + msg;
                that.lastError = msg;
                node.err(msg);
                return !node.debug;
            };
        }
//         else {
//             process.on('uncaughtException', function(err) {
//                 that.lastError = err;
//                 node.err('Caught exception: ' + err);
//                 if (node.debug) {
//                     throw err;
//                 }
//             });
//         }
    };


// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
