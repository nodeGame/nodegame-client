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

(function(exports, node) {

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

Game.stateLevels = {
    UNINITIALIZED:  0,  // game created, the init function has not been called
    INITIALIZING:   1,  // executing init
    INITIALIZED:    5,  // init executed
    READY:          7,  // stages are set
    ONGOING:       50,
    GAMEOVER:     100,  // game complete
    RUNTIME_ERROR: -1
};

Game.stageLevels = {
    UNINITIALIZED:  0,
    INITIALIZING:   1,  // executing init
    INITIALIZED:    5,  // init executed
    LOADING:       30,
    LOADED:        40,
    PLAYING:       50,
    PAUSING:       55,
    PAUSED:        60,
    RESUMING:      65,
    RESUMED:       70,
    DONE:         100
};

/**
 * ## Game constructor
 *
 * Creates a new instance of Game
 *
 * @param {object} settings Optional. A configuration object
 */
function Game(settings) {
    settings = settings || {};

    this.setStateLevel(Game.stateLevels.UNINITIALIZED);
    this.setStageLevel(Game.stageLevels.UNINITIALIZED);

    // ## Private properties

    /**
     * ### Game.metadata
     *
     * The game's metadata
     *
     * Contains following properties:
     * name, description, version, session
     *
     * @api private
     */
    this.metadata = {
        name:        settings.name || 'A nodeGame game',
        description: settings.description || 'No Description',
        version:     settings.version || '0',
        session:     settings.session || '0'
    };

    /**
     * ### Game.pl
     *
     * The list of players connected to the game
     *
     * The list may be empty, depending on the server settings
     *
     * @api private
     */
    this.pl = new PlayerList();

    /**
     * ### Game.ml
     *
     * The list of monitor clients connected to the game
     *
     * The list may be empty, depending on the server settings
     *
     * @api private
     */
    this.ml = new PlayerList();

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
    this.ready = null;



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
     * @see node.set
     */
    this.memory = new GameDB();

    /**
     * ### Game.gameLoop
     *
     * The Game Loop
     *
     * @see GameLoop
     * @api private
     */
    this.gameLoop = new GameLoop(settings.stages);


    // TODO: check how to init
    this.setCurrentGameStage(new GameStage());

    // Update the init function if one is passed
    if (settings.init) {
        this.init = function() {
            this.setStateLevel(Game.stateLevels.INITIALIZING);
            settings.init.call(node.game);
            this.setStateLevel(Game.stateLevels.INITIALIZED);
        };
    }


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
Game.prototype.init = function() {
    this.setStateLevel(Game.stateLevels.INITIALIZING);
    this.setStateLevel(Game.stateLevels.INITIALIZED);
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
Game.prototype.gameover = function() {};

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
Game.prototype.pause = function() {
    this.paused = true;
};

/**
 * ### Game.resume
 *
 * Experimental. Resumes the game from a pause
 *
 * @TODO: check with Game.ready
 */
Game.prototype.resume = function() {
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
    var stepRule = this.gameLoop.getStepRule(this.getCurrentGameStage());

    if ('function' !== typeof stepRule) return false;

    if (stepRule(this.getCurrentGameStage(), this.getStageLevel(), this.pl, this)) {
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
    var nextStep, curStep;
    var nextStepObj, nextStageObj;
    var ev;

    curStep = this.getCurrentGameStage();
    nextStep = this.gameLoop.next(curStep);

    // Listeners from previous step are cleared in any case
    node.events.ee.step.clear();

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
        this.setCurrentGameStage(nextStep);

        // If we enter a new stage (including repeating the same stage)
        // we need to update a few things:
        if (gameLoop.stepsToNextStage(curStep) === 1) {
            nextStageObj = this.gameLoop.getStage(nextStep);
            if (!nextStageObj) return false;

            // clear the previous stage listeners
            node.events.ee.stage.clear();

            // Execute the init function of the stage, if any:
            if (nextStageObj.hasOwnProperty('init')) {
                this.setStageLevel(Game.stageLevels.INITIALIZING);
                nextStageObj.init.call(node.game);
            }

            // Load the listeners for the stage, if any:
            for (ev in nextStageObj.on) {
                if (nextStageObj.on.hasOwnProperty(ev)) {
                    node.events.ee.stage.on(ev, nextStageObjs.on[ev]);
                }
            }
        }

        nextStepObj = this.gameLoop.getStep(nextStep);
        if (!nextStepObj) return false;

        // Execute the init function of the step, if any:
        if (nextStepObj.hasOwnProperty('init')) {
            this.setStageLevel(Game.stageLevels.INITIALIZING);
            nextStepObj.init.call(node.game);
        }

        this.setStageLevel(Game.stageLevels.INITIALIZED);

        // Load the listeners for the step, if any:
        for (ev in nextStepObj.on) {
            if (nextStepObj.on.hasOwnProperty(ev)) {
                node.events.ee.step.on(ev, nextStepObjs.on[ev]);
            }
        }

        // TODO what else to load?

        return this.execStage(this.getCurrentStep());
    }
};

/**
 * ### Game.execStep
 *
 * Executes the specified stage object
 *
 * @TODO: emit an event "executing stage", so that other methods get notified
 *
 * @param stage {object} Full stage object to execute
 *
 */
Game.prototype.execStep = function(stage) {
    var cb, res;

    cb = stage.cb;

    this.setStageLevel(Game.stageLevels.LOADING);

    try {
        res = cb.call(node.game);
    }
    catch (e) {
        if (node.debug) throw e;
        node.err('An error occurred while executing a custom callback');
        throw new node.NodeGameRuntimeError(e);
    }

    this.setStageLevel(Game.stageLevels.LOADED);
    // This does not make sense. Basically it waits for the nodegame window to be loaded too
    if (this.isReady()) {
        node.emit('LOADED');
    }
    if (res === false) {
        // A non fatal error occurred
        node.err('A non fatal error occurred while executing the callback of stage ' + this.getCurrentGameStage());
    }

    return res;
};

Game.prototype.getStateLevel = function() {
    return this.stateLevel;
};

Game.prototype.getStageLevel = function() {
    return this.stageLevel;
};

Game.prototype.getCurrentStep = function() {
    return this.gameLoop.getStep(this.getCurrentGameStage());
};

Game.prototype.getCurrentGameStage = function() {
    return this.currentGameStage;
};

// ERROR, WORKING, etc
Game.prototype.setStateLevel = function(stateLevel) {
    if ('number' !== typeof stateLevel) {
        throw new node.NodeGameMisconfiguredGameError(
                'setStateLevel called with invalid parameter: ' + stateLevel);
    }

    this.stateLevel = stateLevel;
    //this.publishUpdate();
};

// PLAYING, DONE, etc.
// Publishes update only if value actually changed.
Game.prototype.setStageLevel = function(stageLevel) {
    if ('number' !== typeof stageLevel) {
        throw new node.NodeGameMisconfiguredGameError(
                'setStageLevel called with invalid parameter: ' + stageLevel);
    }

    // Publish update:
    if (!this.observer && this.stageLevel !== stageLevel) {
        node.socket.send(node.msg.create({
            target: node.target.STAGE_LEVEL,
            data: stageLevel,
            to: 'ALL'
        }));
    }

    this.stageLevel = stageLevel;
};

Game.prototype.setCurrentGameStage = function(gameStage) {
    this.currentGameStage = new GameStage(gameStage);
};

Game.prototype.publishUpdate = function() {
    // <!-- Important: SAY -->
    if (!this.observer) {
        var stateEvent = node.OUT + action.SAY + '.STATE';
        node.emit(stateEvent, this.getStateLevel(), 'ALL');
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
    console.log(this.getStateLevel());
    console.log(this.getStageLevel());
    return true;
    if (this.getStateLevel() < Game.stateLevels.READY) return false;
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
    return this._isReadyToStep(this.getCurrentStage(), this.gameLoop, this.pl);
};


Game.prototype._getStepperCallback = function(stage, stager) {
    // Take default mode
    // Is there a local function?

    // Always go to the next when done for now
    return function() { return true; };
};

Game.prototype.getStepperCallback = function() {
    return this._getStepperCallback(this.getCurrentStage(), this.gameLoop);
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
* @see GameStage
* @see Game.gameLoop
*/
/*
Game.prototype.next = function(N) {
    if (!N) return this.gameLoop.next(this.state);
    return this.gameLoop.jump(this.state, Math.abs(N));
};
*/

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
* @see GameStage
* @see Game.gameLoop
*/
/*
Game.prototype.previous = function(N) {
    if (!N) return this.gameLoop.previous(this.state);
    return this.gameLoop.jump(this.state, -Math.abs(N));
};
*/


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
* @see GameStage
* @see Game.gameLoop
*/
/*
Game.prototype.jumpTo = function(jump) {
    if (!jump) return false;
    var gs = this.gameLoop.jump(this.state, jump);
    if (!gs) return false;
    return this.updateStage(gs);
};
*/

// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
