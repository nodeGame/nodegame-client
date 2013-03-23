var util = require('util'),
	should = require('should');

var node = module.exports = require('./../index.js');

var PlayerList = node.PlayerList,
	Player = node.Player,
	GameDB = node.GameDB,
	GameState = node.GameState;

var Stager = require('./../lib/core/Stager').Stager;

var test_gs = null,
	gs_321 = new GameState({
		state: 3,
		step: 2,
		round: 1,
	}),
	gs_331 = new GameState({
		state: 3,
		step: 3,
		round: 1,
	}),
	gs_311 = new GameState({
		state: 3,
		step: 1,
		round: 1,
	}),
	gs_111 = new GameState({
		state: 1,
		step: 1,
		round: 1,
	});


var creation 	= { cb: function(){}, name: 'Creation' };
var evaluation 	= { cb: function(){}, name: 'Evaluation' };
var exhibition 	= { cb: function(){}, name: 'Exhibition' };

var game = {
		name: 'game',
		steps: [creation, evaluation, exhibition],
		rounds: 10
};


var stages = [
		{
			name: 'Game will start soon',
			cb: function(){},
		},
		
		{
			cb: function(){},
			name: 'Instructions'
		},
		
		game, 
		
		{
			cb: function(){},
			name: 'Questionnaire'
		},
		
		{
			cb: function(){},
			name: 'Thank you!'
		}
];	


var stager, test_stager;

describe('Stager', function() {
	
	describe('empty #constructor()', function() {
		before(function(){
			stager = new Stager();
		});
		it('should result in a game stages of length 0', function() {
			stager.size().should.be.equal(0); 
		});
	});
	
	describe('#constructor()', function() {
		before(function(){
			stager = new Stager(stages);
		});
		it('should result in a game stages of length 35', function() {
			stager.size().should.be.equal(35); // 34 + 0.0.0
		});
	});
	
//	describe('#next()', function() {
//		it('should return 1.1.1', function() {
////			console.log(node.game.state)
////			console.log(stager.next())
//			GameState.compare(stager.next(),'1.1.1').should.be.equal(0); 
//		});
//		it('should return 2.1.1', function() {
//			GameState.compare(stager.next('1.1.1'),'2.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1', function() {
//			GameState.compare(stager.next('2.1.1'),'3.1.1').should.be.equal(0); 
//		});
//		it('should return 3.2.1', function() {
//			GameState.compare(stager.next('3.1.1'),'3.2.1').should.be.equal(0); 
//		});
//		it('should return 3.3.1', function() {
//			GameState.compare(stager.next('3.2.1'),'3.3.1').should.be.equal(0); 
//		});
//		it('should return 3.1.2', function() {
//			GameState.compare(stager.next('3.3.1'),'3.1.2').should.be.equal(0); 
//		});
//		
//		it('should return false when reached the end of the stages', function() {
//			stager.next('5.1.1').should.be.false; 
//		});
//	});
//	
//	describe('#previous()', function() {
//		it('should return 1.1.1', function() {
//			GameState.compare(stager.previous('2.1.1'),'1.1.1').should.be.equal(0); 
//		});
//		it('should return 2.1.1', function() {
//			GameState.compare(stager.previous('3.1.1'),'2.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1', function() {
//			GameState.compare(stager.previous('3.2.1'),'3.1.1').should.be.equal(0); 
//		});
//		it('should return 3.2.1', function() {
//			GameState.compare(stager.previous('3.3.1'),'3.2.1').should.be.equal(0); 
//		});
//		it('should return 3.3.1', function() {
//			GameState.compare(stager.previous('3.1.2'),'3.3.1').should.be.equal(0); 
//		});
//		
//		it('should return false at the beginning of the stages', function() {
//			stager.previous('1.1.1').should.be.false; 
//		});
//	});
//	
//	describe('#jumpTo() forward', function() {
//		it('should return 2.1.1', function() {
//			GameState.compare(stager.jumpTo('1.1.1', 1), '2.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1', function() {
//			GameState.compare(stager.jumpTo('3.1.1', 1), '3.2.1').should.be.equal(0); 
//		});
//		it('should return 3.2.1', function() {
//			GameState.compare(stager.jumpTo('3.3.1', 1), '3.1.2').should.be.equal(0); 
//		});
//		it('should return 3.3.1', function() {
//			GameState.compare(stager.jumpTo('3.1.1', 2), '3.3.1').should.be.equal(0); 
//		});
//		it('should return 3.3.1', function() {
//			GameState.compare(stager.jumpTo('3.1.1', 5), '3.3.2').should.be.equal(0); 
//		});
//		it('should return false at the beginning of the stages', function() {
//			stager.jumpTo('5.1.1',1).should.be.false; 
//		});
//	});
//	
//	describe('#jumpTo() backward', function() {
//		it('should return 1.1.1 (jump -1)', function() {
//			GameState.compare(stager.jumpTo('2.1.1', -1), '1.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1 (jump -1)', function() {
//			GameState.compare(stager.jumpTo('3.2.1', -1), '3.1.1').should.be.equal(0); 
//		});
//		it('should return 3.3.1 (jump -1)', function() {
//			GameState.compare(stager.jumpTo('3.1.2', -1), '3.3.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1 (jump -2)', function() {
//			GameState.compare(stager.jumpTo('3.3.1', -2), '3.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1 (jump -5)', function() {
//			GameState.compare(stager.jumpTo('3.3.2', -5), '3.1.1').should.be.equal(0); 
//		});
//		it('should return false at the beginning of the stages', function() {
//			stager.jumpTo('1.1.1',-1).should.be.false; 
//		});
//		
//	});
	
//	describe('cleanup operations for testing on travis-ci', function() {
//		before(function(){
//			console.log('--------')
//			console.log(node.game.state);
////			node.game.state = new GameState();
//		});
//		it('testing for travis-ci', function() {
//			console.log(node.game.state)
//		})
//	});
});