var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var GamePlot = ngc.GamePlot;
var Stager = ngc.Stager;
var J = ngc.JSUS;

var result;
var stager = new Stager();

// tager.stage('stage 1');
// tager.step('step 1.1', '1');
// tager.step('step 1.2', '0..2');
// tager.step('step 1.3', '2');
//
// ebugger
// esult = testPositions(stager, 100);
//
// eturn;

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

// Setup.

function initGame(stager) {
    var sstate, mynode;
    stager.setDefaultStepRule(ngc.stepRules.WAIT);
    stager.reset();
    sstate = stager.getState();
    mynode = ngc.getClient();
    mynode.verbosity = -1000;
    mynode.setup('plot', sstate);
    mynode.createPlayer({ id: 'testid' });
    mynode.game.start({ step: false });
    return mynode.game;
}

function goThroughSteps(game, result) {
    var id, counter;
    result = result || {};
    counter = 0;

    // Step through.
    while (hasNextStep(game)) {
        game.step();
        tmp = game.getCurrentStepObj();
        id = tmp.id;
        if (!result[id]) result[id] = [];
        result[id].push(counter);
        counter ++;
    }
    return result;
}

function hasNextStep(game) {
    var curStep, nextStep;
    curStep = game.getCurrentGameStage();
    nextStep = game.plot.next(curStep);
    return nextStep !== GamePlot.GAMEOVER && nextStep !== GamePlot.END_SEQ;
}

function testPositions(stager, len) {
    var i, len, game, result;
    i = -1;
    result = {};
    for ( ; ++i < len ; ) {
        game = initGame(stager);
        debugger
        goThroughSteps(game, result);
    }
    return result;
}

describe('Moving through the sequence', function() {


     describe('#next: 3 fixed positions. Mode (A).', function() {
         before(function() {
             stager = ngc.getStager();
             result = null;

             stager.next('stage 1', '0');
             stager.next('stage 2', '1');
             stager.next('stage 3', '2');

             result = testPositions(stager, 100);
         });

         test3fixed();
     });

     describe('#next: 3 fixed positions. Mode (B).', function() {
         before(function() {
             stager = ngc.getStager();
             result = null;

             stager.next('stage 1');
             stager.next('stage 2');
             stager.next('stage 3');

             result = testPositions(stager, 100);
         });

         test3fixed();
     });

     describe('#next: 3 fixed positions. Mode (C).', function() {
         before(function() {
             stager = ngc.getStager();
             result = null;

             stager.next('stage 1');
             stager.next('stage 2');
             stager.next('stage 3', '*');

             result = testPositions(stager, 100);
         });

         test3fixed();
     });

     describe('#next: 3 fixed positions. Mode (D).', function() {
         before(function() {
             stager = ngc.getStager();
             result = null;

             stager.next('stage 1');
             stager.next('stage 2', '1');
             stager.next('stage 3', '*');

             result = testPositions(stager, 100);
         });

         test3fixed();
     });

     describe('#next: 3 fixed positions. Mode (E).', function() {
         before(function() {
             stager = ngc.getStager();
             result = null;

             stager.next('stage 1');
             stager.next('stage 2', '1');
             stager.next('stage 3');

             result = testPositions(stager, 100);
         });

         test3fixed();
     });

     describe('#next: two variable positions, 1 fixed. Mode(A).', function() {
         before(function() {
             stager = ngc.getStager();
             result = null;

             stager.next('stage 1', '0,2');
             stager.next('stage 2', '1');
             stager.next('stage 3', '0,2');

             result = testPositions(stager, 100);
         });

         test2variable1fixed();

     });

     describe('#next: two variable positions, 1 fixed. Mode(B).', function() {
         before(function() {
             stager = ngc.getStager();
             i = null, len = null, res = null, stagerStage = null;

             stager.next('stage 1', '*');
             stager.next('stage 2', '1');
             stager.next('stage 3', '*');

             result = testPositions(stager, 100);
         });

         test2variable1fixed(result);

     });

     describe('#next: variable steps within stage', function() {
         before(function() {
             stager = ngc.getStager();
             i = null, len = null, res = null, stagerStage = null;

             stager.next('stage 1');
             stager.step('step 1.1', '*');
             stager.step('step 1.2', '*');
             stager.step('step 1.3', '*');

             result = testPositions(stager, 100);
         });

         it('should have removed default step from stage 1', function() {
             typeof(result['stage 1'] + '').should.eql('undefined');
         });
         it('should have called only the three steps', function() {
             var keys;
             keys = Object.keys(result).sort();
             keys.should.eql(['step 1.1', 'step 1.2', 'step 1.3']);
         });

         it('should have called the three steps', function() {
             J.isArray(result['step 1.1']).should.eql(true);
             J.isArray(result['step 1.2']).should.eql(true);
             J.isArray(result['step 1.3']).should.eql(true);
         });
         it('should have called the three steps 100 times each', function() {
             result['step 1.1'].length.should.eql(100);
             result['step 1.2'].length.should.eql(100);
             result['step 1.3'].length.should.eql(100);
         });

         it('should have called the three steps in random order', function() {
             var sum = 0;
             result['step 1.1'].forEach(function(i) {
                 if (i !== 0 && i !== 1 && i !== 2) should.fail();
                 sum = sum + i;
             });
             sum.should.be.within(70,130);
             sum = 0;
             result['step 1.2'].forEach(function(i) {
                 if (i !== 0 && i !== 1 && i !== 2) should.fail();
                 sum = sum + i;
             });
             sum.should.be.within(70,130);
             sum = 0;
             result['step 1.3'].forEach(function(i) {
                 if (i !== 0 && i !== 1 && i !== 2) should.fail();
                 sum = sum + i;
             });
             sum.should.be.within(70,130);

         });

     });

// describe('#next: 1 fixed, 2 variable steps within stage', function() {
//        before(function() {
//            stager = ngc.getStager();
//            i = null, len = null, res = null, stagerStage = null;
//
//            stager.next('stage 1');
//            stager.step('step 1.1', '1');
//            stager.step('step 1.2', '0..2');
//            stager.step('step 1.3', '2');
//
//            result = testPositions(stager, 100);
//        });
//
//        it('should have removed default step from stage 1', function() {
//            typeof(result['stage 1'] + '').should.eql('undefined');
//        });
//        it('should have called only the three steps', function() {
//            var keys;
//            keys = Object.keys(result).sort();
//            keys.should.eql(['step 1.1', 'step 1.2', 'step 1.3']);
//        });
//
//        it('should have called the three steps', function() {
//            J.isArray(result['step 1.1']).should.eql(true);
//            J.isArray(result['step 1.2']).should.eql(true);
//            J.isArray(result['step 1.3']).should.eql(true);
//        });
//        it('should have called the three steps 100 times each', function() {
//            result['step 1.1'].length.should.eql(100);
//            result['step 1.2'].length.should.eql(100);
//            result['step 1.3'].length.should.eql(100);
//        });
//
//        it('should have called the three steps in right order', function() {
//            var sum = 0;
//            console.log(result['step 1.1']);
//            console.log(result['step 1.2']);
//            console.log(result['step 1.3']);
//            result['step 1.1'].forEach(function(i) {
//                if (i !== 0 && i !== 1) should.fail();
//                sum = sum + i;
//            });
//            sum.should.be.within(20,80);
//            sum = 0;
//            result['step 1.2'].forEach(function(i) {
//                if (i !== 0 && i !== 1) should.fail();
//                sum = sum + i;
//            });
//            sum.should.be.within(20,80);
//            sum = 0;
//            result['step 1.3'].forEach(function(i) {
//                if (i !== 2) should.fail();
//                sum = sum + i;
//            });
//            sum.should.be.eql(200);
//
//        });
//
//    });
});



