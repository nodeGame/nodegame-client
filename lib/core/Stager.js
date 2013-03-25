/**
 * # Stager
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

exports.Stager = Stager;

/**
 * ## Stager constructor
 * 
 * Creates a new instance of Stager
 * 
 * Takes as input parameter an object like:
 * 
 * 
 * 
 * @param {array} stages Optional. An array containing the stages
 * 
 */
function Stager(stages) {
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
 * ### Stager.stages
 * 
 * Container for the verified stages
 */		
	this.stages = [];
	
	if (stages) {
		this.add(stages);
	}
	
}


function addMultiple(stage, pos) {
	var res = true, i;
	if (!stage.length) {
		node.warn('Cannot add empty array of stages');
		return false;
	}
	
	for (i = 0; i < stage.length; i++) {
		res = res && this.add(stage[i], pos+i);
	}
	return res;
}

// ## Stager methods

/** 
 * ### GameStage.add
 * 
 * Adds one or more entries into the array of stages
 * 
 * @param {array|object} stage A stage object or an array of stages
 * @param {number} Optional. The ordinal position for inserting in array of 
 * 	stages. Negative values specify the position from the end of the array.
 * 	Defaults, adds at then of the array.
 * 	
 * @return {boolean} TRUE if the operation is completely successful
 *  
 */
Stager.prototype.add = function(stage, pos) {
	
	if (J.isArray(stage)) {
		return addMultiple.call(this, stage, pos);
	}
	
	stage = this.create(stage);
	
	if (!stage) return false;
	
	pos = pos || this.stages.length;
	
	this.limits.splice(pos, 0, {
		rounds: stage.rounds, 
		steps: stage.steps.length
	});
	
	this.stages.splice(pos, 0, stage);
	
	return true;
};

function checkStageOrStep(o, type) {
	if (!o || J.isEmpty(o)) {
		node.warn('Cannot create empty ' + type + '.');
		return;
	}
	if ('string' !== typeof o.name) {
		node.warn('Invalid ' + type + ' name.');
		return;
	}
	if (o.name.trim() === '') {
		node.warn('Empty ' + type + ' name.');
		return;
	}
	
	return true;
}

function checkStep(step) {
	if (!checkStageOrStep(step, 'step')) return false;
	
	if ('function' !== typeof step.cb) {
		node.warn('Step must have a valid callback function');
		return false;
	}
	
	return true;
}

Stager.prototype.create = function(stage) {
	if (!stage || J.isEmpty(stage)) {
		node.warn('Cannot create empty stage.');
		return;
	}
	if ('string' !== typeof stage.name) {
		console.log('----')
		console.log(stage)
		node.warn('Invalid stage name.');
		return;
	}
	if (stage.name.trim() === '') {
		node.warn('Stage name cannot be empty.');
		return;
	}

	if (stage.steps && stage.cb) {
		node.warn('Stage cannot contain both attributes \'steps\' and \'cb\'.');
		return;
	}
	
	if (stage.cb) {
		stage.steps = [{
			name: stage.name,
			cb: stage.cb
		}];
	}
	
	if (!J.isArray(stage.steps)) {
		node.warn('Expected array for property \'steps\' of stage object.');
		return;
	}
	
	var steps = [], i;
	for (i = 0 ; i < stage.steps.length ; i++) {
		if (!checkStep(stage.steps[i])) continue;
		steps.push(stage.steps[i]);
	}
	
	if (steps.length === 0) {
		node.warn('Stage must have at least one valid step.');
		return;
	}
	
	return {
		name: stage.name,
		steps: steps,
		rounds: stage.rounds || 1
	}
};

/**
 * ### Stager.size
 * 
 * Returns the total number of states + steps in the game-loop
 * 
 */
Stager.prototype.size = function() {
	if (!this.limits.length) return 0;
	return this.steps2Go(new GameState({state: 1, step: 1}));
};

/**
 * ### Stager.exist
 * 
 * Returns TRUE, if a gameState exists in the game-loop
 * 
 * @param {GameState|string} gameState The game-state to check
 */
