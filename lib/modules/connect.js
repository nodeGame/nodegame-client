/**
 * # Connect module
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` connect module
 * TODO: integrate in main NGC file ?
 * ---
 */
(function(exports, parent) {
    
    "use strict";

    var NGC = parent.NodeGameClient;

    /**
     * ### node.connect
     *
     * Establishes a connection with a nodeGame server
     *
     * @param {string} uri Optional. The uri to connect to.
     * @param {function} cb Optional. A callback to execute as soon as the
     *   connection is established.
     * @param {object} socketOptions Optional. A configuration object for
     *   the socket connect method.
     *
     * @emit SOCKET_CONNECT
     */
    NGC.prototype.connect = function(uri, cb, socketOptions) {
        if (cb) {
            if ('function' !== typeof cb) {
                throw new TypeError('node.connect: cb must be function or ' +
                                    'undefined');
            }
            this.once('SOCKET_CONNECT', function() {
                cb();
            });
        }
        this.socket.connect(uri, socketOptions);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);