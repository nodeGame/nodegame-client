var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Stager = ngc.Stager;
var GamePlot = ngc.GamePlot;
var J = ngc.JSUS;

var node = ngc.getClient();

module.exports = node;
node.verbosity = -1000;

var i, len, tmp, res;
var stagerState;

var stepRule, globals, properties, init, gameover, done;

var stager = new Stager();

describe('Stager', function() {

    describe('constructor', function() {
        before(function() {
            stager = ngc.getStager();
        });
        it('should have 1 block', function() {
            stager.blocks.length.should.eql(1);
        });
        it('should have 0 steps, 0 stages', function() {
            J.size(stager.stages).should.eql(0);
            J.size(stager.steps).should.eql(0);
        });
        it('should have empty sequence', function() {
            stager.sequence.length.should.eql(0);
        });
    });

    describe('#addStage: stage with callback defined', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { console.log('ahah'); };
            stager.addStage({
                id: 'stage 1',
                cb: tmp,
                a: 1,
                b: 2
            });
        });
        it('should have 1 stage and 1 steps', function() {
            J.size(stager.stages).should.eql(1);
            J.size(stager.steps).should.eql(1);
        });
        it('should have the 1 stage correctly named', function() {
            stager.stages['stage 1'].id.should.eql('stage 1');
        });
        it('should have the 1 step correctly named', function() {
            stager.steps['stage 1'].id.should.eql('stage 1');
        });
        it('should have the 1 step assigned to the same stage', function() {
            stager.stages['stage 1'].steps[0].should.eql('stage 1');
        });
        it('should have the specified callback in the step', function() {
            stager.steps['stage 1'].cb.should.eql(tmp);
        });
        it('should not create a new block', function() {
            stager.blocks.length.should.eql(1);
        });
        it('should have empty sequence', function() {
            stager.sequence.length.should.eql(0);
        });
        it('should keep extra properties of the stage', function() {
            stager.stages['stage 1'].a.should.eql(1);
            stager.stages['stage 1'].b.should.eql(2);
        });
        it('should remove the cb field', function() {
            stager.stages['stage 1'].should.not.have.property('cb');
        });
    });

    describe('#addStage: stage with steps array defined', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { console.log('ahah'); };
            stager.addStage({
                id: 'stage 1',
                steps: ['1.1', '1.2', {
                    id: '1.3',
                    cb: tmp
                }],
                a: 1,
                b: 2
            });
        });
        it('should have 1 stage and 3 steps', function() {
            J.size(stager.stages).should.eql(1);
            J.size(stager.steps).should.eql(3);
        });
        it('should have the 1 stage correctly named', function() {
            stager.stages['stage 1'].id.should.eql('stage 1');
        });
        it('should have the 3 step correctly named', function() {
            stager.steps['1.1'].id.should.eql('1.1');
            stager.steps['1.2'].id.should.eql('1.2');
            stager.steps['1.3'].id.should.eql('1.3');
        });
        it('should have the 3 step assigned to the same stage', function() {
            stager.stages['stage 1'].steps[0].should.eql('1.1');
            stager.stages['stage 1'].steps[1].should.eql('1.2');
            stager.stages['stage 1'].steps[2].should.eql('1.3');
        });
        it('should have the specified callback in the last step', function() {
            stager.steps['1.3'].cb.should.eql(tmp);
        });
        it('should not create a new block', function() {
            stager.blocks.length.should.eql(1);
        });
        it('should have empty sequence', function() {
            stager.sequence.length.should.eql(0);
        });
        it('should keep extra properties of the stage', function() {
            stager.stages['stage 1'].a.should.eql(1);
            stager.stages['stage 1'].b.should.eql(2);
        });
        it('should not have a cb field', function() {
            stager.stages['stage 1'].should.not.have.property('cb');
        });
    });

    describe('#cloneStage', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { i = 1 };
            stager.addStage({
                id: 'stage 1',
                steps: ['a', 'b'],
                done: tmp,
                a: 1,
                b: 2
            });
            stager.cloneStage('stage 1', 'clone');

        });
        it('should have created clone', function() {
            (typeof stager.stages['clone']).should.eql('object');
        });
        it('should have copied all properties into clone', function() {
            var c = stager.stages['clone'];
            c.id.should.eql('clone');
            c.a.should.eql(1);
            c.b.should.eql(2);
            c.done();
            i.should.eql(1);
        });
        it('should have copied by value and not by reference', function() {
            var c = stager.stages['clone'];
            var o = stager.stages['stage 1'];
            c.b = 3;
            o.b.should.eql(2);
            c.done = function() { i = 2 };
            o.done();
            i.should.eql(1);
        });
    });

    describe('#addStep', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { console.log('ahah'); };
            stager.addStep({
                id: 'step 1',
                cb: tmp,
                a: 1,
                b: 2
            });
        });
        it('should have 1 stage and 1 steps', function() {
            J.size(stager.stages).should.eql(0);
            J.size(stager.steps).should.eql(1);
        });
        it('should have the 1 step correctly named', function() {
            stager.steps['step 1'].id.should.eql('step 1');
        });
        it('should have the specified callback in the step', function() {
            stager.steps['step 1'].cb.should.eql(tmp);
        });
        it('should not create a new block', function() {
            stager.blocks.length.should.eql(1);
        });
        it('should have empty sequence', function() {
            stager.sequence.length.should.eql(0);
        });
        it('should keep extra properties of the step', function() {
            stager.steps['step 1'].a.should.eql(1);
            stager.steps['step 1'].b.should.eql(2);
        });
    });

    describe('#cloneStep', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { i = 1 };
            stager.addStep({
                id: 'step 1',
                cb: tmp,
                a: 1,
                b: 2
            });
            stager.cloneStep('step 1', 'clone');

        });
        it('should have created clone', function() {
            (typeof stager.steps['clone']).should.eql('object');
        });
        it('should have copied all properties into clone', function() {
            var c = stager.steps['clone'];
            c.id.should.eql('clone');
            c.a.should.eql(1);
            c.b.should.eql(2);
            c.cb();
            i.should.eql(1);
        });
        it('should have copied by value and not by reference', function() {
            var c = stager.steps['clone'];
            var o = stager.steps['step 1'];
            c.b = 3;
            o.b.should.eql(2);
            c.cb = function() { i = 2 };
            o.cb();
            i.should.eql(1);
        });
    });

    describe('#next: 3 stages with default step', function() {
        before(function() {
            stager = ngc.getStager();
            tmp = null, i = null, len = null, res = null, stagerStage = null;
            stager.next('stage 1');
            stager.next('stage 2');
            stager.next('stage 3');
        });
        it('should have 3 stages and 3 steps', function() {
            J.size(stager.stages).should.eql(3);
            J.size(stager.steps).should.eql(3);
        });
        it('should have 3 steps correctly named', function() {
            stager.steps['stage 1'].id.should.eql('stage 1');
            stager.steps['stage 2'].id.should.eql('stage 2');
            stager.steps['stage 3'].id.should.eql('stage 3');
        });
        it('should have 3 stages of 1 step each', function() {
            stager.stages['stage 1'].steps[0].should.eql('stage 1');
            stager.stages['stage 2'].steps[0].should.eql('stage 2');
            stager.stages['stage 3'].steps[0].should.eql('stage 3');
        });
        it('should create 6 new blocks', function() {
            stager.blocks.length.should.eql(7);
        });
    });

    describe('#next: 1 stage steps defined', function() {
        before(function() {
            stager = ngc.getStager();
            tmp = null, i = null, len = null, res = null, stagerStage = null;
            stager.next({
                id: 'stage 1',
                steps: [ 'step 1.1', 'step 1.2', 'step 1.3' ]
            });
        });
        it('should have 1 stage and 3 steps', function() {
            J.size(stager.stages).should.eql(1);
            J.size(stager.steps).should.eql(3);
        });
        it('should have the 3 steps correctly named', function() {
            stager.steps['step 1.1'].id.should.eql('step 1.1');
            stager.steps['step 1.2'].id.should.eql('step 1.2');
            stager.steps['step 1.3'].id.should.eql('step 1.3');
        });
        it('should have the 3 steps assigned to the same stage', function() {
            stager.stages['stage 1'].steps[0].should.eql('step 1.1');
            stager.stages['stage 1'].steps[1].should.eql('step 1.2');
            stager.stages['stage 1'].steps[2].should.eql('step 1.3');
        });
        it('should create 2 new blocks', function() {
            stager.blocks.length.should.eql(3);
        });
        it('should have empty sequence', function() {
            stager.sequence.length.should.eql(0);
        });
    });


    describe('#next: 1 stage cb defined', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { console.log('ahah'); };
            stager.next({
                id: 'stage 1',
                cb: tmp,
                a: 1,
                b: 2
            });

        });
        it('should have 1 stage and 1 steps', function() {
            J.size(stager.stages).should.eql(1);
            J.size(stager.steps).should.eql(1);
        });
        it('should have the 1 step correctly named', function() {
            stager.steps['stage 1'].id.should.eql('stage 1');
        });
        it('should have the 1 step assigned to the same stage', function() {
            stager.stages['stage 1'].steps[0].should.eql('stage 1');
        });
        it('should have the specified callback in the step', function() {
            stager.steps['stage 1'].cb.should.eql(tmp);
        });
        it('should create 2 new blocks', function() {
            stager.blocks.length.should.eql(3);
        });
        it('should keep extra properties of the step', function() {
            stager.steps['stage 1'].a.should.eql(1);
            stager.steps['stage 1'].b.should.eql(2);
        });
        it('should have empty sequence', function() {
            stager.sequence.length.should.eql(0);
        });
    });

    describe('#next: 1 stage already existing step with same name', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { i = 1 };
            stager.addStep({
                id: 'instructions',
                cb: tmp
            });
            stager.next('instructions');

        });
        it('should have 1 stage and 1 steps', function() {
            J.size(stager.stages).should.eql(1);
            J.size(stager.steps).should.eql(1);
        });
        it('should have step and stage correctly named', function() {
            stager.steps['instructions'].id.should.eql('instructions');
            stager.stages['instructions'].id.should.eql('instructions');
        });
        it('should have the 1 step assigned to the same stage', function() {
            stager.steps['instructions'].cb();
            i.should.eql(1);
        });
        it('should have empty sequence', function() {
            stager.sequence.length.should.eql(0);
        });
    });

    describe('#next: 3 stages with default step', function() {
        before(function() {
            stager = ngc.getStager();
            tmp = null, i = null, len = null, res = null, stagerStage = null;
            stager.next('stage 1');
            stager.next('stage 2');
            stager.next('stage 3');
        });
        it('should have 3 stages and 3 steps', function() {
            J.size(stager.stages).should.eql(3);
            J.size(stager.steps).should.eql(3);
        });
        it('should have 3 steps correctly named', function() {
            stager.steps['stage 1'].id.should.eql('stage 1');
            stager.steps['stage 2'].id.should.eql('stage 2');
            stager.steps['stage 3'].id.should.eql('stage 3');
        });
        it('should have 3 stages of 1 step each', function() {
            stager.stages['stage 1'].steps[0].should.eql('stage 1');
            stager.stages['stage 2'].steps[0].should.eql('stage 2');
            stager.stages['stage 3'].steps[0].should.eql('stage 3');
        });
        it('should create 6 new blocks', function() {
            stager.blocks.length.should.eql(7);
        });
    });

    describe('#repeat', function() {
        before(function() {
            stager = ngc.getStager();
            tmp = null, i = null, len = null, res = null, stagerStage = null;
            stager.repeat('1', 10);
        });
        it('should have 1 stage and 1 step', function() {
            J.size(stager.stages).should.eql(1);
            J.size(stager.steps).should.eql(1);
        });
        it('should have the num property in finalized sequence ', function() {
            stager.finalize();
            stager.sequence[0].num.should.eql(10);
        });
        it('should have the type "repeat" in finalized sequence ', function() {
            stager.sequence[0].type.should.eql('repeat');
        });

    });

    describe('#loop', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { return Math.random() < 0.5; };
            stager.loop('1', tmp);
        });
        it('should have 1 stage and 1 step', function() {
            J.size(stager.stages).should.eql(1);
            J.size(stager.steps).should.eql(1);
        });
        it('should have the num property in finalized sequence ', function() {
            stager.finalize();
            stager.sequence[0].cb.should.eql(tmp);
        });
        it('should have the type "repeat" in finalized sequence ', function() {
            stager.sequence[0].type.should.eql('loop');
        });
    });

    describe('#doLoop', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { return Math.random() < 0.5; };
            stager.doLoop('1', tmp);
        });
        it('should have 1 stage and 1 step', function() {
            J.size(stager.stages).should.eql(1);
            J.size(stager.steps).should.eql(1);
        });
        it('should have the num property in finalized sequence ', function() {
            stager.finalize();
            stager.sequence[0].cb.should.eql(tmp);
        });
        it('should have the type "repeat" in finalized sequence ', function() {
            stager.sequence[0].type.should.eql('doLoop');
        });
    });

    describe('#finalize, #reset', function() {
        before(function() {
            stager = ngc.getStager();
            tmp = null, i = null, len = null, res = null, stagerStage = null;
            stager.next('1').next('2');
            stager.finalize();
        });
        it('should be finalized', function() {
            stager.finalized.should.be.true;
        });
        it('should add 2 stages in the sequence', function() {
            stager.sequence.length.should.eql(2);
        });
        it('should have stage "1", then "2" in the sequence', function() {
            stager.sequence[0].id.should.eql('1');
            stager.sequence[1].id.should.eql('2');
        });
        it('should have stages of type "plain" in the sequence', function() {
            stager.sequence[0].type.should.eql('plain');
            stager.sequence[1].type.should.eql('plain');
        });
        it('should have steps in the stages of the sequence', function() {
            stager.sequence[0].steps[0].should.eql('1');
            stager.sequence[1].steps[0].should.eql('2');
        });
        it('should not alter blocks, stages, steps', function() {
            J.size(stager.stages).should.eql(2);
            J.size(stager.steps).should.eql(2);
            stager.blocks.length.should.eql(5);
        });
        // RESET.
        it('should delete the sequence when reset is invoked', function() {
            stager.reset();
            stager.sequence.length.should.eql(0);
        });
        it('should keep other structures when reset is invoked', function() {
            J.size(stager.stages).should.eql(2);
            J.size(stager.steps).should.eql(2);
            stager.blocks.length.should.eql(5);
        });
        it('should not be finalized after reset is invoked', function() {
            stager.finalized.should.be.false;
        });
        it('should allow to add more stages and steps after reset', function() {
            stager
                .repeat('3', 3)
                .loop({
                    id: '4',
                    steps: [ '4.1', '4.2', '4.3' ]
                }, function () { return Math.random() < 0.5; })
                .doLoop('5', function() { return true })

            J.size(stager.stages).should.eql(5);
            J.size(stager.steps).should.eql(7);
            stager.blocks.length.should.eql(11);
            stager.sequence.length.should.eql(0);
        });

        it('should finalize correctly again after reset', function() {
            stager.finalize();
            J.size(stager.stages).should.eql(5);
            J.size(stager.steps).should.eql(7);
            stager.blocks.length.should.eql(11);
            stager.sequence.length.should.eql(5);

            stager.sequence[0].steps[0].should.eql('1');
            stager.sequence[1].steps[0].should.eql('2');
            stager.sequence[2].steps[0].should.eql('3');
            stager.sequence[3].steps[0].should.eql('4.1');
            stager.sequence[3].steps[1].should.eql('4.2');
            stager.sequence[3].steps[2].should.eql('4.3');
            stager.sequence[4].steps[0].should.eql('5');

        });

    });

    describe('#next: 3 stage with default step: 2 aliases', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { console.log('ahah'); };
            stager.addStage({
                id: 'last',
                cb: tmp
            });
            stager.next('stage 1');
            stager.next('stage 1 AS stage 2');
            stager.next('last AS stage 3');
        });
        it('should have 4 stages and 3 steps', function() {
            J.size(stager.stages).should.eql(4);
            J.size(stager.steps).should.eql(2);
        });
        it('should have 3 steps correctly named', function() {
            stager.steps['stage 1'].id.should.eql('stage 1');
            stager.steps['last'].id.should.eql('last');
        });
        it('should have 3 stages of 1 step each', function() {
            stager.stages['stage 1'].steps[0].should.eql('stage 1');
            stager.stages['stage 2'].steps[0].should.eql('stage 1');
            stager.stages['stage 3'].steps[0].should.eql('last')
            stager.stages['last'].steps[0].should.eql('last');
        });
        it('should create 6 new blocks', function() {
            stager.blocks.length.should.eql(7);
        });

        it('should have correct sequence when finalized', function() {
            stager.finalize();
            stager.sequence.length.should.be.eql(3);
            stager.sequence[0].id.should.be.eql('stage 1');
            stager.sequence[1].id.should.be.eql('stage 2');
            stager.sequence[2].id.should.be.eql('stage 3');

            stager.sequence[0].steps[0].should.be.eql('stage 1');
            stager.sequence[0].steps.length.should.be.eql(1);
            stager.sequence[1].steps[0].should.be.eql('stage 1');
            stager.sequence[1].steps.length.should.be.eql(1);
            stager.sequence[2].steps[0].should.be.eql('last');
            stager.sequence[2].steps.length.should.be.eql(1);
        });
    });

    describe('#skip, #unskip, #isSkipped', function() {
        before(function() {
            stager = ngc.getStager();
            tmp = null, i = null, len = null, res = null, stagerStage = null;
            stager
                .next('1')
                .next('2')
                .next({
                    id: '3',
                    steps: [ '3.1', '3.2', '3.3' ]
                });
            stager.skip('2');
            stager.skip('3', '3.3');
            stager.finalize();
        });
        it('should fill in the toSkip object', function() {
            stager.toSkip.stages['2'].should.be.true;
            stager.toSkip.steps['3.3.3'].should.be.true;
        });

        it('should update isSkipped', function() {
            stager.isSkipped('2').should.be.true
            stager.isSkipped('3', '3.3.3').should.be.true;
        });
        it('should add 2 stages in the sequence', function() {
            stager.sequence.length.should.eql(2);
        });
        it('should add 2 steps in stage 3 in the sequence', function() {
            stager.sequence[1].steps[0].should.eql('3.1');
            stager.sequence[1].steps[1].should.eql('3.2');
        });
    });

    describe('#set|getDefaultCallback', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                if (Math.random() < 0.5) node.done();
            };
            stager.setDefaultCallback(tmp);

            stager
                .next('1')
                .next({
                    id: '2',
                    steps: [ '2.1', '2.2' ]
                })
                .next({
                    id: '3',
                    cb: function() {}
                });
        });
        it('should set default callback', function() {
            stager.defaultCallback.should.eql(tmp);
        });
        it('should return default callback', function() {
            stager.getDefaultCallback().should.eql(tmp);
        });
        it('should add default callback to steps without cb', function() {
            stager.steps['1'].cb.should.eql(tmp);
            stager.steps['2.1'].cb.should.eql(tmp);
            stager.steps['2.2'].cb.should.eql(tmp);
            stager.steps['3'].cb.should.not.eql(tmp);
        });
    });


    describe('various set|get', function() {
        before(function() {
            stager = ngc.getStager();
            tmp = null, i = null, len = null, res = null, stagerStage = null;

            stepRule = function() { return Math.random() < 0.5 };
            globals = { a: 1, b: 2, c: 3 };
            properties = { z: 1, x: 2, y: 3 };
            init = function () { console.log('init'); };
            gameover = function () { console.log('gameover'); };

            stager.setDefaultStepRule(stepRule);
            stager.setDefaultGlobals(globals);
            stager.setDefaultProperties(properties);
            stager.setOnInit(init);
            stager.setOnGameOver(gameover);

        });
        after(function() {
            stepRule = null, globals = null, properties = null, init = null,
            gameover = null;
        });
        it('should set default stepRule', function() {
            stager.getDefaultStepRule().should.eql(stepRule);
        });
        it('should set default globals', function() {
            stager.getDefaultGlobals().should.eql(globals);
        });
        it('should set default properties', function() {
            stager.getDefaultProperties().should.eql(properties);
        });
        it('should set default init function', function() {
            stager.getOnInit().should.eql(init);
        });
        it('should set default gameover function', function() {
            stager.getOnGameover().should.eql(gameover);
            stager.getOnGameOver().should.eql(gameover);
        });
        it('should mixin default globals', function() {
            var g;
            stager.setDefaultGlobals({ c: 4, d: 5}, true);
            g = stager.getDefaultGlobals();
            g.a.should.eql(1);
            g.b.should.eql(2);
            g.c.should.eql(4);
            g.d.should.eql(5);
        });
        it('should mixin default properties', function() {
            var g;
            stager.setDefaultProperties({ y: 4, w: 5}, true);
            g = stager.getDefaultProperties();
            g.z.should.eql(1);
            g.x.should.eql(2);
            g.y.should.eql(4);
            g.w.should.eql(5);
        });
        it('should set one default property', function() {
            var g;
            stager.setDefaultProperty('foo', 0);
            g = stager.getDefaultProperties();
            g.foo.should.eql(0);
        });
    });

    describe('#extendStep: update function', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                i = (i || 0) + 1;
            };
            done = function(increment) {
                len = (len || 0) + increment;
            };
            stager.addStep({
                id: 'step 1',
                cb: tmp,
                done: done,
                c: 3,
                d: 4,
                e: 5
            });

            stager.next('stage 1');

            stager.extendStep('step 1', function(o) {
                o._cb = o.cb;
                o.cb = function() {
                    this._cb();
                    i++;
                };
                o._done = o.done;
                o.done = function(increment) {
                    this._done((increment-1));
                    len = len + increment;
                };
                o.c = 'a';
                o.e = undefined;
                return o;
            });

            stager.extendStep('stage 1', function(o) {
                o.__cb = o.cb;
                o.cb = function() {
                    if ('undefined' !== typeof this.__cb) i++;
                    i++;
                };
                o.foo = 'foo1';
                return o;
            });

        });
        it('should have extended `cb`', function() {
            stager.steps['step 1'].cb();
            i.should.eql(2);
        });
        it('should have extended `done`', function() {
            stager.steps['step 1'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c`', function() {
            stager.steps['step 1'].c.should.eql('a');
        });
        it('should have not overwritten `d`', function() {
            stager.steps['step 1'].d.should.eql(4);
        });
        it('should have overwritten `e`', function() {
            (typeof stager.steps['step 1'].e).should.eql('undefined');
        });
        it('should have added `foo`', function() {
            stager.steps['stage 1'].foo.should.eql('foo1');
        });
        it('should have extended `cb` (2)', function() {
            stager.steps['stage 1'].cb();
            i.should.eql(4);
        });

    });

    describe('#extendStep: object', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                i = (i || 0) + 1;
            };
            done = function(increment) {
                len = (len || 0) + increment;
            };
            stager.addStep({
                id: 'step 1',
                cb: tmp,
                done: done,
                c: 3,
                d: 4,
                e: 5
            });

            stager.next('stage 1');

            stager.extendStep('step 1', {
                cb: function() {
                    i = 10;
                },
                done: function(increment) {
                    len = 1 + increment;
                },
                c: 'a',
                e: undefined
            });

        });
        it('should have extended `cb`', function() {
            stager.steps['step 1'].cb();
            i.should.eql(10);
        });
        it('should have extended `done`', function() {
            stager.steps['step 1'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c`', function() {
            stager.steps['step 1'].c.should.eql('a');
        });
        it('should have not overwritten `d`', function() {
            stager.steps['step 1'].d.should.eql(4);
        });
        it('should have overwritten `e`', function() {
            (typeof stager.steps['step 1'].e).should.eql('undefined');
        });

    });


    describe('#extendAllSteps: update function', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                i = (i || 0) + 1;
            };
            done = function(increment) {
                len = (len || 0) + increment;
            };
            stager.addStep({
                id: 'step 1',
                cb: tmp,
                done: done,
                c: 3,
                d: 4,
                e: 5
            });

            stager.addStage({
                id: 'stage 1',
                cb: tmp
            });

            stager.next('stage 1');

            stager.extendAllSteps(function(o) {
                o._cb = o.cb;
                o.cb = function() {
                    this._cb();
                    i++;
                };
                o._done = o.done;
                o.done = function(increment) {
                    this._done((increment-1));
                    len = len + increment;
                };
                o.c = 'a';
                o.e = undefined;
                return o;
            });


        });

        // Step: step 1.

        it('should have extended `cb`', function() {
            stager.steps['step 1'].cb();
            i.should.eql(2);
        });
        it('should have extended `done`', function() {
            stager.steps['step 1'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c`', function() {
            stager.steps['step 1'].c.should.eql('a');
        });
        it('should have not overwritten `d`', function() {
            stager.steps['step 1'].d.should.eql(4);
        });
        it('should have overwritten `e`', function() {
            (typeof stager.steps['step 1'].e).should.eql('undefined');
        });

        // Step: stage 1.

        it('should have extended `cb` (stage)', function() {
            stager.steps['stage 1'].cb();
            i.should.eql(4); // updated to 2 by previous call above.
        });
        it('should have extended `done` (stage)', function() {
            (function() {
                stager.steps['stage 1'].done(2);
            }).should.throw();
        });
        it('should have overwritten `c` (stage)', function() {
            stager.steps['stage 1'].c.should.eql('a');
        });
        it('should have not created `d` (stage)', function() {
            (typeof stager.steps['stage 1'].d).should.eql('undefined');
        });
        it('should have created `e` (stage)', function() {
            (typeof stager.steps['stage 1'].e).should.eql('undefined');
        });
    });

    describe('#extendAllSteps: object', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                i = (i || 0) + 1;
            };
            done = function(increment) {
                len = (len || 0) + increment;
            };
            stager.addStep({
                id: 'step 1',
                cb: tmp,
                done: done,
                c: 3,
                d: 4,
                e: 5
            });

            stager.next('stage 1');

            stager.extendAllSteps({
                cb: function() {
                    i = 10;
                },
                done: function(increment) {
                    len = 1 + increment;
                },
                c: 'a',
                e: undefined
            });

        });

        // Step 1.

        it('should have extended `cb` (step1)', function() {
            stager.steps['step 1'].cb();
            i.should.eql(10);
        });
        it('should have extended `done` (step1)', function() {
            stager.steps['step 1'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c` (step1)', function() {
            stager.steps['step 1'].c.should.eql('a');
        });
        it('should have not overwritten `d` (step1)', function() {
            stager.steps['step 1'].d.should.eql(4);
        });
        it('should have overwritten `e` (step1)', function() {
            (typeof stager.steps['step 1'].e).should.eql('undefined');
        });

        // Stage 1.

        it('should have extended `cb` (step2)', function() {
            i = null;
            stager.steps['stage 1'].cb();
            i.should.eql(10);
        });
        it('should have extended `done` (step2)', function() {
            stager.steps['stage 1'].done(10);
            len.should.eql(11);
        });
        it('should have overwritten `c` (step2)', function() {
            stager.steps['stage 1'].c.should.eql('a');
        });
        it('should have not overwritten `d` (step2)', function() {
            (typeof stager.steps['stage 1'].d).should.eql('undefined');
        });
        it('should have overwritten `e` (step2)', function() {
            (typeof stager.steps['stage 1'].e).should.eql('undefined');
        });
    });

    describe('#extendStage: update function', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                i = (i || 0) + 1;
            };
            done = function(increment) {
                len = (len || 0) + increment;
            };
            stager.addStage({
                id: 'stage 1',
                cb: tmp,
                done: done,
                c: 3,
                d: 4,
                e: 5
            });

            stager.next('stage 2');

            stager.extendStage('stage 1', function(o) {
                o._done = o.done;
                o.done = function(increment) {
                    this._done((increment-1));
                    len = len + increment;
                };
                o.c = 'a';
                o.e = undefined;
                return o;
            });

            stager.extendStep('stage 1', function(o) {
                o._cb = o.cb;
                o.cb = function() {
                    this._cb();
                    i++;
                }
                return o;
            });

            stager.extendStep('stage 2', function(o) {
                o._cb = o.cb;
                o.cb = function() {
                    if ('undefined' !== typeof this._cb) i++;
                    i++;
                };
                o.foo = 'foo1';
                return o;
            });
        });
        it('should have extended `cb`', function() {
            stager.steps['stage 1'].cb();
            i.should.eql(2);
        });
        it('should have extended `done`', function() {
            stager.stages['stage 1'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c`', function() {
            stager.stages['stage 1'].c.should.eql('a');
        });
        it('should have not overwritten `d`', function() {
            stager.stages['stage 1'].d.should.eql(4);
        });
        it('should have overwritten `e`', function() {
            (typeof stager.stages['stage 1'].e).should.eql('undefined');
        });
        it('should have added `foo`', function() {
            stager.steps['stage 2'].foo.should.eql('foo1');
        });
        it('should have extended `cb` (2)', function() {
            stager.steps['stage 2'].cb();
            i.should.eql(4);
        });

    });

    describe('#extendStage: object', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                i = (i || 0) + 1;
            };
            done = function(increment) {
                len = (len || 0) + increment;
            };
            stager.addStage({
                id: 'stage 1',
                cb: tmp,
                done: done,
                c: 3,
                d: 4,
                e: 5
            });

            stager.next('stage 1');

            stager.extendStage('stage 1', {
                done: function(increment) {
                    len = 1 + increment;
                },
                c: 'a',
                e: undefined
            });

        });
        it('should have not extended `cb` in step', function() {
            stager.steps['stage 1'].cb();
            i.should.eql(1);
        });
        it('should have extended `done`', function() {
            stager.stages['stage 1'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c`', function() {
            stager.stages['stage 1'].c.should.eql('a');
        });
        it('should have not overwritten `d`', function() {
            stager.stages['stage 1'].d.should.eql(4);
        });
        it('should have overwritten `e`', function() {
            (typeof stager.stages['stage 1'].e).should.eql('undefined');
        });

    });


    describe('#extendAllStages: update function', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                i = (i || 0) + 1;
            };
            done = function(increment) {
                len = (len || 0) + increment;
            };

            stager.addStage({
                id: 'stage 1',
                cb: tmp
            });

            stager.addStage({
                id: 'stage 2',
                steps: [ '1', '2'],
                done: done,
                c: 3,
                d: 4,
                e: 5
            });

            stager.extendAllStages(function(o) {
                o._done = o.done;
                o.done = function(increment) {
                    this._done((increment-1));
                    len = len + increment;
                };
                o.c = 'a';
                o.e = undefined;
                return o;
            });


        });

        // Stage 1.

        it('should have extended `done` (stage1)', function() {
            (function() {
                stager.stages['stage 1'].done(2);
            }).should.throw();
        });
        it('should have overwritten `c` (stage1)', function() {
            stager.stages['stage 1'].c.should.eql('a');
        });
        it('should have overwritten `e` (stage1)', function() {
            (typeof stager.stages['stage 1'].e).should.eql('undefined');
        });

        // Stage 2.

        it('should have extended `done` (stage2)', function() {
            stager.stages['stage 2'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c` (stage2)', function() {
            stager.stages['stage 2'].c.should.eql('a');
        });
        it('should have not overwritte `d` (stage2)', function() {
            stager.stages['stage 2'].d.should.eql(4);
        });
        it('should have created `e` (stage2)', function() {
            (typeof stager.stages['stage 2'].e).should.eql('undefined');
        });

    });

    describe('#extendAllStages: object', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                i = (i || 0) + 1;
            };
            done = function(increment) {
                len = (len || 0) + increment;
            };
            stager.addStage({
                id: 'stage 1',
                cb: tmp,
                done: done,
                c: 3,
                d: 4,
                e: 5
            });

            stager.next('stage 1');
            stager.next('stage 2');

            stager.extendAllStages({
                done: function(increment) {
                    len = 1 + increment;
                },
                c: 'a',
                e: undefined
            });

        });

        // Stage 1.

        it('should have not extended `cb` in step (stage 1)', function() {
            stager.steps['stage 1'].cb();
            i.should.eql(1);
        });
        it('should have extended `done` (stage 1)', function() {
            stager.stages['stage 1'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c` (stage 1)', function() {
            stager.stages['stage 1'].c.should.eql('a');
        });
        it('should have not overwritten `d` (stage 1)', function() {
            stager.stages['stage 1'].d.should.eql(4);
        });
        it('should have overwritten `e` (stage 1)', function() {
            (typeof stager.stages['stage 1'].e).should.eql('undefined');
        });

        // Stage 2.

        it('should have extended `done` (stage 2)', function() {
            stager.stages['stage 2'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c` (stage 2)', function() {
            stager.stages['stage 2'].c.should.eql('a');
        });
        it('should have not overwritten `d` (stage 2)', function() {
            (typeof stager.stages['stage 2'].d).should.eql('undefined');
        });
        it('should have overwritten `e` (stage 2)', function() {
            (typeof stager.stages['stage 2'].e).should.eql('undefined');
        });

    });

    describe('should fail', function() {
        beforeEach(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { console.log('ahah'); };

        });
        it('if stage id is not a (non-empty) string', function() {
            (function() {
                stager.addStage({ id: null, cb: tmp});
            }).should.throw();
            (function() {
                stager.next('');
            }).should.throw();
            (function() {
                stager.next({
                    id: {},
                    cb: tmp
                });
            }).should.throw();
        });
        it('if step id is not a (non-empty) string', function() {
            (function() {
                stager.addStep({ id: null, cb: tmp});
            }).should.throw();
            (function() {
                stager.next({
                    id: 'stage 1',
                    steps: [ '' ]
                });
            }).should.throw();
        });
        it('if stage cb is not a function', function() {
            (function() {
                stager.addStage({ id: 'a', cb: null});
            }).should.throw();
            (function() {
                stager.next({
                    id: 'a',
                    cb: {}
                });
            }).should.throw();
        });
        it('if stage steps is not a non-empty array', function() {
            (function() {
                stager.next({
                    id: 'a',
                    steps: []
                });
            }).should.throw();
            (function() {
                stager.next({
                    id: 'a',
                    steps: null
                });
            }).should.throw();
            (function() {
                stager.next({
                    id: 'a',
                    steps: 'ah'
                });
            }).should.throw();
        });
        it('if step cb is not a function', function() {
            (function() {
                stager.addStep({ id: 'a', cb: 'a'});
            }).should.throw();
        });
        it('if repetition parameter is not a positive number', function() {
            (function() {
                stager.repeat('ahah');
            }).should.throw();
            (function() {
                stager.repeat('ahah', -2);
            }).should.throw();
            (function() {
                stager.repeat('ahah', NaN);
            }).should.throw();
            (function() {
                stager.repeat('ahah', {});
            }).should.throw();
            (function() {
                stager.repeat({
                    id: 'ahah',
                    cb: function() {}
                });
            }).should.throw();
            (function() {
                stager.repeat({
                    id: 'ahah',
                    cb: function() {}
                }, -3);
            }).should.throw();
        });
        it('if loop function is not a function', function() {
            (function() {
                stager.loop('ahah');
            }).should.throw();
            (function() {
                stager.loop('ahah', -2);
            }).should.throw();
            (function() {
                stager.doLoop('ahah', NaN);
            }).should.throw();
            (function() {
                stager.doLoop('ahah', {});
            }).should.throw();
            (function() {
                stager.loop({
                    id: 'ahah',
                    cb: function() {}
                });
            }).should.throw();
            (function() {
                stager.doLoop({
                    id: 'ahah',
                    cb: function() {}
                }, -3);
            }).should.throw();
        });
        it('if attempting to modify sequence after stager was finalized',
           function() {

               (function() {
                   stager.next('stage').finalize();
                   stager.next('ahah');
               }).should.throw();
               (function() {
                   stager.repeat('ahah');
               }).should.throw();
               (function() {
                   stager.loop('ahah');
               }).should.throw();
               (function() {
                   stager.step({ id: 'a', cb: function() {} });
               }).should.throw();
           });
        it('if skip, unskip are called with wrong parameters',
           function() {
               (function() {
                   stager.skip('');
               }).should.throw();
               (function() {
                   stager.skip(4);
               }).should.throw();
               (function() {
                   stager.skip(undefined, '1');
               }).should.throw();
               (function() {
                   stager.unskip('');
               }).should.throw();
               (function() {
                   stager.unskip(4);
               }).should.throw();
               (function() {
                   stager.unskip(undefined, '1');
               }).should.throw();
           });
        it('other fails', function() {
            (function() {
                stager.addStep();
            }).should.throw();
            (function() {
                stager.addStage();
            }).should.throw();
            (function() {
                stager.next();
            }).should.throw();
            (function() {
                stager.loop();
            }).should.throw();
            (function() {
                stager.doLoop();
            }).should.throw();
            (function() {
                stager.repeat();
            }).should.throw();
        });
        it('if extendStep|Stage are referencing non-existing steps|stages',
           function() {
               (function() {
                   stager.extendStep('ahah', { a: 1});
               }).should.throw();
               (function() {
                   stager.extendStage('bb', { a: 1});
               }).should.throw();
           });
        it('if extendStep|Stage are called with wrong parameters',
           function() {
               stager.next('foo');
               (function() {
                   stager.extendStep('foo');
               }).should.throw();
               (function() {
                   stager.extendStep('foo', 1);
               }).should.throw();
               (function() {
                   stager.extendStep('foo', { id: 'fi' });
               }).should.throw();
               (function() {
                   stager.extendStep('foo', { id: undefined });
               }).should.throw();               (function() {
                   stager.extendStep(undefined, { a: 1 });
               }).should.throw();
               (function() {
                   stager.extendStage('foo');
               }).should.throw();
               (function() {
                   stager.extendStage('foo', 1);
               }).should.throw();
               (function() {
                   stager.extendStage('foo', { id: 'fi' });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', { cb: function() {} });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', { cb: undefined });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', { steps: undefined });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', { steps: [] });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', { id: undefined });
               }).should.throw();               (function() {
                   stager.extendStage(undefined, { a: 1 });
               }).should.throw();
           });
        it('if extendStep|Stage update functions returns a non valid element',
           function() {
               (function() {
                   stager.extendStep('foo', function() {});
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {});
               }).should.throw();
               (function() {
                   stager.extendStep('foo', function() {
                       return { id: 'a' };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'a' };
                   });
               }).should.throw();
               (function() {
                   stager.extendStep('foo', function() {
                       return { id: 'foo', cb: function() {} };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', cb: function() {} };
                   });
               }).should.throw();
           });
        it('if cloneStep|Stage are referencing non-existing steps|stages',
           function() {
               (function() {
                   stager.cloneStep('ahah', 'a');
               }).should.throw();
               (function() {
                   stager.cloneStage('bb', 'b');
               }).should.throw();
           });

        it('if cloneStep|Stage are using an already taken id for clone',
           function() {
               (function() {
                   stager.cloneStep('foo', 'foo');
               }).should.throw();
               (function() {
                   stager.cloneStage('foo', 'foo');
               }).should.throw();
           });
        it('if cloneStep|Stage are called with wrong parameters',
           function() {
               (function() {
                   stager.cloneStep(null, 'foo');
               }).should.throw();
               (function() {
                   stager.cloneStep('foo', {});
               }).should.throw();
               (function() {
                   stager.cloneStage(undefined, 'foo');
               }).should.throw();
               (function() {
                   stager.cloneStage('foo', 3);
               }).should.throw();
           });
    });

    describe('#extendStep: update function', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() {
                i = (i || 0) + 1;
            };
            done = function(increment) {
                len = (len || 0) + increment;
            };
            stager.addStep({
                id: 'step 1',
                cb: tmp,
                done: done,
                c: 3,
                d: 4,
                e: 5
            });

            stager.next('stage 1');

            stager.extendStep('step 1', function(o) {
                o._cb = o.cb;
                o.cb = function() {
                    this._cb();
                    i++;
                };
                o._done = o.done;
                o.done = function(increment) {
                    this._done((increment-1));
                    len = len + increment;
                };
                o.c = 'a';
                o.e = undefined;
                return o;
            });

            stager.extendStep('stage 1', function(o) {
                o.__cb = o.cb;
                o.cb = function() {
                    if ('undefined' !== typeof this.__cb) i++;
                    i++;
                };
                o.foo = 'foo1';
                return o;
            });

        });
        it('should have extended `cb`', function() {
            stager.steps['step 1'].cb();
            i.should.eql(2);
        });
        it('should have extended `done`', function() {
            stager.steps['step 1'].done(2);
            len.should.eql(3);
        });
        it('should have overwritten `c`', function() {
            stager.steps['step 1'].c.should.eql('a');
        });
        it('should have not overwritten `d`', function() {
            stager.steps['step 1'].d.should.eql(4);
        });
        it('should have overwritten `e`', function() {
            (typeof stager.steps['step 1'].e).should.eql('undefined');
        });
        it('should have added `foo`', function() {
            stager.steps['stage 1'].foo.should.eql('foo1');
        });
        it('should have extended `cb` (2)', function() {
            stager.steps['stage 1'].cb();
            i.should.eql(4);
        });

    });
});


return;


// Simple mode test:
console.log();
console.log('SIMPLE MODE');
console.log('===========');
stager.addStep(stepWoop);
stager.addStep(stepBeep);

stager.addStage(stepDurr);
stager.addStage(stepBlah);
stager.addStage(stageMain);
stager.setDefaultGlobals({GLOB: 3.14});
stager.setDefaultProperties({myProp: 1});

var counter = 0;
var flag = false;

stager
    .repeat('main', 2)
    .loop('durr', function() {
        if (counter++ >= 3) return false;
        return true;
    })
    .next('blah')
    .next('durr AS durrurrurr')
    .gameover()
;

// Testing extraction:
console.log("Extraction of 'main':");
console.log(util.inspect(stager.extractStage('main'), false, 4));
console.log();
console.log("Extraction of ['blah', 'durrurrurr', 'blah']:");
console.log(util.inspect(stager.extractStage(['blah', 'durrurrurr', 'blah']),
                         false, 4));
console.log();

/*
  console.log('Sequence (JS object):');
  console.log(stager.getSequence('o'));
  console.log();

  console.log('Sequence (human readable stages):');
  console.log(stager.getSequence('hstages'));
  console.log();

  console.log('Sequence (human readable steps):');
  console.log(stager.getSequence('hsteps'));
  console.log();

  // Testing state getter/setter:
  console.log('State:');
  console.log(stager.getState());
  console.log();
  stager.setState(stager.getState());
  console.log('State (after get+set):');
  console.log(stager.getState());
  console.log();

  stager.seqTestRun(false);
*/


// Expert mode test:
/*
  console.log();
  console.log('EXPERT MODE');
  console.log('===========');

  stager.clear();

  stager.addStep(stepWoop);
  stager.addStep(stepBeep);

  stager.addStage(stepDurr);
  stager.addStage(stepBlah);
  stager.addStage(stageMain);

  flag = false;

  stager.registerNext('main', function() { return 'blah'; });
  stager.registerGeneralNext(function() {
  if (!flag) { flag = true; return 'durr'; }
  return null;
  });

  // Testing state getter/setter:
  console.log('State:');
  console.log(stager.getState());
  console.log();
  stager.setState(stager.getState());
  console.log('State (after get+set):');
  console.log(stager.getState());
  console.log();

  stager.seqTestRun(true, 'main');
*/
