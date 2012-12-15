/**
 * # GameMsg
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` exchangeable data format
 * 
 * ---
 */
(function (exports, node) {

// ## Global scope	
var GameState = node.GameState,
	JSUS = node.JSUS;

exports.GameMsg = GameMsg;


/**
 * ### GameMSg.clone (static)
 * 
 * Returns a perfect copy of a game-message
 * 
 * @param {GameMsg} gameMsg The message to clone
 * @return {GameMsg} The cloned messaged
 * 
 * 	@see JSUS.clone
 */
GameMsg.clone = function (gameMsg) {	
	return new GameMsg(gameMsg);
};


/**
 * ## GameMsg constructor
 * 
 * Creates an instance of GameMsg
 */
function GameMsg (gm) {
	gm = gm || {};
	
// ## Private properties

/**
 * ### GameMsg.id
 * 
 * A randomly generated unique id
 * 
 * @api private
 */	
	var id = gm.id || Math.floor(Math.random()*1000000);
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'id', {
			value: id,
			enumerable: true
		});
	}
	else {
		this.id = id;
	}

/**
 * ### GameMsg.session
 * 
 * The session id in which the message was generated
 * 
 * @api private
 */	
	var session = gm.session;
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'session', {
			value: session,
			enumerable: true
		});
	}
	else {
		this.session = session;
	}

// ## Public properties	

/**
 * ### GameMsg.state
 * 
 * The game-state in which the message was generated
 * 
 * 	@see GameState
 */	
	this.state = gm.state;

/**
 * ### GameMsg.action
 * 
 * The action of the message
 * 
 * 	@see GameMsg.actions
 */		
	this.action = gm.action;
	
/**
 * ### GameMsg.target
 * 
 * The target of the message
 * 
 * 	@see GameMsg.targets
 */	
	this.target = gm.target;
	
/**
 * ### GameMsg.from
 * 
 * The id of the sender of the message
 * 
 * 	@see Player.id
 */		
	this.from = gm.from;

/**
 * ### GameMsg.to
 * 
 * The id of the receiver of the message
 * 
 * 	@see Player.id
 * 	@see node.player.id
 */		
	this.to = gm.to;

/**
 * ### GameMsg.text
 * 
 * An optional text adding a description for the message
 */		
	this.text = gm.text; 
	
/**
 * ### GameMsg.data
 * 
 * An optional payload field for the message
 */			
	this.data = gm.data;
	
/**
 * ### GameMsg.priority
 * 
 * A priority index associated to the message
 */	
	this.priority = gm.priority;
	
/**
 * ### GameMsg.reliable
 * 
 * Experimental. Disabled for the moment
 * 
 * If set, requires ackwnoledgment of delivery
 * 
 */	
	this.reliable = gm.reliable;

/**
 * ### GameMsg.created
 * 
 * A timestamp of the date of creation
 */		
	this.created = JSUS.getDate();
	
/**
 * ### GameMsg.forward
 * 
 * If TRUE, the message is a forward. 
 * 
 * E.g. between nodeGame servers
 */	
	this.forward = 0;
};

/**
 * ### GameMsg.stringify
 * 
 * Calls JSON.stringify on the message
 * 
 * @return {string} The stringified game-message
 * 
 * 	@see GameMsg.toString
 */
GameMsg.prototype.stringify = function () {
	return JSON.stringify(this);
};


/**
 * ### GameMsg.toString
 * 
 * Creates a human readable string representation of the message
 * 
 * @return {string} The string representation of the message
 * 	@see GameMsg.stringify
 */
GameMsg.prototype.toString = function () {
	
	var SPT = ",\t";
	var SPTend = "\n";
	var DLM = "\"";
	
	var gs = new GameState(this.state);
	
	var line = this.created + SPT;
		line += this.id + SPT;
		line += this.session + SPT;
		line += this.action + SPT;
		line += this.target + SPT;
		line +=	this.from + SPT;
		line += this.to + SPT;
		line += DLM + this.text + DLM + SPT;
		line += DLM + this.data + DLM + SPT; // maybe to remove
		line += this.reliable + SPT;
		line += this.priority + SPTend;
		
	return line;
};

/**
 * ### GameMSg.toSMS
 * 
 * Creates a compact visualization of the most important properties
 * 
 * @return {string} A compact string representing the message 
 * 
 * @TODO: Create an hash method as for GameState
 */
GameMsg.prototype.toSMS = function () {
	
	var parseDate = /\w+/; // Select the second word;
	var results = parseDate.exec(this.created);

	var line = '[' + this.from + ']->[' + this.to + ']\t';
	line += '|' + this.action + '.' + this.target + '|'+ '\t';
	line += ' ' + this.text + ' ';
	
	return line;
};

/**
 * ### GameMsg.toInEvent
 * 
 * Hashes the action and target properties of an incoming message
 * 
 * @return {string} The hash string
 * 	@see GameMsg.toEvent 
 */
GameMsg.prototype.toInEvent = function() {
	return 'in.' + this.toEvent();
};

/**
 * ### GameMsg.toOutEvent
 * 
 * Hashes the action and target properties of an outgoing message
 * 
 * @return {string} The hash string
 *  @see GameMsg.toEvent
 */
GameMsg.prototype.toOutEvent = function() {
	return 'out.' + this.toEvent();
};

/**
 * ### GameMsg.toEvent
 * 
 * Hashes the action and target properties of the message
 * 
 * @return {string} The hash string
 */
GameMsg.prototype.toEvent = function () {
	return this.action + '.' + this.target;
}; 

// ## Closure
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);