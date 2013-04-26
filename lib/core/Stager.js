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

	// General and per-stage functions for deciding next step:
	this.generalNextFunction = null;
	this.nextFunctions = {};  // stage id -> function
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
// Parameter is shallowly copied.  Returns success bool.
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

	this.stages[stage.id] = stage;
	return true;
};

// Add gameover to sequence.
Stager.prototype.gameover = function () {
	this.sequence.push({ type: 'gameover' });

	return this;
};

// Add stage to sequence.
// id or alias must be unique.  Returns this on success, null on failure.
Stager.prototype.next = function (id, alias) {
	var stageName = alias || id;
	var seqIdx;

	// Check ID validity:
	if (!this.stages[id]) {
		node.warn('next received nonexistent stage id');
		return null;
	}

	// Check uniqueness:
	for (seqIdx in this.sequence) {
		if (this.sequence[seqIdx].id === stageName) {
			node.warn('next received non-unique stage name');
			return null;
		}
	}

	// Add alias:
	if (alias) {
		if (typeof(alias) !== 'string') {
			node.warn('next received non-string alias');
		}

		this.stages[alias] = this.stages[id];
	}

	this.sequence.push({
		type: 'plain',
		id: stageName
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

// Return the sequence of stages.
// format: 'h' for array of human-readable strings, 'o' for JS object
Stager.prototype.getSequence = function (format) {
	if ('ho'.indexOf(format) === -1) {
		node.warn('getSequence got invalid format character');
	}

	var humanReadable = (format === 'h');
	var result;
	var idx;
	var seqObj;
	var gameOver = false;

	if (!humanReadable) {
		result = this.sequence;
	} else {
		result = [];

		for (idx in this.sequence) {
			seqObj = this.sequence[idx];

			switch (seqObj.type) {
			case 'gameover':
				result.push('[game over]');
				break;

			case 'plain':
				result.push(seqObj.id);
				break;

			case 'repeat':
				result.push(seqObj.id + ' [x' + seqObj.num + ']');
				break;

			case 'loop':
				result.push(seqObj.id + ' [loop]');
				break;

			default:
				node.warn('unknown sequence object type');
				break;
			}
		}
	}

	return result;
};

// DEBUG:  Run sequence.
Stager.prototype.seqTestRun = function (expertMode, firstStage) {
	var seqObj;
	var curStage;
	var stageNum;
	
	console.log('* Commencing sequence test run!');

	if (!expertMode) {
		for (stageNum in this.sequence) {
			seqObj = this.sequence[stageNum];
			console.log('** num: ' + stageNum + ', type: ' + seqObj.type);
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
		}
	}
	else {
		// Get first stage:
		if (firstStage) {
			curStage = firstStage;
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

// DEBUG:  Run stage.
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
