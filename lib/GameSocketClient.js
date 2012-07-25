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
	session 	= null;
	Object.defineProperty(this, 'session', {
		value: session,
		enumerable: true,
	});
	
// ## Public properties
	
/**
 * ### GameSocketClient.io
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
 * ### GameSocketClient.
 * 
 * Check if the player is reconnecting
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
 * ### GameSocketClient.
 * 
 */
GameSocketClient.prototype.startSession = function (msg) {
	var player = {
			id:		msg.data,	
			sid: 	msg.data,
	};
	this.createPlayer(player);
	this.session = msg.session;
	return true;
};

/**
 * ### GameSocketClient.
 * 
 * 
 */
GameSocketClient.prototype.restoreSession = function (session, sid) {

	node.log('Restoring session ' + sid);
	node.emit('NODEGAME_RECOVERY', sid);
	
	sid = sid || session.player.sid;
	
	this.session = session.id;
	
	// Important! The new socket.io ID
	session.player.sid = sid;

	this.createPlayer(session.player);
	node.game.memory = session.memory;
	node.goto(session.state);
	
	if (session.history) {
		
		console.log('SESSION HISTORY!!')
		console.log(session.history);
		console.log('Recovering ' + session.history.length + ' events');
		
		node.events.history.import(session.history);
		var hash = new GameState(session.state).toHash('S.s.r'); 
		if (!node.events.history.state) {
			console.log('no hash state');
			return true; 
		}
		if (!node.events.history.state[hash]){
			console.log('no hash state hash');
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
			console.log('empty hash state hash');
			return true;
		}
		
		var remit = function () {
			console.log('Re-emitting ' + to_remit.length + ' events');
			
			
			// We have events that were fired at the state when 
			// disconnetion happened. Let's fire them again 
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
 * ### GameSocketClient.
 * 
 * 
 */
GameSocketClient.prototype.connect = function(conf) {
	conf = conf || {};
	if (!conf.url) {
		node.log('cannot connect to empty url.', 'ERR');
		return false;
	}
	
	this.url = conf.url;
	//this.name = conf.name; // TODO: where to init this?
	
	node.log('connecting to ' + conf.url);
	this.io = io.connect(conf.url, conf.io);
    this.attachFirstListeners(this.io);
    return this.io;
};

// ## I/O Functions


/**
 * ### GameSocketClient.
 * 
 * Parse the message received in the Socket
 *  
 */
GameSocketClient.prototype.secureParse = function (msg) {
	
	try {
		// node.log(msg);
		// debugger;
		var gameMsg = GameMsg.clone(JSON.parse(msg));
		node.log('R: ' + gameMsg);			
		node.emit('LOG', 'R: ' + gameMsg.toSMS());
		return gameMsg;
	}
	catch(e) {
		var error = "Malformed msg received: " + e;
		node.log(error, 'ERR');
		// TODO: Automatically log errors
		node.emit('LOG', 'E: ' + error);
		return false;
	}
	
};

/**
 * ### GameSocketClient.
 * 
 *  
 */
GameSocketClient.prototype.clearBuffer = function () {
	
	var nelem = this.buffer.length;
	for (var i=0; i < nelem; i++) {
		var msg = this.buffer.shift();
		node.emit(msg.toInEvent(), msg);
		node.log('Debuffered ' + msg);
	}

};

/**
 * ### GameSocketClient.
 *
 * Nothing is done until the SERVER send an HI msg. All the others msgs will
 * be ignored otherwise.
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
 * ### GameSocketClient.
 * 
 *  
 */
GameSocketClient.prototype.attachMsgListeners = function (socket, session) {   
	var that = this;
	
	node.log('Attaching FULL listeners');
	socket.removeAllListeners('message');
		
	//this.gmg = new GameMsgGenerator();

	socket.on('message', function(msg) {
		var msg = that.secureParse(msg);
		
		if (msg) { // Parsing successful
			// node.log('GM is: ' + node.game.gameState.is);
			// Wait to fire the msgs if the game state is loading
			if (node.game && node.game.ready) {
				// node.log('GM is now: ' + node.game.gameState.is);
				
// var event = msg.toInEvent();
//					
//					
// if (event !== 'in.say.DATA') {
// node.emit(event, msg);
// }
// else {
// node.emit('in.' + msg.action + '.' + msg.text, msg);
// }
				
				node.emit(msg.toInEvent(), msg);
			}
			else {
				// node.log(node.game.gameState.is + ' < ' +
				// GameState.iss.PLAYING);
				// node.log('Buffering: ' + msg);
				that.buffer.push(msg);
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
 *   
 */
GameSocketClient.prototype.sendHI = function (from, to) {
	from = from || node.player;
	to = to || 'SERVER';
	var msg = node.msg.createHI(from, to);
	
	// TODO: check if we need this!!!!
	// this.game.player = this.player;
	this.send(msg);
};

/**
 * ### GameSocketClient.sendSTATE
 * 
 * Creates a STATE message and pushes it into the socket
 * 
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
 *  
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
 * 	@see GameMsg
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
 */
GameSocketClient.prototype.send = function (msg) {
	
	// TODO: Check Do volatile msgs exist for clients?

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