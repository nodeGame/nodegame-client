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

// stager = ngc.getStager();
// stager.next({
//     id: 'a',
//     steps: [ '' ]
// });
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
    });

    describe('#addStage', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { console.log('ahah'); };
            stager.addStage({
                id: 'stage 1',
                cb: tmp
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
    });

    describe('#addStep', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;
            tmp = function() { console.log('ahah'); };
            stager.addStep({
                id: 'step 1',
                cb: tmp
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
        });

    });

});

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

// stager.reset();

// console.log(stager.getSequence('hsteps'));

// decorateStagerSimple(stager);

// stager.finalize();

// console.log(stager.getSequence('hsteps'));
// console.log(stager.blocks);

return

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
