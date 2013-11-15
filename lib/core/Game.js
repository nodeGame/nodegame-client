/**
 * # Game
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Handles the flow of the game.
 * ---
 */
(function(exports, parent) {

    "use strict";
    
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

        settings = settings || {};

        // This updates are never published.
        this.setStateLevel(constants.stateLevels.UNINITIALIZED, true);
        this.setStageLevel(constants.stageLevels.UNINITIALIZED, true);

        // ## Private properties

        /**
         * ### Game.metadata
         *
         * The game's metadata
         *
         * Contains following properties:
         * name, description, version, session
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
         *  - publishLevel: Default: REGULAR (10)
         *  - syncStepping: Default: false
         */
        this.settings = {
            publishLevel: 'undefined' === typeof settings.publishLevel ?
                constants.publish_levels.REGULAR : settings.publishLevel,
            syncStepping: settings.syncStepping ? true : false
        };

        /**
         * ### Game.pl
         *
         * The list of players connected to the game
         *
         * The list may be empty, depending on the server settings
         */
        this.pl = new PlayerList({
            log: this.node.log,
            logCtx: this.node
        });

        /**
         * ### Game.ml
         *
         * The list of monitor clients connected to the game
         *
         * The list may be empty, depending on the server settings
         */
        this.ml = new PlayerList({
            log: this.node.log,
            logCtx: this.node
        });


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
            logCtx: this.node,
            shared: { node: this.node }
        });

        /**
         * ### Game.plot
         *
         * The Game Plot
         *
         * @see GamePlot
         */
        this.plot = new GamePlot(new Stager(settings.stages), node);

        /**
         * ### Game.checkPlistSize
         *
         * Applies to the PlayerList the constraints defined in the Stager
         *
         * Reads the properties min/max/exactPlayers valid for the current step
         * and checks them with the PlayerList object.
         *
         * @return {boolean} TRUE if all checks are passed
         *
         * @see Game.step
         */
        this.checkPlistSize = function() { return true; };

        // Setting to stage 0.0.0 and starting.
        this.setCurrentGameStage(new GameStage(), true);
        this.setStateLevel(constants.stateLevels.STARTING, true);
        this.paused = false;
    }

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

        // Store time:
        this.node.timer.setTimestamp('start');

        if (node.player.placeholder) {
            throw new node.NodeGameMisconfiguredGameError(
                'game.start called without a player.');
        }

        if (this.getStateLevel() >= constants.stateLevels.INITIALIZING) {
            node.warn('game.start called on a running game.');
            return false;
        }

        // Check for the existence of stager contents:
        if (!this.plot.isReady()) {
            throw new node.NodeGameMisconfiguredGameError(
                'game.start called, but plot is not ready.');
        }

        // INIT the game.
        if (this.plot && this.plot.stager) {
            onInit = this.plot.stager.getOnInit();
            if (onInit) {
                this.setStateLevel(constants.stateLevels.INITIALIZING);
                node.emit('INIT');
                onInit.call(node.game);
            }
        }
        this.setStateLevel(constants.stateLevels.INITIALIZED);

        this.setCurrentGameStage(new GameStage(), true);
        rc = this.step();

        node.log('game started.');
    };

    /**
     * ### Game.restart
     *
     * Stops and starts the game.
     *
     * @see Game.stop
     * @see Game.start
     */
    Game.prototype.restart = function() {
        this.stop();
        this.start();
    };

    /**
     * ### Game.stop
     *
     * Stops the current game
     *
     * Clears timers, event handlers, local memory, and window frame (if any).
     *
     * Does **not** clear _node.env_ variables and any node.player extra
     * property.
     *
     * If additional properties (e.g. widgets) have been added to the game
     * object by any of the previous game callbacks, they will not be removed.
     * TODO: avoid pollution of the game object.
     *
     * GameStage is set to 0.0.0 and srver is notified.
     */
    Game.prototype.stop = function() {
        if (this.getStateLevel() <= constants.stateLevels.INITIALIZING) {
            throw new Error('Game.stop: game is not runnning.');
        }
        // Destroy currently running timers.
        node.timer.destroyAllTimers(true);
 
        // Remove all events registered during the game.
        node.events.ee.game.clear();
        node.events.ee.stage.clear();
        node.events.ee.step.clear();

        // Remove loaded frame, if one is found.
        if (node.window && node.window.getFrame()) {
            node.window.clearFrame();
        }

        this.memory.clear(true);
        node.window.clearCache();

        // Update state/stage levels and game stage.
        this.setStateLevel(constants.stateLevels.STARTING, true);
        this.setStageLevel(constants.stageLevels.UNINITIALIZED, true);
        // This command is notifying the server.
        this.setCurrentGameStage(new GameStage());

        node.log('game stopped.');
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

        node.log('game over.');
    };

    /**
     * ### Game.pause
     *
     * Experimental. Sets the game to pause
     *
     * @TODO: check with Game.ready
     */
    Game.prototype.pause = function() {
        var msgHandler;

        if (this.paused) {
            throw new Error('Game.pause: called while already paused');
        }

        this.node.emit('PAUSING');

        this.paused = true;

        // If the Stager has a method for accepting messages during a
        // pause, pass them to it. Otherwise, buffer the messages
        // until the game is resumed.
        msgHandler = this.plot.getProperty(this.getCurrentGameStage(),
                                           'pauseMsgHandler');
        if (msgHandler) {
            this.node.socket.setMsgListener(function(msg) {
                msg = this.node.socket.secureParse(msg);
                msgHandler.call(this.node.game, msg.toInEvent(), msg);
            });
        }

        this.node.emit('PAUSED');
        
        // broadcast?

        node.log('game paused.');
    };

    /**
     * ### Game.resume
     *
     * Experimental. Resumes the game from a pause
     *
     * @TODO: check with Game.ready
     */
    Game.prototype.resume = function() {
        var msgHandler, node;

        if (!this.paused) {
            throw new Error('Game.pause: called while not paused');
        }
        
        node = this.node;

        node.emit('RESUMING');

        this.paused = false;
        
        // If the Stager defines an appropriate handler, give it the messages
        // that were buffered during the pause.
        // Otherwise, emit the buffered messages normally.
        msgHandler = this.plot.getProperty(this.getCurrentGameStage(),
                                           'resumeMsgHandler');

        node.socket.clearBuffer(msgHandler);

        // Reset the Socket's message handler to the default:
        node.socket.setMsgListener();
        node.emit('RESUMED');

        // broadcast?

        node.log('game resumed.');
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

        if (!this.checkPlistSize()) {
            return;
        }

        stepRule = this.plot.getStepRule(this.getCurrentGameStage());

        if ('function' !== typeof stepRule) {
            throw new this.node.NodeGameMisconfiguredGameError(
                'Game.shouldStep: rule is not a function');
        }

        return stepRule(this.getCurrentGameStage(), this.getStageLevel(),
                        this.pl, this);
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
     * @see Game.gotoStep
     * @see Game.execStep
     */
    Game.prototype.step = function() {
        var curStep, nextStep, node;
        node = this.node;
        curStep = this.getCurrentGameStage();
        nextStep = this.plot.next(curStep);
        // Sends start / step command to connected clients if option is on.
        if (this.settings.syncStepping) {
            if (curStep.stage === 0) {
                node.remoteCommand('start', 'ALL');
            }
            else {
                node.remoteCommand('step', 'ALL');
            }
        }
        return this.gotoStep(nextStep);
    };

    /**
     * ## Game.gotoStep
     *
     * Updates the current game step to toStep and executes it.
     *
     * It unloads the old step listeners, before loading the listeners of the
     * new one.
     *
     * It does note check if the next step is different from the current one,
     * and in this case the same step is re-executed.
     *
     * @param {string|GameStage} nextStep A game stage object, or a string like
     *   GAME_OVER.
     *
     * @see Game.execStep
     * @see GameStage
     *
     * TODO: harmonize return values
     * TODO: remove some unused comments in the code.
     */
    Game.prototype.gotoStep = function(nextStep) {
        var curStep;
        var nextStepObj, nextStageObj;
        var ev, node;
        var property, handler;
        var minThreshold, maxThreshold, exactThreshold;
        var minCallback = null, maxCallback = null, exactCallback = null;

        if (this.getStateLevel() < constants.stateLevels.INITIALIZED) {
            throw new node.NodeGameMisconfiguredGameError(
                'Game.gotoStep: game was not started yet.');
        }

        if ('string' !== typeof nextStep && 'object' !== typeof nextStep) {
            throw new TypeError('Game.gotoStep: nextStep must be ' +
                               'an object or a string.');
        }
        
        curStep = this.getCurrentGameStage();
        node = this.node;

        node.silly('Next stage ---> ' + nextStep);

        // Listeners from previous step are cleared in any case.
        node.events.ee.step.clear();

        // Emit buffered messages:
        if (node.socket.shouldClearBuffer()) {
            node.socket.clearBuffer();
        }

        // TODO: here was the syncStepping option

        if ('string' === typeof nextStep) {
            if (nextStep === GamePlot.GAMEOVER) {
                this.gameover();
                // Emit buffered messages:
                if (node.socket.shouldClearBuffer()) {
                    node.socket.clearBuffer();
                }
                
                node.emit('GAME_OVER');
                return null;
            }

            // else do nothing
            return null;
        }
        else {
            // TODO maybe update also in case of string

            node.emit('STEPPING');

            // stageLevel needs to be changed (silent), otherwise it stays DONE
            // for a short time in the new game stage:
            this.setStageLevel(constants.stageLevels.UNINITIALIZED, true);
            this.setCurrentGameStage(nextStep);

            // If we enter a new stage (including repeating the same stage)
            // we need to update a few things:
            //if (this.plot.stepsToNextStage(curStep) === 1) {
            if (curStep.stage !== nextStep.stage) {
                nextStageObj = this.plot.getStage(nextStep);
                if (!nextStageObj) return false;

                // Store time:
                this.node.timer.setTimestamp('stage', (new Date()).getTime());

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

            // Add min/max/exactPlayers listeners for the step.
            // The fields must be of the form
            //   [ min/max/exactNum, callbackFn ]
            property = this.plot.getProperty(nextStep, 'minPlayers');
            if (property) {
                if (property.length < 2) {
                    throw new TypeError(
                        'Game.gotoStep: minPlayers field must be an array ' +
                            'of length 2.');
                }

                minThreshold = property[0];
                minCallback = property[1];
                if ('number' !== typeof minThreshold ||
                    'function' !== typeof minCallback) {
                    throw new TypeError(
                        'Game.gotoStep: minPlayers field must contain a ' +
                            'number and a function.');
                }
            }
            property = this.plot.getProperty(nextStep, 'maxPlayers');
            if (property) {
                if (property.length < 2) {
                    throw new TypeError(
                        'Game.gotoStep: maxPlayers field must be an array ' +
                            'of length 2.');
                }

                maxThreshold = property[0];
                maxCallback = property[1];
                if ('number' !== typeof maxThreshold ||
                    'function' !== typeof maxCallback) {
                    throw new TypeError(
                        'Game.gotoStep: maxPlayers field must contain a ' +
                            'number and a function.');
                }
            }
            property = this.plot.getProperty(nextStep, 'exactPlayers');
            if (property) {
                if (property.length < 2) {
                    throw new TypeError(
                        'Game.gotoStep: exactPlayers field must be an array ' +
                            'of length 2.');
                }

                exactThreshold = property[0];
                exactCallback = property[1];
                if ('number' !== typeof exactThreshold ||
                    'function' !== typeof exactCallback) {
                    throw new TypeError(
                        'Game.gotoStep: exactPlayers field must contain a ' +
                            'number and a function.');
                }
            }
            if (minCallback || maxCallback || exactCallback) {
                // Register event handler:
                handler = function() {
                    var nPlayers = node.game.pl.size();
                    // Players should count themselves too.
                    if (!node.player.admin) {
                        nPlayers++;
                    }

                    if (minCallback && nPlayers < minThreshold) {
                        minCallback.call(node.game);
                    }

                    if (maxCallback && nPlayers > maxThreshold) {
                        maxCallback.call(node.game);
                    }

                    if (exactCallback && nPlayers !== exactThreshold) {
                        exactCallback.call(node.game);
                    }
                };

                node.events.ee.step.on('in.say.PCONNECT', handler);
                node.events.ee.step.on('in.say.PDISCONNECT', handler);
                // PRECONNECT doesn't change the PlayerList so we don't have to
                // handle it here.

                // Check conditions explicitly:
                handler();

                // Set bounds-checking function:
                this.checkPlistSize = function() {
                    var nPlayers = node.game.pl.size() + 1;

                    if (minCallback && nPlayers < minThreshold) {
                        return false;
                    }

                    if (maxCallback && nPlayers > maxThreshold) {
                        return false;
                    }

                    if (exactCallback && nPlayers !== exactThreshold) {
                        return false;
                    }

                    return true;
                };
            }
            else {
                // Set bounds-checking function:
                this.checkPlistSize = function() { return true; };
            }

            // Load the listeners for the step, if any:
            for (ev in nextStepObj.on) {
                if (nextStepObj.on.hasOwnProperty(ev)) {
                    node.events.ee.step.on(ev, nextStepObjs.on[ev]);
                }
            }

            // Emit buffered messages:
            if (node.socket.shouldClearBuffer()) {
                node.socket.clearBuffer();
            }

        }
        return this.execStep(this.getCurrentStep());
    }

    /**
     * ### Game.execStep
     *
     * Executes the specified stage object
     *
     * @TODO: emit an event 'executing stage', so that other methods get notified
     *
     * @param {object} stage Full stage object to execute
     * @return {boolean} The result of the execution of the step callback
     */
    Game.prototype.execStep = function(stage) {
        var cb, res, node;

        node = this.node;

        if (!stage || 'object' !== typeof stage) {
            throw new node.NodeGameRuntimeError(
                'game.execStep requires a valid object');
        }

        cb = stage.cb;

        this.setStageLevel(constants.stageLevels.EXECUTING_CALLBACK);

        try {
            res = cb.call(node.game);
        }
        catch (e) {
            if (node.debug) throw e;
            node.err('An error occurred while executing a custom callback');
            throw new node.NodeGameRuntimeError(e);
        }
        if (res === false) {
            // A non fatal error occurred.
            node.err('A non fatal error occurred while executing ' +
                     'the callback of stage ' + this.getCurrentGameStage());
        }
        
        this.setStageLevel(constants.stageLevels.CALLBACK_EXECUTED);
        node.emit('STEP_CALLBACK_EXECUTED');    
        // Internal listeners will check whether we need to emit PLAYING.
        return res;
    };

    /**
     * ### Game.getCurrentStep
     *
     * Returns the object representing the current game step. 
     *
     * @return {object} The game-step as defined in the stager.
     *
     * @see Stager
     * @see GamePlot
     */
    Game.prototype.getCurrentStep = function() {
        return this.plot.getStep(this.getCurrentGameStage());
    };

    /**
     * ### Game.getCurrentGameStage
     *
     * Return the GameStage that is currently being executed. 
     *
     * The return value is a reference to node.player.stage.
     *
     * @return {GameStage} The stage currently played.
     * @see node.player.stage
     */
    Game.prototype.getCurrentGameStage = function() {
        return this.node.player.stage;
    };
    
    /**
     * ### Game.setCurrentGameStage
     *
     * Sets the current game stage, and optionally notifies the server 
     *
     * The value is actually stored in `node.player.stage`.
     *
     * Game stages can be objects, or strings like '1.1.1'.
     *
     * @param {string|GameStage} gameStage The value of the update.
     * @param {boolean} silent If TRUE, no notification is sent.
     *
     * @see Game.publishUpdate
     */
    Game.prototype.setCurrentGameStage = function(gameStage, silent) {
        gameStage = new GameStage(gameStage);
        // Update is never sent if the value has not changed.
        if (!silent) {
            if (GameStage.compare(this.getCurrentGameStage(), gameStage) !== 0) {
                // Important: First publish, then actually update.
                // The stage level, must also be sent in the published update,
                // otherwise we could have a mismatch in the remote
                // representation of the stage + stageLevel of the client.
                this.publishUpdate('stage', {
                    stage: gameStage,
                    stageLevel: this.getStageLevel()
                });
            }
        }
        this.node.player.stage = gameStage;
    };

    /**
     * ### Game.getStateLevel
     *
     * Returns the state of the nodeGame engine
     *
     * The engine states are defined in `node.constants.stateLevels`,
     * and it is of the type: STAGE_INIT, PLAYING_STEP, GAMEOVER, etc.
     * The return value is a reference to `node.player.stateLevel`.
     *
     * @return {number} The state of the engine.
     * @see node.player.stateLevel
     * @see node.constants.stateLevels
     */
    Game.prototype.getStateLevel = function() {
        return this.node.player.stateLevel;
    };

    /**
     * ### Game.setStateLevel
     *
     * Sets the current game state level, and optionally notifies the server 
     *
     * The value is actually stored in `node.player.stateLevel`.
     *
     * Stage levels are defined in `node.constants.stageLevels`, for example:
     * STAGE_INIT, PLAYING_STEP, GAMEOVER, etc.
     *
     * @param {number} stateLevel The value of the update.
     * @param {boolean} silent If TRUE, no notification is sent.
     *
     * @see Game.publishUpdate
     * @see node.constants.stageLevels
     */
    Game.prototype.setStateLevel = function(stateLevel, silent) {
        var node;
        node = this.node;
        if ('number' !== typeof stateLevel) {
            throw new node.NodeGameMisconfiguredGameError(
                'setStateLevel called with invalid parameter: ' + stateLevel);
        }
        // Important: First publish, then actually update.
        if (!silent) {
            if (this.getStateLevel !== stateLevel) {
                this.publishUpdate('stateLevel', {
                    stateLevel: stateLevel
                });
            }
        }
        node.player.stateLevel = stateLevel;
    };

    /**
     * ### Game.getStageLevel
     *
     * Return the execution level of the current game stage
     *
     * The execution level is defined in `node.constants.stageLevels`,
     * and it is of the type INITIALIZED, CALLBACK_EXECUTED, etc.
     * The return value is a reference to `node.player.stageLevel`.
     *
     * @return {number} The level of the stage execution. 
     * @see node.player.stageLevel
     * @see node.constants.stageLevels
     */
    Game.prototype.getStageLevel = function() {
        return this.node.player.stageLevel;
    };

    /**
     * ### Game.setStageLevel
     *
     * Sets the current game stage level, and optionally notifies the server 
     *
     * The value is actually stored in `node.player.stageLevel`.
     *
     * Stage levels are defined in `node.constants.stageLevels`, for example:
     * PLAYING, DONE, etc.
     *
     * @param {string|GameStage} gameStage The value of the update.
     * @param {boolean} silent If TRUE, no notification is sent.
     *
     * @see Game.publishUpdate
     * @see node.constants.stageLevels
     */
    Game.prototype.setStageLevel = function(stageLevel, silent) {
        var node;
        if ('number' !== typeof stageLevel) {
            throw new node.NodeGameMisconfiguredGameError(
                'setStageLevel called with invalid parameter: ' + stageLevel);
        }
        node = this.node;
        // console.log(stageLevel);
        // Important: First publish, then actually update.
        if (!silent) {
            // Publish only if the update is different than current value.
            if (this.getStageLevel() !== stageLevel) {
                this.publishUpdate('stageLevel', {
                    stageLevel: stageLevel
                });
            }
        }
        node.player.stageLevel = stageLevel;
    };
    
    /**
     * ### Game.publishUpdate
     *
     * Sends out a PLAYER_UPDATE message, if conditions are met. 
     *
     * Type is a property of the `node.player` object.
     *
     * @param {string} type The type of update:
     *   'stateLevel', 'stageLevel', 'gameStage'.
     * @param {mixed} newValue Optional. The actual value of update to be sent.
     *
     * @see Game.shouldPublishUpdate
     */
    Game.prototype.publishUpdate = function(type, update) {
        var node;
        if ('string' !== typeof type) {
            throw new TypeError('Game.PublishUpdate: type must be string.');
        }
        if (type !== 'stage' && type !== 'stageLevel' && type !== 'stateLevel') {
            throw new Error(
                'Game.publishUpdate: unknown update type (' + type + ')');
        }
        node = this.node;
       
        if (this.shouldPublishUpdate(type, update)) {
            node.socket.send(node.msg.create({
                target: constants.target.PLAYER_UPDATE,
                data: update,
                text: type,
                to: 'ALL'
            }));
        }
    };

    /**
     * ### Game.shouldPublishUpdate
     *
     * Checks whether a game update should be sent to the server
     *
     * Evaluates the current `publishLevel`, the type of update, and the
     * value of the update to decide whether is to be published or not.
     *
     * Checks also if the `syncOnLoaded` option is on.
     *
     * Updates rules are described in '/lib/modules/variables.js'.
     *
     * @param {string} type The type of update:
     *   'stateLevel', 'stageLevel', 'gameStage'.
     * @param {mixed} value Optional. The actual update to be sent
     * @return {boolean} TRUE, if the update should be sent
     */
    Game.prototype.shouldPublishUpdate = function(type, value) {
        var levels, myPublishLevel, stageLevels;
        if ('string' !== typeof type) {
            throw new TypeError(
                'Game.shouldPublishUpdate: type must be string.');
        }
        myPublishLevel = this.settings.publishLevel;
        levels = constants.publish_levels;
        stageLevels = constants.stageLevels;

        // Two cases are handled outside of the switch: NO msg
        // and LOADED stage with syncOnLoaded option.
        if (myPublishLevel === levels.NONE) {
            return false;
        }
        if (this.plot.getProperty(this.getCurrentGameStage(), 'syncOnLoaded')) {
            if (type === 'stageLevel' && 
                value.stageLevel === stageLevels.LOADED) {
                return true;
            }
            // Else will be evaluated below.
        }

        // Check all the other cases.
        switch(myPublishLevel) {
        case levels.FEW:
            return type === 'stage';
        case levels.REGULAR:
            if (type === 'stateLevel') return false;
            if (type === 'stageLevel') {
                return (value.stageLevel === stageLevels.PLAYING ||
                        value.stageLevel === stageLevels.DONE);
            }
            return true; // type === 'stage'
        case levels.MOST:
            return type !== 'stateLevel';
        case levels.ALL:
            return true;
        default:
            // Unknown values of publishLevels are treated as ALL.
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
     * During stepping between functions in the game-plot
     * the flag is temporarily turned to FALSE, and all events
     * are queued and fired only after nodeGame is ready to
     * handle them again.
     *
     * If the browser does not support the method object setters,
     * this property is disabled, and Game.isReady() should be used
     * instead.
     */
    Game.prototype.isReady = function() {
        var node, stageLevel, stateLevel;

        if (this.paused) return false;

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
            case constants.stageLevels.EXECUTING_CALLBACK:
            case constants.stageLevels.CALLBACK_EXECUTED:
            case constants.stageLevels.PAUSING:
            case constants.stageLevels.RESUMING:
                return false;
            }
            break;
        }
        // Check if there is a gameWindow obj and whether it is loading
        return node.window ? node.window.isReady() : true;
    };

    /**
     * ### Game.shouldEmitPlaying
     *
     * Gives the last green light to let the players play a step.
     *
     * Sometimes we want to synchronize players to the very last
     * moment before they start playing. Here we check again.
     * This handles the case also if some players has disconnected
     * between the beginning of the stepping procedure and this
     * method call.
     *
     * Checks also the GameWindow object.
     *
     * @param {boolean} strict If TRUE, PLAYING can be emitted only coming
     *   from the LOADED stage level. Defaults, TRUE.
     * @return {boolean} TRUE, if the PLAYING event should be emitted.
     */
    Game.prototype.shouldEmitPlaying = function(strict) {
        var curGameStage, curStageLevel, syncOnLoaded, node;
        if ('undefined' === typeof strict || strict) {
            // Should emit PLAYING only after LOADED.
            curStageLevel = this.getStageLevel();
            if (curStageLevel !== constants.stageLevels.LOADED) return false;
        }
        node = this.node;
        curGameStage = this.getCurrentGameStage();
        if (!this.isReady()) return false;
        if (!this.checkPlistSize()) return false;
        
        syncOnLoaded = this.plot.getProperty(curGameStage, 'syncOnLoaded');
        if (!syncOnLoaded) return true;
        return node.game.pl.isStepLoaded(curGameStage);
    }
    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
