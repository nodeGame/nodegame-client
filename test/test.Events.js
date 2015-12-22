var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var GamePlot = ngc.GamePlot;
var Stager = ngc.Stager;
var J = ngc.JSUS;

var result, tmp, node, stager;


describe('Registering events', function() {

//     describe('registering events before a game is defined', function() {
//         before(function() {
//             node = ngc.getClient();
//             stager = ngc.getStager();
//             result = null;
//             tmp = node.
//         });
//
//         it('should add event listeners to the ng event emitter', functuin() {
//             node.events.ee.ng.
//         });
//     });
//
//     describe('registering events before a game is defined', function() {
//         before(function() {
//             node = ngc.getClient();
//             stager = ngc.getStager();
//             result = null;
//             tmp = node.
//             node.on('A', function() { console.log('A'); });
//             node.on('B', function() { console.log('B'); });
//         });
//
//         it('should add event listeners to the ng event emitter', functuin() {
//             node.events.ee.ng.
//         });
//     });

});



// Helper function!
///////////////////


// Setup functions.

function initGame(stager, node) {
    var sstate, mynode;
    stager.setDefaultStepRule(ngc.stepRules.WAIT);
    stager.reset();
    sstate = stager.getState();
    mynode = node || ngc.getClient();
    mynode.verbosity = -1000;
    mynode.setup('plot', sstate);
    mynode.createPlayer({ id: 'testid' });
    mynode.game.start({ step: false });
    return mynode.game;
}

function goThroughSteps(game, result) {
    var id, counter, tmp;
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
    // We are in END_SEQ or GAMEOVER.
    // One more step to finish.
    game.step();

    return result;
}

function hasNextStep(game) {
    var curStep, nextStep;
    curStep = game.getCurrentGameStage();
    nextStep = game.plot.next(curStep);
    return nextStep !== GamePlot.GAMEOVER && nextStep !== GamePlot.END_SEQ;
}

function testPositions(node, stager, len, debug) {
    var i, len, game, result;
    i = -1;
    result = {};
    for ( ; ++i < len ; ) {
        if (debug) console.log(i);
        game = initGame(stager);
        goThroughSteps(game, result);
    }
    return result;
}


function checkExitInitSteps() {
    it('should have called init and exit functions', function() {
        result.tot.should.eql(6);
    });

    it('should have called init before exit', function() {
        result.qwe[0].should.eql('init');
        result.qwe[1].should.eql('exit');
        result.rty[0].should.eql('init');
        result.rty[1].should.eql('exit');
        result.uio[0].should.eql('init');
        result.uio[1].should.eql('exit');
    });
}

function setupStagerForExitInitStepsTest() {

    stager.extendStep('qwe', {
        init: function() {
            result.tot = 1;
            result.qwe = [];
            result.qwe.push('init');
        },
        exit: function() {
            result.tot += 1;
            result.qwe.push('exit');
        }
    });

    stager.extendStep('rty', {
        init: function() {
            result.tot += 1;
            result.rty = [];
            result.rty.push('init');
        },
        exit: function() {
            result.tot += 1;
            result.rty.push('exit');
        }
    });

    stager.extendStep('uio', {
        init: function() {
            result.tot += 1;
            result.uio = [];
            result.uio.push('init');
        },
        exit: function() {
            result.tot += 1;
            result.uio.push('exit');
        }
    });
}
