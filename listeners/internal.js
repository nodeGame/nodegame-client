// # Internal listeners.

// Internal listeners are not directly associated to messages,
// but they are usually responding to internal nodeGame events,
// such as progressing in the loading chain, or finishing a game stage.

(function (exports, parent) {

    var NGC = parent.NodeGameClient;

    var GameMsg = parent.GameMsg,
    GameSage = parent.GameStage,
    PlayerList = parent.PlayerList,
    Player = parent.Player,
    J = parent.JSUS,
    constants = parent.constants;

    var action = constants.action,
    target = constants.target;
    stageLevels = constants.stageLevels;

    var say = action.SAY + '.',
    set = action.SET + '.',
    get = action.GET + '.',
    OUT = constants.OUT;

    /**
     * ## NodeGameClient.addDefaultInternalListeners
     *
     * Adds a battery of event listeners for internal events
     *
     * If executed once, it requires a force flag to re-add the listeners
     *
     * @param {boolean} TRUE, to force re-adding the listeners
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultInternalListeners = function(force) {
        var node = this;
        if (this.internalAdded && !force) {
            this.err('Default internal listeners already added once. Use the force flag to re-add.');
            return false;
        }

        /**
         * ## DONE
         *
         * Updates and publishes that the client has successfully terminated a stage
         *
         * If a DONE handler is defined in the game-plot, it will executes it before
         * continuing with further operations. In case it returns FALSE, the update
         * process is stopped.
         *
         * @emit BEFORE_DONE
         *
         */
        this.events.ng.on('DONE', function() {
            // Execute done handler before updating stage.
            var ok = true,
                done = node.game.getCurrentStep().done;

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
                node.game.setStageLevel(stageLevels.LOADED);
                node.emit('LOADED');
            }
        });
        

        /**
         * ## WINDOW_LOADED
         *
         * @emit LOADED
         */
        this.events.ng.on('WINDOW_LOADED', function() {
            // TODO we should have a better check
            if (node.game.getStageLevel() >= stageLevels.CALLBACK_EXECUTED) {
                node.game.setStageLevel(stageLevels.LOADED);
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
            //TODO: the number of messages to emit to inform other players
            // about its own stage should be controlled. Observer is 0
            //node.game.publishUpdate();
            node.socket.clearBuffer();
            node.emit('BEFORE_PLAYING');

            // Store time:
            currentTime = (new Date()).getTime();
            node.timer.setTimestamp(node.game.getCurrentGameStage().toString(), currentTime);
            node.timer.setTimestamp('step', currentTime);
        });


        /**
         * ## NODEGAME_GAMECOMMAND: start
         *
         */
        this.events.ng.on('NODEGAME_GAMECOMMAND_' + constants.gamecommand.start, function(options) {
            node.emit('BEFORE_GAMECOMMAND', constants.gamecommand.start, options);

            if (node.game.getCurrentStep() && node.game.getCurrentStep().stage !== 0) {
                node.err('Game already started. Use restart if you want to start the game again');
                return;
            }

            node.game.start();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: pause
         *
         */
        this.events.ng.on('NODEGAME_GAMECOMMAND_' + constants.gamecommand.pause, function(options) {
            node.emit('BEFORE_GAMECOMMAND', constants.gamecommand.pause, options);

            node.game.pause();
        });

        /**
         * ## NODEGAME_GAMECOMMAND: resume
         *
         */
        this.events.ng.on('NODEGAME_GAMECOMMAND_' + constants.gamecommand.resume, function(options) {
            node.emit('BEFORE_GAMECOMMAND', constants.gamecommand.resume, options);

            node.game.resume();
        });

        this.incomingAdded = true;
        this.silly('internal listeners added');
        return true;
    };
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
// <!-- ends internal listener -->
