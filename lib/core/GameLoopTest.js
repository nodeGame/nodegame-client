var node = require('../../index.js');
module.exports = node;
node.verbosity = 100;

var Stager = require('./Stager').Stager;
var GameLoop = require('./GameLoop').GameLoop;

function makeStep(name) {
	return {
		id: name,
		cb: function () { console.log(name + "'s callback!"); }
	};
}

plot = new Stager();
plot.addStage(makeStep('intro'));
plot.addStep(makeStep('gameStep1'));
plot.addStep(makeStep('gameStep2'));
plot.addStep(makeStep('gameStep3'));
plot.addStage({id: 'mainGame', steps: ['gameStep1', 'gameStep2', 'gameStep3']});
plot.addStage(makeStep('outro'));

plot.next('intro').repeat('mainGame', 2).next('outro').gameover();

gameloop = new GameLoop(plot);

console.log(gameloop);
