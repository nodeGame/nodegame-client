var util = require('util');
var log = console.log;

var ngc = require('../index.js');
var Stager = ngc.Stager;

var node = ngc.getClient();
var stager = ngc.getStager();

module.exports = node;
node.verbosity = 0;


stager
    .next('stage 1', function() { console.log('aa'); return false; })
    .next('stage 2')
    .next('stage 3')
    .gameover();


var tmp, res;
var stagerState = stager.getState();

// Setup.
node.setup('plot', stagerState);
node.createPlayer({ id: 'testid' });
node.game.start({ step: false });

// First step.
res = node.game.step();


// Step through.
while (res) {
    tmp = node.game.getCurrentStepObject();
    console.log('Stage id: ', tmp.id);
    res = node.game.step();
}

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
