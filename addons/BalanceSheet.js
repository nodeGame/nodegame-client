/**
 * 
 * # BalanceSheet: 
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Keeps a record of 
 * 
 * ---
 * 
 */

(function(exports, node){

// ## Global scope

	
exports.BalanceSheet = BalanceSheet;


var	JSUS = node.JSUS,
	NDDB = node.NDDB,
	GameDB = node.GameDB,
	GameBit = node.GameBit;
	
	PlayerList = node.PlayerList;

////Inheriting from NDDB	
//BalanceSheet.prototype = JSUS.clone(NDDB.prototype);
//BalanceSheet.prototype.constructor = BalanceSheet;

var log = console.log;

var isValidSheet = function (sheet) {
	if (!sheet) {
		log('Cannot add a sheet with no name.', 'ERR');
		return false;
	}
	
	if (this.sheets[sheet]) {
		log('A sheet with the same already exists: ' + sheet);
		return false;
	}
	return true;
}

/**
 * ## BalanceSheet constructor
 * 
 * Creates a new instance of BalanceSheet
 * 
 */
function BalanceSheet (options) {
	

// ## Public properties
	
	this.sheets = {};
	
	this.sheet = null;
	
	log = options.log || log;

/**
 * ### BalanceSheet.options
 * 
 * Reference to current configuration
 * 
 */	
	this.options = options || {};

// ## BalanceSheet methods

/**
 * ### BalanceSheet.init
 * 
 * Configures the BalanceSheet instance
 * 
 * Takes the configuration as an input parameter or 
 * recycles the settings in `this.options`.
 * 
 * The configuration object is of the type
 * 
 * 	var options = {
 * 		returnAt: 'first', // or 'last'
 * 		triggers: [ myFunc,
 * 					myFunc2 
 * 		],
 * 	} 
 * 	 
 * @param {object} options Optional. Configuration object
 * 
 */
BalanceSheet.prototype.init = function (options) {
	this.options = options || this.options;
	if (this.options.returnAt === BalanceSheet.first || this.options.returnAt === BalanceSheet.last) {
		this.returnAt = this.options.returnAt;
	}
	this.resetTriggers();
};

/**
 * ### BalanceSheet.addSheet
 * 
 * Adds a new sheet and sets it as default
 * 
 * @param {string} sheet The sheet name
 * @param {object} options. Optional. Configuration options for the sheet
 * @param {array} items. Optional. An initial set of items for the sheet
 * @return {boolean} TRUE, if the sheet is added successfully
 */
//BalanceSheet.prototype.addSheet = function (sheet, pl, options) {
//	if (!isValidSheet(sheet)) return false;
//	pl = pl || new PlayerList();
//	
//	this.sheets[sheet] = pl;
//	
//	if (!this.initSheet(sheet, options)) {
//		return false;
//	}
//	
//	this.sheet = sheet;
//	return true;
//};

//BalanceSheet.prototype.initSheet = function (sheet, options) {
//	if  (!isValidSheet(sheet)) return false;
//	this.sheets[sheet].each(function(p){
//		if (!p.__balance) {
//			p.__balance = 0;
//		}
//	});
//};

BalanceSheet.prototype.updateBalance = function (player, amount) {
	if (!player || !amount) return;
	if (!this.sheet) {
		log('No balance sheet selected');
		return;
	}
	if (!this.sheet.player)
		return
	}
	this.sheet.players[player].__balance += amount;
};

BalanceSheet.prototype.report = function (sheet) {
	if (!isValidSheet(sheet)) return false;
	
	
	return this.sheets[sheet].keep(['__balance']);
	
	
};

/**
 * ### BalanceSheet.clear
 * 
 * Clears the trigger array
 * 
 * Requires a boolean parameter to be passed for confirmation
 * 
 * @param {boolean} clear TRUE, to confirm clearing
 * @return {boolean} TRUE, if clearing was successful
 */
BalanceSheet.prototype.clear = function (clear) {
	if (!clear) {
		node.log('Do you really want to clear the current BalanceSheet obj? Please use clear(true)', 'WARN');
		return false;
	}
	triggersArray = [];
	return clear;
};
	
// # Sheet

//Inheriting from NDDB	
Sheet.prototype = JSUS.clone(GameDB.prototype);
Sheet.prototype.constructor = Sheet;

function Sheet(options, db, parent) {
	options = options || {};
	if (!options.log) options.log = node.log;
	GameDB.call(this, options, db, parent);
	
	this.name;
	this.pl;
}

/**
 * ### GameDB.add
 * 
 * Creates a GameBit and adds it to the database
 * 
 * @param {string} key An alphanumeric id for the entry
 * @param {mixed} value Optional. The value to store
 * @param {Player} player Optional. The player associated to the entry. Defaults, node.player
 * @param {GameState} player Optional. The state associated to the entry. Defaults, node.game.state
 * 
 * @return {boolean} TRUE, if insertion was successful
 * 
 * @see GameBit
 */
Sheet.prototype.add = function (player, value, state, key) {
	if (!key) return false;
	
	state = state || node.game.state;
	player = player || node.player;

	this.insert(new GameBit({
						player: player, 
						key: key,
						value: value,
						state: state,
	}));

	return true;
};


Sheet.prototype.init = function(options) {
	NDDB.prototype.init.call(this, options);
	
	options = options || this.options;
};




// ## Closure	
})(
	('undefined' !== typeof node) ? node : module.exports
  , ('undefined' !== typeof node) ? node : module.parent.exports
);