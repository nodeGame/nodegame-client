var util = require('util'),
	should = require('should');



var node = module.exports.node = require('./../index.js');

//console.log(node);

var GameState = node.GameState;


var state = new GameState({
	state: 3,
	step: 2,
	round: 1,
	is: 50, // playing
	paused: false,
});

var hash = null;

describe('GameState', function() {
	
	
	describe('#toHash()', function() {
		
		it("'S.s.r.i.p' should be equal '3.2.1.50.0'", function() {
			state.toHash('S.s.r.i.p').should.be.eql('3.2.1.50.0');
		});
		
		it("'Ss(r)' should be equal '32(1)'", function() {
			state.toHash('Ss(r)').should.be.eql('32(1)');
		});
		
	});
	
});