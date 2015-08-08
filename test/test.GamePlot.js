// var node = require('../index.js');
// module.exports = node;
// node.verbosity = 100;
//
// var Stager = require('../lib/core/Stager').Stager;
// var GamePlot = require('../lib/core/GamePlot').GamePlot;
// var GameStage = require('../lib/core/GameStage').GameStage;
//
// function makeStep(name) {
//     return {
//         id: name,
//         cb: function() { console.log(name + "'s callback!"); },
//         globals: { MY_GLOBAL: 'GLOB_STEP_' + name },
//         myProperty: 'PROP_STEP_' + name
//     };
// }
//
// function randomDecider() {
//     return Math.random() < 0.5;
// }
//
// stager = new Stager();
// stager.addStage(makeStep('intro'));
// stager.addStep(makeStep('gameStep1'));
// stager.addStep({id:'gameStep2', cb:function(){}});
// stager.addStep(makeStep('gameStep3'));
// stager.addStage({
//     id: 'mainGame',
//     steps: ['gameStep1', 'gameStep2', 'gameStep3'],
//     globals: {MY_GLOBAL: 'GLOB_STAGE_mainGame'},
//     myProperty: 'PROP_STAGE_mainGame'
// });
// stager.addStage(makeStep('randLoop'));
// stager.addStep(makeStep('outroStep1'));
// stager.addStep(makeStep('outroStep2'));
// stager.addStage({id: 'outro', steps: ['outroStep1', 'outroStep2']});
// stager.setDefaultGlobals({MY_GLOBAL: 'GLOB_DEFAULT'});
// stager.setDefaultProperties({otherProperty: 'PROP_DEFAULT'});
//
// console.log();
// console.log('SIMPLE MODE');
// console.log('-----------');
//
// stager
//     .next('intro AS alias')
//     .repeat('mainGame', 2)
//     .loop('randLoop', randomDecider)
//     .next('outro')
//     .gameover();
//
// gamePlot = new GamePlot();
// gamePlot.init(stager);
//
// var gameStage = new GameStage();
//
// while (gameStage instanceof GameStage) {
//     console.log('At ' + gameStage.toHash('S.s.r'));
//     console.log(" * global 'MY_GLOBAL': " +
//             gamePlot.getGlobal(gameStage, 'MY_GLOBAL'));
//     console.log(" * property 'myProperty': " +
//             gamePlot.getProperty(gameStage, 'myProperty'));
//     console.log();
//     gameStage = gamePlot.next(gameStage);
// }
// console.log(gameStage);
//
//
// /*
// console.log();
// console.log('EXPERT MODE');
// console.log('-----------');
//
// stager.clear();
//
// stager.addStage(makeStep('intro'));
// stager.addStep(makeStep('gameStep1'));
// stager.addStep(makeStep('gameStep2'));
// stager.addStep(makeStep('gameStep3'));
// stager.addStage({id: 'mainGame', steps: ['gameStep1', 'gameStep2',
//                                          'gameStep3']});
// stager.addStage(makeStep('randLoop'));
// stager.addStep(makeStep('outroStep1'));
// stager.addStep(makeStep('outroStep2'));
// stager.addStage({id: 'outro', steps: ['outroStep1', 'outroStep2']});
//
// stager.registerGeneralNext(function() {
//     var counter = 0;
//
//     return function() {
//         switch (++counter) {
//         case 1:
//             return 'intro';
//         case 2:
//             return 'mainGame';
//         case 3:
//             return 'randLoop';
//         default:
//             return GamePlot.GAMEOVER;
//         }
//     };
// }());
//
// stager.registerNext('randLoop', function() {
//             return randomDecider() ? 'randLoop' : 'outro'; });
//
// gameStage = new GameStage();
// gamePlot = new GamePlot(stager);
//
// while (gameStage instanceof GameStage) {
//     console.log('At ' + gameStage.toHash('S.s'));
//     gameStage = gamePlot.next(gameStage);
// }
// console.log(gameStage);
// */
