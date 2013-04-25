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


stager.addStep(stepWoop);
stager.addStep(stepBeep);

stager.addStage(stepDurr);
stager.addStage(stepBlah);
stager.addStage(stageMain);

var counter = 0;
var flag = false;

stager
	.init()
	.next('main')
	.loop('durr', function () {
			if (counter++ >= 3) return false;
			return true;
		})
	.next('blah')
	;

console.log('Sequence:');
console.log(stager.sequence);
console.log();

stager.seqTestRun();
