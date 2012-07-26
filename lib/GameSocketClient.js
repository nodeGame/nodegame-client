/**
 * # GameSocketClient
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` component rensponsible for dispatching events and messages 
 * 
 * ---
 * 
 */

(function (exports, node, io) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	GameState = node.GameState,
	Player = node.Player,
	GameMsgGenerator = node.GameMsgGenerator;

var buffer,
	session;
	

exports.GameSocketClient = GameSocketClient;

/**
 * ## GameSocketClient constructor
 * 
 * Creates a new instance of GameSocketClient
 * 
 * @param {object} options Optional. A configuration object
 */
function GameSocketClient (options) {
	options = options || {};
	
// ## Private properties
	
/**
 * ### GameSocketClient.buffer
 * 
 * Buffer of queued messages 
 * 
 * @api private
 */ 
	buffer = [];
	Object.defineProperty(this, 'buffer', {
		value: buffer,
		enumerable: true,
	});
	
/**
 * ### GameSocketClient.session
 * 
 * The session id shared with the server
 * 
 * This property is initialized only when a game starts
 * 
 */
	session = null;
	Object.defineProperty(this, 'session', {
		value: session,
		enumerable: true,
	});
	
// ## Public properties
	
/**
 * ### GameSocketClient.io
 * 
 * 
 */	
	this.io 		= null;
/**
 * ### GameSocketClient.url
 * 
 */		
	this.url 		= null;
	
/**
 * ### GameSocketClient.servername
 * 
 */	
	this.servername = null;

}

// ## GameSocketClient methods

/**
 * ### GameSocketClient.getSession
 * 
 * Searches the node.session object for a saved session matching the passed 
 * game-message
 * 
 * If found, the session object will have the following a structure
 * 
 *	var session = {
 * 		id: 	node.gsc.session,
 * 		player: node.player,
 * 		memory: node.game.memory,
 * 		state: 	node.game.gameState,
 * 		game: 	node.game.name,
 * 		history: undefined,
 * 	};	
 * 
 * 
 * @param {GameMsg} msg A game-msg
 * @return {object|boolean} A session object, or FALSE if not was not found
 * 
 * 	@see node.session
 */
GameSocketClient.prototype.getSession = function (msg) {
	if (!msg) return false;
	
	var session = false;
	if ('function' === typeof node.session)	{
		session = node.session(msg.session);
	}
	
	// TODO: check if session is still valid
	return (session) ? session : false;
};

/**
 * ### GameSocketClient.startSession
 * 
 * Initializes a nodeGame session
 * 
 * Creates a the player and saves it in node.player, and stores the session ids
 * in the session object (GameSocketClient.session)
 * 
 * @param {GameMsg} msg A game-msg
 * @return {boolean} TRUE, if session was correctly initialized
 * 
 * 	@see GameSocketClient.createPlayer
 */
GameSocketClient.prototype.startSession = function (msg) {
	var player = {
			id:		msg.data,	
			sid: 	msg.data,
	};
	this.createPlayer(player);
	session = msg.session;
	return true;
};

/**
 * ### GameSocketClient.restoreSession
 * 
 * Restores a session object
 * 
 * @param {object} session A session object as loaded by GameSocketClient.getSession
 * 
 * 
 * 	@emit NODEGAME_RECOVERY
 * 	@emit LOADED
 * 
 * 	@see GameSocketClient.createPlayer
 * 	@see node.session
 */
GameSocketClient.prototype.restoreSession = function (sessionObj, sid) {
	if (!sessionObj) return;
	
	var log_prefix = 'nodeGame session recovery: ';
	
	node.log('Starting session recovery ' + sid, 'INFO', log_prefix);
	node.emit('NODEGAME_RECOVERY', sid);
	
	sid = sid || sessionObj.player.sid;
	
	this.session = sessionObj.id;
	
	// Important! The new socket.io ID
	session.player.sid = sid;

	this.createPlayer(session.player);
	node.game.memory = session.memory;
	node.goto(session.state);
	
	if (!sessionObj.history) {
		node.log('No event history was found to recover', 'WARN', log_prefix);
		return true;
	}
	
	node.log('Recovering ' + session.history.length + ' events', 'DEBUG', log_prefix);
	
	node.events.history.import(session.history);
	var hash = new GameState(session.state).toHash('S.s.r'); 
	if (!node.events.history.state) {
		node.log('No old events to re-emit were found during session recovery', 'DEBUG', log_prefix);
		return true; 
	}
	if (!node.events.history.state[hash]){
		node.log('The current state ' + hash + ' has no events to re-emit', 'DEBUG', log_prefix);
		return true; 
	}
	
	var discard = ['LOG', 
	               'STATECHANGE',
	               'WINDOW_LOADED',
	               'BEFORE_LOADING',
	               'LOADED',
	               'in.say.STATE',
	               'UPDATED_PLIST',
	               'NODEGAME_READY',
	               'out.say.STATE',
	               'out.set.STATE',
	               'in.say.PLIST',
	               'STATEDONE', // maybe not here
	               'out.say.HI',
		               
	];
	
	var to_remit = node.events.history.state[hash];
	to_remit.select('event', 'in', discard).delete();
	
	if (!to_remit.length){
		node.log('The current state ' + hash + ' has no valid events to re-emit', 'DEBUG', log_prefix);
		return true;
	}
	
	var remit = function () {
		node.log('Re-emitting ' + to_remit.length + ' events', 'DEBUG', log_prefix);
		// We have events that were fired at the state when 
		// disconnection happened. Let's fire them again 
		to_remit.each(function(e) {
			// Falsy, should already been discarded
			if (!JSUS.in_array(e.event, discard)) {
				node.emit(e.event, e.p1, e.p2, e.p3);
			}
		});
	};
	
	if (node.game.ready) {
		remit.call(node.game);
	}
	else {
		node.on('LOADED', function(){
			remit.call(node.game);
		});
	}
	
	return true;
};




/**
 * ### GameSocketClient.createPlayer
 * 
 * Mixes in default properties for the player object and
 * additional configuration variables from node.conf.player
 * 
 * Writes the node.player object
 * 
 * Properties: `id`, `sid`, `ip` can never be overwritten.
 * 
 * Properties added as local configuration cannot be further
 * modified during the game. 
 * 
 * Only the property `name`, can be changed.
 * 
 */
GameSocketClient.prototype.createPlayer = function (player) {
	player = new Player(player);
	

	if (node.conf && node.conf.player) {			
		var pconf = node.conf.player;
		for (var key in pconf) {
			if (pconf.hasOwnProperty(key)) {
				if (JSUS.in_array(key, ['id', 'sid', 'ip'])) {
					continue;
				} 
				// Cannot be overwritten properties previously 
				// set in other sessions (recovery)
				if (pl.hasOwnProperty(key)) {
					continue;
				}
				
				Object.defineProperty(player, key, {
			    	value: pconf[key],
			    	enumerable: true,
				});
			}
		}
	}
	
	Object.defineProperty(node, 'player', {
    	value: player,
    	enumerable: true,
	});

	return player;
};

/**
 * ### GameSocketClient.connect
 * 
 * Initializes the connection to a nodeGame server
 * 
 * 
 * 
 * @param {object} conf A configuration object
 */
GameSocketClient.prototype.connect = function (conf) {
	conf = conf || {};
	if (!conf.url) {
		node.log('cannot connect to empty url.', 'ERR');
		return false;
	}
	
	this.url = conf.url;
	
	node.log('connecting to ' + conf.url);
	this.io = io.connect(conf.url, conf.io);
    this.attachFirstListeners(this.io);
    return this.io;
};

// ## I/O Functions


/**
 * ### GameSocketClient.secureParse
 * 
 * Parse the message received in the Socket
 * 
 * @param {object|GameMsg} msg The game-message to parse
 * @return {GameMsg|boolean} The parsed GameMsg object, or FALSE if an error occurred
 *  
 */
GameSocketClient.prototype.secureParse = function (msg) {
	
	try {
		var gameMsg = GameMsg.clone(JSON.parse(msg));
		node.log('R: ' + gameMsg);			
		node.emit('LOG', 'R: ' + gameMsg.toSMS());
		return gameMsg;
	}
	catch(e) {
		var error = "Malformed msg received: " + e;
		node.log(error, 'ERR');
		node.emit('LOG', 'E: ' + error);
		return false;
	}
	
};

/**
 * ### GameSocketClient.clearBuffer
 * 
 * Emits and removes all the events in the message buffer
 * 
 * 	@see node.emit
 */
GameSocketClient.prototype.clearBuffer = function () {
	var nelem = buffer.length;
	for (var i=0; i < nelem; i++) {
		var msg = this.buffer.shift();
		node.emit(msg.toInEvent(), msg);
		node.log('Debuffered ' + msg, 'DEBUG');
	}
};

/**
 * ### GameSocketClient.attachFirstListeners
 *
 * Initializes the socket to wait for a HI message from the server
 * 
 * Nothing is done until the SERVER send an HI msg. All the others msgs will
 * be ignored otherwise.
 * 
 * @param {object} socket The socket.io socket
 */
GameSocketClient.prototype.attachFirstListeners = function (socket) {
	
	var that = this;
	
	socket.on('connect', function (msg) {
		var connString = 'nodeGame: connection open';
	    node.log(connString); 
	    
	    socket.on('message', function (msg) {	
	    	
	    	var msg = that.secureParse(msg);
	    	
	    	if (msg) { // Parsing successful
				if (msg.target === 'HI') {

					// Setting global info
					that.servername = msg.from;
					
					var sessionObj = that.getSession(msg);
					
					if (sessionObj) {
						that.restoreSession(sessionObj, socket.id);
						
						// Get Ready to play
						that.attachMsgListeners(socket, msg.session);
						
						var msg = node.msg.create({
							action: GameMsg.actions.SAY,
							target: 'HI_AGAIN',
							data: node.player,
						});
//							console.log('HI_AGAIN MSG!!');
//							console.log(msg);
						that.send(msg);
						
					}
					else {
						that.startSession(msg);
						// Get Ready to play
						that.attachMsgListeners(socket, msg.session);
						
						// Send own name to SERVER
						that.sendHI(node.player, 'ALL');
					}
					

					// Ready to play
					node.emit('out.say.HI');
			   	 } 
	    	}
	    });
	    
	});
	
    socket.on('disconnect', function() {
    	// Save the current state of the game
    	node.session.store();
    	node.log('closed');
    });
};

/**
 * ### GameSocketClient.attachMsgListeners
 * 
 * Attaches standard message listeners
 * 
 * This method is called after the client has received a valid HI message from
 * the server, and a session number has been issued
 * 
 * @param {object} socket The socket.io socket
 * @param {number} session The session id issued by the server
 * 
 * @emit NODEGAME_READY
 */
GameSocketClient.prototype.attachMsgListeners = function (socket, session) {   
	var that = this;
	
	node.log('Attaching FULL listeners');
	socket.removeAllListeners('message');
		
	socket.on('message', function(msg) {
		var msg = that.secureParse(msg);
		
		if (msg) { // Parsing successful
			// Wait to fire the msgs if the game state is loading
			if (node.game && node.game.ready) {	
				node.emit(msg.toInEvent(), msg);
			}
			else {
				node.log('Buffering: ' + msg, 'DEBUG');
				buffer.push(msg);
			}
		}
	});
	
	node.emit('NODEGAME_READY');
};

// ## SEND methods

/**
 * ### GameSocketClient.sendHI
 * 
 * Creates a HI message and pushes it into the socket
 *   
 * @param {string} from Optional. The message sender. Defaults node.player
 * @param {string} to Optional. The recipient of the message. Defaults 'SERVER'
 * 
 */
GameSocketClient.prototype.sendHI = function (from, to) {
	from = from || node.player;
	to = to || 'SERVER';
	var msg = node.msg.createHI(from, to);
	this.send(msg);
};

/**
 * ### GameSocketClient.sendSTATE
 * 
 * Creates a STATE message and pushes it into the socket
 * 
 * @param {string} action A nodeGame action (e.g. 'get' or 'set')
 * @param {GameState} state The GameState object to send
 * @param {string} to Optional. The recipient of the message.
 * 
 * 	@see GameMsg.actions
 */
GameSocketClient.prototype.sendSTATE = function (action, state, to) {	
	var msg = node.msg.createSTATE(action, state, to);
	this.send(msg);
};

/**
 * ### GameSocketClient.sendTXT
 *
 * Creates a TXT message and pushes it into the socket
 * 
 * @param {string} text Text to send
 * @param {string} to Optional. The recipient of the message
 */
GameSocketClient.prototype.sendTXT = function(text, to) {	
	var msg = node.msg.createTXT(text,to);
	this.send(msg);
};

/**
 * ### GameSocketClient.sendDATA
 * 
 * Creates a DATA message and pushes it into the socket
 * 
 * @param {string} action Optional. A nodeGame action (e.g. 'get' or 'set'). Defaults 'say'
 * @param {object} data An object to exchange
 * @param {string} to Optional. The recipient of the message. Defaults 'SERVER'
 * @param {string} text Optional. A descriptive text associated to the message.
 * 
 * 	@see GameMsg.actions
 * 
 * @TODO: invert parameter order: first data then action
 */
GameSocketClient.prototype.sendDATA = function (action, data, to, text) {
	action = action || GameMsg.say;
	to = to || 'SERVER';
	text = text || 'DATA';
	var msg = node.msg.createDATA(action, data, to, text);
	this.send(msg);
};

/**
 * ### GameSocketClient.send
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
GameSocketClient.prototype.send = function (msg) {

	// if (msg.reliable) {
		this.io.send(msg.stringify());
	// }
	// else {
	// this.io.volatile.send(msg.stringify());
	// }
	node.log('S: ' + msg);
	node.emit('LOG', 'S: ' + msg.toSMS());
};

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
  , 'undefined' != typeof io ? io : module.parent.exports.io
);