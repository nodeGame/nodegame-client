"use strict";

var util = require('util');
var should = require('should');

var log = console.log;

var ngc = require('../index.js');
var EventEmitterManager = ngc.EventEmitterManager;
var J = ngc.JSUS;

var eem, node, result, tmp;

result = {};
tmp = {};

describe('EventEmitterManager', function() {

    describe('#constructor', function() {
        before(function() {
            node = ngc.getClient();
            eem =  new EventEmitterManager(node);
        });

        it('should create the 4 event emitters', function() {
            eem.ng.should.exist;
            eem.game.should.exist;
            eem.stage.should.exist;
            eem.step.should.exist;
        });

        it('should create the ee object', function() {
            eem.ee.ng.should.exist;
            eem.ee.game.should.exist;
            eem.ee.stage.should.exist;
            eem.ee.step.should.exist;
        });

    });

    describe('#setRecordChanges true', function() {
        it('should activate recording changes', function() {
            var out = eem.setRecordChanges(true);
            out.ng.should.eql(true);
            out.game.should.eql(true);
            out.stage.should.eql(true);
            out.step.should.eql(true);
        });
    });


    describe('#emit', function() {
        before(function() {
            tmp.funcAng =  function(a,b,c,d) {
                result.A = ['ng'];
                return 1 + (a || 0);
            };
            eem.ng.on('A', tmp.funcAng);

            tmp.funcAgame =  function(a,b,c,d) {
                result.A.push('game');
                return 1 + (a || 0) + (b || 0);
            };
            eem.game.on('A', tmp.funcAgame);

            tmp.funcAstage =  function(a,b,c,d) {
                result.A.push('stage');
                return 1 + (a || 0) + (b || 0) + (c || 0);
            };
            eem.stage.on('A', tmp.funcAstage);

            tmp.funcAstep =  function(a,b,c,d) {
                result.A.push('step');
                return 1 + (a || 0) + (b || 0) + (c || 0) + (d || 0);
            };
            eem.step.on('A', tmp.funcAstep);

            result.emit = eem.emit('A');
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([1, 1, 1, 1]);
        });
    });

    describe('#emit 1 parameter', function() {
        before(function() {
            result.A = undefined;
            result.emit = eem.emit('A', 1);
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([2, 2, 2, 2]);
        });
    });

    describe('#emit 2 parameters', function() {
        before(function() {
            result.A = undefined;
            result.emit = eem.emit('A', 1, 2);
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([2, 4, 4, 4]);
        });
    });

    describe('#emit 3 parameters', function() {
        before(function() {
            result.A = undefined;
            result.emit = eem.emit('A', 1, 2, 3);
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([2, 4, 7, 7]);
        });
    });

    describe('#emit 4 parameters', function() {
        before(function() {
            result.A = undefined;
            result.emit = eem.emit('A', 1, 2, 3, 4);
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([2, 4, 7, 11]);
        });
    });

    describe('#emitAsync', function() {
        it('should emit events asynchronously on all event emitters',
           function(done) {
               var a, b, complete;
               b = [];
               complete = function(who) {
                   b.push(who);
                   if (b.length === 4) {
                       b.should.eql(['ng', 'game', 'stage', 'step']);
                       done();
                   }
               };

               tmp.Dstage = function(value) {
                   a.should.be.eql(1);
                   value.should.be.true;
                   complete('stage');
               };
               eem.stage.on('D', tmp.Dstage);

               tmp.Dstep = function(value) {
                   a.should.be.eql(1);
                   value.should.be.true;
                   complete('step');
               };
               eem.step.on('D', tmp.Dstep);

               tmp.Dgame = function(value) {
                   a.should.be.eql(1);
                   value.should.be.true;
                   complete('game');
               };
               eem.game.on('D', tmp.Dgame);

               tmp.Dng = function(value) {
                   a.should.be.eql(1);
                   value.should.be.true;
                   complete('ng');
               };
               eem.ng.on('D', tmp.Dng);

               eem.emitAsync('D', true);
               a = 1;
           });
    });

    describe('#getChanges', function() {
        it('should return the changes', function() {
            var c = eem.getChanges();
            J.isArray(c.ng.added).should.be.true;
            J.isArray(c.ng.removed).should.be.true;
            J.isArray(c.game.added).should.be.true;
            J.isArray(c.game.removed).should.be.true;
            J.isArray(c.stage.added).should.be.true;
            J.isArray(c.stage.removed).should.be.true;
            J.isArray(c.step.added).should.be.true;
            J.isArray(c.step.removed).should.be.true;

            c.ng.added.length.should.eql(2);
            c.ng.removed.length.should.eql(0);
            c.game.added.length.should.eql(2);
            c.game.removed.length.should.eql(0);
            c.stage.added.length.should.eql(2);
            c.stage.removed.length.should.eql(0);
            c.step.added.length.should.eql(2);
            c.step.removed.length.should.eql(0);

            c.ng.added[0].should.eql({type: 'A', listener: tmp.funcAng});
            c.ng.added[1].should.eql({type: 'D', listener: tmp.Dng});
            c.game.added[0].should.eql({type: 'A', listener: tmp.funcAgame});
            c.game.added[1].should.eql({type: 'D', listener: tmp.Dgame});
            c.stage.added[0].should.eql({type: 'A', listener: tmp.funcAstage});
            c.stage.added[1].should.eql({type: 'D', listener: tmp.Dstage});
            c.step.added[0].should.eql({type: 'A', listener: tmp.funcAstep});
            c.step.added[1].should.eql({type: 'D', listener: tmp.Dstep});

        });
    });

    describe('#size', function() {
        it('should return the total number of registered events', function() {
            eem.size().should.eql(8);
        });
        it('should return the total number of registered event listeners',
           function() {
               eem.size(true).should.eql(8);
        });
        it('should return the total number of listeners for event D',
           function() {
               eem.size('D').should.eql(4);
        });
    });


    describe('#remove', function() {
        before(function() {
            eem.ng.on('D', function() { console.log('D'); });
        });
        it('should remove all listeners for event A', function() {
            eem.remove('A');
            ('undefined' === typeof eem.ng.events.A).should.be.true;
            ('undefined' === typeof eem.game.events.A).should.be.true;
            ('undefined' === typeof eem.stage.events.A).should.be.true;
            ('undefined' === typeof eem.step.events.A).should.be.true;
        });
        it('should removed one listener for event D - function', function() {
            tmp.removedD = eem.remove('D', tmp.Dng);
            eem.ng.events.D.length.should.eql(1);
            eem.ng.events.D[0].should.not.eql(tmp.func4);
            eem.game.events.D.length.should.eql(1);
            eem.stage.events.D.length.should.eql(1);
            eem.step.events.D.length.should.eql(1);
        });
        it('should return removed listener for event D - function', function() {
            tmp.removedD.ng[0].should.eql(tmp.Dng);
        });

    });

    describe('#printAll', function() {
        it('should return the number of all events registered', function() {
            eem.printAll().should.be.eql(4);
        });
    });

    describe('#getAll', function() {
        it('should return an object with of all events registered', function() {
            var o = eem.getAll();
            o.should.be.Object();
            o.ng.D.should.be.Object();
            o.game.should.eql({ A: null, D: tmp.Dgame});
            o.stage.should.eql({ A: null, D: tmp.Dstage});
            o.step.should.eql({ A: null, D: tmp.Dstep});
        });
    });
});



// Helper function!
///////////////////
