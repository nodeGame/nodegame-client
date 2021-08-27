/**
 * # Socket
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Wrapper class for the actual socket to send messages
 *
 * http://nodegame.org
 */
(function(exports, parent) {

    "use strict";

    exports.Socket = Socket;

    // ## Global scope

    var GameMsg = parent.GameMsg,
    SocketFactory = parent.SocketFactory,
    J = parent.JSUS;

    /**
     * ## Socket constructor
     *
     * Creates a new instance of Socket
     *
     * @param {NodeGameClient} node Reference to the node instance
     */
    function Socket(node) {

        // ## Public properties

        /**
         * ### Socket.buffer
         *
         * Buffer of queued incoming messages
         *
         * @api private
         */
        this.buffer = [];

        /**
         * ### Socket.outBuffer
         *
         * Buffer of queued outgoing messages
         *
         * TODO: implement!
         *
         * @api private
         */
        // this.outBuffer = [];

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
         * ### Socket.userOptions
         *
         * Contains the options that will be passed to the `connect` method
         *
         * The property is set by `node.setup.socket`.
         * Passing options to the `connect` method will overwrite this property.
         *
         * @see node.setup
         * @see Socket.connect
         */
        this.userOptions = {};

        /**
         * ### Socket.socket
         *
         * The actual socket object (e.g. SocketDirect, or SocketIo)
         */
        this.socket = null;

        /**
         * ### Socket.connected
         *
         * Socket connection established
         *
         * For realiably checking whether the connection is established
         * use `Socket.isConnected()`.
         *
         * @see Socket.connecting
         * @see Socket.isConnected
         * @see Socket.onConnect
         * @see Socket.onDisconnect
         */
        this.connected = false;

        /**
         * ### Socket.connecting
         *
         * Socket connection being established
         *
         * TODO see whether we should merge connected / connecting
         * in one variable with socket states.
         *
         * @see Socket.connected
         * @see Socket.isConnected
         * @see Socket.onConnect
         * @see Socket.onDisconnect
         */
        this.connecting = false;


         /**
         * ### Socket.reconnecting
         *
         * Flags that a reconnection is in progress
         *
         * This is useful when `Socket.reconnect()` triggers a disconnection
         *
         * @see Socket.reconnect
         */
        this.reconnecting = false;

         /**
         * ### Socket.connectingTimeout
         *
         * Timeout to cancel the connecting procedure
         *
         * @see Socket.connecting
         * @see Socket.connect
         */
        this.connectingTimeout = null;

         /**
         * ### Socket.connectingTimeoutMs
         *
         * Number of milliseconds for the connecting timeout
         *
         * Default: 10000 (10 seconds)
         *
         * @see Socket.connecting
         * @see Socket.connect
         */
        this.connectingTimeoutMs = 10000;

        /**
         * ### Socket.url
         *
         * The full url to which the socket is connected
         *
         * This is set when a new connection attempt is started.
         *
         * It might not be meaningful for all types of sockets. For example,
         * in case of SocketDirect, it is not an real url.
         *
         * @see Socket.connect
         */
        this.url = null;

        /**
         * ### Socket.channelName
         *
         * The name of the channel to which the socket is connected
         *
         * This is set upon a successful connection.
         *
         * @see Socket.startSession
         */
        this.channelName = null;

        /**
         * ### Socket.type
         *
         * The type of socket used
         */
        this.type = null;

        /**
         * ### Socket.emitOutMsg
         *
         * If TRUE, outgoing messages will be emitted upon sending
         *
         * This allows, for example, to modify all outgoing messages.
         */
        this.emitOutMsg = false;

        /**
         * ### Socket.antiSpoofing
         *
         * If TRUE, sid is added to each message
         *
         * This setting is sent over by server.
         */
        this.antiSpoofing = null;

        // Experimental Journal.
        // TODO: check if we need it.
        this.journalOn = false;

        // Experimental
        this.journal = new parent.NDDB({
            update: {
                indexes: true
            }
        });
        if (!this.journal.player) {
            this.journal.hash('to');
        }

        // this.journal.comparator('stage', function(o1, o2) {
        //     return parent.GameStage.compare(o1.stage, o2.stage);
        // });


        // if (!this.journal.stage) {
        //     this.journal.hash('stage', function(gb) {
        //         if (gb.stage) {
        //             return parent.GameStage.toHash(gb.stage, 'S.s.r');
        //         }
        //     });
        // }
        // End Experimental Code.

        /**
         * ### Socket.node
         *
         * Reference to the node object.
         */
        this.node = node;
    }

    // ## Socket methods

    /**
     * ### Socket.setup
     *
     * Configures the socket
     *
     * @param {object} options Optional. Configuration options.
     *
     * @see node.setup.socket
     */
    Socket.prototype.setup = function(options) {
        if (!options) return;
        if ('object' !== typeof options) {
            throw new TypeError('Socket.setup: options must be object ' +
                                'or undefined.');
        }
        options = J.clone(options);
        if (options.connectingTimeout) {
            if (!J.isInt(options.connectingTimeout, 0)) {

                throw new TypeError('Socket.setup: options.connectingTimeout ' +
                                    'a positive number or undefined.');
            }
            this.connectingTimeoutMs = options.connectingTimeout;
        }
        if (options.type) {
            this.setSocketType(options.type, options);
            options.type = null;
        }
        if ('undefined' !== typeof options.emitOutMsg) {
            this.emitOutMsg = options.emitOutMsg;
            options.emitOutMsg = null;
        }
        this.userOptions = options;
    };

    /**
     * ### Socket.setSocketType
     *
     * Sets the default socket by requesting it to the Socket Factory
     *
     * Supported types: 'Direct', 'SocketIo'.
     *
     * @param {string} type The name of the socket to use.
     * @param {object} options Optional. Configuration options for the socket.
     *
     * @return {object} The newly created socket object.
     *
     * @see SocketFactory
     */
    Socket.prototype.setSocketType = function(type, options) {
        if ('string' !== typeof type) {
            throw new TypeError('Socket.setSocketType: type must be string.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('Socket.setSocketType: options must be ' +
                                'object or undefined.');
        }
        this.socket = SocketFactory.get(this.node, type, options);

        if (!this.socket) {
            throw new Error('Socket.setSocketType: type not found: ' +
                            type + '.');
        }

        this.type = type;
        return this.socket;
    };

    /**
     * ### Socket.connect
     *
     * Calls the connect method on the actual socket object
     *
     * Uri is usually empty when using SocketDirect.
     *
     * @param {string} uri Optional. The uri to which to connect.
     * @param {object} options Optional. Configuration options for the socket.
     */
    Socket.prototype.connect = function(uri, options) {
        var humanReadableUri, that;

        if (this.isConnected()) {
            throw new Error('Socket.connect: socket is already connected. ' +
                            'Only one connection is allowed.');
        }
        if (this.connecting) {
            throw new Error('Socket.connecting: one connection attempt is ' +
                            'already in progress. Please try again later.');
        }
        if (uri && 'string' !== typeof uri) {
            throw new TypeError('Socket.connect: uri must be string or ' +
                                'undefined.');
        }
        if (options) {
            if ('object' !== typeof options) {
                throw new TypeError('Socket.connect: options must be ' +
                                    'object or undefined.');
            }
            this.userOptions = options;
        }

        humanReadableUri = uri || 'local server';

        if (!this.socket) {
            throw new Error('Socket.connet: cannot connet to ' +
                            humanReadableUri + ' . No socket defined.');
        }
        this.connecting = true;
        this.url = uri;
        this.node.info('connecting to ' + humanReadableUri + '.');
        this.node.emit('SOCKET_CONNECTING');
        this.socket.connect(this.url, this.userOptions);

        // Socket Direct might be already connected.
        if (this.connected) return;

        that = this;
        this.connectingTimeout = setTimeout(function() {
            that.node.warn('connection attempt to ' + humanReadableUri +
                           ' timed out. Disconnected.');
            that.socket.disconnect();
            that.connecting = false;
        }, this.connectingTimeoutMs);
    };

    /**
     * ### Socket.reconnect
     *
     * Calls the connect method with previous parameters
     *
     * @param {boolean} force Optional. Forces the process to continue
     *   even if a previous reconnection is in progress. Warning: can
     *   cause an infinite loop. Default: FALSE
     *
     * @see Socket.connect
     * @see Socket.disconnect
     */
    Socket.prototype.reconnect = function(force) {
        if (!this.url) {
            throw new Error('Socket.reconnect: cannot find previous uri.');
        }
        if (this.reconnecting && !force) {
            node.warn('Socket.reconnect: socket is already reconnecting. ' +
                     'Try with force parameter.');
            return;
        }
        this.reconnecting = true;
        if (this.connecting || this.isConnected()) this.disconnect();
        this.connect(this.url, this.userOptions);
        this.reconnecting = false;
    };

    /**
     * ### Socket.disconnect
     *
     * Calls the disconnect method on the actual socket object
     *
     * @param {boolean} force Forces to call the underlying
     *   `socket.disconnect` method even if socket appears not connected
     *   nor connecting at the moment.
     */
    Socket.prototype.disconnect = function(force) {
        if (!force && (!this.connecting && !this.isConnected())) {
            node.warn('Socket.disconnect: socket is not connected nor ' +
                      'connecting. Try with force parameter.');
            return;
        }
        this.socket.disconnect();
        this.connecting = false;
        this.connected = false;
    };

    /**
     * ### Socket.onConnect
     *
     * Handler for connections to the server
     *
     * @emit SOCKET_CONNECT
     */
    Socket.prototype.onConnect = function() {
        this.connected = true;
        this.connecting = false;
        if (this.connectingTimeout) clearTimeout(this.connectingTimeout);
        this.node.emit('SOCKET_CONNECT');

        // The testing framework expects this, do not remove.
        this.node.info('socket connected.');
    };

    /**
     * ### Socket.onDisconnect
     *
     * Handler for disconnections from the server
     *
     * Clears the player and monitor lists.
     *
     * @emit SOCKET_DISCONNECT
     */
    Socket.prototype.onDisconnect = function() {
        this.connected = false;
        this.connecting = false;
        this.node.emit('SOCKET_DISCONNECT');

        // Save the current stage of the game
        //this.node.session.store();

        // On re-connection will receive a new ones.
        this.node.game.pl.clear();
        this.node.game.ml.clear();

        // Restore original message handler.
        this.setMsgListener(this.onMessageHI);

        // Delete session.
        this.session = null;

        this.node.info('socket closed.');
    };

    /**
     * ### Socket.secureParse
     *
     * Parses a string representing a game msg into a game msg object
     *
     * Checks that the id of the session is correct.
     *
     * @param {string} msg The msg string as received by the socket.
     * @return {GameMsg|undefined} gameMsg The parsed msg, or
     *   undefined on error.
     */
    Socket.prototype.secureParse = function(msg) {
        var gameMsg;
        try {
            gameMsg = GameMsg.clone(JSON.parse(msg));
            this.node.info('R: ' + gameMsg);
        }
        catch(e) {
            return logSecureParseError.call(this, 'malformed msg received', e);
        }
        return gameMsg;
    };

    /**
     * ### Socket.validateIncomingMsg
     *
     * Checks whether an incoming message is valid.
     *
     * Checks that the id of the session is correct.
     *
     * @param {object} msg The msg object to check
     * @return {GameMsg|undefined} gameMsg The parsed msg, or
     *   undefined on error.
     */
    Socket.prototype.validateIncomingMsg = function(gameMsg) {
        if (this.session && gameMsg.session !== this.session) {
            return logSecureParseError.call(this, 'mismatched session in ' +
                                            'incoming message.');
        }
        return gameMsg;
    };

    /**
     * ### Socket.onMessageHI
     *
     * Initial handler for incoming messages from the server
     *
     * This handler will be replaced by the FULL handler, upon receiving
     * a HI message from the server.
     *
     * This method starts the game session, by creating a player object
     * with the data received by the server.
     *
     * @param {GameMsg} msg The game message received and parsed by a socket.
     *
     * @see Socket.validateIncomingMsg
     * @see Socket.startSession
     * @see Socket.onMessageFull
     * @see node.createPlayer
     */
    Socket.prototype.onMessageHI = function(msg) {
        msg = this.validateIncomingMsg(msg);
        if (!msg) return;

        // Parsing successful.
        if (msg.target === 'HI') {

            // Check if connection was authorized.
            if (msg.to === parent.constants.UNAUTH_PLAYER) {
                this.node.warn('connection was not authorized.');
                if (msg.text === 'redirect') {
                    if ('undefined' !== typeof window) {
                        window.location = msg.data;
                    }
                }
                else {
                    this.disconnect();
                }
                return;
            }

            // Replace itself: will change onMessage to onMessageFull.
            this.setMsgListener();

            // This will emit PLAYER_CREATED
            this.startSession(msg);
            // Functions listening to these events can be executed before HI.

            this.node.emit('NODEGAME_READY');
        }
    };

    /**
     * ### Socket.onMessageFull
     *
     * Full handler for incoming messages from the server
     *
     * All parsed messages are either emitted immediately or buffered,
     * if the game is not ready, and the message priority is low.x
     *
     * @param {GameMsg} msg The game message received and parsed by a socket.
     *
     * @see Socket.validateIncomingMsg
     * @see Socket.onMessage
     * @see Game.isReady
     */
    Socket.prototype.onMessageFull = function(msg) {
        msg = this.validateIncomingMsg(msg);
        if (!msg) return;

        // Message with high priority are executed immediately.
        if (msg.priority > 0 || this.node.game.isReady()) {
            this.node.emit(msg.toInEvent(), msg);
        }
        else {
            this.node.silly('B: ' + msg);
            this.buffer.push(msg);
        }
    };

    /**
     * ### Socket.onMessage
     *
     * Handler for incoming messages from the server
     *
     * @see Socket.onMessageHI
     * @see Socket.onMessageFull
     */
    Socket.prototype.onMessage = Socket.prototype.onMessageHI;

    /**
     * ### Socket.setMsgListener
     *
     * Sets the onMessage listener
     *
     * @param msgHandler {function} Optional. Callback function which is
     *  called for every message in the buffer instead of the messages
     *  being emitted.
     *  Default: Socket.onMessageFull
     *
     * @see this.node.emit
     * @see Socket.clearBuffer
     */
    Socket.prototype.setMsgListener = function(msgHandler) {
        if (msgHandler && 'function' !== typeof msgHandler) {
            throw new TypeError('Socket.setMsgListener: msgHandler must be a ' +
                                'function or undefined. Found: ' + msgHandler);
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
     * ### Socket.eraseBuffer
     *
     * Removes all messages currently in the buffer
     *
     * This operation is not reversible
     *
     * @see Socket.clearBuffer
     */
    Socket.prototype.eraseBuffer = function() {
        this.buffer = [];
    };

    /**
     * ### Socket.startSession
     *
     * Initializes a nodeGame session
     *
     * Creates a the player and saves it in node.player, and
     * stores the session ids in the session object.
     *
     * If a game window reference is found, sets the `uriChannel` variable.
     *
     * @param {GameMsg} msg A game-msg
     * @param {boolean} force If TRUE, a new session will be created even
     *    if an existing one is found.
     *
     * @see node.createPlayer
     * @see Socket.registerServer
     * @see GameWindow.setUriChannel
     */
    Socket.prototype.startSession = function(msg, force) {
        if (this.session && !force) {
            throw new Error('Socket.startSession: session already existing. ' +
                            'Use force parameter to overwrite it.');
        }

        // We need to first set the session,
        // and then eventually stop an ongoing game.
        this.session = msg.session;
        if (this.node.game.isStoppable()) this.node.game.stop();

        // Channel name and create player.
        this.channelName = msg.data.channel.name;
        this.node.createPlayer(msg.data.player);

        // Set anti-spoofing as requested by server.
        if (msg.data.antiSpoofing) {
            if (this.socket.enableAntiSpoofing) {
                this.antiSpoofing = true;
                this.socket.enableAntiSpoofing(true);
            }
            else {
                this.node.log('Socket.startSession: server requested anti-' +
                              'spoofing, but socket does not support it.');
            }
        }

        // Notify GameWindow (if existing, and if not default channel).
        if (this.node.window && !msg.data.channel.isDefault) {
            this.node.window.setUriChannel(this.channelName);
        }
    };

    /**
     * ### Socket.isConnected
     *
     * Returns TRUE if socket connection is ready.
     */
    Socket.prototype.isConnected = function() {
        return this.socket && this.socket.isConnected();
    };

    /**
     * ### Socket.send
     *
     * Pushes a message into the socket
     *
     * The msg is actually received by the client itself as well.
     *
     * @param {GameMsg} msg The game message to send
     *
     * @return {boolean} TRUE on success
     *
     * @see GameMsg
     *
     * TODO: when trying to send a message and the socket is not connected
     * the message is just discarded. Outgoing messages could be buffered
     * and sent out whenever the connection is available again.
     */
    Socket.prototype.send = function(msg) {
        var outEvent;

        if (!msg.from || msg.from === this.node.UNDEFINED_PLAYER) {
            this.node.err('Socket.send: cannot send message. ' +
                          'Player undefined. Message discarded.');
            return false;
        }

        if (!this.isConnected()) {
            this.node.err('Socket.send: cannot send message. ' +
                          'No open socket. Message discarded.');

            // TODO: test this
            // this.outBuffer.push(msg);
            return false;
        }

        // TODO: test this
        // if (!this.node.game.isReady()) {
        //     this.outBuffer.push(msg);
        //     return false;
        // }

        // Emit out event, if required.
        if (this.emitOutMsg) {
            outEvent = msg.toOutEvent();
            this.node.events.ee.game.emit(outEvent, msg);
            this.node.events.ee.stage.emit(outEvent, msg);
            this.node.events.ee.step.emit(outEvent, msg);
        }

        this.socket.send(msg);
        this.node.info('S: ' + msg);

        // TODO: check this.
        // Experimental code.
        if (this.journalOn) {
            // Only Game messages are stored.
            if (this.node.game.isReady()) this.journal.insert(msg);
        }
        // End experimental code.

        return true;
    };

    // Helper methods.

    function logSecureParseError(text, e) {
        var error;
        text = text || 'generic error while parsing a game message.';
        error = (e) ? text + ": " + e : text;
        this.node.err('Socket.secureParse: ' + error);
        return false;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
