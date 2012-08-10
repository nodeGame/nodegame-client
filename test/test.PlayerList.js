var util = require('util'),
	should = require('should');



var node = module.exports.node = require('./../index.js');

//console.log(node);

var PlayerList = node.PlayerList;
var Player = node.Player;



var test_player = null,
	player = new Player ({
					id: 1,
					sid: 1,
					count: 1,
					name: 'Ste',
					state: {round: 1},
					ip:	'1.2.3.4',
	}),
	player2 = new Player ({
		id: 2,
		sid: 2,
		count: 2,
		name: 'Ste2',
		state: {round: 1},
		ip:	'1.2.3.5',
	}),
	player3 = new Player ({
		id: 3,
		sid: 3,
		count: 3,
		name: 'Ste3',
		state: {round: 1},
		ip:	'1.2.3.6',
	}),
	player4 = new Player ({
		id: 4,
		sid: 4,
		count: 4,
		name: 'Ste4',
		state: {round: 1},
		ip:	'1.2.3.7',
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
			pl.length.should.equal(1);
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
		
		it('should return a player object', function() {
			test_player.should.exists;
		});
		
		it('should return the player we have inserted before', function() {
			samePlayer(player, test_player);
		});
		
		it('should remove the player we have inserted before', function() {
			pl.length.should.equal(0);
		});
	});
	
	describe('#getRandom()', function() {
		before(function(){
			pl.add(player);
			pl.add(player2);
			pl.add(player3);
			pl.add(player4);
		});
		
		it('should return one random player', function() {
			var r = pl.getRandom();
			r.name.should.exist;
			r.should.be.a('object');
			[player,player2,player3,player4].should.include(r);
			
		});
		
		it('should return two random players', function() {
			var set = pl.getRandom(2);
			set.length.should.equal(2);
		});
	});
	
	
});