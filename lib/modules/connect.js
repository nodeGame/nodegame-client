/**
 * # Connect module
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` connect module
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
     * Events related to the connection include _SOCKET_CONNECT_ and
     * _PLAYER_CREATED_.
     *
     * @param {string} uri Optional. The uri to connect to.
     * @param {object} socketOptions Optional. A configuration object for
     *   the socket connect method.
     *
     * @emit SOCKET_CONNECT
     * @emit PLAYER_CREATED
     */
    NGC.prototype.connect = function(uri, socketOptions) {
        this.socket.connect(uri, socketOptions);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
