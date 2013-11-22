/**
 * # Socket
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` component responsible for dispatching events and messages.
 * ---
 */
(function(exports, parent) {

    "use strict";

    exports.Socket = Socket;

    // ## Global scope

    var GameMsg = parent.GameMsg,
    SocketFactory = parent.SocketFactory,
    J = parent.JSUS;

    var action = parent.action;

    function Socket(node, options) {

        // ## Private properties

        /**
         * ### Socket.buffer
         *
         * Buffer of queued messages
         *
         * @api private
         */
        this.buffer = [];

        /**
         * ### Socket.session
         *
         * The session id shared with the server
         *
         * This property is initialized only when a game starts
         *
         */
        this.session = null;

        /**
         * ### Socket.user_options
         *
         * Contains the options that will be passed to the `connect` method
         *
         * The property is set by `node.setup.socket`
         *
         * @see node.setup
         */
        this.user_options = {};

        /**
         * ### Socket.connected
         *
         * Boolean flag, TRUE if socket is connected to server
         */
        this.user_options = {};

        /**
         * ### Socket.socket
         *
         * The actual socket object (e.g. SocketDirect, or SocketIo)
         */
        this.socket = null;

         /**
         * ### Socket.connected
         *
         * Socket connection established.
         *
         * @see Socket.isConnected
         * @see Socket.onConnect
         * @see Socket.onDisconnect
         */
        this.connected = false;

        /**
         * ### Socket.url
         *
         * The url to which the socket is connected
         *
         * It might not be meaningful for all types of sockets. For example, 
         * in case of SocketDirect, it is not an real url.
         */
        this.url = null;

        /**
         * ### Socket.node
         *
         * Reference to the node object.
         */
        this.node = node;
    }

    /**
     * ## Socket.setup
     *
     * Configure the socket. 
     *
     * @param {object} options Optional. Configuration options.
     * @see node.setup.socket
     */
    Socket.prototype.setup = function(options) {
        var type;
        options = options ? J.clone(options) : {};
        type = options.type;
        delete options.type;
        this.user_options = options;
        if (type) {
            this.setSocketType(type, options);
        }
    };

    /**
     * ## Socket.setSocketType
     *
     * Set the default socket by requesting it to the Socket Factory.
     *
     * Supported types: 'Direct', 'SocketIo'.
     *
     * @param {string} type The name of the socket to use.
     * @param {object} options Optional. Configuration options for the socket.
     * @see SocketFactory
     */
    Socket.prototype.setSocketType = function(type, options) {
        // returns null on error.
        this.socket = SocketFactory.get(this.node, type, options);
        return this.socket;
    };

    /**
     * ## Socket.connect
     *
     * Calls the connect method on the actual socket object.
     *
     * @param {string} uri The uri to which to connect.
     * @param {object} options Optional. Configuration options for the socket.
     */
    Socket.prototype.connect = function(uri, options) {
        var humanReadableUri = uri || 'local server';
        if (!this.socket) {
            this.node.err('Socket.connet: cannot connet to ' +
                          humanReadableUri + ' . No socket defined.');
            return false;
        }

        this.url = uri;
        this.node.log('connecting to ' + humanReadableUri + '.');

        this.socket.connect(uri,'undefined' !== typeof options ?
                            options : this.user_options);
    };

    /**
     * ## Socket.onConnect
     *
     * Handler for connections to the server.
     *
     * @emit SOCKET_CONNECT
     */
    Socket.prototype.onConnect = function() {
        this.connected = true;
        this.node.emit('SOCKET_CONNECT');
        this.node.log('socket connected.');
    };

    /**
     * ## Socket.onDisconnect
     *
     * Handler for disconnections from the server.
     *
     * Clears the player and monitor lists.
     *
     * @emit SOCKET_DISCONNECT
     */
    Socket.prototype.onDisconnect = function() {
        this.connected = false;
        node.emit('SOCKET_DISCONNECT');
        // Save the current stage of the game
        //this.node.session.store();

        // On re-connection will receive a new ones.
        this.node.game.pl.clear(true);
        this.node.game.ml.clear(true);

        this.node.log('socket closed.');
    };

    /**
     * ## Socket.secureParse
     *
     * Parses a string representing a game msg into a game msg object
     *
     * Checks that the id of the session is correct.
     *
     * @param {string} msg The msg string as received by the socket.
     * @return {GameMsg|undefined} gameMsg The parsed msg, or undefined on error.
     */
    Socket.prototype.secureParse = function(msg) {
        var gameMsg;
        try {
            gameMsg = GameMsg.clone(JSON.parse(msg));
            this.node.info('R: ' + gameMsg);
        }
        catch(e) {
            return logSecureParseError.call(this, 'malformed msg received',  e);
        }

        if (this.session && gameMsg.session !== this.session) {
            return logSecureParseError.call(this, 'local session id does not ' +
                                       'match incoming message session id.');
        }

        return gameMsg;
    };

    /**
     * ## Socket.onMessage
     *
     * Initial handler for incoming messages from the server.
     *
     * This handler will be replaced by the FULL handler, upon receiving
     * a HI message from the server.
     *
     * This method starts the game session, by creating a player object
     * with the data received by the server.
     *
     * @param {string} msg The msg string as received by the socket.
     * 
     * @see Socket.startSession
     * @see Socket.onMessageFull
     * @see node.createPlayer
     */
    Socket.prototype.onMessage = function(msg) {
        msg = this.secureParse(msg);
        if (!msg) return;

        // Parsing successful.
        if (msg.target === 'HI') {
            // TODO: do we need to more checkings, besides is HI?

            // Replace itself: will change onMessage to onMessageFull.
            this.setMsgListener();
            this.node.emit('NODEGAME_READY');

            // This will emit PLAYER_CREATED
            this.startSession(msg);
            // Functions listening to these events can be executed before HI. 
        }
    };

    /**
     * ## Socket.onMessageFull
     *
     * Full handler for incoming messages from the server.
     *
     * All parsed messages are either emitted immediately or buffered,
     * if the game is not ready, and the message priority is low.x
     *
     * @param {string} msg The msg string as received by the socket.
     * 
     * @see Socket.onMessage
     * @see Game.isReady
     */
    Socket.prototype.onMessageFull = function(msg) {
        msg = this.secureParse(msg);
        if (msg) { // Parsing successful
            // message with high priority are executed immediately
            if (msg.priority > 0 || this.node.game.isReady()) {
                this.node.emit(msg.toInEvent(), msg);
            }
            else {
                this.node.silly('B: ' + msg);
                this.buffer.push(msg);
            }
        }
    };

    /**
     * ### Socket.shouldClearBuffer
     *
     * Clears buffer conditionally
     *
     * @param msgHandler {function} Optional. Callback function which is
     *  called for every message in the buffer instead of the messages
     *  being emitted.
     *  Default: Emit every buffered message.
     *
     * @see this.node.emit
     * @see Socket.clearBuffer
     */
    Socket.prototype.setMsgListener = function(msgHandler) {
        if (msgHandler && 'function' !== typeof msgHandler) {
            throw new TypeError('Socket.setMsgListener: msgHandler must be a ' +
                                'function or undefined');
        }

        this.onMessage = msgHandler || this.onMessageFull;
    };

    /**
     * ### Socket.shouldClearBuffer
     *
     * Returns TRUE, if buffered messages can be emitted
     *
     * @see node.emit
     * @see Socket.clearBuffer
     * @see Game.isReady
     */
    Socket.prototype.shouldClearBuffer = function() {
        return this.node.game.isReady();
    };

    /**
     * ### Socket.clearBuffer
     *
     * Emits and removes all the events in the message buffer
     *
     * @param msgHandler {function} Optional. Callback function which is
     *  called for every message in the buffer instead of the messages
     *  being emitted.
     *  Default: Emit every buffered message.
     *
     * @see node.emit
     * @see Socket.shouldClearBuffer
     */
    Socket.prototype.clearBuffer = function(msgHandler) {
        var nelem, msg, i;
        var funcCtx, func;
       
        if (msgHandler) {
            funcCtx = this.node.game;
            func = msgHandler;
        }
        else {
            funcCtx = this.node.events;
            func = this.node.events.emit;
        }

        nelem = this.buffer.length;
        for (i = 0; i < nelem; i++) {
            // Modify the buffer at every iteration, so that if an error
            // occurs, already emitted messages are out of the way.
            msg = this.buffer.shift();
            if (msg) {
                func.call(funcCtx, msg.toInEvent(), msg);
                this.node.silly('D: ' + msg);
            }
        }
    };

    /**
     * ### Socket.startSession
     *
     * Initializes a nodeGame session
     *
     * Creates a the player and saves it in node.player, and
     * stores the session ids in the session object
     *
     * @param {GameMsg} msg A game-msg
     * @return {boolean} TRUE, if session was correctly initialized
     *
     * @see node.createPlayer
     * @see Socket.registerServer
     */
    Socket.prototype.startSession = function(msg) {
        // Extracts server info from the first msg.
        this.registerServer(msg);

        this.session = msg.session;
        this.node.createPlayer(msg.data);

        if (this.node.store.cookie) {
            this.node.store.cookie('session', this.session);
            this.node.store.cookie('player', this.node.player.id);
        }
        else {
            this.node.warn('Socket.startSession: cannot set cookies. Session ' +
                           'support disabled');
        }
        return true;
    };

    /**
     * ### Socket.registerServer
     *
     * Saves the server information based on anx incoming message
     *
     * @param {GameMsg} msg A game message
     *
     * @see node.createPlayer
     */
    Socket.prototype.registerServer = function(msg) {
        // Setting global info
        this.servername = msg.from;
        // Keep serverid = msg.from for now
        this.serverid = msg.from;
    };

    /**
     * ### Socket.isConnected
     *
     * Returns TRUE if socket connection is ready.
     */
    Socket.prototype.isConnected = function() {
        return this.connected && this.socket && this.socket.isConnected();
    };

    /**
     * ### Socket.send
     *
     * Pushes a message into the socket.
     *
     * The msg is actually received by the client itself as well.
     *
     * @param {GameMsg} The game message to send
     * @return {boolean} TRUE, on success.
     *
     * @see GameMsg
     *
     * TODO: when trying to send a message and the socket is not connected
     * the message is just discarded. Outgoing messages could be buffered
     * and sent out whenever the connection is available again.
     */
    Socket.prototype.send = function(msg) {
        if (!this.isConnected()) {
            this.node.err('Socket.send: cannot send message. No open socket.');
            return false;
        }

        if (msg.from === this.node.UNDEFINED_PLAYER) {
            this.node.err('Socket.send: cannot send message. Player undefined.');
            return false;
        }

        // TODO: add conf variable node.emitOutMsg
        if (this.node.debug) {
            this.node.emit(msg.toOutEvent(), msg);
        }

        this.socket.send(msg);
        this.node.info('S: ' + msg);
        return true;
    };

    // helping methods

    var logSecureParseError = function(text, e) {
        var error;
        text = text || 'generic error while parsing a game message.';
        error = (e) ? text + ": " + e : text;
        this.node.err('Socket.secureParse: ' + error);
        return false;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
