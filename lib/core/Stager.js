(function (exports) {

exports.Stager = Stager;

var J = new require("JSUS").JSUS;

// Constructor.
function Stager () {
	this.clear();
}

// Reset all state.
Stager.prototype.clear = function () {
	this.steps = [];
	this.stages = [];
};

// Reset game progress.
Stager.prototype.init = function () {
};

// Add a new step.
// Returns success bool.
Stager.prototype.addStep = function (step) {
};

// Add a new stage.
// Returns success bool.
Stager.prototype.addStage = function (stage) {
};


function warn (msg) {
	console.log('WARNING: ' + msg);
}

// Returns whether given step is valid.
function checkStep (step) {
	if (!step) return false;
	if (typeof(step.id) !== 'string') return false;
	if (typeof(step.cb) !== 'function') return false;

	return true;
}

// Returns whether given stage is valid.
function checkStage (stage) {
	// A step can be a stage:
	if (checkStep(stage)) return true;

	if (!stage) return false;
	if (typeof(stage.id) !== 'string') return false;
	// If the stage is not a step, it must contain steps:
	if (!stage.steps.length) return false;

	return true;
}

})(
	'undefined' != typeof node ? node : module.exports
);
