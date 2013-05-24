/**
 * # PlayerList
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Stores a collection of `Player` objects and offers methods
 * to perform operation on them
 * 
 * ---
 * 
 */

(function (exports, node) {


// ## Global scope
	
// Setting up global scope variables 
var	JSUS = node.JSUS,
	NDDB = node.NDDB;

var GameStage = node.GameStage;

// Exposing constructor
exports.PlayerList = PlayerList;

// Inheriting from NDDB	
PlayerList.prototype = new NDDB();
PlayerList.prototype.constructor = PlayerList;


///**
// * ## PlayerList.array2Groups (static)
// * 
// * Transforms an array of array (of players) into an
// * array of PlayerList instances and returns it.
// * 
// * The original array is modified.
// * 
// * @param {Array} array The array to transform
// * @return {Array} array The array of `PlayerList` objects
// * 
// */
//PlayerList.array2Groups = function (array) {
//	if (!array) return;
//	for (var i = 0; i < array.length; i++) {
//		array[i] = new PlayerList({}, array[i]);
//	};
//	return array;
//};

/**
 * ### PlayerList.comparePlayers
 * 
 * Comparator functions between two players
 * 
 * @param {Player} p1 The first player
 * @param {Player} p2 The second player
 * @return {number} The result of the comparison
 * 
 * @see NDDB.globalCompare
 */
PlayerList.comparePlayers = function (p1, p2) {
	if (p1.id === p2.id) return 0;
	if (p1.count < p2.count) return 1;
	if (p1.count > p2.count) return -1;
	return 0;
};

/**
 * ## PlayerList constructor
 *
 * Creates an instance of PlayerList
 * 
 * The class inherits his prototype from `node.NDDB`.
 * 
 * It indexes players by their _id_.
 * 
 * @param {object} options Optional. Configuration object
 * @param {array} db Optional. An initial set of players to import 
 * @param {PlayerList} parent Optional. A parent object for the instance
 * 
 * @see NDDB.constructor
 */
function PlayerList (options, db) {
	options = options || {};
	if (!options.log) options.log = node.log;
	if (!options.update) options.update = {};
	if ('undefined' === typeof options.update.indexes) {
		options.update.indexes = true;
	}
	
	NDDB.call(this, options, db);
  
	// Assigns a global comparator function
	this.globalCompare = PlayerList.comparePlayers;
	

	// We check if the index are not existing already because 
	// it could be that the constructor is called by the breed function
	// and in such case we would duplicate them	
	if (!this.id) {
		this.index('id', function(p) {
			return p.id;
		});
	}

// Not sure if we need it now	
//	if (!this.stage) {
//		this.hash('stage', function(p) {
//			return p.stage.toHash();
//		}
//	}
	
	// The internal counter that will be used to assing the `count` 
	// property to each inserted player
	this.pcounter = this.db.length || 0;
};

// ## PlayerList methods

/**
 * ### PlayerList.add 
 * 
 * Adds a new player to the database
 * 
 * Before insertion, objects are checked to be valid `Player` objects,
 * that is they must have a unique player id.
 * 
 * The `count` property is added to the player object, and 
 * the internal `pcounter` variable is incremented.
 * 
 * @param {Player} player The player object to add to the database
 * @return {player|boolean} The inserted player, or FALSE if an error occurs
 */
PlayerList.prototype.add = function (player) {
	if (!player || 'undefined' === typeof player.id) {
		node.err('Player id not found, cannot add object to player list.');
		return false;
	}

	if (this.exist(player.id)) {
		node.err('Attempt to add a new player already in the player list: ' + player.id);
		return false;
	}
	
	this.insert(player);
	player.count = this.pcounter;
	this.pcounter++;
	
	return player;
};

/**
 * ### PlayerList.get 
 * 
 * Retrieves a player with the given id
 * 
 * @param {number} id The id of the player to retrieve
 * @return {Player|boolean} The player with the speficied id, or FALSE if none was found
 */
PlayerList.prototype.get = function (id) {	
	if ('undefined' === typeof id) return false; 
	var player = this.id.get(id);
	if (!player) {
		node.warn('Attempt to access a non-existing player from the the player list. id: ' + id);
		return false;
	}
	return player;
};

/**
 * ### PlayerList.remove
 * 
 * Removes the player with the given id
 * 
 * Notice: this operation cannot be undone
 * 
 * @param {number} id The id of the player to remove
 * @return {object|boolean} The removed player object, or FALSE if none was found  
 */
PlayerList.prototype.remove = function (id) {
	if ('undefined' === typeof id) return false; 
	var player = this.id.pop(id);
	if (!player) {
		node.err('Attempt to remove a non-existing player from the the player list. id: ' + id);
		return false;
	}
	return player;
};

// ### PlayerList.pop
// @deprecated 
// TODO remove after transition is complete
PlayerList.prototype.pop = PlayerList.prototype.remove;

/**
 * ### PlayerList.exist
 * 
 * Checks whether a player with the given id already exists
 * 
 * @param {number} id The id of the player
 * @return {boolean} TRUE, if a player with the specified id is found
 */
PlayerList.prototype.exist = function (id) {
	return this.id.get(id) ? true : false;
};

/**
 * ### PlayerList.updatePlayerStage
 * 
 * Updates the value of the `stage` object of a player
 * 
 * @param {number} id The id of the player
 * @param {GameStage} stage The new stage object
 * @return {object|boolean} The updated player object, or FALSE is an error occurred
 */
PlayerList.prototype.updatePlayerStage = function (id, stage) {
	
	if (!this.exist(id)) {
		node.warm('Attempt to access a non-existing player from the the player list ' + player.id);
		return false;	
	}
	
	if ('undefined' === typeof stage) {
		node.warn('Attempt to assign to a player an undefined stage');
		return false;
	}
	
	return this.id.update(id, {
		stage: stage
	});
};

/**
 * ### PlayerList.isStageDone
 * 
 * Checks whether all players have terminated the specified stage
 * 
 * A stage is considered _DONE_ if all players that are on that stage
 * have the property `stageLevel` equal to `Game.stageLevels.DONE`.
 * 
 * Players at other stages are ignored.
 * 
 * If no player is found at the desired stage, it returns FALSE.
 * 
 * @param {GameStage} stage The GameStage of reference
 * @param {boolean} extended Optional. If TRUE, all players are checked. Defaults, FALSE.
 * @return {boolean} TRUE, if all checked players have terminated the stage
 */
PlayerList.prototype.isStageDone = function (stage) {
	if (!stage) return false;
	var pfound = false;
	for (var i = 0; i < this.db.length ;  i++) {
		// Player is at another stage
		if (GameStage.compare(stage, p.stage, false) !== 0) {
			continue;
		}
		// Player is done for his stage
		if (p.stageLevel !== node.Game.stageLevels.DONE) {
			return false;
		}
		else {
			pfound = true;
		}
	}
	return pfound;
};

///**
// * ### PlayerList.actives
// * 
// * Counts the number of player whose stage is different from 0:0:0
// * 
// * @return {number} result The number of player whose stage is different from 0:0:0
// * 
// */
//PlayerList.prototype.actives = function () {
//	var result = 0;
//	var gs;
//	this.each(function(p) {
//		gs = new GameStage(p.stage);	
//		// <!-- Player is on 0.0.0 stage -->
//		if (GameStage.compare(gs, new GameStage()) !== 0) {
//			result++;
//		}
//	});	
//	// <!-- node.log('ACTIVES: ' + result); -->
//	return result;
//};

///**
// * ### PlayerList.checkStage
// * 
// * If all the players are DONE with the specfied stage,
// * emits a `STAGEDONE` event
// * 
// * @param {GameStage} stage Optional. The GameStage to check. Defaults stage = node.game.stage
// * @param {Boolean} extended Optional. If TRUE, also newly connected players are checked. Defaults, FALSE
// * 
// * 		@see `PlayerList.actives`
// * 		@see `PlayerList.isStageDone`
// * 
// */
//PlayerList.prototype.checkStage = function (stage, extended) {
//	if (this.isStageDone(stage, extended)) {
//		node.emit('STAGEDONE');
//	}
//};

/**
 * ### PlayerList.toString
 * 
 * Returns a string representation of the stage of the 
 * PlayerList
 * 
 * @param {string} eol Optional. End of line separator between players
 * @return {string} out The string representation of the stage of the PlayerList
 */
PlayerList.prototype.toString = function (eol) {
	var out = '', EOL = eol || '\n', stage;
	this.forEach(function(p) {
    	out += p.id + ': ' + p.name;
    	stage = new GameStage(p.stage);
    	out += ': ' + stage + EOL;
	});
	return out;
};

/**
 * ### PlayerList.getNGroups
 * 
 * Creates N random groups of players
 * 
 * @param {number} N The number of groups
 * @return {Array} Array containing N `PlayerList` objects 
 * 
 * 		@see `JSUS.getNGroups`
 */
PlayerList.prototype.getNGroups = function (N) {
	if (!N) return;
	var groups = JSUS.getNGroups(this.db, N);
	return PlayerList.array2Groups(groups);
};	

/**
 * ### PlayerList.getGroupsSizeN
 * 
 * Creates random groups of N players
 * 
 * @param {number} N The number player per group
 * @return {Array} Array containing N `PlayerList` objects 
 * 
 * 		@see `JSUS.getGroupsSizeN`
 */
PlayerList.prototype.getGroupsSizeN = function (N) {
	if (!N) return;
	var groups = JSUS.getGroupsSizeN(this.db, N);
	return PlayerList.array2Groups(groups);
};	

/**
 * ### PlayerList.getRandom
 * 
 * Returns a set of N random players 
 * 
 * @param {number} N The number of random players to include in the set. Defaults N = 1
 * @return {Player|Array} A single player object or an array of
 */
PlayerList.prototype.getRandom = function (N) {	
	if (!N) N = 1;
	if (N < 1) {
		node.err('N must be an integer >= 1');
		return false;
	}
	this.shuffle();
	return this.limit(N).fetch();
};


/**
 * # Player Class
 * 
 * A Player object is a wrapper object for a number of properties 
 * to associate to a player during the game. 
 * 
 * Some of the properties are `private` and can never be changed 
 * after an instance of a Player has been created. Defaults one are:
 * 
 * 	`sid`: The Socket.io session id associated to the player
 * 	`id`: The nodeGame session id associate to the player
 * 	`count`: The id of the player within a PlayerList object
 * 	`admin`: Whether the player is an admin
 * 	`disconnected`: Whether the player has disconnected
 * 
 * Others properties are public and can be changed during the game.
 * 
 *	`name`: An alphanumeric name associated to the player 
 *	`stage`: The current stage of the player as relative to a game
 *	`ip`: The ip address of the player
 * 
 * All the additional properties in the configuration object passed 
 * to the constructor are also created as *private* and cannot be further
 * modified during the game. 
 * 
 * For security reasons, non-default properties cannot be `function`, and 
 * cannot overwrite any previously existing property.
 * 
 * ---
 * 
 */


// Expose Player constructor
exports.Player = Player;

/**
 * ## Player constructor
 * 
 * Creates an instance of Player
 * 
 * @param {object} pl The object literal representing the player
 * 
 * 
 */
function Player (pl) {
	pl = pl || {};
	
// ## Private properties
	
/**
 * ### Player.sid
 * 
 * The session id received from the nodeGame server 
 * 
 */	
	var sid = pl.sid;
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'sid', {
			value: sid,
	    	enumerable: true
		});
	}
	else {
		this.sid = sid;
	}
	
/**
 * ### Player.id
 * 
 * The nodeGame session id associate to the player 
 * 
 * Usually it is the same as the Socket.io id, but in 
 * case of reconnections it can change
 * 
 */	
	var id = pl.id || sid;
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
 * ### Player.count
 * 
 * The ordinal position of the player in a PlayerList object
 * 
 * 	@see PlayerList
 */		
	var count = pl.count;
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'count', {
	    	value: count,
	    	enumerable: true
		});
	}
	else {
		this.count = count;
	}
	
