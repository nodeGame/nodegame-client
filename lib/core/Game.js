/**
 * # Game
 * Copyright(c) 2021 Stefano Balietti <ste@nodegame.org>
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
        GameMsg = parent.GameMsg,
        GameDB = parent.GameDB,
        GamePlot = parent.GamePlot,
        PlayerList = parent.PlayerList,
        Stager = parent.Stager,
        PushManager = parent.PushManager,
        SizeManager = parent.SizeManager,
        MatcherManager = parent.MatcherManager,
        J = parent.JSUS;

    var constants = parent.constants;
    var stageLevels = constants.stageLevels;
    var stateLevels = constants.stateLevels;

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
        this.setStateLevel(stateLevels.UNINITIALIZED, 'S');
        this.setStageLevel(stageLevels.UNINITIALIZED, 'S');

        // ## Properties

        /**
         * ### Game.metadata
         *
         * The game's metadata
         *
         * This object is normally filled-in automatically with data
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
         * This object is normally filled-in automatically with the settings
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
        // // Overriding stdout for game plot and stager.
        // this.plot.setDefaultLog(function() {
        //     // Must use apply, else will be executed in the wrong context.
        //     node.log.apply(node, arguments);
        // });

        /**
         * ### Game.role
         *
         * The "role" currently held in this game (if any)
         *
         * @see Game.gotoStep
         * @see Game.setRole
         * @see processGotoStepOptions
         */
        this.role = null;

        /**
         * ### Game.partner
         *
         * The id or alias of the "partner" in this game (if any)
         *
         * Some games are played in pairs, this variable holds the id
         * of the partner player.
         *
         * @see Game.setPartner
         * @see processGotoStepOptions
         */
        this.partner = null;

        /**
         * ### Game.matcher
         *
         * Handles assigning matching tasks
         *
         * Assigns roles to players, players to players, etc.
         *
         * @see Game.gotoStep
         */
        this.matcher = MatcherManager ? new MatcherManager(this.node) : null;

        /**
         * ### Game.timer
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

        // Setting to stage 0.0.0 and starting.
        this.setCurrentGameStage(new GameStage(), 'S');
        this.setStateLevel(stateLevels.STARTING, 'S');

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
        this.pauseCounter = 0;

        /**
         * ### Game.willBeDone
         *
         * TRUE, if DONE was emitted and evaluated successfully
         *
         * If TRUE, when PLAYING is emitted `node.done` is called
         * immediately, and the game tries to step forward.
         *
         * @see NodeGameClient.done
         */
        this.willBeDone = false;

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
         * @see Game.stepBack
         *
         * @api private
         */
        this._steppedSteps = [ new GameStage() ];

        /**
         * ### Game._breakStage
         *
         * Flags to break current stage at next node.done call
         *
         * @see Game.breakStage
         */
        this._breakStage = false;

        /** ### Game.pushManager
         *
         * Handles pushing client to advance to next step
         *
         * @see PushManager
         */
        this.pushManager = new PushManager(this.node);

        /** ### Game.sizeManager
         *
         * Handles changes in the number of connected players
         *
         * @see SizeManager
         */
        this.sizeManager = new SizeManager(this.node);
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
     *   - step: {boolean}. If false, jus call the init function, and
     *       does not enter the first step. Default: TRUE.
     *   - startStage: {GameStage}. If set, the game will step into
     *       the step _after_ startStage after initing. Default: 0.0.0
     *   - stepOptions: options to pass to the new step (only if step
     *       option is not FALSE).
     *
     * @see Game.step
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
            this.setStateLevel(stateLevels.INITIALIZING);
            node.emit('INIT');
            onInit.call(node.game);
        }

        this.setStateLevel(stateLevels.INITIALIZED);

        this.setCurrentGameStage(startStage, 'S');

        node.log('game started.');

        if (options.step !== false) this.step(options.stepOptions);
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
     * GameStage is set to 0.0.0 and server is notified.
     */
    Game.prototype.stop = function() {
        var node;
        if (!this.isStoppable()) {
            throw new Error('Game.stop: game cannot be stopped.');
        }

        node = this.node;

        // Destroy currently running timers.
        node.timer.destroyAllTimers(true);

        // Remove all events registered during the game.
        node.events.ee.game.clear();
        node.events.ee.stage.clear();
        node.events.ee.step.clear();

        node.socket.eraseBuffer();

        // Clear memory.
        this.memory.clear();

        // If a _GameWindow_ object is found, clears it.
        if (node.window) node.window.reset();

        // Update state/stage levels and game stage.
        this.setStateLevel(stateLevels.STARTING, 'S');
        this.setStageLevel(stageLevels.UNINITIALIZED, 'S');
        // This command is notifying the server.
        this.setCurrentGameStage(new GameStage());

        // TODO: check if we need pl and ml again.
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

        if (this.getStateLevel() >= stateLevels.FINISHING) {
            node.warn('Game.gameover called on a finishing game.');
            return;
        }

        node.emit('GAME_ALMOST_OVER');

        // Call gameover callback, if it exists.
        onGameover = this.plot.stager.getOnGameover();
        if (onGameover) {
            this.setStateLevel(stateLevels.FINISHING);
            onGameover.call(node.game);
        }

        this.setStateLevel(stateLevels.GAMEOVER);
        this.setStageLevel(stageLevels.DONE);

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
     * The game can step forward if:
     *
     *   - There is the "right" number of players.
     *   - The game has been initialized, and is not in GAME_OVER.
     *   - The stepRule function for current step and returns TRUE.
     *
     * @param {number} stageLevel Optional. If set, it is used instead
     *   of `Game.getStageLevel()`
     *
     * @return {boolean} TRUE, if stepping is allowed.
     *
     * @see Game.step
     * @see SizeManager.checkSize
     * @see stepRules
     */
    Game.prototype.shouldStep = function(stageLevel) {
        var stepRule, curStep;

        if (!this.sizeManager.checkSize() || !this.isSteppable()) return false;

        curStep = this.getCurrentGameStage();
        stepRule = this.plot.getStepRule(curStep);

        if ('function' !== typeof stepRule) {
            throw new TypeError('Game.shouldStep: stepRule must be function. ' +
                                'Found: ' + stepRule);
        }

        stageLevel = stageLevel || this.getStageLevel();
        return stepRule(curStep, stageLevel, this.pl, this);
    };

    /**
     * ### Game.breakStage
     *
     * Sets/Removes a flag to break current stage
     *
     * If the flag is set, when node.done() is invoked, the game will
     * step into the next stage instead of into the next step.
     *
     * @param {boolean} doBreak Optional. TRUE to set the flag, FALSE to
     *   remove it, or undefined to just get returned the current value.
     *
     * @return {boolean} The value of the flag before it is overwritten
     *   by current call.
     *
     * @see Game._breakStage
     * @see Game.gotoStep
     */
    Game.prototype.breakStage = function(doBreak) {
        var b;
        b = this._breakStage;
        if ('undefined' !== typeof doBreak) this._breakStage = !!doBreak;
        return b;
    };

    /**
     * ### Game.stepBack
     *
     * Executes the previous stage / step
     *
     * Important! This function should be used only with the appropriate
     * syncStepping settings and step rules. For more info see:
     *
     *   https://github.com/nodeGame/nodegame/wiki/BackButton-Widget-v5
     *
     * @param {object} options Optional. Options passed to
     *   `getPreviousStep` and later `gotoStep`
     *
     * @return {boolean} FALSE, if the execution encountered an error
     *
     * @see Game.getPreviousStep
     * @see Game.gotoStep
     */
    Game.prototype.stepBack = function(options) {
        var prevStep;
        prevStep = this.getPreviousStep(1, options);
        if (!prevStep) return false;
        // Update the array of stepped steps before we go back
        // so that game.getPreviousStep() keeps working correctly.
        // We need to remove current step, as well as previous, which is
        // about to be re-added.
        this._steppedSteps.splice(this._steppedSteps.length - 2, 2);
        return this.gotoStep(prevStep, options);
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
     * @see Game.breakStage
     */
    Game.prototype.step = function(options) {
        var curStep, nextStep;
        curStep = this.getCurrentGameStage();
        // Gets current value and sets breakStage flag in one call.
        if (this.breakStage(false)) nextStep = this.plot.nextStage(curStep);
        else nextStep = this.plot.next(curStep);
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
     * @return {boolean|null} TRUE, if the step is found and it is executed;
     *   FALSE, if the step is not found or can't be executed; NULL, if
     *   we reached the end of the game sequence or it is game over.
     *
     * @see Game.execStep
     * @see PushManager.clearTimer
     * @see MatcherManager.match
     *
     * @emit STEPPING
     */
    Game.prototype.gotoStep = function(nextStep, options) {
        var node, tmp;

        // Steps references.
        var curStep, curStageObj, nextStepObj, nextStageObj;

        // Flags that we need to execute the stage init function.
        var stageInit;

        // Step init callback.
        var stepInitCb;

        // Variable related to matching roles and partners.
        var matcherOptions, matches, role, partner;
        var i, len, pid;

        // Sent to every client (if syncStepping and if necessary).
        var remoteOptions;

        // Value of exit cb for a step.
        var curStepExitCb;

        if (!this.isSteppable()) {
            throw new Error('Game.gotoStep: game cannot be stepped');
        }

        if ('string' !== typeof nextStep && 'object' !== typeof nextStep) {
            throw new TypeError('Game.gotoStep: nextStep must be ' +
                                'a object or a string. Found: ' + nextStep);
        }

        if (options && 'object' !== typeof options) {
            throw new TypeError('Game.gotoStep: options must be object or ' +
                                'undefined. Found: ' + options);
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

        curStep = this.getCurrentGameStage();
        curStageObj = this.plot.getStage(curStep);
        // We need to call getProperty because getStep does not mixin tmpCache.
        // We do not lookup into the stage.
        curStepExitCb = this.plot.getProperty(curStep, 'exit',
                                              null, { stage: true });

        // Clear the cache of temporary changes to steps.
        this.plot.tmpCache.clear();

        // By default socket journal is off and cleared.
        // Need to do it before setup messages are send to clients.
        if (node.socket.journalOn) {
            node.socket.journalOn = false;
            node.socket.journal.clear();
        }

        // Sends start / step command to connected clients if option is on.
        if (this.plot.getProperty(nextStep, 'syncStepping')) {

            matcherOptions = this.plot.getProperty(nextStep, 'matcher');

            if (matcherOptions && 'object' === typeof matcherOptions) {

                // matches = [
                //             {
                //               id: 'playerId',
                //               options: {
                //                  role: "A", // Optional.
                //                  partner: "XXX", // Optional.
                //               }
                //             },
                //             ...
                //           ];
                //
                matches = this.matcher.match(matcherOptions);
                i = -1, len = matches.length;
                for ( ; ++i < len ; ) {
                    pid = matches[i].id;
                    // TODO: Allow a more general modification of plot obj
                    // in remote clients via a new callback, e.g. remoteOptions.
                    remoteOptions = { plot: matches[i].options };

                    if (curStep.stage === 0) {
                        node.remoteCommand('start', pid, {
                            stepOptions: remoteOptions
                        });
                    }
                    else {
                        remoteOptions.targetStep = nextStep;
                        node.remoteCommand('goto_step', pid, remoteOptions);
                    }
                }
            }
            else {

                if (true === matcherOptions) {
                    remoteOptions = { plot: { role: true, partner: true }};
                }

                if (curStep.stage === 0) {
                    // Note: Game.start looks for the stepOptions property
                    // and passes it Game.step.
                    node.remoteCommand('start', 'ROOM', {
                        stepOptions: remoteOptions
                    });
                }
                else {
                    // Note: 'goto_step' listeners extract the targetStep
                    // property from object if payload is not the targetStep
                    // itself (string|GameStage).
                    if (!remoteOptions) remoteOptions = nextStep;
                    else remoteOptions.targetStep = nextStep;
                    node.remoteCommand('goto_step', 'ROOM', remoteOptions);
                }

                // this.matcher.clear();
            }
        }

        // Calling exit function of the step.
        if (curStepExitCb) {
            this.setStateLevel(stateLevels.STEP_EXIT);
            this.setStageLevel(stageLevels.EXITING);

            curStepExitCb.call(this);
        }

        // Listeners from previous step are cleared (must be done after exit).
        node.events.ee.step.clear();

        // Emit buffered messages.
        if (node.socket.shouldClearBuffer()) {
            node.socket.clearBuffer();
        }

        // Destroy timers created in current step.
        node.timer.destroyStepTimers();

        // String STEP.

        if ('string' === typeof nextStep) {

            // TODO: see if we can avoid code duplication below.
            // Calling exit function of the stage.
            // Note: stage.exit is not inherited.
            if (curStageObj && curStageObj.exit) {
                this.setStateLevel(stateLevels.STAGE_EXIT);
                this.setStageLevel(stageLevels.EXITING);

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
            // Was:
            // else do nothing
            // return null;
            else {
                // Try to resolve game stage.
                tmp = this.plot.normalizeGameStage(nextStep);
                if (!nextStep) {
                    throw new Error('Game.gotoStep: could not resolve step: ' +
                                    nextStep);
                }
                nextStep = tmp;
                tmp = null;
            }
        }

        // Here we start processing the new STEP.

        // TODO maybe update also in case of string.
        node.emit('STEPPING', curStep, nextStep);

        // Check for stage/step existence:
        nextStageObj = this.plot.getStage(nextStep);
        if (!nextStageObj) return false;
        nextStepObj = this.plot.getStep(nextStep);
        if (!nextStepObj) return false;

        // If we enter a new stage we need to update a few things.
        if (!curStageObj || nextStageObj.id !== curStageObj.id) {

            // Calling exit function.
            // Note: stage.exit is not inherited.
            if (curStageObj && curStageObj.exit) {
                this.setStateLevel(stateLevels.STAGE_EXIT);
                this.setStageLevel(stageLevels.EXITING);

                curStageObj.exit.call(this);
            }

            // Destroy timers created in current stage.
            node.timer.destroyStageTimers();

            // Mark stage init.
            stageInit = true;
        }

        // stageLevel needs to be changed (silent), otherwise it stays
        // DONE for a short time in the new game stage:
        this.setStageLevel(stageLevels.UNINITIALIZED, 'S');
        this.setCurrentGameStage(nextStep);

        // Process options before calling any init function. Sets a role also.
        if ('object' === typeof options) {
            processGotoStepOptions(this, options);
        }
        else if (options) {
            throw new TypeError('Game.gotoStep: options must be object ' +
                                'or undefined. Found: ' +  options);
        }

        // Properties `role` and `partner` might have been specified
        // in the options, processed by processGotoStepOptions and
        // inserted in the plot, or be already in the plot.
        role = this.plot.getProperty(nextStep, 'role');

        if (role === true) {
            role = this.role;
            if (!role) {
                throw new Error('Game.gotoStep: "role" is true, but no ' +
                                'previous role is found in step ' + nextStep);
            }
        }
        else {
            if (!role) role = null;
            else if ('function' === typeof role) role = role.call(this);

            if (role === null && this.getProperty('roles') !== null) {
                throw new Error('Game.gotoStep: "role" is null, but "roles" ' +
                                'are found in step ' + nextStep);
            }
        }
        // Overwrites step properties if a role is set.
        this.setRole(role, true);

        partner = this.plot.getProperty(nextStep, 'partner');
        if (!partner) partner = null;
        else if (partner === true) partner = this.partner;
        else if ('function' === typeof partner) partner = partner.call(this);
        this.setPartner(partner, true);

        if (stageInit) {
            // Store time.
            node.timer.setTimestamp('stage', (new Date()).getTime());

            // Clear the previous stage listeners.
            node.events.ee.stage.clear();

            this.setStateLevel(stateLevels.STAGE_INIT);
            this.setStageLevel(stageLevels.INITIALIZING);

            // Execute the init function of the stage, if any:
            // Note: this property is not inherited.
            if (nextStageObj.hasOwnProperty('init')) {
                nextStageObj.init.call(node.game);
            }
        }

        // Important! Cannot use: nextStepObj.init because
        // a role might have changed the init function, or
        // there might be a default property (setDefaultProperty).
        // We are the skipping the stage.init property.
        stepInitCb = this.plot.getProperty(nextStep, 'init',
                                           null, { stage: true });

        // Execute the init function of the step, if any.
        if (stepInitCb) {
            this.setStateLevel(stateLevels.STEP_INIT);
            this.setStageLevel(stageLevels.INITIALIZING);
            stepInitCb.call(node.game);
        }

        this.setStateLevel(stateLevels.PLAYING_STEP);
        this.setStageLevel(stageLevels.INITIALIZED);

        // Updating the globals object.
        this.updateGlobals(nextStep);

        // Reads Min/Max/Exact Players properties.
        this.sizeManager.init(nextStep);

        // Emit buffered messages.
        if (node.socket.shouldClearBuffer()) node.socket.clearBuffer();

        // Update list of stepped steps.
        this._steppedSteps.push(nextStep);

        // TODO: check if here is right place, or better in execStep.
        // If reconnect is TRUE we save a copy of  all messages sent to clients.
        // Note: the journal is active only if Game.isReady is true.
        if (this.plot.getProperty(nextStep, 'reconnect') === true) {
            node.socket.journalOn = true;
        }

        // If we should be done now, we emit PLAYING without executing the step.
        // node.game.willBeDone is already set, and will trigger node.done().
        if (this.beDone) node.emit('PLAYING');
        else this.execStep(this.getCurrentGameStage());

        return true;
    };

    /**
     * ### Game.execStep
     *
     * Executes the specified stage object
     *
     * @param {GameStage} step Step to execute
     */
    Game.prototype.execStep = function(step) {
        var cb, origCb;
        var widget, widgetObj, widgetRoot;
        var widgetCb, widgetExit, widgetDone;
        var doneCb, origDoneCb, exitCb, origExitCb;
        var w, frame, uri, frameOptions, frameAutoParse, reloadFrame;

        if ('object' !== typeof step) {
            throw new TypeError('Game.execStep: step must be object. Found: ' +
                                step);
        }

        cb = this.plot.getProperty(step, 'cb');
        frame = this.plot.getProperty(step, 'frame');
        widget = this.plot.getProperty(step, 'widget');

        if (widget) {
            // Mark that it is a widget step.
            this.widgetStep = true;

            // Parse input params. // TODO: throws errors.
            if ('string' === typeof widget) widget = { name: widget };
            if ('string' !== typeof widget.id) {
                widget.id = 'ng_step_widget_' + widget.name;
            }
            if (!widget.ref) {
                widget.ref = widget.name.toLowerCase();
                // Make sure it is unique.
                if (this[widget.ref]) {
                    widget.ref = J.uniqueKey(this, widget.ref);
                }
            }

            // Add options, if missing.
            // User can specify the options in a nested object, or flat them
            // down in case there are no conflicts.
            if (!widget.options) widget.options = widget;

            // Make main callback to get/append the widget.
            widgetCb = function() {

                if (widget.append === false) {
                    widgetObj = this.node.widgets.get(widget.name,
                                                      widget.options);
                }
                else {
                    // Default class.
                    if (!widget.options.className) {
                        widget.options.className = 'centered';
                    }
                    widget.options.widgetStep = true;

                    // Default id 'container' (as in default.html).
                    if ('string' === typeof widget.root) {
                        widgetRoot = widget.root;
                    }
                    else if ('undefined' !== typeof widget.root) {
                        throw new TypeError('Game.execStep: widget.root must ' +
                                            'be string or undefined. Found: ' +
                                            widget.root);
                    }
                    else {
                        widgetRoot = 'container';
                    }
                    // If widgetRoot is not existing, it follows the
                    // default procedure for appending a widget.
                    widgetRoot =  W.getElementById(widgetRoot);
                    widgetObj = this.node.widgets.append(widget.name,
                                                         widgetRoot,
                                                         widget.options);
                }
                node.game[widget.ref] = widgetObj;
            };

            // Make the step callback.
            // Notice: This works with roles also.
            if (cb) {
                origCb = cb;
                cb = function() {
                    widgetCb.call(this);
                    origCb.call(this);
                };
            }
            else {
                cb = widgetCb;
            }

            // Make the done callback to send results.
            widgetDone = function() {
                var values, opts;
                // TODO: harmonize: required or checkValues?
                if (widgetObj.required && widget.checkValues !== false) {
                    opts = { highlight: true, markAttempt: true };
                }
                else {
                    opts = { highlight: false, markAttempt: false };
                }
                // Under some special conditions (e.g., very fast DONE
                // clicking this can be null. TODO: check why.
                // Changed from this[widget.ref] to widgetObj.
                values = widgetObj.getValues(opts);

                // If it is not timeup, and user did not
                // disabled it, check answers.
                if (widgetObj.required && widget.checkValues !== false &&
                    !node.game.timer.isTimeup()) {

                    // Widget must return some values (otherwise it
                    // is impossible to check if the values are OK).
                    if (values &&
                        // TODO: check whether it is fine to comment out
                        // the checks on missValues. We should rely only
                        // on isCorrect, but some widgets might be outdated.
                        // (values.missValues === true ||
                        // (values.missValues && values.missValues.length) ||
                        (values.choice === null ||
                        values.isCorrect === false)) {


                        if (values._scrolledIntoView !== true &&
                            'function' === typeof
                            widgetObj.bodyDiv.scrollIntoView) {

                                widgetObj.bodyDiv.scrollIntoView({
                                    behavior: 'smooth'
                                });

                            // TODO: delete _scrolledIntoView ?
                        }

                        return false;
                    }
                }

                return values;
            };
            doneCb = this.plot.getProperty(step, 'done');
            if (doneCb) {
                origDoneCb = doneCb;
                doneCb = function() {
                    var values, valuesCb;
                    values = widgetDone.call(this);
                    if (values !== false) {
                        valuesCb = origDoneCb.call(this, values);
                        // Standard DONE callback behavior (to modify objects).
                        if ('undefined' !== typeof valuesCb) {
                            values = valuesCb;
                        }
                    }
                    return values;
                };
            }
            else {
                doneCb = widgetDone;
            }

            // Update the exit function for this step.
            this.plot.tmpCache('done', doneCb);

            // Make the exit callback (destroy widget by default).
            if (widget.destroyOnExit !== false) {
                widgetExit = function() {
                    this[widget.ref].destroy();
                    // Remove node.game reference.
                    this[widget.ref] = null;
                };
                // We are skipping the stage.exit property.
                exitCb = this.plot.getProperty(step, 'exit',
                                               null, { stage: true });
                if (exitCb) {
                    origExitCb = exitCb;
                    exitCb = function() {
                        widgetExit.call(this);
                        origExitCb.call(this);
                    };
                }
                else {
                    exitCb = widgetExit;
                }
                // Update the exit function for this step.
                this.plot.tmpCache('exit', exitCb);
            }

            // Sets a default frame, if none was found.
            if (widget.append !== false && !frame) {
                frame = '/pages/default.html';
            }
        }
        else {
            this.widgetStep = false;
        }

        w = this.node.window;
        // Handle frame loading natively, if required.
        if (frame) {
            frameOptions = {};
            if ('function' === typeof frame) frame = frame.call(node.game);
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
                                    'object. Found: ' + frame + '. ' +
                                    'Step: ' + step);

            }

            if (w) reloadFrame = uri !== w.unprocessedUri;
            // We reload the frame if (order matters):
            // - it is a different uri from previous step,
            // - unless frameOptions.reload is false,
            // - or it is a different stage or round.
            if (!reloadFrame) {
                if ('undefined' !== typeof frame.reload) {
                    reloadFrame = !!frame.reload;
                }
                else {
                    // Get the previously played step
                    // (-2, because current step is already inserted).
                    reloadFrame =
                        this._steppedSteps[this._steppedSteps.length-2];
                    if (reloadFrame) {
                        reloadFrame = (reloadFrame.round !== step.round ||
                                       reloadFrame.stage !== step.stage);
                    }
                    else {
                        reloadFrame = true;
                    }
                }
            }

            if (reloadFrame) {
                // Auto load frame and wrap cb.
                this.execCallback(function() {
                    this.node.window.loadFrame(uri, cb, frameOptions);
                });
            }
            else {
                // Duplicated as below.
                this.execCallback(cb);
                if (w) {
                    w.adjustFrameHeight(0, 120);
                    if (frame.scrollUp !== false) window.scrollTo(0,0);
                }
            }
        }
        else {
            // Duplicated as above.
            this.execCallback(cb);
            if (w) {
                w.adjustFrameHeight(0, 120);
                window.scrollTo(0, 0);
            }
        }
    };

    /**
     * ### Game.execCallback
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
        this.setStageLevel(stageLevels.EXECUTING_CALLBACK);

        // Execute custom callback. Can throw errors.
        res = cb.call(this.node.game);
        if (res === false) {
            // A non fatal error occurred.
            this.node.err('A non fatal error occurred in callback ' +
                          'of stage ' + this.getCurrentGameStage());
        }

        this.setStageLevel(stageLevels.CALLBACK_EXECUTED);
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
     * ### Game.getCurrentStageObj
     *
     * Returns the object representing the current game stage.
     *
     * The returning object includes all the properties, such as:
     * _id_, _init_, etc.
     *
     * @return {object} The game-stage as defined in the stager.
     *
     * @see Stager
     * @see GamePlot
     */
    Game.prototype.getCurrentStageObj = function() {
        return this.plot.getStage(this.getCurrentGameStage());
    };

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
     * The engine states are defined in `node.stateLevels`,
     * and it is of the type: STAGE_INIT, PLAYING_STEP, GAMEOVER, etc.
     * The return value is a reference to `node.player.stateLevel`.
     *
     * @return {number} The state of the engine.
     * @see node.player.stateLevel
     * @see node.stateLevels
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
     * Stage levels are defined in `node.stageLevels`, for example:
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
     * @see node.stageLevels
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
     * The execution level is defined in `node.stageLevels`,
     * and it is of the type INITIALIZED, CALLBACK_EXECUTED, etc.
     * The return value is a reference to `node.player.stageLevel`.
     *
     * @return {number} The level of the stage execution.
     * @see node.player.stageLevel
     * @see node.stageLevels
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
     * Stage levels are defined in `node.stageLevels`, for example:
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
     * @see node.stageLevels
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
        if ('string' !== typeof type) {
            throw new TypeError('Game.publishUpdate: type must be string. ' +
                                'Found: ' + type);
        }
        if (type !== 'stage' &&
            type !== 'stageLevel' &&
            type !== 'stateLevel') {

            throw new Error('Game.publishUpdate: unknown update type: ' + type);
        }
        if (this.shouldPublishUpdate(type, update)) {
            this.node.socket.send(this.node.msg.create({
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
        var myStage, levels, myPublishLevel;
        if ('string' !== typeof type) {
            throw new TypeError(
                'Game.shouldPublishUpdate: type must be string.');
        }

        myStage = this.getCurrentGameStage();
        levels = constants.publishLevels;

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
     * loaded or a DONE procedure has been started, i.e. between the
     * stage levels: PLAYING and GETTING_DONE.
     *
     * If a game is paused, it is also NOT ready.
     *
     * @see node.stageLevels
     */
    Game.prototype.isReady = function() {
        var stageLevel, stateLevel;

        if (this.paused) return false;

        stateLevel = this.getStateLevel();

        switch (stateLevel) {
        case stateLevels.UNINITIALIZED:
        case stateLevels.INITIALIZING:
        case stateLevels.STAGE_INIT:
        case stateLevels.STEP_INIT:
        case stateLevels.FINISHING:
        case stateLevels.STAGE_EXIT:
        case stateLevels.STEP_EXIT:
            return false;

        case stateLevels.PLAYING_STEP:

            stageLevel = this.getStageLevel();
            switch (stageLevel) {
            case stageLevels.EXECUTING_CALLBACK:
            case stageLevels.CALLBACK_EXECUTED:
            case stageLevels.PAUSING:
            case stageLevels.RESUMING:
            case stageLevels.GETTING_DONE:
            // TODO: should this be commented? See issue #168
            // case stageLevels.DONE:
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
            this.getStateLevel() < stateLevels.INITIALIZING;
    };


    /**
     * ### Game.isStoppable
     *
     * Returns TRUE if Game.stop can be called
     *
     * @return {boolean} TRUE if the game can be stopped.
     */
    Game.prototype.isStoppable = function() {
        return this.getStateLevel() > stateLevels.INITIALIZING;
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
            this.getStateLevel() > stateLevels.INITIALIZING;
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
            this.getStateLevel() > stateLevels.INITIALIZING;
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

        return stateLevel > stateLevels.INITIALIZING &&
            stateLevel < stateLevels.FINISHING;
    };

    /**
     * ### Game.isGameover
     *
     * Returns TRUE if gameover was called and state level set
     *
     * @return {boolean} TRUE if is game over
     */
    Game.prototype.isGameover = Game.prototype.isGameOver = function() {
        return this.getStateLevel() === stateLevels.GAMEOVER;
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
     *
     * @return {boolean} TRUE, if the PLAYING event should be emitted.
     *
     * @see SizeManager.checkSize
     */
    Game.prototype.shouldEmitPlaying = function(strict) {
        var curGameStage, curStageLevel, syncOnLoaded, node;
        if ('undefined' === typeof strict || strict) {
            // Should emit PLAYING only after LOADED.
            curStageLevel = this.getStageLevel();
            if (curStageLevel !== stageLevels.LOADED) return false;
        }
        node = this.node;
        curGameStage = this.getCurrentGameStage();
        if (!this.isReady()) return false;
        if (!this.sizeManager.checkSize()) return false;

        // `syncOnLoaded` forces clients to wait for all the others to be
        // fully loaded before releasing the control of the screen to the
        // players. This introduces a little overhead in
        // communications and delay in the execution of a stage. It is
        // not necessary in local networks, and it is FALSE by default.
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
     * @param {bolean|object} opts Optional. A configuration object accepting
     *   the following options:
     *
     *      - acrossStages: if FALSE, if the previous step belongs to another
     *          stage, it returns NULL. Default: TRUE.
     *      - acrossRounds: if FALSE, if the previous step belongs to another
     *          round, it returns NULL. Default: TRUE.
     *      - noZeroStep: if TRUE, replaces return value 0.0.0 with NULL.
     *          Default: FALSE.
     *      - execLoops If TRUE, loop and doLoop conditional functions are
     *          executed to determine the previous step. If FALSE, if a loop
     *          or doLoop is found, it returns NULL. Note! This option is
     *          evaluated only if no step is found in the cache. Default: TRUE
     *
     *   Note: for backward compatibility, if this parameter is a boolean,
     *   it will be treated as option execLoops.
     *
     * @return {GameStage|null} The game-stage played delta steps ago,
     *   null if an error occurred (e.g., a loop stage), or stage 0.0.0 for
     *   all deltas > steppable steps (i.e., previous of 0.0.0 is 0.0.0).
     *
     * @see Game._steppedSteps
     * @see GamePlot.jump
     */
    Game.prototype.getPreviousStep = function(delta, opts) {
        var len, curStep, prevStep, execLoops;
        delta = delta || 1;
        if ('number' !== typeof delta || delta < 1) {
            throw new TypeError('Game.getPreviousStep: delta must be a ' +
                                'positive number or undefined. Found: ' +
                                delta);
        }
        len = this._steppedSteps.length - delta - 1;
        // In position 0 there is 0.0.0, which is added also in case
        // of a reconnection.
        if (len > 0) {
            prevStep = this._steppedSteps[len];
        }
        else {
            // It is possible that it is a reconnection, so we are missing
            // stepped steps. Let's do a deeper lookup.
            if ('boolean' === typeof opts) execLoops = opts;
            prevStep = this.plot.jump(this.getCurrentGameStage(),
                                      -delta, execLoops);
        }
        // Additional checks might be needed.
        if ('object' === typeof opts) {
            curStep = node.game.getCurrentGameStage();
            if (opts.acrossStages === false &&
                (curStep.stage !== prevStep.stage)) {

                return null;
            }
            if (opts.acrossRounds === false &&
                (curStep.round !== prevStep.round)) {

                return null;
            }
            if (opts.noZeroStep && prevStep.stage === 0) return null;

        }
        return prevStep;
        // For future reference, why is this complicated:
        // - Server could store all stepped steps and send them back
        //     upon reconnection, but it would miss steps stepped while client
        //     was disconnected.
        // - Server could send all steps stepped by logic, but it would not
        //     work if syncStepping is disabled.
        // TODO: Maybe the sequence of prev steps should be precomputed?
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
     * @param {mixed} nf Optional. The return value in case the
     *   requested property is not found. Default: null.
     *
     * @return {mixed} The value of the requested step property
     *
     * @see GamePlot.getProperty
     */
    Game.prototype.getProperty = function(prop, nf) {
        return this.plot.getProperty(this.getCurrentGameStage(), prop, nf);
    };

    /**
    * ### Game.getStageId
    *
    * Returns the id of current stage, or of another user-specified stage
    *
    * @param {object} stage Optional. A GameStage object. Default: current
    *     game stage.
    *
    * @return {string|null} The id of (current) stage, or NULL if not found
    *
    * @see GamePlot.getStage
    */
    Game.prototype.getStageId = function(stage) {
        stage = this.plot.getStage(stage || this.getCurrentGameStage());
        return stage ? stage.id : null;
    };

    /**
    * ### Game.getStepId
    *
    * Returns the id of current step, or of another user-specified stage
    *
    * @param {object} stage Optional. A GameStage object. Default: current
    *     game stage.
    *
    * @return {string|null} The id of (current) step, or NULL if not found
    *
    * @see GamePlot.getStage
    */
    Game.prototype.getStepId = function(stage) {
        stage = this.plot.getStep(stage || this.getCurrentGameStage());
        return stage ? stage.id : null;
    };

    /**
    * ### Game.getRound
    *
    * Returns the current/remaining/past/total round number in current stage
    *
    * @param {string} mod Optional. Modifies the return value.
    *
    *   - 'current': current round number (default)
    *   - 'total': total number of rounds
    *   - 'remaining': number of rounds remaining (excluding current round)
    *   - 'past': number of rounds already past  (excluding current round)
    *
    * @return {number|null} The requested information, or null if
    *   the number of rounds is not known (e.g. if the stage is a loop)
    *
    * @see GamePlot.getRound
    */
    Game.prototype.getRound = function(mod) {
        return this.plot.getRound(this.getCurrentGameStage(), mod);
    };

    /**
    * ### Game.isStage
    *
    * Returns TRUE if current stage matches input parameter
    *
    * Steps and rounds aer not considered.
    *
    * @param {string|GameStage|number} stage The name of the stage, its
    *    ordinal position in the game sequence, or its object
    *    representation. If string, the object is resolved
    *    with GamePlot.normalizeGameStage
    * @param {GameStage} compareStage The stage to compare against.
    *    Default: current game stage.
    *
    * @return {boolean} TRUE if current stage matches input parameter
    *
    * @see GamePlot.normalizeGameStage
    * @see Game.getCurrentGameStage
    */
    Game.prototype.isStage = function(stage, compareStage) {
        var s;
        if (compareStage) {
            if ('object' === typeof compareStage) {
                s = compareStage.stage;
            }
            else {
                throw new TypeError('Game.isStage: compareStage must be ' +
                                    'object or undefined. Found: ' +
                                    compareStage);
            }
        }
        else {
            s = this.getCurrentGameStage().stage;
        }
        if ('number' === typeof stage) return stage === s;
        stage = this.plot.normalizeGameStage(stage);
        return !!(stage && stage.stage === s);
    };

    /**
    * ### Game.isStep
    *
    * Returns TRUE if current step matches input parameter
    *
    * Behavior changes depending on type of input parameter:
    *
    *   - number: only the ordinal position in the game stage is matched
    *   - object|string: the stage and the step are matched
    *
    * @param {string|GameStage|number} step The name of the step, its
    *    ordinal position in the game stage, or its object
    *    representation. If string, the object is resolved
    *    with GamePlot.normalizeGameStage
    * @param {GameStage} compareStage The stage to compare against.
    *    Default: current game stage.
    *
    * @return {boolean} TRUE if current step matches input parameter
    *
    * @see GamePlot.normalizeGameStage
    */
    Game.prototype.isStep = function(step, compareStage) {
        var s;
        if (compareStage) {
            if ('object' === typeof compareStage) {
                s = compareStage.step;
            }
            else {
                throw new TypeError('Game.isStep: compareStage must be ' +
                                    'object or undefined. Found: ' +
                                    compareStage);
            }
        }
        else {
            s = this.getCurrentGameStage().step;
        }
        if ('number' === typeof step) return step === s;
        // Add the current stage id for normalization if no stage is provided.
        if (step.lastIndexOf('.') === -1) {
            step = this.getStageId(compareStage) + '.' + step;
        }
        step = this.plot.normalizeGameStage(step);
        return !!(step && step.step === s);
    };

    /**
    * ### Game.isRound
    *
    * Returns TRUE if current step matches input parameter
    *
    * Behavior changes depending on type of input parameter:
    *
    *   - number: only the ordinal position in the game stage is matched
    *   - object: the stage and the step are matched
    *
    * @param {GameStage|number} round The round number or its object
    *    representation. If object, it is resolved
    *    with GamePlot.normalizeGameStage
    *
    * @return {boolean} TRUE if current step matches input parameter
    *
    * @see GamePlot.normalizeGameStage
    */
    Game.prototype.isRound = function(round) {
        var r;
        r = this.getRound();
        if ('number' === typeof round) return round === r;
        round = this.plot.normalizeGameStage(round);
        return !!(round && round.round === r);
    };

    /**
    * ### Game.isWidgetStep
    *
    * Returns TRUE if current step is a widget step
    *
    * @return {boolean} TRUE if current step is a widget step
    *
    * @see GamePlot.widgetStep
    * @see GamePlot.execStep
    */
    Game.prototype.isWidgetStep = function() {
        return this.widgetStep;
    };

    /**
     * ### Game.setRole
     *
     * Sets the current role in the game
     *
     * When a role is set, all the properties of a role overwrite
     * the current step properties.
     *
     * Roles are not supposed to be set more than once per step, and
     * an error will be thrown on attempts to overwrite roles.
     *
     * Updates the reference also in `node.player.role`.
     *
     * @param {string|null} role The name of the role
     * @param {boolean} force Optional. If TRUE, role can be overwritten
     *
     * @see Game.role
     * @see Player.role
     */
    Game.prototype.setRole = function(role, force) {
        var roles, roleObj, prop;
        if ('string' === typeof role && role.trim() !== '') {
            if (this.role && !force) {
                throw new Error('Game.setRole: attempt to change role "' +
                                this.role + '" to "' + role + '" in step: ' +
                                this.getCurrentGameStage());
            }
            roles = this.getProperty('roles');
            if (!roles) {
                throw new Error('Game.setRole: trying to set role "' +
                                role + '", but \'roles\' not found in ' +
                                'current step: ' +
                                this.getCurrentGameStage());
            }
            roleObj = roles[role];
            if (!roleObj) {
                throw new Error('Game.setRole: role "' + role +
                                '" not found in current step: ' +
                                this.getCurrentGameStage());
            }

            // Modify plot properties.
            for (prop in roleObj) {
                if (roleObj.hasOwnProperty(prop)) {
                    this.plot.tmpCache(prop, roleObj[prop]);
                }
            }

        }
        else if (role !== null) {
            throw new TypeError('Game.setRole: role must be string or null. ' +
                                'Found: ' + role);
        }
        this.role = role;
        this.node.player.role = role;
    };

    /**
     * ### Game.getRole
     *
     * Returns the current role in the game
     *
     * @see Game.role
     * @see Player.role
     */
    Game.prototype.getRole = function() {
        return this.role;
    };

    /**
     * ### Game.setPartner
     *
     * Sets the current partner in the game
     *
     * Partners are not supposed to be set more than once per step, and
     * an error will be thrown on attempts to overwrite them.
     *
     * Updates the reference also in `node.player.partner`.
     *
     * @param {string|null} partner The id or alias of the partner
     * @param {boolean} force Optional. If TRUE, partner can be overwritten
     *
     * @see Game.partner
     * @see Player.partner
     */
    Game.prototype.setPartner = function(partner, force) {
        if ('string' === typeof partner && partner.trim() !== '') {
            if (this.partner && !force) {
                throw new Error('Game.setPartner: attempt to change partner "' +
                                this.partner + '" to "' + partner +
                                '" in step: ' + this.getCurrentGameStage());
            }
        }
        else if (partner !== null) {
            throw new TypeError('Game.setPartner: partner must be a ' +
                                'non-empty string or null. Found: ' + partner);
        }
        this.partner = partner;
        this.node.player.partner = partner;
    };

    /**
     * ### Game.getPartner
     *
     * Returns the current partner in the game
     *
     * @see Game.partner
     * @see Player.partner
     */
    Game.prototype.getPartner = function() {
        return this.partner;
    };

    // ## Helper Methods

    /**
     * ### processGoToStepOptions
     *
     * Process options before executing the init functions of stage/steps
     *
     * Valid options:
     *
     *   - willBeDone: game will be done after loading the frame and executing
     *       the step callback function,
     *   - beDone: game is done without loading the frame or
     *       executing the step callback function,
     *   - plot: add entries to the tmpCache of the plot,
     *   - msgs: incoming messages to emit.
     *   - cb: a callback executed with the game context, and with options
     *       object itself as parameter
     *
     * @param {Game} game The game instance
     * @param {object} options The options to process
     *
     * @see Game.gotoStep
     * @see GamePlot.tmpCache
     * @see Game.willBeDone
     * @see Game.beDone
     */
    function processGotoStepOptions(game, options) {
        var prop;

        // Be done.. now! Skips Game.execStep.
        if (options.beDone) {
            game.willBeDone = true;
            game.beDone = true;
        }
        else if (options.willBeDone) {
            // TODO: why not setting willBeDone? It was not working, check!
            // Call node.done() immediately after PLAYING is emitted.
            game.node.once('PLAYING', function() {
                game.node.done();
            });
        }

        // Temporarily modify plot properties.
        // Must be done after setting the role.
        if (options.plot) {
            for (prop in options.plot) {
                if (options.plot.hasOwnProperty(prop)) {
                    game.plot.tmpCache(prop, options.plot[prop]);
                }
            }
        }

        if (options.msgs) {
            options.msgs.foreach(function(msg) {
                game.node.socket.onMessage(new GameMsg(msg).toInEvent(), msg);
            });
        }

        // TODO: rename cb.
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

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
