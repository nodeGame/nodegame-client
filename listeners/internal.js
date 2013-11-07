// # Internal listeners.

// Internal listeners are not directly associated to messages,
// but they are usually responding to internal nodeGame events,
// such as progressing in the loading chain, or finishing a game stage.

(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var GameMsg = parent.GameMsg,
    GameSage = parent.GameStage,
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

        /**
         * ## DONE
         *
         * Registers the stageLevel _DONE_ and eventually steps forward.
         *
         * If a DONE handler is defined in the game-plot, it will execute it. 
         * In case it returns FALSE, the update
         * process is stopped.
         *
         * @emit BEFORE_DONE
         */
        this.events.ng.on('DONE', function() {
            // Execute done handler before updating stage.
            var ok, done;
            ok = true;
            done = node.game.plot.getProperty(node.game.getCurrentGameStage(),
                                              'done');

            if (done) ok = done.apply(node.game, arguments);
            if (!ok) return;
            node.game.setStageLevel(stageLevels.DONE);

            // Call all the functions that want to do
            // something before changing stage.
            node.emit('BEFORE_DONE');

            // Step forward, if allowed.
            if (node.game.shouldStep()){
                node.game.step();
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
        });

        /**
         * ## NODEGAME_GAMECOMMAND: start
         *
         */
        this.events.ng.on(CMD + gcommands.start, function(options) {
            node.emit('BEFORE_GAMECOMMAND', gcommands.start, options);

            if (node.game.getCurrentStep() &&
                node.game.getCurrentStep().stage !== 0) {
                node.err('Game already started. ' +
                         'Use restart if you want to start the game again');
                return;
            }

            node.game.start();
        });

        /**
         * ## NODEGAME_GAMECMD: pause
         *
         */
        this.events.ng.on(CMD + gcommands.pause, function(options) {
            node.emit('BEFORE_GAMECOMMAND', gcommands.pause, options);
            // TODO: check conditions
            node.game.pause();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: resume
         *
         */
        this.events.ng.on(CMD + gcommands.resume, function(options) {
            node.emit('BEFORE_GAMECOMMAND', gcommands.resume, options);
            // TODO: check conditions.
            node.game.resume();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: step
         *
         */
        this.events.ng.on(CMD + gcommands.step, function(options) {
            node.emit('BEFORE_GAMECOMMAND', gcommands.step, options);
            // TODO: check conditions.
            node.game.step();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: stop
         *
         */
        this.events.ng.on(CMD + gcommands.stop, function(options) {
            node.emit('BEFORE_GAMECOMMAND', gcommands.stop, options);
            // Conditions checked inside stop.
            node.game.stop();
        });

        this.internalAdded = true;
        this.silly('internal listeners added');
        return true;
    };
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
// <!-- ends internal listener -->