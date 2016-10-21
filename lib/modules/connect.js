/**
 * # Connect
 * Copyright(c) 2016 Stefano Balietti
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
     * Depending on the type of socket used (Direct or IO), the
     * channel parameter might be optional.
     *
     * If node is executed in the browser additional checks are performed:
     *
     * 1. If channel does not begin with `http://` or `https://,
     *    then `window.location.origin` will be added in front of
     *    channel to avoid cross-domain errors (as of Socket.io >= 1).
     *
     * 2. If no socketOptions.query parameter is specified any query
     *    parameters found in `location.search(1)` will be passed.
     *
     * @param {string} channel Optional. The channel to connect to
     * @param {object} socketOptions Optional. A configuration object for
     *   the socket connect method. If channel is omitted, then socketOptions
     *   is the first parameter.
     *
     * @emit SOCKET_CONNECT
     * @emit PLAYER_CREATED
     * @emit NODEGAME_READY
     */
    NGC.prototype.connect = function() {
        var channel, socketOptions;
        if (arguments.length >= 2) {
            channel = arguments[0];
            socketOptions = arguments[1];
        }
        else if (arguments.length === 1) {
            if ('string' === typeof arguments[0]) channel = arguments[0];
            else socketOptions = arguments[0];
        }
        // Browser adjustements.
        if ('undefined' !== typeof window) {
            // If no channel is defined use the pathname, and assume
            // that the name of the game is also the name of the endpoint.
            if ('undefined' === typeof channel) {
                if (window.location && window.location.pathname) {
                    channel = window.location.pathname;
                    // Making sure it is consistent with what we expect.
                    if (channel.charAt(0) !== '/') channel = '/' + channel;
                    if (channel.charAt(channel.length-1) === '/') {
                        channel = channel.substring(0, channel.length-1);
                    }
                }
            }
            // Make full path otherwise socket.io will complain.
            if (channel &&
                (channel.substr(0,8) !== 'https://' &&
                 channel.substr(0,7) !== 'http://')) {

                if (window.location && window.location.origin) {
                    channel = window.location.origin + channel;
                }
            }
            // Pass along any query options. (?clientType=...).
            if (!socketOptions || (socketOptions && !socketOptions.query)) {
                if (('undefined' !== typeof location) && location.search) {
                    socketOptions = socketOptions || {};
                    socketOptions.query = location.search.substr(1);
                }
            }
        }
        this.socket.connect(channel, socketOptions);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
