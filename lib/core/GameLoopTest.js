var node = require('../../index.js');
module.exports = node;
node.verbosity = 100;

var Stager = require('./Stager').Stager;
var GameLoop = require('./GameLoop').GameLoop;
var GameStage = require('./GameStage').GameStage;

function makeStep(name) {
    return {
        id: name,
        cb: function() { console.log(name + "'s callback!"); },
        globals: { MY_GLOBAL: 'GLOB_STEP_' + name },
        myProperty: 'PROP_STEP_' + name
    };
}

function randomDecider() {
    return Math.random() < 0.5;
}

plot = new Stager();
plot.addStage(makeStep('intro'));
plot.addStep(makeStep('gameStep1'));
plot.addStep({id:'gameStep2', cb:function(){}});
plot.addStep(makeStep('gameStep3'));
plot.addStage({
    id: 'mainGame',
    steps: ['gameStep1', 'gameStep2', 'gameStep3'],
    globals: {MY_GLOBAL: 'GLOB_STAGE_mainGame'},
    myProperty: 'PROP_STAGE_mainGame'
});
plot.addStage(makeStep('randLoop'));
plot.addStep(makeStep('outroStep1'));
plot.addStep(makeStep('outroStep2'));
plot.addStage({id: 'outro', steps: ['outroStep1', 'outroStep2']});
plot.setDefaultGlobals({MY_GLOBAL: 'GLOB_DEFAULT'});

console.log();
console.log('SIMPLE MODE');
console.log('-----------');

plot
    .next('intro AS alias')
    .repeat('mainGame', 2)
    .loop('randLoop', randomDecider)
    .next('outro')
    .gameover();

gameLoop = new GameLoop();
gameLoop.init(plot);

var gameStage = new GameStage();

while (gameStage instanceof GameStage) {
    console.log('At ' + gameStage.toHash('S.s.r'));
    console.log(" * global 'MY_GLOBAL': " +
            gameLoop.getGlobal(gameStage, 'MY_GLOBAL'));
    gameStage = gameLoop.next(gameStage);
}
console.log(gameStage);


/*
console.log();
console.log('EXPERT MODE');
console.log('-----------');

plot.clear();

plot.addStage(makeStep('intro'));
plot.addStep(makeStep('gameStep1'));
plot.addStep(makeStep('gameStep2'));
plot.addStep(makeStep('gameStep3'));
plot.addStage({id: 'mainGame', steps: ['gameStep1', 'gameStep2', 'gameStep3']});
plot.addStage(makeStep('randLoop'));
plot.addStep(makeStep('outroStep1'));
plot.addStep(makeStep('outroStep2'));
plot.addStage({id: 'outro', steps: ['outroStep1', 'outroStep2']});

plot.registerGeneralNext(function() {
    var counter = 0;

    return function() {
        switch (++counter) {
        case 1:
            return 'intro';
        case 2:
            return 'mainGame';
        case 3:
            return 'randLoop';
        default:
            return GameLoop.GAMEOVER;
        }
    };
}());

plot.registerNext('randLoop', function() { return randomDecider() ? 'randLoop' : 'outro'; });

gameStage = new GameStage();
gameLoop = new GameLoop(plot);

while (gameStage instanceof GameStage) {
    console.log('At ' + gameStage.toHash('S.s'));
    gameStage = gameLoop.next(gameStage);
}
console.log(gameStage);
*/