Stager.prototype.exist = function (gameState) {
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
 * ### Stager.next
 * 
 * Returns the stage next stage
 * 
 * An optional input parameter can control the state from which 
 * to compute the next state
 * 
 * @param {GameState} gameState The reference game-state
 * @return {GameState|boolean} The next game-state, or FALSE if it does not exist
 * 
 */
 function next(gameState, N) {
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
	
	// Make sure it is a number because 
	// it could have been stringified
	var idxLimit = Number(gameState.state)-1; // 0 vs 1 based
	
	if (this.limits[idxLimit].steps > gameState.step) {
		var newStep = Number(gameState.step) + 1;
		return new GameState({
			state: gameState.state,
			step: newStep,
			round: gameState.round
		});
	}
	
	if (this.limits[idxLimit].rounds > gameState.round) {
		var newRound = Number(gameState.round) + 1;
		return new GameState({
			state: gameState.state,
			step: 1,
			round: newRound
		});
	}
	
	if (this.limits.length > gameState.state) {		
		var newState = Number(gameState.state) + 1;
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
 * ### Stager.previous
 * 
 * Returns the previous state in the loop
 * 
 * An optional input parameter can control the state from which 
 * to compute the previous state
 * 
 * @param {GameState} gameState The reference game-state
 * @return {GameState|boolean} The previous game-state, or FALSE if it does not exist
 */
function previous(gameState) {
	gameState = new GameState(gameState);
	
	if (!this.exist(gameState)) {
		return false;
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
		var oldStep = this.limits[idxLimit].steps;
		return new GameState({
			state: gameState.state,
			step: oldStep,
			round: oldRound
		});
	}
	else if (gameState.state > 1){
		var oldRound = this.limits[idxLimit-1].rounds;
		var oldStep = this.limits[idxLimit-1].steps;
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
 * ### Stager.jumpTo
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
Stager.prototype.next = function (gameState, N) {
	N = 'undefined' === typeof N ? 1 : Math.abs(N);
	return this.jumpTo(gameState, N);
};

/**
 * ### Stager.jumpTo
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
Stager.prototype.previous = function (gameState, N) {
	N = 'undefined' === typeof N ? -1 : -Math.abs(N);
	return this.jumpTo(gameState, N);
};


Stager.prototype.jumpTo = function (gameState, N) {
	if (!this.exist(gameState)) return false;
	if (!N) return gameState;

	var func = (N > 0) ? next : previous;

	for (var i=0; i < Math.abs(N); i++) {
		gameState = func.call(this, gameState);
		if (!gameState) return false;
	}
	return gameState;
};

/**
 * ### Stager.steps2Go
 * 
 * Computes the total number steps left to the end of the game.
 * 
 * An optional input parameter can control the starting state
 * for the computation
 * 
 * @param {GameState} gameState The reference game-state.
 * @return {number} The total number of steps left
 */
Stager.prototype.steps2Go = function (gameState) {
	gameState = new GameState(gameState);
	var count = 0;
	while (gameState) { 
		count++;
		gameState = this.next(gameState);
	}
	return count;
};

// TODO: probably to remove
Stager.prototype.toArray = function() {
	return this.stages; //
};

/**
 * 
 * ### Stager.indexOf
 * 
 * Returns the ordinal position of a state in the game-loop 
 * 
 * All steps and rounds in between are counted.
 * 
 * @param {GameState} gameState The reference game-state
 * @return {number} The state index in the loop, or -1 if it does not exist
 * 
 * 	@see Stager.diff
 */
Stager.prototype.indexOf = function (state) {
	if (!state) return -1;
	return this.diff(state, new GameState());
};

/**
 * ### Stager.diff
 * 
 * Returns the distance in steps between two stages in the game-loop 
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
Stager.prototype.dist = Stager.prototype.diff = function (state1, state2) {
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
	

/**
 * ### Stager.get
 * 
 * Returns the stage associated with the gameState
 * 
 * @param {GameState} gameState The reference game-state.
 * @return {string|boolean} The stage, or FALSE if the requested state does not exists
 */
Stager.prototype.get = function (gameState) {
	gameState = new GameState(gameState);
	if (!this.exist(gameState)) return false;
	return this.stages[gameState.state].stage[gameState.step];
};

/**
 * ### Stager.getProperty
 * 
 * Returns the requested property of the stage associated with a game-state
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.game.state
 * @return {string|boolean} The name of the game-state, or FALSE if state does not exists
 */
Stager.prototype.getProperty = function (gameState, key) {
	gameState = new GameState(gameState);
	if (!this.exist(gameState)) return false;
	return this.stages[gameState.state].stage[gameState.step][key];
};


/**
 * ### Stager.getName
 * 
 * Returns the name associated with a game-state
 * 
 * @param {GameState} gameState Optional. The reference game-state. Defaults, node.game.state
 * @return {string|boolean} The name of the game-state, or FALSE if state does not exists
 */
Stager.prototype.getName = function (gameState) {
	return this.getProperty(gameState, 'name')
};

/**
 * ### Stager.getFunction
 * 
 * Returns the function associated with a game-state
 * 
 * @param {GameState} gameState The reference game-state
 * @return {object|boolean} The function of the game-state, or FALSE if state does not exists
 */
Stager.prototype.getCb = Stager.prototype.getFunction = function (gameState) {
	return this.getProperty(gameState, 'state'); // todo change it to cb
};


Stager.prototype.clear(confirm) {
	if (!confirm) {
		node.warn('Use confirm=true if you really wanna clear current stages');
		return false;
	}
	
	this.limits = [];
	this.stages = [];
	return true;
}


// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);