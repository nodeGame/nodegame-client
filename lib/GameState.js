/**
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Representation of the state of the game in 
 * 
 * 	- State
 * 	- Step
 * 	- Round
 * 	- Load Level (is)
 * 	- Paused / Playing
 * 
 */

(function (exports, node) {
	
	var JSUS = node.JSUS;
	
	// Expose constructor
	exports.GameState = GameState;
	
	// ### GameState Load levels
	GameState.iss = {};
	GameState.iss.UNKNOWN = 0; 		// Game has not been initialized
	GameState.iss.LOADING = 10;		// The game is loading
	GameState.iss.LOADED  = 25;		// Game is loaded, but the GameWindow could still require some time
	GameState.iss.PLAYING = 50;		// Everything is ready
	GameState.iss.DONE = 100;		// The player completed the game state
	
	GameState.defaults = {};
	GameState.defaults.hash = 'S.s.r.i.p';
	
	/**
	 * ## GameState Constructor
	 * 
	 * Creates an instance of a GameState from an object literal
	 * or from an hash string of the format `GameState.defaults.hash`.
	 * 
	 * If no parameter is passed, all the properties of the GameState 
	 * object are set to 0
	 * 
	 * @param {object|string} gs An object literal | hash string representing the game state
	 */
	function GameState (gs) {
		
		if ('string' === typeof gs) {
			var tokens = gs.split('.');		
			this.state = 	('undefined' !== typeof tokens[0]) ? Number(tokens[0]) : undefined;
			this.step = 	('undefined' !== typeof tokens[1]) ? Number(tokens[1]) : undefined;
			this.round = 	('undefined' !== typeof tokens[2]) ? Number(tokens[2]) : undefined;
			this.is = 		('undefined' !== typeof tokens[3]) ? Number(tokens[3]) : GameState.iss.UNKNOWN;
			this.paused = 	(tokens[4] === '1') ? true : false;
		}
		else if ('object' === typeof gs) {	
			this.state = 	gs.state;
			this.step = 	gs.step;
			this.round = 	gs.round;
			this.is = 		(gs.is) ? gs.is : GameState.iss.UNKNOWN;
			this.paused = 	(gs.paused) ? gs.paused : false;
		}
		else {
			this.state = 	0;
			this.step = 	0;
			this.round = 	0;
			this.is = 		GameState.iss.UNKNOWN;
			this.paused = 	false;
		}
	}
	
	/**
	 * ## GameState.toString
	 * 
	 * Converts the current instance of GameState to a string
	 * 
	 * @return {string} out The string representation of the state of the GameState
	 */
	GameState.prototype.toString = function () {
		var out = this.toHash('(r) S.s');
		if (this.paused) {
			out += ' [P]';
		}
		return out;
	};
	
	/**
	 * ## GameState.toHash
	 * 
	 * Returns a simplified hash of the state of the GameState,
	 * according to the input string
	 * 
	 * @param {string} str The hash code
	 * @return {string} hash The hashed game states
	 * 
	 * @see GameState.toHash (static)
	 */
	GameState.prototype.toHash = function (str) {
		return GameState.toHash(this, str);
	};
	
	/**
	 * ## GameState.toHash (static)
	 * 
	 * Returns a simplified hash of the state of the GameState,
	 * according to the input string. 
	 * 
	 * The following characters are valid to determine the hash string
	 * 
	 * 	- S: state
	 * 	- s: step
	 * 	- r: round
	 * 	- i: is
	 * 	- P: paused
	 * 
	 * E.g. 
	 * 
	 * ```javascript
	 * 		var gs = new GameState({
	 * 							round: 1,
	 * 							state: 2,
	 * 							step: 1,
	 * 							is: 50,
	 * 							paused: false,
	 * 		});
	 * 
	 * 		gs.toHash('(R) S.s'); // (1) 2.1
	 * ```
	 * 
	 * @param {GameState} gs The game state to hash
	 * @param {string} str The hash code
	 * @return {string} hash The hashed game states
	 */
	GameState.toHash = function (gs, str) {
		if (!gs || 'object' !== typeof gs) return false;
		if (!str || !str.length) return gs.toString();
		
		var hash = '',
			symbols = 'Ssrip',
			properties = ['state', 'step', 'round', 'is', 'paused'];
		
		for (var i = 0; i < str.length; i++) {
			var idx = symbols.indexOf(str[i]); 
			hash += (idx < 0) ? str[i] : Number(gs[properties[idx]]);
		}
		return hash;
	};
	
	/**
	 * ## GameState.compare (static)
	 * 
	 * Compares two GameState objects|hash strings and returns
	 * 
	 *  - 0 if they represent the same game state
	 *  - a positive number if gs1 is ahead of gs2 
	 *  - a negative number if gs2 is ahead of gs1 
	 * 
	 * If the strict parameter is set, also the `is` property is compared,
	 * otherwise only `round`, `state`, and `step`
	 * 
	 * The accepted hash string format is the following: 'S.s.r.i.p'.
	 * Refer to `GameState.toHash` for the semantic of the characters.
	 * 
	 * 
	 * @param {GameState|string} gs1 The first GameState object|string to compare
	 * @param {GameState|string} gs2 The second GameState object|string to compare
	 * @param {Boolean} strict If TRUE, also the `is` attribute is checked
	 * 
	 * @return {Number} result The result of the comparison
	 * 
	 * @see GameState.toHash (static)
	 * 
	 */
	GameState.compare = function (gs1, gs2, strict) {
		if (!gs1 && !gs2) return 0;
		if (!gs2) return 1;
		if (!gs1) return -1;

		strict = strict || false;

		// Convert the parameters to objects, if an hash string was passed
		if ('string' === typeof gs1) gs1 = new GameState(gs1);
		if ('string' === typeof gs2) gs2 = new GameState(gs2);
		
		
// <!--		
//		console.log('COMPARAING GSs','DEBUG')
//		console.log(gs1,'DEBUG');
//		console.log(gs2,'DEBUG');
// --!>
		var result = gs1.state - gs2.state;
		
		if (result === 0 && 'undefined' !== typeof gs1.round) {
			result = gs1.round - gs2.round;
			
			if (result === 0 && 'undefined' !== typeof gs1.step) {
				result = gs1.step - gs2.step;
				
				if (strict && result === 0 && 'undefined' !== typeof gs1.is) {
					result = gs1.is - gs2.is;
				}
			}
		}
		
//		<!--		
//		console.log('EQUAL? ' + result);
//		--!>		
		
		return result;
	};
	
	/**
	 * ## GameState.stringify (static)
	 * 
	 * Converts an object GameState-like to its string representation
	 * 
	 * @param {GameState} gs The object to convert to string	
	 * @return {string} out The string representation of a GameState object
	 */ 
	GameState.stringify = function (gs) {
		if (!gs) return;
		var out = new GameState(gs).toHash('(r) S.s_i');
		if (gs.paused) out += ' [P]';
		return out;
	}; 

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
