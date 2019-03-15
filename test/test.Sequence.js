"use strict";

var util = require('util');
var should = require('should');

var log = console.log;

var ngc = require('../index.js');
var GamePlot = ngc.GamePlot;
var Stager = ngc.Stager;
var J = ngc.JSUS;

var result, tmp;
var stager = new Stager();
var loopCb, flag;

// For loops, because the loop function might be evaluated multiple times.
var testNext = false;

var i, len, res, stagerStage;

describe('Moving through the sequence', function() {

    describe('#next: 3 fixed positions. Mode (A).', function() {
        before(function() {
            stager = ngc.getStager();
            result = null;

            stager.next('stage 1', '0');
            stager.next('stage 2', '1');
            stager.next('stage 3', '2');

            result = testPositions(stager, 100);
        });

        test3fixed();
    });

    describe('#next: 3 fixed positions. Mode (B).', function() {
        before(function() {
            stager = ngc.getStager();
            result = null;

            stager.next('stage 1');
            stager.next('stage 2');
            stager.next('stage 3');

            result = testPositions(stager, 100);
        });

        test3fixed();
    });

    describe('#next: 3 fixed positions. Mode (C).', function() {
        before(function() {
            stager = ngc.getStager();
            result = null;

            stager.next('stage 1');
            stager.next('stage 2');
            stager.next('stage 3', '*');

            result = testPositions(stager, 100);
        });

        test3fixed();
    });

    describe('#next: 3 fixed positions. Mode (D).', function() {
        before(function() {
            stager = ngc.getStager();
            result = null;

            stager.next('stage 1');
            stager.next('stage 2', '1');
            stager.next('stage 3', '*');

            result = testPositions(stager, 100);
        });

        test3fixed();
    });

    describe('#next: 3 fixed positions. Mode (E).', function() {
        before(function() {
            stager = ngc.getStager();
            result = null;

            stager.next('stage 1');
            stager.next('stage 2', '1');
            stager.next('stage 3');

            result = testPositions(stager, 100);
        });

        test3fixed();
    });

    describe('#next: two variable positions, 1 fixed. Mode(A).', function() {
        before(function() {
            stager = ngc.getStager();
            result = null;

            stager.next('stage 1', '0,2');
            stager.next('stage 2', '1');
            stager.next('stage 3', '0,2');

            result = testPositions(stager, 100);
        });

        test2variable1fixed();

    });

    describe('#next: two variable positions, 1 fixed. Mode(B).', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;

            stager.next('stage 1', '*');
            stager.next('stage 2', '1');
            stager.next('stage 3', '*');

            result = testPositions(stager, 100);
        });

        test2variable1fixed(result);

    });

    describe('#next: steps in "linear" order', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;

            stager.next('stage 1');
            stager.step('step 1.1');
            stager.step('step 1.2');
            stager.step('step 1.3');

            result = testPositions(stager, 100);
        });

        it('should have removed default step from stage 1', function() {
            typeof(result['stage 1'] + '').should.eql('undefined');
        });
        it('should have called only the three steps', function() {
            var keys;
            keys = Object.keys(result).sort();
            keys.should.eql(['step 1.1', 'step 1.2', 'step 1.3']);
        });

        it('should have called the three steps', function() {
            J.isArray(result['step 1.1']).should.eql(true);
            J.isArray(result['step 1.2']).should.eql(true);
            J.isArray(result['step 1.3']).should.eql(true);
        });
        it('should have called the three steps 100 times each', function() {
            result['step 1.1'].length.should.eql(100);
            result['step 1.2'].length.should.eql(100);
            result['step 1.3'].length.should.eql(100);
        });

        it('should have called the three steps in right order', function() {
            var sum = 0;
            result['step 1.1'].forEach(function(i) {
                if (i !== 0) should.fail();
                sum = sum + i;
            });
            sum.should.be.eql(0);
            sum = 0;
            result['step 1.2'].forEach(function(i) {
                if (i !== 1) should.fail();
                sum = sum + i;
            });
            sum.should.be.eql(100);
            sum = 0;
            result['step 1.3'].forEach(function(i) {
                if (i !== 2) should.fail();
                sum = sum + i;
            });
            sum.should.be.eql(200);

        });

    });

    describe('#next: variable steps within stage', function() {
        before(function() {
            stager = ngc.getStager();
            i = null, len = null, res = null, stagerStage = null;

            stager.next('stage 1');
            stager.step('step 1.1', '*');
            stager.step('step 1.2', '*');
            stager.step('step 1.3', '*');

            result = testPositions(stager, 100);
        });

        it('should have removed default step from stage 1', function() {
            typeof(result['stage 1'] + '').should.eql('undefined');
        });
        it('should have called only the three steps', function() {
            var keys;
            keys = Object.keys(result).sort();
            keys.should.eql(['step 1.1', 'step 1.2', 'step 1.3']);
        });

        it('should have called the three steps', function() {
            J.isArray(result['step 1.1']).should.eql(true);
            J.isArray(result['step 1.2']).should.eql(true);
            J.isArray(result['step 1.3']).should.eql(true);
        });
        it('should have called the three steps 100 times each', function() {
            result['step 1.1'].length.should.eql(100);
            result['step 1.2'].length.should.eql(100);
            result['step 1.3'].length.should.eql(100);
        });

        it('should have called the three steps in random order', function() {
            var sum = 0;
            result['step 1.1'].forEach(function(i) {
                if (i !== 0 && i !== 1 && i !== 2) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(70,130);
            sum = 0;
            result['step 1.2'].forEach(function(i) {
                if (i !== 0 && i !== 1 && i !== 2) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(70,130);
            sum = 0;
            result['step 1.3'].forEach(function(i) {
                if (i !== 0 && i !== 1 && i !== 2) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(70,130);

        });

    });

    describe('#next: 1 fixed, 2 variable steps within stage', function() {
        before(function() {
            stager = ngc.getStager();

            stager.next('stage 1');
            stager.step('step 1.1', '*');
            stager.step('step 1.2', '0..2');
            stager.step('step 1.3', '2');

            result = testPositions(stager, 100);
        });

        it('should have removed default step from stage 1', function() {
            typeof(result['stage 1'] + '').should.eql('undefined');
        });
        it('should have called only the three steps', function() {
            var keys;
            keys = Object.keys(result).sort();
            keys.should.eql(['step 1.1', 'step 1.2', 'step 1.3']);
        });

        it('should have called the three steps', function() {
            J.isArray(result['step 1.1']).should.eql(true);
            J.isArray(result['step 1.2']).should.eql(true);
            J.isArray(result['step 1.3']).should.eql(true);
        });
        it('should have called the three steps 100 times each', function() {
            result['step 1.1'].length.should.eql(100);
            result['step 1.2'].length.should.eql(100);
            result['step 1.3'].length.should.eql(100);
        });

        it('should have called the three steps in right order', function() {
            var sum = 0;
            result['step 1.1'].forEach(function(i) {
                if (i !== 0 && i !== 1) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(20,80);
            sum = 0;
            result['step 1.2'].forEach(function(i) {
                if (i !== 0 && i !== 1) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(20,80);
            sum = 0;
            result['step 1.3'].forEach(function(i) {
                if (i !== 2) should.fail();
                sum = sum + i;
            });
            sum.should.be.eql(200);

        });

    });

    describe('#next: 3 fixed steps, added in wrong order', function() {
        before(function() {
            stager = ngc.getStager();

            stager.next('stage 1');
            stager.step('step 1.1', '2');
            stager.step('step 1.2', '0');
            stager.step('step 1.3', '1');

            result = testPositions(stager, 100);
        });

        it('should have removed default step from stage 1', function() {
            typeof(result['stage 1'] + '').should.eql('undefined');
        });
        it('should have called the three steps', function() {
            J.isArray(result['step 1.1']).should.eql(true);
            J.isArray(result['step 1.2']).should.eql(true);
            J.isArray(result['step 1.3']).should.eql(true);
        });
        it('should have called only the three steps', function() {
            var keys;
            keys = Object.keys(result).sort();
            keys.should.eql(['step 1.1', 'step 1.2', 'step 1.3']);
        });
        it('should have called the three steps 100 times each', function() {
            result['step 1.1'].length.should.eql(100);
            result['step 1.2'].length.should.eql(100);
            result['step 1.3'].length.should.eql(100);
        });

        it('should have called the three steps in right order', function() {
            var sum = 0;

            result['step 1.1'].forEach(function(i) {
                if (i !== 2) should.fail();
                sum = sum + i;
            });
            sum.should.be.eql(200);
            sum = 0;
            result['step 1.2'].forEach(function(i) {
                if (i !== 0) should.fail();
                sum = sum + i;
            });
            sum.should.be.eql(0);
            sum = 0;
            result['step 1.3'].forEach(function(i) {
                if (i !== 1) should.fail();
                sum = sum + i;
            });
            sum.should.be.eql(100);

        });

    });

    describe('#next: 1 fixed, 2 variable steps, wrong order', function() {
        before(function() {
            stager = ngc.getStager();

            stager.next('stage 1');
            stager.step('step 1.1', '*');
            stager.step('step 1.2', '0..2');
            stager.step('step 1.3', '0');

            result = testPositions(stager, 100);
        });

        it('should have removed default step from stage 1', function() {
            typeof(result['stage 1'] + '').should.eql('undefined');
        });
        it('should have called the three steps', function() {
            J.isArray(result['step 1.1']).should.eql(true);
            J.isArray(result['step 1.2']).should.eql(true);
            J.isArray(result['step 1.3']).should.eql(true);
        });
        it('should have called only the three steps', function() {
            var keys;
            keys = Object.keys(result).sort();
            keys.should.eql(['step 1.1', 'step 1.2', 'step 1.3']);
        });
        it('should have called the three steps 100 times each', function() {
            result['step 1.1'].length.should.eql(100);
            result['step 1.2'].length.should.eql(100);
            result['step 1.3'].length.should.eql(100);
        });

        it('should have called the three steps in right order', function() {
            var sum = 0;

            result['step 1.1'].forEach(function(i) {
                if (i !== 2 && i !== 1) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(120,180);
            sum = 0;
            result['step 1.2'].forEach(function(i) {
                if (i !== 2 && i !== 1) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(120,180);
            sum = 0;
            result['step 1.3'].forEach(function(i) {
                if (i !== 0) should.fail();
                sum = sum + i;
            });
            sum.should.be.eql(0);

        });

    });


    describe('#next: step blocks', function() {
        before(function() {
            // Increase timeout.
            this.timeout(5000);

            stager = ngc.getStager();

            stager.next('stage 1');

            stager.stepBlock('*');
            stager.step('step 1', '1');
            stager.step('step 2', '2');
            stager.step('step 3', '0');

            stager.stepBlock('*');
            stager.step('step 4');

            result = testPositions(stager, 100);
        });

        it('should have removed default step from stage 1', function() {
            typeof(result['stage 1'] + '').should.eql('undefined');
        });
        it('should have called the three steps', function() {
            J.isArray(result['step 1']).should.eql(true);
            J.isArray(result['step 2']).should.eql(true);
            J.isArray(result['step 3']).should.eql(true);
            J.isArray(result['step 4']).should.eql(true);
        });
        it('should have called only the three steps', function() {
            var keys;
            keys = Object.keys(result).sort();
            keys.should.eql(['step 1', 'step 2', 'step 3', 'step 4']);
        });
        it('should have called the three steps 100 times each', function() {
            result['step 1'].length.should.eql(100);
            result['step 2'].length.should.eql(100);
            result['step 3'].length.should.eql(100);
            result['step 4'].length.should.eql(100);
        });

        it('should have called the three steps in right order', function() {
            var sum = 0;
            result['step 1'].forEach(function(i) {
                if (i !== 2 && i !== 1) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(120,180);
            sum = 0;
            result['step 2'].forEach(function(i) {
                if (i !== 2 && i !== 3) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(220,280);
            sum = 0;
            result['step 3'].forEach(function(i) {
                if (i !== 0 && i !== 1) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(20,80);
            sum = 0;
            result['step 4'].forEach(function(i) {
                if (i !== 0 && i !== 3) should.fail();
                sum = sum + i;
            });
            sum.should.be.within(120,180);
        });

    });

    describe('#next: stage blocks', function() {
        before(function() {
            // Increase timeout.
            this.timeout(3000);
            stager = ngc.getStager();

            stager.stageBlock('2');
            stager.next('stage 1');

            stager.stageBlock('*');
            stager.next('stage 2', '0..1');
            stager.next('stage 3', '2');
            stager.next('stage 4', '*');

            stager.stageBlock('*');
            stager.next('stage 5');

            result = testPositions(stager, 100);
        });

        it('should have called 5 default steps', function() {
            J.isArray(result['stage 1']).should.eql(true);
            J.isArray(result['stage 2']).should.eql(true);
            J.isArray(result['stage 3']).should.eql(true);
            J.isArray(result['stage 4']).should.eql(true);
            J.isArray(result['stage 5']).should.eql(true);
        });
        it('should have called only the 5 default steps', function() {
            var keys;
            keys = Object.keys(result).sort();
            keys.should.eql(['stage 1', 'stage 2', 'stage 3',
                             'stage 4', 'stage 5']);
        });
        it('should have called the 5 default steps 100 times each', function() {
            result['stage 1'].length.should.eql(100);
            result['stage 2'].length.should.eql(100);
            result['stage 3'].length.should.eql(100);
            result['stage 4'].length.should.eql(100);
            result['stage 5'].length.should.eql(100);
        });

        it('should have called the three steps in right order', function() {
            var sum = 0;

            result['stage 1'].forEach(function(i) {
                if (i !== 4) should.fail();
                sum = sum + i;
            });
            sum.should.be.eql(400);
            sum = 0;
            result['stage 2'].forEach(function(i) {
                if (i !== 2 && i !== 1 && i !== 0) should.fail();
                sum = sum + i;
            });
            // 50% in position 1, 25% in 0 and 25% in 2.
            sum.should.be.within(30,120);
            sum = 0;
            result['stage 3'].forEach(function(i) {
                if (i !== 2 && i !== 3) should.fail();
                sum = sum + i;
            });
            // 50% in position 3, 50% in 2.
            sum.should.be.within(220, 280);
            sum = 0;
            result['stage 4'].forEach(function(i) {
                if (i !== 2 && i !== 1 && i !== 0) should.fail();
                sum = sum + i;
            });
            // 50% in position 1, 25% in 0 and 25% in 2.
            sum.should.be.within(30,120);
            sum = 0;
            result['stage 5'].forEach(function(i) {
                if (i !== 0 && i !== 3) should.fail();
                sum = sum + i;
            });
            // 50% in position 0, 50% in 3.
            sum.should.be.within(120, 180);

        });

    });

    describe('loop and doLoop', function() {
        before(function() {
            result = {};
            stager = ngc.getStager();

            tmp = { loops: [], counter: 1 };

            loopCb = function() {
                var res;
                res = !!!flag;
                // Not an actual update, just checking via test infrastructure.
                if (!testNext) {
                    tmp.loops.push([ this.getCurrentStepObj().id, res ]);
                }
                return res;
            };

            stager
                .next('1')
                .loop({
                    id: '2',
                    cb: function() {
                        if (tmp.counter++ >= 3) flag = true;
                    }
                }, loopCb)
                .loop('skipped', loopCb)
                .next('3')
                .doLoop('4', loopCb)
                .next('5');

            result = testPositions(stager, 1);
        });

        testLoop();
    });

    describe('loop and doLoop with nested steps', function() {
        before(function() {
            result = {};
            stager = ngc.getStager();
            flag = false;
            tmp = { loops: [], counter: 1 };

            loopCb = function() {
                var res;
                res = !!!flag;
                // Not an actual update, just checking via test infrastructure.
                if (!testNext) {
                    tmp.loops.push([ this.getCurrentStepObj().id, res ]);
                }
                return res;
            };

            stager
                .next('1')
                .loop({
                    id: '2',
                    cb: function() {
                        if (tmp.counter++ >= 3) flag = true;
                    }
                }, loopCb)
                .loop('skipped', loopCb)
                .next('3')
                .doLoop('4', loopCb)
                .next('5');

            stager.extendStage('2', {
                steps: [ '2', '2b', '2c' ]
            });

            stager.extendStage('4', {
                steps: [ '4', '4b' ]
            });

            result = testPositions(stager, 1);

        });

        testLoop(true);
    });

    describe('loop vs doLoop with false cb', function() {
        before(function() {

            stager = ngc.getStager();

            loopCb = function() {
                return false;
            };

            tmp = 0;
            flag = 0;

            stager
                .next('1')
                .loop({
                    id: '2',
                    cb: function() {
                        flag = flag + 1;
                    }
                }, loopCb)
                .doLoop({
                    id: '4',
                    cb: function() {
                        tmp = tmp + 1;
                    }
                }, loopCb)
                .finalize();


            result = testPositions(stager, 1);
        });


        it('loop should not be executed at all', function() {
            flag.should.eql(0);
        });
        it('doLoop should be executed once', function() {
            tmp.should.eql(1);
        });

    });

    describe('#next: stage and steps blocks', function() {
        before(function() {
            // Increase timeout.
            this.timeout(4000);
            stager = ngc.getStager();

            stager.stageBlock('>0');

            stager.stage('stage 1');
            stager.step('step 1.1', '*');

            stager.stepBlock('0');
            stager.step('step 1.2');
            stager.step('step 1.3');

            stager.stepBlock('1');
            stager.step('step 1.4');
            stager.step('step 1.5');

            stager.stageBlock('*');
            stager.stage('stage 2', '0..1');

            stager.stage('stage 3', '2');
            stager.step('step 3.1', '*');
            stager.step('step 3.2', '*');

            stager.stage('stage 4', '*');

            result = testPositions(stager, 100);
        });

        testStageAndStepBlocks();

    });

    describe('#next: stage and steps blocks with names', function() {
        before(function() {
            // Increase timeout.
            this.timeout(4000);
            stager = ngc.getStager();

            stager.stageBlock('--->First Block', '>0');

            stager.stage('stage 1');
            stager.step('step 1.1', '*');

            stager.stepBlock('Step Block 1', '0');
            stager.step('step 1.2');
            stager.step('step 1.3');

            stager.stepBlock('Step Block 2', '1');
            stager.step('step 1.4');
            stager.step('step 1.5');

            stager.stageBlock('--->Second Block', '*');
            stager.stage('stage 2', '0..1');

            stager.stage('stage 3', '2');
            stager.step('step 3.1', '*');
            stager.step('step 3.2', '*');

            stager.stage('stage 4', '*');

            result = testPositions(stager, 100);
        });

        testStageAndStepBlocks();

    });

    describe('init and exit functions on stages (3 stages)', function() {
        before(function() {
            stager = ngc.getStager();
            result = {};

            stager.next('stage 1');
            stager.next('stage 2');
            stager.next('stage 3');

            stager.extendStage('stage 1', {
                init: function() {
                    result.order = [];
                    result.order.push('init');
                    result.tot = 1;

                },
                exit: function() {
                    result.tot += 1;
                    result.order.push('exit');
                }
            });

            testPositions(stager, 1);
        });
        checkExitInitStages();
    });

    describe('init and exit functions on stages (1 stage)', function() {
        before(function() {
            stager = ngc.getStager();
            result = {};

            stager.next('stage 1');

            stager.extendStage('stage 1', {
                init: function() {
                    result.order = [];
                    result.order.push('init');
                    result.tot = 1;

                },
                exit: function() {
                    result.tot += 1;
                    result.order.push('exit');
                }
            });

            testPositions(stager, 1);
        });
        checkExitInitStages();
    });

    describe('init and exit functions on steps (1 stage)', function() {
        before(function() {
            stager = ngc.getStager();
            result = {};

            stager.next({
                id: 'stage 2',
                steps: [ 'qwe', 'rty', 'uio' ]
            });

            setupStagerForExitInitStepsTest();
            testPositions(stager, 1);
        });
        checkExitInitSteps();
    });


    describe('init and exit functions on steps (3 stages)', function() {
        before(function() {
            stager = ngc.getStager();
            result = {};

            stager.next('stage 1');
            stager.next({
                id: 'stage 2',
                steps: [ 'qwe', 'rty', 'uio' ]
            });
            stager.next('stage 3');

            setupStagerForExitInitStepsTest();
            testPositions(stager, 1);
        });
        checkExitInitSteps();
    });

});



// Helper function!
///////////////////




function test3fixed() {
    it('should have called the three steps', function() {
        J.isArray(result['stage 1']).should.eql(true);
        J.isArray(result['stage 2']).should.eql(true);
        J.isArray(result['stage 3']).should.eql(true);
    });
    it('should have called the three steps 100 times each', function() {
        result['stage 1'].length.should.eql(100);
        result['stage 2'].length.should.eql(100);
        result['stage 3'].length.should.eql(100);
    });

    it('should have called the three steps in the right order', function() {
        var sum = 0;
        result['stage 1'].forEach(function(i) { sum = sum + i; });
        sum.should.eql(0);
        sum = 0;
        result['stage 2'].forEach(function(i) { sum = sum + i; });
        sum.should.eql(100);
        sum = 0;
        result['stage 3'].forEach(function(i) { sum = sum + i; });
        sum.should.eql(200);
    });
}

function test2variable1fixed() {
    it('should have called the three steps', function() {
        J.isArray(result['stage 1']).should.eql(true);
        J.isArray(result['stage 2']).should.eql(true);
        J.isArray(result['stage 3']).should.eql(true);
    });
    it('should have called the three steps 100 times each', function() {
        result['stage 1'].length.should.eql(100);
        result['stage 2'].length.should.eql(100);
        result['stage 3'].length.should.eql(100);
    });

    it('should have called the three steps in the right order', function() {
        var sum = 0;
        result['stage 1'].forEach(function(i) {
            if (i !== 0 && i !== 2) should.fail();
            sum = sum + i;
        });
        sum.should.be.within(70,130);
        sum = 0;
        result['stage 2'].forEach(function(i) {
            i.should.eql(1);
            sum = sum + i;
        });
        sum.should.eql(100);
        sum = 0;
        result['stage 3'].forEach(function(i) {
            if (i !== 0 && i !== 2) should.fail();
            sum = sum + i;
        });
        sum.should.be.within(70,130);
    });
}

function testLoop(nested) {
    var nSteps;
    nSteps = nested ? '8' : '5';
    it('should have called the ' + nSteps + ' steps', function() {
        J.isArray(result['1']).should.eql(true);
        J.isArray(result['2']).should.eql(true);
        J.isArray(result['3']).should.eql(true);
        J.isArray(result['4']).should.eql(true);
        J.isArray(result['5']).should.eql(true);

        if (!nested) return;

        J.isArray(result['2b']).should.eql(true);
        J.isArray(result['2c']).should.eql(true);
        J.isArray(result['4b']).should.eql(true);

    });
     it('should have called the first loop three times', function() {
         result['2'].length.should.eql(3);
         if (!nested) return;
         result['2b'].length.should.eql(3);
         result['2c'].length.should.eql(3);

     });
     it('should have called the doLoop once', function() {
         result['4'].length.should.eql(1);
         if (!nested) return;
         result['4b'].length.should.eql(1);
     });
     it('should have executed loop cb before entering the stage', function() {
         tmp.loops[0].should.eql(['1', true]);
     });
     it('should have executed the loop callbacks with game context',
        function() {
            var ctx;
            ctx = nested ? '2c' : '2';
            tmp.loops[1].should.eql([ctx, true]);
            tmp.loops[2].should.eql([ctx, true]);
            tmp.loops[3].should.eql([ctx, false]);
     });
     it('should have executed loop cb of skipped stage', function() {
         var ctx;
         ctx = nested ? '2c' : '2';
         tmp.loops[4].should.eql([ctx, false]); // skipped
     });
     it('should have executed the doLoop callbacks with game context',
        function() {
            var ctx;
            ctx = nested ? '4b' : '4';
            tmp.loops[5].should.eql([ctx, false]);
        });
}

function testStageAndStepBlocks() {

    it('should have called 5 default steps', function() {
        J.isArray(result['step 1.1']).should.eql(true);
        J.isArray(result['step 1.2']).should.eql(true);
        J.isArray(result['step 1.3']).should.eql(true);
        J.isArray(result['step 1.4']).should.eql(true);
        J.isArray(result['step 1.5']).should.eql(true);
        J.isArray(result['stage 2']).should.eql(true);
        J.isArray(result['step 3.1']).should.eql(true);
        J.isArray(result['step 3.2']).should.eql(true);
        J.isArray(result['stage 4']).should.eql(true);

    });
    it('should have called only the 5 default steps', function() {
        var keys;
        keys = Object.keys(result).sort();
        keys.should.eql(['stage 2', 'stage 4',
                         'step 1.1', 'step 1.2', 'step 1.3',
                         'step 1.4', 'step 1.5',
                         'step 3.1', 'step 3.2']);
    });
    it('should have called the 5 default steps 100 times each',
       function() {
           result['step 1.1'].length.should.eql(100);
           result['step 1.2'].length.should.eql(100);
           result['step 1.3'].length.should.eql(100);
           result['step 1.4'].length.should.eql(100);
           result['step 1.5'].length.should.eql(100);
           result['stage 2'].length.should.eql(100);
           result['step 3.1'].length.should.eql(100);
           result['step 3.2'].length.should.eql(100);
           result['stage 4'].length.should.eql(100);
       });

    it('should have called the three steps in right order', function() {
        var sum = 0;

        result['step 1.2'].forEach(function(i) {
            if (i !== 4) should.fail();
            sum = sum + i;
        });
        sum.should.be.eql(400);
        sum = 0;
        result['step 1.3'].forEach(function(i) {
            if (i !== 5) should.fail();
            sum = sum + i;
        });
        sum.should.be.eql(500);
        sum = 0;

        result['step 1.4'].forEach(function(i) {
            if (i !== 6) should.fail();
            sum = sum + i;
        });
        sum.should.be.eql(600);
        sum = 0;
        result['step 1.5'].forEach(function(i) {
            if (i !== 7) should.fail();
            sum = sum + i;
        });
        sum.should.be.eql(700);
        sum = 0;


        result['step 1.1'].forEach(function(i) {
            if (i !== 8) should.fail();
            sum = sum + i;
        });
        sum.should.be.eql(800);
        sum = 0;

        result['stage 2'].forEach(function(i) {
            if (i !== 1 && i !== 0) should.fail();
            sum = sum + i;
        });
        // 50% in position 0, 50% in position 1.
        sum.should.be.within(20,80);
        sum = 0;

        result['step 3.1'].forEach(function(i) {
            if (i !== 2 && i !== 3) should.fail();
            sum = sum + i;
        });
        // 50% in position 3, 50% in 2.
        sum.should.be.within(220, 280);
        sum = 0;
        result['step 3.2'].forEach(function(i) {
            if (i !== 2 && i !== 3) should.fail();
            sum = sum + i;
        });
        // 50% in position 3, 50% in 2.
        sum.should.be.within(220, 280);
        sum = 0;

        result['stage 4'].forEach(function(i) {
            if (i !== 0 && i !== 1) should.fail();
            sum = sum + i;
        });
        // 50% in position 0, 50% in position 1.
        sum.should.be.within(20,80);
        sum = 0;

    });
}

// Setup functions.

function initGame(stager) {
    var sstate, mynode;
    stager.setDefaultStepRule(ngc.stepRules.WAIT);
    stager.reset();
    sstate = stager.getState();
    mynode = ngc.getClient();
    mynode.verbosity = -1000;
    mynode.setup('plot', sstate);
    mynode.createPlayer({ id: 'testid', sid: '111111' });
    mynode.game.start({ step: false });
    return mynode.game;
}

function goThroughSteps(game, result) {
    var id, counter, tmp;
    result = result || {};
    counter = 0;

    // Step through.
    while (hasNextStep(game)) {
        game.step();
        tmp = game.getCurrentStepObj();
        id = tmp.id;
        if (!result[id]) result[id] = [];
        result[id].push(counter);
        counter ++;
    }
    // We are in END_SEQ or GAMEOVER.
    // One more step to finish.
    game.step();

    return result;
}

function hasNextStep(game) {
    var curStep, nextStep;
    curStep = game.getCurrentGameStage();
    testNext = true;
    nextStep = game.plot.next(curStep);
    testNext = false;
    return nextStep !== GamePlot.GAMEOVER && nextStep !== GamePlot.END_SEQ;
}

function testPositions(stager, len, debug) {
    var i, len, game, result;
    i = -1;
    result = {};
    for ( ; ++i < len ; ) {
        if (debug) console.log(i);
        game = initGame(stager);
        goThroughSteps(game, result);
    }
    return result;
}

// Other test functions.

function checkExitInitStages() {
    it('should have called init and exit functions', function() {
        result.tot.should.eql(2);
    });

    it('should have called init before exit', function() {
        result.order[0].should.eql('init');
        result.order[1].should.eql('exit');
    });
}

function checkExitInitSteps() {
    it('should have called init and exit functions', function() {
        result.tot.should.eql(6);
    });

    it('should have called init before exit', function() {
        result.qwe[0].should.eql('init');
        result.qwe[1].should.eql('exit');
        result.rty[0].should.eql('init');
        result.rty[1].should.eql('exit');
        result.uio[0].should.eql('init');
        result.uio[1].should.eql('exit');
    });
}

function setupStagerForExitInitStepsTest() {

    stager.extendStep('qwe', {
        init: function() {
            result.tot = 1;
            result.qwe = [];
            result.qwe.push('init');
        },
        exit: function() {
            result.tot += 1;
            result.qwe.push('exit');
        }
    });

    stager.extendStep('rty', {
        init: function() {
            result.tot += 1;
            result.rty = [];
            result.rty.push('init');
        },
        exit: function() {
            result.tot += 1;
            result.rty.push('exit');
        }
    });

    stager.extendStep('uio', {
        init: function() {
            result.tot += 1;
            result.uio = [];
            result.uio.push('init');
        },
        exit: function() {
            result.tot += 1;
            result.uio.push('exit');
        }
    });
}
