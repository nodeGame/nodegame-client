(function (exports, node) {

exports.GameLoop = GameLoop;

var Stager = node.Stager;

// Constructor.
// Stager object, expert setting (default: false) as parameter.
function GameLoop (plot, expertMode) {
	if (!(plot instanceof Stager)) {
		node.warn("GameLoop didn't receive Stager object");
		return;
	}

	this.plot = plot;
	this.expertMode = !!expertMode;
}

// TODO:
// .next
// .previous
// .jumpTo

// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
