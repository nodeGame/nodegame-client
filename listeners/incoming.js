// # Incoming listeners
// Incoming listeners are fired in response to incoming messages
(function (node) {

	if (!node) {
		console.log('nodeGame not found. Cannot add incoming listeners');
		return false;
	}
	
	var GameMsg = node.GameMsg,
		GameStage = node.GameStage,
		PlayerList = node.PlayerList,
		Player = node.Player,
		J = node.JSUS;
	
	var action = node.action,
		target = node.target;
	
	var say = action.SAY + '.',
		set = action.SET + '.',
		get = action.GET + '.',
		IN  = node.IN;

	
/**
 * ## in.say.PCONNECT
 * 
 * Adds a new player to the player list from the data contained in the message
 * 
 * @emit UPDATED_PLIST
 * @see Game.pl 
 */
    node.events.ng.on( IN + say + 'PCONNECT', function (msg) {
	if (!msg.data) return;
	node.game.pl.add(new Player(msg.data));
	node.emit('UPDATED_PLIST');
    });	
	
/**
 * ## in.say.PDISCONNECT
 * 
 * Removes a player from the player list based on the data contained in the message
 * 
 * @emit UPDATED_PLIST
 * @see Game.pl 
 */
	node.events.ng.on( IN + say + 'PDISCONNECT', function (msg) {
		if (!msg.data) return;
		node.game.pl.remove(msg.data.id);
		node.emit('UPDATED_PLIST');
	});	

/**
 * ## in.say.MCONNECT
 * 
 * Adds a new monitor to the monitor list from the data contained in the message
 * 
 * @emit UPDATED_MLIST
 * @see Game.ml 
 */
	node.events.ng.on( IN + say + 'MCONNECT', function (msg) {
		if (!msg.data) return;
		node.game.ml.add(new Player(msg.data));
		node.emit('UPDATED_MLIST');
	});	
		
/**
 * ## in.say.MDISCONNECT
 * 
 * Removes a monitor from the player list based on the data contained in the message
 * 
 * @emit UPDATED_MLIST
 * @see Game.ml 
 */
	node.events.ng.on( IN + say + 'MDISCONNECT', function (msg) {
		if (!msg.data) return;
		node.game.ml.remove(msg.data.id);
		node.emit('UPDATED_MLIST');
	});		
			

/**
 * ## in.say.PLIST
 * 
 * Creates a new player-list object from the data contained in the message
 * 
 * @emit UPDATED_PLIST
 * @see Game.pl 
 */
node.events.ng.on( IN + say + 'PLIST', function (msg) {
	if (!msg.data) return;
	node.game.pl = new PlayerList({}, msg.data);
	node.emit('UPDATED_PLIST');
});	
	
/**
 * ## in.say.MLIST
 * 
 * Creates a new monitor-list object from the data contained in the message
 * 
 * @emit UPDATED_MLIST
 * @see Game.pl 
 */
node.events.ng.on( IN + say + 'MLIST', function (msg) {
	if (!msg.data) return;
	node.game.ml = new PlayerList({}, msg.data);
	node.emit('UPDATED_MLIST');
});	
	
/**
 * ## in.get.DATA
 * 
 * Experimental feature. Undocumented (for now)
 */ 
node.events.ng.on( IN + get + 'DATA', function (msg) {
	if (msg.text === 'LOOP'){
		node.socket.sendDATA(action.SAY, node.game.gameLoop, msg.from, 'GAME');
	}
	// <!-- We could double emit
	// node.emit(msg.text, msg.data); -->
});

/**
 * ## in.set.STATE
 * 
 * Adds an entry to the memory object 
 * 
 */
node.events.ng.on( IN + set + 'STATE', function (msg) {
	node.game.memory.add(msg.text, msg.data, msg.from);
});

/**
 * ## in.set.DATA
 * 
 * Adds an entry to the memory object 
 * 
 */
node.events.ng.on( IN + set + 'DATA', function (msg) {
	node.game.memory.add(msg.text, msg.data, msg.from);
});

/**
 * ## in.say.STAGE
 * 
 * Updates the game stage or updates a player's state in
 * the player-list object
 *
 * If the message is from the server, it updates the game stage,
 * else the stage in the player-list object from the player who
 * sent the message is updated 
 * 
 *  @emit UPDATED_PLIST
 *  @see Game.pl 
 */
	node.events.ng.on( IN + say + 'STAGE', function (msg) {

		if (node.socket.serverid && msg.from === node.socket.serverid) {
//			console.log(node.socket.serverid + ' ---><--- ' + msg.from);
//			console.log('NOT EXISTS');
		}
		
		if (node.game.pl.exist(msg.from)) {			
			node.game.pl.updatePlayerStage(msg.from, msg.data);
			node.emit('UPDATED_PLIST');
			//node.game.pl.checkStage();
            node.game.shouldStep();
		}
		// <!-- Assume this is the server for now
		// TODO: assign a string-id to the server -->
		else {
			node.game.execStage(node.game.gameLoop.getStep(msg.data));
		}
	});

/**
 * ## in.say.STAGE_LEVEL
 * 
 * Updates a player's stage level in the player-list object
 *
 * If the message is from the server, it updates the game stage,
 * else the stage in the player-list object from the player who
 * sent the message is updated 
 * 
 *  @emit UPDATED_PLIST
 *  @see Game.pl 
 */
	node.events.ng.on( IN + say + 'STAGE_LEVEL', function (msg) {
		if (node.socket.serverid && msg.from === node.socket.serverid) {
//			console.log(node.socket.serverid + ' ---><--- ' + msg.from);
//			console.log('NOT EXISTS');
		}
		
		if (node.game.pl.exist(msg.from)) {
			node.game.pl.updatePlayerStageLevel(msg.from, msg.data);
			node.emit('UPDATED_PLIST');
			//node.game.pl.checkStage();
            node.game.shouldStep();
		}
		// <!-- Assume this is the server for now
		// TODO: assign a string-id to the server -->
		else {
			//node.game.setStageLevel(msg.data);
		}
	});
	
/**
 * ## in.say.REDIRECT
 * 
 * Redirects to a new page
 * 
 * @see node.redirect
 */
node.events.ng.on( IN + say + 'REDIRECT', function (msg) {
	if (!msg.data) return;
	if ('undefined' === typeof window || !window.location) {
		node.log('window.location not found. Cannot redirect', 'err');
		return false;
	}

	window.location = msg.data; 
});	


/**
 * ## in.say.SETUP
 * 
 * Setups a features of nodegame
 * 
 * Unstrigifies the payload before calling `node.setup`
 *
 * @see node.setup
 * @see JSUS.parse
 */
node.events.ng.on( IN + say + 'SETUP', function (msg) {
    if (!msg.text) return;
    var feature = msg.text,
        payload = JSUS.parse(msg.data);
    
    if (!payload) {
	node.err('error while parsing incoming remote setup message');
	return false;
    }
    node.setup(feature, payload);	
});	


/**
 * ## in.say.GAMECOMMAND
 * 
 * Setups a features of nodegame
 * 
 * @see node.setup
 */
node.events.ng.on( IN + say + 'GAMECOMMAND', function (msg) {
    if (!msg.text || !node.gamecommand[msg.text]) {
	node.err('unknown game command received: ' + msg.text);
	return;
    }
    node.emit('NODEGAME_GAMECOMMAND_' + msg.text, msg.data);
});	

/**
 * ## in.say.JOIN
 * 
 * Invites the client to leave the current channel and joining another one
 * 
 * It differs from `REDIRECT` messages because the client 
 * does not leave the page, it just switches channel. 
 * 
 */
node.events.ng.on( IN + say + 'JOIN', function (msg) {
    if (!msg.text) return;
    //node.socket.disconnect();
    node.connect(msg.text);
});	

	node.log('incoming listeners added');
	
})('undefined' !== typeof node ? node : module.parent.exports); 
// <!-- ends incoming listener -->
