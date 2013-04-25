var node = require('../../index.js');
module.exports = node;
node.verbosity = 100;

var Stager = require('./Stager').Stager;
var stager = new Stager();
var log = console.log;

var stepWoop = {
	id: 'woop',
	cb: function () { log("woop woop!"); }
};

var stepBeep = {
	id: 'beep',
	cb: function () { log("beep beep!"); }
};

var stepDurr = {
	id: 'durr',
	cb: function () { log("durr durr!"); }
};

var stepBlah = {
	id: 'blah',
	cb: function () { log("blah blah!"); }
};

var stageMain = {
	id: 'main',
	steps: [ 'woop', 'beep' ]
};


// Simple mode test:
console.log();
console.log('SIMPLE MODE');
console.log('===========');
stager.addStep(stepWoop);
stager.addStep(stepBeep);

stager.addStage(stepDurr);
stager.addStage(stepBlah);
stager.addStage(stageMain);

var counter = 0;
var flag = false;

stager
	.repeat('main', 2)
	.loop('durr', function () {
			if (counter++ >= 3) return false;
			return true;
		})
	.next('blah')
	.gameover()
	;

console.log('Sequence:');
console.log(stager.sequence);
console.log();

stager.seqTestRun();


// Expert mode test:
console.log();
console.log('EXPERT MODE');
console.log('===========');

stager.clear();
stager.setExpertMode(true);

stager.addStep(stepWoop);
stager.addStep(stepBeep);

stager.addStage(stepDurr);
stager.addStage(stepBlah);
stager.addStage(stageMain);

flag = false;

stager.registerFirstStage('main');
stager.registerNext('main', function () { return 'blah'; });
stager.registerGeneralNext(function () {
	if (!flag) { flag = true; return 'durr'; }
	return null;
});

stager.seqTestRun();
