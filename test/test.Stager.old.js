//var util = require('util'),
//	should = require('should');
//
//var node = module.exports = require('./../index.js');
//
//var PlayerList = node.PlayerList,
//	Player = node.Player,
//	GameDB = node.GameDB,
//	GameState = node.GameState;
//
//var Stager = require('./../lib/core/Stager').Stager;
//
//var creation 	= { cb: function(){}, name: 'Creation' };
//var evaluation 	= { cb: function(){}, name: 'Evaluation' };
//var exhibition 	= { cb: function(){}, name: 'Exhibition' };
//
//var game = {
//		name: 'game',
//		steps: [creation, evaluation, exhibition],
//		rounds: 10
//};
//
//
//var stages = [
//		{
//			name: 'Game will start soon',
//			cb: function(){},
//		},
//		
//		{
//			cb: function(){},
//			name: 'Instructions',
//			timer: 20000
//		},
//		
//		game, 
//		
//		{
//			cb: function(){},
//			name: 'Questionnaire'
//		},
//		
//		{
//			cb: function(){},
//			name: 'Thank you!'
//		}
//];	
//
//
//var stager;
//
//describe('Stager', function() {
//	
////	describe('empty #constructor()', function() {
////		before(function(){
////			stager = new Stager();
////		});
////		it('should result in a game stages of length 0', function() {
////			stager.size().should.be.equal(0); 
////		});
////	});
//	
//	describe('#add() single entry', function() {
//		before(function(){
//			stager = new Stager();
//			stager.add(creation);
//		});
//		it('should result in game stager of length 1', function() {
//			stager.size().should.be.eql(1);
//		});
//	});
//	
//	describe('#constructor()', function() {
//		before(function(){
//			stager = new Stager(stages);
//		});
//		it('should result in a game stages of length 35', function() {
//			stager.size().should.be.equal(34); 
//		});
//	});
//	
//	describe('#next()', function() {
//		it('should return 1.1.1', function() {
//			GameState.compare(stager.next('0.0.0'),'1.1.1').should.be.equal(0); 
//		});
//		it('should return 2.1.1', function() {
//			GameState.compare(stager.next('1.1.1'),'2.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1', function() {
//			GameState.compare(stager.next('2.1.1'),'3.1.1').should.be.equal(0); 
//		});
//		it('should return 3.2.1', function() {
//			GameState.compare(stager.next('3.1.1'),'3.2.1').should.be.equal(0); 
//		});
//		it('should return 3.3.1', function() {
//			GameState.compare(stager.next('3.2.1'),'3.3.1').should.be.equal(0); 
//		});
//		it('should return 3.1.2', function() {
//			GameState.compare(stager.next('3.3.1'),'3.1.2').should.be.equal(0); 
//		});
//		
//		it('should return false when reached the end of the stages', function() {
//			stager.next('5.1.1').should.be.false; 
//		});
//	});
////	
//	describe('#previous()', function() {
//		it('should return 1.1.1', function() {
//			GameState.compare(stager.previous('2.1.1'),'1.1.1').should.be.equal(0); 
//		});
//		it('should return 2.1.1', function() {
//			GameState.compare(stager.previous('3.1.1'),'2.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1', function() {
//			GameState.compare(stager.previous('3.2.1'),'3.1.1').should.be.equal(0); 
//		});
//		it('should return 3.2.1', function() {
//			GameState.compare(stager.previous('3.3.1'),'3.2.1').should.be.equal(0); 
//		});
//		it('should return 3.3.1', function() {
//			GameState.compare(stager.previous('3.1.2'),'3.3.1').should.be.equal(0); 
//		});
//		
//		it('should return false at the beginning of the stages', function() {
//			stager.previous('1.1.1').should.be.false; 
//		});
//	});
//	
//	describe('#jumpTo() forward', function() {
//		it('should return 2.1.1', function() {
//			GameState.compare(stager.jumpTo('1.1.1', 1), '2.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1', function() {
//			GameState.compare(stager.jumpTo('3.1.1', 1), '3.2.1').should.be.equal(0); 
//		});
//		it('should return 3.2.1', function() {
//			GameState.compare(stager.jumpTo('3.3.1', 1), '3.1.2').should.be.equal(0); 
//		});
//		it('should return 3.3.1', function() {
//			GameState.compare(stager.jumpTo('3.1.1', 2), '3.3.1').should.be.equal(0); 
//		});
//		it('should return 3.3.1', function() {
//			GameState.compare(stager.jumpTo('3.1.1', 5), '3.3.2').should.be.equal(0); 
//		});
//		it('should return false at the beginning of the stages', function() {
//			stager.jumpTo('5.1.1',1).should.be.false; 
//		});
//	});
//	
//	describe('#jumpTo() backward', function() {
//		it('should return 1.1.1 (jump -1)', function() {
//			GameState.compare(stager.jumpTo('2.1.1', -1), '1.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1 (jump -1)', function() {
//			GameState.compare(stager.jumpTo('3.2.1', -1), '3.1.1').should.be.equal(0); 
//		});
//		it('should return 3.3.1 (jump -1)', function() {
//			GameState.compare(stager.jumpTo('3.1.2', -1), '3.3.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1 (jump -2)', function() {
//			GameState.compare(stager.jumpTo('3.3.1', -2), '3.1.1').should.be.equal(0); 
//		});
//		it('should return 3.1.1 (jump -5)', function() {
//			GameState.compare(stager.jumpTo('3.3.2', -5), '3.1.1').should.be.equal(0); 
//		});
//		it('should return false at the beginning of the stages', function() {
//			stager.jumpTo('1.1.1',-1).should.be.false; 
//		});
//		
//	});
//	
//	describe('#get()', function() {
//		it('should return 2.1.1', function() {
//			console.log(stager.get('2.1.1.'))
//			stager.get('2.1.1').should.be.eql(stages[1]);
//		});
//	});
//	
//	describe('#getProperty()', function() {
//		it('should return 2.1.1', function() {
//			console.log(stager.getProperty('2.1.1.', 'timer'))
//			stager.getProperty('2.1.1.', 'timer').should.be.eql(stages[1].timer);
//		});
//	});
//	
//	
//	
//});


