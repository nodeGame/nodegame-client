(function (exports, node) {

exports.Stager = Stager;

var J = node.JSUS;

// Constructor.
function Stager () {
	this.clear();
}

// Reset all state.
Stager.prototype.clear = function () {
	// Step and stage objects are stored by their id here:
	this.steps = {};
	this.stages = {};

	// The game plan:
	this.sequence = [];

	// Number of stage the running game is at.
	// -1 means not started.
	this.stageNum = -1;

	// For fork builder calls:
	this.forkNum = -1;
};

// Add a new step.
// Returns success bool.
Stager.prototype.addStep = function (step) {
	if (!this.checkStepValidity(step)) {
		node.warn('addStep received invalid step');
		return false;
	}

	this.steps[step.id] = (step);
	return true;
};

// Add a new stage.
// Returns success bool.
Stager.prototype.addStage = function (stage) {
	// Handle wrapped steps:
	if (this.checkStepValidity(stage)) {
		if (!this.addStep(stage)) return false;
		if (!this.addStage({
			id: stage.id,
			steps: [ stage.id ]
		    })) return false;

		return true;
	}

	if (!this.checkStageValidity(stage)) {
		node.warn('addStage received invalid stage');
		return false;
	}

	this.stages[stage.id] = (stage);
	return true;
};

// Add init to sequence.
Stager.prototype.init = function () {
	this.insertSequenceObj({ type: 'init' });

	return this;
};

// Add gameover to sequence.
Stager.prototype.gameover = function () {
	this.insertSequenceObj({ type: 'gameover' });

	return this;
};

// Add stage to sequence.
// Returns this on success, null on failure.
Stager.prototype.next = function (id) {
	// Check ID validity:
	if (!this.stages[id]) {
		node.warn('next received nonexistent stage id');
		return null;
	}

	this.insertSequenceObj({
		type: 'plain',
		id: id
	});

	return this;
};

// Add repeated stage to sequence.
// Returns this on success, null on failure.
Stager.prototype.repeat = function (id, nRepeats) {
	// Check ID validity:
	if (!this.stages[id]) {
		node.warn('repeat received nonexistent stage id');
		return null;
	}

	this.insertSequenceObj({
		type: 'repeat',
		id: id,
		num: nRepeats
	});

	return this;
};


// Add fork to sequence.
Stager.prototype.fork = function (func) {
	this.insertSequenceObj({
		type: 'fork',
		cb: func
	});

	return this;
};

// Return the sequence of stages with the current environment.
Stager.prototype.evalSequence = function () {
	var result = [];
	var seqObj;
	var oldSequence = J.clone(this.sequence);
	var gameOver = false;

	this.stageNum = 0;

	while (this.stageNum < this.sequence.length && !gameOver) {
		seqObj = this.sequence[this.stageNum];
		this.forkNum = this.stageNum;

		switch (seqObj.type) {
		case 'init':
			break;

		case 'gameover':
			gameOver = true;
			break;

		case 'plain':
			result.push(seqObj.id);
			break;

		case 'repeat':
			for (var i = 0; i < seqObj.num; i++) {
				result.push(seqObj.id);
			}
			break;

		case 'fork':
			seqObj.cb();
			break;

		default:
			node.warn('unknown sequence object type');
			break;
		}

		this.stageNum++;
	}

	this.sequence = oldSequence;

	return result;
};

// Run sequence.
Stager.prototype.seqTestRun = function () {
	var seqObj;

	this.stageNum = 0;

	console.log('* Commencing sequence test run!');
	while (this.stageNum < this.sequence.length) {
		seqObj = this.sequence[this.stageNum];
		this.forkNum = this.stageNum;
		console.log('** num: ' + this.stageNum + ', type: ' + seqObj.type);
		switch (seqObj.type) {
		case 'init':
			break;

		case 'gameover':
			console.log('* Game Over.');
			return;
			break;

		case 'plain':
			this.stageTestRun(seqObj.id);
			break;

		case 'repeat':
			for (var i = 0; i < seqObj.num; i++) {
				this.stageTestRun(seqObj.id);
			}
			break;

		case 'fork':
			seqObj.cb();
			break;

		default:
			node.warn('unknown sequence object type');
			break;
		}

		this.stageNum++;
	}
};

// Run stage.
Stager.prototype.stageTestRun = function (stageId) {
	var steps = this.stages[stageId].steps;
	var stepId;

	for (var i in steps) {
		stepId = steps[i];
		this.steps[stepId].cb();
	}
};


// PRIVATE UTILITY FUNCTIONS

// Returns whether given step is valid.
Stager.prototype.checkStepValidity = function (step) {
	if (!step) return false;
	if (typeof(step.id) !== 'string') return false;
	if (typeof(step.cb) !== 'function') return false;

	return true;
}

// Returns whether given stage is valid.  Steps are invalid.
Stager.prototype.checkStageValidity = function (stage) {
	if (!stage) return false;
	if (typeof(stage.id) !== 'string') return false;
	if (!stage.steps && !stage.steps.length) return false;

	// Check whether the referenced steps exist:
	for (var i in stage.steps) {
		if (!this.steps[stage.steps[i]]) return false;
	}

	return true;
}

// Handles correct placement of sequence objects.
Stager.prototype.insertSequenceObj = function (seqObj) {
	if (this.forkNum === -1) {
		// If called before game start, append new sequence object:
		this.sequence.push(seqObj);
	}
	else {
		// If called during running game, add new sequence objects
		// after the current stage:
		this.forkNum++;
		this.sequence.splice(this.forkNum, 0, seqObj);
	}
};


})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);
