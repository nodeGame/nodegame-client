// var util = require('util'),
// should = require('should');
//
// var ngc = module.exports.node = require('./../index.js');
//
// //console.log(node);
//
// var PlayerList = ngc.PlayerList;
// var Player = ngc.Player;
//
// var nodeclient = ngc.getClient();
//
// var test_player = null,
// player = new Player ({
//     id: 1,
//     sid: 1,
//     count: 1,
//     name: 'Ste',
//     stage: {stage: 1, step: 1, round: 1},
//     stageLevel: 100, // DONE
//     ip:      '1.2.3.4',
// }),
// player2 = new Player ({
//     id: 2,
//     sid: 2,
//     count: 2,
//     name: 'Ste2',
//     stage: {stage: 1, step: 1, round: 1},
//     stageLevel: 100, // DONE
//     ip:      '1.2.3.5',
// }),
// player3 = new Player ({
//     id: 3,
//     sid: 3,
//     count: 3,
//     name: 'Ste3',
//     stage: {stage: 1, step: 1, round: 2},
//     stageLevel: 100,
//     ip:      '1.2.3.6',
// }),
// player4 = new Player ({
//     id: 4,
//     sid: 4,
//     count: 4,
//     name: 'Ste4',
//     stage: {stage: 1, step: 2, round: 1},
//     stageLevel: 100,
//     ip:      '1.2.3.7',
// });
// player5 = new Player ({
//     id: 4,
//     sid: 4,
//     count: 4,
//     name: 'Ste4',
//     stage: {stage: 1, step: 1, round: 1},
//     stageLevel: 50, // PLAYING
//     ip:      '1.2.3.7',
// });
// player6 = new Player ({
//     id: 4,
//     sid: 4,
//     count: 4,
//     name: 'Ste4',
//     stage: {stage: 3, step: 1, round: 1},
//     stageLevel: 50, // PLAYING
//     ip:      '1.2.3.7',
// });
//
// // If updated, updates the tests.
// var plDB = [player, player2, player3, player4];
//
// // The playerList object.
// var pl;
//
// // Check if pl2 == pl1
// function samePlayer(pl1, pl2) {
//     pl2.should.exist;
//     pl2.name.should.equal(pl1.name);
//     pl2.id.should.equal(pl1.id);
// };
//
// function myLog(a) {
//     this.a = 'A';
// }
//
// myLog.prototype.log = function(a) {
//     return 'A' + a;
// };
//
// describe('PlayerList', function() {
//
//     describe('#constructor', function() {
//      it('with no parameters: player list length 0', function() {
//             pl = new PlayerList();
//          pl.size().should.equal(0);
//      });
//         it('with a list of players: player list length 4', function() {
//             pl = new PlayerList(null, plDB);
//          pl.size().should.equal(plDB.length);
//      });
//         it('with no parameters: should have the id index', function() {
//             pl = new PlayerList();
//          ('undefined' !== typeof pl.id).should.be.true;
//      });
//      it('with list of players: should have for elements in the ID index',
//          function() {
//             pl = new PlayerList(null, plDB);
//             pl.rebuildIndexes();
//          pl.id.size().should.equal(plDB.length);
//      });
//         it('with a log function: should use the log function', function() {
//             var log = new myLog();
//             pl = new PlayerList({
//                 log: log.log
//             });
//             pl.log('A').should.equal('AA');
//      });
//         it('with an index function: should use the index function',
//             function() {
//             pl = new PlayerList({
//                 I: {
//                     myIdx: function(o) {
//                     return o.count > 100 ? o.id : undefined; }
//                 }
//             });
//             ('undefined' !== typeof pl.myIdx).should.be.true;
//      });
//     });
//
//     describe('#view initializations', function() {
//      it('outside view 1', function() {
//             var pl1, pl2,
//             outsideView1, outsideView2;
//
//             pl1 = new PlayerList({ V:
//                                { myView : function(o) { return o.id; } } });
//             outsideView1 = pl1.myView;
//          pl1.add({ id: 1 });
//
//             pl2 = new PlayerList({ V: {
//                                   myView : function(o) { return o.id; } } });
//             outsideView2 = pl2.myView;
//          pl2.add({ id: 2 });
//
//             outsideView1.db.should.not.equal(outsideView2.db);
//      });
//      it('outside view 2', function() {
//             var outsideView;
//
//             pl = new PlayerList({ V: {
//                                   myView: function(o) { return o.id; } } });
//             outsideView = pl.myView;
//          pl.add({ id: 1 });
//
//             outsideView.db.should.equal(pl.myView.db);
//      });
//     });
//
//     describe('#get()', function() {
//      before(function() {
//             pl = new PlayerList();
//          pl.add(player);
//             test_player = pl.id.get(player.id);
//      });
//      it('should return the player we have inserted before', function() {
//          samePlayer(player, test_player);
//      });
//
//     });
//
//     describe('#pop()', function() {
//      before(function() {
//          test_player = pl.id.pop(player.id);
//      });
//
//      it('should return a player object', function() {
//          test_player.should.exists;
//      });
//
//      it('should return the player we have inserted before', function() {
//          samePlayer(player, test_player);
//      });
//
//      it('should remove the player we have inserted before', function() {
//          pl.size().should.equal(0);
//      });
//     });
//
//     describe('#getRandom()', function() {
//      before(function(){
//          pl.add(player);
//          pl.add(player2);
//          pl.add(player3);
//          pl.add(player4);
//      });
//
//      it('should return one random player', function() {
//          var r = pl.getRandom();
//          ('undefined' !== typeof r.name).should.be.true;
//          r.should.be.a('object');
//          [player,player2,player3,player4].should.include(r);
//
//      });
//
//      it('should return two random players', function() {
//          var set = pl.getRandom(2);
//          set.length.should.equal(2);
//      });
//     });
//
//     describe('#arePlayersSync()', function() {
//      before(function(){
//          pl = new PlayerList();
//             pl.add(player);
//          pl.add(player2);
//      });
//
//      it('should sync on same stage 1.1.1', function() {
//          pl.arePlayersSync('1.1.1').should.be.true;
//      });
//         it('should sync on same stage 1.1.1 and stageLevel DONE',
// function() {
//          pl.arePlayersSync('1.1.1', 100).should.be.true;
//      });
//         it('should sync on same stage 1.1.1', function() {
//             pl.add(player5);
//          pl.arePlayersSync('1.1.1').should.be.true;
//      });
//         it('players should NOT be sync on same stage 1.1.1 and DONE',
// function() {
//          pl.arePlayersSync('1.1.1', 100).should.be.false;
//      });
//         it('should sync on same stage 1.1.1, ' +
//            'ignore stageLevel and outliers', function() {
//
//             pl.add(player3);
//         pl.arePlayersSync('1.1.1', undefined, 'STAGE', false).should.be.true;
//      });
//         it('should sync on same stage 1.1.1, ignore outliers',
//         function() {
//             pl.id.pop(player5.id);
//          pl.arePlayersSync('1.1.1', 100, 'STAGE', false).should.be.true;
//      });
//         it('should sync up to 1.1.1 and DONE, ignore outliers',
// function() {
//             pl.arePlayersSync('1.1.1', 100, 'STAGE_UPTO', false)
// .should.be.true;
//      });
//         it('should sync up to 1.1.2, ignore stageLevel and outliers',
//         function() {
//             pl.arePlayersSync('1.1.2', undefined, 'STAGE_UPTO', false)
//             .should.be.false;
//      });
//         it('players should NOT be sync up to 1.1.2, ignore stageLevel',
//         function() {
//             pl.arePlayersSync('1.1.2', undefined, 'STAGE_UPTO')
//             .should.be.false;
//      });
//         it('should sync up to 1.1.1, ignore stageLevel and outliers',
//         function() {
//             pl.add(player6);
//             pl.arePlayersSync('1.1.1', undefined, 'STAGE_UPTO', false)
//             .should.be.true;
//      });
//         it('should sync up to 1.1.1, ignore outliers', function() {
//             pl.arePlayersSync('1.1.1', 50, 'STAGE_UPTO', false)
//             .should.be.false;
//      });
//         it('should sync up to 1.1.1, ignore stageLevel', function() {
//             pl.arePlayersSync('1.1.1', undefined, 'STAGE_UPTO')
//             .should.be.false;
//      });
//     });
//     describe('#isStepDone()', function() {
//      before(function(){
//          pl = new PlayerList();
//             pl.add(player);
//          pl.add(player2);
//      });
//
//      it('players should be DONE exactly on stage 1.1.1', function() {
//          pl.isStepDone('1.1.1').should.be.true;
//      });
//         it('players should NOT be DONE exactly on stage 1.1.1', function() {
//          pl.add(player3);
//             pl.isStepDone('1.1.1').should.be.false;
//      });
//         it('players should be DONE on stage 1 (in different steps allowed)',
//            function() {
//             pl.isStepDone('1.1.1', 'STAGE').should.be.true;
//      });
//     });
//
//
// });
