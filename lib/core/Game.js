/**
 * # Game
 *
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 *
 * Wrapper class for a `GamePlot` object and functions to control the game flow
 *
 *  ---
 *
 */

(function(exports, parent) {

    // ## Global scope

    // Exposing Game constructor
    exports.Game = Game;

    var GameStage = parent.GameStage,
    GameDB = parent.GameDB,
    GamePlot = parent.GamePlot,
    PlayerList = parent.PlayerList,
    Stager = parent.Stager;
    
    var constants = parent.constants;

    /**
     * ## Game constructor
     *
     * Creates a new instance of Game
     *
     * @param {NodeGameClient} node. A valid NodeGameClient object
     * @param {object} settings Optional. A configuration object
     */
    function Game(node, settings) {

        this.node = node;

        this.setStateLevel(constants.stateLevels.UNINITIALIZED);
        this.setStageLevel(constants.stageLevels.UNINITIALIZED);

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
        this.pl = new PlayerList({log: this.node.log});

        /**
         * ### Game.ml
         *
         * The list of monitor clients connected to the game
         *
         * The list may be empty, depending on the server settings
         *
         * @api private
         */
        this.ml = new PlayerList({log: this.node.log});


        // ## Public properties

        /**
         * ### Game.memory
         *
         * A storage database for the game
         *
         * In the server logic the content of SET messages are
         * automatically inserted in this object
         *
         * @see NodeGameClient.set
         */
        this.memory = new GameDB({
            log: this.node.log,
            shared: { node: this.node }
        });

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

        this.setStateLevel(constants.stateLevels.STARTING);
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
     */
    Game.prototype.start = function() {
        var onInit, rc, node;
        node = this.node;

        if (node.player.placeholder) {
            throw new node.NodeGameMisconfiguredGameError(
                'game.start called without player');
        }

        if (this.getStateLevel() >= constants.stateLevels.INITIALIZING) {
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
                this.setStateLevel(constants.stateLevels.INITIALIZING);
                onInit.call(node.game);
            }
        }
        this.setStateLevel(constants.stateLevels.INITIALIZED);

        this.setCurrentGameStage(new GameStage());
        rc = this.step();

        node.log('game started');

        return rc;
    };

    
    /**
     * ### Game.restart
     *
     * Moves the game stage to 1.1.1
     *
     * @param {boolean} rest TRUE, to erase the game memory before update the game stage
     *
     * TODO: should we send a message to connected players as well,
     * or give an option to send it?
     * 
     * @experimental
     */
    Game.prototype.restart = function (reset) {
        if (reset) this.memory.clear(true);
        this.execStep(this.plot.getStep("1.1.1"));
    };




    /**
     * ### Game.gameover
     *
     * Ends the game
     *
     * Calls the gameover function, sets levels.
     */
    Game.prototype.gameover = function() {
        var onGameover, node;
        node = this.node;

        if (this.getStateLevel() >= constants.stateLevels.FINISHING) {
            node.warn('game.gameover called on a finishing game');
            return;
        }

        node.emit('GAMEOVER');

        // Call gameover callback, if it exists:
        if (this.plot && this.plot.stager) {
            onGameover = this.plot.stager.getOnGameover();
            if (onGameover) {
                this.setStateLevel(constants.stateLevels.FINISHING);

                onGameover.call(node.game);
            }
        }

        this.setStateLevel(constants.stateLevels.GAMEOVER);
        this.setStageLevel(constants.stageLevels.DONE);
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
            throw new this.node.NodeGameMisconfiguredGameError("step rule is not a function");
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
        var ev, node;
        node = this.node;

        curStep = this.getCurrentGameStage();
        nextStep = this.plot.next(curStep);
        node.silly('Next stage ---> ' + nextStep);

        // Listeners from previous step are cleared in any case
        node.events.ee.step.clear();

        // Emit buffered messages:
        node.socket.shouldClearBuffer();

        if ('string' === typeof nextStep) {
            if (nextStep === GamePlot.GAMEOVER) {
                this.gameover();
                // Emit buffered messages:
                node.socket.shouldClearBuffer();
                node.emit('GAME_OVER');
                return null;
            }

            // else do nothing
            return null;
        }
        else {
            // TODO maybe update also in case of string

            node.emit('STEPPING');

            // stageLevel needs to be changed, otherwise it stays DONE
            // for a short time in the new game stage:
            this.setStageLevel(constants.stageLevels.UNINITIALIZED);
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
                    this.setStateLevel(constants.stateLevels.STAGE_INIT);
                    this.setStageLevel(constants.stageLevels.INITIALIZING);
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
                this.setStateLevel(constants.stateLevels.STEP_INIT);
                this.setStageLevel(constants.stageLevels.INITIALIZING);
                nextStepObj.init.call(node.game);
            }

            this.setStateLevel(constants.stateLevels.PLAYING_STEP);
            this.setStageLevel(constants.stageLevels.INITIALIZED);

            // Load the listeners for the step, if any:
            for (ev in nextStepObj.on) {
                if (nextStepObj.on.hasOwnProperty(ev)) {
                    node.events.ee.step.on(ev, nextStepObjs.on[ev]);
                }
            }
            
            // Emit buffered messages:
            node.socket.shouldClearBuffer();

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
        var cb, res, node;
        node = this.node;

        if (!stage || 'object' !== typeof stage) {
            throw new node.NodeGameRuntimeError('game.execStep requires a valid object');
        }

        cb = stage.cb;

        this.setStageLevel(constants.stageLevels.LOADING);

        try {
            res = cb.call(node.game);
        }
        catch (e) {
            if (node.debug) throw e;
            node.err('An error occurred while executing a custom callback');
            throw new node.NodeGameRuntimeError(e);
        }

        this.setStageLevel(constants.stageLevels.LOADED);
        node.emit('STEP_CALLBACK_EXECUTED');
        if (res === false) {
            // A non fatal error occurred
            node.err('A non fatal error occurred while executing the callback of stage ' + this.getCurrentGameStage());
        }
        
        // TODO node.is is probably going to change
        if (!node.window || node.window.state == node.is.LOADED) {
            // If there is a node.window, we must make sure that the DOM of the page
            // is fully loaded. Only the last one to load (between the window and 
            // the callback will emit 'PLAYING'.
            // @see GameWindow.updateStatus
            node.emit('PLAYING');
        }

        return res;
    };

    Game.prototype.getStateLevel = function() {
        return this.node.player.stateLevel;
    };

    Game.prototype.getStageLevel = function() {
        return this.node.player.stageLevel;
    };

    Game.prototype.getCurrentStep = function() {
        return this.plot.getStep(this.getCurrentGameStage());
    };

    Game.prototype.getCurrentGameStage = function() {
        return this.node.player.stage;
    };

    // ERROR, WORKING, etc
    Game.prototype.setStateLevel = function(stateLevel) {
        var node;
        node = this.node;
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
        var node;
        node = this.node;
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
        this.node.player.stage = gameStage;
    };

    Game.prototype.publishStageLevelUpdate = function(newStageLevel) {
        var node;
        node = this.node;
        // Publish update:
        if (!this.observer && node.player.stageLevel !== newStageLevel) {
            node.socket.send(node.msg.create({
                target: constants.target.PLAYER_UPDATE,
                data: { stageLevel: newStageLevel },
                to: 'ALL'
            }));
        }
    };

    Game.prototype.publishGameStageUpdate = function(newGameStage) {
        var node;
        node = this.node;
        // Publish update:
        if (!this.observer && node.player.stage !== newGameStage) {
            node.socket.send(node.msg.create({
                target: constants.target.PLAYER_UPDATE,
                data: { stage: newGameStage },
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
        var node, stageLevel, stateLevel;
        stateLevel = this.getStateLevel();
        stageLevel = this.getStageLevel();
        node = this.node;


        switch (stateLevel) {
        case constants.stateLevels.UNINITIALIZED:
        case constants.stateLevels.INITIALIZING:
        case constants.stateLevels.STAGE_INIT:
        case constants.stateLevels.STEP_INIT:
        case constants.stateLevels.FINISHING:
            return false;

        case constants.stateLevels.PLAYING_STEP:
            switch (stageLevel) {
            case constants.stageLevels.LOADING:
            case constants.stageLevels.PAUSING:
            case constants.stageLevels.RESUMING:
                return false;
            }
        }

        // TODO: make node.window use other than the .is constant
        // Check if there is a gameWindow obj and whether it is loading
        return node.window ? node.window.state >= constants.is.LOADED : true;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
 ,  'undefined' != typeof node ? node : module.parent.exports
);