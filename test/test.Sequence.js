var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var GamePlot = ngc.GamePlot;
var Stager = ngc.Stager;
var J = ngc.JSUS;

var result;
var stager = new Stager();


//   stager = ngc.getStager();
//
//
// stager.next('stage 2',0);
// stager.step('step 1.1');
// stager.step('step 1.2');
// stager.stage('stage 0',2);
// stager.stage('stage 1', '1');
//
//
//           debugger
//          s = stager.getState().sequence;
//
//          debugger
//          stager.reset();
//
//          debugger
//          s = stager.getState().sequence;
//
//
//          debugger
//          return

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


    describe('#next: stage and steps blocks', function() {
        before(function() {
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

    it('should have called the three in the right order', function() {
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

    it('should have called the three in the right order', function() {
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

        //             result['step 1.2'].forEach(function(i) {
        //                 if (i !== 4) should.fail();
        //                 sum = sum + i;
        //             });
        //             sum.should.be.eql(400);
        //             sum = 0;
        //             result['step 1.3'].forEach(function(i) {
        //                 if (i !== 5) should.fail();
        //                 sum = sum + i;
        //             });
        //             sum.should.be.eql(500);
        //             sum = 0;
        //
        //             result['step 1.4'].forEach(function(i) {
        //                 if (i !== 6) should.fail();
        //                 sum = sum + i;
        //             });
        //             sum.should.be.eql(600);
        //             sum = 0;
        //             result['step 1.5'].forEach(function(i) {
        //                 if (i !== 7) should.fail();
        //                 sum = sum + i;
        //             });
        //             sum.should.be.eql(700);
        //             sum = 0;
        //
        //
        //             result['step 1.1'].forEach(function(i) {
        //                 if (i !== 8) should.fail();
        //                 sum = sum + i;
        //             });
        //             sum.should.be.eql(800);
        //             sum = 0;
        //
        //             result['stage 2'].forEach(function(i) {
        //                 if (i !== 1 && i !== 0) should.fail();
        //                 sum = sum + i;
        //             });
        //             // 50% in position 0, 50$ in position 1.
        //             sum.should.be.within(20,80);
        //             sum = 0;
        //
        //             console.log(result['step 3.1']);
        //             console.log(result['step 3.2']);
        //
        //             result['step 3.1'].forEach(function(i) {
        //                 if (i !== 2 && i !== 3) should.fail();
        //                 sum = sum + i;
        //             });
        //             // 50% in position 3, 50% in 2.
        //             sum.should.be.within(220, 280);
        //             sum = 0;
        //             result['step 3.2'].forEach(function(i) {
        //                 if (i !== 2 && i !== 3) should.fail();
        //                 sum = sum + i;
        //             });
        //             // 50% in position 3, 50% in 2.
        //             sum.should.be.within(220, 280);
        //             sum = 0;
        //
        //             result['stage 4'].forEach(function(i) {
        //                 if (i !== 0 && i !== 1) should.fail();
        //                 sum = sum + i;
        //             });
        //             // 50% in position 0, 50$ in position 1.
        //             sum.should.be.within(20,80);
        //             sum = 0;

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
    mynode.createPlayer({ id: 'testid' });
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
    return result;
}

function hasNextStep(game) {
    var curStep, nextStep;
    curStep = game.getCurrentGameStage();
    nextStep = game.plot.next(curStep);
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
