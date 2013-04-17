(function (exports) {

exports.Stager = Stager;

var J = new require("JSUS").JSUS;

// Constructor.
function Stager () {
	this.clear();
}

// Reset all state.
Stager.prototype.clear = function () {
	// Step and stage objects are stored by their id here:
	this.steps = {};
	this.stages = {};
};

// Reset game progress.
Stager.prototype.init = function () {
	return this;
};

// Add a new step.
// Returns success bool.
Stager.prototype.addStep = function (step) {
	if (!this.checkStepValidity(step)) {
		warn('addStep received invalid step');
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
		warn('addStage received invalid stage');
		return false;
	}

	this.stages[stage.id] = (stage);
	return true;
};


// UTILITY FUNCTIONS

function warn (msg) {
	console.log('WARNING: ' + msg);
}

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
		if (!(stage.steps[i] in this.steps)) return false;
	}

	return true;
}


})(
	'undefined' != typeof node ? node : module.exports
);
