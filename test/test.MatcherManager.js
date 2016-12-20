"use strict";

var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var MatcherManager = ngc.MatcherManager;
var J = ngc.JSUS;

var node = ngc.getClient();
node.game.pl.add({ id: '1' });
node.game.pl.add({ id: '2' });

var result, tmp;
var matcher;

var settings1 = {
    roles: [ 'RED', 'BLUE' ],
    match: 'roundrobin',
    cycle: 'repeat'
};

var settings2 = {
    roles: [ 'RED', 'BLUE' ],
    match: 'roundrobin',
    cycle: 'mirror'
};

describe('MatcherManager', function() {

    describe('#constructor', function() {
        before(function() {
            matcher = new MatcherManager(node);
            // Make sure that the order of ids is **not** shuffled.
            matcher.matcher.setAssignerCb(ngc.Matcher.linearAssigner);
            result = null;
        });

        it('should create a new instance of Matcher', function() {
            matcher.roler.should.exist;
            matcher.matcher.should.exist;
            (null === matcher.lastSettings).should.be.true;
            (null === matcher.lastMatches).should.be.true;
        });
    });

    describe('#match() roundrobin,repeat,roles', function() {
        before(function() {
            matcher = new MatcherManager(node);
            // Make sure that the order of ids is **not** shuffled.
            matcher.matcher.setAssignerCb(ngc.Matcher.linearAssigner);
            result = matcher.match(settings1);
        });

        it('should save last matches', function() {
            matcher.lastMatches.should.be.eql(result);
        });

        it('should save last settings', function() {
            matcher.lastSettings.should.be.eql(settings1);
        });

        it('should return the matches array', function() {
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '1' } } ]
            );
        });

        it('should return the same matches array at round 2', function() {
            result = matcher.match(settings1);
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '1' } } ]
            );
        });

        it('should return the same matches array at round 3', function() {
            result = matcher.match(settings1);
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '1' } } ]
            );
        });

        it('should return the same matches array at round 4', function() {
            result = matcher.match(settings1);
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '1' } } ]
            );
        });
    });

//     describe('#match() roundrobin,repeat_invert,roles', function() {
//         before(function() {
//             matcher = new MatcherManager(node);
//             // Make sure that the order of ids is **not** shuffled.
//             matcher.matcher.setAssignerCb(ngc.Matcher.linearAssigner);
//             result = matcher.match(settings2);
//         });
//
//         it('should save last matches', function() {
//             matcher.lastMatches.should.be.eql(result);
//         });
//
//         it('should save last settings', function() {
//             matcher.lastSettings.should.be.eql(settings2);
//         });
//
//         it('should return the matches array', function() {
//             result.should.be.eql(
//                 [ { id: '1', options: { role: 'RED', partner: '2' } },
//                   { id: '2', options: { role: 'BLUE', partner: '1' } } ]
//             );
//         });
//
//         it('should return mirrored matches array at round 2', function() {
//             result = matcher.match(settings2);
//             console.log(matcher.matcher.resolvedMatches);
//             console.log(result);
//
//             result.should.be.eql(
//                 [ { id: '2', options: { role: 'RED', partner: '1' } },
//                   { id: '1', options: { role: 'BLUE', partner: '2' } } ]
//             );
//         });
//
//         it('should return the same matches array at round 3', function() {
//             result = matcher.match(settings2);
//             result.should.be.eql(
//                 [ { id: '1', options: { role: 'RED', partner: '2' } },
//                   { id: '2', options: { role: 'BLUE', partner: '1' } } ]
//             );
//         });
//
//         it('should return mirrored matches array at round 4', function() {
//             result = matcher.match(settings2);
//             result.should.be.eql(
//                 [ { id: '2', options: { role: 'RED', partner: '1' } },
//                   { id: '1', options: { role: 'BLUE', partner: '2' } } ]
//             );
//         });
//     });

});
