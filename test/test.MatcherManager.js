"use strict";

var util = require('util');
var should = require('should');

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


    describe('#getMatchFor()', function() {
        before(function() {
            // Fake game round.
            tmp = 1;
            node.game.getCurrentGameStage = function() {
                return { round: tmp };
            };
        });

        it('should match 1 with 4', function() {
            matcher.getMatchFor('1').should.be.eql('4');
        });
        it('should match 4 with 1', function() {
            matcher.getMatchFor('4').should.be.eql('1');
        });

        it('should match 2 with 3', function() {
            matcher.getMatchFor('2').should.be.eql('3');
        });
        it('should match 3 with 2', function() {
            matcher.getMatchFor('3').should.be.eql('2');
        });

    });

    describe('#getRoleFor()', function() {

        it('should match RED with 1', function() {
            matcher.getRoleFor('1').should.be.eql('RED');
        });
        it('should match 4 with BLUE', function() {
            matcher.getRoleFor('4').should.be.eql('BLUE');
        });

        it('should match 2 with RED', function() {
            matcher.getRoleFor('2').should.be.eql('RED');
        });
        it('should match 3 with BLUE', function() {
            matcher.getRoleFor('3').should.be.eql('BLUE');
        });

    });


    describe('#getIdForRole()', function() {

        it('should match RED with 1,2', function() {
            matcher.getIdForRole('RED').should.be.eql(['1', '2']);
        });
        it('should match BLUE with 4,3', function() {
            matcher.getIdForRole('BLUE').should.be.eql(['4', '3']);
        });

    });

    describe('#getMatches()', function() {

        it('default', function() {
            matcher.getMatches().should.be.eql([ [ '1', '4' ], [ '2', '3' ] ]);
        });

        it('ARRAY_ROLES', function() {
            matcher.getMatches('ARRAY_ROLES').should.be.eql(
                [ [ 'RED', 'BLUE' ], [ 'RED', 'BLUE' ] ]
            );
        });

        it('ARRAY_ID_ROLES', function() {
            matcher.getMatches('ARRAY_ID_ROLES').should.be.eql(
                [ { '1': 'RED', '4': 'BLUE' }, { '2': 'RED', '3': 'BLUE' } ]
            );
        });

        it('ARRAY_ROLES_ID', function() {
            matcher.getMatches('ARRAY_ROLES_ID').should.be.eql(
                [ { RED: '1', BLUE: '4' }, { RED: '2', BLUE: '3' } ]
            );
        });

        it('OBJ', function() {
            matcher.getMatches('OBJ').should.be.eql(
                { '1': '4', '2': '3', '3': '2', '4': '1' }
            );
        });

        it('OBJ_ROLES_ID', function() {
            matcher.getMatches('OBJ_ROLES_ID').should.be.eql(
                { RED: [ '1', '2' ], BLUE: [ '4', '3' ] }
            );
        });

        it('OBJ_ID_ROLES', function() {
            matcher.getMatches('OBJ_ID_ROLES').should.be.eql(
                { '1': 'RED', '2': 'RED', '3': 'BLUE', '4': 'BLUE' }
            );
        });

    });

    describe('#replaceId(x,y)', function() {
        before(function() {
            matcher.replaceId('2', 'cucco');
        });
        it('should replace id - default', function() {
            matcher.getMatches().should.eql([ [ '1', '4' ], [ 'cucco', '3' ] ]);
        });

        it('should NOT replace roles - ARRAY_ROLES', function() {
            matcher.getMatches('ARRAY_ROLES').should.be.eql(
                [ [ 'RED', 'BLUE' ], [ 'RED', 'BLUE' ] ]
            );
        });

        it('should replace id - ARRAY_ID_ROLES', function() {
            matcher.getMatches('ARRAY_ID_ROLES').should.be.eql(
                [ { '1': 'RED', '4': 'BLUE' }, { 'cucco': 'RED', '3': 'BLUE' } ]
            );
        });

        it('should replace id - ARRAY_ROLES_ID', function() {
            matcher.getMatches('ARRAY_ROLES_ID').should.be.eql(
                [ { RED: '1', BLUE: '4' }, { RED: 'cucco', BLUE: '3' } ]
            );
        });

        it('should replace id - OBJ', function() {
            matcher.getMatches('OBJ').should.be.eql(
                { '1': '4', 'cucco': '3', '3': 'cucco', '4': '1' }
            );
        });

        it('should replace id - OBJ_ROLES_ID', function() {
            matcher.getMatches('OBJ_ROLES_ID').should.be.eql(
                { RED: [ '1', 'cucco' ], BLUE: [ '4', '3' ] }
            );
        });

        it('should replace id - OBJ_ID_ROLES', function() {
            matcher.getMatches('OBJ_ID_ROLES').should.be.eql(
                { '1': 'RED', 'cucco': 'RED', '3': 'BLUE', '4': 'BLUE' }
            );
        });

    });

    describe('#replaceId(x,y) unknown x', function() {
        it('should replace id - default', function() {
            matcher.replaceId('22', 'cucco').should.be.false;
        });
    });
});
