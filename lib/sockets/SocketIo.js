/**
 * # SocketIo
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Implementation of a remote socket communicating over HTTP
 * through Socket.IO
 *
 * This file requires that the socket.io library is already loaded before
 * nodeGame is loaded to work (see closure).
 */
(function(exports, node, io) {

    // TODO io will be undefined in Node.JS because
    // module.parents.exports.io does not exists

    // ## Global scope

    var GameMsg = node.GameMsg,
    Player = node.Player,
    GameMsgGenerator = node.GameMsgGenerator,
    J = node.JSUS,
    MessagingQueue = node.MessagingQueue,
    constants = node.constants;

    exports.SocketIo = SocketIo;

    /**
     * ## SocketIo constructor
     *
     * Creates a new instance of SocketIo
     *
     * @param {NodeGameClient} node Reference to the node instance
     * @param {object} options Optional argument to override default settings
     * @constructor
     */
    function SocketIo(node, options) {

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
        this.messagingQueue = new MessagingQueue();
        this.reliableMessaging =
            (options != null && options.reliableMessaging != null) ?
                options.reliableMessaging : constants.reliableMessaging;

        this.reliableRetryInterval =
            (options != null && options.reliableRetryInterval != null) ?
                options.reliableRetryInterval : constants.reliableRetryInterval;
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
        var node, socket, that;
        that = this;
        node = this.node;

        if ('string' !== typeof url) {
            throw TypeError('SocketIO.connect: url must be string.');
        }

        // See https://github.com/Automattic/socket.io-client/issues/251
        J.mixin(options, { 'force new connection': true });

        socket = io.connect(url, options); //conf.io

        socket.on('connect', function(msg) {
            node.info('socket.io connection open');
            node.socket.onConnect.call(node.socket);
            socket.on('message', function(msg) {
                msg = node.socket.secureParse(msg);
                if (msg) {
                    if (msg.target === constants.target.ACK) {
                        return that
                               .messagingQueue
                               .deleteMessageWithIntervalById(msg.text);
                    }
                    else if (msg.reliable) {
                        // send ACK
                        var ack = node.msg.create({
                            target: constants.target.ACK,
                            text: msg.id,
                        });

                        that.send(ack);
                    }

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
     * ### SocketIo.send
     *
     * Stringifies and send a message through the socket-io socket
     *
     * @param {object} msg Object implementing a stringiy method. Usually,
     *    a game message.
     *
     * @see GameMessage
     */
    SocketIo.prototype.send = function(msg) {
        var that = this;
        if (msg.reliable && msg.target !== constants.target.ACK) {
            this.messagingQueue.addMessageWithInterval(msg,
                function() {
                    that.socket.send(msg.stringify());
                },
                that.reliableRetryInterval);
        }

        this.socket.send(msg.stringify());
    };

    node.SocketFactory.register('SocketIo', SocketIo);

})(
    'undefined' !== typeof node ? node : module.exports,
    'undefined' !== typeof node ? node : module.parent.exports,
    'undefined' !== typeof module && 'undefined' !== typeof require ?
        require('socket.io-client') : 'undefined' !== typeof io ? io : {}
);
