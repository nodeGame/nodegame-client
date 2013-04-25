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

	this.expertMode = false;

	// General and per-stage functions for deciding next step:
	this.generalNextFunction = null;
	this.nextFunctions = {};  // stage id -> function

	// ID of first stage:
	this.firstStage = null;
};

// Choose building mode.
Stager.prototype.setExpertMode = function (expertMode) {
	if (this.stageNum !== -1) {
		node.warn('trying to set builder mode while game is running');
		return;
	}

	this.expertMode = !!expertMode;
};

// Sets general callback for next stage decision.
Stager.prototype.registerGeneralNext = function (func) {
	if (typeof(func) !== 'function') {
		node.warn("registerGeneralNext didn't receive function parameter");
		return;
	}

	this.generalNextFunction = func;
}

// Sets per-stage callback for next stage decision.
Stager.prototype.registerNext = function (id, func) {
	if (typeof(func) !== 'function') {
		node.warn("registerNext didn't receive function parameter");
		return;
	}

	if (!this.stages[id]) {
		node.warn('registerNext received nonexistent stage id');
		return;
	}

	this.nextFunctions[id] = func;
}

// Sets stage to start with.
// If not set, calls general callback for first stage.
Stager.prototype.registerFirstStage = function (id) {
	if (!this.stages[id]) {
		node.warn('registerFirstStage received nonexistent stage id');
		return;
	}

	this.firstStage = id;
}

// Add a new step.
// Returns success bool.
Stager.prototype.addStep = function (step) {
	if (this.stageNum !== -1) {
		node.warn('trying to add step while game is running');
		return false;
	}

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
	if (this.stageNum !== -1) {
		node.warn('trying to add stage while game is running');
		return false;
	}

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

// Add gameover to sequence.
Stager.prototype.gameover = function () {
	if (this.stageNum !== -1) {
		node.warn('trying to change sequence while game is running');
		return null;
	}

	this.sequence.push({ type: 'gameover' });

	return this;
};

// Add stage to sequence.
// Returns this on success, null on failure.
Stager.prototype.next = function (id) {
	if (this.stageNum !== -1) {
		node.warn('trying to change sequence while game is running');
		return null;
	}

	// Check ID validity:
	if (!this.stages[id]) {
		node.warn('next received nonexistent stage id');
		return null;
	}

	this.sequence.push({
		type: 'plain',
		id: id
	});

	return this;
};

// Add repeated stage to sequence.
// Returns this on success, null on failure.
Stager.prototype.repeat = function (id, nRepeats) {
	if (this.stageNum !== -1) {
		node.warn('trying to change sequence while game is running');
		return null;
	}

	// Check ID validity:
	if (!this.stages[id]) {
		node.warn('repeat received nonexistent stage id');
		return null;
	}

	this.sequence.push({
		type: 'repeat',
		id: id,
		num: nRepeats
	});

	return this;
};


// Add loop to sequence.
// Returns this on success, null on failure.
Stager.prototype.loop = function (id, func) {
	if (this.stageNum !== -1) {
		node.warn('trying to change sequence while game is running');
		return null;
	}

	// Check ID validity:
	if (!this.stages[id]) {
		node.warn('loop received nonexistent stage id');
		return null;
	}

	this.sequence.push({
		type: 'loop',
		id: id,
		cb: func
	});

	return this;
};

/*
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
*/

// Run sequence.
Stager.prototype.seqTestRun = function () {
	var seqObj;
	var curStage;
	
	this.stageNum = 0;
	console.log('* Commencing sequence test run!');

	if (!this.expertMode) {
		while (this.stageNum < this.sequence.length) {
			seqObj = this.sequence[this.stageNum];
			console.log('** num: ' + this.stageNum + ', type: ' + seqObj.type);
			switch (seqObj.type) {
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

			case 'loop':
				while (seqObj.cb()) {
					this.stageTestRun(seqObj.id);
				}
				break;

			default:
				node.warn('unknown sequence object type');
				break;
			}

			this.stageNum++;
		}
	}
	else {
		// Get first stage:
		if (this.firstStage) {
			curStage = this.firstStage;
		}
		else if (this.generalNextFunction) {
			curStage = this.generalNextFunction();
		}
		else {
			curStage = null;
		}

		while (curStage) {
			this.stageTestRun(curStage);

			// Get next stage:
			if (this.nextFunctions[curStage]) {
				curStage = this.nextFunctions[curStage]();
			}
			else if (this.generalNextFunction) {
				curStage = this.generalNextFunction();
			}
			else {
				curStage = null;
			}

			// Check stage validity:
			if (curStage !== null && !this.stages[curStage]) {
				node.warn('next-deciding callback yielded invalid stage');
				curStage = null;
			}
		}
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


})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);
