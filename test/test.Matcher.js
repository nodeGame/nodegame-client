var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Matcher = ngc.Matcher;
var J = ngc.JSUS;

var result, tmp;
var matcher;;

describe('Matcher', function() {

    describe('#constructor.', function() {
        before(function() {
            stager = new Matcher();
            result = null;
        });

        it('should create a new instance of Matcher.', function() {
            stager.x.should.eql(0);
            stager.y.should.eql(0);
        });
    });
});
