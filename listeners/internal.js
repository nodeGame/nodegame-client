// # Internal listeners

// Internal listeners are not directly associated to messages,
// but they are usually responding to internal nodeGame events, 
// such as progressing in the loading chain, or finishing a game stage 

(function (node) {

	if (!node) {
		console.log('nodeGame not found. Cannot add internal listeners');
		return false;
	}
	
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
 * ## STAGEDONE
 * 
 * Fired when all the players in the player list are DONE
 */ 
node.on('STAGEDONE', function() {
	
	// In single player mode we ignore when all the players have completed the stage
	if (node.game.solo_mode) {
		return;
	}
	
	// <!-- If we go auto -->
	if (node.game.auto_step && !node.game.observer) {
		node.log('We play AUTO', 'DEBUG');
		var morePlayers = ('undefined' !== typeof node.game.minPlayers) ? node.game.minPlayers - node.game.pl.count() : 0 ;
		node.log('Additional player required: ' + morePlayers > 0 ? MorePlayers : 0, 'DEBUG');
		
		if (morePlayers > 0) {
			node.emit(OUT + say + target.TXT, morePlayers + ' player/s still needed to play the game');
			node.log(morePlayers + ' player/s still needed to play the game');
		}
		// TODO: differentiate between before the game starts and during the game
		else {
			node.emit(OUT + say + target.TXT, node.game.minPlayers + ' players ready. Game can proceed');
			node.log(node.game.pl.count() + ' players ready. Game can proceed');
			node.game.step();
		}
	}
	else {
		node.log('Waiting for monitor to step', 'DEBUG');
	}
});

/**
 * ## DONE
 * 
 * Updates and publishes that the client has successfully terminated a stage 
 * 
 * If a DONE handler is defined in the game-loop, it will executes it before
 * continuing with further operations. In case it returns FALSE, the update
 * process is stopped. 
 * 
 * @emit BEFORE_DONE
 * @emit WAITING...
 */
node.on('DONE', function(p1, p2, p3) {
	
	// Execute done handler before updating stage
	var ok = true;
	
	var done = node.game.currentStepObj.done;
	
	if (done) ok = done.call(node.game, p1, p2, p3);
	if (!ok) return;
	node.game.updateStageLevel(Game.stageLevels.DONE)
	
	// Call all the functions that want to do 
	// something before changing stage
	node.emit('BEFORE_DONE');
	
	if (node.game.auto_wait) {
		if (node.window) {	
			node.emit('WAITING...');
		}
	}
	node.game.publishUpdate();
	
	if (node.game.solo_mode) {
		node.game.step();
	}
});

/**
 * ## WINDOW_LOADED
 * 
 * Checks if the game is ready, and if so fires the LOADED event
 *
 * @emit BEFORE_LOADING
 * @emit LOADED
 */
node.on('WINDOW_LOADED', function() {
	if (node.game.ready) node.emit('LOADED');
});

/**
 * ## GAME_LOADED
 * 
 * Checks if the window was loaded, and if so fires the LOADED event
 *
 * @emit BEFORE_LOADING
 * @emit LOADED
 */
node.on('GAME_LOADED', function() {
	if (node.game.ready) node.emit('LOADED');
});

/**
 * ## LOADED
 * 
 * 
 */
node.on('LOADED', function() {
	node.emit('BEFORE_LOADING');
	node.game.updateStageLevel('PLAYING');
	//TODO: the number of messages to emit to inform other players
	// about its own stage should be controlled. Observer is 0 
	//node.game.publishUpdate();
	node.socket.clearBuffer();
	
});


/**
 * ## LOADED
 * 
 * 
 */
node.on('NODEGAME_GAMECOMMAND_' + node.gamecommand.start, function(options) {
	
	
	node.emit('BEFORE_GAMECOMMAND', node.gamecommand.start, options);
	
	if (node.game.currentStepObj.stage !== 0) {
		node.err('Game already started. Use restart if you want to start the game again');
		return;
	}
	
	node.game.start();
	
	
});


node.log('internal listeners added');
	
})('undefined' !== typeof node ? node : module.parent.exports); 
// <!-- ends outgoing listener -->