var util = require('util'),
should = require('should');

var ngc = module.exports.node = require('./../index.js');

var PlayerList = ngc.PlayerList;
var Player = ngc.Player;
var GroupManager = ngc.GroupManager;
var J = ngc.JSUS;
// var nodeclient = ngc.getClient();

var gm = new GroupManager();

gm.addElements(J.seq(1,10));

var groupNames = ["A","B","C","D"];
var invalidGroupNames = ["A","B","C","A"];

var memberships;

describe('GroupManager', function() {

   describe('#create(["A","B","C","A"])', function() {
        it('should throw an error.', function() {
            try {
                gm.create(invalidGroupNames);
                false.should.be.true;
            }
            catch(e) {
                true.should.be.true;
            }
        });
    });

    describe('#removeAll', function() {
        before(function() {
            gm.removeAll();
        });
        it('should remove all groups.', function() {
            gm.groups.size().should.be.eql(0);
        });
    });

    describe('#create(["A","B","C","D"])', function() {
        before(function() {
            gm.create(groupNames);
        });
        it('should create four groups.', function() {
            var groupNamesCreated = gm.getGroupNames();
            groupNamesCreated.should.be.eql(groupNames);
        });
    });


    describe('#match("RANDOM")', function() {
        it('should create a new random match the first time', function() {
            gm.match('RANDOM');
            memberships = gm.getMemberships(true);
            for (var i = 0; i < memberships.length; i++) {
                (memberships[i].length >= 2).should.be.true;
            }
        });
        it('should create a new random match every time', function() {
            gm.match('RANDOM');
            memberships = gm.getMemberships();
            for (var i in memberships) {
                if (memberships.hasOwnProperty(i)) {
                    (memberships[i].length >= 2).should.be.true;
                }
            }
        });
    });

    describe('#createNGroups()', function() {
        before(function() {
            gm.removeAll();
            gm.createNGroups(4);
        });
        it('should create four groups.', function() {
            var groupNamesCreated = gm.getGroupNames();
            groupNames.length.should.be.eql(4);
        });
        it('should create four new groups, if done again.', function() {
            var groupNamesCreated = gm.createNGroups(4);
            groupNames.length.should.be.eql(4);
        });
     });

    describe('#assign2Group()', function() {
        it('should assign one element to a group.', function() {
            var g = gm.assign2Group('Group1', 'A');
            g.elements[0].should.be.eql('A');
        });
        it('should assign a set of elements to a group.', function() {
            var g = gm.assign2Group('Group2', ['A','B']);
            g.elements.should.be.eql(['A','B']);
            g = gm.get('Group2').elements.should.be.eql(['A','B']);
        });
        it('should assign a set of players from a PlayerList.', function() {
            var pl = new PlayerList(null, [
                { id: 'A' }, { id: 'B' }
            ]);
            var g = gm.assign2Group('Group3', pl);
            g.elements.should.be.eql(['A','B']);
            g = gm.get('Group3').elements.should.be.eql(['A','B']);
        });
     });


});
