"use strict";

var util = require('util');
var should = require('should');

var log = console.log;

var ngc = module.exports.node = require('../index.js');
var GameStage = ngc.GameStage;
var J = ngc.JSUS;

var PlayerList = ngc.PlayerList;
var Player = ngc.Player;
var GameDB = ngc.GameDB;


var gs321 = new GameStage({
    stage: 3,
    step: 2,
    round: 1
});
var gs331 = new GameStage({
    stage: 3,
    step: 3,
    round: 1
});
var gs311 = new GameStage({
    stage: 3,
    step: 1,
    round: 1
});
var gs111 = new GameStage({
    stage: 1,
    step: 1,
    round: 1
});

var db, tmp, node;
var out;

// Check if pl2 == pl1
function samePlayer(pl1, pl2) {
    pl2.should.exist;
    pl2.name.should.equal(pl1.name);
    pl2.id.should.equal(pl1.id);
}

describe('GameDB', function() {

    describe('#constructor', function() {
        before(function(){
            db = new GameDB();
        });
        it('should be of size 0', function() {
            db.size().should.equal(0);
        });
        it('should have default hash player', function() {
            db.player.should.exist;
        });
        it('should have default hash stage', function() {
            db.stage.should.exist;
        });
    });

    describe('#add()', function() {
        before(function(){
            tmp = Date.now();
            db.add({
                player: '1',
                stage: J.clone(gs111),
                data: 1
            });
        });
        it('should add one item into db', function() {
            db.size().should.equal(1);
        });
        it('should add timestamp automatically', function() {
            var item = db.db[0];
            item.timestamp.should.be.within(tmp, Date.now());
            tmp = null;
        });
        it('should add another item into db', function() {
            db.add({
                player: '2',
                stage: J.clone(gs111),
                data: 2
            });
            db.size().should.equal(2);
        });


        it('should update player hash', function() {
            db.player['1'].size().should.eql(1);
            db.player['2'].size().should.eql(1);
        });

        it('should update stage hash', function() {
            db.stage['1.1.1'].size().should.eql(2);
        });
    });

    describe('#add() should fail if', function() {

        it('argument is missing', function() {
            (function() {
                db.add();
            }).should.throw();
        });

        it('object has no stage property', function() {
            (function() {
                db.add({
                    player: '1',
                    data: 1
                });
            }).should.throw();
        });

        it('object has non-object stage property', function() {
            (function() {
                db.add({
                    player: '1',
                    data: 1,
                    stage: 1
                });
            }).should.throw();
        });

        it('object has no player property', function() {
            (function() {
                db.add({
                    data: 1,
                    stage: '1'
                });
            }).should.throw();
        });

        it('object has non-string player property', function() {
            (function() {
                db.add({
                    player: 1,
                    data: 1,
                    stage: '1'
                });
            }).should.throw();
        });
    });


    describe('#constructor (as in Game.js)', function() {
        before(function() {
            var stager = ngc.getStager();
            node = ngc.getClient();
            stager
                .next('first')
                .next('second')
                .next({
                    id: 'third',
                    steps: ['a', 'b', 'c']
                });
            node.setup('plot', stager.getState());
            db = new GameDB({
                log: node.log,
                logCtx: node,
                shared: { node: node }
            });
        });

        it('should keep reference of node', function() {
            db.node.should.eql(node);
        });

        it('should allow to search stage hash by stage name', function() {
            var res, clone;
            db.add({
                player: '1',
                data: 1,
                stage: gs111
            });
            clone = J.clone(db.db[0]);
            res = db.select('stage', '=', 'first').first();
            res.stage.should.eql(new GameStage('1.1.1'));
            res.should.eql(clone);
        });

        it('should allow to search stage hash by stage.step name', function() {
            var res, clone;
            db.add({
                player: '1',
                data: 1,
                stage: gs331
            });
            clone = J.clone(db.db[1]);
            res = db.select('stage', '=', 'third.c').first();
            res.stage.should.eql(new GameStage('3.3.1'));
            res.should.eql(clone);
        });

        it('should allow to search stage hash by stage.step.round', function() {
            var res, clone;
            clone = J.clone(db.db[1]);
            res = db.select('stage', '=', 'third.c.1').first();
            res.stage.should.eql(new GameStage('3.3.1'));
            res.should.eql(clone);
        });

        it('should not find anything when it should not 1', function() {
            var res, clone;
            clone = J.clone(db.db[1]);
            res = db.select('stage', '=', 'third.c.3').fetch();
            res.should.eql([]);
        });

        it('should not find anything when it should not 2', function() {
            var res, clone;
            clone = J.clone(db.db[1]);
            res = db.select('stage', '=', 'third.a').fetch();
            res.should.eql([]);
        });
    });

    describe('#on("insert")', function() {
        before(function() {
            db = new GameDB();
            out = [];
            db.on('insert', function(o) {
                out.push(o);
            });
            db.add({
                player: '1',
                data: 'mydata',
                stage: gs111
            });
        });
        it('should call listener only once per insert, i.e. not on hashes',
           function() {
               out.length.should.eql(1);
           });
    });

});
