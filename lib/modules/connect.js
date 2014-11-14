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
     * Depending on the type of socket chosen (e.g. Direct or IO), the channel
     * parameter is optional or not.
     *
     * @param {string} channel Optional. The channel to connect to
     * @param {object} socketOptions Optional. A configuration object for
     *   the socket connect method.
     *
     * @emit SOCKET_CONNECT
     * @emit PLAYER_CREATED
     */
    NGC.prototype.connect = function(channel, socketOptions) {
        this.socket.connect(channel, socketOptions);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
