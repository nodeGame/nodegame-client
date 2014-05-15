/**
 * # Listeners for incoming messages.
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 * 
 * Internal listeners are not directly associated to messages,
 * but they are usually responding to internal nodeGame events,
 * such as progressing in the loading chain, or finishing a game stage.
 * ---
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var GameMsg = parent.GameMsg,
    GameStage = parent.GameStage,
    PlayerList = parent.PlayerList,
    Player = parent.Player,
    J = parent.JSUS,
    constants = parent.constants;

    var action = constants.action,
        target = constants.target,
        stageLevels = constants.stageLevels;

    var say = action.SAY + '.',
    set = action.SET + '.',
    get = action.GET + '.',
    OUT = constants.OUT;

    var gcommands = constants.gamecommands;
    var CMD = 'NODEGAME_GAMECOMMAND_';

    /**
     * ## NodeGameClient.addDefaultInternalListeners
     *
     * Adds a battery of event listeners for internal events
     *
     * If executed once, it requires a force flag to re-add the listeners.
     *
     * @param {boolean} TRUE, to force re-adding the listeners
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultInternalListeners = function(force) {
        var node = this;
        if (this.internalAdded && !force) {
            this.err('Default internal listeners already added once. ' +
                     'Use the force flag to re-add.');
            return false;
        }

        function done() {
            node.game.willBeDone = false;
            node.emit('REALLY_DONE');
            node.game.setStageLevel(stageLevels.DONE);
            // Step forward, if allowed.
            if (node.game.shouldStep()) {
                node.game.step();
            }
        }

        /**
         * ## DONE
         *
         * Registers the stageLevel _DONE_ and eventually steps forward.
         *
         * If a DONE handler is defined in the game-plot, it will execute it. 
         * In case it returns FALSE, the update process is stopped.
         *
         * @emit REALLY_DONE
         */
        this.events.ng.on('DONE', function() {
            // Execute done handler before updating stage.
            var ok, doneCb, stageLevel;
            ok = true;
            doneCb = node.game.plot.getProperty(node.game.getCurrentGameStage(),
                                                'done');

            if (doneCb) ok = doneCb.apply(node.game, arguments);
            if (!ok) return;
                   
            stageLevel = node.game.getStageLevel();

            if (stageLevel >= stageLevels.PLAYING) {
                done();
            }
            else {
                node.game.willBeDone = true;
            }

        });

        /**
         * ## STEP_CALLBACK_EXECUTED
         *
         * @emit LOADED
         */
        this.events.ng.on('STEP_CALLBACK_EXECUTED', function() {
            if (!node.window || node.window.isReady()) {
                node.emit('LOADED');
            }
        });

        /**
         * ## WINDOW_LOADED
         *
         * @emit LOADED
         */
        this.events.ng.on('WINDOW_LOADED', function() {
            var stageLevel;
            stageLevel = node.game.getStageLevel();
            if (stageLevel >= stageLevels.CALLBACK_EXECUTED) {
                node.emit('LOADED');
            }
        });

        /**
         * ## LOADED
         *
         * @emit PLAYING
         */
        this.events.ng.on('LOADED', function() {
            node.game.setStageLevel(constants.stageLevels.LOADED);
            if (node.socket.shouldClearBuffer()) {
                node.socket.clearBuffer();
            }
            if (node.game.shouldEmitPlaying()) {
                node.emit('PLAYING');
            }
        });

        /**
         * ## PLAYING
         *
         * @emit BEFORE_PLAYING
         */
        this.events.ng.on('PLAYING', function() {
            var currentTime;
            node.game.setStageLevel(stageLevels.PLAYING);
            node.socket.clearBuffer();
            node.emit('BEFORE_PLAYING');
            // Last thing to do, is to store time:
            currentTime = (new Date()).getTime();
            node.timer.setTimestamp(node.game.getCurrentGameStage().toString(),
                                    currentTime);
            node.timer.setTimestamp('step', currentTime);
            
            // DONE was previously emitted, we just execute done handler.
            if (node.game.willBeDone) {
                done();
            }
            
        });

        /**
         * ## NODEGAME_GAMECOMMAND: start
         *
         */
        this.events.ng.on(CMD + gcommands.start, function(options) {
            if (!node.game.isStartable()) {
                node.err('Game cannot be started.');
                return;
            }
            
            node.emit('BEFORE_GAMECOMMAND', gcommands.start, options);
            node.game.start(options);
        });

        /**
         * ## NODEGAME_GAMECMD: pause
         *
         */
        this.events.ng.on(CMD + gcommands.pause, function(options) {
            if (!node.game.isPausable()) {
                node.err('Game cannot be paused.');
                return;
            }

            node.emit('BEFORE_GAMECOMMAND', gcommands.pause, options);
            node.game.pause();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: resume
         *
         */
        this.events.ng.on(CMD + gcommands.resume, function(options) {
            if (!node.game.isResumable()) {
                node.err('Game cannot be resumed.');
                return;
            }

            node.emit('BEFORE_GAMECOMMAND', gcommands.resume, options);
            node.game.resume();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: step
         *
         */
        this.events.ng.on(CMD + gcommands.step, function(options) {
            if (!node.game.isSteppable()) {
                node.err('Game cannot be stepped.');
                return;
            }

            node.emit('BEFORE_GAMECOMMAND', gcommands.step, options);
            node.game.step();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: stop
         *
         */
        this.events.ng.on(CMD + gcommands.stop, function(options) {
            if (!node.game.isStoppable()) {
                node.err('Game cannot be stopped.');
                return;
            }

            node.emit('BEFORE_GAMECOMMAND', gcommands.stop, options);
            node.game.stop();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: goto_step
         *
         */
        this.events.ng.on(CMD + gcommands.goto_step, function(step) {
            if (!node.game.isSteppable()) {
                node.err('Game cannot be stepped.');
                return;
            }

            node.emit('BEFORE_GAMECOMMAND', gcommands.goto_step, step);
            node.game.gotoStep(new GameStage(step));
        });

        /**
         * ## NODEGAME_GAMECOMMAND: clear_buffer
         *
         */
        this.events.ng.on(CMD + gcommands.clear_buffer, function() {
            node.emit('BEFORE_GAMECOMMAND', gcommands.clear_buffer);
            node.socket.clearBuffer();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: erase_buffer
         *
         */
        this.events.ng.on(CMD + gcommands.erase_buffer, function() {
            node.emit('BEFORE_GAMECOMMAND', gcommands.clear_buffer);
            node.socket.eraseBuffer();
        });

        this.internalAdded = true;
        this.silly('internal listeners added');
        return true;
    };
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
