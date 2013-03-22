/**
 * # StageManager
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` container of game-state functions, and parameters
 * 
 * ---
 * 
 */
(function (exports, node) {
	
// ## Global scope
var GameState = node.GameState,
	J = node.JSUS;

exports.StageManager = StageManager;

/**
 * ## StageManager constructor
 * 
 * Creates a new instance of StageManager
 * 
 * Takes as input parameter an object like
 * 
 *	{ 1:
 *		{
 *			state: myFunc,
 *			rounds: numRounds, // optional, defaults 1
 *		},
 *	 2:
 *		{
 *			state: myNestedState,
 *			rounds: numRounds, // optional, defaults 1
 *		},	
 * 		// any arbitray number of state-objects is allowed
 * 	}
 * 
 * From the above example, the value of the `state` property 
 * can be a function or a nested state object (with internal steps). 
 * For example
 * 
 * 	myFunc = function() {};
 * 
 * 	myNestedState = {
 * 			1: {
 * 				state: myFunc2,
 * 			}
 * 			2: {
 * 				state: myFunc3,
 * 			}
 * 	}
 * 
 * @param {object} loop Optional. An object containing the loop functions
 * 
 */
function StageManager (stages) {
	// ### Public variables

/**
 * ### limits
 * 
 * Array containing the internal representation of the boundaries
 * of each state inside the game-loop
 * 
 * @api private
 */	
	this.limits = [];	
	
/**
 * ### StageManager.stages
 * 
 * Container for the verified stages
 */		
	this.stages = [];
	
	for (var key in stages) {
		if (this.loop.hasOwnProperty(key)) {
			
			// Transform the loop obj if necessary.
			// When a state executes only one step,
			// it is allowed to pass directly the name of the function.
			// So such function must be incapsulated in a obj here.
			var loop = this.loop[key].state;
			if ('function' === typeof loop) {
				var o = J.clone(this.loop[key]);
				this.loop[key].state = {1: o};
			}
			
			var steps = J.size(this.loop[key].state)
			
			var round = this.loop[key].rounds || 1;
			this.limits.push({rounds: round, steps: steps});
		}
	}
	
	
}

function StageManager (stages) {
	// ### Public variables

/**
 * ### limits
 * 
 * Array containing the internal representation of the boundaries
 * of each state inside the game-loop
 * 
 * @api private
 */	
	this.limits = [];	
	
/**
 * ### StageManager.loop
 * 
 * The transformed loop container
 */

		
	this.stages = [];
	
	for (var key in this.loop) {
		if (this.loop.hasOwnProperty(key)) {
			
			// Transform the loop obj if necessary.
			// When a state executes only one step,
			// it is allowed to pass directly the name of the function.
			// So such function must be incapsulated in a obj here.
			var loop = this.loop[key].state;
			if ('function' === typeof loop) {
				var o = J.clone(this.loop[key]);
				this.loop[key].state = {1: o};
			}
			
			var steps = J.size(this.loop[key].state)
			
			var round = this.loop[key].rounds || 1;
			this.limits.push({rounds: round, steps: steps});
		}
	}
	
	
}

// ## StageManager methods

/** 
 * ### GameStage.add
 * 
 * Adds a new entry into the array of stages
 * 
 */
StageManager.prototype.add = function(stage, pos) {
	if (!stage || J.isEmpty(stage)) {
		node.warn('Cannot add an empty entry to the game stage');
		return false;
	}
	if ('object' !== typeof stage) {
		node.warn('Cannot add an empty entry to the game stage');
		return false;
	}
	
	pos = pos || this.stages.length;
	
	this.stages.splice(pos, 0, stage);
	return true;
};

/**
 * ### StageManager.size
 * 
 * Returns the total number of states + steps in the game-loop
 * 
 */
StageManager.prototype.size = function() {
	if (!this.limits.length) return 0;
	return this.steps2Go(new GameState());
};

/**
 * ### StageManager.exist
 * 
 * Returns TRUE, if a gameState exists in the game-loop
 * 
 * @param {GameState|string} gameState The game-state to check
 */
StageManager.prototype.exist = function (sta) {
	if (!gameState) return false;
	gameState = new GameState(gameState);
	
	// States are 1 based, arrays are 0-based => -1
	var stageIdx = gameState.state - 1,
		stepIdx = gameState.step -1,
		rounds = gameState.rounds;
	
	if (!this.stages[stageIdx]) return false;
	if (!this.stages[stageIdx].steps[stepIdx]) return false;
	if (rounds > this.stages[stageIdx].rounds) return false;
	
		
	return true;
};

/**
 * ### StageManager.next
 * 
 * Returns the stage next stage
 * 
 * An optional input parameter can control the state from which 
 * to compute the next state
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.game.state
 * @return {GameState|boolean} The next game-state, or FALSE if it does not exist
 * 
 */
StageManager.prototype.next = function (gameState) {
	gameState = new GameState(gameState);
	
	// Game has not started yet, do it!
	if (gameState.state === 0) {
		return new GameState({
							 state: 1,
							 step: 1,
							 round: 1
		});
	}
	
	if (!this.exist(gameState)) {
		return false;
	}
	
	var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
	
	if (this.limits[idxLimit]['steps'] > gameState.step){
		var newStep = Number(gameState.step)+1;
		return new GameState({
			state: gameState.state,
			step: newStep,
			round: gameState.round
		});
	}
	
	if (this.limits[idxLimit]['rounds'] > gameState.round){
		var newRound = Number(gameState.round)+1;
		return new GameState({
			state: gameState.state,
			step: 1,
			round: newRound
		});
	}
	
	if (this.limits.length > gameState.state){		
		var newState = Number(gameState.state)+1;
		return new GameState({
			state: newState,
			step: 1,
			round: 1
		});
	}
	
	// No next state: game over
	return false; 
};

/**
 * ### StageManager.previous
 * 
 * Returns the previous state in the loop
 * 
 * An optional input parameter can control the state from which 
 * to compute the previous state
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.game.state
 * @return {GameState|boolean} The previous game-state, or FALSE if it does not exist
 */
StageManager.prototype.previous = function (gameState) {
	gameState = (gameState) ? new GameState(gameState) : node.game.state;
	
	if (!this.exist(gameState)) {
		node.log('No previous state of non-existing state: ' + gameState, 'WARN');
	}
	
	var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
	
	if (gameState.step > 1){
		var oldStep = Number(gameState.step)-1;
		return new GameState({
			state: gameState.state,
			step: oldStep,
			round: gameState.round
		});
	}
	else if (gameState.round > 1){
		var oldRound = Number(gameState.round)-1;
		var oldStep = this.limits[idxLimit]['steps'];
		return new GameState({
			state: gameState.state,
			step: oldStep,
			round: oldRound
		});
	}
	else if (gameState.state > 1){
		var oldRound = this.limits[idxLimit-1]['rounds'];
		var oldStep = this.limits[idxLimit-1]['steps'];
		var oldState = idxLimit;
		return new GameState({
			state: oldState,
			step: oldStep,
			round: oldRound
		});
	}
	
	// game init
	return false; 
};

/**
 * ### StageManager.getName
 * 
 * Returns the name associated with a game-state
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.game.state
 * @return {string|boolean} The name of the game-state, or FALSE if state does not exists
 */
StageManager.prototype.getName = function (gameState) {
	gameState = (gameState) ? new GameState(gameState) : node.game.state;
	if (!this.exist(gameState)) return false;
	return this.loop[gameState.state]['state'][gameState.step]['name'];
};

/**
 * ### StageManager.getFunction
 * 
 * Returns the function associated with a game-state
 * 
 * @param {GameState} gameState The reference game-state
 * @return {object|boolean} The function of the game-state, or FALSE if state does not exists
 */
StageManager.prototype.getFunction = function (gameState) {
	gameState = (gameState) ? new GameState(gameState) : node.game.state;
	if (!this.exist(gameState)) return false;
	return this.loop[gameState.state]['state'][gameState.step]['state'];
};

/**
 * ### StageManager.getAllParams
 * 
 * Returns all the parameters associated with a game-state
 * 
 * @param {GameState} gameState The reference game-state
 * @return {object|boolean} The state object, or FALSE if state does not exists
 */
StageManager.prototype.getAllParams = function (gameState) {
	gameState = (gameState) ? new GameState(gameState) : node.game.state;
	if (!this.exist(gameState)) return false;
	return this.loop[gameState.state]['state'][gameState.step];
};

/**
 * ### StageManager.jumpTo
 * 
 * Returns a state N steps away from the reference state
 * 
 * A negative value for N jumps backward in the game-loop, 
 * and a positive one jumps forward in the game-loop
 * 
 * @param {GameState} gameState The reference game-state
 * @param {number} N The number of steps to jump
 * @return {GameState|boolean} The "jumped-to" game-state, or FALSE if it does not exist
 */
StageManager.prototype.jumpTo = function (gameState, N) {
	if (!this.exist(gameState)) return false;
	if (!N) return gameState;
	
	var func = (N > 0) ? this.next : this.previous;
	
	for (var i=0; i < Math.abs(N); i++) {
		gameState = func.call(this, gameState);
		if (!gameState) return false;
	}
	return gameState;
};

/**
 * ### StageManager.steps2Go
 * 
 * Computes the total number steps left to the end of the game.
 * 
 * An optional input parameter can control the starting state
 * for the computation
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.game.state
 * @return {number} The total number of steps left
 */
StageManager.prototype.steps2Go = function (gameState) {
	gameState = (gameState) ? new GameState(gameState) : node.game.state;
	var count = 0;
	while (gameState) { 
		count++;
		gameState = this.next(gameState);
	}
	return count;
};

StageManager.prototype.toArray = function() {
	var state = new GameState();
	var out = [];
	while (state) { 
		out.push(state.toString());
		var state = this.next(state);
	}
	return out;
};

/**
 * 
 * ### StageManager.indexOf
 * 
 * Returns the ordinal position of a state in the game-loop 
 * 
 * All steps and rounds in between are counted.
 * 
 * @param {GameState} gameState The reference game-state
 * @return {number} The state index in the loop, or -1 if it does not exist
 * 
 * 	@see StageManager.diff
 */
StageManager.prototype.indexOf = function (state) {
	if (!state) return -1;
	return this.diff(state, new GameState());
};

/**
 * ### StageManager.diff
 * 
 * Returns the distance in steps between two states in the game-loop 
 * 
 * All steps and rounds in between are counted.
 * 
 * It works under the assumption that state1 comes first than state2
 * in the game-loop.
 * 
 * @param {GameState} state1 The reference game-state
 * @param {GameState} state2 Optional. The second state for comparison. Defaults node.game.state
 * 
 * @return {number} The state index in the loop, or -1 if it does not exist
 * 
 * @TODO: compute also negative distances
 */
StageManager.prototype.diff = function (state1, state2) {
	if (!state1) return false;
	state1 = new GameState(state1) ;
	
	if (!state2) {
		if (!node.game.state) return false;
		state2 = node.game.state
	}
	else {
		state2 = new GameState(state2) ;
	}
	
	
	var idx = 0;
	while (state2) {
		if (GameState.compare(state1, state2) === 0){
			return idx;
		}
		state2 = this.next(state2);
		idx++;
	}
	return -1;
};
	
StageManager.create = function(stage) {
	if (!stage || J.isEmpty(stage)) {
		node.warn('Cannot create empty stage.');
		return;
	}
	if ('string' !== typeof stage.name) {
		node.warn('Invalid stage name.');
		return;
	}
	if (stage.name.trim() === '') {
		node.warn('Stage name cannot be empty.');
		return;
	}

	if ('object' !== typeof stage.steps) {
		node.warn('Stage contains invalid steps.');
		return;
	}
	
	return {
		name: stage.name,
		steps: J.isArray(stage.steps) ? stage.steps : [stage.steps],
		rounds: stage.rounds || 1
	}
}



Stage.prototype.getStep = function(n) {
	if (n < 0 || n > this.steps.length) return false;
	return this.steps[n];
};


// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);