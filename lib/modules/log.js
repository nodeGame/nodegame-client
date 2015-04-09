/**
 * # Log
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` logging module
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;
    var constants = parent.constants;

    var LOG = constants.target.LOG

    /**
     * ### NodeGameClient.log
     *
     * Default nodeGame standard out, override to redirect
     *
     * Logs entries are displayed to the console if their level is
     * smaller than `this.verbosity`.
     *
     * Logs entries are forwarded to the server if their level is
     * smaller than `this.remoteVerbosity`.
     *
     * @param {string} txt The text to output
     * @param {string|number} level Optional. The verbosity level of this log.
     *   Default: 'warn'
     * @param {string} prefix Optional. A text to display at the beginning of
     *   the log entry. Default: 'ng> '
     */
    NGC.prototype.log = function(txt, level, prefix) {
        var numLevel;
        if ('undefined' === typeof txt) return;

        level  = level || 'warn';
        prefix = 'undefined' === typeof prefix ? this.nodename + '> ' : prefix;

        numLevel = constants.verbosity_levels[level];

        if (this.verbosity >= numLevel) {
            console.log(prefix + txt);
        }
        if (this.remoteVerbosity >= numLevel) {
            this.socket.send(this.msg.create({
                target: LOG,
                text: level,
                data: txt,
                to: 'SERVER'
            }));
        }
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
     * ### NodeGameClient.silly
     *
     * Logs a SILLY message
     */
    NGC.prototype.silly = function(txt, prefix) {
        prefix = this.nodename + (prefix ? '|' + prefix : '') + '> silly - ';
        this.log(txt, 'silly', prefix);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
