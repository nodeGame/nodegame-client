// var util = require('util');
// should = require('should');
//
// var log = console.log;
//
// var ngc = require('../index.js');
// var Block = ngc.Block;
// var J = ngc.JSUS;
//
// var block;
// var result;
//
// block = new Block(undefined, { id: 'myblock' });
//
// var b = new Block(undefined, { id: 'nested_block'});
//
// debugger
//
// block.add(b);
//
// debugger
//
// block.add({
//     type: 'A',
//     item: { id: 'item_A' }
// });
//
// debugger
//
// return
//
//
// describe('#next: 1 fixed, 2 variable steps within stage', function() {
//     before(function() {
//
//         block = new Block(undefined, { id: 'myblock' });
//
//         // Type is: '__default', the name of the current block
//
//         // Step.
//         block.add({
//             type: 'step',
//             item: { id: 'item_A' }
//         });
//
//         // Stage
//         curBlock.add({
//             type: "__stage",
//             item: stage
//         });
//
//         // Block.
//         block.add({
//             id: 'BLOCK',
//             //type: 'A',
//             //item: { id: 'item_A' }
//         });
//
//
//         result = testPositions(stager, 100);
//     });
//
//     it('should have removed default step from stage 1', function() {
//         // typeof(result['stage 1'] + '').should.eql('undefined');
//     });
//
// });
