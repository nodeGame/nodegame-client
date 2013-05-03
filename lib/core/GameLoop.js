/**
 * # GameLoop
 *
 * `nodeGame` container of game-state functions
 *
 * ---
 */
(function(exports, node) {

// ## Global scope
exports.GameLoop = GameLoop;

var Stager = node.Stager;
var GameStage = node.GameStage;

// ## Constants
GameLoop.GAMEOVER = 'NODEGAME_GAMEOVER';
GameLoop.END_SEQ  = 'NODEGAME_END_SEQ';

/**
 * ## GameLoop constructor
 *
 * Creates a new instance of GameLoop
 *
 * Takes a sequence object created with Stager.
 *
 * @param {object} plot The Stager object
 *
 * @see Stager
 */
function GameLoop(plot) {
	if (!(plot instanceof Stager)) {
		node.warn("GameLoop didn't receive Stager object");
		return;
	}

	this.plot = plot;
}

// ## GameLoop methods

// TODO:
// .next
// .previous
// .jumpTo
// more!

// Accepts too high step (if given as integer)
/**
 * ## GameLoop.next
 *
 * Returns the next stage in the loop
 *
 * If the step in `curStage` is an integer and out of bounds, that bound is assumed.
 *
 * @param {object} curStage Optional. The GameStage object from which to get
 *  the next one. Defaults to returning the first stage.
 *
 * @return {object} The GameStage describing the next stage
 *
 * @see GameStage
 */
GameLoop.prototype.next = function(curStage) {
	// Find out flexibility mode:
	var flexibleMode = (this.plot.sequence.length === 0);

	var seqIdx, seqObj = null, stageObj;
	var stageNo, stepNo, roundNo;
	var nextStage = null;

	curStage = new GameStage(curStage);

	if (flexibleMode) {
		if (curStage.stage === 0) {
			// Get first stage:
			if (this.plot.generalNextFunction) {
				nextStage = this.plot.generalNextFunction();
			}

			if (nextStage) {
				return new GameStage({
					stage: nextStage,
					step:  1,
					round: 1
				});
			}

			return GameLoop.END_SEQ;
		}

		// Get stage object:
		stageObj = this.plot.stages[curStage.stage];

		if ('undefined' === typeof stageObj) {
			node.warn('next received nonexistent stage: ' + curStage.stage);
			return null;
		}

		// Find step number:
		if ('number' === typeof curStage.step) {
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
				stage: stageObj.id,
				step:  stepNo + 1,
				round: 1
			});
		}

		// Get next stage:
		if (this.plot.nextFunctions[stageObj.id]) {
			nextStage = this.plot.nextFunctions[stageObj.id]();
		}
		else if (this.plot.generalNextFunction) {
			nextStage = this.plot.generalNextFunction();
		}

		if (nextStage) {
			return new GameStage({
				stage: nextStage,
				step:  1,
				round: 1
			});
		}

		return GameLoop.END_SEQ;
	}
	else {
		if (curStage.stage === 0) {
			return new GameStage({
				stage: 1,
				step:  1,
				round: 1
			});
		}

		// Find stage number:
		if ('number' === typeof curStage.stage) {
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

		if (seqObj.type === 'gameover') return GameLoop.GAMEOVER;

		// Get stage object:
		stageObj = this.plot.stages[seqObj.id];

		// Find step number:
		if ('number' === typeof curStage.step) {
			stepNo = curStage.step;
		}
		else {
			stepNo = stageObj.steps.indexOf(curStage.step) + 1;
		}
		if (stepNo < 1) {
			node.warn('next received nonexistent step: ' +
					stageObj.id + '.' + curStage.step);
			return GameLoop.END_SEQ;
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

		// Handle looping blocks:
		if ((seqObj.type === 'doLoop' || seqObj.type === 'loop') && seqObj.cb()) {
			return new GameStage({
				stage: stageNo,
				step:  1,
				round: 1
			});
		}

		// Go to next stage:
		if (stageNo < this.plot.sequence.length) {
			// Skip over loops if their callbacks return false:
			while (this.plot.sequence[stageNo].type === 'loop' &&
			       !this.plot.sequence[stageNo].cb()) {
				stageNo++;
			}

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
