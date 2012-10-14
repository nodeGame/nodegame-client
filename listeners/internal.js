// ## Game internal listeners

// Internal listeners are not directly associated to messages,
// but they are usually responding to internal nodeGame events, 
// such as progressing in the loading chain, or finishing a game state 

(function (node) {

	if (!node) {
		console.log('nodeGame not found. Cannot add internal listeners');
		return false;
	}
	
	var GameMsg = node.GameMsg,
		GameState = node.GameState;
	
	var say = GameMsg.actions.SAY + '.',
		set = GameMsg.actions.SET + '.',
		get = GameMsg.actions.GET + '.',
		IN  = GameMsg.IN,
		OUT = GameMsg.OUT;
	
/**
 * ### STATEDONE
 * 
 * Fired when all the 
 */ 
node.on('STATEDONE', function() {
	// <!-- If we go auto -->
	if (node.game.auto_step && !node.game.observer) {
		node.log('We play AUTO', 'DEBUG');
		var morePlayers = ('undefined' !== node.game.minPlayers) ? node.game.minPlayers - node.game.pl.length : 0 ;
		node.log('Additional player required: ' + morePlayers > 0 ? MorePlayers : 0, 'DEBUG');
		
		if (morePlayers > 0) {
			node.emit('OUT.say.TXT', morePlayers + ' player/s still needed to play the game');
			node.log(morePlayers + ' player/s still needed to play the game');
		}
		// TODO: differentiate between before the game starts and during the game
		else {
			node.emit('OUT.say.TXT', node.game.minPlayers + ' players ready. Game can proceed');
			node.log(node.game.pl.length + ' players ready. Game can proceed');
			node.game.updateState(node.game.next());
		}
	}
	else {
		node.log('Waiting for monitor to step', 'DEBUG');
	}
});

/**
 * ### DONE
 * 
 * Updates and publishes that the client has successfully terminated a state 
 * 
 * If a DONE handler is defined in the game-loop, it will executes it before
 * continuing with further operations. In case it returns FALSE, the update
 * process is stopped. 
 * 
 * @emit BEFORE_DONE
 * @emit WAITING...
 */
node.on('DONE', function(p1, p2, p3) {
	
	// Execute done handler before updatating state
	var ok = true;
	var done = node.game.gameLoop.getAllParams(node.game.state).done;
	
	if (done) ok = done.call(node.game, p1, p2, p3);
	if (!ok) return;
	node.game.state.is = GameState.iss.DONE;
	
	// Call all the functions that want to do 
	// something before changing state
	node.emit('BEFORE_DONE');
	
	if (node.game.auto_wait) {
		if (node.window) {	
			node.emit('WAITING...');
		}
	}
	node.game.publishState();	
});

/**
 * ### PAUSE
 * 
 * Sets the game to PAUSE and publishes the state
 * 
 */
node.on('PAUSE', function(msg) {
	node.game.state.paused = true;
	node.game.publishState();
});

/**
 * ### WINDOW_LOADED
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
 * ### GAME_LOADED
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
 * ### LOADED
 * 
 * 
 */
node.on('LOADED', function() {
	node.emit('BEFORE_LOADING');
	node.game.state.is =  GameState.iss.PLAYING;
	//TODO: the number of messages to emit to inform other players
	// about its own state should be controlled. Observer is 0 
	//node.game.publishState();
	node.socket.clearBuffer();
	
});

node.log('internal listeners added');
	
})('undefined' !== typeof node ? node : module.parent.exports); 
// <!-- ends outgoing listener -->