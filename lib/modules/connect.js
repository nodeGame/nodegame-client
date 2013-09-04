/**
 * # Log
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` logging module
 * 
 * ---
 * 
 */

(function (exports, parent) {
    
    var NGC = parent.NodeGameClient;

    /**
     * ### node.connect
     *
     * Establishes a connection with a nodeGame server
     *
     * @param {string} uri Optional. The uri to connect to
     */
    NGC.prototype.connect = function (uri, options) {
        if (this.socket.connect(uri, options)) {
            this.emit('NODEGAME_CONNECTED');
        }
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
