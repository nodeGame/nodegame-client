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

var flag = false;

stager
	.init()
	.next('blah')
	.fork(function (/*plot*/) {  //TODO
			if(flag) {
				stager.next('main');
			}
			else {
				stager.repeat('durr', 5);
				stager.gameover();
			}
		})
	.next('blah')
	.gameover()
	;

//stager.seqTestRun();

console.log("Sequence before:");
console.log(stager.sequence);

console.log("Evaluated:");
console.log(stager.evalSequence());

console.log("Sequence after:");
console.log(stager.sequence);
