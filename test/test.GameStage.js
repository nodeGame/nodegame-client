"use strict";

var util = require('util');
var should = require('should');

var node = module.exports.node = require('../index.js');

//console.log(node);

var GameStage = node.GameStage;

var stage321 = {
    stage: 3,
    step: 2,
    round: 1
};

var stage321Letters = {
    stage: "three",
    step: "two",
    round: 1
};

var stage321Letters2 = {
    stage: "three",
    step: 2,
    round: 1
};

var stage311Letters = {
    stage: "three",
    step: 1,
    round: 1
};

var stage311 = {
    stage: 3,
    step: 1,
    round: 1
};

var stage000 = {
    stage: 0,
    step: 0,
    round: 0
};

var stage = new GameStage(stage321);
var stage0 = new GameStage(stage000);

var hash = null;

describe('GameStage', function() {

    describe('#constructor hash-string ', function() {

        it("'3.2.1'", function() {
            new GameStage('3.2.1').should.be.eql(stage321);
        });

        it("'3.2'", function() {
            new GameStage('3.2').should.be.eql(stage321);
        });

        it("'3'", function() {
            new GameStage('3').should.be.eql(stage311);
        });

        it("{stage: 3, step: 2, round: 1}", function() {
            new GameStage({
                stage: 3,
                step: 2,
                round: 1
            }).should.be.eql(stage321);
        });

        it("{stage: 3, step: 2}", function() {
            new GameStage({
                stage: 3,
                step: 2
            }).should.be.eql(stage321);
        });

        it("{stage: 3}", function() {
            new GameStage({
                stage: 3
            }).should.be.eql(stage311);
        });
    });

    describe('#constructor object', function() {

        it("{stage: 3, step: 2, round: 1}", function() {
            new GameStage({
                stage: 3,
                step: 2,
                round: 1
            }).should.be.eql(stage321);
        });

        it("{stage: 3, step: 2}", function() {
            new GameStage({
                stage: 3,
                step: 2
            }).should.be.eql(stage321);
        });

        it("{stage: 3}", function() {
            new GameStage({
                stage: 3
            }).should.be.eql(stage311);
        });

    });

    describe('#constructor number', function() {

        it("3", function() {
            new GameStage(3).should.be.eql(stage311);
        });

    });

    describe('#constructor falsy', function() {

        it("'0'", function() {
            new GameStage('0').should.be.eql(stage000);
        });

        it("'0.0'", function() {
            new GameStage('0').should.be.eql(stage000);
        });

        it("'0.0.0'", function() {
            new GameStage('0').should.be.eql(stage000);
        });

        it("{stage: 0}", function() {
            new GameStage({stage: 0}).should.be.eql(stage000);
        });

        it("{stage: 0, step: 0}", function() {
            new GameStage({stage: 0, step: 0}).should.be.eql(stage000);
        });

        it("{stage: 0, step: 0, round: 0}", function() {
            new GameStage({
                stage: 0,
                step: 0,
                round: 0
            }).should.be.eql(stage000);
        });

        it("undefined", function() {
            new GameStage().should.be.eql(stage000);
        });

        it("null", function() {
            new GameStage(null).should.be.eql(stage000);
        });

        it("0", function() {
            new GameStage(0).should.be.eql(stage000);
        });
    });

    describe('#constructor hash-string (strings) ', function() {

        it("'three.two.1'", function() {
            new GameStage('three.two.1').should.be.eql(stage321Letters);
        });

        it("'tree.two'", function() {
            new GameStage('three.two').should.be.eql(stage321Letters);
        });

        it("'three.2.1'", function() {
            new GameStage('three.2').should.be.eql(stage321Letters2);
        });

        it("'three.2'", function() {
            new GameStage('three.2').should.be.eql(stage321Letters2);
        });

        it("'three'", function() {
            new GameStage('three').should.be.eql(stage311Letters);
        });

    });

    describe('#constructor object (strings) ', function() {

        it("{stage: 'three', step: 'two', round: 1}", function() {
            new GameStage({
                stage: 'three',
                step: 'two',
                round: 1
            }).should.be.eql(stage321Letters);
        });

        it("{stage: 'three', step: 'two'}", function() {
            new GameStage({
                stage: 'three',
                step: 'two'
            }).should.be.eql(stage321Letters);
        });

        it("{stage: 'three'}", function() {
            new GameStage({
                stage: 'three'
            }).should.be.eql(stage311Letters);
        });

        it("{stage: 'three', step: 2, round: 1}", function() {
            new GameStage({
                stage: 'three',
                step: 2,
                round: 1
            }).should.be.eql(stage321Letters2);
        });

        it("{stage: 'three', step: 2}", function() {
            new GameStage({
                stage: 'three',
                step: 2
            }).should.be.eql(stage321Letters2);
        });

    });

    describe('#toHash()', function() {

        it("S.s.r' should be equal '3.2.1'", function() {
            GameStage.toHash(stage, 'S.s.r').should.be.eql('3.2.1');
        });

        it("Ss(r)' should be equal '32(1)'", function() {
            GameStage.toHash(stage, 'Ss(r)').should.be.eql('32(1)');
        });

    });

    describe('#constructor fails if', function() {

        it("param is function", function() {
            (function() {
                new GameStage(function() {});
            }).should.throw();
        });

        it("param is NaN", function() {
            (function() {
                new GameStage(NaN);
            }).should.throw();
        });

        it("param is inconsistent string 0.1.0", function() {
            (function() {
                new GameStage('0.1.0');
            }).should.throw();
        });

        it("param is inconsistent string 0.0.1", function() {
            (function() {
                new GameStage('0.0.1');
            }).should.throw();
        });

        it("param is inconsistent string 1.0.0", function() {
            (function() {
                new GameStage('1.0.0');
            }).should.throw();
        });

        it("param is inconsistent string 0.1", function() {
            (function() {
                new GameStage('0.1');
            }).should.throw();
        });

        it("param is badly formatted string 1..1.1", function() {
            (function() {
                new GameStage('1..1.1');
            }).should.throw();
        });

        it("param is badly formatted string .", function() {
            (function() {
                new GameStage('.');
            }).should.throw();
        });

        it("param is badly formatted string .asd", function() {
            (function() {
                new GameStage('.asd');
            }).should.throw();
        });

        it("param is badly formatted string ...", function() {
            (function() {
                new GameStage('...');
            }).should.throw();
        });

        it("param is badly formatted string ''", function() {
            (function() {
                new GameStage('');
            }).should.throw();
        });

        it("param is badly formatted string ''", function() {
            (function() {
                new GameStage('');
            }).should.throw();
        });

        it("param is badly formatted string 1.1..1", function() {
            (function() {
                new GameStage('1.1..1');
            }).should.throw();
        });

        it("param is badly formatted string 1.1..1", function() {
            (function() {
                new GameStage('1.1..1');
            }).should.throw();
        });
    });

    describe('#compare() basics -', function() {

        it("passing no parameters should return 0", function() {
            GameStage.compare().should.be.eql(0);
        });

        it("GameStage object should be equal to itself", function() {
            GameStage.compare(stage, stage).should.be.eql(0);
        });

        it("GameStage object should be equal to object literal", function() {
            GameStage.compare(stage, stage321).should.be.eql(0);
        });
    });

    describe('#compare() strings -', function() {

        it("hash-string should be equal to object literal", function() {
            GameStage.compare('3.2.1', '3.2.1').should.be.eql(0);
        });

        it("hash-string should be equal to object literal", function() {
            GameStage.compare('3.2.1', stage321).should.be.eql(0);
        });

        it("object literal should be equal to hash-string", function() {
            GameStage.compare(stage321, '3.2.1').should.be.eql(0);
        });

        it("GameStage object should be equal to hash-string", function() {
            GameStage.compare(stage, '3.2.1').should.be.eql(0);
        });

        it("hash-string should be equal to GameStage object (1)",
           function() {
               GameStage.compare('3.2.1', stage).should.be.eql(0);
        });

        it("hash-string should be ahead to its GameStage object (2)",
           function() {
               GameStage.compare('3.3.1', stage).should.be.eql(-1);
        });

        it("hash-string should be ahead to its GameStage object (3)",
           function() {
               GameStage.compare('4.2.1', stage).should.be.eql(-1);
        });

        it("hash-string should be ahead to its GameStage object (4)",
           function() {
               GameStage.compare('3.2.2', stage).should.be.eql(-1);
        });

        it("GameStage object should be behind hash-string (1)", function() {
            GameStage.compare(stage, '3.3.1').should.be.eql(1);
        });

        it("GameStage object should be behind hash-string (2)", function() {
            GameStage.compare(stage, '4.2.1').should.be.eql(1);
        });

        it("GameStage object should be behind hash-string (3)", function() {
            GameStage.compare(stage, '3.2.2').should.be.eql(1);
        });

    });

    describe('#compare() with round differential', function() {

        it("should says that the higher-round within same stage is ahead",
           function() {
               GameStage.compare('3.4.1', '3.2.2').should.be.eql(1);
           });

        it("should says that the higher-round within same stage is ahead (2)",
           function() {
               GameStage.compare('3.4.1', '3.5.2').should.be.eql(1);
           });

        it("should says that stage with higher-round, smaller-stage is behind",
           function() {
               GameStage.compare('3.4.1', '2.2.2').should.be.eql(-1);
           });

        it("should says that stage with higher-round, smaller-stage is behind",
           function() {
               GameStage.compare('3.4.1', '2.6.2').should.be.eql(-1);
           });
    });

    describe('#compare() falsy -', function() {

        it("GameStage object should be ahead of empty GameStage", function() {
            GameStage.compare(stage, stage0).should.be.eql(-1);
        });

        it("comparing a gamestage to nothing should return 1", function() {
            GameStage.compare(stage).should.be.eql(-1);
        });

        it("comparing a gamestage to null should return -1", function() {
            GameStage.compare(stage, null).should.be.eql(-1);
        });

        it("comparing a gamestage to nothing should return -1", function() {
            GameStage.compare(stage, undefined).should.be.eql(-1);
        });

        it("comparing undefined to gamestage should return 1", function() {
            GameStage.compare(undefined, stage).should.be.eql(1);
        });

        it("comparing null to gamestage should return 1", function() {
            GameStage.compare(null, stage).should.be.eql(1);
        });

    });

});
