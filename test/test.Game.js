"use strict";

var util = require('util');
var should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Stager = ngc.Stager;
var Game = ngc.GameStage;
var GamePlot = ngc.GamePlot;
var GameStage = ngc.GameStage;
var J = ngc.JSUS;

var stager, plot, game;
var stepRule, globals, properties, init, gameover, done, stage;
var i, tmp, flag, res, loopCb;

var node = ngc.getClient();
var stager = ngc.getStager();

//
// stage = {
//     id: '3',
//     steps: [ 'step3-1', 'step3-2', 'step3-3' ]
// };
//
// stager.addStage(stage);
//
// stager
//     .next('1')
//     .next({
//         id: '2',
//         cb: function() { i = 1 }
//     })
//     .repeat('3', 3)
//     .next('4')
//     .repeat('5', 5);
//
// stager.extendStep('2', function(o) {
//     o._cb = o.cb;
//     o.cb = function() {
//         var oldCb = this.getCurrentStepObj()._cb;
//         oldCb();
//         i++;
//     };
//     return o;
// });
//
// stager.finalize();

//      stager = ngc.getStager();
//            node = ngc.getClient();
//            node.createPlayer({id: '1'});
//            node.verbosity = -1000;
//
//            tmp = { loops: [], counter: 1 };
//
//            loopCb = function() {
//                var res;
//                res = !!!flag;
//                tmp.loops.push(res);
//                console.log('AAA', tmp)
//                tmp.counter++;
//                if (tmp.counter > 3) flag = true;
//                return res;
//            };
//
//            stager
//                .next('1')
//                .loop({
//                    id: '2',
//                    cb: function() {
//                        if (tmp.counter++ >= 3) flag = true;
//                    }
//                }, loopCb)
//                .loop('skipped', loopCb)
//                .next('4')
//                .doLoop('5', loopCb)
//                .next('6')
//                .repeat('7', 2)
//                .next({
//                    id: '8',
//                    steps: [ '8.1', '8.2', '8.3' ]
//                })
//                .repeat({
//                    id: '9',
//                    steps: [ '9.1', '9.2', '9.3' ]
//                }, 2)
//                .finalize();
//
//            stager.setDefaultStepRule(ngc.stepRules.WAIT);
//
//            game = node.game;
//            game.plot.stager.setState(stager.getState());
//
// ebugger
//
//
//            var s = game.getNextStep();
//            GameStage.compare(s, '1').should.eql(0);
//
//            game.start();
//            var s = game.getNextStep();
//
//            game.step();
//
//            var s = game.getNextStep();
//
//            game.step();
//            var s = game.getNextStep();
//
// eturn;

