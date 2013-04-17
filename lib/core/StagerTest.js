var Stager = require("./Stager").Stager;
var stager = new Stager();
var log = console.log;

var stepWoop = {
	id: 'woop',
	cb: function () { log("woop's callback!"); }
};

var stepBeep = {
	id: 'beep',
	cb: function () { log("beep's callback!"); }
};

var stepDurr = {
	id: 'durr',
	cb: function () { log("durr's callback!"); }
};

var stageMain = {
	id: 'main',
	steps: [ 'woop', 'beep' ]
};


stager.addStep(stepWoop);
stager.addStep(stepBeep);

stager.addStage(stageMain);
stager.addStage(stepDurr);

log(stager);
