/**
 * # GameMsgGenerator
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` component rensponsible creating messages 
 * 
 * Static factory of objects of type `GameMsg`.
 * 
 * All message are reliable, but TXT messages.
 * 
 * 	@see GameMSg
 * 	@see GameMsg.targets
 * 	@see GameMsg.actions
 * 
 * ---
 *
 */
(function (exports, node) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	GameState = node.GameState,
	Player = node.Player,
	JSUS = node.JSUS;

exports.GameMsgGenerator = GameMsgGenerator; 

/**
 * ## GameMsgGenerator constructor
 * 
 * Creates an instance of GameMSgGenerator
 * 
 */
function GameMsgGenerator () {}

// ## General methods

/**
 * ### GameMsgGenerator.create 
 * 
 * Primitive for creating any type of game-message
 * 
 * Merges a set of default settings with the object passed
 * as input parameter
 * 
 */
GameMsgGenerator.create = function (msg) {

  var base = {
		session: ('undefined' !== typeof msg.session) ? msg.session : node.socket.session, 
		state: msg.state || node.game.state,
		action: msg.action || GameMsg.actions.SAY,
		target: msg.target || GameMsg.targets.DATA,
		from: node.player.sid,
		to: ('undefined' !== typeof msg.to) ? msg.to : 'SERVER',
		text: msg.text || null,
		data: msg.data || null,
		priority: msg.priority || null,
		reliable: msg.reliable || 1
  };

  return new GameMsg(msg);

};

//## HI messages

/**
 * ### GameMSgGenerator.createHI
 * 
 * Notice: this is different from the server;
 * 
 * @param {Player} player The player to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.createHI = function (player, to, reliable) {
	player = player || node.player;
	if (!player) return false;
	reliable = reliable || 1;
  
	return new GameMsg( {
            			session: node.gsc.session,
            			state: node.game.state,
            			action: GameMsg.actions.SAY,
            			target: GameMsg.targets.HI,
            			from: node.player.sid,
            			to: to,
            			text: new Player(player) + ' ready.',
            			data: player,
            			priority: null,
            			reliable: reliable
	});
};

// ## STATE messages

/**
 * ### GameMSgGenerator.saySTATE
 * 
 * Creates a say.STATE message
 * 
 * Notice: state is different from node.game.state
 * 
 * @param {GameState} state The game-state to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameState
 */
GameMsgGenerator.saySTATE = function (state, to, reliable) {
	return this.createSTATE(GameMsg.SAY, state, to, reliable);
};

/**
 * ### GameMSgGenerator.setSTATE
 * 
 * Creates a set.STATE message
 * 
 * @param {GameState} state The game-state to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameState
 */
GameMsgGenerator.setSTATE = function (state, to, reliable) {
	return this.createSTATE(GameMsg.SET, state, to, reliable);
};

/**
 * ### GameMSgGenerator.getSTATE
 * 
 * Experimental. Creates a get.STATE message
 * 
 * @param {GameState} state The game-state to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameState
 */
GameMsgGenerator.getSTATE = function (state, to, reliable) {
	return this.createSTATE(GameMsg.GET, state, to,reliable);
};

/**
 * ### GameMSgGenerator.createSTATE
 * 
 * Creates a STATE message
 * 
 * @param {string} action A nodeGame action (e.g. 'get' or 'set')
 * @param {GameState} state The game-state to communicate
 * @param {string} to Optional. The recipient of the message. Defaults, SERVER
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameState
 * 	@see GameMsg.actions
 */
GameMsgGenerator.createSTATE = function (action, state, to, reliable) {
	if (!action || !state) return false;
	to = to || 'SERVER';
	reliable = reliable || 1;
	return new GameMsg({
						session: node.gsc.session,
						state: node.game.state,
						action: action,
						target: GameMsg.targets.STATE,
						from: node.player.sid,
						to: to,
						text: 'New State: ' + GameState.stringify(state),
						data: state,
						priority: null,
						reliable: reliable
	});
};

//## PLIST messages

/**
 * ### GameMSgGenerator.sayPLIST
 * 
 * Creates a say.PLIST message
 * 
 * @param {PlayerList} plist The player-list to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see PlayerList
 */
GameMsgGenerator.sayPLIST = function (plist, to, reliable) {
	return this.createPLIST(GameMsg.actions.SAY, plist, to, reliable);
};

/**
 * ### GameMSgGenerator.setPLIST
 * 
 * Creates a set.PLIST message
 * 
 * @param {PlayerList} plist The player-list to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see PlayerList
 */
GameMsgGenerator.setPLIST = function (plist, to, reliable) {
	return this.createPLIST(GameMsg.actions.SET, plist, to, reliable);
};

/**
 * ### GameMSgGenerator.getPLIST
 * 
 * Experimental. Creates a get.PLIST message
 * 
 * @param {PlayerList} plist The player-list to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see PlayerList
 */
GameMsgGenerator.getPLIST = function (plist, to, reliable) {
	return this.createPLIST(GameMsg.actions.GET, plist, to, reliable);
};

/**
 * ### GameMSgGenerator.createPLIST
 * 
 * Creates a PLIST message
 * 
 * @param {string} action A nodeGame action (e.g. 'get' or 'set')
 * @param {PlayerList} plist The player-list to communicate
 * @param {string} to Optional. The recipient of the message. Defaults, SERVER
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 * 
 * 	@see GameMsg.actions
 *  @see PlayerList
 */
GameMsgGenerator.createPLIST = function (action, plist, to, reliable) {
	plist = plist || !node.game || node.game.pl;
	if (!action || !plist) return false;
	
	to = to || 'SERVER';
	reliable = reliable || 1;
	
	return new GameMsg({
						session: node.gsc.session, 
						state: node.game.state,
						action: action,
						target: GameMsg.targets.PLIST,
						from: node.player.sid,
						to: to,
						text: 'List of Players: ' + plist.length,
						data: plist.pl,
						priority: null,
						reliable: reliable
	});
};

// ## TXT messages

/**
 * ### GameMSgGenerator.createTXT
 * 
 * Creates a say.TXT message
 * 
 * TXT messages are always of action 'say'
 * 
 * @param {string} text The text to communicate
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.createTXT = function (text, to, reliable) {
	if (!text) return false;
	reliable = reliable || 0;
	
	return new GameMsg({
						session: node.gsc.session,
						state: node.game.state,
						action: GameMsg.actions.SAY,
						target: GameMsg.targets.TXT,
						from: node.player.sid,
						to: to,
						text: text,
						data: null,
						priority: null,
						reliable: reliable
	});
};


// ## DATA messages

/**
 * ### GameMSgGenerator.sayDATA
 * 
 * Creates a say.DATA message
 * 
 * @param {object} data An object to exchange
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.sayDATA = function (data, to, text, reliable) {
	return this.createDATA(GameMsg.actions.SAY, data, to, text, reliable);
};

/**
 * ### GameMSgGenerator.setDATA
 * 
 * Creates a set.DATA message
 * 
 * @param {object} data An object to exchange
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.setDATA = function (data, to, text, reliable) {
	return this.createDATA(GameMsg.actions.SET, data, to, text, reliable);
};

/**
 * ### GameMSgGenerator.getDATA
 * 
 * Experimental. Creates a say.DATA message
 * 
 * @param {object} data An object to exchange
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.getDATA = function (data, to, text, reliable) {
	return this.createDATA(GameMsg.actions.GET, data, to, text, reliable);
};

/**
 * ### GameMSgGenerator.createDATA
 * 
 * Creates a DATA message
 * 
 * @param {string} action A nodeGame action (e.g. 'get' or 'set')
 * @param {object} data An object to exchange
 * @param {string} to The recipient of the message
 * @param {boolean} reliable Optional. Experimental. Requires an acknowledgment
 * 
 * @return {GameMsg|boolean} The game message, or FALSE if error in the input parameters is detected
 */
GameMsgGenerator.createDATA = function (action, data, to, text, reliable) {
	if (!action) return false;
	reliable = reliable || 1;
	text = text || 'data msg';
	
	return new GameMsg({
						session: node.gsc.session, 
						state: node.game.state,
						action: action,
						target: GameMsg.targets.DATA,
						from: node.player.sid,
						to: to,
						text: text,
						data: data,
						priority: null,
						reliable: reliable
	});
};

// ## ACK messages

/**
 * ### GameMSgGenerator.setACK
 * 
 * Experimental. Undocumented (for now)
 * 
 */
GameMsgGenerator.createACK = function (gm, to, reliable) {
	if (!gm) return false;
	reliable = reliable || 0;
	
	var newgm = new GameMsg({
							session: node.gsc.session, 
							state: node.game.state,
							action: GameMsg.actions.SAY,
							target: GameMsg.targets.ACK,
							from: node.player.sid,
							to: to,
							text: 'Msg ' + gm.id + ' correctly received',
							data: gm.id,
							priority: null,
							reliable: reliable
	});
	
	if (gm.forward) {
		newgm.forward = 1;
	}
	
	return newgm;
}; 


// ## Closure
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);