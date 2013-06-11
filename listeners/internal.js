// # Internal listeners

// Internal listeners are not directly associated to messages,
// but they are usually responding to internal nodeGame events, 
// such as progressing in the loading chain, or finishing a game stage 

(function (node) {

    
	
    var action = node.action,
        target = node.target;
	
    var GameMsg = node.GameMsg,
        GameStage = node.GameStage,
        Game = node.Game;
    
    var say = action.SAY + '.',
        set = action.SET + '.',
        get = action.GET + '.',
	IN  = node.IN,
        OUT = node.OUT;

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
 * @emit WAITING...
 */
node.events.ng.on('DONE', function(p1, p2, p3) {
	
    // Execute done handler before updating stage
    var ok = true,
       done = node.game.getCurrentStep().done;
    
    if (done) ok = done.call(node.game, p1, p2, p3);
    if (!ok) return;
    node.game.setStageLevel(Game.stageLevels.DONE)
	
    // Call all the functions that want to do 
    // something before changing stage
    node.emit('BEFORE_DONE');
	
    if (node.game.auto_wait) {
	if (node.window) {	
	    node.emit('WAITING...');
	}
    }

    // Step forward, if allowed
    node.game.shouldStep();
});

/**
 * ## WINDOW_LOADED
 * 
 * Checks if the game is ready, and if so fires the LOADED event
 *
 * @emit BEFORE_LOADING
 * @emit LOADED
 */
node.events.ng.on('WINDOW_LOADED', function() {
    if (node.game.isReady()) node.emit('LOADED');
});

/**
 * ## GAME_LOADED
 * 
 * Checks if the window was loaded, and if so fires the LOADED event
 *
 * @emit BEFORE_LOADING
 * @emit LOADED
 */
node.events.ng.on('GAME_LOADED', function() {
    if (node.game.isReady()) node.emit('LOADED');
});

/**
 * ## LOADED
 * 
 * 
 */
node.events.ng.on('LOADED', function() {
    node.emit('BEFORE_LOADING');
    node.game.setStageLevel(Game.stageLevels.PLAYING);
    //TODO: the number of messages to emit to inform other players
    // about its own stage should be controlled. Observer is 0 
    //node.game.publishUpdate();
    node.socket.clearBuffer();
	
});


/**
 * ## NODEGAME_GAMECOMMAND: start
 * 
 */
node.events.ng.on('NODEGAME_GAMECOMMAND_' + node.gamecommand.start, function(options) {
	
    node.emit('BEFORE_GAMECOMMAND', node.gamecommand.start, options);
	
    if (node.game.getCurrentStep() && node.game.getCurrentStep().stage !== 0) {
	node.err('Game already started. Use restart if you want to start the game again');
	return;
    }
	
    node.game.start();	
});


node.log('internal listeners added');
	
})('undefined' !== typeof node ? node : module.parent.exports); 
// <!-- ends internal listener -->
