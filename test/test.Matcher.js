"use strict";

var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Matcher = ngc.Matcher;
var J = ngc.JSUS;

var result, tmp;
var matcher;

describe('Matcher', function() {

    describe('#constructor', function() {
        before(function() {
            matcher = new Matcher();
            result = null;
        });

        it('should create a new instance of Matcher', function() {
            (null === matcher.x).should.eql(true);
            (null === matcher.y).should.eql(true);
            (null === matcher.matches).should.eql(true);
            (null === matcher.resolvedMatches).should.eql(true);
            (null === matcher.resolvedMatchesById).should.eql(true);
            (null === matcher.assignedIds).should.eql(true);
            matcher.assignerCb.should.eql(Matcher.randomAssigner);
            matcher.missingId.should.eql('bot');
            matcher.bye.should.eql(-1);
        });
    });

    describe('#generateMatches("roundrobin", 4)', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 4);
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, 3 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ],
                [ [ 0, 1 ], [ 2, 3 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3)', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3);
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, -1 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ -1, 1 ] ],
                [ [ 0, 1 ], [ 2, -1 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3, {bye: 100})', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, { bye: 100 });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array with bye=100', function() {
            matcher.matches.should.be.eql([
                [ [ 0, 100 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 100, 1 ] ],
                [ [ 0, 1 ], [ 2, 100 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3, {skipBye: true})', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, { skipBye: true });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array skipping bye', function() {
            matcher.matches.should.be.eql([
                [ [ 1, 2 ] ],
                [ [ 0, 2 ] ],
                [ [ 0, 1 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3, {skipBye: true, bye: 100})',
             function() {
                 before(function() {
                     matcher = new Matcher();
                     matcher.generateMatches('roundrobin', 3, {
                         skipBye: true,
                         bye: 100
                     });
                 });

                 it('should create the matches array', function() {
                     J.isArray(matcher.matches).should.be.true;
                 });

                 it('should create the matches array skipping bye', function() {
                     matcher.matches.should.be.eql([
                         [ [ 1, 2 ] ],
                         [ [ 0, 2 ] ],
                         [ [ 0, 1 ] ]
                     ]);
                 });
             });

    describe('#generateMatches("random", 4) - light-validation', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('random', 4);
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });
    });

    describe('#generateMatches("random", 3) - light-validation', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('random', 3);
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });
    });

    describe('#generateMatches("roundrobin", 4, { rounds: 2 })', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 4, { rounds: 2 });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, 3 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3, { rounds: 2 })', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, { rounds: 2 });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, -1 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ -1, 1 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3, {skipBye: true, rounds: 2 })',
             function() {

        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, {
                skipBye: true,
                rounds: 2
            });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array skipping bye', function() {
            matcher.matches.should.be.eql([
                [ [ 1, 2 ] ],
                [ [ 0, 2 ] ]
            ]);
        });
    });

  describe('#generateMatches("roundrobin", 4, { cycle: "repeat" })',
           function() {

        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 4, { cycle: "repeat" });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, 3 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ],
                [ [ 0, 1 ], [ 2, 3 ] ],
                [ [ 0, 3 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ],
                [ [ 0, 1 ], [ 2, 3 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3, { cycle: "repeat" })',
             function() {

        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, { cycle: "repeat" });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, -1 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ -1, 1 ] ],
                [ [ 0, 1 ], [ 2, -1 ] ],
                [ [ 0, -1 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ -1, 1 ] ],
                [ [ 0, 1 ], [ 2, -1 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 4, { cycle: "repeat_invert" })',
           function() {

        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 4, {
                cycle: "repeat_invert"
            });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, 3 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ],
                [ [ 0, 1 ], [ 2, 3 ] ],
                [ [ 3, 0 ], [ 2, 1 ] ],
                [ [ 2, 0 ], [ 1, 3 ] ],
                [ [ 1, 0 ], [ 3, 2 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3, { cycle: "repeat_invert" })',
             function() {

        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, {
                cycle: "repeat_invert"
            });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, -1 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ -1, 1 ] ],
                [ [ 0, 1 ], [ 2, -1 ] ],
                [ [ -1, 0 ], [ 2, 1 ] ],
                [ [ 2, 0 ], [ 1, -1 ] ],
                [ [ 1, 0 ], [ -1, 2 ] ]
            ]);
        });
    });

  describe('#generateMatches("roundrobin", 4, { cycle: "mirror" })',
           function() {

        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 4, { cycle: "mirror" });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, 3 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ],
                [ [ 0, 1 ], [ 2, 3 ] ],
                [ [ 0, 1 ], [ 2, 3 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ],
                [ [ 0, 3 ], [ 1, 2 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3, { cycle: "mirror" })',
             function() {

        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, { cycle: "mirror" });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, -1 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ -1, 1 ] ],
                [ [ 0, 1 ], [ 2, -1 ] ],
                [ [ 0, 1 ], [ 2, -1 ] ],
                [ [ 0, 2 ], [ -1, 1 ] ],
                [ [ 0, -1 ], [ 1, 2 ] ]
            ]);
        });
    });

  describe('#generateMatches("roundrobin", 4, { cycle: "mirror_invert" })',
           function() {

        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 4, {
                cycle: "mirror_invert"
            });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, 3 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ],
                [ [ 0, 1 ], [ 2, 3 ] ],
                [ [ 1, 0 ], [ 3, 2 ] ],
                [ [ 2, 0 ], [ 1, 3 ] ],
                [ [ 3, 0 ], [ 2, 1 ] ]
            ]);
        });
    });

    describe('#generateMatches("roundrobin", 3, { cycle: "mirror_invert" })',
             function() {

        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, {
                cycle: "mirror_invert"
            });
        });

        it('should create the matches array', function() {
            J.isArray(matcher.matches).should.be.true;
        });

        it('should create the matches array', function() {
            matcher.matches.should.be.eql([
                [ [ 0, -1 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ -1, 1 ] ],
                [ [ 0, 1 ], [ 2, -1 ] ],
                [ [ 1, 0 ], [ -1, 2 ] ],
                [ [ 2, 0 ], [ 1, -1 ] ],
                [ [ -1, 0 ], [ 2, 1 ] ]
            ]);
        });
    });

    describe('#setIds', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, { skipBye: true });
            matcher.setIds(['a', 'b', 'c']);
        });

        it('should set the ids array', function() {
            matcher.ids.should.eql(['a', 'b', 'c']);
        });

        it('should reset resolved data', function() {
            (null === matcher.resolvedMatches).should.be.true;
            (null === matcher.resolvedMatchesById).should.be.true;
        });
    });

    describe('#setAssignerCb', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, { skipBye: true });
            tmp = function() {};
            matcher.setAssignerCb(tmp);
        });

        it('should set the ids array', function() {
            matcher.assignerCb.should.eql(tmp);
        });
    });

    describe('#assignIds', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3, { skipBye: true });
            tmp = function(ids) {
                return ['c', 'a', 'b'];
            };
            matcher.setAssignerCb(tmp);
            matcher.setIds(['a', 'b', 'c']);
            matcher.assignIds();
        });

        it('should set the ids array', function() {
            matcher.assignedIds.should.eql(['c', 'a', 'b']);
        });
    });

    describe('#match', function() {
        before(function() {
            // Follows from previous test. Do not move around.
            matcher.match();
        });

        it('should match ids to positions - resolvedMatches', function() {
            matcher.resolvedMatches.should.eql([
                [ [ 'a', 'b' ] ],
                [ [ 'c', 'b' ] ],
                [ [ 'c', 'a' ] ]
            ]);
        });

        it('should match ids to positions - resolvedMatchesById', function() {
            matcher.resolvedMatchesById.should.eql([
                { a: 'b', b: 'a' },
                { c: 'b', b: 'c' },
                { c: 'a', a: 'c' }
            ]);
        });
    });


    describe('#getMatch(x,y) 1/1', function() {
        it('should return single matches', function() {
            matcher.getMatch(0, 0).should.eql([ 'a', 'b' ]);
            matcher.getMatch(1, 0).should.eql([ 'c', 'b' ]);
            matcher.getMatch(2, 0).should.eql([ 'c', 'a' ]);
        });

        it('should return null if out of bounds', function() {
            (null === matcher.getMatch(0, 1)).should.be.true
            (null === matcher.getMatch(3)).should.be.true
        });
    });

    describe('#match - with missingIds', function() {
        before(function() {
            matcher = new Matcher();
            matcher.generateMatches('roundrobin', 3);
            tmp = function(ids) {
                return ['c', 'a', 'b'];
            };
            matcher.setAssignerCb(tmp);
            matcher.setIds(['a', 'b', 'c']);
            matcher.assignIds();
            matcher.match();
        });

        it('should match ids to positions - resolvedMatches', function() {
            matcher.resolvedMatches.should.eql([
                [ [ 'c', 'bot' ], [ 'a', 'b' ] ],
                [ [ 'c', 'b' ], [ 'bot', 'a' ] ],
                [ [ 'c', 'a' ], [ 'b', 'bot' ] ]
            ]);
        });

        it('should match ids to positions - resolvedMatchesById', function() {
            matcher.resolvedMatchesById.should.eql([
                { c: 'bot', bot: 'c', a: 'b', b: 'a' },
                { c: 'b', b: 'c', bot: 'a', a: 'bot' },
                { c: 'a', a: 'c', b: 'bot', bot: 'b' }
            ]);
        });
    });

    describe('#getMatch(x,y) 2/2', function() {
        it('should return single matches', function() {
            matcher.getMatch(0, 0).should.eql([ 'c', 'bot' ]);
            matcher.getMatch(0, 1).should.eql([ 'a', 'b' ]);
            matcher.getMatch(1, 0).should.eql([ 'c', 'b' ]);
            matcher.getMatch(1, 1).should.eql([ 'bot', 'a' ]);
            matcher.getMatch(2, 0).should.eql([ 'c', 'a' ]);
            matcher.getMatch(2, 1).should.eql([ 'b', 'bot' ]);
        });

        it('should return null if out of bounds', function() {
            (null === matcher.getMatch(0, 2)).should.be.true;
            (null === matcher.getMatch(3)).should.be.true;
        });

        it('should change x and y', function() {
            matcher.x.should.eql(3);
            matcher.y.should.eql(0);
        });
    });

    describe('#getMatch - no params -', function() {
        before(function() {
            matcher.init({ x: null, y: null });
        });
        it('should return single matches', function() {
            matcher.getMatch().should.eql([ 'c', 'bot' ]);
            matcher.getMatch().should.eql([ 'a', 'b' ]);
            matcher.getMatch().should.eql([ 'c', 'b' ]);
            matcher.getMatch().should.eql([ 'bot', 'a' ]);
            matcher.getMatch().should.eql([ 'c', 'a' ]);
            matcher.getMatch().should.eql([ 'b', 'bot' ]);
        });

        it('should return null if out of bounds', function() {
            (null === matcher.getMatch()).should.be.true;
        });

        it('should change x and y', function() {
            matcher.x.should.eql(3);
            matcher.y.should.eql(0);
        });
    });

    describe('#getMatch(x)', function() {
        it('should return entire row', function() {
            matcher.getMatch(0).should.eql([ [ 'c', 'bot' ], [ 'a', 'b' ] ]);
            matcher.getMatch(1).should.eql([ [ 'c', 'b' ], [ 'bot', 'a' ] ]);
            matcher.getMatch(2).should.eql([ [ 'c', 'a' ], [ 'b', 'bot' ] ]);
        });

        it('should return null if out of bounds', function() {
            (null === matcher.getMatch(3)).should.be.true
        });

        it('should not change x and y', function() {
            matcher.x.should.eql(3);
            matcher.y.should.eql(0);
        });
    });

    describe('#getMatchObject(x)', function() {
        it('should return entire row', function() {
            matcher.getMatchObject(0).should.eql({
                c: 'bot', bot: 'c', a: 'b', b: 'a' });
            matcher.getMatchObject(1).should.eql({
                c: 'b', b: 'c', bot: 'a', a: 'bot' });
            matcher.getMatchObject(2).should.eql({
                c: 'a', a: 'c', b: 'bot', bot: 'b' });
        });

        it('should return null if out of bounds', function() {
            (null === matcher.getMatchObject(3)).should.be.true
        });

        it('should not change x and y', function() {
            matcher.x.should.eql(3);
            matcher.y.should.eql(0);
        });
    });


    describe('#getMatchObject()', function() {
        before(function() {
            matcher.init({x: null, y: null});
        });
        it('should return entire row', function() {
            matcher.getMatchObject().should.eql({
                c: 'bot', bot: 'c', a: 'b', b: 'a' });
            matcher.getMatchObject().should.eql({
                c: 'b', b: 'c', bot: 'a', a: 'bot' });
            matcher.getMatchObject().should.eql({
                c: 'a', a: 'c', b: 'bot', bot: 'b' });
        });

        it('should return null if out of bounds', function() {
            (null === matcher.getMatchObject(3)).should.be.true
        });

        it('should change x and y', function() {
            matcher.x.should.eql(3);
            matcher.y.should.eql(0);
        });
    });

    describe('#setMatches', function() {
        before(function() {
            matcher.setMatches([
                [ [ 0, 3 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ],
                [ [ 0, 1 ], [ 2, 3 ] ]
            ]);
        });
        it('should set matches ', function() {
            matcher.matches.should.eql([
                [ [ 0, 3 ], [ 1, 2 ] ],
                [ [ 0, 2 ], [ 3, 1 ] ],
                [ [ 0, 1 ], [ 2, 3 ] ]
            ]);
        });

        it('should reset resolved data', function() {
            (null === matcher.resolvedMatches).should.be.true;
            (null === matcher.resolvedMatchesById).should.be.true;
        });

    });

    describe('#init', function() {
        before(function() {
            tmp = {
                assignerCb: function() {},
                ids: [ 'a', 'b' ],
                bye: -100,
                missingId: 'miss',
                x: 1,
                y: 1
            };
            matcher.init(tmp);
        });

        it('should reset resolved data', function() {
            matcher.assignerCb.should.eql(tmp.assignerCb);
            matcher.ids.should.eql(tmp.ids);
            matcher.bye.should.eql(tmp.bye);
            matcher.missingId.should.eql(tmp.missingId);
            matcher.x.should.eql(tmp.x);
            matcher.y.should.eql(tmp.y);
        });

    });

    describe('Matcher should throw an error if', function() {
        before(function() {
            matcher = new Matcher();
        });

        it('match() is called without matches ', function() {
            (function() {
                matcher.match();
            }).should.throw();
        });

        it('init() has x out of range ', function() {
            (function() {
                matcher.init({x: -1 });
            }).should.throw();
        });

        it('init() has y out of range ', function() {
            (function() {
                matcher.init({y: -1 });
            }).should.throw();
        });

        it('generateMatches() has wrong rounds number ', function() {
            (function() {
                matcher.generateMatches('roundrobin', 4, { rounds: 5 });
            }).should.throw();
        });
        it('generateMatches() has unkwnon algorithm ', function() {
            (function() {
                matcher.generateMatches('aa');
            }).should.throw();
        });

        it('generateMatches() has wrong param ', function() {
            (function() {
                matcher.generateMatches({});
            }).should.throw();
        });

        it('setMatches() has wrong param ', function() {
            (function() {
                matcher.setMatches({});
            }).should.throw();
            (function() {
                matcher.setMatches([]);
            }).should.throw();
        });

        it('setIds() has wrong param ', function() {
            (function() {
                matcher.setIds();
            }).should.throw();
            (function() {
                matcher.setIds([]);
            }).should.throw();
        });

        it('assignIds() is called before ids are set ', function() {
            (function() {
                matcher.assignIds();
            }).should.throw();
        });

        it('setAssignerCb() has wrong param ', function() {
            (function() {
                matcher.setAssignerCb(1);
            }).should.throw();
        });

        it('getMatch() has y, but no x ', function() {
            (function() {
                matcher.getMatch(undefined, 1);
            }).should.throw();
        });

        it('getMatch() is called before matches are resolved ', function() {
            (function() {
                matcher.getMatch(1, 1);
            }).should.throw();
        });
    });

});
