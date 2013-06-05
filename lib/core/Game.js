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

var GameStage = node.GameStage,
	GameMsg = node.GameMsg,
	GameDB = node.GameDB,
	GameLoop = node.GameLoop,
	PlayerList = node.PlayerList,
	Player = node.Player,
	Stager = node.Stager,
	J = node.JSUS;

var action = node.action;

exports.Game = Game;

var name,
	description,
	gameLoop,
	pl,
	ml;
	
Game.levels = {
		UNINITIALIZED: 0, 	// game created, the init function has not been called
		INITIALIZING: 1, 	// executing init
		INITIALIZED: 5, 	// init executed
		READY:	7,		// stages are set
		ONGOING: 50,
		GAMEOVER: 100,		// game complete
		RUNTIME_ERROR: -1
	};

Game.stageLevels = {
    UNINITIALIZED: 0,
	LOADING: 1,
	LOADED: 2,
	PLAYING: 50,
	PAUSING:  55,
	PAUSED: 60,
	RESUMING: 65,
	RESUMED: 70,
	DONE: 100
};

/**
 * ## Game constructor
 * 
 * Creates a new instance of Game
 * 
 * @param {object} settings Optional. A configuration object
 */
function Game (settings) {
	settings = settings || {};

	this.updateGameState(Game.levels.UNINITIALIZED);
	this.updateStageLevel(Game.stageLevels.UNINITIALIZED);
	
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
 * If TRUE, silently observes the game. Defaults, FALSE
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
 * After a successful STAGEDONE event is fired, the client will automatically 
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
	

	
/**
 * ### Game.stager
 * 
 * Stage manager 
 * 
 * retrocompatible with gameLoop
 * 
 * @see Stager
 * @api private
 */
    this.gameLoop = this.stager = new GameLoop(settings.stages);
	

    // TODO: check how to init
    this.currentStep = new GameStage();
    this.currentStepObj = null;
    
    // Update the init function if one is passed
    if (settings.init) {
	this.init = function() {
		this.updateGameState(Game.levels.INITIALIZING);
	    settings.init.call(node.game);
	    this.updateGameState(Game.levels.INITIALIZED);
	};
    }
    
    
    this.player = null;	
    
    
    this.paused = false;
	
} // <!-- ends constructor -->

// ## Game methods

/** 
 * ### Game.init
 * 
 * Initialization function
 * 
 * This function is called as soon as the game is instantiated,
 * i.e. at stage 0.0.0. 
 * 
 * Event listeners defined here stay valid throughout the whole
 * game, unlike event listeners defined inside a function of the
 * gameLoop, which are valid only within the specific function.
 * 
 */
Game.prototype.init = function () {
	this.updateGameState(Game.levels.INITIALIZING);
	this.updateGameState(Game.levels.INITIALIZED);
};

/** 
 * ### Game.gameover
 * 
 * Cleaning up function
 * 
 * This function is called after the last stage of the gameLoop
 * is terminated
 * 
 */
Game.prototype.gameover = function () {};

/**
 * ### Game.start
 * 
 * Starts the game 
 * 
 * Calls the init function, and steps.
 * 
 * Important: it does not use `Game.publishUpdate` because that is
 * just for change of state after the game has started
 * 
 * 
 * @see node.play
 * @see Game.publishStage
 * 
 */
Game.prototype.start = function() {
	// INIT the game
	this.init();
	this.step();
	
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
	this.paused = true;
};

/**
 * ### Game.resume
 * 
 * Experimental. Resumes the game from a pause
 * 
 * @TODO: check with Game.ready
 */
Game.prototype.resume = function () {
	this.paused = false;
};


/**
 * ### Game.shouldStep
 * 
 * Execute the next stage / step, if allowed
 * 
 * @return {boolean|null} FALSE, if the execution encounters an error 
 *   NULL, if stepping is disallowed
 * 
 * @see Game.step
 */