describe('Game', function() {

    describe('#constructor', function() {
        before(function(){
            game = node.game;
            game.plot.stager.setState(stager.getState());
            game.start();
        });

//         it('extend stage', function() {
//
//             game.start()
//             game.step();
//             game.step();
//             i.should.be.eql(2);
//         });
    });

    describe('#getPreviousStep()', function() {
        before(function() {
            stager = ngc.getStager();
            node = ngc.getClient();
            node.createPlayer({ id: '1', sid: '111111' });
            node.verbosity = -1000;

            tmp = { loops: [], counter: 1 };
            flag = false;

            loopCb = function() {
                var res;
                res = !!!flag;
                tmp.loops.push(res);
                tmp.counter++;
                if (tmp.counter > 3) flag = true;
                return res;
            };

            stager
                .next('s1')
                .loop({
                    id: 's2',
                    cb: function() {
                        if (tmp.counter++ >= 3) flag = true;
                    }
                }, loopCb)
                .loop('skipped', loopCb)
                .next('s4')
                .doLoop('s5', loopCb)
                .next('s6')
                .repeat('s7', 2)
                .next({
                    id: 's8',
                    steps: [ 'step8-1', 'step8-2', 'step8-3' ]
                })
                .repeat({
                    id: 's9',
                    steps: [ 'step9-1', 'step9-2', 'step9-3' ]
                }, 2)
                .finalize();

            stager.setDefaultStepRule(ngc.stepRules.WAIT);

            game = node.game;
            game.plot.stager.setState(stager.getState());
        });

        it('0.0.0', function() {
            var s = game.getPreviousStep();
            (s === null).should.eql(true);
        });

        it('1.1.1', function() {
            game.start();
            var s = game.getPreviousStep();
            GameStage.compare(s, '0').should.eql(0);
        });
        it('2.1.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '1').should.eql(0);
        });
        it('2.1.1 (delta=2)', function() {
            var s = game.getPreviousStep(2);
            GameStage.compare(s, '0').should.eql(0);
        });
        it('2.1.2', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '2.1.1').should.eql(0);
        });
        it('2.1.2 (delta=2)', function() {
            var s = game.getPreviousStep(2);
            GameStage.compare(s, '1.1.1').should.eql(0);
        });
        it('4.1.1 (one skipped)', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '2.1.2').should.eql(0);
        });
        it('4.1.1 (one skipped) (delta=2)', function() {
            var s = game.getPreviousStep(2);
            GameStage.compare(s, '2.1.1').should.eql(0);
        });
        it('4.1.1 (one skipped) (delta=3)', function() {
            var s = game.getPreviousStep(3);
            GameStage.compare(s, '1.1.1').should.eql(0);
        });
        it('5.1.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '4.1.1').should.eql(0);
        });
        it('6.1.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '5.1.1').should.eql(0);
        });
        it('7.1.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '6.1.1').should.eql(0);
        });
        it('7.1.2', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '7.1.1').should.eql(0);
        });
        it('8.1.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '7.1.2').should.eql(0);
        });
        it('8.2.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '8.1.1').should.eql(0);
        });
        it('8.3.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '8.2.1').should.eql(0);
        });
        it('9.1.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '8.3.1').should.eql(0);
        });
        it('9.2.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '9.1.1').should.eql(0);
        });
        it('9.3.1', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '9.2.1').should.eql(0);
        });
        it('9.1.2', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '9.3.1').should.eql(0);
        });
        it('9.2.2', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '9.1.2').should.eql(0);
        });
        it('9.3.2', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '9.2.2').should.eql(0);
        });
        it('9.3.2 (delta=3)', function() {
            var s = game.getPreviousStep(3);
            GameStage.compare(s, '9.3.1').should.eql(0);
        });
        it('END_SEQ (no game-over)', function() {
            game.step();
            var s = game.getPreviousStep();
            GameStage.compare(s, '9.2.2').should.eql(0);
        });
    });

   describe('#getNextStep()', function() {
        before(function() {
            stager = ngc.getStager();
            node = ngc.getClient();
            node.createPlayer({id: '1', sid: '11111111'});
            node.verbosity = -1000;

            tmp = { loops: [], counter: 1 };
            flag = false;

            loopCb = function() {
                var res;
                res = !!!flag;
                tmp.loops.push(res);
                tmp.counter++;
                if (tmp.counter > 3) flag = true;
                return res;
            };

            stager
                .next('s1')
                .loop({
                    id: 's2',
                    cb: function() {
                        if (tmp.counter++ >= 3) flag = true;
                    }
                }, loopCb)
                .loop('skipped', loopCb)
                .next('s4')
                .doLoop('s5', loopCb)
                .next('s6')
                .repeat('s7', 2)
                .next({
                    id: 's8',
                    steps: [ 'step8-1', 'step8-2', 'steo8-3' ]
                })
                .repeat({
                    id: 's9',
                    steps: [ 'step9-1', 'step9-2', 'step9-3' ]
                }, 2)
                .finalize();

            stager.setDefaultStepRule(ngc.stepRules.WAIT);

            game = node.game;
            game.plot.stager.setState(stager.getState());
        });

        it('0.0.0', function() {
            var s = game.getNextStep();
            GameStage.compare(s, '1').should.eql(0);
        });
        it('1.1.1 (next loop)', function() {
            game.start();
            var s = game.getNextStep();
            (s === null).should.eql(true);
        });
        it('1.1.1 (next loop) (delta=2)', function() {
            var s = game.getNextStep(2);
            (s === null).should.eql(true);
        });
        it('2.1.1', function() {
            game.step();
            var s = game.getNextStep();
            (s === null).should.eql(true);
        });
        it('2.1.2', function() {
            game.step();
            var s = game.getNextStep();
            (s === null).should.eql(true);
        });
        it('4.1.1 (one skipped)', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '5.1.1').should.eql(0);
        });
       it('4.1.1 (one skipped) (delta=2)', function() {
            var s = game.getNextStep(2);
            (s === null).should.eql(true);
       });
        it('5.1.1', function() {
            game.step();
            var s = game.getNextStep();
            (s === null).should.eql(true);
        });
        it('6.1.1', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '7.1.1').should.eql(0);
        });
        it('7.1.1', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '7.1.2').should.eql(0);
        });
        it('7.1.1 (delta=6)', function() {
            var s = game.getNextStep(6);
            GameStage.compare(s, '9.2.1').should.eql(0);
        });
        it('7.1.2', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '8.1.1').should.eql(0);
        });
        it('8.1.1', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '8.2.1').should.eql(0);
        });
        it('8.2.1', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '8.3.1').should.eql(0);
        });
        it('8.3.1', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '9.1.1').should.eql(0);
        });
        it('9.1.1', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '9.2.1').should.eql(0);
        });
        it('9.2.1', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '9.3.1').should.eql(0);
        });
        it('9.3.1', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '9.1.2').should.eql(0);
        });
        it('9.1.2', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '9.2.2').should.eql(0);
        });
        it('9.2.2', function() {
            game.step();
            var s = game.getNextStep();
            GameStage.compare(s, '9.3.2').should.eql(0);
        });
        it('9.3.2', function() {
            game.step();
            var s = game.getNextStep();
            (s === GamePlot.END_SEQ).should.eql(true);
        });
        it('END_SEQ (no game-over)', function() {
            game.step();
            var s = game.getNextStep();
            // console.log(game.getCurrentGameStage(), s);
            (s === GamePlot.END_SEQ).should.eql(true);
        });
    });

});
