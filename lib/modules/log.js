/**
 * # Log
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` logging module
 * ---
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;
    var constants = parent.constants;

    /**
     * ### NodeGameClient.log
     *
     * Default nodeGame standard out, override to redirect
     *
     * Logs entries are displayed to the console if their level is
     * smaller than `this.verbosity`.
     *
     * TODO: Logs entries are forwarded to the server if their level is
     * smaller than `this.remoteVerbosity`.
     *
     * @param {string} txt The text to output
     * @param {string|number} level Optional. The verbosity level of this log.
     *   Default: 'warn'
     * @param {string} prefix Optional. A text to display at the beginning of
     *   the log entry. Default: 'ng> '
     *
     */
    NGC.prototype.log = function(txt, level, prefix) {
        if ('undefined' === typeof txt) return false;

        level  = level || 'warn';
        prefix = ('undefined' === typeof prefix) ? this.nodename + '> ' : prefix;

        if (this.verbosity >= constants.verbosity_levels[level]) {
            console.log(prefix + txt);
        }

        // if (this.remoteVerbosity > level) {
        //     var remoteMsg = this.msg.create({
        //         target: this.target.LOG,
        //         text: level,
        //         data: txt,
        //         to: 'SERVER'
        //     });
        //     console.log(txt)
        //     this.socket.send(remoteMsg);
        // }
    };

    /**
     * ### NodeGameClient.info
     *
     * Logs an INFO message
     */
    NGC.prototype.info = function(txt, prefix) {
        prefix = this.nodename + (prefix ? '|' + prefix : '') + '> info - ';
        this.log(txt, 'info', prefix);
    };

    /**
     * ### NodeGameClient.warn
     *
     * Logs a WARNING message
     */
    NGC.prototype.warn = function(txt, prefix) {
        prefix = this.nodename + (prefix ? '|' + prefix : '') + '> warn - ';
        this.log(txt, 'warn', prefix);
    };

    /**
     * ### NodeGameClient.err
     *
     * Logs an ERROR message
     */
    NGC.prototype.err = function(txt, prefix) {
        prefix = this.nodename + (prefix ? '|' + prefix : '') + '> error - ';
        this.log(txt, 'error', prefix);
    };

    /**
     * ### NodeGameClient.debug
     *
     * Logs a DEBUG message
     */
    NGC.prototype.silly = function(txt, prefix) {
        prefix = this.nodename + (prefix ? '|' + prefix : '') + '> silly - ';
        this.log(txt, 'silly', prefix);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