Game.prototype.shouldStep = function() {
    // Check the stager
    var stepRule = this.stager.getStepRule(this.getGameStage());

    if ('function' !== typeof stepRule) return false;

    if (stepRule(this.getGameStage(), this.getStageLevel(), this.pl, this)) {
        return this.step();
    }
    else {
        return null;
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
 * 
 * TODO: harmonize return values
 */
Game.prototype.step = function() {
    var nextStep;
    nextStep = this.stager.next(this.currentStep);
    console.log('NEXT', nextStep);
    if ('string' === typeof nextStep) {
	
	if (nextStep === GameLoop.GAMEOVER) {
	    node.emit('GAMEOVER');
	    return this.gameover(); // can throw Errors
	}
	
	// else do nothing
	return null;
    }
    else {
	// TODO maybe update also in case of string
	this.currentStep = nextStep;
	this.currentStepObj = this.stager.getStep(nextStep);
	return this.execStage(this.currentStepObj);
    }
};

/**
 * ### Game.execStage
 * 
 * Executes the specified stage
 * 
 * @param stage {GameStage} GameStage object to execute
 * 
 */
Game.prototype.execStage = function(stage) {
    var cb, res;
	
    cb = stage.cb; 
			
    // Local Listeners from previous stage are erased 
    // before proceeding to next one
    node.events.clearStage(this.currentStep);
			
    this.updateStageLevel(Game.stageLevels.LOADING);
    
    
    try {
	res = cb.call(node.game);
	this.updateStageLevel(Game.stageLevels.LOADED);
	
	// This does not make sense. Basically it waits for the nodegame window to be loaded too
	if (this.isReady()) {
	    node.emit('LOADED');
	}
	if (res === false) {
			// A non fatal error occurred
	    // log it
	}
	
	return res;
	
    } 
    catch (e) {
	var err, ex;
	err = 'An error occurred while executing a custom callback'; //  
	
	node.err(err);
	
	if (node.debug) {
	    ex = node.NodeGameRuntimeError;
	    console.log(ex);
	    console.log(ex.trace);
	    throw ex;
	}
	
	return true;
    }
};

Game.prototype.getGameState = function () {
    return this.state;
};

Game.prototype.getStageLevel = function () {
    return this.stageState;
};

Game.prototype.getStep = function () {
    return this.currentStepObj;
};

Game.prototype.getGameStage = function () {
    return this.currentStep;
};

// ERROR, WORKING, etc
Game.prototype.updateGameState = function (state) {
    if ('number' !== typeof state) {
        throw new node.NodeGameMisconfiguredGameError(
                'updateGameState called with invalid parameter: ' + state);
    }

	this.state = state;
	//this.publishUpdate();
};

// PLAYING, DONE, etc.
Game.prototype.updateStageLevel= function (state) {
    if ('number' !== typeof state) {
        throw new node.NodeGameMisconfiguredGameError(
                'updateStageLevel called with invalid parameter: ' + state);
    }

	this.stageState = state;

    // Publish update:
    node.socket.send(node.msg.create({
        target: node.target.STAGE_LEVEL,
        data: state,
        to: 'ALL'
    }));
};

Game.prototype.publishUpdate = function() {
	// <!-- Important: SAY -->
	if (!this.observer) {
		var stateEvent = node.OUT + action.SAY + '.STATE'; 
		node.emit(stateEvent, this.state, 'ALL');
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
    console.log(this.getGameState());
    console.log(this.getStageLevel());
    return true;
	if (this.getGameState() < Game.levels.READY) return false;
	if (this.getStageLevel() === Game.stageLevels.LOADING) return false;

	// Check if there is a gameWindow obj and whether it is loading
	return node.window ? node.window.state >= node.is.LOADED : true;
};



Game.prototype._isReadyToStep = function(stage, stager, pl) {
    var cbStepper = this._getStepperCallback(stage, stager);
    var myStageLevel = this.getStageLevel();
    return cbStepper(myStageLevel, pl);
};

Game.prototype.isReadyToStep = function() {
    return this._isReadyToStep(this.currentStep, this.stager, this.pl);
};


Game.prototype._getStepperCallback = function(stage, stager) {
    // Take default mode
    // Is there a local function?

    // Always go to the next when done for now
    return function() { return true; };
};

Game.prototype.getStepperCallback = function() {
    return this._getStepperCallback(this.currentStep, this.stager);
};

// TODO : MAYBE TO REMOVE THEM

/**
* ### Game.next
* 
* Fetches a state from the game-loop N steps ahead
* 
* Optionally, a parameter can control the number of steps to take
* in the game-loop before returning the state
* 
* @param {number} N Optional. The number of steps to take in the game-loop. Defaults 1
* @return {boolean|GameStage} The next state, or FALSE if it does not exist
* 
* 	@see GameStage
* 	@see Game.gameLoop
*/
Game.prototype.next = function (N) {
	if (!N) return this.gameLoop.next(this.state);
	return this.gameLoop.jump(this.state, Math.abs(N));
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
* @return {boolean|GameStage} The previous state, or FALSE if it does not exist
* 
* 	@see GameStage
* 	@see Game.gameLoop
*/
Game.prototype.previous = function (N) {
	if (!N) return this.gameLoop.previous(this.state);
	return this.gameLoop.jump(this.state, -Math.abs(N));
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
* 	@see GameStage
* 	@see Game.gameLoop
*/
Game.prototype.jumpTo = function (jump) {
	if (!jump) return false;
	var gs = this.gameLoop.jump(this.state, jump);
	if (!gs) return false;
	return this.updateStage(gs);
};

// ## Closure
})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);
