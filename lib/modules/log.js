/**
 * # Log
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * nodeGame logging module
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;
    var constants = parent.constants;

    var LOG = constants.target.LOG;

    var J = parent.JSUS;

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
     * @param {string} level Optional. The verbosity level of this log.
     *   Default: 'info'
     * @param {string} prefix Optional. A text to display at the beginning of
     *   the log entry. Default: 'ng> '
     */
    NGC.prototype.log = function(txt, level, prefix) {
        var numLevel, info;
        if ('undefined' === typeof txt) return;

        level  = level || 'info';
        numLevel = constants.verbosity_levels[level];

        if (this.verbosity >= numLevel) {
            // Add game stage manually (faster than toString()).
            info = this.nodename + '@' + this.player.stage.stage + '.' +
                this.player.stage.step + '.' + this.player.stage.round +
                ' - ' + J.getTimeM() + ' > ';
            if ('undefined' !== typeof prefix) info = info + prefix;
            console.log(info + txt);
        }
        if (this.remoteVerbosity >= numLevel) {
            // We need to avoid creating errors here,
            // otherwise we enter an infinite loop.
            if (this.socket.isConnected() && !this.player.placeholder) {
                if (!this.remoteLogMap[txt]) {
                    this.remoteLogMap[txt] = true;
                    // There is a chance that the message is not sent,
                    // depending on what the state of the connection is.
                    // TODO: example, error on Init function, socket.io
                    // transport stays in state of `upgrading` and does
                    // not let send messages. If you manually force it
                    // in a debug session, they are actually sent.
                    this.socket.send(this.msg.create({
                        target: LOG,
                        text: level,
                        data: txt,
                        to: 'SERVER'
                    }));
                    this.remoteLogMap[txt] = null;
                }
            }
        }
    };

    /**
     * ### NodeGameClient.info
     *
     * Logs an INFO message
     *
     * @param {string} txt The text to log
     *
     * @see NodeGameClient.log
     */
    NGC.prototype.info = function(txt) {
        this.log(txt, 'info', 'info - ');
    };

    /**
     * ### NodeGameClient.warn
     *
     * Logs a WARNING message
     *
     * @param {string} txt The text to log
     *
     * @see NodeGameClient.log
     */
    NGC.prototype.warn = function(txt) {
        this.log(txt, 'warn', 'warn - ');
    };

    /**
     * ### NodeGameClient.err
     *
     * Logs an ERROR message
     *
     * @param {string} txt The text to log
     *
     * @see NodeGameClient.log
     */
    NGC.prototype.err = function(txt) {
        this.log(txt, 'error', 'error - ');
    };

    /**
     * ### NodeGameClient.silly
     *
     * Logs a SILLY message
     *
     * @param {string} txt The text to log
     *
     * @see NodeGameClient.log
     */
    NGC.prototype.silly = function(txt) {
        this.log(txt, 'silly', 'silly - ');
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
