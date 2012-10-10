// ## Game outgoing listeners

(function (node) {

	if (!node) {
		console.log('nodeGame not found. Cannot add outgoing listeners');
		return false;
	}
	
	var GameMsg = node.GameMsg,
		GameState = node.GameState;
	
	var say = GameMsg.actions.SAY + '.',
		set = GameMsg.actions.SET + '.',
		get = GameMsg.actions.GET + '.',
		OUT  = GameMsg.OUT;
	
/** 
 * ### out.say.HI
 * 
 * Updates the game-state of the game upon connection to a server
 * 
 */
node.on( OUT + say + 'HI', function() {
	// Enter the first state
	if (node.game.auto_step) {
		node.game.updateState(node.game.next());
	}
	else {
		// The game is ready to step when necessary;
		node.game.state.is = GameState.iss.LOADED;
		node.socket.sendSTATE(GameMsg.actions.SAY, node.game.state);
	}
});

/**
 * ### out.say.STATE
 * 
 * Sends out a STATE message to the specified recipient
 * 
 * TODO: check with the server 
 * The message is for informative purpose
 * 
 */
node.on( OUT + say + 'STATE', function (state, to) {
	node.socket.sendSTATE(GameMsg.actions.SAY, state, to);
});	

/**
 * ### out.say.TXT
 * 
 * Sends out a TXT message to the specified recipient
 */
node.on( OUT + say + 'TXT', function (text, to) {
	node.socket.sendTXT(text,to);
});

/**
 * ### out.say.DATA
 * 
 * Sends out a DATA message to the specified recipient
 */
node.on( OUT + say + 'DATA', function (data, to, key) {
	node.socket.sendDATA(GameMsg.actions.SAY, data, to, key);
});

/**
 * ### out.set.STATE
 * 
 * Sends out a STATE message to the specified recipient
 * 
 * TODO: check with the server 
 * The receiver will update its representation of the state
 * of the sender
 */
node.on( OUT + set + 'STATE', function (state, to) {
	node.socket.sendSTATE(GameMsg.actions.SET, state, to);
});

/**
 * ### out.set.DATA
 * 
 * Sends out a DATA message to the specified recipient
 * 
 * The sent data will be stored in the memory of the recipient
 * 
 * 	@see Game.memory
 */
node.on( OUT + set + 'DATA', function (data, to, key) {
	node.socket.sendDATA(GameMsg.actions.SET, data, to, key);
});

/**
 * ### out.get.DATA
 * 
 * Issues a DATA request
 * 
 * Experimental. Undocumented (for now)
 */
node.on( OUT + get + 'DATA', function (data, to, key) {
	node.socket.sendDATA(GameMsg.actions.GET, data, to, data);
});
	
node.log('outgoing listeners added');

})('undefined' !== typeof node ? node : module.parent.exports); 
// <!-- ends outgoing listener -->