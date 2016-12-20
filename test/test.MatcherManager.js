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
    cycle: 'repeat_invert'
};

var settings3 = {
    roles: [ 'RED', 'BLUE' ],
    match: 'roundrobin',
    cycle: 'mirror'
};

var settings4 = {
    roles: [ 'RED', 'BLUE' ],
    match: 'roundrobin',
    cycle: 'mirror_invert'
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

    describe('#match() roundrobin,repeat_invert,roles', function() {
        before(function() {
            matcher = new MatcherManager(node);
            // Make sure that the order of ids is **not** shuffled.
            matcher.matcher.setAssignerCb(ngc.Matcher.linearAssigner);
            result = matcher.match(settings2);
        });

        it('should save last matches', function() {
            matcher.lastMatches.should.be.eql(result);
        });

        it('should save last settings', function() {
            matcher.lastSettings.should.be.eql(settings2);
        });

        it('should return the matches array', function() {
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '1' } } ]
            );
        });

        it('should return mirrored matches array at round 2', function() {
            result = matcher.match(settings2);
            result.should.be.eql(
                [ { id: '2', options: { role: 'RED', partner: '1' } },
                  { id: '1', options: { role: 'BLUE', partner: '2' } } ]
            );
        });

        it('should return the same matches array at round 3', function() {
            result = matcher.match(settings2);
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '1' } } ]
            );
        });

        it('should return mirrored matches array at round 4', function() {
            result = matcher.match(settings2);
            result.should.be.eql(
                [ { id: '2', options: { role: 'RED', partner: '1' } },
                  { id: '1', options: { role: 'BLUE', partner: '2' } } ]
            );
        });
    });

    describe('#match() roundrobin,mirror,roles', function() {
        before(function() {
            node.game.pl.add({ id: '3' });
            node.game.pl.add({ id: '4' });
            matcher = new MatcherManager(node);
            // Make sure that the order of ids is **not** shuffled.
            matcher.matcher.setAssignerCb(ngc.Matcher.linearAssigner);
            result = matcher.match(settings3);
        });

        it('should save last matches', function() {
            matcher.lastMatches.should.be.eql(result);
        });

        it('should save last settings', function() {
            matcher.lastSettings.should.be.eql(settings3);
        });

        it('should return the matches array', function() {
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '4' } },
                  { id: '4', options: { role: 'BLUE', partner: '1' } },
                  { id: '2', options: { role: 'RED', partner: '3' } },
                  { id: '3', options: { role: 'BLUE', partner: '2' } } ]
            );
        });

        it('should return matches array for round 2', function() {
            result = matcher.match(settings3);
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '3' } },
                  { id: '3', options: { role: 'BLUE', partner: '1' } },
                  { id: '4', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '4' } } ]
            );
        });

        it('should return the matches array for round 3', function() {
            result = matcher.match(settings3);
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '1' } },
                  { id: '3', options: { role: 'RED', partner: '4' } },
                  { id: '4', options: { role: 'BLUE', partner: '3' } } ]
            );
        });

        it('should return mirrored matches array at round 4 (like round3)',
           function() {
               result = matcher.match(settings3);

               result.should.be.eql(
                   [ { id: '1', options: { role: 'RED', partner: '2' } },
                     { id: '2', options: { role: 'BLUE', partner: '1' } },
                     { id: '3', options: { role: 'RED', partner: '4' } },
                     { id: '4', options: { role: 'BLUE', partner: '3' } } ]
               );
           });

        it('should return mirrored matches array at round 5 (like round2)',
           function() {
               result = matcher.match(settings3);

               result.should.be.eql(
                   [ { id: '1', options: { role: 'RED', partner: '3' } },
                     { id: '3', options: { role: 'BLUE', partner: '1' } },
                     { id: '4', options: { role: 'RED', partner: '2' } },
                     { id: '2', options: { role: 'BLUE', partner: '4' } } ]

               );
           });

        it('should return mirrored matches array at round 6 (like round1)',
           function() {
               result = matcher.match(settings3);

               result.should.be.eql(
                   [ { id: '1', options: { role: 'RED', partner: '4' } },
                     { id: '4', options: { role: 'BLUE', partner: '1' } },
                     { id: '2', options: { role: 'RED', partner: '3' } },
                     { id: '3', options: { role: 'BLUE', partner: '2' } } ]
               );
           });


        it('should return mirrored matches array at round 7 (like round6)',
           function() {
               result = matcher.match(settings3);

               result.should.be.eql(
                   [ { id: '1', options: { role: 'RED', partner: '4' } },
                     { id: '4', options: { role: 'BLUE', partner: '1' } },
                     { id: '2', options: { role: 'RED', partner: '3' } },
                     { id: '3', options: { role: 'BLUE', partner: '2' } } ]
               );
           });
    });



    describe('#match() roundrobin,mirror_invert,roles', function() {
        before(function() {
            matcher = new MatcherManager(node);
            // Make sure that the order of ids is **not** shuffled.
            matcher.matcher.setAssignerCb(ngc.Matcher.linearAssigner);
            result = matcher.match(settings4);
        });

        it('should save last matches', function() {
            matcher.lastMatches.should.be.eql(result);
        });

        it('should save last settings', function() {
            matcher.lastSettings.should.be.eql(settings4);
        });

        it('should return the matches array', function() {
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '4' } },
                  { id: '4', options: { role: 'BLUE', partner: '1' } },
                  { id: '2', options: { role: 'RED', partner: '3' } },
                  { id: '3', options: { role: 'BLUE', partner: '2' } } ]
            );
        });

        it('should return matches array for round 2', function() {
            result = matcher.match(settings4);
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '3' } },
                  { id: '3', options: { role: 'BLUE', partner: '1' } },
                  { id: '4', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '4' } } ]
            );
        });

        it('should return the matches array for round 3', function() {
            result = matcher.match(settings4);
            result.should.be.eql(
                [ { id: '1', options: { role: 'RED', partner: '2' } },
                  { id: '2', options: { role: 'BLUE', partner: '1' } },
                  { id: '3', options: { role: 'RED', partner: '4' } },
                  { id: '4', options: { role: 'BLUE', partner: '3' } } ]
            );
        });

        it('should return mirrored inverted matches at round 4 (from round3)',
           function() {
               result = matcher.match(settings4);

               result.should.be.eql(
                   [ { id: '2', options: { role: 'RED', partner: '1' } },
                     { id: '1', options: { role: 'BLUE', partner: '2' } },
                     { id: '4', options: { role: 'RED', partner: '3' } },
                     { id: '3', options: { role: 'BLUE', partner: '4' } } ]
               );
           });

        it('should return mirrored matches array at round 5 (from round2)',
           function() {
               result = matcher.match(settings4);

               result.should.be.eql(
                   [ { id: '3', options: { role: 'RED', partner: '1' } },
                     { id: '1', options: { role: 'BLUE', partner: '3' } },
                     { id: '2', options: { role: 'RED', partner: '4' } },
                     { id: '4', options: { role: 'BLUE', partner: '2' } } ]

               );
           });

        it('should return mirrored matches array at round 6 (from round1)',
           function() {
               result = matcher.match(settings4);

               result.should.be.eql(
                   [ { id: '4', options: { role: 'RED', partner: '1' } },
                     { id: '1', options: { role: 'BLUE', partner: '4' } },
                     { id: '3', options: { role: 'RED', partner: '2' } },
                     { id: '2', options: { role: 'BLUE', partner: '3' } } ]
               );
           });


        it('should return mirrored matches array at round 7 (from round6)',
           function() {
               result = matcher.match(settings4);

               result.should.be.eql(
                   [ { id: '1', options: { role: 'RED', partner: '4' } },
                     { id: '4', options: { role: 'BLUE', partner: '1' } },
                     { id: '2', options: { role: 'RED', partner: '3' } },
                     { id: '3', options: { role: 'BLUE', partner: '2' } } ]
               );
           });
    });


    describe('#match() roundrobin,mirror_invert,roles', function() {
        before(function() {
            // Fake game round.
            // tmp = 1;
            // node.game.getCurrentGameStage = function() {
            //     return { round: tmp };
            // };
        });

        it('should save last matches', function() {
            // matcher.getMatchFor('1').should.be.eql('2');
        });


    });
});
