/**
 * # Game
 *
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 *
 * Wrapper class for a `GamePlot` object and functions to control the game flow
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
    GamePlot = node.GamePlot,
    PlayerList = node.PlayerList,
    Player = node.Player,
    Stager = node.Stager,
    J = node.JSUS;

var action = node.action;

exports.Game = Game;

/**
 * ## Game constructor
 *
 * Creates a new instance of Game
 *
 * @param {object} settings Optional. A configuration object
 */
function Game(settings) {
    this.setStateLevel(node.stateLevels.UNINITIALIZED);
    this.setStageLevel(node.stageLevels.UNINITIALIZED);

    settings = settings || {};

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
     * ### Game.settings
     *
     * The game's settings
     *
     * Contains following properties:
     *
     *  - observer: If TRUE, silently observes the game. Default: FALSE
     *
     *  - auto_wait: If TRUE, fires a WAITING... event immediately after
     *     a successful DONE event. Default: FALSE
     *
     *  - minPlayers: Default: 1
     *
     *  - maxPlayers: Default: 1000
     *
     * @api private
     */
    this.settings = {
        observer:   !!settings.observer,
        auto_wait:  !!settings.auto_wait,
        minPlayers: settings.minPlayers || 1,
        maxPlayers: settings.maxPlayers || 1000
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


    // ## Public properties

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
     * ### Game.plot
     *
     * The Game Plot
     *
     * @see GamePlot
     * @api private
     */
    this.plot = new GamePlot(new Stager(settings.stages));


    // TODO: check how to init
    this.setCurrentGameStage(new GameStage());


    this.paused = false;

    this.setStateLevel(node.stateLevels.STARTING);
} // <!-- ends constructor -->

// ## Game methods

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
 * @see node.play
 * @see Game.publishStage
 */
Game.prototype.start = function() {
    var onInit;
    var rc;

    if (this.getStateLevel() >= node.stateLevels.INITIALIZING) {
        node.warn('game.start called on a running game');
        return false;
    }

    // Check for the existence of stager contents:
    if (!this.plot.isReady()) {
        throw new node.NodeGameMisconfiguredGameError(
                'game.start called with unready plot');
    }

    // INIT the game
    if (this.plot && this.plot.stager) {
        onInit = this.plot.stager.getOnInit();
        if (onInit) {
            this.setStateLevel(node.stateLevels.INITIALIZING);
            onInit.call(node.game);
        }
    }
    this.setStateLevel(node.stateLevels.INITIALIZED);

    this.setCurrentGameStage(new GameStage());
    rc = this.step();

    node.log('game started');

    return rc;
};

/**
 * ### Game.gameover
 *
 * Ends the game
 *
 * Calls the gameover function, sets levels.
 */
Game.prototype.gameover = function() {
    var onGameover;

    if (this.getStateLevel() >= node.stateLevels.FINISHING) {
        node.warn('game.gameover called on a finishing game');
        return;
    }

    node.emit('GAMEOVER');

    // Call gameover callback, if it exists:
    if (this.plot && this.plot.stager) {
        onGameover = this.plot.stager.getOnGameover();
        if (onGameover) {
            this.setStateLevel(node.stateLevels.FINISHING);

            onGameover.call(node.game);
        }
    }

    this.setStateLevel(node.stateLevels.GAMEOVER);
    this.setStageLevel(node.stageLevels.DONE);
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
    var stepRule;
    stepRule = this.plot.getStepRule(this.getCurrentGameStage());

    if ('function' !== typeof stepRule) {
        console.log();
        console.log('*** plot: ', this.plot);
        console.log('*** gameStage: ', this.getCurrentGameStage());
        console.log('*** stepRule: ', stepRule);
        throw new node.NodeGameMisconfiguredGameError("step rule is not a function");
    }

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
 * @see Game.execStep
 *
 * TODO: harmonize return values
 */
Game.prototype.step = function() {
    var nextStep, curStep;
    var nextStepObj, nextStageObj;
    var ev;

    curStep = this.getCurrentGameStage();
    nextStep = this.plot.next(curStep);
    node.silly('Next stage ---> ' + nextStep);

    // Listeners from previous step are cleared in any case
    node.events.ee.step.clear();

    if ('string' === typeof nextStep) {
        if (nextStep === GamePlot.GAMEOVER) {
            this.gameover();
            return null;
        }

        // else do nothing
        return null;
    }
    else {
        // TODO maybe update also in case of string
        this.setCurrentGameStage(nextStep);

        // If we enter a new stage (including repeating the same stage)
        // we need to update a few things:
        if (this.plot.stepsToNextStage(curStep) === 1) {
            nextStageObj = this.plot.getStage(nextStep);
            if (!nextStageObj) return false;

            // clear the previous stage listeners
            node.events.ee.stage.clear();

            // Execute the init function of the stage, if any:
            if (nextStageObj.hasOwnProperty('init')) {
                this.setStateLevel(node.stateLevels.STAGE_INIT);
                this.setStageLevel(node.stageLevels.INITIALIZING);
                nextStageObj.init.call(node.game);
            }

            // Load the listeners for the stage, if any:
            for (ev in nextStageObj.on) {
                if (nextStageObj.on.hasOwnProperty(ev)) {
                    node.events.ee.stage.on(ev, nextStageObjs.on[ev]);
                }
            }
        }

        nextStepObj = this.plot.getStep(nextStep);
        if (!nextStepObj) return false;

        // Execute the init function of the step, if any:
        if (nextStepObj.hasOwnProperty('init')) {
            this.setStateLevel(node.stateLevels.STEP_INIT);
            this.setStageLevel(node.stageLevels.INITIALIZING);
            nextStepObj.init.call(node.game);
        }

        this.setStateLevel(node.stateLevels.PLAYING_STEP);
        this.setStageLevel(node.stageLevels.INITIALIZED);

        // Load the listeners for the step, if any:
        for (ev in nextStepObj.on) {
            if (nextStepObj.on.hasOwnProperty(ev)) {
                node.events.ee.step.on(ev, nextStepObjs.on[ev]);
            }
        }

        // TODO what else to load?

        return this.execStep(this.getCurrentStep());
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

    if (!stage || 'object' !== typeof stage) {
        console.log();
        console.log('*** stage: ', plot);
        throw new node.NodeGameRuntimeError('game.execStep requires a valid object');
    }

    cb = stage.cb;

    this.setStageLevel(node.stageLevels.LOADING);

    try {
        res = cb.call(node.game);
    }
    catch (e) {
        if (node.debug) throw e;
        node.err('An error occurred while executing a custom callback');
        throw new node.NodeGameRuntimeError(e);
    }

    this.setStageLevel(node.stageLevels.LOADED);
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
    return node.player.stateLevel;
};

Game.prototype.getStageLevel = function() {
    return node.player.stageLevel;
};

Game.prototype.getCurrentStep = function() {
    return this.plot.getStep(this.getCurrentGameStage());
};

Game.prototype.getCurrentGameStage = function() {
    return node.player.stage;
};

// ERROR, WORKING, etc
Game.prototype.setStateLevel = function(stateLevel) {
    if ('number' !== typeof stateLevel) {
        throw new node.NodeGameMisconfiguredGameError(
                'setStateLevel called with invalid parameter: ' + stateLevel);
    }

    node.player.stateLevel = stateLevel;
    // TODO do we need to publish this kinds of update?
    //this.publishUpdate();
};

// PLAYING, DONE, etc.
// Publishes update only if value actually changed.
Game.prototype.setStageLevel = function(stageLevel) {
    if ('number' !== typeof stageLevel) {
        throw new node.NodeGameMisconfiguredGameError(
                'setStageLevel called with invalid parameter: ' + stageLevel);
    }
    this.publishStageLevelUpdate(stageLevel);
    node.player.stageLevel = stageLevel;
};

Game.prototype.setCurrentGameStage = function(gameStage) {
    gameStage = new GameStage(gameStage);
    this.publishGameStageUpdate(gameStage);
    node.player.stage = gameStage;
};

Game.prototype.publishStageLevelUpdate = function(stageLevel) {
    // Publish update:
    if (!this.observer && node.player.stageLevel !== stageLevel) {
        node.socket.send(node.msg.create({
            target: node.target.STAGE_LEVEL,
            data: stageLevel,
            to: 'ALL'
        }));
    }
};

Game.prototype.publishGameStageUpdate = function(gameStage) {
    // Publish update:
    if (!this.observer && node.player.stage !== gameStage) {
        node.socket.send(node.msg.create({
            target: node.target.STAGE,
            data: gameStage,
            to: 'ALL'
        }));
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
 * During stepping between functions in the game-plot
 * the flag is temporarily turned to FALSE, and all events
 * are queued and fired only after nodeGame is ready to
 * handle them again.
 *
 * If the browser does not support the method object setters,
 * this property is disabled, and Game.isReady() should be used
 * instead.
 *
 * TODO check whether the conditions are adequate
 *
 */
Game.prototype.isReady = function() {
//    if (this.getStateLevel() < node.stateLevels.INITIALIZED) return false;
    if (this.getStageLevel() === node.stageLevels.LOADING) return false;

    // Check if there is a gameWindow obj and whether it is loading
    return node.window ? node.window.state >= node.is.LOADED : true;
};

// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
