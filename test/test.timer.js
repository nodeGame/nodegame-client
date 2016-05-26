"use strict";

var util = require('util');
should = require('should');

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
           node.createPlayer({ id: 'A' });
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
           node.createPlayer({ id: 'A' });
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
               update: 150,
               timeup: function() {
                   result.timeup3 = true;
               }
           });
       });
       it('should not execute updates/timeup on pause, then do it on resume',
          function(done) {
              tmp.start();
              setTimeout(function() {
                  // 3 updates.
                  node.game.pause();
                  setTimeout(function() {
                      // 0 updates.
                      node.game.resume();
                      setTimeout(function() {
                          // 2 updates
                          result.update3.length.should.eql(5);
                          result.timeup3.should.eql(false);
                          done();
                      }, 400);
                  }, 300);
              }, 500);
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

   describe('#set|getTimestamp', function() {


       it('should set current time', function() {
           var d1, d2;
           d1 = (new Date()).getTime();
           timer.setTimestamp('1');
           d2 = (new Date()).getTime();
           timer.getTimestamp('1').should.eql(timer.timestamps['1']);
           // timer.getTimestamp('1').should.be.between(d1, d2);

       });

   });


});
