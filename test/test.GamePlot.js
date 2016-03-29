var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Stager = ngc.Stager;
var GamePlot = ngc.GamePlot;
var GameStage = ngc.GameStage;
var J = ngc.JSUS;

var node = ngc.getClient();
node.verbosity = -1000;

var stager, plot, stagerState;
var stepRule, globals, properties, init, gameover, done, stage;
var loopCb, flag;

describe('GamePlot', function() {
    before(function() {

        stager = ngc.getStager();

        stage = {
            id: '3',
            steps: ['step3-1', 'step3-2', 'step3-3']
        };

        stager.addStage(stage);

        stager
            .next('1')
            .next('2')
            .repeat('3', 3)
            .next('4')
            .repeat('5', 5)
            .finalize();
    });

    describe('#constructor', function() {
        before(function(){
            plot = new GamePlot(node, stager);
        });
        it('should create a stager object', function() {
            (typeof plot.stager).should.eql('object');
        });
    });

    describe('#next()', function() {
        it('should return 1.1.1', function() {
            GameStage.compare(plot.next('0.0.0'),'1.1.1')
                .should.be.equal(0);
        });
        it('should return 2.1.1', function() {
            GameStage.compare(plot.next('1.1.1'),'2.1.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1', function() {
            GameStage.compare(plot.next('2.1.1'),'3.1.1')
                .should.be.equal(0);
        });
        it('should return 3.2.1', function() {
            GameStage.compare(plot.next('3.1.1'),'3.2.1')
                .should.be.equal(0);
        });
        it('should return 3.3.1', function() {
            GameStage.compare(plot.next('3.2.1'),'3.3.1')
                .should.be.equal(0);
        });
        it('should return 3.1.2', function() {
            GameStage.compare(plot.next('3.3.1'),'3.1.2')
                .should.be.equal(0);
        });

        it('should return false when reached end of the stages', function() {
            plot.next('5.1.1').should.be.false;
        });
    });
    //
    describe('#previous()', function() {
        it('should return 1.1.1', function() {
            GameStage.compare(plot.previous('2.1.1'),'1.1.1')
                .should.be.equal(0);
        });
        it('should return 2.1.1', function() {
            GameStage.compare(plot.previous('3.1.1'),'2.1.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1', function() {
            GameStage.compare(plot.previous('3.2.1'),'3.1.1')
                .should.be.equal(0);
        });
        it('should return 3.2.1', function() {
            GameStage.compare(plot.previous('3.3.1'),'3.2.1')
                .should.be.equal(0);
        });
        it('should return 3.3.1', function() {
            GameStage.compare(plot.previous('3.1.2'),'3.3.1')
                .should.be.equal(0);
        });

        it('should return false at beginning of the stages', function() {
            plot.previous('1.1.1').should.be.false;
        });
    });

    describe('#jump() forward', function() {
        it('should return 2.1.1', function() {
            GameStage.compare(plot.jump('1.1.1', 1), '2.1.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1', function() {
            GameStage.compare(plot.jump('3.1.1', 1), '3.2.1')
                .should.be.equal(0);
        });
        it('should return 3.2.1', function() {
            GameStage.compare(plot.jump('3.3.1', 1), '3.1.2')
                .should.be.equal(0);
        });
        it('should return 3.3.1', function() {
            GameStage.compare(plot.jump('3.1.1', 2), '3.3.1')
                .should.be.equal(0);
        });
        it('should return 3.3.1', function() {
            GameStage.compare(plot.jump('3.1.1', 5), '3.3.2')
                .should.be.equal(0);
        });
        it('should return false at beginning of the stages', function() {
            plot.jump('5.1.1',1).should.be.false;
        });
    });

    describe('#jump() backward', function() {
        it('should return 1.1.1 (jump -1)', function() {
            GameStage.compare(plot.jump('2.1.1', -1), '1.1.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1 (jump -1)', function() {
            GameStage.compare(plot.jump('3.2.1', -1), '3.1.1')
                .should.be.equal(0);
        });
        it('should return 3.3.1 (jump -1)', function() {
            GameStage.compare(plot.jump('3.1.2', -1), '3.3.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1 (jump -2)', function() {
            GameStage.compare(plot.jump('3.3.1', -2), '3.1.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1 (jump -5)', function() {
            GameStage.compare(plot.jump('3.3.2', -5), '3.1.1')
                .should.be.equal(0);
        });
        it('should return false at beginning of the stages', function() {
            plot.jump('1.1.1',-1).should.be.false;
        });

    });

    describe('#jump() backward', function() {
        it('should return 1.1.1 (jump -1)', function() {
            GameStage.compare(plot.jump('2.1.1', -1), '1.1.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1 (jump -1)', function() {
            GameStage.compare(plot.jump('3.2.1', -1), '3.1.1')
                .should.be.equal(0);
        });
        it('should return 3.3.1 (jump -1)', function() {
            GameStage.compare(plot.jump('3.1.2', -1), '3.3.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1 (jump -2)', function() {
            GameStage.compare(plot.jump('3.3.1', -2), '3.1.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1 (jump -5)', function() {
            GameStage.compare(plot.jump('3.3.2', -5), '3.1.1')
                .should.be.equal(0);
        });
        it('should return false at beginning of the stages', function() {
            plot.jump('1.1.1',-1).should.be.false;
        });

    });

    describe('#normalizeGameStage()', function() {
        before(function() {
            var stager = ngc.getStager();
            node = ngc.getClient();
            stager
                .next('first')
                .next('second')
                .next({
                    id: 'third',
                    steps: ['a', 'b', 'c']
                });
            plot = node.game.plot;
            node.setup('plot', stager.getState());
        });
        it('first', function() {
            plot.normalizeGameStage('first').should.eql({
                stage: 1,
                step: 1,
                round: 1
            });
        });
        it('second', function() {
            plot.normalizeGameStage('second').should.eql({
                stage: 2,
                step: 1,
                round: 1
            });
        });
        it('third', function() {
            plot.normalizeGameStage('third').should.eql({
                stage: 3,
                step: 1,
                round: 1
            });
        });

        it('third.a', function() {
            plot.normalizeGameStage('third.a').should.eql({
                stage: 3,
                step: 1,
                round: 1
            });
        });

        it('third.a.1', function() {
            plot.normalizeGameStage('third.a.1').should.eql({
                stage: 3,
                step: 1,
                round: 1
            });
        });

        it('third.b', function() {
            plot.normalizeGameStage('third.b').should.eql({
                stage: 3,
                step: 2,
                round: 1
            });
        });

        it('third.b.1', function() {
            plot.normalizeGameStage('third.b.1').should.eql({
                stage: 3,
                step: 2,
                round: 1
            });
        });

        it('third.c.1', function() {
            plot.normalizeGameStage('third.c.1').should.eql({
                stage: 3,
                step: 3,
                round: 1
            });
        });

        // TODO. How to normalize loops?
        // TODO. How to do previous/next of loops?
    });

});

return

describe('GamePlot with loops', function() {
    before(function() {

        stager = ngc.getStager();

        stage = {
            id: '3',
            steps: ['step3-1', 'step3-2', 'step3-3']
        };

        stager.addStage(stage);

        loopCb = function() {
            var res;
            res = !!!flag;
            // Not an actual update, just checking via test infrastructure.
            if (!testNext) {
                tmp.loops.push([ this.getCurrentStepObj().id, res ]);
            }
            return res;
        };

        stager
            .next('1')
            .loop({
                id: '2',
                cb: function() {
                    if (tmp.counter++ >= 3) flag = true;
                }
            }, loopCb)
            .next('3')
            .doLoop('4', loopCb)
            .finalize();
    });

    describe('#previous() with loops', function() {
        it('should return 1.1.1', function() {
            GameStage.compare(plot.previous('2.1.1'),'1.1.1')
                .should.be.equal(0);
        });
        it('should return 2.1.1', function() {
            GameStage.compare(plot.previous('3.1.1'),'2.1.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1', function() {
            GameStage.compare(plot.previous('3.2.1'),'3.1.1')
                .should.be.equal(0);
        });
        it('should return 3.2.1', function() {
            GameStage.compare(plot.previous('3.3.1'),'3.2.1')
                .should.be.equal(0);
        });
        it('should return 3.3.1', function() {
            GameStage.compare(plot.previous('3.1.2'),'3.3.1')
                .should.be.equal(0);
        });

        it('should return false at beginning of the stages', function() {
            plot.previous('1.1.1').should.be.false;
        });
    });
});

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
