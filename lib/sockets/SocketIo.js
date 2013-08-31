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

(function (exports, node, io) {

    // TODO io will be undefined in Node.JS because module.parents.exports.io does not exists

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
        socket = this.socket;
        node = this.node;

        if (!url) {
            node.err('cannot connect to empty url.', 'ERR');
            return false;
        }

        socket = io.connect(url, options); //conf.io

        socket.on('connect', function (msg) {
            node.info('socket.io connection open');
            socket.on('message', function(msg) {
                node.socket.onMessage(msg);
            });
        });

        socket.on('disconnect', function() {
            node.socket.onDisconnect.call(node.socket);
        });
        return true;

    };

    SocketIo.prototype.send = function (msg) {
        this.socket.send(msg.stringify());
    };

    node.SocketFactory.register('SocketIo', SocketIo);

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports,
    'undefined' != typeof io ? io : require('socket.io-client') 
);
