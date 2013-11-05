/**
 * # SocketDirect
 * 
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed 
 * 
 * Implementation of a direct socket communicating directly through
 * a shared event-emitter object.
 * ---
 */
(function(exports, parent) {
    
    function SocketDirect(node, options) {
        options = options || {};

        this.node = node;
        
        /**
         * ## SocketDirect.socket
         *
         * The SocketDirect object shared with the server
         */
        this.socket = options.socket;

        this.connected = false;
    }

    SocketDirect.prototype.connect = function(socket, options) {
        var node, res;
        node = this.node;
	
        if (socket) {
	    this.socket = socket;
        }
	
        if (!this.socket) {
	    node.err('cannot connect: empty socket');
	    return false;
        }
	
        this.connected = true;

        // Call the SocketDirect method on the server.
        res = this.socket.connect(this, options);
        if (res) {
            node.info('socket.direct connection open');
            node.socket.onConnect();
        }
        return res;
    };

    SocketDirect.prototype.isConnected = function() {
        return this.connected;
    };

    SocketDirect.prototype.message = function(msg) {
        if (!this.connected || !this.socket) return;
        this.node.socket.onMessage(msg);
    };

    SocketDirect.prototype.disconnect = function(msg) {
        this.connected = false;
        this.node.socket.onDisconnect(msg);
    };


    SocketDirect.prototype.send = function(msg) {
        var node, gameMsg;
        if (!this.connected || !this.socket) return;
        node = this.node;
        try {
	    gameMsg = JSON.stringify(msg);
        }
        catch(e) {
	    node.err('An error has occurred. Cannot send message: ' + msg);
	    return false;
        }
        this.socket.message(gameMsg);
    };


    parent.SocketFactory.register('SocketDirect', SocketDirect);


})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);