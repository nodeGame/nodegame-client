/**
 * # Game
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles the flow of the game
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
    Stager = parent.Stager,
    PushManager = parent.PushManager,
    J = parent.JSUS;

    var constants = parent.constants;

    /**
     * ## Game constructor
     *
     * Creates a new instance of Game
     *
     * @param {NodeGameClient} node A valid NodeGameClient object
     */
    function Game(node) {

        this.node = node;

        // This updates are never published.
        this.setStateLevel(constants.stateLevels.UNINITIALIZED, 'S');
        this.setStageLevel(constants.stageLevels.UNINITIALIZED, 'S');

        // ## Properties

        /**
         * ### Game.metadata
         *
         * The game's metadata
         *
         * This object is under normal auto filled with the data
         * from the file `package.json` inside the game folder.
         *
         * Contains at least the following properties:
         *
         *  - name,
         *  - description,
         *  - version
         */
        this.metadata = {
            name:        'A nodeGame game',
            description: 'No description',
            version:     '0.0.1'
        };

        /**
         * ### Game.settings
         *
         * The game's settings
         *
         * This object is under normal auto filled with the settings
         * contained in the game folder: `game/game.settings`,
         * depending also on the chosen treatment.
         */
        this.settings = {};

        /**
         * ### Game.pl | playerList
         *
         * The list of players connected to the game
         *
         * The list may be empty, depending on the server settings.
         *
         * Two players with the same id, or any player with id equal to
         * `node.player.id` is not allowed, and it will throw an error.
         */
        this.playerList = this.pl = new PlayerList({
            log: this.node.log,
            logCtx: this.node,
            name: 'pl_' + this.node.nodename
        });

        this.pl.on('insert', function(p) {
            if (p.id === node.player.id) {
                throw new Error('node.game.pl.on.insert: cannot add player ' +
                                'with id equal to node.player.id.');
            }
        });

        /**
         * ### Game.ml | monitorList
         *
         * The list of monitor clients connected to the game
         *
         * The list may be empty, depending on the server settings
         */
        this.monitorList = this.ml = new PlayerList({
            log: this.node.log,
            logCtx: this.node,
            name: 'ml_' + this.node.nodename
        });

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
         * The Game plot
         *
         * @see GamePlot
         */
        this.plot = new GamePlot(this.node, new Stager());

// TODO: check if we need this.
//        // Overriding stdout for game plot and stager.
//        this.plot.setDefaultLog(function() {
//            // Must use apply, else will be executed in the wrong context.
//            node.log.apply(node, arguments);
//        });

        /**
         * ## Game.timer
         *
         * Default game timer synced with stager 'timer' property
         *
         * @see GameTimer
         * @see GameTimer.syncWithStager
         */
        this.timer = this.node.timer.createTimer({
            name: 'game_timer',
            stagerSync: true
        });

        /**
         * ### Game.checkPlistSize
         *
         * Applies to the PlayerList the constraints defined in the Stager
         *
         * Reads the properties min/max/exactPlayers for the current step
         * and checks them with the PlayerList object.
         *
         * @return {boolean} TRUE if all checks are passed
         *
         * @see Game.step
         */
        this.checkPlistSize = function() { return true; };

        /**
         * ### Game.plChangeHandler
         *
         * Handles changes in the number of players
         *
         * Reads the properties min/max/exactPlayers for the current step
         * and calls the appropriate callback functions.
         *
         * @see Game.
         */
        this.plChangeHandler = function() { return true };

        // Setting to stage 0.0.0 and starting.
        this.setCurrentGameStage(new GameStage(), 'S');
        this.setStateLevel(constants.stateLevels.STARTING, 'S');

        /**
         * ### Game.paused
         *
         * TRUE, if the game is paused
         *
         * @see Game.pause
         * @see Game.resume
         */
        this.paused = false;

        /**
         * ### Game.pauseCounter
         *
         * Counts the number of times the game was paused
         *
         * @see Game.pause
         * @see Game.resume
         */
        this.pauseCounter = 0

        /**
         * ### Game.willBeDone
         *
         * TRUE, if DONE was emitted and evaluated successfully
         *
         * If TRUE, when PLAYING is emitted the game will try to step
         * immediately.
         *
         * @see NodeGameClient.done
         * @see Game.doneCalled
         */
        this.willBeDone = false;

        /**
         * ### Game.minPlayerCbCalled
         *
         * TRUE, if the mininum-player callback has already been called
         *
         * This is reset when the min-condition is satisfied again.
         *
         * @see Game.gotoStep
         */
        this.minPlayerCbCalled = false;

        /**
         * ### Game.maxPlayerCbCalled
         *
         * TRUE, if the maxinum-player callback has already been called
         *
         * This is reset when the max-condition is satisfied again.
         *
         * @see Game.gotoStep
         */
        this.maxPlayerCbCalled = false;

        /**
         * ### Game.exactPlayerCbCalled
         *
         * TRUE, if the exact-player callback has already been called
         *
         * This is reset when the exact-condition is satisfied again.
         *
         * @see Game.gotoStep
         */
        this.exactPlayerCbCalled = false;

        /**
         * ### Game.globals
         *
         * Object pointing to the current step _globals_ properties
         *
         * Whenever a new step is executed the _globals_ properties of
         * the step are copied here. The _globals_ properties of the previous
         * stage are deleted.
         *
         * @see GamePlot
         * @see Stager
         */
        this.globals = {};

        /**
         * ### Game._steppedSteps
         *
         * Array of steps previously played
         *
         * @see Game.step
         */
        this._steppedSteps = [new GameStage()];

        /** ### Game.pushManager
         *
         * Handles pushing client to advance to next step
         *
         * @see PushManager
         */
        this.pushManager = new PushManager(this.node);
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
     * just for change of state after the game has started.
     *
     * @param {object} options Optional. Configuration object. Fields:
     *
     *   - step: true/false. If false, jus call the init function, and
     *     does not enter the first step. Default, TRUE.
     */
    Game.prototype.start = function(options) {
        var onInit, node, startStage;

        node = this.node;

        if (options && 'object' !== typeof options) {
            throw new TypeError('Game.start: options must be object or ' +
                                'undefined.');
        }
        if (node.player.placeholder) {
            throw new Error('Game.start: no player defined.');
        }
        if (!this.isStartable()) {
            throw new Error('Game.start: game cannot be started.');
        }
        node.info('game started.');

        // Store time.
        node.timer.setTimestamp('start');

        options = options || {};

        // Starts from beginning (default) or from a predefined stage
        // This options is useful when a player reconnets.
        startStage = options.startStage || new GameStage();

        // Update GLOBALS.
        this.updateGlobals(startStage);

        // INIT the game.
        onInit = this.plot.stager.getOnInit();
        if (onInit) {
            this.setStateLevel(constants.stateLevels.INITIALIZING);
            node.emit('INIT');
            onInit.call(node.game);
        }

        this.setStateLevel(constants.stateLevels.INITIALIZED);

        this.setCurrentGameStage(startStage, 'S');

        node.log('game started.');

        if (options.step !== false) this.step();
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
     * GameStage is set to 0.0.0 and server is notified.
     */
    Game.prototype.stop = function() {
        var node;

        node = this.node;
        if (!this.isStoppable()) {
            throw new Error('Game.stop: game cannot be stopped.');
        }
        // Destroy currently running timers.
        node.timer.destroyAllTimers(true);

        // Remove all events registered during the game.
        node.events.ee.game.clear();
        node.events.ee.stage.clear();
        node.events.ee.step.clear();

        // Clear memory.
        this.memory.clear(true);

        // If a _GameWindow_ object is found, clears it.
        if (node.window) {
            node.window.reset();
        }

        // Update state/stage levels and game stage.
        this.setStateLevel(constants.stateLevels.STARTING, 'S');
        this.setStageLevel(constants.stageLevels.UNINITIALIZED, 'S');
        // This command is notifying the server.
        this.setCurrentGameStage(new GameStage());

        // Temporary change:
        node.game = null;
        node.game = new Game(node);
        node.game.pl = this.pl;
        node.game.ml = this.ml;

        node.log('game stopped.');
    };

    /**
     * ### Game.gameover
     *
     * Ends the game
     *
     * Calls the gameover function, sets levels.
     *
     * TODO: should it set the game stage to 0.0.0 again ?
     */
    Game.prototype.gameover = function() {
        var onGameover, node;
        node = this.node;

        if (this.getStateLevel() >= constants.stateLevels.FINISHING) {
            node.warn('Game.gameover called on a finishing game.');
            return;
        }

        node.emit('GAME_ALMOST_OVER');

        // Call gameover callback, if it exists.
        onGameover = this.plot.stager.getOnGameover();
        if (onGameover) {
            this.setStateLevel(constants.stateLevels.FINISHING);
            onGameover.call(node.game);
        }

        this.setStateLevel(constants.stateLevels.GAMEOVER);
        this.setStageLevel(constants.stageLevels.DONE);

        node.log('game over.');
        node.emit('GAME_OVER');
    };

    /**
     * ### Game.isPaused
     *
     * Returns TRUE, if game is paused
     *
     * @see Game.pause
     */
    Game.prototype.isPaused = function() {
        return this.paused;
    };

    /**
     * ### Game.pause
     *
     * Sets the game to pause
     *
     * @param {string} param Optional. A parameter to pass along the
     *   emitted events PAUSING and PAUSED.
     *
     * @see Game.resume
     */
    Game.prototype.pause = function(param) {
        var msgHandler, node;

        if (!this.isPausable()) {
            throw new Error('Game.pause: game cannot be paused.');
        }

        node = this.node;
        node.emit('PAUSING', param);

        this.paused = true;
        this.pauseCounter++;

        // If the Stager has a method for accepting messages during a
        // pause, pass them to it. Otherwise, buffer the messages
        // until the game is resumed.
        msgHandler = this.plot.getProperty(this.getCurrentGameStage(),
                                           'pauseMsgHandler');
        if (msgHandler) {
            node.socket.setMsgListener(function(msg) {
                msg = node.socket.secureParse(msg);
                msgHandler.call(node.game, msg.toInEvent(), msg);
            });
        }

        node.timer.setTimestamp('paused');
        node.emit('PAUSED', param);

        // TODO: broadcast?

        node.log('game paused.');
    };

    /**
     * ### Game.resume
     *
     * Resumes the game from pause
     *
     * @param {string} param Optional. A parameter to pass along the
     *   emitted events RESUMING and RESUMED.
     *
     * @see Game.pause
     */
    Game.prototype.resume = function(param) {
        var msgHandler, node;

        if (!this.isResumable()) {
            throw new Error('Game.resume: game cannot be resumed.');
        }

        node = this.node;

        node.emit('RESUMING', param);

        this.paused = false;

        // If the Stager defines an appropriate handler, give it the messages
        // that were buffered during the pause.
        // Otherwise, emit the buffered messages normally.
        msgHandler = this.plot.getProperty(this.getCurrentGameStage(),
                                           'resumeMsgHandler');

        node.socket.clearBuffer(msgHandler);

        // Reset the Socket's message handler to the default:
        node.socket.setMsgListener();
        node.timer.setTimestamp('resumed');
        node.emit('RESUMED', param);

        // TODO: broadcast?

        // Maybe the game was LOADED during the pausing.
        // In this case the PLAYING event got lost.
        if (this.shouldEmitPlaying()) {
            this.node.emit('PLAYING');
        }

        node.log('game resumed.');
    };

    /**
     * ### Game.shouldStep
     *
     * Checks if the next step can be executed
     *
     * Checks the number of players required.
     * If the game has been initialized and is not in GAME_OVER, then
     * evaluates the stepRule function for the current step and returns
     * its result.
     *
     * @param {number} stageLevel Optional. If set, it is used instead
     *   of `Game.getStageLevel()`
     *
     * @return {boolean} TRUE, if stepping is allowed;
     *   FALSE, if stepping is not allowed
     *
     * @see Game.step
     * @see Game.checkPlistSize
     * @see stepRules
     */
    Game.prototype.shouldStep = function(stageLevel) {
        var stepRule;

        if (!this.checkPlistSize() || !this.isSteppable()) {
            return false;
        }

        stepRule = this.plot.getStepRule(this.getCurrentGameStage());

        if ('function' !== typeof stepRule) {
            throw new TypeError('Game.shouldStep: stepRule is not a function.');
        }

        stageLevel = stageLevel || this.getStageLevel();

        return stepRule(this.getCurrentGameStage(), stageLevel, this.pl, this);
    };

    /**
     * ### Game.step
     *
     * Executes the next stage / step
     *
     * @param {object} options Optional. Options passed to `gotoStep`
     *
     * @return {boolean} FALSE, if the execution encountered an error
     *
     * @see Game.stager
     * @see Game.currentStage
     * @see Game.gotoStep
     * @see Game.execStep
     */
    Game.prototype.step = function(options) {
        var curStep, nextStep;
        curStep = this.getCurrentGameStage();
        nextStep = this.plot.next(curStep);
        return this.gotoStep(nextStep, options);
    };

    /**
     * ### Game.gotoStep
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
     * @param {object} options Optional. Additional options, such as:
     *   `willBeDone` (immediately calls `node.done()`, useful
     *   for reconnections)
     *
     * @see Game.execStep
     * @see GameStage
     *
     * TODO: harmonize return values
     * TODO: remove some unused comments in the code.
     */
    Game.prototype.gotoStep = function(nextStep, options) {
        var curStep, curStepObj, curStageObj, nextStepObj, nextStageObj;
        var stageInit;
        var ev, node;
        var property, handler;
        var doPlChangeHandler;
        var minThreshold, maxThreshold, exactThreshold;
        var minCallback = null, maxCallback = null, exactCallback = null;
        var minRecoverCb = null, maxRecoverCb = null, exactRecoverCb = null;

        if (!this.isSteppable()) {
            throw new Error('Game.gotoStep: game cannot be stepped.');
        }

        if ('string' !== typeof nextStep && 'object' !== typeof nextStep) {
            throw new TypeError('Game.gotoStep: nextStep must be ' +
                                'an object or a string.');
        }

        if (options && 'object' !== typeof options) {
            throw new TypeError('Game.gotoStep: options must be object or ' +
                                'undefined.');
        }

        node = this.node;

        node.silly('Next step ---> ' + nextStep);

        // TODO: even if node.game.timer.syncWithStage is on,
        // node.done() is not called on logics. So the timer
        // is not stopped. We do it manually here for the moment,
        // and we clear also the milliseconds count.
        this.timer.reset();

        // Clear push-timer.
        this.pushManager.clearTimer();

        // Clear the cache of temporary changes to steps.
        this.plot.tmpCache.clear();

        curStep = this.getCurrentGameStage();
        curStageObj = this.plot.getStage(curStep);
        curStepObj = this.plot.getStep(curStep);

        // Sends start / step command to connected clients if option is on.
        if (this.plot.getProperty(nextStep, 'syncStepping')) {
            if (curStep.stage === 0) {
                node.remoteCommand('start', 'ROOM');
            }
            else {
                node.remoteCommand('goto_step', 'ROOM', nextStep.toObject());
            }
        }

        // Calling exit function of the step.
        if (curStepObj && curStepObj.exit) {
            this.setStateLevel(constants.stateLevels.STEP_EXIT);
            this.setStageLevel(constants.stageLevels.EXITING);

            curStepObj.exit.call(this);
        }

        // Listeners from previous step are cleared (must be after exit).
        node.events.ee.step.clear();

        // Emit buffered messages.
        if (node.socket.shouldClearBuffer()) {
            node.socket.clearBuffer();
        }

        if ('string' === typeof nextStep) {

            // TODO: see if we can avoid code duplication below.
            // Calling exit function of the stage.
            if (curStageObj && curStageObj.exit) {
                this.setStateLevel(constants.stateLevels.STAGE_EXIT);
                this.setStageLevel(constants.stageLevels.EXITING);

                curStageObj.exit.call(this);
            }
            // Clear any event listeners added in the stage exit function.
            node.events.ee.stage.clear();

            if (nextStep === GamePlot.GAMEOVER) {
                this.gameover();
                // Emit buffered messages:
                if (node.socket.shouldClearBuffer()) {
                    node.socket.clearBuffer();
                }
                return null;
            }
            // else do nothing
            return null;
        }
        else {
            // TODO maybe update also in case of string.
            node.emit('STEPPING');

            // Check for stage/step existence:
            nextStageObj = this.plot.getStage(nextStep);
            if (!nextStageObj) return false;
            nextStepObj = this.plot.getStep(nextStep);
            if (!nextStepObj) return false;

//             // TODO: was here. (options might be undefined now)
//             // Check options.
//             // TODO: this does not lock screen / stop timer.
//             if (options.willBeDone) this.willBeDone = true;

            // If we enter a new stage we need to update a few things.
            if (!curStageObj || nextStageObj.id !== curStageObj.id) {

                // Calling exit function.
                if (curStageObj && curStageObj.exit) {
                    this.setStateLevel(constants.stateLevels.STAGE_EXIT);
                    this.setStageLevel(constants.stageLevels.EXITING);

                    curStageObj.exit.call(this);
                }
                stageInit = true;
            }

            // stageLevel needs to be changed (silent), otherwise it stays
            // DONE for a short time in the new game stage:
            this.setStageLevel(constants.stageLevels.UNINITIALIZED, 'S');
            this.setCurrentGameStage(nextStep);

            // Process options before calling any init function.
            if ('object' === typeof options) {
                processGotoStepOptions(this, options);
            }
            else if (options) {
                throw new TypeError('Game.gotoStep: options must be object ' +
                                    'or undefined. Found: ' +  options);
            }

            if (stageInit) {
                // Store time:
                this.node.timer.setTimestamp('stage', (new Date()).getTime());

                // Clear the previous stage listeners.
                node.events.ee.stage.clear();

                this.setStateLevel(constants.stateLevels.STAGE_INIT);
                this.setStageLevel(constants.stageLevels.INITIALIZING);

                // Execute the init function of the stage, if any:
                if (nextStageObj.hasOwnProperty('init')) {
                    nextStageObj.init.call(node.game);
                }
            }

            // Execute the init function of the step, if any:
            if (nextStepObj.hasOwnProperty('init')) {
                this.setStateLevel(constants.stateLevels.STEP_INIT);
                this.setStageLevel(constants.stageLevels.INITIALIZING);
                nextStepObj.init.call(node.game);
            }

            this.setStateLevel(constants.stateLevels.PLAYING_STEP);
            this.setStageLevel(constants.stageLevels.INITIALIZED);

            // Updating the globals object.
            this.updateGlobals(nextStep);

            // Min/Max/Exact Properties.

            property = this.plot.getProperty(nextStep, 'minPlayers');
            if (property) {
                property = checkMinMaxExactParams('min', property);
                minThreshold = property[0];
                minCallback = property[1];
                minRecoverCb = property[2];
                doPlChangeHandler = true;
            }

            property = this.plot.getProperty(nextStep, 'maxPlayers');
            if (property) {
                property = checkMinMaxExactParams('max', property);
                maxThreshold = property[0];
                maxCallback = property[1];
                maxRecoverCb = property[2];
                if (maxThreshold <= minThreshold) {
                    throw new Error('Game.gotoStep: maxPlayers is smaller ' +
                                    'than minPlayers: ' + maxThreshold);
                }
                doPlChangeHandler = true;
            }

            property = this.plot.getProperty(nextStep, 'exactPlayers');
            if (property) {
                if (doPlChangeHandler) {
                    throw new Error('Game.gotoStep: exactPlayers cannot be ' +
                                    'set if minPlayers or maxPlayers are set.');
                }
                property = checkMinMaxExactParams('exact', property);
                exactThreshold = property[0];
                exactCallback = property[1];
                exactRecoverCb = property[2];
                doPlChangeHandler = true;
            }

            if (doPlChangeHandler) {

                // Register event handler.
                handler = function(player) {
                    var cb, nPlayers, wrongNumCb, correctNumCb;
                    var that, res;
                    res = true;
                    that = node.game;
                    nPlayers = node.game.pl.size();
                    // Players should count themselves too.
                    if (!node.player.admin) nPlayers++;

                    if ('number' === typeof minThreshold) {
                        if (nPlayers < minThreshold) {
                            if (!that.minPlayerCbCalled) {
                                that.minPlayerCbCalled = true;
                                cb = that.getProperty('onWrongPlayerNum');

                                cb.call(that, 'min', minCallback, player);
                            }
                            res = false;
                        }
                        else {
                            if (that.minPlayerCbCalled) {
                                cb = that.getProperty('onCorrectPlayerNum');
                                cb.call(that, 'min', minRecoverCb, player);
                            }
                            that.minPlayerCbCalled = false;
                        }
                    }

                    if ('number' === typeof maxThreshold) {
                        if (nPlayers > maxThreshold) {
                            if (!that.maxPlayerCbCalled) {
                                that.maxPlayerCbCalled = true;
                                cb = that.getProperty('onWrongPlayerNum');
                                cb.call(that, 'max', maxCallback);
                            }
                            res = false;
                        }
                        else {
                            if (that.maxPlayerCbCalled) {
                                cb = that.getProperty('onCorrectPlayerNum');
                                cb.call(that, 'max', maxRecoverCb);
                            }
                            that.maxPlayerCbCalled = false;
                        }
                    }

                    if ('number' === typeof exactThreshold) {
                        if (nPlayers !== exactThreshold) {
                            if (!that.exactPlayerCbCalled) {
                                that.exactPlayerCbCalled = true;
                                cb = that.getProperty('onWrongPlayerNum');
                                cb.call(that, 'exact', exactCallback);
                            }
                            res = false;
                        }
                        else {
                            if (that.exactPlayerCbCalled) {
                                cb = that.getProperty('onCorrectPlayerNum');
                                cb.call(that, 'exact', exactRecoverCb);
                            }
                            that.exactPlayerCbCalled = false;
                        }
                    }

                    return res;
                };

                node.events.ee.step.on('in.say.PCONNECT', handler);
                node.events.ee.step.on('in.say.PDISCONNECT', handler);
                // PRECONNECT needs to verify client is authorized,
                // so we don't have to handle it here.

                // Check conditions explicitly:
                this.plChangeHandler = handler;
                this.plChangeHandler();

                // Set bounds-checking function:
                this.checkPlistSize = function() {
                    var nPlayers = node.game.pl.size();
                    // Players should count themselves too.
                    if (!node.player.admin) nPlayers++;

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
                this.plChangeHandler = function() { return true; };
            }

            // Emit buffered messages:
            if (node.socket.shouldClearBuffer()) {
                node.socket.clearBuffer();
            }

        }

        // Update list of stepped steps.
        this._steppedSteps.push(nextStep);

        this.execStep(this.getCurrentGameStage());
        return true;
    };

    /**
     * ### Game.execStep
     *
     * Executes the specified stage object
     *
     * @param {GameStage} step Step to execute
     *
     * @return {boolean} The result of the execution of the step callback
     */
    Game.prototype.execStep = function(step) {
        var cb;
        var frame, uri, frameOptions;
        var frameLoadMode, frameStoreMode;
        var frameAutoParse, frameAutoParsePrefix;

        if ('object' !== typeof step) {
            throw new Error('Game.execStep: step must be object.');
        }

        cb = this.plot.getProperty(step, 'cb');
        frame = this.plot.getProperty(step, 'frame');

        // Handle frame loading natively, if required.
        if (frame) {
            if (!this.node.window) {
                throw new Error('Game.execStep: frame option in step ' +
                                step + ', but nodegame-window is not loaded.');
            }
            frameOptions = {};
            if ('string' === typeof frame) {
                uri = frame;
            }
            else if ('object' === typeof frame) {
                uri = frame.uri;
                if ('string' !== typeof uri) {
                    throw new TypeError('Game.execStep: frame.uri must ' +
                                        'be string: ' + uri + '. ' +
                                        'Step: ' + step);
                }
                frameOptions.frameLoadMode = frame.loadMode;
                frameOptions.storeMode = frame.storeMode;
                frameAutoParse = frame.autoParse;
                if (frameAutoParse) {
                    // Replacing TRUE with node.game.settings.
                    if (frameAutoParse === true) {
                        frameAutoParse = this.settings;
                    }

                    frameOptions.autoParse = frameAutoParse;
                    frameOptions.autoParseMod = frame.autoParseMod;
                    frameOptions.autoParsePrefix = frame.autoParsePrefix;
                }
            }
            else {
                throw new TypeError('Game.execStep: frame must be string or ' +
                                    'object: ' + frame + '. ' +
                                    'Step: ' + step);

            }

            // Auto load frame and wrap cb.
            this.execCallback(function() {
                this.node.window.loadFrame(uri, cb, frameOptions);
            });
        }
        else {
            this.execCallback(cb);
        }
    };

    /**
     * ## Game.execCallback
     *
     * Executes a game callback
     *
     * Sets the stage levels before and after executing the callback,
     * and emits an event before exiting.
     *
     * @param {function} cb The callback to execute
     *
     * @return {mixed} res The return value of the callback
     *
     * @emit 'STEP_CALLBACK_EXECUTED'
     */
    Game.prototype.execCallback = function(cb) {
        var res;
        this.setStageLevel(constants.stageLevels.EXECUTING_CALLBACK);

        // Execute custom callback. Can throw errors.
        res = cb.call(this.node.game);
        if (res === false) {
            // A non fatal error occurred.
            this.node.err('A non fatal error occurred in callback ' +
                          'of stage ' + this.getCurrentGameStage());
        }

        this.setStageLevel(constants.stageLevels.CALLBACK_EXECUTED);
        this.node.emit('STEP_CALLBACK_EXECUTED');
        // Internal listeners will check whether we need to emit PLAYING.
    };

    /**
     * ### Game.getCurrentStepObj
     *
     * Returns the object representing the current game step.
     *
     * The returning object includes all the properties, such as:
     * _id_, _cb_, _timer_, etc.
     *
     * @return {object} The game-step as defined in the stager.
     *
     * @see Stager
     * @see GamePlot
     */
    Game.prototype.getCurrentStepObj = function() {
        return this.plot.getStep(this.getCurrentGameStage());
    };

     /**
     * ### Game.getCurrentStep
     *
     * Alias for Game.prototype.getCurrentStepObj
     *
     * @deprecated
     */
    Game.prototype.getCurrentStep = Game.prototype.getCurrentStepObj;

    /**
     * ### Game.getCurrentStepProperty
     *
     * Returns the object representing the current game step.
     *
     * The returning object includes all the properties, such as:
     * _id_, _cb_, _timer_, etc.
     *
     * @return {object} The game-step as defined in the stager.
     *
     * @see Stager
     * @see GamePlot
     */
    Game.prototype.getCurrentStepProperty = function(propertyName) {
        var step;
        if ('string' !== typeof propertyName) {
            throw new TypeError('Game.getCurrentStepProperty: propertyName ' +
                                'must be string');
        }
        step = this.plot.getStep(this.getCurrentGameStage());
        return 'undefined' === typeof step[propertyName] ?
            null : step[propertyName];
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
     * Sets the current game stage and notifies the server
     *
     * Stores the value of current game stage in `node.player.stage`.
     *
     * By default, it does not send the update to the server if the
     * new stage is the same as the previous one. However, it is
     * possible to override this behavior with specyfing a second
     * parameter `mod`.
     *
     * @param {string|GameStage} gameStage The value of the update.
     *   For example, an object, or a string like '1.1.1'.
     * @param {string} mod Optional. A string modifiying the default
     *   behavior ('F' = force, 'S' = silent').
     *
     * @see Game.publishUpdate
     */
    Game.prototype.setCurrentGameStage = function(gameStage, mod) {
        gameStage = new GameStage(gameStage);
        if (mod === 'F' ||
            (!mod && GameStage.compare(this.getCurrentGameStage(),
                                       gameStage) !== 0)) {

            // Important: First publish, then actually update.
            // The stage level, must also be sent in the published update,
            // otherwise we could have a mismatch in the remote
            // representation of the stage + stageLevel of the client.
            this.publishUpdate('stage', {
                stage: gameStage,
                stageLevel: this.getStageLevel()
            });
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
     * By default, it does not send the update to the server if the
     * new state level is the same as the previous one. However, it is
     * possible to override this behavior with specyfing a second
     * parameter `mod`.
     *
     * @param {number} stateLevel The value of the update.
     * @param {string} mod Optional. A string modifiying the default
     *   behavior ('F' = force, 'S' = silent').
     *
     * @see Game.publishUpdate
     * @see node.constants.stageLevels
     */
    Game.prototype.setStateLevel = function(stateLevel, mod) {
        var node;
        node = this.node;
        if ('number' !== typeof stateLevel) {
            throw new TypeError('Game.setStateLevel: stateLevel must be ' +
                                'number. Found: ' + stateLevel);
        }
        // Important: First publish, then actually update.
        if (mod === 'F' || (!mod && this.getStateLevel() !== stateLevel)) {
            this.publishUpdate('stateLevel', {
                stateLevel: stateLevel
            });
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
     * By default, it does not send the update to the server if the
     * new state level is the same as the previous one. However, it is
     * possible to override this behavior with specyfing a second
     * parameter `mod`.
     *
     * @param {string|GameStage} gameStage The value of the update.
     * @param {string} mod Optional. A string modifiying the default
     *   behavior ('F' = force, 'S' = silent').
     *
     * @see Game.publishUpdate
     * @see node.constants.stageLevels
     */
    Game.prototype.setStageLevel = function(stageLevel, mod) {
        var node;
        node = this.node;
        if ('number' !== typeof stageLevel) {
            throw new TypeError('Game.setStageLevel: stageLevel must be ' +
                                'number. Found: ' + stageLevel);
        }
        // Important: First publish, then actually update.
        if (mod === 'F' || (!mod && this.getStageLevel() !== stageLevel)) {
            this.publishUpdate('stageLevel', {
                stageLevel: stageLevel
            });
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
            throw new TypeError('Game.publishUpdate: type must be string.');
        }
        if (type !== 'stage' &&
            type !== 'stageLevel' &&
            type !== 'stateLevel') {

            throw new Error(
                'Game.publishUpdate: unknown update type (' + type + ')');
        }
        node = this.node;

        if (this.shouldPublishUpdate(type, update)) {
            node.socket.send(node.msg.create({
                target: constants.target.PLAYER_UPDATE,
                data: update,
                text: type,
                to: 'ROOM'
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
     *
     * @return {boolean} TRUE, if the update should be sent
     */
    Game.prototype.shouldPublishUpdate = function(type, value) {
        var myStage;
        var levels, myPublishLevel, stageLevels;
        if ('string' !== typeof type) {
            throw new TypeError(
                'Game.shouldPublishUpdate: type must be string.');
        }

        myStage = this.getCurrentGameStage();
        levels = constants.publishLevels;
        stageLevels = constants.stageLevels;

        myPublishLevel = this.plot.getProperty(myStage, 'publishLevel');

        // Two cases are handled outside of the switch: NO msg
        // and LOADED stage with syncOnLoaded option.
        if (myPublishLevel === levels.NONE) {
            return false;
        }
        if (this.plot.getProperty(myStage, 'syncOnLoaded')) {
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
     * Returns TRUE if a game is set and interactive
     *
     * A game is ready unless a stage or step is currently being
     * loaded or DONE procedure has been started, i.e. between the
     * stage levels: PLAYING and GETTING_DONE.
     *
     * If a game is paused, it is also NOT ready.
     *
     * @see node.constants.stageLevels
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
        case constants.stateLevels.STAGE_EXIT:
        case constants.stateLevels.STEP_EXIT:
            return false;

        case constants.stateLevels.PLAYING_STEP:
            switch (stageLevel) {
            case constants.stageLevels.EXECUTING_CALLBACK:
            case constants.stageLevels.CALLBACK_EXECUTED:
            case constants.stageLevels.PAUSING:
            case constants.stageLevels.RESUMING:
            case constants.stageLevels.GETTING_DONE:
                return false;
            }
            break;
        }
        return true;
    };

    /**
     * ### Game.isStartable
     *
     * Returns TRUE if Game.start can be called
     *
     * @return {boolean} TRUE if the game can be started.
     */
    Game.prototype.isStartable = function() {
        return this.plot.isReady() &&
            this.getStateLevel() < constants.stateLevels.INITIALIZING;
    };


    /**
     * ### Game.isStoppable
     *
     * Returns TRUE if Game.stop can be called
     *
     * @return {boolean} TRUE if the game can be stopped.
     */
    Game.prototype.isStoppable = function() {
        return this.getStateLevel() > constants.stateLevels.INITIALIZING;
    };


    /**
     * ### Game.isPausable
     *
     * Returns TRUE if Game.pause can be called
     *
     * @return {boolean} TRUE if the game can be paused.
     */
    Game.prototype.isPausable = function() {
        return !this.paused &&
            this.getStateLevel() > constants.stateLevels.INITIALIZING;
    };


    /**
     * ### Game.isResumable
     *
     * Returns TRUE if Game.resume can be called
     *
     * @return {boolean} TRUE if the game can be resumed.
     */
    Game.prototype.isResumable = function() {
        return this.paused &&
            this.getStateLevel() > constants.stateLevels.INITIALIZING;
    };


    /**
     * ### Game.isSteppable
     *
     * Returns TRUE if Game.step and Game.gotoStep can be called
     *
     * @return {boolean} TRUE if the game can be stepped.
     */
    Game.prototype.isSteppable = function() {
        var stateLevel;
        stateLevel = this.getStateLevel();

        return stateLevel > constants.stateLevels.INITIALIZING &&
               stateLevel < constants.stateLevels.FINISHING;
    };

    /**
     * ### Game.isGameover
     *
     * Returns TRUE if gameover was called and state level set
     *
     * @return {boolean} TRUE if is game over
     */
    Game.prototype.isGameover = Game.prototype.isGameOver = function() {
        return this.getStateLevel() === constants.stateLevels.GAMEOVER;
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
     *   from the LOADED stage level. Default: TRUE
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
    };

    /**
     * ### Game.compareCurrentStep
     *
     * Returns the relative order of a step with the current step
     *
     * @param {GameStage|string} step The step to compare
     *
     * @return {number} 0 if comparing step is the same as current step,
     *   -1 if current step is before comparing step, 1 if current step
     *   is after comparing step
     */
    Game.prototype.compareCurrentStep = function(step) {
        var normalizedStep;
        normalizedStep = this.plot.normalizeGameStage(new GameStage(step));
        return GameStage.compare(this.getCurrentGameStage(), normalizedStep);
    };

    /**
     * ### Game.getPreviousStep
     *
     * Returns the game-stage played delta steps ago
     *
     * @param {number} delta Optional. The number of past steps. Default 1
     *
     * @return {GameStage|null} The game-stage played delta steps ago,
     *   or null if none is found
     */
    Game.prototype.getPreviousStep = function(delta) {
        var len;
        delta = delta || 1;
        if ('number' !== typeof delta || delta < 1) {
            throw new TypeError('Game.getPreviousStep: delta must be a ' +
                                'positive number or undefined: ', delta);
        }
        len = this._steppedSteps.length - delta - 1;
        if (len < 0) return null;
        return this._steppedSteps[len];
    };

    /**
     * ### Game.getNextStep
     *
     * Returns the game-stage that will be played in delta steps
     *
     * @param {number} delta Optional. The number of future steps. Default 1
     *
     * @return {GameStage|null} The game-stage that will be played in
     *   delta future steps, or null if none is found, or if the game
     *   sequence contains a loop in between
     */
    Game.prototype.getNextStep = function(delta) {
        delta = delta || 1;
        if ('number' !== typeof delta || delta < 1) {
            throw new TypeError('Game.getNextStep: delta must be a ' +
                                'positive number or undefined: ', delta);
        }
        return this.plot.jump(this.getCurrentGameStage(), delta, false);
    };

    /**
     * ### Game.updateGlobals
     *
     * Updates node.globals and adds properties to window in the browser
     *
     * @param {GameStage} stage Optional. The reference game stage.
     *   Default: Game.currentGameStage()
     *
     * @return Game.globals
     */
    Game.prototype.updateGlobals = function(stage) {
        var newGlobals, g;
        stage = stage || this.getCurrentGameStage();
        newGlobals = this.plot.getGlobals(stage);
        if ('undefined' !== typeof window && this.node.window) {
            // Adding new globals.
            for (g in newGlobals) {
                if (newGlobals.hasOwnProperty(g)) {
                    if (g === 'node' || g === 'W') {
                        node.warn('Game.updateGlobals: invalid name: ' + g);
                    }
                    else {
                        window[g] = newGlobals[g];
                    }
                }
            }
            // Removing old ones.
            for (g in this.globals) {
                if (this.globals.hasOwnProperty(g) &&
                    !newGlobals.hasOwnProperty(g)) {
                    if (g !== 'node' || g !== 'W') {
                        delete window[g];
                    }
                }
            }
        }
        // Updating globals reference.
        this.globals = newGlobals;
        return this.globals;
    };

    /**
     * ### Game.getProperty
     *
     * Returns the requested step property from the game plot
     *
     * @param {string} property The name of the property
     * @param {GameStage} gameStage Optional. The reference game stage.
     *   Default: Game.currentGameStage()
     *
     * @return {miexed} The value of the requested step property
     *
     * @see GamePlot.getProperty
     */
    Game.prototype.getProperty = function(property, gameStage) {
        gameStage = 'undefined' !== typeof gameStage ?
            gameStage : this.getCurrentGameStage();
        return this.plot.getProperty(gameStage, property);
    };

    // ## Helper Methods

    /**
     * ### processGoToStepOptions
     *
     * Process options before executing the init functions of stage/steps
     *
     * Valid options:
     *
     *    - willBeDone: sets game.willBeDone to TRUE,
     *    - plot: add entries to the tmpCache of the plot,
     *    - cb: a callback executed with the game context, and with options
     *          object itself as parameter
     *
     * @param {Game} game The game instance
     * @param {object} options The options to process
     *
     * @see Game.gotoStep
     * @see GamePlot.tmpCache
     * @see Game.willBeDone
     */
    function processGotoStepOptions(game, options) {
        var prop;

        // Set willBeDone. TODO: this does not lock screen / stop timer.
        if (options.willBeDone) game.willBeDone = true;

        // Temporarily modify plot properties.
        if (options.plot) {
            for (prop in options.plot) {
                if (options.plot.hasOwnProperty(prop)) {
                    game.plot.tmpCache(prop, options.plot[prop]);
                }
            }
        }

        // Call the cb with options as param, if found.
        if (options.cb) {
            if ('function' === typeof options.cb) {
                options.cb.call(game, options);
            }
            else {
                throw new TypeError('Game.gotoStep: options.cb must be ' +
                                    'function or undefined. Found: ' +
                                    options.cb);
            }
        }
    }

    /**
     * ### checkMinMaxExactParams
     *
     * Checks the parameters of min|max|exactPlayers property of a step
     *
     * Method is invoked by Game.gotoStep, and errors are thrown accordingly.
     *
     * @param {string} name The name of the parameter: min|max|exact
     * @param {number} num The threshold for numer of players
     * @param {function} cb The function being called when the threshold
     *    is not met
     * @param {function} recoverCb Optional. The function being called
     *    when the a threshold previously not met is recovered
     *
     * @see Game.gotoStep
     */
    function checkMinMaxExactParams(name, property) {
        var num, cb, recoverCb;

        if ('number' === typeof property) {
            property = [num];
        }

        if (J.isArray(property)) {
            if (!property.length) {
                throw new Error('Game.gotoStep: ' + name + 'Players field ' +
                                'is empty array.');
            }
            num = property[0];
            cb = property[1];
            recoverCb = property[2];
        }
        else {
            throw new TypeError('Game.gotoStep: ' + name + 'Players field ' +
                                'must be number or non-empty array. Found: ' +
                                property);
        }

        if ('number' !== typeof num || !isFinite(num) || num < 1) {
            throw new TypeError('Game.gotoStep: ' + name +
                                'Players must be a finite number ' +
                                'greater than 1: ' + num);
        }
        if ('undefined' !== typeof cb && 'function' !== typeof cb) {

            throw new TypeError('Game.gotoStep: ' + name +
                                'Players cb must be ' +
                                'function or undefined: ' + cb);
        }
        if ('undefined' !== typeof recoverCb && 'function' !== typeof cb) {

            throw new TypeError('Game.gotoStep: ' + name +
                                'Players recoverCb must be ' +
                                'function or undefined: ' + recoverCb);
        }

        return property;
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
