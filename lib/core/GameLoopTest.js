var node = require('../../index.js');
module.exports = node;
node.verbosity = 100;

var Stager = require('./Stager').Stager;
var GameLoop = require('./GameLoop').GameLoop;
var GameStage = require('./GameStage').GameStage;

function makeStep (name) {
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
plot.addStage(makeStep('randLoop'));
plot.addStep(makeStep('outroStep1'));
plot.addStep(makeStep('outroStep2'));
plot.addStage({id: 'outro', steps: ['outroStep1', 'outroStep2']});

plot
	.next('intro AS alias')
	.repeat('mainGame', 2)
	.loop('randLoop', function () { return Math.random() < 0.5; })
	.next('outro')
	.gameover();

gameLoop = new GameLoop(plot);

var gameStage = new GameStage('2');

while (gameStage) {
	console.log('At ' + gameStage.toHash('S.s.r'));
	gameStage = gameLoop.next(gameStage);
}
