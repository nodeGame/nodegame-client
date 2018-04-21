"use strict";

var util = require('util');
var should = require('should');

var log = console.log;

var ngc = require('../index.js');
var EventEmitter = ngc.EventEmitter;
var J = ngc.JSUS;

var ee, node, result, tmp;

result = {};
tmp = {};

describe('EventEmitter', function() {

    describe('#constructor', function() {
        before(function() {
            node = ngc.getClient();
            ee =  new EventEmitter('foo', node);
        });

        it('should set the name correctly', function() {
            ee.name.should.eql('foo');
        });

        it('should create the events object', function() {
            ee.events.should.eql({});
        });

        it('should create recordChanges properties', function() {
            ee.recordChanges.should.exist;
            ee.changes.should.exist;
        });
    });

    describe('#setRecordChanges true', function() {
        it('should activate recording changes', function() {
            var out = ee.setRecordChanges(true);
            out.should.eql(true);
            ee.recordChanges.should.eql(true);
        });
    });

    describe('#on', function() {
        it('should add A event listener', function() {
            tmp.func1 =  function() { result.A = [1]; return 1; };
            ee.on('A', tmp.func1);
            ee.events['A'].should.eql(tmp.func1);
        });
        it('should add another listener for event A', function() {
            tmp.func2 =  function() { result.A.push(2); };
            ee.on('A', tmp.func2);

            J.isArray(ee.events['A']).should.be.true;
            ee.events['A'][0].should.eql(tmp.func1);
            ee.events['A'][1].should.eql(tmp.func2);
        });

        it('should add new event listener for event B', function() {
            tmp.func3 =  function() { result.B = [1]; };
            ee.on('B', tmp.func3);

            ee.events['B'].should.eql(tmp.func3);

            // Should not change A.
            J.isArray(ee.events['A']).should.be.true;
            ee.events['A'][0].should.eql(tmp.func1);
            ee.events['A'][1].should.eql(tmp.func2);
        });


        it('should add second event listener for event B', function() {
            tmp.func4 =  function() { result.B.push(2); return 2; };
            ee.on('B', tmp.func4);

            J.isArray(ee.events['B']).should.be.true;
            ee.events['B'][0].should.eql(tmp.func3);
            ee.events['B'][1].should.eql(tmp.func4);
        });

        it('should add third event listener for event B', function() {
            tmp.func5 =  function(a, b, c, d) {
                var tot = (a || 0) + (b || 0) + (c || 0) + (d || 0);
                result.B.push(3 + tot);
                return tot;
            };
            ee.on('B', tmp.func5);

            J.isArray(ee.events['B']).should.be.true;
            ee.events['B'][0].should.eql(tmp.func3);
            ee.events['B'][1].should.eql(tmp.func4);
            ee.events['B'][2].should.eql(tmp.func5);
        });

    });

    describe('#getChanges', function() {
        it('should return the changes', function() {
            var out = ee.getChanges();
            J.isArray(out.added).should.be.true;
            J.isArray(out.removed).should.be.true;
            out.added.length.should.eql(5);
            out.removed.length.should.eql(0);
            out.added[0].should.eql({type: 'A', listener: tmp.func1});
            out.added[1].should.eql({type: 'A', listener: tmp.func2});
            out.added[2].should.eql({type: 'B', listener: tmp.func3});
            out.added[3].should.eql({type: 'B', listener: tmp.func4});
            out.added[4].should.eql({type: 'B', listener: tmp.func5});
        });
    });

    describe('#size', function() {
        it('should return the number of events registered', function() {
            ee.size().should.eql(2); // A and B.
        });
        it('should return the number of events registered for B', function() {
            ee.size('B').should.eql(3);
        });
        it('should return number of events registered in total', function() {
            ee.size(true).should.eql(5);
        });
        it('should return number of events registered for C', function() {
            ee.size('C').should.eql(0);
        });

    });

    describe('#printAll', function() {
        it('should return the number of all events registered', function() {
            ee.printAll().should.be.eql(5);
        });

    });

    describe('#once', function() {
        it('should add one event listener for C', function() {
            tmp.funcC =  function() { result.C = result.C ? result.C++ : 1 ; };
            ee.once('C', tmp.funcC);

            ee.events['C'].should.be.Function();
        });
    });

    describe('#getChanges / 2', function() {
        it('should return the changes', function() {
            var out = ee.getChanges();
            J.isArray(out.added).should.be.true;
            J.isArray(out.removed).should.be.true;
            out.added.length.should.eql(6);
            out.removed.length.should.eql(0);
            out.added[0].should.eql({type: 'A', listener: tmp.func1});
            out.added[1].should.eql({type: 'A', listener: tmp.func2});
            out.added[2].should.eql({type: 'B', listener: tmp.func3});
            out.added[3].should.eql({type: 'B', listener: tmp.func4});
            out.added[4].should.eql({type: 'B', listener: tmp.func5});
            out.added[5].should.eql({type: 'C', listener: ee.events.C});
        });
    });

    describe('#emit A', function() {
        before(function() {
            ee.emit('A');
        });
        it('should fire event listeners for A', function() {
            J.isArray(result.A).should.be.true;
        });
        it('should fire event listeners for A in order', function() {
            result.A[0].should.be.eql(1);
            result.A[1].should.be.eql(2);
        });
        it('should not fire other event listeners', function() {
            (typeof result.B).should.eql('undefined');
            (typeof result.C).should.eql('undefined');
        });
    });


    describe('#emit B', function() {
        before(function() {
            ee.emit('B');
        });
        it('should fire event listeners for B', function() {
            J.isArray(result.B).should.be.true;
        });
        it('should fire event listeners for B in order', function() {
            result.B[0].should.be.eql(1);
            result.B[1].should.be.eql(2);
            result.B[2].should.be.eql(3);
        });
        it('should not fire other event listeners', function() {
            (typeof result.C).should.eql('undefined');
        });
    });

    describe('#emit B: 1 parameter', function() {
        before(function() {
            ee.emit('B', 1);
        });
        it('should execute event listeners for B', function() {
            J.isArray(result.B).should.be.true;
        });
        it('should fire event listeners for B in order', function() {
            result.B[0].should.be.eql(1);
            result.B[1].should.be.eql(2);
            result.B[2].should.be.eql(4);
        });
    });

    describe('#emit B: 2 parameters', function() {
        before(function() {
            ee.emit('B', 1, 2);
        });
        it('should execute event listeners for B', function() {
            J.isArray(result.B).should.be.true;
        });
        it('should fire event listeners for B in order', function() {
            result.B[0].should.be.eql(1);
            result.B[1].should.be.eql(2);
            result.B[2].should.be.eql(6);
        });
    });

    describe('#emit B: 3 parameters', function() {
        before(function() {
            ee.emit('B', 1, 2, 3);
        });
        it('should execute event listeners for B', function() {
            J.isArray(result.B).should.be.true;
        });
        it('should fire event listeners for B in order', function() {
            result.B[0].should.be.eql(1);
            result.B[1].should.be.eql(2);
            result.B[2].should.be.eql(9);
        });
    });

    describe('#emit B: 4 parameters', function() {
        before(function() {
            ee.emit('B', 1, 2, 3, 5);
        });
        it('should execute event listeners for B', function() {
            J.isArray(result.B).should.be.true;
        });
        it('should fire event listeners for B in order', function() {
            result.B[0].should.be.eql(1);
            result.B[1].should.be.eql(2);
            result.B[2].should.be.eql(14);
        });
    });
    describe('#emit', function() {
        it('should return what the event listeners return', function() {
            var out = ee.emit('B', 1, 2, 3, 5);
            out.should.be.eql([2, (1+2+3+5)]);
        });
        it('should return one value and not an array if only one value is ' +
           'returned', function() {
               var out = ee.emit('A');
               out.should.be.eql(1);
           });
    });

    describe('#setRecordChanges false', function() {
        it('should deactivate recording changes', function() {
            var out = ee.setRecordChanges(false);
            out.should.eql(false);
            ee.recordChanges.should.eql(false);
        });
    });

    describe('#emitAsync', function() {
        it('should emit events asynchronously', function(done) {
            var a;
            ee.on('D', function(value) {
                a.should.be.eql(1);
                value.should.be.true;
                done();
            });
            ee.emitAsync('D', true);
            a = 1;
        });
    });

    describe('#getChanges / 3', function() {
        it('should return the changes (D not added)', function() {
            var out = ee.getChanges();
            J.isArray(out.added).should.be.true;
            J.isArray(out.removed).should.be.true;
            out.added.length.should.eql(6);
            out.removed.length.should.eql(0);
            out.added[0].should.eql({type: 'A', listener: tmp.func1});
            out.added[1].should.eql({type: 'A', listener: tmp.func2});
            out.added[2].should.eql({type: 'B', listener: tmp.func3});
            out.added[3].should.eql({type: 'B', listener: tmp.func4});
            out.added[4].should.eql({type: 'B', listener: tmp.func5});
            out.added[5].should.eql({type: 'C', listener: ee.events.C});
        });
    });

    describe('#setRecordChanges true', function() {
        it('should activate recording changes', function() {
            var out = ee.setRecordChanges(true);
            out.should.eql(true);
            ee.recordChanges.should.eql(true);
        });
    });

    describe('#emit (once)', function() {
        it('should fire the event only once', function() {
            ee.emit('C');
            ee.emit('C');
            ee.emit('C');
            result.C.should.eql(1);
        });
        it('should have removed the fired callback', function() {
            ('undefined' === typeof ee.events.C).should.be.true;
        });

    });

    describe('#getChanges / 4', function() {
        it('should return the changes', function() {
            var out = ee.getChanges();
            J.isArray(out.added).should.be.true;
            J.isArray(out.removed).should.be.true;
            out.added.length.should.eql(6);
            out.removed.length.should.eql(1);
            out.added[0].should.eql({type: 'A', listener: tmp.func1});
            out.added[1].should.eql({type: 'A', listener: tmp.func2});
            out.added[2].should.eql({type: 'B', listener: tmp.func3});
            out.added[3].should.eql({type: 'B', listener: tmp.func4});
            out.added[4].should.eql({type: 'B', listener: tmp.func5});

            out.added[5].type.should.eql('C');
            out.added[5].listener.should.be.Function();

            out.removed[0].should.eql({
                type: 'C',
                listener: out.added[5].listener
            });
        });
    });

    describe('#remove', function() {
        it('should remove all listeners for event A', function() {
            ee.remove('A');
            ('undefined' === typeof ee.events.A).should.be.true;
        });
        it('should removed one listener for event B - function', function() {
            tmp.removedB = ee.remove('B', tmp.func4);
            ee.events.B.length.should.eql(2);
            ee.events.B[0].should.not.eql(tmp.func4);
            ee.events.B[1].should.not.eql(tmp.func4);
        });
        it('should return removed listener for event B - function', function() {
            tmp.removedB[0].should.eql(tmp.func4);
        });

    });

    describe('#getChanges clear / 5', function() {
        it('should return the changes', function() {
            var out = ee.getChanges(true);
            J.isArray(out.added).should.be.true;
            J.isArray(out.removed).should.be.true;
            out.added.length.should.eql(6);
            out.removed.length.should.eql(4);
            out.added[0].should.eql({type: 'A', listener: tmp.func1});
            out.added[1].should.eql({type: 'A', listener: tmp.func2});
            out.added[2].should.eql({type: 'B', listener: tmp.func3});
            out.added[3].should.eql({type: 'B', listener: tmp.func4});
            out.added[4].should.eql({type: 'B', listener: tmp.func5});

            out.added[5].type.should.eql('C');
            out.added[5].listener.should.be.Function();

            out.removed[0].should.eql({
                type: 'C',
                listener: out.added[5].listener
            });

            out.removed[1].should.eql({type: 'A', listener: tmp.func1});
            out.removed[2].should.eql({type: 'A', listener: tmp.func2});
            out.removed[3].should.eql({type: 'B', listener: tmp.func4});
        });
        it('should clear the changes object', function() {
            ee.changes.added.length.should.eql(0);
            ee.changes.removed.length.should.eql(0);
        });
    });

    describe('#clear', function() {
        it('should clear all events', function() {
            ee.clear();
            ee.events.should.eql({});
        });
    });

    describe('#getChanges clear / 6', function() {
        it('should return the changes', function() {
            var out = ee.getChanges(true);
            J.isArray(out.added).should.be.true;
            J.isArray(out.removed).should.be.true;
            out.added.length.should.eql(0);
            out.removed.length.should.eql(3);

            out.removed[0].should.eql({type: 'B', listener: tmp.func3});
            out.removed[1].should.eql({type: 'B', listener: tmp.func5});

            out.removed[2].type.should.eql('D');
            out.removed[2].listener.should.be.Function();
        });
    });

    describe('#on with label', function() {
        it('should add L event listener with a label', function() {
            tmp.funcL =  function() { result.L = [1]; return 1; };
            ee.on('L', tmp.funcL, 'Label');
            ee.events['L'].should.eql(tmp.funcL);
            ee.events['L'].__ngid.should.eql('Label');
        });
    });

    describe('#off by label', function() {
        before(function() {
            tmp.counter = ee.size(true);
        });
        it('should remove event listener labeled with Label', function() {
            ee.off('L', 'Label');
            (null === ee.events['L']).should.eql(true);
            (null === ee.labels['Label']).should.eql(true);
        });
    });

    describe('#size after a deletion', function() {
        it('should not count deleted listeners', function() {
            ee.size(true).should.eql(tmp.counter -1);
            ee.size().should.eql(tmp.counter -1);
        });
    });

});



// Helper function!
///////////////////
