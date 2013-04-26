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

GameLoop.prototype.next = function (curStage) {
	// Find out flexibility mode:
	var flexibleMode = (this.plot.sequence.length === 0);
	var seqIdx, seqObj = null;

	curStage = new GameStage(curStage);

	if (flexibleMode) {
		// UNDER CONSTRUCTION
		return null;
	}
	else {
		if (curStage.stage === 0) {
			return new GameStage({
				stage: 1,
				step:  1,
				round: 1
			});
		}

		// Find sequence index for given stage:
		if (typeof(curStage.stage) === 'number') {
			seqIdx = curStage.stage;
		}
		else {
			// TODO: Test this
			for (seqIdx = 0; seqIdx < this.plot.sequence.length; seqIdx++) {
				if (this.plot.sequence[seqIdx].id === curStage.stage) {
					break;
				}
			}
		}

		// Get sequence object:
		if (seqIdx >= this.plot.sequence.length) {
			node.warn('next received nonexistent stage: ' + curStage.stage);
			return null;
		}
		seqObj = this.plot.sequence[seqIdx - 1];

		// UNDER CONSTRUCTION

		return null;
	}
};

// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
