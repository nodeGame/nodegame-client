/**
 * # SocketDirect
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Implementation of a direct socket communicating directly with the server
 * through a shared event-emitter object
 *
 * http://nodegame.org
 */
(function(exports, parent) {

    /**
     * ## SocketDirect constructor
     *
     * Creates a new instance of SocketDirect
     *
     * @param {NodeGameClient} node Reference to the node instance
     * @param {object} options Optional. Configuration options
     */
    function SocketDirect(node, options) {
        options = options || {};

        // ## Private properties

        /**
         * ### SocketDirect.node
         *
         * Reference to the node object.
         */
        this.node = node;

        /**
         * ## SocketDirect.socket
         *
         * The SocketDirect object shared with the server
         */
        this.socket = options.socket;

        /**
         * ## SocketDirect.connected
         *
         * TRUE, if a connection is established
         */
        this.connected = false;
    }

    /**
     * ### SocketDirect.connect
     *
     * Establishes a connection with the server
     *
     * Sets the on: 'connect', 'message', 'disconnect' event listeners.
     *
     * @param {string} url The address of the server channel
     * @param {object} options Optional. Configuration options
     *
     * @return {boolean} TRUE, on success
     */
    SocketDirect.prototype.connect = function(socket, options) {
        var node, res;
        node = this.node;

        if (socket) this.socket = socket;

        if (!this.socket) {
            throw new Error('SocketDirect.connect: empty socket.');
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

    /**
     * ### SocketDirect.isConnected
     *
     * Returns TRUE, if currently connected
     */
    SocketDirect.prototype.isConnected = function() {
        return this.connected;
    };

    /**
     * ### SocketDirect.message
     *
     * Delivers an incoming message to the node object
     *
     * @param {object} msg Message object, usually, a game message.
     *
     * @see GameMessage
     */
    SocketDirect.prototype.message = function(msg) {
        this.node.socket.onMessage(msg);
    };

    /**
     * ### SocketDirect.disconnect
     *
     * Triggers the disconnection from the server
     *
     * @param {boolean} If FALSE, Socket.onDisconnect will not be called.
     *   Default: undefined.
     *
     * @see Socket.onDisconnect
     */
    SocketDirect.prototype.disconnect = function(notifySocket) {
        this.connected = false;
        if (notifySocket !== false) this.node.socket.onDisconnect();
    };

    /**
     * ### SocketDirect.send
     *
     * Sends a message to the SocketDirect socket of the server
     *
     * @param {GameMsg} gameMsg The game mesage to send
     *
     * @see GameMessage
     */
    SocketDirect.prototype.send = function(gameMsg) {
        if (!this.connected || !this.socket) {
            this.node.err('SocketDirect.send: could not deliver message, ' +
                          'no open socket found. ');
            return;
        }
        this.socket.message(gameMsg);
    };


    parent.SocketFactory.register('SocketDirect', SocketDirect);

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
