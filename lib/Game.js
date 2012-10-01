/**
 * # Game
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 *
 * Wrapper class for a `GameLoop` object and functions to control the game flow
 * 
 * Defines a number of event listeners, diveded in
 * 	
 * - incoming,
 * - outgoing,
 * - internal 
 *  
 *  ---
 *  
 */
	
(function (exports, node) {
	
// ## Global scope
	
var GameState = node.GameState,
	GameMsg = node.GameMsg,
	GameDB = node.GameDB,
	PlayerList = node.PlayerList,
	GameLoop = node.GameLoop,
	JSUS = node.JSUS;


exports.Game = Game;

var name,
	description,
	gameLoop,
	pl;
	

/**
 * ## Game constructor
 * 
 * Creates a new instance of Game
 * 
 * @param {object} settings Optional. A configuration object
 */
function Game (settings) {
	settings = settings || {};

// ## Private properties

/**
 * ### Game.name
 * 
 * The name of the game
 * 
 * @api private
 */
	name = settings.name || 'A nodeGame game';
	Object.defineProperty(this, 'name', {
		value: name,
		enumerable: true,
	});

/**
 * ### Game.description
 * 
 * A text describing the game
 * 
 * @api private
 */
	description = settings.description || 'No Description';
	Object.defineProperty(this, 'description', {
		value: description,
		enumerable: true,
	});

/**
 * ### Game.gameLoop
 * 
 * An object containing the game logic 
 * 
 * @see GameLoop
 * @api private
 */
	gameLoop = new GameLoop(settings.loops);
	Object.defineProperty(this, 'gameLoop', {
		value: gameLoop,
		enumerable: true,
	});

/**
 * ### Game.pl
 * 
 * The list of players connected to the game
 * 
 * The list may be empty, depending on the server settings
 * 
 * @api private
 */
	pl = new PlayerList();
	Object.defineProperty(this, 'pl', {
		value: pl,
		enumerable: true,
		configurable: true,
		writable: true,
	});

/**
 * ### Game.ready
 * 
 * If TRUE, the nodeGame engine is fully loaded
 * 
 * During stepping between functions in the game-loop
 * the flag is temporarily turned to FALSE, and all events 
 * are queued and fired only after nodeGame is ready to 
 * handle them again.
 * 
 * @api private
 */
	Object.defineProperty(this, 'ready', {
		set: function(){},
		get: function(){
			if (this.state.is < GameState.iss.LOADED) return false;
			
			// Check if there is a gameWindow obj and whether it is loading
			if (node.window) {	
				return (node.window.state >= GameState.iss.LOADED) ? true : false;
			}
			return true;
		},
		enumerable: true,
	});



// ## Public properties

/**
 * ### Game.observer
 * 
 * If TRUE, silently observes the game. Defaults FALSE
 * 
 * An nodeGame observer will not send any automatic notification
 * to the server, but it will just *observe* the game played by
 * other clients.
 * 
 */
	this.observer = ('undefined' !== typeof settings.observer) ? settings.observer 
		   													: false;

/**
 * ### Game.auto_step
 * 
 * If TRUE, automatically advances to the next state
 * 
 * After a successful DONE event is fired, the client will automatically 
 * goes to the next function in the game-loop without waiting for a STATE
 * message from the server. 
 * 
 * Depending on the configuration settings, it can still perform additional
 * checkings (e.g.wheter the mininum number of players is connected) 
 * before stepping to the next state.
 * 
 */
	this.auto_step = ('undefined' !== typeof settings.auto_step) ? settings.auto_step 
															 : true;

/**
 * ### Game.auto_wait
 * 
 * If TRUE, fires a WAITING... event immediately after a successful DONE event
 * 
 * Under default settings, the WAITING... event temporarily prevents the user
 * to access the screen and displays a message to the player
 */
	this.auto_wait = ('undefined' !== typeof settings.auto_wait) ? settings.auto_wait 
																 : false; 
	
	this.minPlayers = settings.minPlayers || 1;
	this.maxPlayers = settings.maxPlayers || 1000;
	
	// TODO: Check this
	this.init = settings.init || this.init;


/**
 * ### Game.memory
 * 
 * A storage database for the game
 * 
 * In the server logic the content of SET messages are
 * automatically inserted in this object
 * 
 * 	@see node.set
 */
	this.memory = new GameDB();
	
	this.player = null;	
	this.state = new GameState();
	
	
	var that = this,
		say = GameMsg.actions.SAY + '.',
		set = GameMsg.actions.SET + '.',
		get = GameMsg.actions.GET + '.',
		IN  = GameMsg.IN,
		OUT = GameMsg.OUT;

// ## Game incoming listeners
// Incoming listeners are fired in response to incoming messages
	var incomingListeners = function() {
	
/**
 * ### in.get.DATA
 * 
 * Experimental feature. Undocumented (for now)
 */ 
	node.on( IN + get + 'DATA', function (msg) {
		if (msg.text === 'LOOP'){
			node.gsc.sendDATA(GameMsg.actions.SAY, this.gameLoop, msg.from, 'GAME');
		}
		// <!-- We could double emit
		// node.emit(msg.text, msg.data); -->
	});

/**
 * ### in.set.STATE
 * 
 * Adds an entry to the memory object 
 * 
 */
	node.on( IN + set + 'STATE', function (msg) {
		that.memory.add(msg.text, msg.data, msg.from);
	});

/**
 * ### in.set.DATA
 * 
 * Adds an entry to the memory object 
 * 
 */
	node.on( IN + set + 'DATA', function (msg) {
		that.memory.add(msg.text, msg.data, msg.from);
	});

/**
 * ### in.say.STATE
 * 
 * Updates the game state or updates a player's state in
 * the player-list object
 *
 * If the message is from the server, it updates the game state,
 * else the state in the player-list object from the player who
 * sent the message is updated 
 * 
 *  @emit UPDATED_PLIST
 *  @see Game.pl 
 */
	node.on( IN + say + 'STATE', function (msg) {
//		console.log('updateState: ' + msg.from + ' -- ' + new GameState(msg.data), 'DEBUG');
//		console.log(that.pl.length)
		
		//console.log(node.gsc.serverid + 'AAAAAA');
		if (node.gsc.serverid && msg.from === node.gsc.serverid) {
//			console.log(node.gsc.serverid + ' ---><--- ' + msg.from);
//			console.log('NOT EXISTS');
		}
		
		if (that.pl.exist(msg.from)) {
			//console.log('EXIST')
			
			that.pl.updatePlayerState(msg.from, msg.data);
			node.emit('UPDATED_PLIST');
			that.pl.checkState();
		}
		// <!-- Assume this is the server for now
		// TODO: assign a string-id to the server -->
		else {
			//console.log('NOT EXISTS')
			that.updateState(msg.data);
		}
	});

/**
 * ### in.say.PLIST
 * 
 * Creates a new player-list object from the data contained in the message
 * 
 * @emit UPDATED_PLIST
 * @see Game.pl 
 */
	node.on( IN + say + 'PLIST', function (msg) {
		if (!msg.data) return;
		that.pl = new PlayerList({}, msg.data);
		node.emit('UPDATED_PLIST');
		that.pl.checkState();
	});
	
/**
 * ### in.say.REDIRECT
 * 
 * Redirects to a new page
 * 
 * @emit REDIRECTING...
 * @see node.redirect
 */
	node.on( IN + say + 'REDIRECT', function (msg) {
		if (!msg.data) return;
		if ('undefined' === typeof window || !window.location) {
			node.log('window.location not found. Cannot redirect', 'err');
			return false;
		}
		node.emit('REDIRECTING...', msg.data);
		window.location = msg.data; 
	});	
	
}(); // <!-- ends incoming listener -->

// ## Game outgoing listeners
// Incoming listeners are fired in response to outgoing messages
var outgoingListeners = function() {
	
/** 
 * ### out.say.HI
 * 
 * Updates the game-state of the game upon connection to a server
 * 
 */
	node.on( OUT + say + 'HI', function() {
		// Enter the first state
		if (that.auto_step) {
			that.updateState(that.next());
		}
		else {
			// The game is ready to step when necessary;
			that.state.is = GameState.iss.LOADED;
			node.gsc.sendSTATE(GameMsg.actions.SAY, that.state);
		}
	});

/**
 * ### out.say.STATE
 * 
 * Sends out a STATE message to the specified recipient
 * 
 * TODO: check with the server 
 * The message is for informative purpose
 * 
 */
	node.on( OUT + say + 'STATE', function (state, to) {
		node.gsc.sendSTATE(GameMsg.actions.SAY, state, to);
	});	

/**
 * ### out.say.TXT
 * 
 * Sends out a TXT message to the specified recipient
 */
	node.on( OUT + say + 'TXT', function (text, to) {
		node.gsc.sendTXT(text,to);
	});

/**
 * ### out.say.DATA
 * 
 * Sends out a DATA message to the specified recipient
 */
	node.on( OUT + say + 'DATA', function (data, to, key) {
		node.gsc.sendDATA(GameMsg.actions.SAY, data, to, key);
	});

/**
 * ### out.set.STATE
 * 
 * Sends out a STATE message to the specified recipient
 * 
 * TODO: check with the server 
 * The receiver will update its representation of the state
 * of the sender
 */
	node.on( OUT + set + 'STATE', function (state, to) {
		node.gsc.sendSTATE(GameMsg.actions.SET, state, to);
	});

/**
 * ### out.set.DATA
 * 
 * Sends out a DATA message to the specified recipient
 * 
 * The sent data will be stored in the memory of the recipient
 * 
 * 	@see Game.memory
 */
	node.on( OUT + set + 'DATA', function (data, to, key) {
		node.gsc.sendDATA(GameMsg.actions.SET, data, to, key);
	});

/**
 * ### out.get.DATA
 * 
 * Issues a DATA request
 * 
 * Experimental. Undocumented (for now)
 */
	node.on( OUT + get + 'DATA', function (data, to, key) {
		node.gsc.sendDATA(GameMsg.actions.GET, data, to, data);
	});
	
}(); // <!-- ends outgoing listener -->
	
// ## Game internal listeners
// Internal listeners are not directly associated to messages,
// but they are usually responding to internal nodeGame events, 
// such as progressing in the loading chain, or finishing a game state 
var internalListeners = function() {
	
/**
 * ### STATEDONE
 * 
 * Fired when all the 
 */ 
	node.on('STATEDONE', function() {
		// <!-- If we go auto -->
		if (that.auto_step && !that.observer) {
			node.log('We play AUTO', 'DEBUG');
			var morePlayers = ('undefined' !== that.minPlayers) ? that.minPlayers - that.pl.length : 0 ;
			node.log('Additional player required: ' + morePlayers > 0 ? MorePlayers : 0, 'DEBUG');
			
			if (morePlayers > 0) {
				node.emit('OUT.say.TXT', morePlayers + ' player/s still needed to play the game');
				node.log(morePlayers + ' player/s still needed to play the game');
			}
			// TODO: differentiate between before the game starts and during the game
			else {
				node.emit('OUT.say.TXT', this.minPlayers + ' players ready. Game can proceed');
				node.log(pl.length + ' players ready. Game can proceed');
				that.updateState(that.next());
			}
		}
		else {
			node.log('Waiting for monitor to step', 'DEBUG');
		}
	});

/**
 * ### DONE
 * 
 * Updates and publishes that the client has successfully terminated a state 
 * 
 * If a DONE handler is defined in the game-loop, it will executes it before
 * continuing with further operations. In case it returns FALSE, the update
 * process is stopped. 
 * 
 * @emit BEFORE_DONE
 * @emit WAITING...
 */
	node.on('DONE', function(p1, p2, p3) {
		
		// Execute done handler before updatating state
		var ok = true;
		var done = that.gameLoop.getAllParams(that.state).done;
		
		if (done) ok = done.call(that, p1, p2, p3);
		if (!ok) return;
		that.state.is = GameState.iss.DONE;
		
		// Call all the functions that want to do 
		// something before changing state
		node.emit('BEFORE_DONE');
		
		if (that.auto_wait) {
			if (node.window) {	
				node.emit('WAITING...');
			}
		}
		that.publishState();	
	});

/**
 * ### PAUSE
 * 
 * Sets the game to PAUSE and publishes the state
 * 
 */
	node.on('PAUSE', function(msg) {
		that.state.paused = true;
		that.publishState();
	});

/**
 * ### WINDOW_LOADED
 * 
 * Checks if the game is ready, and if so fires the LOADED event
 * 
 * @emit BEFORE_LOADING
 * @emit LOADED
 */
	node.on('WINDOW_LOADED', function() {
		if (that.ready) node.emit('LOADED');
	});

/**
 * ### GAME_LOADED
 * 
 * Checks if the window was loaded, and if so fires the LOADED event
 * 
 * @emit BEFORE_LOADING
 * @emit LOADED
 */
	node.on('GAME_LOADED', function() {
		if (that.ready) node.emit('LOADED');
	});

/**
 * ### LOADED
 * 
 * 
 */
	node.on('LOADED', function() {
		node.emit('BEFORE_LOADING');
		that.state.is =  GameState.iss.PLAYING;
		//TODO: the number of messages to emit to inform other players
		// about its own state should be controlled. Observer is 0 
		//that.publishState();
		node.gsc.clearBuffer();
		
	});
	
}(); // <!-- ends internal listener -->
} // <!-- ends constructor -->

// ## Game methods

/**
 * ### Game.pause
 * 
 * Experimental. Sets the game to pause
 * 
 * @TODO: check with Game.ready
 */
Game.prototype.pause = function () {
	this.state.paused = true;
};

/**
 * ### Game.resume
 * 
 * Experimental. Resumes the game from a pause
 * 
 * @TODO: check with Game.ready
 */
Game.prototype.resume = function () {
	this.state.paused = false;
};

/**
 * ### Game.next
 * 
 * Fetches a state from the game-loop N steps ahead
 * 
 * Optionally, a parameter can control the number of steps to take
 * in the game-loop before returning the state
 * 
 * @param {number} N Optional. The number of steps to take in the game-loop. Defaults 1
 * @return {boolean|GameState} The next state, or FALSE if it does not exist
 * 
 * 	@see GameState
 * 	@see Game.gameLoop
 */
Game.prototype.next = function (N) {
	if (!N) return this.gameLoop.next(this.state);
	return this.gameLoop.jumpTo(this.state, Math.abs(N));
};

/**
 * ### Game.previous
 * 
 * Fetches a state from the game-loop N steps back
 * 
 * Optionally, a parameter can control the number of steps to take
 * backward in the game-loop before returning the state
 * 
 * @param {number} times Optional. The number of steps to take in the game-loop. Defaults 1
 * @return {boolean|GameState} The previous state, or FALSE if it does not exist
 * 
 * 	@see GameState
 * 	@see Game.gameLoop
 */
Game.prototype.previous = function (N) {
	if (!N) return this.gameLoop.previous(this.state);
	return this.gameLoop.jumpTo(this.state, -Math.abs(N));
};

/**
 * ### Game.jumpTo
 * 
 * Moves the game forward or backward in the game-loop
 * 
 * Optionally, a parameter can control the number of steps to take
 * in the game-loop before executing the next function. A negative 
 * value jumps backward in the game-loop, and a positive one jumps
 * forward in the game-loop
 * 
 * @param {number} jump  The number of steps to take in the game-loop
 * @return {boolean} TRUE, if the game succesfully jumped to the desired state
 * 
 * 	@see GameState
 * 	@see Game.gameLoop
 */
Game.prototype.jumpTo = function (jump) {
	if (!jump) return false;
	var gs = this.gameLoop.jumpTo(this.state, jump);
	if (!gs) return false;
	return this.updateState(gs);
};

/**
 * ### Game.publishState
 * 
 * Notifies internal listeners, the server and other connected clients 
 * of the current game-state
 * 
 * If the *observer* flag is set, external notification is inhibited, 
 * but the STATECHANGE event is emitted anyway 
 * 
 * @emit STATECHANGE
 * 
 * @see GameState
 * @see	Game.observer
 */
Game.prototype.publishState = function() {
	// <!-- Important: SAY -->
	if (!this.observer) {
		var stateEvent = GameMsg.OUT + GameMsg.actions.SAY + '.STATE'; 
		node.emit(stateEvent, this.state, 'ALL');
	}
	
	node.emit('STATECHANGE');
	
	node.log('New State = ' + new GameState(this.state), 'DEBUG');
};

/**
 * ### Game.updateState
 * 
 * Updates the game to the specified game-state
 * 
 * @param {GameState} state The state to load and run
 * 
 * @emit BEFORE_LOADING
 * @emit LOADED
 * @emit TXT
 */
Game.prototype.updateState = function (state) {
	
	node.log('New state is going to be ' + new GameState(state), 'DEBUG');
	
	if (this.step(state) !== false) {
		this.paused = false;
		this.state.is =  GameState.iss.LOADED;
		if (this.ready) {
			node.emit('LOADED');
		}
	}		
	else {
		node.log('Error in stepping', 'ERR');
		// TODO: implement sendERR
		node.emit('TXT','State was not updated');
	}
};

/**
 * ### Game.step
 * 
 * Retrieves from the game-loop and executes the function for the 
 * specified game-state
 * 
 * @param {GameState} gameState Optional. The GameState to run
 * @return {Boolean} FALSE, if the execution encountered an error
 * 
 * 	@see Game.gameLoop
 * 	@see GameState
 */
Game.prototype.step = function (gameState) {
	
	gameState = gameState || this.next();
	if (gameState) {
		
		var func = this.gameLoop.getFunction(gameState);
		
		// Experimental: node.window should load the func as well
//			if (node.window) {
//				var frame = this.gameLoop.getAllParams(gameState).frame;
//				node.window.loadFrame(frame);
//			}
		
		
		
		if (func) {

			// For NDDB EventEmitter
			//console.log('HOW MANY LISTENERS???');
			//console.log(node._ee._listeners.count());
			
			// Local Listeners from previous state are erased 
			// before proceeding to next one
			node._ee.clearState(this.state);
			
			// For NDDB EventEmitter
			//console.log(node._ee._listeners.count());
			
			gameState.is = GameState.iss.LOADING;
			this.state = gameState;
		
			// This could speed up the loading in other client,
			// but now causes problems of multiple update
			this.publishState();
					
			return func.call(node.game);
		}
	}
	return false;
};

// ## Closure
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);