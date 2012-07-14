var util = require('util'),
	fs = require('fs'),
	path = require('path'),
	should = require('should');



var node = module.exports.node = require('./../index.js');

node.game = new node.Game();
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
	


//console.log(pl.get.toString());
//
//console.log(util.inspect(pl.__proto__));

// Check if pl2 == pl1
function samePlayer(pl1, pl2) {
	pl2.should.exist;
	pl2.name.should.equal(pl1.name);
	pl2.id.should.equal(pl1.id);
};

var deleteIfExist = function() {
	if (path.existsSync(filename)) {
		fs.unlink(filename, function (err) {
			if (err) throw err;  
		});
	}
};

var filename;

describe('FS operations', function() {
	
	describe('#node.game.pl.dump()', function() {
		before(function() {
			filename = './pl.csv';
			deleteIfExist();
			node.game.pl.add(player);
			node.game.pl.dump(filename);
		});
		after(function() {
			deleteIfExist();
		});
		it('should dump the list of players', function() {
			path.existsSync(filename).should.be.true;
		});
		
	});
	
	
});