// Helper function!
///////////////////




function test3fixed() {
    it('should have called the three steps', function() {
        J.isArray(result['stage 1']).should.eql(true);
        J.isArray(result['stage 2']).should.eql(true);
        J.isArray(result['stage 3']).should.eql(true);
    });
    it('should have called the three steps 100 times each', function() {
        result['stage 1'].length.should.eql(100);
        result['stage 2'].length.should.eql(100);
        result['stage 3'].length.should.eql(100);
    });

    it('should have called the three in the right order', function() {
        var sum = 0;
        result['stage 1'].forEach(function(i) { sum = sum + i; });
        sum.should.eql(0);
        sum = 0;
        result['stage 2'].forEach(function(i) { sum = sum + i; });
        sum.should.eql(100);
        sum = 0;
        result['stage 3'].forEach(function(i) { sum = sum + i; });
        sum.should.eql(200);
    });
}

function test2variable1fixed() {
    it('should have called the three steps', function() {
        J.isArray(result['stage 1']).should.eql(true);
        J.isArray(result['stage 2']).should.eql(true);
        J.isArray(result['stage 3']).should.eql(true);
    });
    it('should have called the three steps 100 times each', function() {
        result['stage 1'].length.should.eql(100);
        result['stage 2'].length.should.eql(100);
        result['stage 3'].length.should.eql(100);
    });

    it('should have called the three in the right order', function() {
        var sum = 0;
        result['stage 1'].forEach(function(i) {
            if (i !== 0 && i !== 2) should.fail();
            sum = sum + i;
        });
        sum.should.be.within(70,130);
        sum = 0;
        result['stage 2'].forEach(function(i) {
            i.should.eql(1);
            sum = sum + i;
        });
        sum.should.eql(100);
        sum = 0;
        result['stage 3'].forEach(function(i) {
            if (i !== 0 && i !== 2) should.fail();
            sum = sum + i;
        });
        sum.should.be.within(70,130);
    });
}