// The following was copied from the Stager class

//    // DEBUG:  Run sequence.  Should be deleted later on.
//    Stager.prototype.seqTestRun = function(expertMode, firstStage) {
//        var seqObj;
//        var curStage;
//        var stageNum;
//
//        console.log('* Commencing sequence test run!');
//
//        if (!expertMode) {
//            for (stageNum in this.sequence) {
//                if (this.sequence.hasOwnProperty(stageNum)) {
//                    seqObj = this.sequence[stageNum];
//                    console.log('** num: ' + stageNum + ', type: ' + seqObj.type);
//                    switch (seqObj.type) {
//                    case 'gameover':
//                        console.log('* Game Over.');
//                        return;
//
//                    case 'plain':
//                        this.stageTestRun(seqObj.id);
//                        break;
//
//                    case 'repeat':
//                        for (var i = 0; i < seqObj.num; i++) {
//                            this.stageTestRun(seqObj.id);
//                        }
//                        break;
//
//                    case 'loop':
//                        while (seqObj.cb()) {
//                            this.stageTestRun(seqObj.id);
//                        }
//                        break;
//
//                    case 'doLoop':
//                        do {
//                            this.stageTestRun(seqObj.id);
//                        } while (seqObj.cb());
//                        break;
//
//                    default:
//                        throw new Error('unknown sequence object type');
//                        break;
//                    }
//                }
//            }
//        }
//        else {
//            // Get first stage:
//            if (firstStage) {
//                curStage = firstStage;
//            }
//            else if (this.generalNextFunction) {
//                curStage = this.generalNextFunction();
//            }
//            else {
//                curStage = null;
//            }
//
//            while (curStage) {
//                this.stageTestRun(curStage);
//
//                // Get next stage:
//                if (this.nextFunctions[curStage]) {
//                    curStage = this.nextFunctions[curStage]();
//                }
//                else if (this.generalNextFunction) {
//                    curStage = this.generalNextFunction();
//                }
//                else {
//                    curStage = null;
//                }
//
//                // Check stage validity:
//                if (curStage !== null && !this.stages[curStage]) {
//                    throw new Error('next-deciding callback yielded invalid stage');
//                    curStage = null;
//                }
//            }
//        }
//    };
//
//    // DEBUG:  Run stage.  Should be deleted later on.
//    Stager.prototype.stageTestRun = function(stageId) {
//        var steps = this.stages[stageId].steps;
//        var stepId;
//
//        for (var i in steps) {
//            if (steps.hasOwnProperty(i)) {
//                stepId = steps[i];
//                this.steps[stepId].cb();
//            }
//        }
//    };
