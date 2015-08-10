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


// TODO: understand difference between .step and passing a stage with
// a steps array.

// Skip - unskip might not work correctly, depending of how steps are added.

// Skip - unskip

// stager = ngc.getStager();
// decorateStagerRepeat(stager);
//
// debugger
//
// stager.skip('stage 2', 'step 2.2');
// console.log(stager.toSkip);
// console.log(stager.isSkipped('stage 2', 'step 2.1'));
//
// stager.finalize();
//
// debugger
//
// console.log(stager.getSequence('hsteps'));
// // console.log(stager.blocks);
//
//
// stager = ngc.getStager();
// stager
//     .next('1')
//     .next('2');
//
//     stager.step({
//         id: 'step 2.1',
//         cb: function() { console.log('step 2.1') }
//     });
//     stager.step({
//         id: 'step 2.2',
//         cb: function() { console.log('step 2.2') }
//     });
//
//     stager.next({
//         id: '3',
//         steps: [ '3.1', '3.2', '3.3' ]
//     });
//
// console.log(
//
// // stager.skip('2');
// debugger
// stager.skip('2', 'step 2.1');
//
//
// stager.finalize();
//
// console.log(stager.getSequence('hsteps'));
//
// return

// Finalize - Reset - Finalize
// stager = ngc.getStager();
// stager.next('1').next('2');
// console.log(stager.blocks);
// debugger
// stager.finalize();
// stager.reset();
// console.log(stager.blocks);
// debugger
// stager.next('3').next('4').next('5');
// debugger
// stager.finalize();
// console.log(stager.sequence);
// console.log(stager.getSequence('hsteps'));
// return

function simple(stager) {

    stager.next({
        id: 'stage 1',
        cb: function() {
            console.log('stage 1')
            node.done();
        }
    });

    stager.next('stage 2');

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() { console.log('step 2.2') }
    });

    stager.next('stage 3');

    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    // stager.endBlock();
}

var i, len, tmp, res;
var stager, stagerState;

var operations = [ 'next', 'repeat', 'loop', 'doLoop' ];


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
                cb: tmp
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
        it('should have empty sequence', function() {
            stager.sequence.length.should.eql(0);
        });
    });

    describe('#clear, #init', function() {
        before(function() {
            stager = ngc.getStager();
            tmp = null, i = null, len = null, res = null, stagerStage = null;
            stager.next('1').next('2');
        });
        it('should remove everything when #clear is invoked', function() {
            stager.clear();
            J.size(stager.stages).should.eql(0);
            J.size(stager.steps).should.eql(0);
            stager.blocks.length.should.eql(0);
            stager.sequence.length.should.eql(0);
        });
        it('should add 1 default block when init is invoked', function() {
            stager.init();
            J.size(stager.stages).should.eql(0);
            J.size(stager.steps).should.eql(0);
            stager.sequence.length.should.eql(0);
            stager.blocks.length.should.eql(1);
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
            stager.isSkipped('3', '3.3').should.be.true;
        });
        it('should add 2 stages in the sequence', function() {
            stager.sequence.length.should.eql(2);
            // console.log(stager.getSequence('hsteps'));
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

    });

});

return;

// Setup.
// node.setup('plot', stagerState);
// node.createPlayer({ id: 'testid' });
// node.game.start({ step: false });

// // Step through.
// while (hasNextStep()) {
//     node.game.step();
//     tmp = node.game.getCurrentStepObj();
//     console.log('Stage id: ', tmp.id);
// }
//
// function hasNextStep() {
//     var curStep, nextStep;
//     curStep = node.game.getCurrentGameStage();
//     nextStep = node.game.plot.next(curStep);
//     return nextStep !== GamePlot.GAMEOVER && nextStep !== GamePlot.END_SEQ;
// }
//
// return;



function decorateStager(stager) {


    // stager.stageBlock('0..1');

    stager.next({
        id: 'stage 1',
        cb: function() {
            console.log('stage 1');
            node.done();
        }
    }, '0..1');

    // stager.endBlock();

    stager.stageBlock('0..1');

    stager.next('stage 2', '0..1');

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() { console.log('step 2.2') }
    });

    stager.next('stage 3', '0..1');

    stager.endBlock();

    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    // stager.endBlock();
}

function decorateStagerRepeat(stager) {


    stager.stage({
        id: 'stage 1',
        cb: function() { console.log('stage 1') }
    });

    stager.repeat('stage 2', 2);

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() { console.log('step 2.2') }
    });

    stager.repeat('stage 3', 1);


    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    // stager.endBlock();
    stager.setOnGameOver(function() {
        console.log('Game over!');
    });
}


function decorateStagerLoop(stager) {
    var counter;
    counter = 0;

    stager.loop(
        {
            id: 'stage 1',
            cb: function() {
                counter++;
                console.log('stage 1')
            }
        },
        function() {
            return counter < 3;
        }
    );

    stager.loop('stage 2', function() {
        return counter < 5;
    });

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() {
            counter++;
            console.log('step 2.2')
        }
    });

    stager.loop('stage 3',  function() {
        // Notice: counter is double incremented when
        // hasNextStep is called.
        return ++counter < 6;
    });


    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    stager.setOnGameOver(function() {
        console.log('Game over!');
    });
}

function decorateStagerDoLoop(stager) {
    var counter;
    counter = 0;

    stager.doLoop(
        {
            id: 'stage 1',
            cb: function() {
                counter++;
                console.log('stage 1')
            }
        },
        function() {
            return counter < 3;
        }
    );

    stager.doLoop('stage 2', function() {
        return counter < 5;
    });

    stager.step({
        id: 'step 2.1',
        cb: function() { console.log('step 2.1') }
    });
    stager.step({
        id: 'step 2.2',
        cb: function() {
            counter++;
            console.log('step 2.2')
        }
    });

    stager.doLoop('stage 3',  function() {
        // Notice: counter is double incremented when
        // hasNextStep is called.
        // console.log(counter);
        return ++counter < 6;
    });

    stager.gameover();

    // Default auto step.
    stager.setDefaultStepRule(ngc.stepRules.WAIT);

    stager.setOnGameOver(function() {
        console.log('Game over!');
    });

}


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
