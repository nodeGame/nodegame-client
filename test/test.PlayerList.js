var util = require('util'),
	should = require('should');

var node = module.exports.node = require('../nodeGame.js').nodeGame;

//console.log(node);

var PlayerList = require('../PlayerList').PlayerList;
var Player = require('../PlayerList').Player;



var test_player = null,
	player = new Player ({
					id: 1,
					count: 1,
					name: 'Ste',
					state: {round: 1},
					ip:	'1.2.3.4',
});

var pl = new PlayerList();


//console.log(pl.get.toString());
//
//console.log(util.inspect(pl.__proto__));

// Check if pl2 == pl1
function samePlayer(pl1, pl2) {
	pl2.should.exist;
	pl2.name.should.equal(pl1.name);
	pl2.id.should.equal(pl1.id);
};

describe('PlayerList', function() {
	
	describe('#add()', function() {
		before(function(){
			pl.add(player);
		});
		it('should result in a player list of length 1', function() {
			pl.count().should.equal(1);
		});
		
	});
	
	describe('#get()', function() {
		before(function(){
			test_player = pl.get(player.id);
		});
		it('should return the player we have inserted before', function() {
			samePlayer(player, test_player);
		});
		
	});
	
	describe('#pop()', function() {
		before(function() {
			test_player = pl.pop(player.id);
		});
		
		it('should return the player we have inserted before', function() {
			samePlayer(player, test_player);
		});
		
		it('should remove the player we have inserted before', function() {
			pl.length.should.equal(0);
		});
		
	});
});