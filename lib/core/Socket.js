/**
 * # Socket
 *
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` component responsible for dispatching events and messages
 *
 * ---
 *
 */

(function (exports, parent) {


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

        this.socket = null;

        this.url = null;

        this.node = node;
    }


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

    Socket.prototype.setSocketType = function(type, options) {
        // returns null on error.
        this.socket = SocketFactory.get(this.node, type, options);
        return this.socket;
    };

    Socket.prototype.connect = function(uri, options) {
        var humanReadableUri = uri || 'local server';
        if (!this.socket) {
            this.node.err('Socket.connet: cannot connet to ' +
                          humanReadableUri + ' . No open socket.');
            return false;
        }

        this.url = uri;
        this.node.log('connecting to ' + humanReadableUri + '.');

        this.socket.connect(uri, 'undefined' !== typeof options ?
                            options : this.user_options);
    };

    Socket.prototype.onDisconnect = function() {
        // Save the current stage of the game
        //this.node.session.store();

        // PlayerList gets cleared. On re-connection will receive a new one.
        this.node.game.pl.clear(true);

        this.node.log('closed');

    };

    Socket.prototype.onMessage = function(msg) {
        msg = this.secureParse(msg);
        if (!msg) return;

        var sessionObj;

        // Parsing successful
        if (msg.target === 'HI') {

            // replace itself: will change onMessage
            this.attachMsgListeners();

            // This will emit on PLAYER_CREATED
            // If listening on PLAYER_CREATED, functions can be
            // executed before the HI
            this.startSession(msg);

            // TODO: do we need this?
            //sessionObj = this.node.store(msg.session);

//            // TODO: recover this branch
//            if (false) {
//                //if (sessionObj) {
//                this.node.session.restore(sessionObj);
//
//                this.send(this.node.msg.create({
//                    target: 'HI_AGAIN',
//                    data: this.node.player
//                }));
//            }
//            else {
//                // TODO: do we need this ? Every time? Shall set an option?
//                // this.node.store(msg.session, this.node.session.save());
//            }

        }
    };

    Socket.prototype.attachMsgListeners = function() {
        this.onMessage = this.onMessageFull;
        this.node.emit('NODEGAME_READY');
    };

    Socket.prototype.setMsgListener = function(msgHandler) {
        if (msgHandler && 'function' !== typeof msgHandler) {
            throw new TypeError('Socket.setMsgListener: msgHandler must be a ' +
                                'function or undefined');
        }

        this.onMessage = msgHandler || this.onMessageFull;
    };

    Socket.prototype.onMessageFull = function(msg) {
        var msgHandler;

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

    Socket.prototype.secureParse = function (msg) {
        var gameMsg;
        try {
            gameMsg = GameMsg.clone(JSON.parse(msg));
            this.node.info('R: ' + gameMsg);
        }
        catch(e) {
            return logSecureParseError('malformed msg received',  e);
        }

        if (this.session && gameMsg.session !== this.session) {
            return logSecureParseError('local session id does not match ' +
                                       'incoming message session id');
        }

        return gameMsg;
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
    Socket.prototype.shouldClearBuffer = function (msgHandler) {
        //if (this.node.game.isReady && this.node.game.isReady()) {
        if (this.node.game.isReady()) {
            this.clearBuffer(msgHandler);
        }
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
    Socket.prototype.clearBuffer = function (msgHandler) {
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
            msg = this.buffer.shift();  // necessary? costly!
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
     */
    Socket.prototype.startSession = function (msg) {
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


    Socket.prototype.registerServer = function(msg) {
        // Setting global info
        this.servername = msg.from;
        // Keep serverid = msg.from for now
        this.serverid = msg.from;
    };

    /**
     * ### Socket.send
     *
     * Pushes a message into the socket.
     *
     * The msg is actually received by the client itself as well.
     *
     * @param {GameMsg} The game message to send
     *
     * @see GameMsg
     *
     * @TODO: Check Do volatile msgs exist for clients?
     */
    Socket.prototype.send = function(msg) {
        if (!this.socket) {
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

    var logSecureParseError = function (text, e) {
        text = text || 'Generic error while parsing a game message';
        var error = (e) ? text + ": " + e : text;
        this.node.log(error, 'ERR');
        this.node.emit('LOG', 'E: ' + error);
        return false;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
