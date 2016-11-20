/**
 * # Matcher
 * Copyright(c) 2016 Stefano Balietti <s.balietti@neu.edu>
 * MIT Licensed
 *
 * Class handling the creation of tournament schedules.
 *
 * http://www.nodegame.org
 * ---
 */
(function(exports, node) {

    var J = node.JSUS;

    exports.Matcher = Matcher;

    // ## Static methods.

    /**
     * ### Matcher.bye
     *
     * Symbol used to complete matching when partner is missing
     *
     * @see Matcher.matches
     */
    Matcher.bye = -1;

    /**
     * ### Matcher.missingId
     *
     * Symbol assigned to matching number without valid id
     *
     * @see Matcher.resolvedMatches
     */
    Matcher.missingId = 'bot';

    /**
     * ## Matcher.randomAssigner
     *
     * Assigns ids to positions randomly.
     *
     * @param {array} ids The ids to assign
     *
     * @return The sorted array
     *
     * @see JSUS.shuffle
     */
    Matcher.randomAssigner = function(ids) {
        return J.shuffle(ids);
    };

    /**
     * ### Matcher.linearAssigner
     *
     * Assigns ids to positions linearly.
     *
     * @param {array} ids The ids to assign
     *
     * @return The sorted array
     */
    Matcher.linearAssigner = function(ids) {
        return J.clone(ids);
    };

    /**
     * ## Matcher constructor
     *
     * Creates a new Matcher object
     *
     * @param {object} options Optional. Configuration options
     */
    function Matcher(options) {

        /**
         * ### Matcher.x
         *
         * The current round returned by Matcher.getMatch
         *
         * @see Matcher.getMatch
         */
        this.x = 0;

        /**
         * ### Matcher.y
         *
         * The next match in current round returned by Matcher.getMatch
         *
         * @see Matcher.getMatch
         */
        this.y = 0;

        /**
         * ### Matcher.matches
         *
         * Nested array of matches (with position-numbers)
         *
         * Nestes a new array for each round, and within each round
         * individual matches are also array. For example:
         *
         * ```javascript
         *
         * // Matching array.
         * [
         *
         *   // First round.
         *   [ [ p1, p2 ], [ p3, p4 ], ... ],
         *
         *   // Second round.
         *   [ [ p2, p3 ], [ p4, p1 ], ... ],
         *
         *   // Further rounds.
         * ];
         * ```
         *
         * @see Matcher.setMatches
         */
        this.matches = null;

        /**
         * ### Matcher.resolvedMatches
         *
         * Nested array of matches (with id-strings)
         *
         * Exactly Matcher.matches, but with with ids instead of numbers
         *
         * @see Matcher.matches
         * @see Matcher.setIds
         * @see Matcher.setAssignerCb
         * @see Matcher.match
         */
        this.resolvedMatches = null;

        /**
         * ### Matcher.resolvedMatchesById
         *
         * Array of maps id to partner, one map per round
         *
         * ```javascript
         *
         * // Matching array.
         * [
         *
         *   // First round.
         *   { p1: 'p2', p2: 'p1', p3: 'p4', p4: 'p3',  ... },
         *
         *   // Second round.
         *   { p2: 'p3', p3: 'p2', p4: 'p1', p1: 'p4',  ... },
         *
         *   // Further rounds.
         * ];
         * ```
         *
         * @see Matcher.resolvedMatches
         * @see Matcher.setIds
         * @see Matcher.match
         */
        this.resolvedMatchesById = null;

        /**
         * ### Matcher.ids
         *
         * Array ids to match
         *
         * @see Matcher.setIds
         */
        this.ids = null;

        /**
         * ### Matcher.ids
         *
         * Array mapping each ordinal position to an id
         *
         * @see Matcher.ids
         * @see Matcher.assignerCb
         */
        this.assignedIds = null;

        /**
         * ### Matcher.assignerCb
         *
         * Callback that assigns ids to positions
         *
         * An assigner callback must take as input an array of ids,
         * reorder them according to some criteria, and return it.
         * The order of the items in the returned array will be used to
         * match the numbers in the `matches` array.
         *
         * @see Matcher.ids
         * @see Matcher.matches
         * @see Matcher.assignedIds
         */
        this.assignerCb = Matcher.randomAssigner;

        /**
         * ## Matcher.missingId
         *
         * An id used to replace missing players ids
         */
        this.missingId = Matcher.missingId;

        /**
         * ## Matcher.missingId
         *
         * An id used by matching algorithms to complete unfinished matches
         */
        this.bye = Matcher.bye;

        // Init.
        this.init(options);
    }

    /**
     * ### Matcher.init
     *
     * Inits the Matcher instance
     *
     * @param {object} options
     */
    Matcher.prototype.init = function(options) {
        options = options || {};

        if (options.assignerCb) this.setAssignerCb(options.assignerCb);
        if (options.ids) this.setIds(options.ids);
        if (options.bye) this.bye = options.bye;
        if (options.missingId) this.missingId = options.missingId;
        if ('number' === typeof options.x) {
            if (options.x < 0) {
                throw new Error('Matcher.init: options.x cannot be negative.');
            }
            this.x = options.x;
        }
        if ('number' === typeof options.y) {
            if (options.y < 0) {
                throw new Error('Matcher.init: options.y cannot be negative.');
            }
            this.y = options.y;
        }
    };

    /**
     * ### Matcher.generateMatches
     *
     * Creates a matches array according to the chosen scheduling algorithm
     *
     * Throws an error if the selected algorithm is not found.
     *
     * @param {string} alg The chosen algorithm. Available: 'roundrobin'.
     *
     * @return {array} The array of matches
     */
    Matcher.prototype.generateMatches = function(alg) {
        var matches;
        if ('string' !== typeof alg) {
            throw new TypeError('Matcher.generateMatches: alg must be string.');
        }
        alg = alg.toLowerCase();
        if (alg === 'roundrobin' || alg === 'random') {
            if (alg === 'random' &&
                arguments[2] && arguments[2].replace === true) {

                matches = randomPairs(arguments[1], arguments[2]);
            }
            else {
                matches = pairMatcher(alg, arguments[1], arguments[2]);
            }
        }
        else {
            throw new Error('Matcher.generateMatches: unknown algorithm: ' +
                            alg + '.');
        }

        this.setMatches(matches);
        return matches;
    };

    /**
     * ### Matcher.setMatches
     *
     * Sets the matches for current instance
     *
     * Resets resolvedMatches and resolvedMatchesById to null.
     *
     * @param {array} The array of matches
     *
     * @see this.matches
     */
    Matcher.prototype.setMatches = function(matches) {
        if (!J.isArray(matches) || !matches.length) {
            throw new TypeError('Matcher.setMatches: matches must be array.');
        }
        this.matches = matches;
        resetResolvedData(this);
    };

    /**
     * ### Matcher.setIds
     *
     * Sets the ids to be used for the matches
     *
     * @param {array} ids Array containing the id of the matches
     *
     * @see Matcher.ids
     */
    Matcher.prototype.setIds = function(ids) {
        if (!J.isArray(ids) || !ids.length) {
            throw new TypeError('Matcher.setIds: ids must be array.');
        }
        this.ids = ids;
        resetResolvedData(this);
    };

    /**
     * ### Matcher.assignIds
     *
     * Calls the assigner callback to assign ids to positions
     *
     * Ids can be overwritten by parameter. If no ids are found,
     * they will be automatically generated, provided that matches
     * have been generated first.
     *
     * @param {array} ids Optinal. Array containing the id of the matches
     *   to pass to Matcher.setIds
     *
     * @see Matcher.ids
     * @see Matcher.setIds
     */
    Matcher.prototype.assignIds = function(ids) {
        if ('undefined' !== typeof ids) this.setIds(ids);
        if (!J.isArray(this.ids) || !this.ids.length) {
            if (!J.isArray(this.matches) || !this.matches.length) {
                throw new TypeError('Matcher.assignIds: no ids and no ' +
                                    'matches found.');
            }
            this.ids = J.seq(0, this.matches.length -1, 1, function(i) {
                return '' + i;
            });
        }
        this.assignedIds = this.assignerCb(this.ids);
    };

    /**
     * ### Matcher.setAssignerCb
     *
     * Specify a callback to be used to assign existing ids to positions
     *
     * @param {function} cb The assigner cb
     *
     * @see Matcher.ids
     * @see Matcher.matches
     * @see Matcher.assignerCb
     */
    Matcher.prototype.setAssignerCb = function(cb) {
        if ('function' !== typeof cb) {
            throw new TypeError('Matcher.setAssignerCb: cb must be function.');
        }
        this.assignerCb = cb;
    };

    /**
     * ### Matcher.match
     *
     * Substitutes the ids to the matches
     *
     * Populates the objects `resolvedMatchesById` and `resolvedMatches`.
     *
     * It requires to have the matches array already set, or an error
     * will be thrown.
     *
     * If the ids have not been assigned, it will do it automatically.
     *
     * @param {boolean|array} assignIds Optional. A flag to force to
     *   re-assign existing ids, or an an array containing new ids to
     *   assign.
     *
     * @see Matcher.assignIds
     * @see Matcher.resolvedMatchesById
     * @see Matcher.resolvedMatches
     *
     * TODO: creates two lists of matches with bots and without.
     * TODO: add method getMatchFor(id,x)
     */
    Matcher.prototype.match = function(assignIds) {
        var i, lenI, j, lenJ, pair;
        var matched, matchedId, id1, id2;

        if (!J.isArray(this.matches) || !this.matches.length) {
            throw new Error('Matcher.match: no matches found.');
        }

        // Assign/generate ids if not done before.
        if (!this.assignedIds || assignIds) {
            if (J.isArray(assignIds)) this.assignIds(assignIds);
            else this.assignIds();
        }

        // Parse the matches array and creates two data structures
        // where the absolute position becomes the player id.
        i = -1, lenI = this.matches.length;
        matched = new Array(lenI);
        matchedId = new Array(lenI);
        for ( ; ++i < lenI ; ) {
            j = -1, lenJ = this.matches[i].length;
            matched[i] = [];
            matchedId[i] = {};
            for ( ; ++j < lenJ ; ) {
                id1 = null, id2 = null;
                pair = this.matches[i][j];
                // Resolve matches.
                id1 = importMatchItem(i, j,
                                      pair[0],
                                      this.assignedIds,
                                      this.missingId);
                id2 = importMatchItem(i, j,
                                      pair[1],
                                      this.assignedIds,
                                      this.missingId);
                // Create resolved matches.
                matched[i].push([id1, id2]);
                matchedId[i][id1] = id2;
                matchedId[i][id2] = id1;
            }
        }
        // Substitute matching-structure.
        this.resolvedMatches = matched;
        this.resolvedMatchesById = matchedId;
        // Set getMatch indexes to 0.
        this.x = 0;
        this.y = 0;
    };

    /**
     * ### Matcher.getMatch
     *
     * Returns the next match, or the specified match
     *
     * @param {number} x Optional. The x-th round. Default: the round
     * @param {number} y Optional. The y-th match within the x-th round
     *
     * @return {array} The next or requested match, or null if not found
     *
     * @see Matcher.x
     * @see Matcher.y
     * @see Matcher.resolvedMatches
     */
    Matcher.prototype.getMatch = function(x, y) {
        var nRows, nCols;
        // Check both x and y.
        if ('undefined' === typeof x && 'undefined' !== typeof y) {
            throw new Error('Matcher.getMatch: cannot specify y without x.');
        }
        // Check if there is any match yet.
        if (!J.isArray(this.resolvedMatches) || !this.resolvedMatches.length) {
            throw new Error('Matcher.getMatch: no resolved matches found.');
        }

        // Check x.
        if ('undefined' === typeof x) {
            x = this.x;
        }
        else if ('number' !== typeof x) {
            throw new TypeError('Matcher.getMatch: x must be number ' +
                                'or undefined.');
        }
        else if (x < 0) {
            throw new Error('Matcher.getMatch: x cannot be negative');
        }
        else if ('undefined' === typeof y) {
            // Return the whole row.
            return this.resolvedMatches[x];
        }

        nRows = this.matches.length - 1;
        if (x > nRows) return null;

        nCols = this.matches[x].length - 1;

        // Check y.
        if ('undefined' === typeof y) {
            y = this.y;
            if (y < nCols) {
                this.y++;
            }
            else {
                this.x++;
                this.y = 0;
            }
        }
        else if ('number' !== typeof y) {
            throw new TypeError('Matcher.getMatch: y must be number ' +
                                'or undefined.');
        }
        else if (y < 0) {
            throw new Error('Matcher.getMatch: y cannot be negative');
        }
        else if (y > nCols) {
            return null;
        }
        return this.resolvedMatches[x][y];
    };

    /**
     * ### Matcher.getMatchObject
     *
     * Returns all the matches of the next or requested round as key-value pairs
     *
     * @param {number} x Optional. The x-th round. Default: the round
     *
     * @return {object} The next or requested match, or null if not found
     *
     * @see Matcher.x
     * @see Matcher.resolvedMatchesById
     */
    Matcher.prototype.getMatchObject = function(x) {
        var nRows;

        // Check if there is any match yet.
        if (!J.isArray(this.resolvedMatches) || !this.resolvedMatches.length) {
            throw new Error('Matcher.getMatch: no resolved matches found.');
        }

        // Check x.
        if ('undefined' === typeof x) {
            x = this.x;
            this.x++;
        }
        else if ('number' !== typeof x) {
            throw new TypeError('Matcher.getMatch: x must be number ' +
                                'or undefined.');
        }
        else if (x < 0) {
            throw new Error('Matcher.getMatch: x cannot be negative');
        }

        nRows = this.matches.length - 1;
        if (x > nRows) return null;

        return this.resolvedMatchesById[x];
    };

    /**
     * ### Matcher.clear
     *
     * Clears the matcher as it would be a newly created object
     */
    Matcher.prototype.clear = function() {
        this.x = 0;
        this.y = 0;
        this.matches = null;
        this.resolvedMatches = null;
        this.resolvedMatchesById = null;
        this.ids = null;
        this.assignedIds = null;
        this.assignerCb = Matcher.randomAssigner;
        this.missingId = Matcher.missingId;
        this.bye = Matcher.bye;
    };

    // ## Helper methods.

    /**
     * ### importMatchItem
     *
     * Handles importing items from the matches array
     *
     * Items in matches array must be numbers or strings. If numbers
     * they are translated into an id using the supplied map, otherwise
     * they are considered as already an id.
     *
     * Items that are not numbers neither strings will throw an error.
     *
     * @param {number} i The row-id of the item
     * @param {number} j The position in the row of the item
     * @param {string|number} item The item to check
     * @param {array} map The map of positions to ids
     * @param {string} miss The id of number that cannot be resolved in map
     *
     * @return {string} The resolved id of the item
     */
    function importMatchItem(i, j, item, map, miss) {
        if ('number' === typeof item) {
            return 'undefined' !== typeof map[item] ? map[item] : miss;
        }
        else if ('string' === typeof item) {
            return item;
        }
        throw new TypeError('Matcher.match: items can be only string or ' +
                            'number. Found: ' + item + ' at position ' +
                            i + ',' + j);
    }

    /**
     * ### resetResolvedData
     *
     * Resets resolved data of a matcher object
     *
     * @param {Matcher} matcher The matcher to reset
     */
    function resetResolvedData(matcher) {
        matcher.resolvedMatches = null;
        matcher.resolvedMatchesById = null;
    }

    /**
     * ### Matcher.roundRobin
     *
     *
     *
     * @return The round robin matches
     */
    Matcher.roundRobin = function(n, options) {
        return pairMatcher('roundrobin', n, options);
    };

    /**
     * ### pairMatcher
     *
     * Creates tournament schedules for different algorithms
     *
     * @param {string} alg The name of the algorithm
     *
     * @param {number|array} n The number of participants (>1) or
     *   an array containing the ids of the participants
     * @param {object} options Optional. Configuration object
     *   contains the following options:
     *
     *   - bye: identifier for dummy competitor. Default: -1.
     *   - skypeBye: flag whether players matched with the dummy
     *        competitor should be added or not. Default: true.
     *   - rounds: number of rounds to repeat matching. Default: ?
     *
     * @return {array} matches The matches according to the algorithm
     */
    function pairMatcher(alg, n, options) {
        var ps, matches, bye;
        var i, lenI, j, lenJ;
        var skipBye;

        if ('number' === typeof n && n > 1) {
            ps = J.seq(0, (n-1));
        }
        else if (J.isArray(n) && n.length > 1) {
            ps = n.slice();
            n = ps.length;
        }
        else {
            throw new TypeError('pairMatcher.' + alg + ': n must be ' +
                                'number > 1 or array of length > 1.');
        }
        options = options || {};
        matches = new Array(n-1);
        bye = 'undefined' !== typeof options.bye ? options.bye : -1;
        skipBye = options.skipBye || false;
        if (n % 2 === 1) {
            // Make sure we have even numbers.
            ps.push(bye);
            n += 1;
        }
        i = -1, lenI = n-1;
        for ( ; ++i < lenI ; ) {
            // Shuffle list of ids for random.
            if (alg === 'random') ps = J.shuffle(ps);
            // Create a new array for round i.
            matches[i] = [];
            j = -1, lenJ = n / 2;
            for ( ; ++j < lenJ ; ) {
                if (!skipBye || (ps[j] !== bye && ps[n - 1 - j] !== bye)) {
                    // Insert match.
                    matches[i].push([ps[j], ps[n - 1 - j]]);
                }
            }
            // Permutate for next round.
            ps.splice(1, 0, ps.pop());
        }
        return matches;
    }

// TODO: support limited number of rounds.

//     function pairMatcher(alg, n, options) {
//         var ps, matches, bye;
//         var i, lenI, j, lenJ;
//         var roundsLimit, odd;
//         var skipBye;
//
//         if ('number' === typeof n && n > 1) {
//             ps = J.seq(0, (n-1));
//         }
//         else if (J.isArray(n) && n.length > 1) {
//             ps = n.slice();
//             n = ps.length;
//         }
//         else {
//             throw new TypeError('pairMatcher.' + alg + ': n must be ' +
//                                 'number > 1 or array of length > 1.');
//         }
//
//         odd = (n % 2) === 1;
//         roundsLimit = n-1 ; // (odd && !skipBye) ? n+1 : n;
//
//         options = options || {};
//         if ('number' === typeof options.rounds) {
//             if (options.rounds <= 0) {
//                 throw new Error('pairMatcher.' + alg + ': options.rounds ' +
//                                 'must be a positive number or undefined. ' +
//                                 'Found: ' + options.rounds);
//             }
//             if (options.rounds > roundsLimit) {
//                 throw new Error('pairMatcher.' + alg + ': ' +
//                                 'options.rounds cannot be > than ' +
//                                 roundsLimit + '. Found: ' + options.rounds);
//             }
//             roundsLimit = options.rounds;
//         }
//
//         matches = new Array(roundsLimit);
//
//         bye = 'undefined' !== typeof options.bye ? options.bye : -1;
//         skipBye = options.skipBye || false;
//         if (n % 2 === 1) {
//             // Make sure we have even numbers.
//             ps.push(bye);
//             n += 1;
//         }
//         i = -1, lenI = roundsLimit;
//         for ( ; ++i < lenI ; ) {
//             // Shuffle list of ids for random.
//             if (alg === 'random') ps = J.shuffle(ps);
//             // Create a new array for round i.
//             matches[i] = [];
//             j = -1, lenJ = n / 2;
//             for ( ; ++j < lenJ ; ) {
//                 if (!skipBye || (ps[j] !== bye && ps[n - 1 - j] !== bye)) {
//                     // Insert match.
//                     matches[i].push([ps[j], ps[n - 1 - j]]);
//                 }
//             }
//             // Permutate for next round.
//             ps.splice(1, 0, ps.pop());
//         }
//         return matches;
//     }


// TODO: random with replacement.

//     /**
//      * ### pairMatcher
//      *
//      * Creates tournament schedules for different algorithms
//      *
//      * @param {string} alg The name of the algorithm
//      *
//      * @param {number|array} n The number of participants (>1) or
//      *   an array containing the ids of the participants
//      * @param {object} options Optional. Configuration object
//      *   contains the following options:
//      *
//      *   - rounds: the number
//      *
//      * @return {array} matches The matches according to the algorithm
//      */
//     function pairMatcherWithReplacement(n, options) {
//         var matches, i, len;
//
//         if ('number' === typeof n && n > 1) {
//             n = J.seq(0, (n-1));
//         }
//         else if (J.isArray(n) && n.length > 1) {
//             n = n.slice();
//         }
//         else {
//             throw new TypeError('pairMatcherWithReplacement: n must be ' +
//                                 'number > 1 or array of length > 1.');
//         }
//
//         i = -1, len = n.length;
//         matches = new Array(len-1);
//         for ( ; ++i < len ; ) {
//             m
//         }
//
//         return matches;
//     }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
