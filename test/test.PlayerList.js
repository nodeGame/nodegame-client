var PlayerList = require('../PlayerList').PlayerList;
var Player = require('../PlayerList').Player;
var GameState = require('../GameState').GameState;

var player = new Player ({
					id: 1,
					count: 1,
					name: 'Ste',
					state: {round: 1},
					ip:	'1.2.3.4',
});

var pl = new PlayerList();

describe('PlayerList', function(){
	
	describe('#add()', function(){
		before(function(){
			pl.add(player);
		});
		it('should', function(){
			pl.length.should.equal(1);
		});
		
	});
});