/**
 * ### Player.admin
 * 
 * The admin status of the client
 * 
 */	
	var admin = !!pl.admin;
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'admin', {
			value: admin,
	    	enumerable: true
		});
	}
	else {
		this.admin = admin;
	}
	
/**
 * ### Player.disconnected
 * 
 * The connection status of the client
 * 
 */	
	var disconnected = !!pl.disconnected;
	if (node.support.defineProperty) {
		Object.defineProperty(this, 'disconnected', {
			value: disconnected,
	    	enumerable: true
		});
	}
	else {
		this.disconnected = disconnected;
	}
	
// ## Player public properties

/**
 * ### Player.ip
 * 
 * The ip address of the player
 * 
 * Note: this can change in mobile networks
 * 
 */		
 	this.ip = pl.ip;
 
/**
 * ### Player.name
 * 
 * An alphanumeric name associated with the player
 * 
 */	 
	this.name = pl.name;
	
/**
 * ### Player.stage
 * 
 * Reference to the game-stage the player currently is
 * 
 * 	@see node.game.stage
 * 	@see GameStage
 */		
	this.stage = pl.stage || new GameStage();

	
// ## Extra properties
// Non-default properties are all added as private
// For security reasons, they cannot be of type function, and they 
// cannot overwrite any previously defined variable
	for (var key in pl) {
		if (pl.hasOwnProperty(key)) {
			if ('function' !== typeof pl[key]) {
				if (!this.hasOwnProperty(key)) {
					this[key] = pl[key];
				}
			}
		}
	}
}

// ## Player methods

/**
 * ### Player.toString
 * 
 * Returns a string representation of a player
 * 
 * @return {string} The string representation of a player
 */
Player.prototype.toString = function() {
	return (this.name || '' ) + ' (' + this.id + ') ' + new GameStage(this.stage);
};
		
// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
