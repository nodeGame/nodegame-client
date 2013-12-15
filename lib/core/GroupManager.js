/**
 * # GroupManager
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` group manager.
 * @experimental
 * ---
 */
(function(exports, node) {

    "use strict";

    // ## Global scope
    var J = node.JSUS;
    var NDDB = node.NDDB;
    var PlayerList = node.PlayerList;

    exports.GroupManager = GroupManager;
    exports.Group = Group;

    /**
     * ## GroupManager constructor
     *
     * Creates a new instance of Group Manager
     *
     */
    function GroupManager() {
        var that = this;

        /**
         * ## GroupManager.elements
         *
         * Elements that will be used to creates groups
         *
         * An element can be any valid javascript primitive type or object.
         * However, using objects makes the matching slower, and it can
         * might create problems with advanced matching features.
         */
        this.elements = [];
        
        /**
         * ## GroupManager.groups
         *
         * The current database of groups
         *
         * @see NDDB
         * @see Group
         */
        this.groups = new NDDB({ update: { indexes: true } });
        this.groups.index('name', function(g) { return g.name; });
        this.groups.on('insert', function(g) {
            if (that.groups.name && that.groups.name.get(g.name)) {
                throw new Error('GroupManager.insert: group name must be ' +
                                'unique: ' + g.name + '.');
            }
        });

        /**
         * ## GroupManager.scratch.
         *
         * A temporary storage object used by matching algorithms
         *
         * For example, when a matching function is used across multiple
         * game stages, it can use this space to store information.
         *
         * This object will be cleared when changing matching algorithm. 
         */
        this.scratch = {};

        /**
         * ## GroupManager.matchFunctions
         *
         * Objects literals with all available matching functions 
         *
         * @see GroupManager.addDefaultMatchFunctions
         * @see GroupManager.addMatchFunction
         */
        this.matchFunctions = {};

        /**
         * ## GroupManager.lastMatchType
         *
         * The last type of matching run. 
         *
         * @see GroupManager.match
         */
        this.lastMatchType = null;

        // Adds the default matching functions.
        this.addDefaultMatchFunctions();

    }

    /**
     * ## GroupManager.create
     *
     * Creates a new set of groups in the Group Manager
     *
     * Group names must be unique, or an error will be thrown.
     *
     * @param {array} groups The new set of groups.
     */
    GroupManager.prototype.create = function(groups) {
        var i, len, name;
        if (!J.isArray(groups)) {
            throw new TypeError('node.group.create: groups must be array.');
        }
        if (!groups.length) {
            throw new TypeError('node.group.create: groups is an empty array.');
        }

        i = -1, len = groups.length;
        for ( ; ++i < len ; ) {
            name = groups[i];
            // TODO: what if a group is already existing with the same name
            this.groups.insert(new Group({
                name: name
            }));
        }
    };

    /**
     * ## GroupManager.get
     *
     * Returns the group with the specified name
     *
     * @param {string} groupName The name of the group
     * @return {Group|null} The requested group, or null if none is found
     */
    GroupManager.prototype.get = function(groupName) {
        if ('string' !== typeof groupName) {
            throw new TypeError('GroupManager.get: groupName must be string.');
        }
        return this.groups.name.get(groupName) || null;
    };

    /**
     * ## GroupManager.removeAll
     *
     * Removes all existing groups
     */
    GroupManager.prototype.removeAll = function() {
        this.groups.clear(true);
    };


    /**
     * ## GroupManager.addElements
     *
     * Adds new elements to the group manager
     *
     * The uniqueness of each element is not checked, and depending on the
     * matching algorithm used, it may or may not be a problem.
     *
     * @param {array} The set of elements to later match
     */
    GroupManager.prototype.addElements = function(elements) {
        this.elements = this.elements.concat(elements);
    };

    /**
     * ## GroupManager.createNGroups
     *
     * Creates N new groups
     *
     * The name of each group is 'Group' + its ordinal position in the array
     * of current groups.
     *
     * @param {number} N The requested number of groups
     * @return {array} out The names of the created groups
     */
    GroupManager.prototype.createNGroups = function(N) {
        var i, len, name, out;
        if ('number' !== typeof N) {
            throw new TypeError('node.group.createNGroups: N must be number.');
        }
        if (N < 1) {
            throw new TypeError('node.group.create: N must be greater than 0.');
        }

        out = [], i = -1, len = this.groups.size();
        for ( ; ++i < N ; ) {
            name = 'Group' + ++len;
            // TODO: what if a group is already existing with the same name
            this.groups.insert(new Group({
                name: name
            }));
            out.push(name);
        }

        return out;
    };

    /**
     * ## GroupManager.assign2Group
     *
     * Manually assign one or more elements to a group
     *
     * The group must be already existing.
     *
     * @param {string} groupName The name of the group
     * @param {string|array|PlayerList} The elements to assign to a group
     * @return {Group} The updated group
     */
    GroupManager.prototype.assign2Group = function(groupName, elements) {
        var i, len, name, group;
        if ('string' !== typeof groupName) {
            throw new TypeError('node.group.assign2Group: groupName must be ' +
                                'string.');
        }
        group = this.groups.name.get(groupName);
        if (!group) {
            throw new Error('node.group.assign2Group: group not found: ' +
                            groupName + '.');
        }

        if ('string' === typeof elements) {
            elements = [elements];
        }
        else if ('object' === typeof elements &&
                 elements instanceof PlayerList) {

            elements = elements.id.getAllKeys();
        }
        else if (!J.isArray(elements)) {
            throw new TypeError('node.group.assign2Group: elements must be ' +
                                'string, array, or instance of PlayerList.');
        }

        i = -1, len = elements.length;
        for ( ; ++i < len ; ) {
            add2Group(group, elements[i], 'assign2Group');
        }
        return group;
    };

    /**
     * ## GroupManager.addMatchFunction
     *
     * Adds a new matching function to the set of available ones 
     *
     * New matching functions can be called with the _match_ method.
     *
     * Callback functions are called with the GroupManager context, so that
     * they can access the current  _groups_ and _elements_ objects. They also
     * receives any other paremeter passed along the _match_ method.
     *
     * Computation that needs to last between two subsequent executions of the
     * same matching algorithm should be stored in _GroupManager.scratch_
     *
     * @param {string} name The name of the matchig algorithm
     * @param {function} cb The matching callback function
     *
     * @see GroupManager.match
     * @see GroupManager.scratch
     * @see GroupManager.addDefaultMatchFunctions
     */
    GroupManager.prototype.addMatchFunction = function(name, cb) {
        var i, len, name, group;
        if ('string' !== typeof name) {
            throw new TypeError('node.group.addMatchFunction: name must be ' +
                                'string.');
        }
        if ('function' !== typeof cb) {
            throw new TypeError('node.group.addMatchingFunction: cb must be ' +
                                'function.');
        }

        this.matchFunctions[name] = cb;
    };

    /**
     * ## GroupManager.match
     *
     * Performs a match, given the current _groups_ and _elements_ objects 
     *
     * It stores the type of matching in the variable _lastMatchType_. If it 
     * is different from previous matching type, the _scratch_ object is
     * cleared.
     *
     * @see Group
     * @see GroupManager.groups
     * @see GroupManager.elements
     * @see GroupManager.scratch
     */
    GroupManager.prototype.match = function() {
        var type;
        type = Array.prototype.splice.call(arguments, 0, 1)[0];
        if ('string' !== typeof type) {
            throw new TypeError('node.group.match: match type must be string.');
        }
        if (!this.matchFunctions[type]) {
            throw new Error('node.group.match: unknown match type: ' + type +
                            '.');
        }        
        if (this.lastMatchType && this.lastMatchType !== type) {
            // Clearing scratch.
            this.scratch = {};
            // Setting last match type.
            this.lasMatchType = type;
        }
        // Running match function.
        this.matchFunctions[type].apply(this, arguments);
    };

    /**
     * ## GroupManager.addDefaultMatchFunctions
     *
     * Adds default matching functions.
     */
    GroupManager.prototype.addDefaultMatchFunctions = function() {

        this.matchFunctions['RANDOM'] = function() {
            var i, len, order, nGroups;
            var g, elem;
            
            nGroups = this.groups.size();

            if (!nGroups) {
                throw new Error('RANDOM match: no groups found.');
            }

            len = this.elements.length;

            if (!len) {
                throw new Error('RANDOM match: no elements to match.');
            }

            this.resetMemberships();

            order = J.sample(0, len-1);

            for (i = -1 ; ++i < len ; ) {
                g = this.groups.db[i % nGroups];
                elem = this.elements[order[i]];
                add2Group(g, elem, 'match("RANDOM")');
            }

        };
    };

    /**
     * ## GroupManager.resetMemberships
     *
     * Removes all memberships, but keeps the current groups and elements
     *
     * @see Group.reset
     */
    GroupManager.prototype.resetMemberships = function() {
        this.groups.each(function(g) {
            g.reset(true);
        });
    };

    /**
     * ## GroupManager.getMemberships
     *
     * Returns current memberships as an array or object
     *
     * @return {array|object} Array or object literals of arrays of memberships
     */
    GroupManager.prototype.getMemberships = function(array) {
        var i, len, g, members;
        i = -1, len = this.groups.db.length;
        out = array ? [] : {};
        for ( ; ++i < len ; ) {
            g = this.groups.db[i];
            members = g.getMembers();
            array ? out.push(members) : out[g.name] = members;
        }
        return out;            
    };

    /**
     * ## GroupManager.getGroups
     *
     * Returns the current groups
     *
     * @return {array} The array of groups
     * @see Group
     */
    GroupManager.prototype.getGroups = function() {
        return this.groups.db;
    };
    
    /**
     * ## GroupManager.getGroupsNames
     *
     * Returns the current group names
     *
     * @return {array} The array of group names
     */
    GroupManager.prototype.getGroupNames = function() {
        return this.groups.name.getAllKeys();
    };

    function add2Group(group, item, methodName) {
        // TODO: see if we still need a separate method.
        group.addMember(item);
    }

    // Here follows previous implementation of GroupManager, called RMatcher - scarcely commented.
    // RMatcher is not the same as a GroupManager, but does something very useful:
    // It assigns elements to groups based on a set of preferences

    // elements: what you want in the group
    // pools: array of array. it is set of preferences (elements from the first array will be used first

    // Groups.rowLimit determines how many unique elements per row

    // Group.match returns an array of length N, where N is the length of _elements_.
    // The t-th position in the matched array is the match for t-th element in the _elements_ array.
    // The matching is done trying to follow the preference in the pool.
    

    exports.RMatcher = RMatcher;
    exports.Group = Group;


    /**
     * ## RMatcher constructor
     *
     * Creates an instance of RMatcher
     *
     * @param {object} options
     */
    function RMatcher(options) {
        this.groups = [];
        this.maxIteration = 10;
        this.doneCounter = 0;
    }

    /**
     * ## RMatcher.init
     *
     * Initializes the RMatcher object
     *
     * @param array elements Array of elements (string, numbers...)
     * @param array pools Array of arrays
     */
    RMatcher.prototype.init = function(elements, pools) {
        var i, g;
        for (i = 0; i < elements.length; i++) {
            g = new Group();
            g.init(elements[i], pools[i]);
            this.addGroup(g);
        }
        this.options = {
            elements: elements,
            pools: pools
        };
    };

    /**
     * ## RMatcher.addGroup
     *
     * Adds a group in the group array
     *
     * @param Group group The group to addx
     */
    RMatcher.prototype.addGroup = function(group) {
        if ('object' !== typeof group) {
            throw new TypeError('RMatcher.addGroup: group must be object.');
        }
        this.groups.push(group);
    };

    /**
     * ## RMatcher.match
     *
     * Does the matching according to pre-specified criteria
     *
     * @return array The result of the matching
     */
    RMatcher.prototype.match = function() {
        var i;
        // Do first match.
        for (i = 0 ; i < this.groups.length ; i++) {
            this.groups[i].match();
            if (this.groups[i].matches.done) {
                this.doneCounter++;
            }
        }

        if (!this.allGroupsDone()) {
            this.assignLeftOvers();
        }

        if (!this.allGroupsDone()) {
            this.switchBetweenGroups();
        }

        return J.map(this.groups, function(g) { return g.matched; });
    };

    /**
     * ## RMatcher.inverMatched
     *
     *
     *
     * @return
     */
    RMatcher.prototype.invertMatched = function() {

        var tmp, elements = [], inverted = [];
        J.each(this.groups, function(g) {
            elements = elements.concat(g.elements);
            tmp = g.invertMatched();
            for (var i = 0; i < tmp.length; i++) {
                inverted[i] = (inverted[i] || []).concat(tmp[i]);
            }
        });

        return {
            elements: elements,
            inverted: inverted
        };
    };


    RMatcher.prototype.allGroupsDone = function() {
        return this.doneCounter === this.groups.length;
    };

    RMatcher.prototype.tryOtherLeftOvers = function(g) {
        var i;
        var group, groupId;
        var order, leftOver;

        order = J.seq(0, (this.groups.length-1));
        order = J.shuffle(order);
        for (i = 0 ; i < order.length ; i++) {
            groupId = order[i];
            if (groupId === g) continue;
            group = this.groups[groupId];
            leftOver = [];
            if (group.leftOver.length) {
                group.leftOver = this.groups[g].matchBatch(group.leftOver);

                if (this.groups[g].matches.done) {
                    this.doneCounter++;
                    return true;
                }
            }

        }
    };

    RMatcher.prototype.assignLeftOvers = function() {
        var g, i;
        for (i = 0 ; i < this.groups.length ; i++) {
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


    RMatcher.prototype.switchFromGroup = function(fromGroup, toGroup, fromRow, leftOvers) {
        var toRow, j, n, x, h, switched;
        for (toRow = 0; toRow < fromGroup.elements.length; toRow++) {

            for (j = 0; j < leftOvers.length; j++) {
                for (n = 0; n < leftOvers[j].length; n++) {

                    x = leftOvers[j][n]; // leftover n from group j

                    if (fromGroup.canSwitchIn(x, toRow)) {
                        for (h = 0 ; h < fromGroup.matched[toRow].length; h++) {
                            switched = fromGroup.matched[toRow][h];

                            if (toGroup.canAdd(switched, fromRow)) {
                                fromGroup.matched[toRow][h] = x;
                                toGroup.addToRow(switched, fromRow);
                                leftOvers[j].splice(n,1);

                                if (toGroup.matches.done) {


                                    //	console.log('is done')
                                    //	console.log(toGroup);
                                    //	console.log('is done')

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
    RMatcher.prototype.trySwitchingBetweenGroups = function(g, row) {
        var lo = this.collectLeftOver();
        var toGroup = this.groups[g];
        var i, fromGroup;
        // Tries with all, even with the same group, that is why is (g + 1)
        for (i = (g + 1) ; i < (this.groups.length + g + 1) ; i++) {
            fromGroup = this.groups[i % this.groups.length];

            if (this.switchFromGroup(fromGroup, toGroup, row, lo)) {
                if (toGroup.matches.done) return;
            }
        }

        return false;
    };



    RMatcher.prototype.switchBetweenGroups = function() {
        var i, g, j, h, diff;
        for ( i = 0; i < this.groups.length ; i++) {
            g = this.groups[i];
            // Group has free elements
            if (!g.matches.done) {
                for ( j = 0; j < g.elements.length; j++) {
                    diff = g.rowLimit - g.matched[j].length;
                    if (diff) {
                        for (h = 0 ; h < diff; h++) {
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

    /**
     * ## Group constructor
     *
     * Creates a group
     */
    function Group(options) {

        /**
         * ## Group.name
         *
         * The name of the group 
         *
         * Must be unique amongst groups
         */
        this.name = null;

        /**
         * ## Group.elements
         *
         * The elements belonging to this group
         *
         * They can be matched with other elements contained in the _pool_.
         *
         * @see Group.pool
         * @see Group.matched
         */
        this.elements = [];

        /**
         * ## Group.pool
         *
         * Sets of elements that will be tried to be added sequentially
         *
         * The first sets are more likely to be matched than subsequent ones.
         *
         * @see Group.elements
         * @see Group.matched
         */           
        this.pool = [];

        /**
         * ## Group.matched
         *
         * Array of arrays of matched elements
         *
         * Each index in the parent array corresponds to a group member,
         * and each array are the matched element for such a member.
         *
         * @see Group.elements
         * @see Group.pool
         */
        this.matched = [];

        /**
         * ## Group.leftOver
         *
         * Array of elements from the pool that could not be matched
         */
        this.leftOver = [];

        /**
         * ## Group.pointer
         *
         * Index of the row we are trying to complete currently
         */
        this.pointer = 0;

        /**
         * ## Group.matches
         *
         * Summary of matching results 
         *
         */
        this.matches = {
            total: 0,
            requested: 0,
            done: false
        };

        /**
         * ## Group.rowLimit
         *
         * Number of elements necessary to a row
         *
         * Each group member will be matched with _rowLimit_ elements from
         * the _pool_ elements.
         */
        this.rowLimit = 1;

        /**
         * ## Group.noSelf
         *
         * If TRUE, a group member cannot be matched with himself.
         */
        this.noSelf = true;
        
        /**
         * ## Group.shuffle
         *
         * If TRUE, all elements of the pool will be randomly shuffled.
         */
        this.shuffle = true;

        /**
         * ## Group.stretch
         *
         * If TRUE,  each element in the pool will be replicated 
         * as many times as the _rowLimit_ variable.
         */
        this.stretch = true;

        // Init user options.
        this.init(options);
    }

    /**
     * ## Group.init
     *
     * Mixes in default and user options 
     *
     * @param {object} options User options
     */
    Group.prototype.init = function(options) {

        this.name = 'undefined' === typeof options.name ?
            this.name : options.name;

        this.noSelf = 'undefined' === typeof options.noSelf ?
            this.noSelf : options.noSelf;

        this.shuffle = 'undefined' === typeof options.shuffle ?
            this.shuffle : options.shuffle;

        this.stretch = 'undefined' === typeof options.stretch ?
            this.stretch : options.stretch;

        this.rowLimit = 'undefined' === typeof options.rowLimit ?
            this.rowLimit : options.rowLimit;

        if (options.elements) {
            this.setElements(options.elements);
        }

        if (options.pool) {
            this.setPool(options.pool);
        }
    };

    /**
     * ## Group.setElements
     *
     * Sets the elements of the group 
     *
     * Updates the number of requested matches, and creates a new matched
     * array for each element.
     *
     * @param {array} elements The elements of the group
     */
    Group.prototype.setElements = function(elements) {
        var i;

        if (!J.isArray(elements)) {
            throw new TypeError('Group.setElements: elements must be array.');
        }

        this.elements = elements;

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
     * ## Group.addMember
     *
     * Adds a single member to the group 
     *
     * @param {mixed} member The member to add
     */
    Group.prototype.addMember = function(member) {
        var len;
        if ('undefined' === typeof member) {
            throw new TypeError('Group.addMember: member cannot be undefined.');
        }
        this.elements.push(member);
        len = this.elements.length;

        this.matches.done = false;
        this.matched[len -1] = [];
        this.matches.requested = len * this.rowLimit;
    };

    /**
     * ## Group.setPool
     *
     * Sets the pool of the group 
     *
     * A pool can contain external elements not included in the _elements_.
     *
     * If the _stretch_ option is on, each element in the pool will be copied
     * and added as many times as the _rowLimit_ variable.
     *
     * If the _shuffle_ option is on, all elements of the pool (also those 
     * created by the _stretch_ options, will be randomly shuffled.
     *
     * Notice: the pool is cloned, cyclic references in the pool object
     * are not allowed.
     *
     * @param {array} pool The pool of the group
     *
     * @see Group.shuffle
     * @see Group.stretch
     */
    Group.prototype.setPool = function(pool) {
        var i;

        if (!J.isArray(pool)) {
            throw new TypeError('Group.setPool: pool must be array.');
        }

        this.pool = J.clone(pool);

        for (i = 0; i < this.pool.length; i++) {
            if (this.stretch) {
                this.pool[i] = J.stretch(this.pool[i], this.rowLimit);
            }
            if (this.shuffle) {
                this.pool[i] = J.shuffle(this.pool[i]);
            }
        }
    };

    /**
     * ## Group.getMembers
     *
     * Returns the members of the group 
     *
     * @return {array} The elements of the group
     */
    Group.prototype.getMembers = function() {
        return this.elements;
    };

    /**
     * ## Group.canSwitchIn
     *
     * Returns TRUE, if an element has the requisite to enter a row-match
     *
     * To be eligible of a row match, the element must:
     * 
     * - not be already present in the row,
     * - be different from the row index (if the _noSelf_ option is on).
     *
     * This function is the same as _canAdd_, but does not consider row limit.
     * 
     * @param {number} x The element to add
     * @param {number} row The row index
     * @return {boolean} TRUE, if the element can be added
     */
    Group.prototype.canSwitchIn = function(x, row) {
        // Element already matched.
        if (J.in_array(x, this.matched[row])) return false;
        // No self.
        return !(this.noSelf && this.elements[row] === x);
    };

    /**
     * ## Group.canAdd
     *
     * Returns TRUE, if an element can be added to a row 
     *
     * An element can be added if the number of elements in the row is less
     * than the _rowLimit_ property, and if _canSwitchIn_ returns TRUE.
     *
     * @param {number} x The element to add
     * @param {number} row The row index
     * @return {boolean} TRUE, if the element can be added
     */
    Group.prototype.canAdd = function(x, row) {
        // Row limit reached.
        if (this.matched[row].length >= this.rowLimit) return false;
        return this.canSwitchIn(x, row);
    };

    /**
     * ## Group.shouldSwitch
     *
     * Returns TRUE if the matching is not complete
     *
     * @see Group.leftOver
     * @see Group.matched
     */
    Group.prototype.shouldSwitch = function() {
        if (!this.leftOver.length) return false;
        return this.matched.length > 1;
    };

    /**
     * ## Group.switchIt
     *
     * Tries to complete the rows of the match with missing elements
     *
     * Notice: If there is a hole, not in the last position, the algorithm fails
     */
    Group.prototype.switchIt = function() {
        var i;
        for ( i = 0; i < this.elements.length ; i++) {
            if (this.matched[i].length < this.rowLimit) {
                this.completeRow(i);
            }
        }
    };

    /**
     * ## Group.completeRow
     *
     * 
     *
     */
    Group.prototype.completeRow = function(row, leftOver) {
        var clone, i, j;
        leftOver = leftOver || this.leftOver;
        clone = leftOver.slice(0);
        for (i = 0 ; i < clone.length; i++) {
            for (j = 0 ; j < this.elements.length; j++) {
                if (this.switchItInRow(clone[i], j, row)){
                    leftOver.splice(i,1);
                    return true;
                }
                this.updatePointer();
            }
        }
        return false;
    };


    /**
     * ## Group.switchItInRow
     *
     * 
     *
     */
    Group.prototype.switchItInRow = function(x, toRow, fromRow) {
        var i, switched;
        if (!this.canSwitchIn(x, toRow)) return false;
        
        //console.log('can switch: ' + x + ' ' + toRow + ' from ' + fromRow)
        // Check if we can insert any of the element of the 'toRow'
        // inside the 'toRow'

        for (i = 0 ; i < this.matched[toRow].length; i++) {
            switched = this.matched[toRow][i];
            if (this.canAdd(switched, fromRow)) {
                this.matched[toRow][i] = x;
                this.addToRow(switched, fromRow);
                return true;
            }
        }

        return false;
    };

    /**
     * ## Group.addToRow
     *
     * 
     *
     */
    Group.prototype.addToRow = function(x, row) {
        this.matched[row].push(x);
        this.matches.total++;
        if (this.matches.total === this.matches.requested) {
            this.matches.done = true;
        }
    };

    /**
     * ## Group.addIt
     *
     * Tries to add an element to a rowx
     *
     * @param {mixed} x The element to add
     * @return {boolean} TRUE, if the element was matched
     *
     * @see Group.canAdd
     * @see Group.addToRow
     * @see Group.pointer
     */
    Group.prototype.addIt = function(x) {
        var counter, added, len;
        len = this.elements.length, counter = 0, added = false;
        // Try to add an element in any row.
        while (counter < len && !added) {
            if (this.canAdd(x, this.pointer)) {
                this.addToRow(x, this.pointer);
                added = true;
            }
            this.updatePointer();
            counter++;
        }
        return added;
    };
    
    /**
     * ## Group.matchBatch
     *
     * Tries to add a batch of elements to each of the elements of the group
     *
     * Batch elements that could not be added as a match are returned as
     * leftover.
     *
     * @param {array} pool The array of elements to match
     * @param {array} leftOver The elements from the pool that could not be
     *   matched
     *
     * @see Group.addIt
     */
    Group.prototype.matchBatch = function(pool) {
        var leftOver, i;
        leftOver = [];
        for (i = 0 ; i < pool.length ; i++) {
            if (this.matches.done || !this.addIt(pool[i])) {      
                leftOver.push(pool[i]);
            }
        }
        return leftOver;
    };

    /**
     * ## Group.match
     *
     * Matches each group member with elements from the a pool
     *
     * 
     */
    Group.prototype.match = function(pool) {
        var i, leftOver;
        pool = pool || this.pool;
        if (!J.isArray(pool)) {
            pool = [pool];
        }
        // Loop through the pools (array of array):
        // elements in earlier pools have more chances to be used
        for (i = 0 ; i < pool.length ; i++) {
            leftOver = this.matchBatch(pool[i]);
            if (leftOver.length) {
                this.leftOver = this.leftOver.concat(leftOver);
            }
        }

        if (this.shouldSwitch()) {
            this.switchIt();
        }
    };

    Group.prototype.updatePointer = function() {
        this.pointer = (this.pointer + 1) % this.elements.length;
    };

    Group.prototype.summary = function() {
        console.log('elements: ', this.elements);
        console.log('pool: ', this.pool);
        console.log('left over: ', this.leftOver);
        console.log('hits: ' + this.matches.total + '/' + this.matches.requested);
        console.log('matched: ', this.matched);
    };

    Group.prototype.invertMatched = function() {
        return J.transpose(this.matched);
    };

    /**
     * ## Group.reset
     *
     * Resets match and possibly also elements and pool.
     *
     * @param {boolean} all If TRUE, also _elements_ and _pool_ will be deletedx
     */
    Group.prototype.reset = function(all) {

        this.matched = [];
        this.leftOver = [];
        this.pointer = 0;
        this.matches = {
            total: 0,
            requested: 0,
            done: false
        };

        if (all) {
            this.elements = [];
            this.pool = [];
        }

    };

    // Testing functions

    var numbers = [1,2,3,4,5,6,7,8,9];

    function getElements() {

        var out = [],
        n = J.shuffle(numbers);
        out.push(n.splice(0, J.randomInt(0,n.length)));
        out.push(n.splice(0, J.randomInt(0,n.length)));
        out.push(n);

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
                console.log('ERROR');
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
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);