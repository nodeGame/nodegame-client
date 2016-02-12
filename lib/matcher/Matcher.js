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
     * ### Matcher.roundRobin
     *
     * Creates round robin tournament schedules
     *
     * @param {number|array} n The number of participants (>1) or
     *   an array containing the ids of the participants
     * @param {object} options Optional. Configuration object
     *   contains the following options:
     *
     *   - bye: identifier for dummy competitor. Default: -1.
     *   - skypeBye: flag whether players matched with the dummy
     *        competitor should be added or not. Default: true.
     *
     * @return The round robin matches
     */
    Matcher.roundRobin = function(n, options) {
        var rs, bye;
        var i, lenI, j, lenJ;

        if ('number' === typeof n && n > 1) {
            ps = J.seq(0, (n-1));
        }
        else if (J.isArray(n) && n.length) {
            ps = n.slice();
            n = ps.length;
        }
        else {
            throw new TypeError('Matcher.roundRobin: n must be number > 1 ' +
                                'or non-empty array.');
        }
        rs = new Array(n);
        bye = 'undefined' !== typeof options.bye ? options.bye : -1;
        skipBye = options.skipBye || false;
        if (n % 2 === 1) {
            // Make sure we have even numbers.
            ps.push(bye);
            n += 1;
        }
        i = -1, lenI = n-1;
        for ( ; ++i < lenI ; ) {
            // Create a new array for round i.
            rs[i] = [];
            j = -1, lenJ = n / 2;
            for ( ; ++j < lenJ ; ) {
                if (!skipBye || (ps[j] !== bye && ps[n - 1 - j] !== bye)) {
                    // Insert match.
                    rs[i].push([ps[j], ps[n - 1 - j]]);
                }
            }
            // Permutate for next round.
            ps.splice(1, 0, ps.pop());
        }
        return rs;
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
        this.missingId = 'bot';

        /**
         * ## Matcher.missingId
         *
         * An id used by matching algorithms to complete unfinished matches
         */
        this.bye = -1;

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

        // TODO: here
        if (options.assignerCb) this.setAssignerCb(options.assignerCb);
        if (options.ids) this.setIds(options.ids);

        // this.assignIds();
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
        var args, matches;
        if ('string' !== typeof alg) {
            throw new TypeError('Matcher.generateMatches: alg must be string.');
        }
        if (alg === 'roundrobin') {
            args = arguments[1];
            matches = Matcher.roundrobin(args);
            this.setMatches(matches);
            return matches;
        }

        throw new Error('Matcher.generateMatches: unknown algorithm: ' +
                        alg + '.');
    };

    /**
     * ### Matcher.setMatches
     *
     * Sets the matches for current instance
     *
     * Matches are a nested array containing a new array for each
     * new round a single match.
     *
     * @param {array} The array of matches
     *
     * @see this.matches
     */
    Matcher.prototype.setMatches = function(matches) {
        if (!J.isArray(matches)) {
            throw new TypeError('Matcher.setMatches: matches must be array.');
        }
        this.matches = matches;
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
        if (!J.isArray(ids)) {
            throw new TypeError('Matcher.setIds: ids must be array.');
        }
        this.ids = ids;
    };

    /**
     * ### Matcher.assignIds
     *
     * Calls the assigner callback to assign existing ids to positions
     *
     * @param {array} ids Array containing the id of the matches
     *
     * @see Matcher.ids
     */
    Matcher.prototype.assignIds = function() {
        if (!J.isArray(this.ids) || !this.ids.length) {
            throw new Error('Matcher.assignIds: no id found.');
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
        this.assignerCb = cb
    };

    /**
     * ### Matcher.match
     *
     * Substitutes the ids to the matches
     *
     * @see Matcher.resolvedMatchesById
     * @see Matcher.resolvedMatches
     */
    Matcher.prototype.match = function() {
        var i, lenI, j, lenJ, pair;
        var matched, matchedId, id1, id2, m1, m2;
        // Re-structure data in a more convenient structure,
        // substituting absolute position of the matching with player ids.
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
                id1 = importMatchItem(i, j, pair[0], this.assignedIds);
                id2 = importMatchItem(i, j, pair[1], this.assignedIds);
                if (id1) m1 = id2 || this.missingId;
                if (id2) m2 = id1 || this.missingId;
                matchedId[i][id1] = m1;
                matchedId[i][id2] = m2;

                matched[i].push([m1, m2]);
            }
        }
        // Substitute matching-structure.
        this.resolvedMatches = matched;
        this.resolvedMatchesById = matchedId;
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
     * @see Matcher.resolvedMatchesById
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

        nRows = this.matches.length - 1;
        if (x > nRows) return null;

        nCols = this.matches[x].length - 1;

        if ('undefined' === typeof y) {
            y = this.y;
            if (y < nCols) {
                this.y++;
            }
            else {
                this.x++;
                this.y = 0;
                if (this.x > nRows) return null;
            }
        }
        else if ('number' !== typeof x) {
            throw new TypeError('Matcher.getMatch: x must be number ' +
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
     *
     * @return {string} The resolved id of the item
     */
    function importMatchItem(i, j, item, map) {
        if ('number' === typeof item) {
            return map[item];
        }
        else if ('string' === typeof item) {
            return item;
        }
        throw new TypeError('Matcher.match: items can be only string or ' +
                            'number. Found: ' + item + ' at position ' +
                            i + ',' + j);
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
