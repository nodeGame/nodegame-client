"use strict";

var util = require('util');
var should = require('should');

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
        before(function() {
            block = new Block({
                id: 'myblock',
                type: 'mytype'
            });
        });
        it('should add item to the block with default position', function() {
            var item = {id: 'foo', type: 'bar'};
            block.add(item);
            block.unfinishedItems[0].should.eql({
                positions: 'linear',
                item: item
            });
        });
        it('should add item to the block with specific position', function() {
            var item = {id: 'foo1', type: 'bar1'};
            block.add(item, '1');
            block.unfinishedItems[1].should.eql({
                positions: '1',
                item: item
            });
        });
        it('should fail if parameters are not correct', function() {
            (function() {
                block.add({
                    id: null,
                    type: 'aa'
                });
            }).should.throw();
            (function() {
                block.add({
                    id: 'aa',
                    type: 1
                });
            }).should.throw();
        });
        it('should fail if an item with same id was already added', function() {
            (function() {
                block.add({
                    id: 'foo',
                    type: 'aa'
                });
            }).should.throw();
        });
    });
});
