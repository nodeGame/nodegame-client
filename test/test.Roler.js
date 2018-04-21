"use strict";

var util = require('util');
var should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Roler = ngc.Roler;
var Matcher = ngc.Matcher;
var J = ngc.JSUS;

var result, tmp;
var roler, matcher, roles, ids;

roles = [ 'A', 'B', 'C' ];
ids = [ '1', '2', '3', '4'];

describe('Roler', function() {

    describe('#constructor', function() {
        before(function() {
            roler = new Roler();
            result = null;
        });
    });

    describe('#setRoles()', function() {
        before(function() {
            roler = new Roler();
            roler.setRoles(roles);
        });

        it('should create the roles obj', function() {
            roler.roles[roles[0]].should.be.true;
            roler.roles[roles[1]].should.be.true
            roler.roles[roles[2]].should.be.true
        });

        it('should create the roles array', function() {
            roler.rolesArray[0].should.eql(roles[0]);
            roler.rolesArray[1].should.eql(roles[1]);
            roler.rolesArray[2].should.eql(roles[2]);
        });
    });

    describe('#roleExists()', function() {
        before(function() {
            roler = new Roler();
            roler.setRoles(roles);
        });

        it('should return true/false accordingly', function() {
            roler.roleExists(roles[0]).should.be.true;
            roler.roleExists('unknown_role').should.be.false;
        });
    });

    describe('#rolifyAll', function() {
        before(function() {
            matcher = new Matcher();
            // Make a manual copy of settings object, and generate matches.
            matcher.generateMatches('roundrobin', ids);
            // Generates matches.
            matcher.match(true);
            roler = new Roler();
            roler.setRoles(roles);
            roler.rolifyAll(matcher.resolvedMatches);
        });

        testDataStructures(it);
    });

    describe('#matcher integration', function() {
        before(function() {
            roler = new Roler();
            roler.setRoles(roles);
            matcher = new Matcher( { doRoles: true, roler: roler });
            // Make a manual copy of settings object, and generate matches.
            matcher.generateMatches('roundrobin', ids);
            // Generates matches.
            matcher.match(true);
        });

        testDataStructures(it);

    });


    describe('#replaceId(x,y)', function() {
        before(function() {
            roler.replaceId('1', 'cucco');
        });
        it('should replace id - getRoleFor', function() {
            roler.getRoleFor('cucco', 0).should.eql('A');
            roler.getRoleFor('cucco', 1).should.eql('A');
            roler.getRoleFor('cucco', 2).should.eql('A');
        });
        it('should NOT update other roles - getRoleFor', function() {
            roler.getRoleFor('2', 0).should.eql('A');
            roler.getRoleFor('2', 1).should.eql('B');
            roler.getRoleFor('2', 2).should.eql('B');
        });
        it('should remove old match - getMatchFor', function() {
            (null === roler.getRoleFor('1', 0)).should.be.true;
            (null === roler.getRoleFor('1', 1)).should.be.true;
            (null === roler.getRoleFor('1', 2)).should.be.true;
        });

        it('should replace id - getIdForRole', function() {
            roler.getIdForRole('A', 0).should.eql(['cucco', '2']);
            roler.getIdForRole('A', 1).should.eql(['cucco', '4']);
            roler.getIdForRole('A', 2).should.eql(['cucco', '3']);
        });

        it('should NOT update other roles - getIdForRole', function() {
            roler.getIdForRole('B', 0).should.eql(['4', '3']);
            roler.getIdForRole('B', 1).should.eql(['3', '2']);
            roler.getIdForRole('B', 2).should.eql(['2', '4']);
        });

        it('should update id - getRole2IdRoundMap', function() {
            roler.getRole2IdRoundMap(0).should.eql({
                A: [ 'cucco', '2' ], B: [ '4', '3' ]
            });
            roler.getRole2IdRoundMap(1).should.eql({
                A: [ 'cucco', '4' ], B: [ '3', '2' ]
            });
            roler.getRole2IdRoundMap(2).should.eql({
                A: [ 'cucco', '3' ], B: [ '2', '4' ]
            });
        });

        it('should update id - getId2RoleRoundMap', function() {
            roler.getId2RoleRoundMap(0).should.eql({
                'cucco': 'A', '3': 'B', '2': 'A', '4': 'B'
            });
            roler.getId2RoleRoundMap(1).should.eql({
                'cucco': 'A', '4': 'A', '2': 'B', '3': 'B'
            });
            roler.getId2RoleRoundMap(2).should.eql({
                'cucco': 'A', '3': 'A', '2': 'B', '4': 'B'
            });
        });

    });


    describe('#rolifyAll odd', function() {
        before(function() {
            matcher = new Matcher();
            // Make a manual copy of settings object, and generate matches.
            matcher.generateMatches('roundrobin', ids.slice(0,3));
            // Generates matches.
            matcher.match(true);
            roler = new Roler();
            roler.setRoles(roles);
            roler.rolifyAll(matcher.resolvedMatches);
        });

        testDataStructuresOdd(it);
    });


    describe('#replaceId(x,y) odd', function() {
        before(function() {
            roler.replaceId('1', 'cucco');
        });
        it('should replace id - getRoleFor', function() {
            roler.getRoleFor('cucco', 0).should.eql('C');
            roler.getRoleFor('cucco', 1).should.eql('A');
            roler.getRoleFor('cucco', 2).should.eql('A');
        });
        it('should NOT update other roles - getRoleFor', function() {
            roler.getRoleFor('2', 0).should.eql('A');
            roler.getRoleFor('2', 1).should.eql('C');
            roler.getRoleFor('2', 2).should.eql('B');
        });
        it('should remove old match - getMatchFor', function() {
            (null === roler.getRoleFor('1', 0)).should.be.true;
            (null === roler.getRoleFor('1', 1)).should.be.true;
            (null === roler.getRoleFor('1', 2)).should.be.true;
        });

        it('should replace id - getIdForRole', function() {

            roler.getIdForRole('C', 0).should.eql(['cucco']);
            roler.getIdForRole('A', 1).should.eql(['cucco']);
            roler.getIdForRole('A', 2).should.eql(['cucco']);
        });


        it('should NOT update other roles - getIdForRole', function() {

            roler.getIdForRole('A', 0).should.eql(['2']);

            roler.getIdForRole('B', 0).should.eql(['3']);
            roler.getIdForRole('B', 1).should.eql(['3']);
            roler.getIdForRole('B', 2).should.eql(['2']);

            roler.getIdForRole('C', 1).should.eql(['2']);
            roler.getIdForRole('C', 2).should.eql(['3']);
        });

        it('should update id - getRole2IdRoundMap', function() {
            roler.getRole2IdRoundMap(0).should.eql({
                A: [ '2' ], B: [ '3' ], C: [ 'cucco' ]
            });
            roler.getRole2IdRoundMap(1).should.eql({
                A: [ 'cucco' ], B: [ '3' ], C: [ '2' ]
            });
            roler.getRole2IdRoundMap(2).should.eql({
                A: [ 'cucco' ], B: [ '2' ], C: [ '3' ]
            });
        });

        it('should update id - getId2RoleRoundMap', function() {
            roler.getId2RoleRoundMap(0).should.eql({
                'cucco': 'C', '3': 'B', '2': 'A'
            });
            roler.getId2RoleRoundMap(1).should.eql({
                'cucco': 'A', '3': 'B', '2': 'C'
            });
            roler.getId2RoleRoundMap(2).should.eql({
                'cucco': 'A', '3': 'C', '2': 'B'
            });
        });

    });

    describe('Roler should throw an error if', function() {
        before(function() {
            roler = new Roler();
        });

        it('match() is called without matches ', function() {
            (function() {
                roler.match();
            }).should.throw();
        });

        it('replaceId() is called with wrong param ', function() {
            (function() {
                roler.replaceId(3,'2');
            }).should.throw();
        });

        it('replaceId() is called with no param ', function() {
            (function() {
                roler.replaceId();
            }).should.throw();
        });

        it('replaceId() is called with one missing param ', function() {
            (function() {
                roler.replaceId('2');
            }).should.throw();
        });

    });

    function testDataStructures(it) {

        it('should create the rolifiedMatches obj', function() {
            roler.rolifiedMatches.should.exist;
            roler.rolifiedMatches.length.should.eql(3);
        });

        it('should create a linear rolifiedMatches obj', function() {
            roler.rolifiedMatches.should.eql(
                [ [ [ 'A', 'B' ], [ 'A', 'B' ] ],
                  [ [ 'A', 'B' ], [ 'A', 'B' ] ],
                  [ [ 'A', 'B' ], [ 'A', 'B' ] ] ]
            );
        });

        it('should create the id2role map', function() {
            roler.id2RoleRoundMap.should.eql([
                { '1': 'A', '2': 'A', '3': 'B', '4': 'B' },
                { '1': 'A', '2': 'B', '3': 'B', '4': 'A' },
                { '1': 'A', '2': 'B', '3': 'A', '4': 'B' }
            ]);
        });

        it('should create the role2id map', function() {
            roler.role2IdRoundMap.should.eql(
                [ { A: [ '1', '2' ], B: [ '4', '3' ] },
                  { A: [ '1', '4' ], B: [ '3', '2' ] },
                  { A: [ '1', '3' ], B: [ '2', '4' ] }
                ]);
        });

        it('#hasRole("1", "A", 0-2) should return true', function() {
            roler.hasRole('1', 'A', 0).should.be.true;
            roler.hasRole('1', 'A', 1).should.be.true;
            roler.hasRole('1', 'A', 2).should.be.true;
        });

        it('#hasRole("1", "B", 0-2) should return false', function() {
            roler.hasRole('1', 'B', 0).should.be.false;
            roler.hasRole('1', 'B', 1).should.be.false;
            roler.hasRole('1', 'B', 2).should.be.false;
        });

        it('#getRoleFor("1", 0-2) should return "A"', function() {
            roler.getRoleFor('1', 0).should.eql('A');
            roler.getRoleFor('1', 1).should.eql('A');
            roler.getRoleFor('1', 2).should.eql('A');
        });

        it('#getRoleFor("2", 0-2) should return A,B,B', function() {
            roler.getRoleFor('2', 0).should.eql('A');
            roler.getRoleFor('2', 1).should.eql('B');
            roler.getRoleFor('2', 2).should.eql('B');
        });

        it('#getIdForRole("A", 0-2) should return "A"', function() {
            roler.getIdForRole('A', 0).should.eql(['1', '2']);
            roler.getIdForRole('A', 1).should.eql(['1', '4']);
            roler.getIdForRole('A', 2).should.eql(['1', '3']);
        });

        it('#getIdForRole("B", 0-2) should return "A"', function() {
            roler.getIdForRole('B', 0).should.eql(['4', '3']);
            roler.getIdForRole('B', 1).should.eql(['3', '2']);
            roler.getIdForRole('B', 2).should.eql(['2', '4']);
        });
    }

    function testDataStructuresOdd(it) {

        it('should create the rolifiedMatches obj', function() {
            roler.rolifiedMatches.should.exist;
            roler.rolifiedMatches.length.should.eql(3);
        });

        it('should create a linear rolifiedMatches obj', function() {

            // There are undefined spots in array, and mocha get confused.

            roler.rolifiedMatches[0][0][0].should.be.eql('C');
            (undefined === roler.rolifiedMatches[0][0][1]).should.be.true;
            roler.rolifiedMatches[0][1].should.be.eql([ 'A', 'B' ]);

            roler.rolifiedMatches[1][0].should.be.eql([ 'A', 'B' ]);
            (undefined === roler.rolifiedMatches[1][1][0]).should.be.true;
            roler.rolifiedMatches[1][1][1].should.be.eql('C');

            roler.rolifiedMatches[2][0].should.be.eql([ 'A', 'B' ]);
            roler.rolifiedMatches[2][1][0].should.be.eql('C');
            (undefined === roler.rolifiedMatches[2][1][1]).should.be.true

        });

        it('should create the id2role map', function() {
            roler.id2RoleRoundMap.should.eql(
                [ { '1': 'C', '2': 'A', '3': 'B' },
                  { '1': 'A', '2': 'C', '3': 'B' },
                  { '1': 'A', '2': 'B', '3': 'C' } ]
            );
        });

        it('should create the role2id map', function() {
            roler.role2IdRoundMap.should.eql(
                [ { C: [ '1' ], A: [ '2' ], B: [ '3' ] },
                  { A: [ '1' ], B: [ '3' ], C: [ '2' ] },
                  { A: [ '1' ], B: [ '2' ], C: [ '3' ] }
            ]);
        });

        it('#hasRole("1", "A", 0-2) should return F,T,T', function() {
            roler.hasRole('1', 'A', 0).should.be.false;
            roler.hasRole('1', 'A', 1).should.be.true;
            roler.hasRole('1', 'A', 2).should.be.true;
        });

        it('#hasRole("1", "B", 0-2) should return false', function() {
            roler.hasRole('1', 'B', 0).should.be.false;
            roler.hasRole('1', 'B', 1).should.be.false;
            roler.hasRole('1', 'B', 2).should.be.false;
        });

        it('#hasRole("1", "C", 0-2) should return T,F,F', function() {
            roler.hasRole('1', 'C', 0).should.be.true;
            roler.hasRole('1', 'C', 1).should.be.false;
            roler.hasRole('1', 'C', 2).should.be.false;
        });

        it('#getRoleFor("1", 0-2) should return C,A,A', function() {
            roler.getRoleFor('1', 0).should.eql('C');
            roler.getRoleFor('1', 1).should.eql('A');
            roler.getRoleFor('1', 2).should.eql('A');
        });

        it('#getRoleFor("2", 0-2) should return A,C,B"', function() {
            roler.getRoleFor('2', 0).should.eql('A');
            roler.getRoleFor('2', 1).should.eql('C');
            roler.getRoleFor('2', 2).should.eql('B');
        });

        it('#getIdForRole("A", 0-2) should return 2,1,1', function() {
            roler.getIdForRole('A', 0).should.eql(['2']);
            roler.getIdForRole('A', 1).should.eql(['1']);
            roler.getIdForRole('A', 2).should.eql(['1']);
        });

        it('#getIdForRole("B", 0-2) should return 3,3,2', function() {
            roler.getIdForRole('B', 0).should.eql(['3']);
            roler.getIdForRole('B', 1).should.eql(['3']);
            roler.getIdForRole('B', 2).should.eql(['2']);
        });

        it('#getIdForRole("C", 0-2) should return 1,2,3', function() {
            roler.getIdForRole('C', 0).should.eql(['1']);
            roler.getIdForRole('C', 1).should.eql(['2']);
            roler.getIdForRole('C', 2).should.eql(['3']);
        });
    }

});
