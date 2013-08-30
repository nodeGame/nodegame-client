// # Internal listeners

// Internal listeners are not directly associated to messages,
// but they are usually responding to internal nodeGame events, 
// such as progressing in the loading chain, or finishing a game stage 

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
        var that;
        if (this.internalAdded && !force) {
            this.err('Default internal listeners already added once. Use the force flag to re-add.');
            return false;
        }
        that = this;
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
	    
            // Execute done handler before updating stage
            var ok = true,
            done = that.game.getCurrentStep().done;
            
            if (done) ok = done.apply(that.game, J.obj2Array(arguments));
            if (!ok) return;
            that.game.setStageLevel(constants.stageLevels.DONE)
	    
            // Call all the functions that want to do 
            // something before changing stage
            that.emit('BEFORE_DONE');
	    
            // Step forward, if allowed
            that.game.shouldStep();
        });

        /**
         * ## PLAYING
         * 
         * @emit BEFORE_PLAYING 
         */
        this.events.ng.on('PLAYING', function() {
            that.game.setStageLevel(constants.stageLevels.PLAYING);
            //TODO: the number of messages to emit to inform other players
            // about its own stage should be controlled. Observer is 0 
            //that.game.publishUpdate();
            that.socket.clearBuffer();	
            that.emit('BEFORE_PLAYING');
        });


        /**
         * ## NODEGAME_GAMECOMMAND: start
         * 
         */
        this.events.ng.on('NODEGAME_GAMECOMMAND_' + constants.gamecommand.start, function(options) {
	    
            that.emit('BEFORE_GAMECOMMAND', constants.gamecommand.start, options);
	    
            if (that.game.getCurrentStep() && that.game.getCurrentStep().stage !== 0) {
	        that.err('Game already started. Use restart if you want to start the game again');
	        return;
            }
	    
            that.game.start();	
        });

        this.incomingAdded = true;
        this.silly('internal listeners added');
        return true;
    }
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
// <!-- ends internal listener -->
