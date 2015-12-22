var util = require('util');
should = require('should');

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
            tmp.funcC =  function() { result.C = 1; };
            ee.once('C', tmp.funcC);

            ee.events['C'].should.be.Function();
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
        before(function() {
        });
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
});



// Helper function!
///////////////////
