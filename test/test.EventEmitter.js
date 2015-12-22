var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var EventEmitter = ngc.EventEmitter;
var J = ngc.JSUS;

var ee, node, result, tmp;

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
        before(function() {
            tmp = {};
        });
        it('should add A event listener', function() {
            tmp.func1 =  function() { console.log('A'); };
            ee.on('A', tmp.func1);
            ee.events['A'].should.eql(tmp.func1);
        });
        it('should add another listener for event A', function() {
            tmp.func2 =  function() { console.log('A2'); };
            ee.on('A', tmp.func2);

            J.isArray(ee.events['A']).should.be.true;
            ee.events['A'][0].should.eql(tmp.func1);
            ee.events['A'][1].should.eql(tmp.func2);
        });

        it('should add new event listener for event B', function() {
            tmp.func3 =  function() { console.log('B'); };
            ee.on('B', tmp.func3);

            ee.events['B'].should.eql(tmp.func3);

            // Should not change A.
            J.isArray(ee.events['A']).should.be.true;
            ee.events['A'][0].should.eql(tmp.func1);
            ee.events['A'][1].should.eql(tmp.func2);
        });


        it('should add second event listener for event B', function() {
            tmp.func4 =  function() { console.log('B2'); };
            ee.on('B', tmp.func4);

            J.isArray(ee.events['B']).should.be.true;
            ee.events['B'][0].should.eql(tmp.func3);
            ee.events['B'][1].should.eql(tmp.func4);
        });

        it('should add third event listener for event B', function() {
            tmp.func5 =  function() { console.log('B3'); };
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

});



// Helper function!
///////////////////
