// ## Game incoming listeners
// Incoming listeners are fired in response to incoming messages
(function (node) {

	if (!node) {
		console.log('nodeGame not found. Cannot add incoming listeners');
		return false;
	}
	
	var GameMsg = node.GameMsg,
		GameState = node.GameState;
	
	var say = GameMsg.actions.SAY + '.',
		set = GameMsg.actions.SET + '.',
		get = GameMsg.actions.GET + '.',
		IN  = GameMsg.IN;

	
/**
 * ### in.say.PCONNECT
 * 
 * Adds a new player to the player list from the data contained in the message
 * 
 * @emit UPDATED_PLIST
 * @see Game.pl 
 */
	node.on( IN + say + 'PCONNECT', function (msg) {
		if (!msg.data) return;
		that.pl.add(new Player(msg.data));
		node.emit('UPDATED_PLIST');
		that.pl.checkState();
	});	
	
/**
 * ### in.say.PDISCONNECT
 * 
 * Removes a player from the player list based on the data contained in the message
 * 
 * @emit UPDATED_PLIST
 * @see Game.pl 
 */
	node.on( IN + say + 'PDISCONNECT', function (msg) {
		if (!msg.data) return;
		that.pl.remove(msg.data.id);
		node.emit('UPDATED_PLIST');
		that.pl.checkState();
	});	

/**
 * ### in.say.MCONNECT
 * 
 * Adds a new monitor to the monitor list from the data contained in the message
 * 
 * @emit UPDATED_PLIST
 * @see Game.ml 
 */
	node.on( IN + say + 'MCONNECT', function (msg) {
		if (!msg.data) return;
		that.ml.add(new Player(msg.data));
		node.emit('UPDATED_MLIST');
	});	
		
/**
 * ### in.say.MDISCONNECT
 * 
 * Removes a monitor from the player list based on the data contained in the message
 * 
 * @emit UPDATED_MLIST
 * @see Game.ml 
 */
	node.on( IN + say + 'MDISCONNECT', function (msg) {
		if (!msg.data) return;
		that.ml.remove(msg.data.id);
		node.emit('UPDATED_MLIST');
	});		
			

/**
 * ### in.say.MLIST
 * 
 * Creates a new player-list object from the data contained in the message
 * 
 * @emit UPDATED_MLIST
 * @see Game.pl 
 */
node.on( IN + say + 'MLIST', function (msg) {
	if (!msg.data) return;
	node.game.ml = new PlayerList({}, msg.data);
	node.emit('UPDATED_MLIST');
});	
	
/**
 * ### in.get.DATA
 * 
 * Experimental feature. Undocumented (for now)
 */ 
node.on( IN + get + 'DATA', function (msg) {
	if (msg.text === 'LOOP'){
		node.socket.sendDATA(GameMsg.actions.SAY, node.game.gameLoop, msg.from, 'GAME');
	}
	// <!-- We could double emit
	// node.emit(msg.text, msg.data); -->
});

/**
 * ### in.set.STATE
 * 
 * Adds an entry to the memory object 
 * 
 */
node.on( IN + set + 'STATE', function (msg) {
	node.game.memory.add(msg.text, msg.data, msg.from);
});

/**
 * ### in.set.DATA
 * 
 * Adds an entry to the memory object 
 * 
 */
node.on( IN + set + 'DATA', function (msg) {
	node.game.memory.add(msg.text, msg.data, msg.from);
});

/**
 * ### in.say.STATE
 * 
 * Updates the game state or updates a player's state in
 * the player-list object
 *
 * If the message is from the server, it updates the game state,
 * else the state in the player-list object from the player who
 * sent the message is updated 
 * 
 *  @emit UPDATED_PLIST
 *  @see Game.pl 
 */
	node.on( IN + say + 'STATE', function (msg) {
//		console.log('updateState: ' + msg.from + ' -- ' + new GameState(msg.data), 'DEBUG');
//		console.log(node.game.pl.length)
		
		//console.log(node.socket.serverid + 'AAAAAA');
		if (node.socket.serverid && msg.from === node.socket.serverid) {
//			console.log(node.socket.serverid + ' ---><--- ' + msg.from);
//			console.log('NOT EXISTS');
		}
		
		if (node.game.pl.exist(msg.from)) {
			//console.log('EXIST')
			
			node.game.pl.updatePlayerState(msg.from, msg.data);
			node.emit('UPDATED_PLIST');
			node.game.pl.checkState();
		}
		// <!-- Assume this is the server for now
		// TODO: assign a string-id to the server -->
		else {
			//console.log('NOT EXISTS')
			node.game.updateState(msg.data);
		}
	});
	
/**
 * ### in.say.REDIRECT
 * 
 * Redirects to a new page
 * 
 * @emit REDIRECTING...
 * @see node.redirect
 */
node.on( IN + say + 'REDIRECT', function (msg) {
	if (!msg.data) return;
	if ('undefined' === typeof window || !window.location) {
		node.log('window.location not found. Cannot redirect', 'err');
		return false;
	}
	node.emit('REDIRECTING...', msg.data);
	window.location = msg.data; 
});	
	
	node.log('incoming listeners added');
	
})('undefined' !== typeof node ? node : module.parent.exports); 
// <!-- ends incoming listener -->