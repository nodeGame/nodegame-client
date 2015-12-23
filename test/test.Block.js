var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Block = ngc.Block;
var J = ngc.JSUS;

var block;
var result;

describe('#Block', function() {
    before(function() {

        block = new Block({
            id: 'myblock',
            type: 'mytype'
        });

        // Type is: '__default', the name of the current block

        // Step.
        block.add({
            id: 'item_A',
            type: 'step',
            item: { id: 'item_A' }
        });

        // result = testPositions(stager, 100);
    });

    it('should have removed default step from stage 1', function() {
        // typeof(result['stage 1'] + '').should.eql('undefined');
    });

});
