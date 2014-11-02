var ngc = require('nodegame-client');

var node = ngc.getClient();
var stager = ngc.getStager();

var util = require('util');
var log = console.log;

var stepWoop = {
    id: 'woop',
    cb: function() { log("woop woop!"); },
    globals: { GLOB: 42 }
};

var stepBeep = {
    id: 'beep',
    cb: function() { log("beep beep!"); },
    myProp: 23
};

var stepDurr = {
    id: 'durr',
    cb: function() { log("durr durr!"); }
};

var stepBlah = {
    id: 'blah',
    cb: function() { log("blah blah!"); }
};

var stageMain = {
    id: 'main',
    steps: [ 'woop', 'beep' ]
};


// Simple mode test:
console.log();
console.log('SIMPLE MODE');
console.log('===========');


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
    .gameover();

debugger

stager.addStep(stepWoop);
stager.addStep(stepBeep);

stager.addStage(stepDurr);
stager.addStage(stepBlah);
stager.addStage(stageMain);
stager.setDefaultGlobals({GLOB: 3.14});
stager.setDefaultProperties({myProp: 1});


debugger


// Testing extraction:
console.log("Extraction of 'main':");
console.log(util.inspect(stager.extractStage('main'), false, 4));
console.log();
console.log("Extraction of ['blah', 'durrurrurr', 'blah']:");
console.log(util.inspect(stager.extractStage(['blah', 'durrurrurr', 'blah']), false, 4));
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
