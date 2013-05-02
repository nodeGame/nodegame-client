(function (exports, node) {

exports.GameLoop = GameLoop;

var Stager = node.Stager;
var GameStage = node.GameStage;

// Constructor.
// Stager object, expert setting (default: false) as parameter.
function GameLoop (plot) {
	if (!(plot instanceof Stager)) {
		node.warn("GameLoop didn't receive Stager object");
		return;
	}

	this.plot = plot;
}

// TODO:
// .next
// .previous
// .jumpTo
// more!

// Accepts too high step (if given as integer)
GameLoop.prototype.next = function (curStage) {
	// Find out flexibility mode:
	var flexibleMode = (this.plot.sequence.length === 0);

	var seqIdx, seqObj = null, stageObj;
	var stageNo, stepNo, roundNo;

	curStage = new GameStage(curStage);

	if (flexibleMode) {
		// UNDER CONSTRUCTION
		return null;
	}
	else {
		//console.log('** curStage: ' + curStage.toHash('S.s.r'));

		if (curStage.stage === 0) {
			return new GameStage({
				stage: 1,
				step:  1,
				round: 1
			});
		}

		// Find stage number:
		if (typeof(curStage.stage) === 'number') {
			stageNo = curStage.stage;
		}
		else {
			for (seqIdx = 0; seqIdx < this.plot.sequence.length; seqIdx++) {
				if (this.plot.sequence[seqIdx].id === curStage.stage) {
					break;
				}
			}
			stageNo = seqIdx + 1;
		}
		if (stageNo < 1 || stageNo > this.plot.sequence.length) {
			node.warn('next received nonexistent stage: ' + curStage.stage);
			return null;
		}

		// Get sequence object:
		seqObj = this.plot.sequence[stageNo - 1];

		if (seqObj.type === 'gameover') return null;

		// Get stage object:
		stageObj = this.plot.stages[seqObj.id];

		// Find step number:
		if (typeof(curStage.step) === 'number') {
			stepNo = curStage.step;
		}
		else {
			stepNo = stageObj.steps.indexOf(curStage.step) + 1;
		}
		if (stepNo < 1) {
			node.warn('next received nonexistent step: ' +
					stageObj.id + '.' + curStage.step);
			return null;
		}

		// Handle stepping:
		if (stepNo + 1 <= stageObj.steps.length) {
			return new GameStage({
				stage: stageNo,
				step:  stepNo + 1,
				round: curStage.round
			});
		}

		// Handle repeat block:
		if (seqObj.type === 'repeat' && curStage.round + 1 <= seqObj.num) {
			return new GameStage({
				stage: stageNo,
				step:  1,
				round: curStage.round + 1
			});
		}

		// Handle loop block:
		if (seqObj.type === 'loop' && seqObj.cb()) {
			return new GameStage({
				stage: stageNo,
				step:  1,
				round: 1
			});
		}

		// Go to next stage:
		if (stageNo < this.plot.sequence.length) {
			return new GameStage({
				stage: stageNo + 1,
				step:  1,
				round: 1
			});
		}

		// No more stages remaining:
		return null;
	}
};

// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
