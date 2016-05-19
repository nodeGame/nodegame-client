/**
 * # internal
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Listeners for internal messages.
 *
 * Internal listeners are not directly associated to messages,
 * but they are usually responding to internal nodeGame events,
 * such as progressing in the loading chain, or finishing a game stage.
 *
 * http://nodegame.org
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var GameStage = parent.GameStage,
    constants = parent.constants;

    var stageLevels = constants.stageLevels,
    gcommands = constants.gamecommands;

    var CMD = 'NODEGAME_GAMECOMMAND_';

    /**
     * ## NodeGameClient.addDefaultInternalListeners
     *
     * Adds a battery of event listeners for internal events
     *
     * If executed once, it requires a force flag to re-add the listeners.
     *
     * @param {boolean} force Whether to force re-adding the listeners
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultInternalListeners = function(force) {
        var node = this;
        if (this.conf.internalAdded && !force) {
            this.err('Default internal listeners already added once. ' +
                     'Use the force flag to re-add.');
            return false;
        }

        this.info('node: adding internal listeners.');

        function done() {
            var res;
            // No incoming messages should be emitted before
            // evaluating the step rule and definitely setting
            // the stageLevel to DONE, otherwise the stage of
            // other clients could change in between.
            node.game.setStageLevel(stageLevels.GETTING_DONE);
            node.game.willBeDone = false;
            node.emit('REALLY_DONE');
            res = node.game.shouldStep(stageLevels.DONE);
            node.game.setStageLevel(stageLevels.DONE);
            // Step forward, if allowed.
            if (res) node.game.step();
        }

        /**
         * ## DONE
         *
         * Registers the stageLevel _DONE_ and eventually steps forward.
         *
         * If a DONE handler is defined in the game-plot, it executes it.
         * In case the handler returns FALSE, the process is stopped.
         *
         * @emit REALLY_DONE
         */
        this.events.ng.on('DONE', function() {
            // Execute done handler before updating stage.
            var stageLevel;

            stageLevel = node.game.getStageLevel();

            // TODO check >=.
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
            node.emit('BEFORE_PLAYING');
            node.game.setStageLevel(stageLevels.PLAYING);
            node.socket.clearBuffer();
            // Last thing to do, is to store time:
            currentTime = (new Date()).getTime();
            node.timer.setTimestamp(node.game.getCurrentGameStage().toString(),
                                    currentTime);
            node.timer.setTimestamp('step', currentTime);

            // DONE was previously emitted, we just execute done handler.
            if (node.game.willBeDone) done();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: start
         */
        this.events.ng.on(CMD + gcommands.start, function(options) {
            if (!node.game.isStartable()) {
                node.err('"' + CMD + gcommands.start + '": game cannot ' +
                         'be started now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.start, options);
            node.game.start(options);
        });

        /**
         * ## NODEGAME_GAMECMD: pause
         */
        this.events.ng.on(CMD + gcommands.pause, function(options) {
            if (!node.game.isPausable()) {
                node.err('"' + CMD + gcommands.pause + '": game cannot ' +
                         'be paused now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.pause, options);
            node.game.pause(options);
        });

        /**
         * ## NODEGAME_GAMECOMMAND: resume
         */
        this.events.ng.on(CMD + gcommands.resume, function(options) {
            if (!node.game.isResumable()) {
                node.err('"' + CMD + gcommands.resume + '": game cannot ' +
                         'be resumed now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.resume, options);
            node.game.resume(options);
        });

        /**
         * ## NODEGAME_GAMECOMMAND: step
         */
        this.events.ng.on(CMD + gcommands.step, function(options) {
            if (!node.game.isSteppable()) {
                node.err('"' + CMD + gcommands.step + '": game cannot ' +
                         'be stepped now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.step, options);
            node.game.step();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: stop
         */
        this.events.ng.on(CMD + gcommands.stop, function(options) {
            if (!node.game.isStoppable()) {
                node.err('"' + CMD + gcommands.stop + '": game cannot ' +
                         'be stopped now.');
                return;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.stop, options);
            node.game.stop();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: goto_step
         */
        this.events.ng.on(CMD + gcommands.goto_step, function(options) {
            var step;
            if (!node.game.isSteppable()) {
                node.err('"' + CMD + gcommands.goto_step + '": game cannot ' +
                         'be stepped now.');
                return;
            }
            // Adjust parameters.
            if (options.targetStep) step = options.targetStep;
            else {
                step = options;
                options = undefined;
            }
            node.emit('BEFORE_GAMECOMMAND', gcommands.goto_step, step, options);
            if (step !== parent.GamePlot.GAMEOVER) {
                step = new GameStage(step);
                if (!node.game.plot.getStep(step)) {
                    node.err('"' + CMD + gcommands.goto_step + '": ' +
                             'step not found: ' + step);
                    return;
                }
            }
            node.game.gotoStep(step, options);
        });

        /**
         * ## NODEGAME_GAMECOMMAND: clear_buffer
         */
        this.events.ng.on(CMD + gcommands.clear_buffer, function() {
            node.emit('BEFORE_GAMECOMMAND', gcommands.clear_buffer);
            node.socket.clearBuffer();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: erase_buffer
         */
        this.events.ng.on(CMD + gcommands.erase_buffer, function() {
            node.emit('BEFORE_GAMECOMMAND', gcommands.clear_buffer);
            node.socket.eraseBuffer();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: push_step
         */
        node.events.ng.on(CMD + gcommands.push_step, function() {
            var res;
            console.log('BEING PUSHED! ', node.player.stage);


            // TODO: check this:
            // At the moment, we do not have a default timer object,
            // nor a default done/timeup cb.
            // We try to see if they exist, and as last resort we emit DONE.

            if (node.game.timer && node.game.timer.doTimeUp) {
                console.log('TIMEEEEUuuuuuuuuuup');
                node.game.timer.doTimeUp();
            }
            else if (node.game.visualTimer && node.game.visualTimer.doTimeUp) {
                console.log('TIMEEEEUuuuuuuuuuup 2');
                node.game.visualTimer.doTimeUp();
            }


            // TODO: CHECK OTHER LEVELS (e.g. getting_done).
            if (!node.game.willBeDone &&
                node.game.getStageLevel() !== stageLevels.DONE) {

                console.log('NODE.DDDDDDDDDDOOONE');

                res = node.done();
                if (!res) {
                    node.emit('DONE');
                    console.log('EMIT DONEOOOOOOOOOOOOO');
                }
            }

            // Check this.
            // node.game.setStageLevel(stageLevels.DONE);

            return 'ok!';


            // Important for GET msgs.
            return node.game.getStageLevel() === stageLevels.DONE  ?
                'ok!' : 'stuck!';
        });

        this.conf.internalAdded = true;
        this.silly('node: internal listeners added.');
        return true;
    };
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
