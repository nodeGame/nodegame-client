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

var buffer, session;

function Socket(options) {
	
// ## Private properties

/**
 * ### Socket.buffer
 * 
 * Buffer of queued messages 
 * 
 * @api private
 */ 
    buffer = [];
    if (node.support.defineProperty) {
	Object.defineProperty(this, 'buffer', {
	    value: buffer,
	    enumerable: true
	});
	}
    else {
	this.buffer = buffer;
    }
    
/**
 * ### Socket.session
 * 
 * The session id shared with the server
 * 
 * This property is initialized only when a game starts
 * 
 */
    session = null;
    if (node.support.defineProperty) {
	Object.defineProperty(this, 'session', {
	    value: session,
	    enumerable: true
	});
	}
    else {
	this.session = session;
    }
    
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
    var socket =  SocketFactory.get(type, options);
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
		action: action.SAY,
		target: 'HI_AGAIN',
		data: node.player
	    });
	    
	    this.send(msg);
	    
	}
	else {
	    node.store(msg.session, node.session.save());
	    
	    this.sendHI(node.player, 'ALL');
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
	// TODO: improve
	if (node.game.isReady && node.game.isReady()) {
	    node.emit(msg.toInEvent(), msg);
	}
	else {
	    console.log('BUFFERING');
	    node.silly('buffering: ' + msg);
	    buffer.push(msg);
	}
    }
};


Socket.prototype.registerServer = function(msg) {
	// Setting global info
	this.servername = msg.from;
	// Keep serverid = msg.from for now
	this.serverid = msg.from;
};


Socket.prototype.secureParse = secureParse = function (msg) {
	
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
    var nelem = buffer.length, msg;
    for (var i=0; i < nelem; i++) {
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

    // Store server info
    this.registerServer(msg);
    
    var player = {
	id: msg.data,	
	sid: msg.data
    };
    node.createPlayer(player);
    this.session = msg.session;
    return true;
};

//## SEND methods


/**
* ### Socket.send
* 
* Pushes a message into the socket.
* 
* The msg is actually received by the client itself as well.
* 
* @param {GameMsg} The game message to send
* 
* 	@see GameMsg
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


/**
* ### Socket.sendHI
* 
* Creates a HI message and pushes it into the socket
*   
* @param {string} from Optional. The message sender. Defaults node.player
* @param {string} to Optional. The recipient of the message. Defaults 'SERVER'
* 
*/
Socket.prototype.sendHI = function (from, to) {
    from = from || node.player;
    to = to || 'SERVER';
    var msg = node.msg.createHI(from, to);
    this.send(msg);
};

/**
 * @TODO: do we need this??
* ### Socket.sendSTAGE
* 
* Creates a STAGE message and pushes it into the socket
* 
* @param {string} action A nodeGame action (e.g. 'get' or 'set')
* @param {GameStage} stage The GameStage object to send
* @param {string} to Optional. The recipient of the message.
*  
*/
//Socket.prototype.sendSTATE = function (action, state, to) {	
//	var msg = node.msg.createSTAGE(action, stage, to);
//	this.send(msg);
//};


/**
* ### Socket.sendSTAGE
* 
* Creates a STAGE message and pushes it into the socket
* 
* @param {string} action A nodeGame action (e.g. 'get' or 'set')
* @param {GameStage} stage The GameStage object to send
* @param {string} to Optional. The recipient of the message.
*  
*/
Socket.prototype.sendSTAGE = function (action, stage, to) {	
    var msg = node.msg.create({
	action: node.action.SAY,
	target: node.target.STAGE,
	data: stage, 
	to: to
    });
    
    this.send(msg);
};

/**
* ### Socket.sendTXT
*
* Creates a TXT message and pushes it into the socket
* 
* @param {string} text Text to send
* @param {string} to Optional. The recipient of the message
*/
Socket.prototype.sendTXT = function(text, to) {	
    var msg = node.msg.createTXT(text,to);
    this.send(msg);
};

/**
* ### Socket.sendDATA
* 
* Creates a DATA message and pushes it into the socket
* 
* @param {string} action Optional. A nodeGame action (e.g. 'get' or 'set'). Defaults 'say'
* @param {object} data An object to exchange
* @param {string} to Optional. The recipient of the message. Defaults 'SERVER'
* @param {string} text Optional. A descriptive text associated to the message.
* 
* @TODO: invert parameter order: first data then action
*/
Socket.prototype.sendDATA = function (action, data, to, text) {
    action = action || GameMsg.say;
    to = to || 'SERVER';
    text = text || 'DATA';
    var msg = node.msg.createDATA(action, data, to, text);
    this.send(msg);
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
