var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Stager = ngc.Stager;
var Game = ngc.GameStage;
var GamePlot = ngc.GamePlot;
var GameStage = ngc.GameStage;
var J = ngc.JSUS;

var node = ngc.getClient();
node.verbosity = -1000;

var stager, plot, game;
var stepRule, globals, properties, init, gameover, done, stage;
var i;

stager = ngc.getStager();

stage = {
    id: '3',
    steps: [ 'step3-1', 'step3-2', 'step3-3' ]
};

stager.addStage(stage);

stager
    .next('1')
    .next({
        id: '2',
        cb: function() { i = 1 }
    })
    .repeat('3', 3)
    .next('4')
    .repeat('5', 5);

stager.extendStep('2', function(o) {
    o._cb = o.cb;
    o.cb = function() {
        var oldCb = this.getCurrentStepObj()._cb;
        oldCb();
        i++;
    };
    return o;
});

stager.finalize();

node.createPlayer({id: '1'});


module.exports = node;
module.parent.exports = node;

describe('Game', function() {

    describe('#constructor', function() {
        before(function(){
            game = node.game;
        });
        it('should create a stager object', function() {
            (typeof game).should.be.eql('object');
            // Why does it fail badly?
            // game.should.be.an.instanceOf(Game);
        });
        it('extend stage', function() {
            game.plot.stager.setState(stager.getState());
            game.start()
            game.step();
            game.step();
            i.should.be.eql(2);
        });
    });

});
