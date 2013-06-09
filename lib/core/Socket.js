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

(function (exports, node) {

	
exports.Socket = Socket;	
	
// ## Global scope
	
var GameMsg = node.GameMsg,
    GameStage = node.GameStage,
    Player = node.Player,
    GameMsgGenerator = node.GameMsgGenerator,
    SocketFactory = node.SocketFactory;
    
var action = node.action;

function Socket(options) {
	
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
    
    this.socket = null;
    
    this.url = null;
}
    

Socket.prototype.setup = function(options) {
    options = options || {};
    
    if (options.type) {
	this.setSocketType(options.type, options);
    }
	
};
    
Socket.prototype.setSocketType = function(type, options) {
    var socket = SocketFactory.get(type, options);
    if (socket) {
	this.socket = socket;
	return true;
    }
    else {
	return false;
    }
};

Socket.prototype.connect = function(url, options) {
	
    if (!this.socket) {
	node.err('cannot connet to ' + url + ' . No open socket.');
	return false;
    }
    
    this.url = url;
    node.log('connecting to ' + url);
	
    this.socket.connect(url, options);
};

Socket.prototype.onDisconnect = function() {
    // Save the current stage of the game
    node.session.store();
    node.log('closed');
};

Socket.prototype.onMessage = function(msg) {
	
    msg = this.secureParse(msg);
    if (!msg) return;
    
    var sessionObj;
	
    // Parsing successful
    if (msg.target === 'HI') {
	
	// replace itself: will change onMessage
	this.attachMsgListeners();
	
	this.startSession(msg);
	
	sessionObj = node.store(msg.session);
	
	if (false) {
	    //if (sessionObj) {
	    node.session.restore(sessionObj);
			
	    msg = node.msg.create({
		target: 'HI_AGAIN',
		data: node.player
	    });
	    
	    this.send(msg);
	    
	}
	else {
	    node.store(msg.session, node.session.save());
	    
	    // send HI to ALL
	    this.send(node.msg.create({
		target: 'HI',
		to: 'ALL',
		data: node.player
	    }));

	}
	
    } 
};

Socket.prototype.attachMsgListeners = function() {
    this.onMessage = this.onMessageFull;
    node.emit('NODEGAME_READY');
};

Socket.prototype.onMessageFull = function(msg) {
    msg = this.secureParse(msg);
    
    if (msg) { // Parsing successful
	// message with high priority are executed immediately
	if (msg.priority > 0 || node.game.isReady && node.game.isReady()) {
	    node.emit(msg.toInEvent(), msg);
	}
	else {
	    node.silly('buffering: ' + msg);
	    this.buffer.push(msg);
	}
    }
};


Socket.prototype.registerServer = function(msg) {
	// Setting global info
	this.servername = msg.from;
	// Keep serverid = msg.from for now
	this.serverid = msg.from;
};


Socket.prototype.secureParse = function (msg) {
	
    var gameMsg;
    try {
	gameMsg = GameMsg.clone(JSON.parse(msg));
	node.info('R: ' + gameMsg);
    }
    catch(e) {
	return logSecureParseError('malformed msg received',  e);
    }

    if (this.session && gameMsg.session !== this.session) {
	return logSecureParseError('local session id does not match incoming message session id');
    }
    
    return gameMsg;
};


/**
 * ### Socket.clearBuffer
 * 
 * Emits and removes all the events in the message buffer
 * 
 * @see node.emit
 */
Socket.prototype.clearBuffer = function () {
    var nelem, msg, i;
    nelem = this.buffer.length;
    for (i = 0; i < nelem; i++) {
	msg = this.buffer.shift();
	if (msg) {
	    node.emit(msg.toInEvent(), msg);
	    node.silly('Debuffered ' + msg);
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
 * 	@see node.createPlayer
 */
Socket.prototype.startSession = function (msg) {
    var player;
    // Store server info
    this.registerServer(msg);
    
    player = {
	id: msg.data,	
	sid: msg.data
    };
    node.createPlayer(player);
    this.session = msg.session;
    return true;
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
	node.err('socket cannot send message. No open socket.');
	return false;
    }
    
    this.socket.send(msg);
    node.info('S: ' + msg);
    return true;
};

// helping methods

var logSecureParseError = function (text, e) {
    text = text || 'Generic error while parsing a game message';
    var error = (e) ? text + ": " + e : text;
    node.log(error, 'ERR');
    node.emit('LOG', 'E: ' + error);
    return false;
};

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
