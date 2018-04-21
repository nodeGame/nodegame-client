"use strict";

var util = require('util');
var should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Stager = ngc.Stager;
var GamePlot = ngc.GamePlot;
var J = ngc.JSUS;

var node = ngc.getClient();

module.exports = node;
node.verbosity = -1000;

var i, len, tmp, res;
var stager;

describe('Stager', function() {


    describe('should fail', function() {
        beforeEach(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null;
            tmp = function() { console.log('ahah'); };

        });
        it('if step method is called but no stage was added before',
           function() {
               (function() {
                   stager.step('step1');
               }).should.throw();
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
        it('if stage cb is defined, but step with same id exists', function() {
            (function() {
                stager.addStep({ id: 'a', cb: function() {}});
                stager.next({
                    id: 'a',
                    cb: function() {}
                });
            }).should.throw();
        });
        it('if stage steps is not a non-empty array', function() {
            (function() {
                stager.next({
                    id: 'a',
                    steps: []
                });
            }).should.throw();
            (function() {
                stager.next({
                    id: 'a',
                    steps: 'ah'
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
        it('if attempting to modify sequence after stager was finalized',
           function() {

               (function() {
                   stager.next('stage').finalize();
                   stager.next('ahah');
               }).should.throw();
               (function() {
                   stager.repeat('ahah');
               }).should.throw();
               (function() {
                   stager.loop('ahah');
               }).should.throw();
               (function() {
                   stager.step({ id: 'a', cb: function() {} });
               }).should.throw();
           });
        it('if skip, unskip are called with wrong parameters',
           function() {
               (function() {
                   stager.skip('');
               }).should.throw();
               (function() {
                   stager.skip(4);
               }).should.throw();
               (function() {
                   stager.skip(undefined, '1');
               }).should.throw();
               (function() {
                   stager.unskip('');
               }).should.throw();
               (function() {
                   stager.unskip(4);
               }).should.throw();
               (function() {
                   stager.unskip(undefined, '1');
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
            (function() {
                stager.loop();
            }).should.throw();
            (function() {
                stager.doLoop();
            }).should.throw();
            (function() {
                stager.repeat();
            }).should.throw();
        });
        it('if extendStep|Stage are referencing non-existing steps|stages',
           function() {
               (function() {
                   stager.extendStep('ahah', { a: 1});
               }).should.throw();
               (function() {
                   stager.extendStage('bb', { a: 1});
               }).should.throw();
           });
        it('if extendStep is called with wrong parameters',
           function() {
               stager.next('foo');
               (function() {
                   stager.extendStep('foo');
               }).should.throw();
               (function() {
                   stager.extendStep('foo', 1);
               }).should.throw();
               (function() {
                   stager.extendStep('foo', { id: 'fi' });
               }).should.throw();
               (function() {
                   stager.extendStep('foo', { id: undefined });
               }).should.throw();               (function() {
                   stager.extendStep(undefined, { a: 1 });
               }).should.throw();
           });
        it('if extendStep is object with wrong done parameter', function() {
            (function() {
                stager.extendStep('foo', { done: 1 });
            }).should.throw();
            (function() {
                stager.extendStep('foo', { done: {} });
            }).should.throw();
        });
        it('if extendStep is object with wrong init parameter', function() {
            (function() {
                stager.extendStep('foo', { exit: {} });
            }).should.throw();
            (function() {
                stager.extendStep('foo', { exit: 'a' });
            }).should.throw();
        });
        it('if extendStep is object with wrong init parameter', function() {
            (function() {
                stager.extendStep('foo', { init: {} });
            }).should.throw();
            (function() {
                stager.extendStep('foo', { init: 1 });
            }).should.throw();
        });
        it('if extendStage is called with wrong parameters',
           function() {
               (function() {
                   stager.extendStage('foo');
               }).should.throw();
               (function() {
                   stager.extendStage('foo', 1);
               }).should.throw();
               (function() {
                   stager.extendStage('foo', { id: 'fi' });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', { id: undefined });
               }).should.throw();
               (function() {
                   stager.extendStage(undefined, { a: 1 });
               }).should.throw();
           });
        it('if extendStage is object with cb parameter', function() {
            (function() {
                stager.extendStage('foo', { cb: function() {} });
            }).should.throw();
            (function() {
                stager.extendStage('foo', { cb: {} });
            }).should.throw();
        });
        it('if extendStage is object with wrong steps parameter', function() {
            (function() {
                stager.extendStage('foo', { steps: {} });
            }).should.throw();
            (function() {
                stager.extendStage('foo', { steps: [] });
            }).should.throw();
        });
        it('if extendStage is object with wrong done parameter', function() {
            (function() {
                stager.extendStage('foo', { done: 1 });
            }).should.throw();
            (function() {
                stager.extendStage('foo', { done: {} });
            }).should.throw();
        });
        it('if extendStage is object with wrong init parameter', function() {
            (function() {
                stager.extendStage('foo', { exit: {} });
            }).should.throw();
            (function() {
                stager.extendStage('foo', { exit: 'a' });
            }).should.throw();
        });
        it('if extendStage is object with wrong init parameter', function() {
            (function() {
                stager.extendStage('foo', { init: {} });
            }).should.throw();
            (function() {
                stager.extendStage('foo', { init: 1 });
            }).should.throw();
        });
        it('if extendStep update function returns a non valid element',
           function() {
               (function() {
                   stager.extendStep('foo', function() {});
               }).should.throw();
               (function() {
                   stager.extendStep('foo', function() {
                       return { id: 'a' };
                   });
               }).should.throw();
               (function() {
                   stager.extendStep('foo', function() {
                       return { id: 'foo', init: 1 };
                   });
               }).should.throw();
               (function() {
                   stager.extendStep('foo', function() {
                       return { id: 'foo', exit: {} };
                   });
               }).should.throw();
               (function() {
                   stager.extendStep('foo', function() {
                       return { id: 'foo', exit: 1 };
                   });
               }).should.throw();
               (function() {
                   stager.extendStep('foo', function() {
                       return { id: 'foo', done: {} };
                   });
               }).should.throw();
               (function() {
                   stager.extendStep('foo', function() {
                       return { id: 'foo', done: 1 };
                   });
               }).should.throw();
               (function() {
                   stager.extendStep('foo', function() {
                       return { id: 'foo', cb: function() {} };
                   });
               }).should.throw();
           });
        it('if extendStage update function returns a non valid element',
           function() {
               (function() {
                   stager.extendStage('foo', function() {});
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'a' };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', cb: function() {} };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', steps: {} };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', steps: [] };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', init: {} };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', init: 1 };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', exit: {} };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', exit: 1 };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', done: {} };
                   });
               }).should.throw();
               (function() {
                   stager.extendStage('foo', function() {
                       return { id: 'foo', done: 1 };
                   });
               }).should.throw();
           });
        it('if cloneStep|Stage are referencing non-existing steps|stages',
           function() {
               (function() {
                   stager.cloneStep('ahah', 'a');
               }).should.throw();
               (function() {
                   stager.cloneStage('bb', 'b');
               }).should.throw();
           });

        it('if cloneStep|Stage are using an already taken id for clone',
           function() {
               (function() {
                   stager.cloneStep('foo', 'foo');
               }).should.throw();
               (function() {
                   stager.cloneStage('foo', 'foo');
               }).should.throw();
           });
        it('if cloneStep|Stage are called with wrong parameters',
           function() {
               (function() {
                   stager.cloneStep(null, 'foo');
               }).should.throw();
               (function() {
                   stager.cloneStep('foo', {});
               }).should.throw();
               (function() {
                   stager.cloneStage(undefined, 'foo');
               }).should.throw();
               (function() {
                   stager.cloneStage('foo', 3);
               }).should.throw();
           });
        it('if stage method is called with object, but stage id is existing',
           function() {
               (function() {
                   stager.createStage({
                       id: 'myweirdstage',
                       cb: function() {}
                   });
                   stager.stage({
                       id: 'myweirdstage',
                       steps: [ '1', '2', '3' ]
                   });
               }).should.throw();
           });
        it('if step method is called with object, but step id is existing',
           function() {
               (function() {
                   stager.createStep({
                       id: 'myweirdstep',
                       cb: function() {}
                   });
                   stager.step({
                       id: 'myweirdstep',
                       cb: function() {}
                   });
               }).should.throw();
           });
    });

});

// Helper function!
///////////////////
