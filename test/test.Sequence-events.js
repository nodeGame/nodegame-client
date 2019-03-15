"use strict";

var util = require('util');
var should = require('should');

var log = console.log;

var ngc = require('../index.js');
var GamePlot = ngc.GamePlot;
var Stager = ngc.Stager;
var J = ngc.JSUS;

var result, tmp, node, stager, game;

node = ngc.getClient();
stager = ngc.getStager();
tmp = {};
tmp.events = [];

describe('Registering events', function() {

     describe('registering events before a game is defined', function() {
         before(function() {
             tmp.defaultEvents = node.events.ng.size();
         });

         it('should add event listeners to the ng event emitter', function() {
             tmp.defaultEvents.should.be.above(0);
         });
     });
    describe('registering events before starting the game', function() {
        before(function() {
            node.on('A', function() { tmp.events.push('game-A'); });
            node.on('B', function() { tmp.events.push('game-B'); });
        });

        it('should add listeners to the `game` event emitter', function() {
            node.events.game.size().should.eql(2);
        });
    });

    describe('registering events in the init function of the game', function() {
         before(function() {
             node = ngc.getClient();
             stager = ngc.getStager();
             stager.setOnInit(function() {
                 node.on('A', function() { tmp.events.push('game-init-A'); });
                 node.on('B', function() { tmp.events.push('game-init-B'); });
             });
             stager.next('1');
             testPositions(node, stager, 1);
         });

         it('should add event listeners to the ng event emitter', function() {
            node.events.game.size().should.eql(2);
         });
         it('should add event listeners to the ng event emitter', function() {
            node.events.game.size().should.eql(2);
         });
     });


    describe('registering events in the init function of stage 2', function() {
         before(function() {
             node = ngc.getClient();
             stager = ngc.getStager();
             stager.next('1');
             stager.next({
                 id: '2',
                 init: function() {
                     node.on('A', function() {
                         tmp.events.push('stage-init-A');
                     });
                     node.on('B', function() {
                         tmp.events.push('stage-init-B');
                     });
                 }
             });
             stager.next('3');

         });

         it('should not add the event listeners when the game is initialized',
            function() {
                game = initGame(node, stager);
                node.events.ng.size().should.eql(tmp.defaultEvents);
                node.events.game.size().should.eql(0);
                node.events.stage.size().should.eql(0);
                node.events.step.size().should.eql(0);
            });

         it('should not add the event listeners when stage 1 is run',
            function() {
                game.step();
                node.events.ng.size().should.eql(tmp.defaultEvents);
                node.events.game.size().should.eql(0);
                node.events.stage.size().should.eql(0);
                node.events.step.size().should.eql(0);
            });

         it('should add the event listeners when the stage 2 is run',
            function() {
                game.step();
                node.events.ng.size().should.eql(tmp.defaultEvents);
                node.events.game.size().should.eql(0);
                node.events.stage.size().should.eql(2);
                node.events.step.size().should.eql(0);
            });

         it('should remove the event listeners when the stage 3 is run',
            function() {
                game.step();
                node.events.ng.size().should.eql(tmp.defaultEvents);
                node.events.game.size().should.eql(0);
                node.events.stage.size().should.eql(0);
                node.events.step.size().should.eql(0);
            });
     });

   describe('registering events in the exit function of stage 2', function() {
         before(function() {
             node = ngc.getClient();
             stager = ngc.getStager();
             stager.next('1');
             stager.next({
                 id: '2',
                 exit: function() {
                     node.on('A', function() {
                         tmp.events.push('stage-init-A');
                     });
                     node.on('B', function() {
                         tmp.events.push('stage-init-B');
                     });
                 }
             });
             stager.next('3');

         });

         it('should not add the event listeners when the game is initialized',
            function() {
                game = initGame(node, stager);
                node.events.ng.size().should.eql(tmp.defaultEvents);
                node.events.game.size().should.eql(0);
                node.events.stage.size().should.eql(0);
                node.events.step.size().should.eql(0);
            });

         it('should not add the event listeners when stage 1 is run',
            function() {
                game.step();
                node.events.ng.size().should.eql(tmp.defaultEvents);
                node.events.game.size().should.eql(0);
                node.events.stage.size().should.eql(0);
                node.events.step.size().should.eql(0);
            });

         it('should not add the event listeners when the stage 2 is run',
            function() {
                game.step();
                node.events.ng.size().should.eql(tmp.defaultEvents);
                node.events.game.size().should.eql(0);
                node.events.stage.size().should.eql(0);
                node.events.step.size().should.eql(0);
            });

         it('should not add the event listeners when the stage 3 is run',
            function() {
                game.step();
                node.events.ng.size().should.eql(tmp.defaultEvents);
                node.events.game.size().should.eql(0);
                node.events.stage.size().should.eql(0);
                node.events.step.size().should.eql(0);
            });
     });

    describe('registering events in the init function of step 2.2', function() {
        before(function() {
            node = ngc.getClient();
            stager = ngc.getStager();
            stager.next('1');
            stager.next('2');
            stager.step('1.1');
            stager.step({
                id: '2.2',
                init: function() {
                    node.on('A', function() {
                        tmp.events.push('stage-init-A');
                    });
                    node.on('B', function() {
                        tmp.events.push('stage-init-B');
                    });
                }
            });
            stager.step('2.3');
            stager.next('3');

        });

        it('should not add the event listeners when the game is initialized',
           function() {
               game = initGame(node, stager);
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when stage 1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when the stage 2.1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should add the event listeners when the stage 2.2 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(2);
           });

        it('should remove the event listeners when the stage 2.3 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });


        it('should not add the event listeners when stage 3 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });
    });

   describe('registering events in the exit function of step 2.2', function() {
        before(function() {
            node = ngc.getClient();
            stager = ngc.getStager();
            stager.next('1');
            stager.next('2');
            stager.step('1.1');
            stager.step({
                id: '2.2',
                exit: function() {
                    node.on('A', function() {
                        tmp.events.push('stage-init-A');
                    });
                    node.on('B', function() {
                        tmp.events.push('stage-init-B');
                    });
                }
            });
            stager.step('2.3');
            stager.next('3');

        });

        it('should not add the event listeners when the game is initialized',
           function() {
               game = initGame(node, stager);
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when stage 1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when the step 2.1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when the step 2.2 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add event listeners when the step 2.3 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });


        it('should not add the event listeners when stage 3 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });
    });

   describe('registering events in init function of single stage', function() {
        before(function() {
            node = ngc.getClient();
            stager = ngc.getStager();
            stager.next({
                id: '1',
                init: function() {
                    node.on('A', function() {
                        tmp.events.push('stage-init-A');
                    });
                    node.on('B', function() {
                        tmp.events.push('stage-init-B');
                    });
                }
            });
        });

        it('should not add the event listeners when the game is initialized',
           function() {
               game = initGame(node, stager);
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should add the event listeners when stage 1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(2);
               node.events.step.size().should.eql(0);
           });

        it('should remove the event listeners when is end of sequence',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });
    });

    describe('registering events in exit function of single stage', function() {
        before(function() {
            node = ngc.getClient();
            stager = ngc.getStager();
            stager.next({
                id: '1',
                exit: function() {
                    node.on('A', function() {
                        tmp.events.push('stage-init-A');
                    });
                    node.on('B', function() {
                        tmp.events.push('stage-init-B');
                    });
                }
            });
        });

        it('should not add the event listeners when the game is initialized',
           function() {
               game = initGame(node, stager);
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when stage 1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when is end of sequence',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });
    });

   describe('registering events in init function of single step', function() {
        before(function() {
            node = ngc.getClient();
            stager = ngc.getStager();
            stager.next('1');
            stager.next('2');
            stager.step({
                id: '2.1',
                init: function() {
                    node.on('A', function() {
                        tmp.events.push('stage-init-A');
                    });
                    node.on('B', function() {
                        tmp.events.push('stage-init-B');
                    });
                }
            });
            stager.next('3');

        });

        it('should not add the event listeners when the game is initialized',
           function() {
               game = initGame(node, stager);
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when stage 1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should add the event listeners when the step 2.1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(2);
           });

        it('should remove  the event listeners when stage 3 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });
    });

   describe('registering events in exit function of single step', function() {
        before(function() {
            node = ngc.getClient();
            stager = ngc.getStager();
            stager.next('1');
            stager.next('2');
            stager.step({
                id: '2.1',
                exit: function() {
                    node.on('A', function() {
                        tmp.events.push('stage-init-A');
                    });
                    node.on('B', function() {
                        tmp.events.push('stage-init-B');
                    });
                }
            });
            stager.next('3');

        });

        it('should not add the event listeners when the game is initialized',
           function() {
               game = initGame(node, stager);
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when stage 1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when the step 2.1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when stage 3 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });
    });

   describe('registering events in callback of single step', function() {
        before(function() {
            node = ngc.getClient();
            stager = ngc.getStager();
            stager.next('1');
            stager.next('2');
            stager.step({
                id: '2.1',
                cb: function() {
                    node.on('A', function() {
                        tmp.events.push('stage-init-A');
                    });
                    node.on('B', function() {
                        tmp.events.push('stage-init-B');
                    });
                }
            });
            stager.next('3');

        });

        it('should not add the event listeners when the game is initialized',
           function() {
               game = initGame(node, stager);
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when stage 1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should add the event listeners when the step 2.1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(2);
           });

        it('should remove  the event listeners when stage 3 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });
    });

    describe('registering events in callback function of step 2.2', function() {
        before(function() {
            node = ngc.getClient();
            stager = ngc.getStager();
            stager.next('1');
            stager.next('2');
            stager.step('1.1');
            stager.step({
                id: '2.2',
                cb: function() {
                    node.on('A', function() {
                        tmp.events.push('stage-init-A');
                    });
                    node.on('B', function() {
                        tmp.events.push('stage-init-B');
                    });
                }
            });
            stager.step('2.3');
            stager.next('3');

        });

        it('should not add the event listeners when the game is initialized',
           function() {
               game = initGame(node, stager);
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when stage 1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should not add the event listeners when the stage 2.1 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });

        it('should add the event listeners when the stage 2.2 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(2);
           });

        it('should remove the event listeners when the stage 2.3 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });


        it('should not add the event listeners when stage 3 is run',
           function() {
               game.step();
               node.events.ng.size().should.eql(tmp.defaultEvents);
               node.events.game.size().should.eql(0);
               node.events.stage.size().should.eql(0);
               node.events.step.size().should.eql(0);
           });
    });

});



// Helper function!
///////////////////


// Setup functions.

function initGame(node, stager) {
    var sstate, mynode;
    stager.setDefaultStepRule(ngc.stepRules.WAIT);
    stager.reset();
    sstate = stager.getState();
    mynode = node || ngc.getClient();
    mynode.verbosity = -1000;
    mynode.setup('plot', sstate);
    mynode.createPlayer({ id: 'testid', sid: '111111' });
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
    var i, game, result;
    i = -1;
    result = {};
    for ( ; ++i < len ; ) {
        if (debug) console.log(i);
        game = initGame(node, stager);
        goThroughSteps(game, result);
    }
    return result;
}
