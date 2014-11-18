/**
 * # SocketIo
 *
 * Copyright(c) 2014 Stefano Balietti
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
    GameMsgGenerator = node.GameMsgGenerator;

    exports.SocketIo = SocketIo;

    function SocketIo(node, options) {
        this.node = node;
        this.socket = null;
    }

    SocketIo.prototype.connect = function(url, options) {
        var node, socket;
        node = this.node;

        if (!url) {
            node.err('cannot connect to empty url.', 'ERR');
            return false;
        }

        socket = io.connect(url, options); //conf.io

        socket.on('connect', function(msg) {
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

    SocketIo.prototype.isConnected = function() {
        return this.socket &&
            this.socket.socket &&
            this.socket.socket.connected;
    };

    SocketIo.prototype.send = function(msg) {
        this.socket.send(msg.stringify());
    };

    node.SocketFactory.register('SocketIo', SocketIo);

})(
    'undefined' !== typeof node ? node : module.exports,
    'undefined' !== typeof node ? node : module.parent.exports,
    'undefined' !== typeof module && 'undefined' !== typeof require ?
        require('socket.io-client') : 'undefined' !== typeof io ? io : {}
);
