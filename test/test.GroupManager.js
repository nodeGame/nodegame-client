var util = require('util'),
should = require('should');

var ngc = module.exports.node = require('./../index.js');

var PlayerList = ngc.PlayerList;
var Player = ngc.Player;
var GroupManager = ngc.GroupManager;
var J = ngc.JSUS;
// var nodeclient = ngc.getClient();

var gm = new GroupManager();

gm.setElements(J.seq(1,10));

var groupNames = ["A","B","C","D"];

var memberships;

describe('GroupManager', function() {
    
    describe('#createGroups(["A","B","C","D"])', function() {
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
            memberships = gm.getMemberships();
        });
        it('should create a new random match every time', function() {
            gm.match('RANDOM');
            memberships = gm.getMemberships();
        });
    });

});