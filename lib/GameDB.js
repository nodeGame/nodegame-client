(function (exports, node) {
	
	
	/**
	 * 
	 * GameDB provides a simple, lightweight NO-SQL database for nodeGame.
	 * 
	 * Selecting methods returning a new GameDB obj (can be concatenated):
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
	
	var JSUS = node.JSUS;
	var NDDB = node.NDDB;
		
	var GameState = node.GameState;
	
	// Inheriting from NDDB	
	GameDB.prototype = JSUS.clone(NDDB.prototype);
	GameDB.prototype.constructor = GameDB;
	
	/**
	 * Expose constructors
	 */
	exports.GameDB = GameDB;
	exports.GameBit = GameBit;

	/**
	 * GameDB interface
	 *
	 * @api public
	 */
	
	function GameDB (options, db, parent) {
		options = options || {};
		
		// Auto build indexes
		if (!options.update) options.update = {};
		options.update.indexes = true;
		
		NDDB.call(this, options, db, parent);
		
		this.c('state', GameBit.compareState);
		  
		
		if (!this.player) {
			this.h('player', function(gb) {
				return gb.player;
			});
		}
		if (!this.state) {
			this.h('state', function(gb) {
				return GameState.toHash(gb.state, 'S.s.r');
			});
		}  
		if (!this.key) {
			this.h('key', function(gb) {
				return gb.key;
			});
		}
		
	}
	
	GameDB.prototype.add = function (key, value, player, state) {
		state = state || node.game.gameState;
		player = player || node.player;

		this.insert(new GameBit({
							player: player, 
							key: key,
							value: value,
							state: state,
		}));

		return true;
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
		this.time = (Date) ? Date.now() : null;
	};
	
	
	
	GameBit.prototype.toString = function () {
		return this.player + ', ' + GameState.stringify(this.state) + ', ' + this.key + ', ' + this.value;
	};
	
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
	
//	GameBit.compareValueByKey = function (key) {
//	    return function (a,b) {
//	        return (a.value[key] < b.value[key]) ? -1 : (a.value[key] > b.value[key]) ? 1 : 0;
//	    }
//	}

	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);