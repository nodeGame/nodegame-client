var util = require('util'),
should = require('should');

var ngc = module.exports.node = require('./../index.js');

var PlayerList = ngc.PlayerList,
Player = ngc.Player,
GameDB = ngc.GameDB,
GameStage = ngc.GameStage;

var test_gs = null,
gs_321 = new GameStage({
    stage: 3,
    step: 2,
    round: 1,
}),
gs_331 = new GameStage({
    stage: 3,
    step: 3,
    round: 1,
}),
gs_311 = new GameStage({
    stage: 3,
    step: 1,
    round: 1,
}),
gs_111 = new GameStage({
    stage: 1,
    step: 1,
    round: 1,
});

var test_player = null,
player = new Player ({
    id: 1,
    sid: 1,
    count: 1,
    name: 'Ste',
    stage: {round: 1},
    ip:	'1.2.3.4',
}),
player2 = new Player ({
    id: 2,
    sid: 2,
    count: 2,
    name: 'Ste2',
    stage: {round: 1},
    ip:	'1.2.3.5',
}),
player3 = new Player ({
    id: 3,
    sid: 3,
    count: 3,
    name: 'Ste3',
    stage: {round: 1},
    ip:	'1.2.3.6',
}),
player4 = new Player ({
    id: 4,
    sid: 4,
    count: 4,
    name: 'Ste4',
    stage: {round: 1},
    ip:	'1.2.3.7',
});


var db = new GameDB();

var test_db;

// Check if pl2 == pl1
function samePlayer(pl1, pl2) {
    pl2.should.exist;
    pl2.name.should.equal(pl1.name);
    pl2.id.should.equal(pl1.id);
};

describe('GameDB', function() {
    
    describe('#add(key, value, player, state)', function() {
	before(function(){
	    db.add('foo', 'bar', player, gs_321);
	});
	it('should result in a player list of length 1', function() {
	    db.length.should.equal(1);
	});
	it('adding other three items should result in length = 4', function() {
	    db.add('foo2', 'bar2', player2, gs_321);
	    db.add('foo3', 'bar3', player3, gs_321);
	    db.add('foo4', 'bar4', player4, gs_321);
	    db.length.should.equal(4);
	});
	
    });
    
//    describe('#select()', function() {
//	before(function(){
//	    test_db = null;
//	});
//	it("db.select('stage', '=', '3.2.1') should consist of 4 items", function() {
//	    db.select('stage', '=', '3.2.1').length.should.equal(4);
//	});
//	it("db.select('player', '=', player4) should consist of 1 item", function() {
//	    db.select('player', '=', player4).length.should.equal(1);
//	});
//	
//	// TODO: try different combinations
//    });
    
});
