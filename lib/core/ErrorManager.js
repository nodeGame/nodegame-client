/**
 * # ErrorManager
 * Copyright(c) 2017 Stefano Balietti
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
         * Reference to the last error occurred
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
            window.onerror = function(msg, url, lineno, colno, error) {
                var str;
                msg = node.game.getCurrentGameStage().toString() +
                    '@' + J.getTime() + '> ' +
                    url + ' ' + lineno + ',' + colno + ': ' + msg;
                if (error) msg + ' - ' + JSON.stringify(error);
                that.lastError = msg;
                node.err(msg);
                if (node.debug) {
                    W.init({ waitScreen: true });
                    str = '<strong>DEBUG mode: client-side error ' +
                          'detected.</strong><br/><br/>';
                    str += msg;
                    str += '</br></br>Open the DevTools in your browser ' +
                    'for details.</br><em style="font-size: smaller">' +
                    'This message will not be shown in production mode.</em>';
                    W.lockScreen(str);
                }
                return !node.debug;
            };
        }
    };


// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
