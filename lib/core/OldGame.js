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
	Player = node.Player,
	GameLoop = node.GameLoop,
	J = node.JSUS;

var action = node.action;

exports.Game = Game;

var name,
	description,
	gameLoop,
	pl,
	ml;
	

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
	
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'name', {
			value: name,
			enumerable: true
		});
	}
	else {
		this.name = name;
	}

/**
 * ### Game.description
 * 
 * A text describing the game
 * 
 * @api private
 */
	description = settings.description || 'No Description';
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'description', {
			value: description,
			enumerable: true
		});
	}
	else {
		this.description = description;
	}

/**
 * ### Game.gameLoop
 * 
 * An object containing the game logic 
 * 
 * @see GameLoop
 * @api private
 */
	// <!-- support for deprecated options loops -->
	gameLoop = new GameLoop(settings.loop || settings.loops);
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'gameLoop', {
			value: gameLoop,
			enumerable: true
		});
	}
	else {
		this.gameLoop = gameLoop;
	}
	
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
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'pl', {
			value: pl,
			enumerable: true,
			configurable: true,
			writable: true
		});
	}
	else {
		this.pl = pl;
	}

/**
 * ### Game.pl
 * 
 * The list of monitor clients connected to the game
 * 
 * The list may be empty, depending on the server settings
 * 
 * @api private
 */
	ml = new PlayerList();
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'ml', {
			value: ml,
			enumerable: true,
			configurable: true,
			writable: true
		});
	}
	else {
		this.ml = ml;
	}
	
/**
 * ### Game.ready
 * 
 * If TRUE, the nodeGame engine is fully loaded
 * 
 * Shortcut to game.isReady
 * 
 * If the browser does not support the method object setters,
 * this property is disabled, and Game.isReady() should be used
 * instead.
 * 
 * @see Game.isReady();
 * 
 * @api private
 * @deprecated
 * 
 */
	if (node.support.getter) {
		Object.defineProperty(this, 'ready', {
			set: function(){},
			get: this.isReady,
			enumerable: true
		});
	}
	else {
		this.ready = null;
	}



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
 * If TRUE, automatically advances to the next state if all the players 
 * have completed the same state
 * 
 * After a successful STATEDONE event is fired, the client will automatically 
 * goes to the next function in the game-loop without waiting for a STATE
 * message from the server. 
 * 
 * Depending on the configuration settings, it can still perform additional
 * checkings (e.g.wheter the mininum number of players is connected) 
 * before stepping to the next state.
 * 
 * Defaults: true
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
 * to access the screen and displays a message to the player.
 * 
 * Defaults: FALSE
 * 
 */
	this.auto_wait = ('undefined' !== typeof settings.auto_wait) ? settings.auto_wait 
																 : false; 

/**
 * ### Game.solo_mode
 * 
 * If TRUE, automatically advances to the next state upon completion of a state
 * 
 * After a successful DONE event is fired, the client will automatically 
 * goes to the next function in the game-loop without waiting for a STATE
 * message from the server, or checking the STATE of the other players. 
 * 
 * Defaults: FALSE
 * 
 */
	this.solo_mode = ('undefined' !== typeof settings.solo_mode) ? settings.solo_mode 
															 : false;	
	// TODO: check this
	this.minPlayers = settings.minPlayers || 1;
	this.maxPlayers = settings.maxPlayers || 1000;
	
	if (settings.init) {
		this.init = settings.init;
	}

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

} // <!-- ends constructor -->

// ## Game methods

/** 
 * ### Game.init
 * 
 * Initialization function
 * 
 * This function is called as soon as the game is instantiated,
 * i.e. at state 0.0.0. 
 * 
 * Event listeners defined here stay valid throughout the whole
 * game, unlike event listeners defined inside a function of the
 * gameLoop, which are valid only within the specific function.
 * 
 */
Game.prototype.init = function () {};

/** 
 * ### Game.gameover
 * 
 * Cleaning up function
 * 
 * This function is called after the last stage of the gameLoop
 * is terminated
 * 
 */
Game.prototype.gamover = function () {};

/**
 * ### Game.start
 * 
 * Starts the game 
 * 
 * Calls the init function, sets the state as `node.is.LOADED`
 * and notifies the server. 
 * 
 * Important: it does not use `Game.publishState` because that is
 * just for change of state after the game has started
 * 
 * 
 * @see node.play
 * @see Game.publishState
 * 
 */
Game.prototype.start = function() {
	// INIT the game
	this.init();
	this.updateState(new GameState("1.1.1"));
	
	//this.state.is = node.is.LOADED;
	//node.socket.sendSTATE(node.action.SAY, node.game.state);
	
	node.log('game started');
};

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
		var stateEvent = node.OUT + action.SAY + '.STATE'; 
		node.emit(stateEvent, this.state, 'ALL');
	}
	
	node.emit('STATECHANGE');
	
	node.info('New State = ' + new GameState(this.state));
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
	
	node.info('Updating state to ' + new GameState(state));

	var res;
	
	res = this.execStage();
	
	if (this.step() == false) {
		this.paused = false;
		node.state = node.is.LOADED;
		if (this.isReady()) {
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
 * Executes the next stage / step 
 * 
 * @return {Boolean} FALSE, if the execution encountered an error
 * 
 * @see Game.stager
 * @see Game.currentStage
 * @see Game.execStage
 */
Game.prototype.step = function() {
	var cb, err, nextStage;
	
	nextStage = this.stager.next(this.currentStage);
	
	// Reached the last stage
	if (!nextStage) {
		node.emit('GAMEOVER');
		return this.gameover(); // can throw Errors
	}
	
	return this.execStage(stage);
	
};

/**
 * ### Game.execStage
 * 
 * Executes the specified stage
 * 
 */
Game.prototype.execStage = function(stage) {
	
	var cb, err;
	
	cb = this.stager.getFunction(stage); 
			
	// Local Listeners from previous state are erased 
	// before proceeding to next one
	node.events.clearState(this.currentStage);
			
	node.state = node.is.LOADING;
	
	// This could speed up the loading in other client,
	// but now causes problems of multiple update
	this.publishState();
			
	try {
		return cb.call(node.game);
	} 
	catch (e) {
		err = 'An error occurred while executing a custom callback'; //  
			
		node.err(err);
		
		if (node.debug) {
			throw new node.NodeGameRuntimeError();
		}
				
		return true;
	}
};


/**
 * ### Game.isReady
 * 
 * Returns TRUE if the nodeGame engine is fully loaded
 * 
 * As soon as the nodegame-client library is loaded 
 * `node.game.state` is equal to 0.0.0. In this situation the
 * game will be considered READY unless the nodegame-window 
 * says otherwise
 * 
 * During stepping between functions in the game-loop
 * the flag is temporarily turned to FALSE, and all events 
 * are queued and fired only after nodeGame is ready to 
 * handle them again.
 * 
 * If the browser does not support the method object setters,
 * this property is disabled, and Game.isReady() should be used
 * instead.
 * 
 * @see Game.ready;
 * 
 */
Game.prototype.isReady = function() {
	if (this.state.state !== 0 && this.state.is < node.is.LOADED) return false;
	
	// Check if there is a gameWindow obj and whether it is loading
	if (node.window) {	
		return (node.window.state >= node.is.LOADED) ? true : false;
	}
	return true;
};

// ## Closure
})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);
