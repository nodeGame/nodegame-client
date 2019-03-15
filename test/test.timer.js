"use strict";

var util = require('util');
var should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Timer = ngc.Timer;
var GameTimer = require('../lib/core/Timer.js').GameTimer;
var J = ngc.JSUS;

var node = ngc.getClient();
node.verbosity = -1000;

var stager = ngc.getStager();

var result, tmp, tmp2;
var timer;

// Important! Don't change the order of the tests!

describe('Timer', function() {

    describe('#constructor', function() {
        before(function() {
            timer = new Timer(node);
            result = null;
        });

        it('should create a new instance of Timer', function() {
            timer.timers.should.eql({});
            timer.timestamps.should.eql({});
        });

    });

    // GameTimers.

    describe('#createTimer', function() {
        before(function() {
            tmp = timer.createTimer();
            result = {};
            result.update = [];
        });

        it('should create a new instance of GameTimer', function() {
            tmp.should.be.an.instanceOf(GameTimer);
        });

        it('should store a reference in timers array', function() {
            J.size(timer.timers).should.eql(1);
            timer.timers[tmp.name].name.should.eql(tmp.name);
        });

        it('timer should execute update every x milliseconds, then call update',
           function(done) {
               tmp.init({
                   milliseconds: 600,
                   hooks: function() {
                       result.update.push(1);
                   },
                   update: 150,
                   timeup: function() {
                       result.timeup = true;
                   }
               });
               tmp.start();

               setTimeout(function() {
                   result.update.length.should.eql(4);
                   result.timeup.should.eql(true);
                   done();
               }, 1000);
        });
    });

   describe('#createTimer with pause', function() {
       before(function() {
           var state;
           node.createPlayer({ id: 'A', sid: 'AAAAAA' });
           state = stager.next('1').getState();
           node.game.plot.stager.setState(state);
           node.game.start();
           tmp = timer.createTimer();
           result.update2 = [];
           result.timeup2 = false;
           tmp.init({
               milliseconds: 1000,
               hooks: function() {
                   result.update2.push(1);
               },
               update: 150,
               timeup: function() {
                   result.timeup2 = true;
               }
           });
       });
       it('should not execute updates/timeup on pause', function(done) {
           tmp.start();
           setTimeout(function() {
               node.game.pause();
               result.update2.length.should.eql(3);
               result.timeup2.should.eql(false);
               done();
           }, 500);
       });
    });

   describe('#createTimer with resume', function() {
       before(function() {
           var state;
           node.game.stop();
           node.createPlayer({ id: 'A', sid: 'AAAAAA' });
           state = stager.getState()
           node.setup('plot', state);
           node.game.start();
           tmp = timer.createTimer();
           result = {};
           result.update3 = [];
           result.timeup3 = false;
           tmp.init({
               milliseconds: 1000,
               hooks: function() {
                   result.update3.push(1);
               },
               update: 300,
               timeup: function() {
                   result.timeup3 = true;
               }
           });
       });
       it('should not execute updates/timeup on pause, then do it on resume',
          function(done) {
              tmp.start();
              setTimeout(function() {
                  // 1 update.
                  node.game.pause();
                  setTimeout(function() {
                      // 0 updates.
                      node.game.resume();
                      setTimeout(function() {
                          // 1 updates
                          result.update3.length.should.eql(2);
                          result.timeup3.should.eql(false);
                          done();
                      }, 400);
                  }, 400);
              }, 400);
          });
    });

   describe('#destroyTimer', function() {
       before(function() {
           tmp2 = timer.createTimer();
           tmp2.init({
               milliseconds: 1000,
               hooks: function() {
                   result.update4.push(1);
               },
               update: 150,
               timeup: function() {
                   result.timeup4 = true;
               }
           });
           result.update4 = [];
           result.timeup4 = false;
           // Keep track of the number of listeners.
           result.listeners = node.events.size(true);
       });

       it('should not execute updates/timeup after destroy', function(done2) {
           tmp2.start();
           setTimeout(function() {
               // 3 updates.
               timer.destroyTimer(tmp2.name);
               setTimeout(function() {
                   result.update4.length.should.eql(3);
                   result.timeup4.should.eql(false);
                   done2();
               }, 350);
           }, 500);
       });

       it('should remove listeners after destroy', function() {
           node.events.size(true).should.eql(result.listeners -2);
       });
   });

    describe('#syncWithStager', function() {
       before(function() {
           tmp2 = timer.createTimer();
           result.listeners2 = node.events.size(true);
           tmp2.syncWithStager(true);
       });

       it('should add 2 more listeners', function() {
           node.events.size(true).should.eql(result.listeners2 + 2);
       });

   });

   describe('#destroyAllTimers', function() {
       before(function() {
           timer.destroyAllTimers();
       });

       it('should not remove all timers references', function() {
           J.size(timer.timers).should.eql(0);
       });

       it('should remove all listeners', function() {
           // 5 timers removed in total (1 directly). Of those 4, 2 had
           // their listeners remvoved by game.start(). 1 timer has +4
           // listeners (2+syncWithStager). From the moment listeners2 is
           // defined we remove: 0*2 + 1*2 + 2 - 2 (2 stagerSync are not in).
           node.events.size(true).should.eql(result.listeners2 - 4);
       });
   });

    // Timestamps.

    describe('#set|getTimestamp', function() {

       it('should set|get current time', function() {
           var d1, d2;
           timer = node.timer;
           d1 = (new Date()).getTime();
           timer.setTimestamp('1');
           d2 = (new Date()).getTime();
           timer.getTimestamp('1').should.eql(timer.timestamps['1']);
           timer.getTimestamp('1').should.be.within(d1, d2);
       });

       it('should set|get a fixed time', function() {
           var time;
           time = 1000;
           timer.setTimestamp('2', time);
           timer.getTimestamp('2').should.eql(time);
       });
   });

   describe('#getAllTimestamps', function() {
       it('should return user-creted timestamps', function() {
           var res = timer.getAllTimestamps();
           res[1].should.eql(timer.timestamps['1']);
           res[2].should.eql(1000);
       });
       it('should return all default timestamps', function() {
           var res = timer.getAllTimestamps();
           res["1.1.1"].should.be.greaterThan(0);
           res["paused"].should.be.greaterThan(0);
           res["resumed"].should.be.greaterThan(0);
           res["stage"].should.be.greaterThan(0);
           res["start"].should.be.greaterThan(0);
           res["step"].should.be.greaterThan(0);
       });
       it('resumed should be largest timestamp', function() {
           var res = timer.getAllTimestamps();
           res["step"].should.be.greaterThanOrEqual(res["start"]);
           res["step"].should.be.greaterThanOrEqual(res["stage"]);
           res["paused"].should.be.greaterThan(res["step"]);
           res["resumed"].should.be.greaterThan(res["step"]);
           res["resumed"].should.be.greaterThan(res["paused"]);
       });

       it('step should be equal to 1.1.1', function() {
           var res = timer.getAllTimestamps();
           res["step"].should.be.eql(res["1.1.1"]);
       });

   });

   describe('#getTimeSince', function() {
       it('should return the difference between cur time and a timestamp',
          function(done) {
              var d1, d2;
              var i, len;
              timer.setTimestamp('3');
              setTimeout(function() {
                  d1 = timer.getTimeSince('1');
                  d2 = timer.getTimeSince('3');
                  d1.should.be.greaterThan(0);
                  d2.should.be.greaterThan(0);
                  d1.should.be.greaterThan(d2);
                  done();
              }, 300);

       });
   });

   describe('#getTimeDiff', function() {
       it('should return the difference between two timestamps', function() {
           var d1;
           d1 = timer.getTimeDiff('3', '1');
           d1.should.be.lessThan(0);
           d1 = timer.getTimeDiff('1', '3');
           d1.should.be.greaterThan(0);
       });
   });

   describe('#getTimeSince effective', function() {
       it('should return the effective dist between cur time and a timestamp ',
          function(done) {
              var d1, d2;
              node.game.pause();
              setTimeout(function() {
                  d1 = timer.getTimeSince('1', true);
                  d2 = timer.getTimeSince('1');
                  (d2 - d1).should.be.within(550, 650);
                  done();
              }, 600);
         });
   });

   describe('#getTimeDiff effective', function() {
       it('should return the effective difference between two timestamps',
          function(done) {
              var d1, d2;
              node.timer.setTimestamp('4');
              setTimeout(function() {
                  d1 = timer.getTimeDiff('1', '4', true);
                  d2 = timer.getTimeSince('1', true);
                  d1.should.be.eql(d2);
                  done();
              }, 600);
         });
   });

   describe('#getTimeSince effective after resume', function() {
       it('should return the effective dist between cur time and a timestamp ',
          function(done) {
              var d1, d2, d0;
              d0 = timer.getTimeSince('1', true);
              d2 = timer.getTimeSince('1');
              node.game.resume();
              d1 = node.timer.getTimeDiff('paused', 'resumed');
              (d2 - d0).should.be.within(d1 - 50, d1 + 50);
              setTimeout(function() {
                  d1 = timer.getTimeSince('1', true);
                  (d1 - d0).should.be.within(550, 650);
                  done();
              }, 600);
         });
   });

   describe('#getTimeDiff effective after resume', function() {
       it('should return the effective difference between two timestamps',
          function() {
             var d1, d2, d3;
              d1 = node.timer.getTimeDiff('paused', 'resumed');
              // Keep reference to paused time.
              result.pausedTime = d1;
              node.timer.setTimestamp('5');
              d2 = node.timer.getTimeDiff('5', '1', true);
              d3 = node.timer.getTimeSince('1');
              d2.should.be.within((d3 - d1) - 50, (d3 - d1) + 50);
         });
   });

   describe('#getTimeSince effective after another pause', function() {
       it('should return the effective dist between cur time and a timestamp ',
          function(done) {
              var d1, d2, d0;
              result.diffBeforePause = node.timer.getTimeDiff('5', '1', true);
              d1 = timer.getTimeSince('1', true);
              node.game.pause();
              setTimeout(function() {
                  d2 = timer.getTimeSince('1', true);
                  (d2 - d1).should.be.within(0, 10);
                  done();
              }, 600);
         });
   });

   describe('#getTimeDiff effective after another pause', function() {
       it('should return the effective difference between two timestamps',
          function() {
             var d1, d2, d3;
              d1 = node.timer.getTimeDiff('5', '1', true);
              d1.should.be.within(result.diffBeforePause - 10,
                                  result.diffBeforePause + 10);
         });
   });

   describe('#getTimeSince effective after another resume', function() {
       it('should return the effective dist between cur time and a timestamp ',
          function(done) {
              var d1, d2, d0, d3;
              node.game.resume();
              setTimeout(function() {
                  var totalPause;
                  d1 = timer.getTimeSince('1');
                  d2 = timer.getTimeSince('1', true);
                  d0 = result.pausedTime;
                  d3 = node.timer.getTimeDiff('paused', 'resumed');
                  result.totalPause = totalPause = d3 + d0;
                  (d1 - d2).should.be.within(totalPause - 50, totalPause + 50);
                  done();
              }, 600);
         });
   });

   describe('#getTimeDiff effective after another pause', function() {
       it('should return the effective difference between two timestamps',
          function() {
             var d1, d2, d3;
              node.timer.setTimestamp('6');
              d1 = node.timer.getTimeDiff('1', '6', true);
              d2 = node.timer.getTimeDiff('1', '6');
              (d2 - d1).should.be.within(result.totalPause - 50,
                                         result.totalPause + 50);
         });
   });


    // Random Fire.


    describe('#randomEmit', function() {
        it('should emit an event in a time interval', function(done) {
            node.on('AH', function(param) {
                done();
            });

            node.timer.randomEmit('AH', 1000);
        });
    });


    describe('#randomEmit', function() {
        it('should emit an event in a time interval with param',
           function(done) {

               node.on('AH2', function(param) {
                   if (param === 1) done();
               });

               node.timer.randomEmit('AH2', 1000, 1);
        });
    });

    describe('#randomExec', function() {
        it('should exec a cb in a time interval', function(done) {
            function ah(param) {
                done();
            }

            node.timer.randomExec(ah, 1000);
        });
    });

    describe('#randomExec', function() {
        it('should exec a cb in a time interval with context',
           function(done) {
               function ah(param) {
                   if (this.a === 1) done();
               }
               var a = { a: 1 };

               node.timer.randomExec(ah, 1000, a);
        });
    });

    describe('#randomDone', function() {
        it('should call node.done in a time interval',
           function(done) {
               var o;
               o = node.game.plot.getStep(node.game.getCurrentGameStage());
               o.done = function(a) {
                   if (a === 1) done();
               };
               node.timer.randomDone(1000, 1);
        });
    });
});
