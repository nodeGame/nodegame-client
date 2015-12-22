var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var EventEmitterManager = ngc.EventEmitterManager;
var J = ngc.JSUS;

var eem, node, result, tmp;

result = {};
tmp = {};

describe('EventEmitterManager', function() {

    describe('#constructor', function() {
        before(function() {
            node = ngc.getClient();
            eem =  new EventEmitterManager(node);
        });

        it('should create the 4 event emitters', function() {
            eem.ng.should.exist;
            eem.game.should.exist;
            eem.stage.should.exist;
            eem.step.should.exist;
        });

        it('should create the ee object', function() {
            eem.ee.ng.should.exist;
            eem.ee.game.should.exist;
            eem.ee.stage.should.exist;
            eem.ee.step.should.exist;
        });

    });

    describe('#setRecordChanges true', function() {
        it('should activate recording changes', function() {
            var out = eem.setRecordChanges(true);
            out.ng.should.eql(true);
            out.game.should.eql(true);
            out.stage.should.eql(true);
            out.step.should.eql(true);
        });
    });


    describe('#emit', function() {
        before(function() {
            tmp.funcAng =  function(a,b,c,d) {
                result.A = ['ng'];
                return 1 + (a || 0);
            };
            eem.ng.on('A', tmp.funcAng);

            tmp.funcAgame =  function(a,b,c,d) {
                result.A.push('game');
                return 1 + (a || 0) + (b || 0);
            };
            eem.ng.on('A', tmp.funcAgame);

            tmp.funcAstage =  function(a,b,c,d) {
                result.A.push('stage');
                return 1 + (a || 0) + (b || 0) + (c || 0);
            };
            eem.ng.on('A', tmp.funcAstage);

            tmp.funcAstep =  function(a,b,c,d) {
                result.A.push('step');
                return 1 + (a || 0) + (b || 0) + (c || 0) + (d || 0);
            };
            eem.ng.on('A', tmp.funcAstep);

            result.emit = eem.emit('A');
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([1, 1, 1, 1]);
        });
    });

    describe('#emit 1 parameter', function() {
        before(function() {
            result.A = undefined;
            result.emit = eem.emit('A', 1);
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([2, 2, 2, 2]);
        });
    });

    describe('#emit 2 parameters', function() {
        before(function() {
            result.A = undefined;
            result.emit = eem.emit('A', 1, 2);
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([2, 4, 4, 4]);
        });
    });

    describe('#emit 3 parameters', function() {
        before(function() {
            result.A = undefined;
            result.emit = eem.emit('A', 1, 2, 3);
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([2, 4, 7, 7]);
        });
    });

    describe('#emit 4 parameters', function() {
        before(function() {
            result.A = undefined;
            result.emit = eem.emit('A', 1, 2, 3, 4);
        });
        it('should emit on all event emitters', function() {
            result.A.should.be.Array();
            result.A.length.should.eql(4);
        });
        it('should emit on all event emitters in the right order', function() {
            result.A.should.eql(['ng', 'game', 'stage', 'step']);
        });
        it('should return the return values', function() {
            result.emit.should.eql([2, 4, 7, 11]);
        });
    });

    describe('#emitAsync', function() {
        it('should emit events asynchronously on all event emitters',
           function(done) {
               var a, b, complete;
               b = [];
               complete = function(who) {
                   b.push(who);
                   if (b.length === 4) {
                       b.should.eql(['ng', 'game', 'stage', 'step']);
                       done();
                   }
               };
               eem.stage.on('D', function(value) {
                   a.should.be.eql(1);
                   value.should.be.true;
                   complete('stage');
               });
               eem.step.on('D', function(value) {
                   a.should.be.eql(1);
                   value.should.be.true;
                   complete('step');
               });
               eem.game.on('D', function(value) {
                   a.should.be.eql(1);
                   value.should.be.true;
                   complete('game');
               });
               eem.ng.on('D', function(value) {
                   a.should.be.eql(1);
                   value.should.be.true;
                   complete('ng');
               });
               eem.emitAsync('D', true);
               a = 1;
           });
    });

});



// Helper function!
///////////////////
