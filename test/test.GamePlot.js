"use strict";

var util = require('util');
var should = require('should');

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
var loopCb, flag, tmp;

//  stager = ngc.getStager();
//  node = ngc.getClient();
//  node.verbosity = -1000;
//
//  stager
//      .next('1')
//      .next('2')
//      .next({
//          id: '3',
//          steps: [ '3a', '3b' ]
//      })
//      .finalize();
//
//  stager.extendStep('1', {
//      a: 1,
//      d: 'step1'
//  });
//
//  stager.extendStep('3a', {
//      a: 3,
//      b: 'b'
//  });
//
//  stager.extendStep('3b', {
//      b: 'foo',
//      c: 'ah'
//  });
//
//  stager.extendStage('3', {
//      b: '3'
//  });
//
//  stager.extendStage('2', {
//      b: '2'
//  });
//
//  stager.setDefaultProperty('d', 'DD');
//
//  plot = new GamePlot(node, stager);
//
// plot.getProperty('3', 'd');
//
// plot.updateProperty('3', 'd', 'up');
//
// plot.getProperty('3', 'd');



//
// var a = plot.stepsToNextStage('1');
// console.log(a);
// var a = plot.stepsToNextStage('2');
// console.log(a);

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

        it('should return END_SEQ when reached end of the stages', function() {
            plot.next('5.1.5').should.be.eql(GamePlot.END_SEQ);
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
        it('should return 0.0.0 at beginning of the stages', function() {
            GameStage.compare(plot.previous('1.1.1'), new GameStage());
        });
        it('should return 0.0.0 before 0.0.0', function() {
            GameStage.compare(plot.previous('0.0.0'), new GameStage());
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
        it('should return END_SEQ at the end of the stages', function() {
            plot.jump('5.1.5', 1).should.be.eql(GamePlot.END_SEQ);
        });
        it('should return END_SEQ when exceeding the last stage', function() {
            plot.jump('5.1.4', 5).should.be.eql(GamePlot.END_SEQ);
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
        it('should return 0.0.0 at beginning of the stages', function() {
            GameStage.compare(plot.jump('1.1.1', -1),
                              new GameStage()).should.be.eql(0);
        });
        it('should return 0.0.0 when going before 0.0.0', function() {
            GameStage.compare(plot.jump('1.1.1', -3),
                              new GameStage()).should.be.eql(0);
        });
    });
    //

    describe('#next() with loops', function() {
        before(function() {

            stager = ngc.getStager();
            node = ngc.getClient();
            node.verbosity = -1000;

            flag = false;
            tmp = { loops: [], counter: 1 };

            loopCb = function() {
                var res;
                res = !flag;
                tmp.loops.push(res);
                tmp.counter++;
                if (tmp.counter > 3) flag = true;
                return res;
            };

            stager
                .next('1')
                .loop('2', loopCb)
                .loop('skipped', loopCb)
                .next('4')
                .doLoop('5', loopCb)
                .next('6')
                .finalize();

            plot = new GamePlot(node, stager);
        });

        it('should return 1.1.1', function() {
            GameStage.compare(plot.next('0.0.0'),'1.1.1')
                .should.be.equal(0);
        });
        it('should return 2.1.1', function() {
            GameStage.compare(plot.next('1.1.1'),'2.1.1')
                .should.be.equal(0);
        });
        it('should return 2.1.2', function() {
            GameStage.compare(plot.next('2.1.1'),'2.1.2')
                .should.be.equal(0);
        });
        it('should return 2.1.3', function() {
            GameStage.compare(plot.next('2.1.2'),'2.1.3')
                .should.be.equal(0);
        });
        it('should return 4.1.1 (stage 3 skipped)', function() {
            GameStage.compare(plot.next('2.1.3'),'4.1.1')
                .should.be.equal(0);
        });
        it('should return null (2.1.3, execLoops=false)', function() {
            (plot.next('2.1.3', false) === null).should.eql(true);
        });
        it('should return 5.1.1', function() {
            GameStage.compare(plot.next('4.1.1'),'5.1.1')
                .should.be.equal(0);
        });
        it('should return 6.1.1', function() {
            GameStage.compare(plot.next('5.1.1'),'6.1.1')
                .should.be.equal(0);
        });

        it('should return END_SEQ when reached end of the stages', function() {
            plot.next('6.1.1').should.be.eql(GamePlot.END_SEQ);
        });

        it('should return null when stage is not existing', function() {
            (plot.next('10.1.1') === null).should.be.equal(true);
        });
    });

    //
    describe('#previous() with loops', function() {
        before(function() {

            stager = ngc.getStager();
            node = ngc.getClient();
            node.verbosity = -1000;

            flag = false;
            tmp = { loops: [], counter: 1 };

            loopCb = function() {
                var res;
                res = !flag;
                tmp.loops.push(res);
                tmp.counter++;
                if (tmp.counter > 1) flag = true;
                return res;
            };

            stager
                .next('1')
                .loop('2', loopCb)
                .loop('skipped', loopCb)
                .next('4')
                .doLoop('5', loopCb)
                .next('6')
                .finalize();

            plot = new GamePlot(node, stager);
        });


        it('should return null when stage is not existing', function() {
            (plot.previous('10.1.1') === null).should.be.equal(true);
        });

        it('should return 5.1.1', function() {
            GameStage.compare(plot.previous('6.1.1'),'5.1.1')
                .should.be.equal(0);
        });

        it('should return 5.1.2', function() {
            GameStage.compare(plot.previous('5.1.3'),'5.1.2')
                .should.be.equal(0);
        });

        it('should return 5.1.1 (decreasing round)', function() {
            GameStage.compare(plot.previous('5.1.2'),'5.1.1')
                .should.be.equal(0);
        });

        it('should return 4.1.1', function() {
            GameStage.compare(plot.previous('5.1.1'),'4.1.1')
                .should.be.equal(0);
        });

        it('should return 3.1.1', function() {
            GameStage.compare(plot.previous('4.1.1'),'3.1.1')
                .should.be.equal(0);
        });

        it('should return 1.1.1 (skip one stage)', function() {
            GameStage.compare(plot.previous('3.1.1'),'1.1.1')
                .should.be.equal(0);
        });

        it('should return null (2.1.1, execLoops=false)', function() {
            (plot.previous('3.1.1', false) === null).should.eql(true);
        });

        it('should return 1.1.1', function() {
            GameStage.compare(plot.previous('2.1.1'),'1.1.1')
                .should.be.equal(0);
        });
        it('should return 0.0.0', function() {
            GameStage.compare(plot.previous('1.1.1'),'0.0.0')
                .should.be.equal(0);
        });
        it('should return 0.0.0 before 0.0.0', function() {
            GameStage.compare(plot.previous('0.0.0'),'0.0.0')
                .should.be.equal(0);
        });
    });

    describe('#jump() forward with loops', function() {
        before(function() {

            stager = ngc.getStager();
            node = ngc.getClient();
            node.verbosity = -1000;

            flag = false;
            tmp = { loops: [], counter: 1 };

            loopCb = function() {
                var res;
                res = !flag;
                tmp.loops.push(res);
                tmp.counter++;
                if (tmp.counter > 3) flag = true;
                return res;
            };

            stager
                .next('1')
                .loop('2', loopCb)
                .loop('skipped', loopCb)
                .next('4')
                .doLoop('5', loopCb)
                .next('6')
                .finalize();

            plot = new GamePlot(node, stager);
        });

        it('should return 1.1.1', function() {
            GameStage.compare(plot.jump('0', 1), '1')
                .should.be.equal(0);
        });
        it('should return 2.1.1', function() {
            GameStage.compare(plot.jump('1.1.1', 1), '2.1.1')
                .should.be.equal(0);
        });
        it('should return 2.1.2', function() {
            GameStage.compare(plot.jump('2.1.1', 1), '2.1.2')
                .should.be.equal(0);
        });
        it('should return 3.1.1 (delta=2)', function() {
            GameStage.compare(plot.jump('2.1.2', 2), '4.1.1')
                .should.be.equal(0);
        });
        it('should return null (3.1.1, delta=2, execLoops=false)', function() {
            (plot.jump('2.1.2', 2, false) === null).should.eql(true);
        });

        it('should return 5.1.1', function() {
            GameStage.compare(plot.jump('4.1.1', 1), '5.1.1')
                .should.be.equal(0);
        });
        it('should return END_SEQ at the end of the stages', function() {
            plot.jump('6.1.1', 1).should.be.eql(GamePlot.END_SEQ);
        });

        it('should return null (2.1.2, delta=10)', function() {
            (plot.jump('2.1.2', 10, false) === null).should.eql(true);
        });
    });

    describe('#jump() backward', function() {
        before(function() {

            stager = ngc.getStager();
            node = ngc.getClient();
            node.verbosity = -1000;

            flag = false;
            tmp = { loops: [], counter: 1 };

            loopCb = function() {
                var res;
                res = !flag;
                tmp.loops.push(res);
                tmp.counter++;
                if (tmp.counter > 3) flag = true;
                return res;
            };

            stager
                .next('1')
                .loop('2', loopCb)
                .loop('skipped', loopCb)
                .next('4')
                .doLoop('5', loopCb)
                .next('6')
                .finalize();

            plot = new GamePlot(node, stager);
        });

        it('should return 1.1.1 (delta=-1)', function() {
            GameStage.compare(plot.jump('2.1.1', -1), '1.1.1')
                .should.be.equal(0);
        });
        it('should return 3.1.1 (delta=-1)', function() {
            GameStage.compare(plot.jump('4.1.1', -1), '3.1.1')
                .should.be.equal(0);
        });
        it('should return null (delta=-2, execLoops=false)', function() {
            (plot.jump('4.1.1', -2, false) === null).should.eql(true);
        });
        it('should return 3.1.1 (delta=-2)', function() {
            (plot.jump('3.3.1', -2) === null).should.eql(true);
        });
        it('should return 0.0.0 at beginning of the stages', function() {
            GameStage.compare(plot.jump('1.1.1', -1), '0')
                .should.be.eql(0);
        });

    });

    //
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

    });

    describe('#stepsToNextStage()', function() {
        before(function() {

            stager = ngc.getStager();
            node = ngc.getClient();
            node.verbosity = -1000;

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

            plot = new GamePlot(node, stager);
        });

        it('should return 1 for stage 1', function() {
            plot.stepsToNextStage('1.1.1').should.eql(1);
        });

        it('should return 3 for stage 3.1', function() {
            plot.stepsToNextStage('3.1.1').should.eql(3);
        });

        it('should return 2 for stage 3.2', function() {
            plot.stepsToNextStage('3.2.1').should.eql(2);
        });

        it('should return 1 for stage 3.3', function() {
            plot.stepsToNextStage('3.3.1').should.eql(1);
        });

        it('should return 1 for stage 5.1', function() {
            plot.stepsToNextStage('5.1.1').should.eql(1);
        });

        it('should return null for non-existing stage', function() {
            (plot.stepsToNextStage('5.5.1') === null).should.eql(true);
        });
    });

    describe('#stepsFromPreviousStage()', function() {
        it('should return 1 for stage 1', function() {
            plot.stepsFromPreviousStage('1.1.1').should.eql(1);
        });

        it('should return 1 for stage 3.1.1', function() {
            plot.stepsFromPreviousStage('3.1.1').should.eql(1);
        });

        it('should return 2 for stage 3.2.1', function() {
            plot.stepsFromPreviousStage('3.2.1').should.eql(2);
        });

        it('should return 3 for stage 3.3.1', function() {
            plot.stepsFromPreviousStage('3.3.1').should.eql(3);
        });

        it('should return 1 for stage 5.1.1', function() {
            plot.stepsFromPreviousStage('5.1.1').should.eql(1);
        });

        it('should return null for non-existing stage', function() {
            (plot.stepsFromPreviousStage('5.5.1') === null).should.eql(true);
        });
    });


    describe('#stepsToNextStage() countRepeat=TRUE', function() {
        before(function() {

            stager = ngc.getStager();
            node = ngc.getClient();
            node.verbosity = -1000;

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
                .loop('lo', function() { return true; })
                .doLoop('dolo', function() { return true; })
                .finalize();

            plot = new GamePlot(node, stager);
        });

        it('should return 1 for stage 1', function() {
            plot.stepsToNextStage('1.1.1', true).should.eql(1);
        });

        it('should return 3 for stage 3.1.1', function() {
            plot.stepsToNextStage('3.1.1', true).should.eql(9);
        });

        it('should return 2 for stage 3.2.1', function() {
            plot.stepsToNextStage('3.2.1', true).should.eql(8);
        });

        it('should return 1 for stage 3.3.1', function() {
            plot.stepsToNextStage('3.3.1', true).should.eql(7);
        });

        it('should return 1 for stage 3.3.2', function() {
            plot.stepsToNextStage('3.3.2', true).should.eql(4);
        });

        it('should return 1 for stage 3.1.3', function() {
            plot.stepsToNextStage('3.1.3', true).should.eql(3);
        });

        it('should return 1 for stage 3.3.3', function() {
            plot.stepsToNextStage('3.3.3', true).should.eql(1);
        });

        it('should return 1 for stage 5.1.1', function() {
            plot.stepsToNextStage('5.1.1', true).should.eql(5);
        });

        it('should return null for non-existing stage', function() {
            (plot.stepsToNextStage('5.5.1', true) === null).should.eql(true);
        });

        it('should return null for loop stage', function() {
            (plot.stepsToNextStage('lo', true) === null).should.eql(true);
        });

        it('should return null for doLoop stage', function() {
            (plot.stepsToNextStage('dolo', true) === null).should.eql(true);
        });
    });

    describe('#stepsFromPreviousStage() countRepeat=TRUE', function() {
        it('should return 1 for stage 1', function() {
            plot.stepsFromPreviousStage('1.1.1', true).should.eql(1);
        });

        it('should return 1 for stage 3.1', function() {
            plot.stepsFromPreviousStage('3.1.1', true).should.eql(1);
        });

        it('should return 2 for stage 3.2.1', function() {
            plot.stepsFromPreviousStage('3.2.1', true).should.eql(2);
        });

        it('should return 3 for stage 3.3.1', function() {
            plot.stepsFromPreviousStage('3.3.1', true).should.eql(3);
        });

        it('should return 1 for stage 5.1.1', function() {
            plot.stepsFromPreviousStage('5.1.1', true).should.eql(1);
        });

        it('should return null for non-existing stage', function() {
            (plot.stepsFromPreviousStage('5.5.1', true) === null)
                .should.eql(true);
        });

        it('should return null for loop stage', function() {
            (plot.stepsFromPreviousStage('lo', true) === null).should.eql(true);
        });

        it('should return null for doLoop stage', function() {
            (plot.stepsFromPreviousStage('dolo', true) === null)
                .should.eql(true);
        });

        it('should return 5 for stage 5.1.5', function() {
            plot.stepsFromPreviousStage('5.1.5', true).should.eql(5);
        });

        it('should return 3 for stage 5.1.3', function() {
            plot.stepsFromPreviousStage('5.1.3', true).should.eql(3);
        });

        it('should return 2 for stage 3.2.2', function() {
            plot.stepsFromPreviousStage('3.2.2', true).should.eql(5);
        });

        it('should return 2 for stage 3.2.3', function() {
            plot.stepsFromPreviousStage('3.2.3', true).should.eql(8);
        });

        it('should return 2 for stage 3.3.3', function() {
            plot.stepsFromPreviousStage('3.3.3', true).should.eql(9);
        });
    });

    describe('#getProperty()', function() {
        before(function() {

            stager = ngc.getStager();
            node = ngc.getClient();
            node.verbosity = -1000;

            stager
                .next('1')
                .next('2')
                .next({
                    id: '3',
                    steps: [ '3a', '3b' ]
                })
                .finalize();

            stager.extendStep('1', {
                a: 1,
                d: 'step1'
            });

            stager.extendStep('3a', {
                a: 3,
                b: 'b'
            });

            stager.extendStep('3b', {
                b: 'foo',
                c: 'ah'
            });

            stager.extendStage('3', {
                b: '3'
            });

            stager.extendStage('2', {
                b: '2'
            });

            stager.setDefaultProperty('d', 'DD');

            plot = new GamePlot(node, stager);
        });

        it('step 3 property "d" be "default"', function() {
            plot.getProperty('3', 'd').should.eql('DD');
        });
        it('step 3 property "d" should be cached', function() {
            plot.cache['3.1.1'].d.should.eql('DD');
        });
        it('step 3 property "d" should be fetched from cache', function() {
            plot.cache['3.1.1'].d = J.clone(plot.cache['3.1.1'].d);
            plot.cache['3.1.1'].d = 'muhahah';
            plot.getProperty('3', 'd').should.eql('muhahah');

        });
        it('step 1 property "d" be from "step"', function() {
            plot.getProperty('1', 'd').should.eql('step1');
        });
        it('step 2 property "b" be from "stage"', function() {
            plot.getProperty('2', 'b').should.eql('2');
        });
        it('step 3a property "b" be from "step"', function() {
            plot.getProperty('3a', 'b').should.eql('b');
        });
    });

    // Must follow getProperty.
    describe('#updateProperty()', function() {

        it('step 3a property "b" be from "step"', function() {
            var res;
            res = plot.updateProperty('3a', 'b', 'updated-b');
            res.should.eql(true);
        });

        it('step 3a property "b" should update cache', function() {
            plot.cache['3.1.1'].b.should.eql('updated-b');
        });

        it('updated step 3a property "b" should be eql to update', function() {
            plot.getProperty('3a', 'b').should.eql('updated-b');
        });

        it('step 3a property "bb" be from "step"', function() {
            var res;
            res = plot.updateProperty('3a', 'bb', 'updated-b');
            res.should.eql(false);
        });
        it('step 3a property "bb" should *not* update cache', function() {
            ('undefined' === typeof plot.cache['3.1.1'].bb).should.eql(true);
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
