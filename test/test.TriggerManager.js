//var util = require('util'),
//should = require('should');
//
//var node = module.exports.node = require('./../index.js');
//
//var TriggerManager = node.TriggerManager;
//
//var test_db;
//
//// Check if pl2 == pl1
//function func1(e) {
//    if (e.a != 1) {
//	e.a = 1;
//    }
//};
//
//function func2(e) {
//    if (e.a != 2) {
//	e.a = 2;
//    }
//};
//
//function func3(e) {
//    if (e.a != 3) {
//	e.a = 3;
//    }
//};
//
//var triggers = [func1, func2, func3];
//
//var tm;
//var tm2;
//
//describe('TriggerManager', function() {
//
//    describe('#constructor. ', function() {
//	describe('A newly created instance ', function() {
//	    before(function(){
//		tm = new TriggerManager();
//	    });
//	    it('should have property length = 0', function() {
//		tm.length.should.equal(0);
//	    });
//	    it('should have property returnAt = first', function() {
//		tm.returnAt.should.equal(TriggerManager.first);
//	    });
//	    it('should have property triggers of type Array', function() {
//		tm.triggers.should.exist;
//		tm.triggers.should.be.an.instanceOf(Array)
//	    });
//	});
//	describe('A newly created instance with configuration object ', function() {
//	    before(function(){
//		tm = new TriggerManager({
//		    triggers: triggers,
//		    returnAt: TriggerManager.last,
//		});
//	    });
//	    it('should have property length = ' + triggers.length, function() {
//		tm.length.should.equal(triggers.length);
//	    });
//	    it('should have property returnAt = last', function() {
//		tm.returnAt.should.equal(TriggerManager.last);
//	    });
//	    it('should have property triggers of type Array', function() {
//		tm.triggers.should.exist;
//		tm.triggers.should.be.an.instanceOf(Array)
//	    });
//	});
//    });
//
//    describe('#second instance should not clash with the first. ', function() {
//	describe('A newly created instance ', function() {
//	    before(function(){
//		tm2 = new TriggerManager();
//	    });
//	    it('should have property length = ' + triggers.length, function() {
//		tm.length.should.equal(triggers.length);
//	    });
//	    it('should have property returnAt = last', function() {
//		tm.returnAt.should.equal(TriggerManager.last);
//	    });
//	    it('should have property triggers of type Array', function() {
//		tm.triggers.should.exist;
//		tm.triggers.should.be.an.instanceOf(Array)
//	    });
//	});
//    });
//
//});
