var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Timer = ngc.Timer;
var J = ngc.JSUS;

var node = ngc.getClient();
node.verbosity = -1000;

var result, tmp;
var timer;


describe('Timer', function() {

    describe('#constructor', function() {
        before(function() {
            timer = new Timer(node);
            result = null;
        });

        it('should create a new instance of Timer', function() {
            timer.timers.should.eql({});
            timer.timestamps.should.eql({});
        });
    });


});
