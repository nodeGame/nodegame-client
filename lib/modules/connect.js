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
     * @param {object} conf A configuration object
     * @param {object} game The game object
     */
    NGC.prototype.connect = function (url) {
        if (this.socket.connect(url)) {
            this.emit('NODEGAME_CONNECTED');
        }
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
