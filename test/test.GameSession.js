var util = require('util'),
	should = require('should');



var node = module.exports.node = require('./../index.js');

//console.log(node);

var GameState = node.GameState;
var GameSession = node.GameSession;
var SessionManager = GameSession.SessionManager;
var J = node.JSUS;

var stateLiteral = {
	state: 3,
	step: 2,
	round: 1,
	is: 50, // PLAYING
	paused: false,
};

var myObj = {
		a: 1,
		b: 2,
		c: { a: 2, c: 3}
};

var state = new GameState(stateLiteral);


var session, manager, test1, test2;

describe('SessionManager', function() {
	before(function(){
		manager = new SessionManager();
		
		node.game.myVar = 10;
		node.game.myObj = myObj;
		
	});
	
	describe('#register() - #get()', function() {
		it("should register a primitive type", function() {
			manager.register('game.myVar');
			manager.get('game.myVar').should.be.equal(10);
		});
		
		it("should register an object", function() {
			manager.register('game.myObj');
			manager.get('game.myObj').should.be.equal(myObj);
		});
		
		it("get() all", function() {
			manager.get().should.be.eql({
				'game.myVar': 10,
				'game.myObj': myObj
			});
		});
	});
	
	describe('#delete()', function() {
		before(function(){
			test1 = manager.unregister('game.myVar');
			test2 = manager.unregister('game.myVarNotExisting');
		});
		it("should delete a variable from the manager", function() {
			should.strictEqual(manager.get('game.myVar'), undefined);
		});
		
		it("should return true upon deletion", function() {
			test1.should.be.true;
		});
		it("should return false if deletion fails", function() {
			test2.should.be.false;
		});
	});
	
	describe('Import / Export', function() {
		before(function(){
			test1 = null;
			test2 = null;
		});
		it("#save()", function() {
			test1 = manager.save();
			//test1.should.be.equal(manager.session);
		});
		
		it("#clear()", function() {
			manager.clear();
			J.isEmpty(manager.session).should.be.true;
		});
		
		it("#load()", function() {
			manager.load(test1);
			manager.session.should.be.eql(test1);
		});
		
	});
	
	describe('#restore()', function() {
		before(function(){
			test1 = manager.save();
			console.log(test1)
			
//			delete node.game.myObj;
//			manager.restore(test1);
		});
		it("should restore objects in the session", function() {
			console.log(test1);
		});
		
//		it("should restore objects in the session", function() {
//			node.game.myObj.should.be.eql(myObj);
//		});
	});
	
});

describe('GameSession', function() {
	
	
});
