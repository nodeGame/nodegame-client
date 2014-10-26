//var util = require('util'),
//	fs = require('fs'),
//	path = require('path'),
//	should = require('should'),
//	csv = require('ya-csv'),
//	J = require('JSUS').JSUS;
//
//
//var node = module.exports.node = require('./../index.js');
//
//node.verbosity = 10;
//node.game = new node.Game();
//node.game.init = function(){};
//
//var check1 = 0,
//	check2 = 0,
//	check3 = 0;
//
//
//var func1 = function() {
//	check1 = 1;
//};
//var func2 = function() {
//	check2 = 2;
//};
//var func3 = function(x) {
//	this.b = x;
//};
//
//function MyClass () {
//	this.a = 'a';
//	this.b = 'b';
//}
//
//var myClass = new MyClass();
//
//describe('#node.setup', function() {
//	before(function(){
//
//		node.setup('nodegame', {
//			env: {
//				auto: true,
//				debug: false,
//			},
//			socket: {
//
//			}
//		});
//
//	});
//
//	it("should setup glob", function() {
//		//console.log(node.env);
//		node.env('auto', func1);
//		check1.should.be.eql(1);
//	});
//});
//
//describe('#node.env', function() {
//
//	it("node.env('auto') should run the function", function() {
//		//console.log(node.env);
//		node.env('auto', func1);
//		check1.should.be.eql(1);
//	});
//	it("node.env('debug') should NOT run the function", function() {
//		node.env('debug', func2);
//		check2.should.be.eql(0);
//	});
//	it("node.env('foo') should NOT run the function", function() {
//		node.env('foo', func2);
//		check2.should.be.eql(0);
//	});
//	it("node.env('auto', func, ctx) should run the function with a special context", function() {
//		//console.log(node.env);
//		node.env('auto', function(){
//			this.b = 'bb';
//		}, myClass);
//		myClass.b.should.be.eql('bb');
//	});
//	it("node.env('auto', func, ctx, params) should run the function with a special context", function() {
//		//console.log(node.env);
//		node.env('auto', func3, myClass, ['??']);
//		myClass.b.should.be.eql('??');
//	});
//});
