/**
 * # GroupManager
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` group manager
 * 
 * ---
 * 
 */
(function (exports, node) {
	
// ## Global scope
	var J = node.JSUS;

	exports.GroupManager = GroupManager;

    function GroupManager() {
        // TODO GroupManager
    }

    // Here follows previous implementation of GroupManager, called RMatcher - scarcely commented.
    // RMatcher is not the same as a GroupManager, but does something very useful:
    // It assigns elements to groups based on a set of preferences

    // elements: what you want in the group
    // pools: array of array. it is set of preferences (elements from the first array will be used first

    // Groups.rowLimit determines how many unique elements per row



    exports.RMatcher = RMatcher;

    var J = require('nodegame-client').JSUS;

    function RMatcher (options) {

        this.groups = [];

        this.maxIteration = 10;

        this.doneCounter = 0;
    }

    RMatcher.prototype.init = function (elements, pools) {
        for (var i = 0; i < elements.length; i++) {
            var g = new Group();
            g.init(elements[i], pools[i]);
            this.addGroup(g);
        }

        this.options = {
            elements: elements,
            pools: pools
        };
    };

    RMatcher.prototype.addGroup = function (group) {
        if (!group) return;
        this.groups.push(group);
    };

    RMatcher.prototype.match = function() {
        // Do first match
        for (var i = 0; i < this.groups.length ; i++) {
            this.groups[i].match();
            if (this.groups[i].matches.done) {
                this.doneCounter++;
//			console.log('is done immediately')
//			console.log(i);
//			console.log('is done immediately')
            }
        }

        if (!this.allGroupsDone()) {
            this.assignLeftOvers();
        }

        if (!this.allGroupsDone()) {
            this.switchBetweenGroups();
        }

        return J.map(this.groups, function (g) { return g.matched; });
    };

    RMatcher.prototype.invertMatched = function() {

        var tmp, elements = [], inverted = [];
        J.each(this.groups, function(g) {
            elements = elements.concat(g.elements);
            tmp = g.invertMatched();
            for (var i = 0; i < tmp.length; i++) {
                inverted[i] = (inverted[i] || []).concat(tmp[i]);
            }
        });

        return { elements: elements,
            inverted: inverted
        };
    };


    RMatcher.prototype.allGroupsDone = function() {
        return this.doneCounter === this.groups.length;
    };

    RMatcher.prototype.tryOtherLeftOvers = function (g) {
        var group, groupId;
        var order = J.seq(0, (this.groups.length-1));
        order = J.shuffle(order);
        for (var i = 0 ; i < order.length ; i++) {
            groupId = order[i];
            if (groupId === g) continue;
            group = this.groups[groupId];
            leftOver = [];
            if (group.leftOver.length) {
                group.leftOver = this.groups[g].matchBatch(group.leftOver);

                if (this.groups[g].matches.done) {
                    this.doneCounter++;
//				console.log('is done with leftOver')
//				console.log(g);
//				console.log('is done with leftOver')
                    return true;
                }
            }

        }
    };

    RMatcher.prototype.assignLeftOvers = function() {
        var g;
        for ( var i = 0; i < this.groups.length ; i++) {
            g = this.groups[i];
            // Group is full
            if (!g.matches.done) {
                this.tryOtherLeftOvers(i);
            }

        }
    };

    RMatcher.prototype.collectLeftOver = function() {
        return J.map(this.groups, function(g) { return g.leftOver; });
    };


    RMatcher.prototype.switchFromGroup = function (fromGroup, toGroup, fromRow, leftOvers) {
        for (var toRow = 0; toRow < fromGroup.elements.length; toRow++) {

            for (var j = 0; j < leftOvers.length; j++) {
                for (var n = 0; n < leftOvers[j].length; n++) {

                    var x = leftOvers[j][n]; // leftover n from group j

                    if (fromGroup.canSwitchIn(x, toRow)) {
                        for (var h = 0 ; h < fromGroup.matched[toRow].length; h++) {
                            var switched = fromGroup.matched[toRow][h];

                            if (toGroup.canAdd(switched, fromRow)) {
                                fromGroup.matched[toRow][h] = x;
                                toGroup.addToRow(switched, fromRow);
                                leftOvers[j].splice(n,1);

                                if (toGroup.matches.done) {


//								console.log('is done')
//								console.log(toGroup);
//								console.log('is done')

                                    this.doneCounter++;
                                }
                                return true;
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     *
     * @param {integer} g Group index
     * @param {integer} row Row index
     */
    RMatcher.prototype.trySwitchingBetweenGroups = function (g, row) {
        var lo = this.collectLeftOver();
        var toGroup = this.groups[g];
        var fromGroup;
        // Tries with all, even with the same group, that is why is (g + 1)
        for (var i = (g + 1) ; i < (this.groups.length + g + 1) ; i++) {
            fromGroup = this.groups[i % this.groups.length];

            if (this.switchFromGroup(fromGroup, toGroup, row, lo)) {
                if (toGroup.matches.done) return;
            }
        }

        return false;
    };



    RMatcher.prototype.switchBetweenGroups = function() {
        var g, diff;
        for ( var i = 0; i < this.groups.length ; i++) {
            g = this.groups[i];
            // Group has free elements
            if (!g.matches.done) {
                for ( var j = 0; j < g.elements.length; j++) {
                    diff = g.rowLimit - g.matched[j].length;
                    if (diff) {
                        for (var h = 0 ; h < diff; h++) {
                            this.trySwitchingBetweenGroups(i, j);
                            if (this.allGroupsDone()) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };


////////////////// GROUP

    function Group() {

        this.elements = [];
        this.matched = [];

        this.leftOver = [];
        this.pointer = 0;

        this.matches = {};
        this.matches.total = 0;
        this.matches.requested = 0;
        this.matches.done = false;

        this.rowLimit = 3;

        this.noSelf = true;

        this.pool = [];

        this.shuffle = true;
        this.stretch = true;
    }

    Group.prototype.init = function (elements, pool) {
        this.elements = elements;
        this.pool = J.clone(pool);

        for (var i = 0; i < this.pool.length; i++) {
            if (this.stretch) {
                this.pool[i] = J.stretch(this.pool[i], this.rowLimit);
            }
            if (this.shuffle) {
                this.pool[i] = J.shuffle(this.pool[i]);
            }
        }

        if (!elements.length) {
            this.matches.done = true;
        }
        else {
            for (i = 0 ; i < elements.length ; i++) {
                this.matched[i] = [];
            }
        }

        this.matches.requested = this.elements.length * this.rowLimit;
    };


    /**
     * The same as canAdd, but does not consider row limit
     */
    Group.prototype.canSwitchIn = function (x, row) {
        // Element already matched
        if (J.in_array(x, this.matched[row])) return false;
        // No self
        if (this.noSelf && this.elements[row] === x) return false;

        return true;
    };


    Group.prototype.canAdd = function (x, row) {
        // Row limit reached
        if (this.matched[row].length >= this.rowLimit) return false;

        return this.canSwitchIn(x, row);
    };

    Group.prototype.shouldSwitch = function (x, fromRow) {
        if (!this.leftOver.length) return false;
        if (this.matched.length < 2) return false;
//	var actualLeftOver = this.leftOver.length;
        return true;

    };

// If there is a hole, not in the last position, the algorithm fails
    Group.prototype.switchIt = function () {

        for (var i = 0; i < this.elements.length ; i++) {
            if (this.matched[i].length < this.rowLimit) {
                this.completeRow(i);
            }
        }

    };

    Group.prototype.completeRow = function (row, leftOver) {
        leftOver = leftOver || this.leftOver;
        var clone = leftOver.slice(0);
        for (var i = 0 ; i < clone.length; i++) {
            for (var j = 0 ; j < this.elements.length; j++) {
                if (this.switchItInRow(clone[i], j, row)){
                    leftOver.splice(i,1);
                    return true;
                }
                this.updatePointer();
            }
        }
        return false;
    };


    Group.prototype.switchItInRow = function (x, toRow, fromRow) {
        if (!this.canSwitchIn(x, toRow)) {
            //console.log('cannot switch ' + x + ' ' + toRow)
            return false;
        }
        //console.log('can switch: ' + x + ' ' + toRow + ' from ' + fromRow)
        // Check if we can insert any of the element of the 'toRow'
        // inside the 'toRow'
        for (var i = 0 ; i < this.matched[toRow].length; i++) {
            var switched = this.matched[toRow][i];
            if (this.canAdd(switched, fromRow)) {
                this.matched[toRow][i] = x;
                this.addToRow(switched, fromRow);
                return true;
            }
        }

        return false;
    };

    Group.prototype.addToRow = function(x, row) {
        this.matched[row].push(x);
        this.matches.total++;
        if (this.matches.total === this.matches.requested) {
            this.matches.done = true;
        }
    };

    Group.prototype.addIt = function(x) {
        var counter = 0, added = false;
        while (counter < this.elements.length && !added) {
            if (this.canAdd(x, this.pointer)) {
                this.addToRow(x, this.pointer);
                added = true;
            }
            this.updatePointer();
            counter++;
        }
        return added;
    };


    Group.prototype.matchBatch = function (pool) {
        var leftOver = [];
        for (var i = 0 ; i < pool.length ; i++) {
            if (this.matches.done || !this.addIt(pool[i])) {
                // if we could not add it as a match, it becomes leftover
                leftOver.push(pool[i]);
            }
        }
        return leftOver;
    };

    Group.prototype.match = function (pool) {
        pool = pool || this.pool;
//	console.log('matching pool');
//	console.log(pool)
        if (!J.isArray(pool)) {
            pool = [pool];
        }
        // Loop through the pools: elements in lower
        // indexes-pools have more chances to be used
        var leftOver;
        for (var i = 0 ; i < pool.length ; i++) {
            leftOver = this.matchBatch(pool[i]);
            if (leftOver.length) {
                this.leftOver = this.leftOver.concat(leftOver);
            }
        }

        if (this.shouldSwitch()) {
            this.switchIt();
        }
    };

    Group.prototype.updatePointer = function () {
        this.pointer = (this.pointer + 1) % this.elements.length;
    };

    Group.prototype.summary = function() {
        console.log('elements: ', this.elements);
        console.log('pool: ', this.pool);
        console.log('left over: ', this.leftOver);
        console.log('hits: ' + this.matches.total + '/' + this.matches.requested);
        console.log('matched: ', this.matched);
    };

    Group.prototype.invertMatched = function () {
        return J.transpose(this.matched);
    };

    // Testing functions

    var numbers = [1,2,3,4,5,6,7,8,9];

    function getElements() {

        var out = [],
            n = J.shuffle(numbers);
        out.push(n.splice(0, J.randomInt(0,n.length)))
        out.push(n.splice(0, J.randomInt(0,n.length)))
        out.push(n)

        return J.shuffle(out);
    }



    function getPools() {
        var n = J.shuffle(numbers);
        out = [];

        var A = n.splice(0, J.randomInt(0, (n.length / 2)));
        var B = n.splice(0, J.randomInt(0, (n.length / 2)));
        var C = n;

        var A_pub = A.splice(0, J.randomInt(0, A.length));
        A = J.shuffle([A_pub, A]);

        var B_pub = B.splice(0, J.randomInt(0, B.length));
        B = J.shuffle([B_pub, B]);

        var C_pub = C.splice(0, J.randomInt(0, C.length));
        C = J.shuffle([C_pub, C]);

        return J.shuffle([A,B,C]);
    }
//console.log(getElements())
//console.log(getPools())





    function simulateMatch(N) {

        for (var i = 0 ; i < N ; i++) {

            var rm = new RMatcher(),
                elements = getElements(),
                pools = getPools();

//		console.log('NN ' , numbers);
//		console.log(elements);
//		console.log(pools)
            rm.init(elements, pools);

            var matched = rm.match();

            if (!rm.allGroupsDone()) {
                console.log('ERROR')
                console.log(rm.options.elements);
                console.log(rm.options.pools);
                console.log(matched);
            }

            for (var j = 0; j < rm.groups.length; j++) {
                var g = rm.groups[j];
                for (var h = 0; h < g.elements.length; h++) {
                    if (g.matched[h].length !== g.rowLimit) {
                        console.log('Wrong match: ' +  h);

                        console.log(rm.options.elements);
                        console.log(rm.options.pools);
                        console.log(matched);
                    }
                }
            }
        }

    }

//simulateMatch(1000000000);

//var myElements = [ [ 1, 5], [ 6, 9 ], [ 2, 3, 4, 7, 8 ] ];
//var myPools = [ [ [ ], [ 1,  5, 6, 7] ], [ [4], [ 3, 9] ], [ [], [ 2, 8] ] ];

//4.07A 25
//4.77C 25
//4.37B 25
//5.13B 25 [08 R_16]
//0.83A 25 [09 R_7]
//3.93A 25 [09 R_23]
//1.37A 25 [07 R_21]
//3.30C 25
//4.40B 25
//
//25
//
//389546331863136068
//B
//
//// submissions in r 26
//
//3.73A 26 [05 R_25]
//2.40C 26
//undefinedC 26 [05 R_25]
//4.37C 26 [06 R_19]
//6.07A 26 [06 R_19]
//undefinedB 26 [06 R_18]
//4.33C 26 [05 R_25]
//undefinedC 26 [08 R_19]
//4.40B 26
//
//
//26
//
//19868497151402574894
//A
//
//27
//
//5688413461195617580
//C
//20961392604176231
//B





//20961392604176200	SUB	A	1351591619837
//19868497151402600000	SUB	A	1351591620386
//5688413461195620000	SUB	A	1351591652731
//2019166870553500000	SUB	B	1351591653043
//389546331863136000	SUB	B	1351591653803
//1886985572967670000	SUB	C	1351591654603
//762387587655923000	SUB	C	1351591654648
//1757870795266120000	SUB	B	1351591655960
//766044637969952000	SUB	A	1351591656253

//var myElements = [ [ 3, 5 ], [ 8, 9, 1, 7, 6 ], [ 2, 4 ] ];
//var myPools = [ [ [ 6 ], [ 9, 7 ] ], [ [], [ 8, 1, 5, 4 ] ], [ [], [ 2, 3 ] ] ];

//var myElements = [ [ '13988427821680113598', '102698780807709949' ],
//  [],
//  [ '15501781841528279951' ] ]
//
//var myPools = [ [ [ '13988427821680113598', '102698780807709949' ] ],
//  [ [] ],
//   [ [ '15501781841528279951' ] ] ]
//
//
//var myRM = new RMatcher();
//myRM.init(myElements, myPools);
//
//var myMatch = myRM.match();
//
//
//for (var j = 0; j < myRM.groups.length; j++) {
//	var g = myRM.groups[j];
//	for (var h = 0; h < g.elements.length; h++) {
//		if (g.matched[h].length !== g.rowLimit) {
//			console.log('Wrong match: ' + j + '-' + h);
//
//			console.log(myRM.options.elements);
//			console.log(myRM.options.pools);
////			console.log(matched);
//		}
//	}
//}

//if (!myRM.allGroupsDone()) {
//	console.log('ERROR')
//	console.log(myElements);
//	console.log(myPools);
//	console.log(myMatch);
//
//	console.log('---')
//	J.each(myRM.groups, function(g) {
//		console.log(g.pool);
//	});
//}

//console.log(myElements);
//console.log(myPools);
//console.log('match')
//console.log(myMatch);

//console.log(myRM.invertMatched());
//console.log(J.transpose(myMatch));
//
//console.log(myRM.doneCounter);

//var poolA = [ [1, 2], [3, 4], ];
//var elementsA = [7, 1, 2, 4];
//
//var poolB = [ [5], [6], ];
//var elementsB = [3 , 8];
//
//var poolC = [ [7, 8, 9] ];
//var elementsC = [9, 5, 6, ];
//
//var A, B, C;
//
//A = new Group();
//A.init(elementsA, poolA);
//
//B = new Group();
//B.init(elementsB, poolB);
//
//C = new Group();
//C.init(elementsC, poolC);
//
//
//rm.addGroup(A);
//rm.addGroup(B);
//rm.addGroup(C);
//
//rm.match();
//

//  [ [ [ 2, 1, 4 ], [ 2, 3, 4 ], [ 1, 4, 3 ], [ 1, 2, 3 ] ],
//  [ [ 5, 6, 9 ], [ 5, 6, 7 ] ],
//  [ [ 8, 6, 5 ], [ 9, 8, 7 ], [ 9, 7, 8 ] ] ]


//console.log(rm.allGroupsDone())

//console.log(g.elements);
//console.log(g.matched);





// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);