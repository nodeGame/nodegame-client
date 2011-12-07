(function (exports, node) {
	
	/**
	 * 
	 * GameStorage provides a simple, lightweight NO-SQL database for nodeGame.
	 * 
	 * Selecting methods returning a new GameStorage obj (can be concatenated):
	 * 
	 * 		- filter 			-> execute callback
	 * 		- select			-> evaluate string
	 * 		- get				-> evaluate an obj
	 * 		- sort 				->
	 * 		- reverse			->
	 * 		
	 * Return an array of GameBits or their values:
	 * 
	 * 		- fetch
	 * 
	 * TODO: update and delete methods
	 * 
	 */
	
	
	var GameState = node.GameState;
	var Utils = node.Utils;
		
	/**
	 * Expose constructors
	 */
	exports.GameStorage = GameStorage;
	exports.GameBit = GameBit;
	
	
	/**
	 * GameStorage interface
	 *
	 * @api public
	 */
	
	function GameStorage (game, options, storage) {
	  this.game = game;
	  this.options = options;
	  //this.clients = {};
	  this.storage = storage || [];
	};
	
	GameStorage.prototype.add = function (player, key, value, state) {
		var state = state || this.game.gameState;

		this.storage.push(new GameBit({
										player: player, 
										key: key,
										value: value,
										state: state
		}));

		return true;
	};
	
	// Sorting Operation
	
	GameStorage.prototype.reverse = function () {
		return new GameStorage(this.game, this.options, this.storage.reverse());
	};
	
	/**
	 * Sort the game storage according to a certain criteria. 
	 * If not criteria is passed sort by player name.
	 * 
	 */
	GameStorage.prototype.sort = function(func) {
		var func = func || GameBit.comparePlayer;
		return new GameStorage(this.game, this.options, this.storage.sort(func));
	};
	
	GameStorage.prototype.sortByPlayer = function() {
		return this.storage.sort(GameBit.comparePlayer);
	}
	
	GameStorage.prototype.sortByState = function() {
		return this.storage.sort(GameBit.compareState);
	}
	
	GameStorage.prototype.sortByKey = function() {
		return this.storage.sort(GameBit.compareKey);
	}
	
	GameStorage.prototype.sortByValue = function(key) {
		
		if (!key) {
			return this.storage.sort(GameBit.compareValue);
		}
		else {			
			var func = GameBit.compareValueByKey(key);
			return this.storage.sort(func);
		}
	};
	
	GameStorage.prototype.dump = function (reverse) {
		return this.storage;
	};	
	
	GameStorage.prototype.toString = function () {
		var out = '';
		for (var i=0; i< this.storage.length; i++) {
			out += this.storage[i] + '\n'
		}	
		return out;
	};	
	
	// Get Objects
	
	/**
	 * Retrieves specific information of combinations of the keys @client,
	 * @state, and @id
	 * 
	 */
	GameStorage.prototype.get = function (gamebit) {
		if (!gamebit) return this.storage;
		var out = [];
		
		for (var i=0; i< this.storage.length; i++) {
			if (GameBit.compare(gamebit,this.storage[i])){
				out.push(this.storage[i]);
			}
		}	
		return new GameStorage(this.game, this.options, out);		
	};
	
	GameStorage.prototype.getByPlayer = function (player) {
		return this.get(new GameBit({player:player}));
	};
	
	GameStorage.prototype.getByState = function (state) {
		return this.get(new GameBit({state:state}));
	};
	
	GameStorage.prototype.getByKey = function (key) {
		return this.get(new GameBit({key:key}));
	};
	
	GameStorage.prototype.select = function (conditionString) {
		
		var func = function (elem) {
			try {
				return Utils.eval('this.' + conditionString, elem);
			}
			catch(e) {
					console.log('Malformed query ' + conditionString);
					return false;
				};
		}
		
		return this.filter(func);
	};
	
	GameStorage.prototype.filter = function (func) {
		return new GameStorage(this.game, this.options, this.storage.filter(func));
	};
	
	// Get Values

	GameStorage.prototype.split = function () {

		var out = [];
		
		for (var i=0; i < this.storage.length; i++) {
			out = out.concat(this.storage[i].split());
		}	
		
		console.log(out);
		
		return new GameStorage(this.game, this.options, out);
	};
	
	
	GameStorage.prototype.fetch = function (key) {
		
		
		switch (key) {
			case 'VALUES_ONLY': 
				var func = GameBit.prototype.getValues;
				break;
			case 'KEY_VALUES':
				var func = GameBit.prototype.getKeyValues; 
				break;
			default:
				key = false;
		}
		
		if (!key) return this.storage;
		
		
		var out = [];
		
		for (var i=0; i < this.storage.length; i++) {
			
			out.push(func.call(this.storage[i]));
			
//			var line = func.call(this.storage[i]);
//			for (var j=0; j < line.length; j++) {
//				// We can have one or two nested arrays
//				// We need to open the first array to know it
//				if ('object' === typeof line[j]) {
//					out.push(line[j]);
//				}
//				else {
//					out.push(line);
//					break; // do not add line[j] multiple times
//				}
//				
//			}
		}	
		
		//console.log(out);
		
		return out;
	};
	
	GameStorage.prototype.fetchArray = function (key) {
		var out = Utils.obj2Array(this.fetch(key));
		return out;
	};
	
	
	
	GameStorage.prototype.fetchValues = function () {
		return this.fetch('VALUES_ONLY');
	};
	
	GameStorage.prototype.fetchKeyValues = function () {
		return this.fetch('KEY_VALUES');
	};
	
	GameStorage.prototype.fetchValuesArray = function () {
		return this.fetchArray('VALUES_ONLY');
	};
	
	GameStorage.prototype.fetchKeyValuesArray = function () {
		return this.fetchArray('KEY_VALUES');
	};
	
	
	/**
	 * GameBit
	 * 
	 * Container for a bit of relevant information for the game
	 */
	
	function GameBit (options) {
		
		this.state = options.state;
		this.player = options.player;
		this.key = options.key;
		this.value = options.value;
	};
	
	GameBit.prototype.isComplex = function() {
		return ('object' === typeof this.value) ? true : false;
	};
	
//	GameBit.prototype.getValues = function (head, split) {		
//		
//		var head = head || []; // the rest is appended here
//		var split = ('undefined' === typeof split) ? split : false; 
//		
//		if (!this.isComplex()) {
//			var out = head;
//			out.push(this.value);
//			return out;
//		}
//		
//		var out = [];
//		var line = head.slice(0); // Clone the head array without pointing to same ref
//		
//		if (split) {
//			for (var i in this.value) {
//				if (this.value.hasOwnProperty(i)) {
//					line.push(i);
//					line.push(this.value[i]);
//					out.push(line);
//					line = head.slice(0);
//				}
//			}
//		}
//		else {
//			out = line.concat(Utils.obj2KeyedArray(this.value));
//			//console.log('eeeh');
//		}
//		
//		//console.log(out);
//		return out;
//	};
	
	GameBit.prototype.split = function () {		
			
		
		if (!this.isComplex()) {
			return Utils.clone(this);;
		}
		
		var model = {};
		var out = [];
		
		if ('undefined' !== typeof this.player) {
			model.player = this.player;
		}
		
		if ('undefined' !== typeof this.state) {
			model.state = this.state;
		}
			
		if ('undefined' !== typeof this.key) {
			model.key = this.key;
		}
		
		for (var i in this.value) {
			var copy = Utils.clone(model);
			copy.value = {};
			if (this.value.hasOwnProperty(i)) {
				copy.value[i] = this.value[i]; 
				out.push(copy);
			}
		}
		
//		console.log('eeeh');
//		console.log(out);
		return out;
	};
	
	
	GameBit.prototype.getValues = function () {		
		return this.value;
	};
		
	GameBit.prototype.getKeyValues = function () {
		return {key: this.key, value: this.value};
	};
	
	GameBit.prototype.toArray = function (split) {
		var out = [this.player, this.state, this.key];
		
		if (!this.isComplex()) {
			out.push(this.value);
		}
		else {
			out.concat(Utils.obj2KeyedArray(this.value));
		}
		
		return out;
	};
	
	GameBit.prototype.toString = function () {
//		console.log(GameState.stringify(this.state));
		return this.player + ', ' + GameState.stringify(this.state) + ', ' + this.key + ', ' + this.value;
	};
	
//	GameBit.prototype.condition = function (conditionString) {
//		return this.filter(function() {
//			try {
//				return Utils.eval('this.' + conditionString, this);
//			}
//			catch(e) {
//				node.log('Malformed query ' + conditionString);
//				return this;
//			};
//		});
//	};
//	
//	GameBit.prototype.filter = function (func) {
//		console.log(func);
//		return func.call(this);
//	};
	
	/** 
	 * Compares two GameBit objects.
	 * The Comparison is made only if the attributes are set in the first object
	 * Return true if the attributes of gb1 (player, state, and key) are identical. 
	 * Undefined values are skip.
	 *  
	 * If strict is set, it compares also the values of the two objects.
	 *  
	 */
	GameBit.compare = function (gb1, gb2, strict) {
		if(!gb1 || !gb2) return false;
		var strict = strict || false;
		if (gb1.player && GameBit.comparePlayer(gb1, gb2) !== 0) return false;
		if (gb1.state && GameBit.compareState(gb1, gb2) !== 0) return false;
		if (gb1.key && GameBit.compareKey(gb1, gb2) !== 0) return false;
		if (strict && gb1.value && GameBit.compareValue(gb1, gb2) !== 0) return false;
		return true;	
	};
	
	GameBit.comparePlayer = function (gb1, gb2) {
		if (gb1.player === gb2.player) return 0;
		// Assume that player is a numerical id
		if (gb1.player > gb2.player) return 1;
		return -1;
	};
	
	GameBit.compareState = function (gb1, gb2) {
		return GameState.compare(gb1.state,gb2.state);
	};
	
	GameBit.compareKey = function (gb1, gb2) {
		if (gb1.key === gb2.key) return 0;
		// Sort alphabetically or by numerically ascending
		if (gb1.key > gb2.key) return 1;
		return -1;
	};
	
	GameBit.compareValue = function (gb1, gb2) {
		if (gb1.value === gb2.value) return 0;
		// Sort alphabetically or by numerically ascending
		if (gb1.value > gb2.value) return 1;
		return -1;
	};	
	
	GameBit.compareValueByKey = function (key) {
	    return function (a,b) {
	        return (a.value[key] < b.value[key]) ? -1 : (a.value[key] > b.value[key]) ? 1 : 0;
	    }
	}

	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);

// @TODO check this comments

/**
 * Write data into the memory of a client.
 * It overwrites data with the same key.
 * @data can be an object, or an object containing other objects,
 * but these cannot contain other objects in turn.
 * 
 * @param {String} client
 * @param {Object} data
 * @param {String} state
 * 
 * @api public
 */


/** 
 *  Reverse the memory: instead of the history of a player for all rounds,
 *  we get the history of a round of all players
 */


/**
 * Returns an array of arrays. Each row is unique combination of:
 * 
 * A) state, client, key1, key2, value
 * 
 * or 
 * 
 * B) state, client, key1, value
 * 
 * Since getLine returns the same array of array, the task is here to merge
 * all together.
 * 
 */

