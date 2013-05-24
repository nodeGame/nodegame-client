//var util = require('util'),
//	should = require('should');
//
//
//
//var node = module.exports.node = require('./../index.js');
//
////console.log(node);
//
//var GameState = node.GameState;
//
//var stateLiteral = {
//	state: 3,
//	step: 2,
//	round: 1,
//	is: 50, // PLAYING
//	paused: false,
//};
//
//var state = new GameState(stateLiteral);
//
//var state0literal = {
//	state: 0,
//	step: 0,
//	round: 0,
//	is: 0, // UNKKNOWN
//	paused: false,
//};
//
//var state0 = new GameState(state0literal);
//
//var hash = null;
//
//describe('GameState', function() {
//	
//	describe('Constructor: ', function() {
//		
//		it("new GameState('3.2.1.50.0')", function() {
//			new GameState('3.2.1.50.0').should.be.eql(state);
//		});
//		
//		it("new GameState('3.2')", function() {
//			new GameState('3.2').should.be.eql(new GameState({
//				state: 3,
//				step: 2,
//			}));
//		});
//		
//		it("new GameState()", function() {
//			new GameState().should.be.eql(state0);
//		});
//		
//		it("new GameState()", function() {
//			new GameState().should.be.eql(state0literal);
//		});
//		
//		it("new GameState()", function() {
//			new GameState().should.be.eql(state0literal);
//		});
//		
//		it("new GameState({state: 3, step: 2, round: 1, is: 50, paused: false})", function() {
//			new GameState({
//				state: 3,
//				step: 2,
//				round: 1,
//				is: 50, // PLAYING
//				paused: false,
//			}).should.be.eql(state);
//		});
//	});
//	
//	describe('#toHash()', function() {
//		
//		it("'S.s.r.i.p' should be equal '3.2.1.50.0'", function() {
//			state.toHash('S.s.r.i.p').should.be.eql('3.2.1.50.0');
//		});
//		
//		it("'Ss(r)' should be equal '32(1)'", function() {
//			state.toHash('Ss(r)').should.be.eql('32(1)');
//		});
//		
//	});
//	
//	describe('GameState.compare()', function() {
//		
//		it("a GameState object should be equal to itself'", function() {
//			GameState.compare(state, state).should.be.eql(0);
//		});
//		
//		it("a GameState object should be equal to its counterpart object literal'", function() {
//			GameState.compare(state, stateLiteral).should.be.eql(0);
//		});
//
//		it("a GameState hash-string should be equal to its counterpart object literal'", function() {
//			GameState.compare('3.2.1.50.0', stateLiteral).should.be.eql(0);
//		});
//		
//		it("a GameState hash-string should be equal to its counterpart object literal'", function() {
//			GameState.compare(stateLiteral, '3.2.1.50.0').should.be.eql(0);
//		});
//		
//		it("a GameState hash-string should be equal to its counterpart GameState object'", function() {
//			GameState.compare(state, '3.2.1.50.0').should.be.eql(0);
//		});
//		
//		it("a GameState hash-string should be equal to its counterpart GameState object'", function() {
//			GameState.compare('3.2.1.50.0', state).should.be.eql(0);
//		});
//		
//		it("comparing nothing should return 0'", function() {
//			GameState.compare().should.be.eql(0);
//		});
//		
//		it("comparing a gamestate to nothing should return 1'", function() {
//			GameState.compare(state).should.be.eql(1);
//		});
//		
//		it("comparing a gamestate to nothing should return 1'", function() {
//			GameState.compare(state, null).should.be.eql(1);
//		});
//		
//		it("comparing a gamestate to nothing should return 1'", function() {
//			GameState.compare(state, undefined).should.be.eql(1);
//		});
//		
//		it("comparing nothing to gamestate should return -1'", function() {
//			GameState.compare(undefined, state).should.be.eql(-1);
//		});
//		
//		it("comparing nothing to gamestate should return -1'", function() {
//			GameState.compare(null, state).should.be.eql(-1);
//		});
//		
//		it("a GameState hash-string should be ahead to its counterpart GameState object'", function() {
//			GameState.compare('3.3.1.50.0', state).should.be.eql(1);
//		});
//		
//		it("a GameState hash-string should be ahead to its counterpart GameState object'", function() {
//			GameState.compare('4.2.1.50.0', state).should.be.eql(1);
//		});
//		
//		it("a GameState hash-string should be ahead to its counterpart GameState object'", function() {
//			GameState.compare('3.2.2.50.0', state).should.be.eql(1);
//		});
//		
//		it("being paused does not matter'", function() {
//			GameState.compare('3.2.1.50.1', state).should.be.eql(0);
//		});
//		
//		it("a GameState hash-string should be ahead to its counterpart GameState object'", function() {
//			GameState.compare(state, '3.3.1.50.0').should.be.eql(-1);
//		});
//		
//		it("a GameState hash-string should be ahead to its counterpart GameState object'", function() {
//			GameState.compare(state, '4.2.1.50.0').should.be.eql(-1);
//		});
//		
//		it("a GameState hash-string should be ahead to its counterpart GameState object'", function() {
//			GameState.compare(state, '3.2.2.50.0').should.be.eql(-1);
//		});
//		
//		it("being paused does not matter'", function() {
//			GameState.compare(state, '3.2.1.50.1').should.be.eql(0);
//		});
//		
//		it("a GameState should be ahead of the empty GameState'", function() {
//			GameState.compare(state, state0).should.be.above(0);
//		});
//		
//		it("strict comparison should take account of the load level'", function() {
//			GameState.compare(new GameState({
//				state: 3,
//				step: 2,
//				round: 1,
//				is: 100, // DONE
//				paused: false,
//			}), state, true).should.be.above(0);
//		});
//		
//		it("strict comparison should take account of the load level'", function() {
//			GameState.compare(new GameState('3.2.1.100.0'), state, true).should.be.above(0);
//		});
//		
//	});
//	
//	
//	
//});
