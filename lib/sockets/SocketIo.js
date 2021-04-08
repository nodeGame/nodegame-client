/**
 * # SocketIo
 * Copyright(c) 2018 Stefano Balietti
 * MIT Licensed
 *
 * Remote communication through Socket.IO
 *
 * This file requires that the socket.io library is already loaded before
 * nodeGame is loaded to work (see closure).
 */
(function(exports, node, io) {

    // io is undefined in Node.JS because
    // module.parents.exports.io does not exist.

    // ## Global scope

    var J = node.JSUS;

    exports.SocketIo = SocketIo;

    /**
     * ## SocketIo constructor
     *
     * Creates a new instance of SocketIo
     *
     * @param {NodeGameClient} node Reference to the node instance
     */
    function SocketIo(node) {

        // ## Private properties

        /**
         * ### SocketIo.node
         *
         * Reference to the node object.
         */
        this.node = node;

        /**
         * ### Socket.socket
         *
         * Reference to the actual socket-io socket created on connection
         */
        this.socket = null;
    }

    /**
     * ### SocketIo.connect
     *
     * Establishes a socket-io connection with a server
     *
     * Sets the on: 'connect', 'message', 'disconnect' event listeners.
     *
     * @param {string} url The address of the server channel
     * @param {object} options Optional. Configuration options
     */
    SocketIo.prototype.connect = function(url, options) {
        var node, socket;
        node = this.node;

        if ('string' !== typeof url) {
            throw TypeError('SocketIO.connect: url must be string.');
        }

        // See https://github.com/Automattic/socket.io-client/issues/251
        J.mixin(options, { 'force new connection': true });

        socket = io.connect(url, options); //conf.io

        socket.on('connect', function() {
            node.info('socket.io connection open');
            node.socket.onConnect.call(node.socket);
            socket.on('message', function(msg) {
                msg = node.socket.secureParse(msg);
                if (msg) {
                    node.socket.onMessage(msg);
                }
            });
        });

        socket.on('disconnect', function() {
            node.socket.onDisconnect.call(node.socket);
        });

        this.socket = socket;

        return true;
    };

    /**
     * ### SocketIo.disconnect
     *
     * Triggers the disconnection from a server
     */
    SocketIo.prototype.disconnect = function() {
        this.socket.disconnect();
    };

    /**
     * ### SocketIo.isConnected
     *
     * Returns TRUE, if currently connected
     */
    SocketIo.prototype.isConnected = function() {
        return this.socket && this.socket.connected;
    };

    /**
     * ### SocketIo.sendEasy
     *
     * Stringifies and send a message through the socket-io socket
     *
     * @param {object} msg Object implementing a stringify method. Usually,
     *    a game message.
     *
     * @see GameMessage
     */
    SocketIo.prototype.sendEasy = function(msg) {
        this.socket.send(msg.stringify());
    };

    /**
     * ### SocketIo.sendNoSpoof
     *
     * Like SocketIo.sendEasy, but it adds the sid to the message.
     *
     * @param {object} msg Object implementing a stringify method. Usually,
     *    a game message.
     *
     * @see SocketIo.sendEasy
     */
    SocketIo.prototype.sendNoSpoof = function(msg) {
        // Add socket id to prevent spoofing.
        msg.sid = this.node.player.strippedSid;
        this.socket.send(msg.stringify());
    };

    /**
     * ### SocketIo.send
     *
     * Generic function to send a message through the socket-io socket
     *
     * @param {object} msg Object implementing a stringify method. Usually,
     *    a game message.
     *
     * @see GameMessage
     * @see SocketIo.sendEasy
     * @see SocketIo.sendNoSpoof
     */
    SocketIo.prototype.send = SocketIo.prototype.sendEasy;

    /**
     * ### SocketIo.enableAntiSpoofing
     *
     * Adds/removes no-spoof signature from messages
     *
     * @param {boolean} value TRUE to enable, FALSE to disable
     *
     * @see SocketIo.sendEasy
     * @see SocketIo.sendNoSpoof
     */
    SocketIo.prototype.enableAntiSpoofing = function(value) {
        if (value) this.send = this.sendNoSpoof;
        else this.send = this.sendEasy;
    };

    node.SocketFactory.register('SocketIo', SocketIo);

})(
    'undefined' !== typeof node ? node : module.exports,
    'undefined' !== typeof node ? node : module.parent.exports,
    'undefined' !== typeof module && 'undefined' !== typeof require ?
        require('socket.io-client') : 'undefined' !== typeof io ? io : {}
);
