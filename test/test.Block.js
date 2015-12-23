var util = require('util');
should = require('should');

var log = console.log;

var ngc = require('../index.js');
var Block = ngc.Block;
var J = ngc.JSUS;

var block;
var result;

describe('#Block', function() {

    describe('#constructor', function() {

        it('should create a new block with "linear" positions', function() {
            block = new Block({
                id: 'myblock',
                type: 'mytype'
            });
            block.id.should.eql('myblock');
            block.type.should.eql('mytype');
            block.positions.should.eql('linear');
        });

        it('should fail if parameters are not correct', function() {
            (function() {
                block = new Block({
                id: 'myblock',
                type: ''
                });
            }).should.throw();
            (function() {
                block = new Block({
                id: '',
                type: 'aa'
                });
            }).should.throw();
            (function() {
                block = new Block({
                id: 'myblock',
                type: 1
                });
            }).should.throw();
            (function() {
                block = new Block({
                id: null,
                type: 'aa'
                });
            }).should.throw();
        });
    });

    describe('#add', function() {
        it('should have removed default step from stage 1', function() {
            // typeof(result['stage 1'] + '').should.eql('undefined');
        });
    });
});
