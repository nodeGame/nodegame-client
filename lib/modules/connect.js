/**
 * # Connect
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` connect module
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    /**
     * ### node.connect
     *
     * Establishes a connection with a nodeGame server
     *
     * If channel does not begin with `http://`, if executed in the browser,
     * the connect method will try to add the value of `window.location.host`
     * in front of channel to avoid cross-domain errors (as of Socket.io >= 1).
     *
     * Depending on the type of socket chosen (e.g. Direct or IO), the first
     * parameter might be optional.
     *
     * @param {string} channel The channel to connect to
     * @param {object} socketOptions Optional. A configuration object for
     *   the socket connect method.
     *
     * @emit SOCKET_CONNECT
     * @emit PLAYER_CREATED
     * @emit NODEGAME_READY
     */
    NGC.prototype.connect = function(channel, socketOptions) {
        if (channel && channel.substr(0,7) !== 'http://') {
            if ('undefined' !== typeof window &&
                window.location && window.location.host) {

                channel = 'http://' + window.location.host + channel;
            }
        }
        this.socket.connect(channel, socketOptions);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
