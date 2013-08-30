/**
 * # SocketIo
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Implementation of a remote socket communicating over HTTP 
 * through Socket.IO
 * 
 * ---
 * 
 */

(function (exports, parent, io) {
    
    exports.SocketIo = SocketIo;

    function SocketIo(node, options) {
        options = options || {};
        this.options = options;
        this.node = node;
        this.socket = null;
    }

    SocketIo.prototype.connect = function(url, options) {
        var that, node;
        node = this.node;
        if (!url) {
	    node.err('cannot connect to empty url.', 'ERR');
	    return false;
        }
        that = this;
	
        this.socket = io.connect(url, options); //conf.io

        this.socket.on('connect', function (msg) {
	    node.info('socket.io connection open'); 
	    that.socket.on('message', function(msg) {
	        node.socket.onMessage(msg);
	    });	
        });
	
        this.socket.on('disconnect', node.socket.onDisconnect);
        return true;
	
    };

    SocketIo.prototype.send = function (msg) {
        this.socket.send(msg.stringify());
    };

    parent.SocketFactory.register('SocketIo', SocketIo);

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports,
    'undefined' != typeof io ? io : require('socket.io-client') 
);
