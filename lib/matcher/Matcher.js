/**
 * # Matcher
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Class handling the creation of tournament schedules.
 *
 * http://www.nodegame.org
 * ---
 */
(function(exports, node) {

    var J = node.JSUS;
    var Roler = node.Roler;

    // Object containing methods to fetch a match in the requested format.
    // Will be initialized later.
    var fetchMatch;

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
     * @see Roler.missingId
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

        options = options || {};

        /**
         * ### Matcher.x
         *
         * The row-index of the last returned match by Matcher.getMatch
         *
         * @see Matcher.getMatch
         */
        this.x = null;

        /**
         * ### Matcher.y
         *
         * The column-index of the last returned match by Matcher.getMatch
         *
         * @see Matcher.getMatch
         */
        this.y = null;

        /**
         * ### Matcher.matches
         *
         * Nested array of matches (with position-numbers)
         *
         * Nests a new array for each round, and within each round
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
         * This method is used both by getMatch and getMatchObject (if
         * a single match is requested).
         *
         * @see Matcher.matches
         * @see Matcher.resolvedMatchesObj
         * @see Matcher.resolvedMatchesById
         * @see Matcher.setIds
         * @see Matcher.setAssignerCb
         * @see Matcher.match
         */
        this.resolvedMatches = null;

        /**
         * ### Matcher.resolvedMatchesObj
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
         * @see Matcher.resolvedMatchesById
         * @see Matcher.setIds
         * @see Matcher.match
         */
        this.resolvedMatchesObj = null;

        /**
         * ### Matcher.resolvedMatchesById
         *
         * Maps ids to a sequence of matches
         *
         * ```javascript
         *
         * // Matching object.
         * {
         *
         *   // All rounds.
         *   p1: [ 'p2', 'p4', ... ],
         *   p2: [ 'p1', 'p3', ... ],
         *   p3: [ 'p4', 'p2', ... ],
         *   p4: [ 'p3', 'p1', ... ]
         *   ...
         *
         * };
         * ```
         *
         * @see Matcher.resolvedMatches
         * @see Matcher.resolvedMatchesObj
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
         * ### Matcher.idsMap
         *
         * Map ids to match
         *
         * @see Matcher.setIds
         */
        this.idsMap = null;

        /**
         * ### Matcher.assignedIdsMap
         *
         * Map ids to ordinal position in matches
         *
         * @see Matcher.idsMap
         * @see Matcher.assignedIds
         */
        this.assignedIdsMap = null;

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

        /**
         * ## Matcher.doObjLists
         *
         * Flag that obj lists should be created when `match` is invoked
         *
         * @see Matcher.resolvedMatchesObj
         * @see Matcher.matcher
         */
        this.doObjLists = true;

        /**
         * ## Matcher.doIdLists
         *
         * Flag that id lists should be created when `match` is invoked
         *
         * @see Matcher.resolvedMatchesById
         * @see Matcher.matcher
         */
        this.doIdLists = true;

        /**
         * ## Matcher.doRoles
         *
         * Flag that roles should be assigned when `match` is invoked
         *
         * Requires roles to be set, otherwise an error is thrown
         *
         * @see Matcher.roles
         * @see Matcher.roler
         * @see Matcher.matcher
         */
        this.doRoles = false;

        /**
         * ## Matcher.roler
         *
         * Handles assigning roles to matches
         *
         * If null here, is initialized by `init` if doRoles is TRUE.
         *
         * @see Matcher.doRoles
         * @see Matcher.init
         */
        this.roler = options.roler || null;

        /**
         * ## Matcher.roles
         *
         * Roles map created if `doRoles` is TRUE
         *
         * @see Matcher.doRoles
         * @see Matcher.roler
         * @see Matcher.matcher
         */
        this.roler = options.roler || null;

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

        if (null === options.x) this.x = null;
        else if ('number' === typeof options.x) {
            if (options.x < 0) {
                throw new Error('Matcher.init: options.x cannot be negative.' +
                                'Found: ' + options.x);
            }
            this.x = options.x;
        }
        else if (options.x) {
            throw new TypeError('Matcher.init: options.x must be number, ' +
                                'null or undefined. Found: ' + options.x);
        }

        if (null === options.y) this.y = null;
        else if ('number' === typeof options.y) {
            if (options.y < 0) {
                throw new Error('Matcher.init: options.y cannot be negative.' +
                                'Found: ' + options.y);
            }
            this.y = options.y;
        }
        else if (options.y) {
            throw new TypeError('Matcher.init: options.y must be number, ' +
                                'null or undefined. Found: ' + options.y);
        }

        if (options.doRoles || options.roles) {
            if (!this.roler) this.roler = new Roler();
            this.roler.init({
                missingId: this.missingId,
                roles: options.roles
            });
            this.doRoles = true;
        }
        else if ('undefined' !== typeof options.doRoles) {
            this.doRoles = !!options.doRoles;
        }

        if ('undefined' !== typeof options.doObjLists) {
            this.doObjLists = !!options.doObjLists;
        }

        if ('undefined' !== typeof options.doIdLists) {
            this.doIdLists = !!options.doIdLists;
        }
    };

    /**
     * ### Matcher.generateMatches
     *
     * Creates a matches array according to the chosen scheduling algorithm
     *
     * Throws an error if the selected algorithm is not found.
     *
     * @param {string} alg The chosen algorithm. Available: 'roundrobin',
     *   'random'
     *
     * @return {array} The array of matches
     */
    Matcher.prototype.generateMatches = function(alg) {
        var matches;
        if ('string' !== typeof alg) {
            throw new TypeError('Matcher.generateMatches: alg must be ' +
            'string. Found: ' + alg);
        }
        alg = alg.toLowerCase();
        if (alg === 'roundrobin' || alg === 'round_robin' ||
            alg === 'random' || alg === 'random_pairs' ) {

            matches = pairMatcher(alg, arguments[1], arguments[2]);
        }
        else {
            throw new Error('Matcher.generateMatches: unknown algorithm: ' +
                            alg);
        }

        this.setMatches(matches);
        return matches;
    };

    /**
     * ### Matcher.setMatches
     *
     * Sets the matches for current instance
     *
     * Resets resolvedMatches and resolvedMatchesObj to null.
     *
     * @param {array} The array of matches
     *
     * @see this.matches
     */
    Matcher.prototype.setMatches = function(matches) {
        if (!J.isArray(matches) || !matches.length) {
            throw new TypeError('Matcher.setMatches: matches must be a ' +
                                'non-empty array. Found: ' + matches);
        }
        this.matches = matches;
        resetResolvedData(this);
    };

    /**
     * ### Matcher.getMatches
     *
     * Returns the matches for current instance
     *
     * @return {array|null} The array of matches (NULL if not yet set)
     *
     * @see this.matches
     */
    Matcher.prototype.getMatches = function() {
        return this.matches;
    };

    /**
     * ### Matcher.setIds
     *
     * Sets the ids to be used for the matches
     *
     * @param {array} ids Array containing the id of the matches
     *
     * @see Matcher.ids
     * @see Matcher.idsMap
     */
    Matcher.prototype.setIds = function(ids) {
        var i, len;
        if (!J.isArray(ids) || !ids.length) {
            throw new TypeError('Matcher.setIds: ids must be a non-empty ' +
                                'array. Found: ' + ids);
        }
        // Keep track of all ids.
        this.idsMap = {};
        i = -1, len = ids.length;
        for ( ; ++i < len ; ) {
            // TODO: validate? Duplicated ids are fine?
            this.idsMap[ids[i]] = true;
        }
        this.ids = ids;
        resetResolvedData(this);
    };

    /**
     * ### Matcher.getIds
     *
     * Returns the ids used to created the matching
     *
     * @return {array} ids Ids in use
     *
     * @see Matcher.ids
     */
    Matcher.prototype.getIds = function() {
        return this.ids;
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
     * @param {array} ids Optional. Array containing the id of the matches
     *   to pass to Matcher.setIds
     *
     * @see Matcher.ids
     * @see Matcher.setIds
     * @see Matcher.assignedIds
     * @see Matcher.assignedIdsMap
     */
    Matcher.prototype.assignIds = function(ids) {
        var i, len;
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
        // Map all ids to its position.
        this.assignedIdsMap = {};
        i = -1, len = this.assignedIds.length;
        for ( ; ++i < len ; ) {
            this.assignedIdsMap[this.assignedIds[i]] = i;
        }
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
            throw new TypeError('Matcher.setAssignerCb: cb must be ' +
                                'function. Found: ' + cb);
        }
        this.assignerCb = cb;
    };

    /**
     * ### Matcher.match
     *
     * Substitutes the ids to the matches
     *
     * Populates the indexes:
     *
     *   - `resolvedMatches`,
     *   - `resolvedMatchesObj`,
     *   - `resolvedMatchesById`
     *
     * If the matches array is not already set, an error is thrown.
     *
     * If the ids have not been assigned, it does automatic assignment.
     *
     * @param {boolean|array} assignIds Optional. A flag to force to
     *   re-assign existing ids, or an an array containing new ids to
     *   assign.
     *
     * @see Matcher.assignIds
     * @see Matcher.resolvedMatchesObj
     * @see Matcher.resolvedMatches
     *
     * TODO: creates two lists of matches with bots and without.
     */
    Matcher.prototype.match = function(assignIds) {
        var i, lenI, j, lenJ, pair;
        var matched, matchedObj, matchedId, id1, id2;
        var roles, rolesObj, idRolesObj, r1, r2;

        if (!J.isArray(this.matches) || !this.matches.length) {
            throw new Error('Matcher.match: no matches found');
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
        matchedObj = this.doObjLists ? new Array(lenI) : null;
        matchedId = this.doIdLists ? {} : null;
        if (this.doRoles) {
            roles = new Array(lenI);
            rolesObj = new Array(lenI);
            idRolesObj = new Array(lenI);
        }
        else {
            roles = null;
            rolesObj = null;
            idRolesObj = null;
        }
        for ( ; ++i < lenI ; ) {
            j = -1, lenJ = this.matches[i].length;
            matched[i] = new Array(lenJ);
            if (this.doObjLists) matchedObj[i] = {};
            if (this.doRoles) {
                roles[i] = new Array(lenJ);
                rolesObj[i] = new Array(lenJ);
                idRolesObj[i] = new Array(lenJ);
            }
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
                // Create resolved matches:
                // Array.
                matched[i][j] = [id1, id2];
                // Obj.
                if (this.doObjLists) {
                    matchedObj[i][id1] = id2;
                    matchedObj[i][id2] = id1;
                }
                // By Id.
                if (this.doIdLists) {
                    if (!matchedId[id1]) matchedId[id1] = new Array(lenI);
                    if (!matchedId[id2]) matchedId[id2] = new Array(lenI);
                    matchedId[id1][i] = id2;
                    matchedId[id2][i] = id1;
                }
                // Roles.
                if (this.doRoles) {
                    roles[i][j] = this.roler.rolify(matched[i][j], i, j);
                    // TODO: this code is repeated in Roler.rolifyAll.
                    // make it one!
                    r1 = roles[i][j][0];
                    r2 = roles[i][j][1];
                    rolesObj[i][j] = {};
                    if (r1 !== r2) {
                        rolesObj[i][j][r1] = id1;
                        rolesObj[i][j][r2] = id2;
                    }
                    else {
                        rolesObj[i][j][r1] = [ id1, id2 ];
                    }
                    idRolesObj[i][j] = {};
                    idRolesObj[i][j][id1] = r1;
                    idRolesObj[i][j][id2] = r2;
                }
            }
        }
        // Substitute matching-structure.
        this.resolvedMatches = matched;
        this.resolvedMatchesObj = matchedObj;
        this.resolvedMatchesById = matchedId;
        this.roles = roles;
        this.rolesObj = rolesObj;
        if (this.doRoles) {
            this.roler.setRolifiedMatches(roles, false);
            this.roler.setRole2IdMatches(rolesObj, false);
            this.roler.setId2RoleMatches(idRolesObj, false);
        }
        // Set getMatch indexes to 0.
        this.x = null;
        this.y = null;
    };

    /**
     * ### Matcher.hasNext
     *
     * Returns TRUE if there is next match to be returned by getMatch
     *
     * @param {number} x Optional. The x-th round. Default: Matcher.x
     * @param {number} y Optional. The y-th match within the x-th round
     *    Default: Matcher.y
     *
     * @return {bolean} TRUE, if there exists a next match
     *
     * @see Matcher.x
     * @see Matcher.y
     * @see Matcher.resolvedMatches
     * @see hasOrGetNext
     */
    Matcher.prototype.hasNext = function(x, y) {
        return hasOrGetNext.call(this, 'hasNext', 0, x, y);
    };

    /**
     * ### Matcher.getMatch
     *
     * Returns the next match, or the specified match
     *
     * @param {number} x Optional. The x-th round. Default: Matcher.x
     * @param {number} y Optional. The y-th match within the x-th round.
     *    Default: Matcher.y
     *
     * @return {array} The next or requested match, or null if not found
     *
     * @see Matcher.x
     * @see Matcher.y
     * @see Matcher.resolvedMatches
     * @see hasOrGetNext
     */
    Matcher.prototype.getMatch = function(x, y) {
        return hasOrGetNext.call(this, 'getMatch', 1, x, y);
    };

    /**
     * ### Matcher.getMatchFor
     *
     * Returns the id/s of the next or the x-th match for the specified id
     *
     * If id lists are not generated (see `Matcher.doIdLists) an
     * error is thrown.
     *
     * @param {string} id The id to get the matches for
     * @param {number} x Optional. The x-th round. Default: Matcher.x
     *
     * @return {string|array} The next or requested match, or null if not found
     *
     * @see Matcher.x
     * @see Matcher.y
     * @see Matcher.doIdLists
     * @see Matcher.resolvedMatches
     * @see hasOrGetNext
     */
    Matcher.prototype.getMatchFor = function(id, x) {
        var out;
        if ('string' !== typeof id) {
            throw new TypeError('Matcher.getMatchFor: id must be string. ' +
                                'Found:' + id);
        }
        if (!this.resolvedMatchesById) {
            throw new Error('Matcher.getMatchFor: no id-based matches found.');
        }
        out = this.resolvedMatchesById[id];
        if (!out) return null;
        if ('undefined' === typeof x) return out;
        if ('number' === typeof x) {
            if (x >= 0 && !isNaN(x)) return x > (out.length -1) ? null : out[x];
        }
        throw new TypeError('Matcher.getMatchFor: x must be a positive ' +
                            'number or undefined. Found: ' + x);
    };

    /**
     * ### Matcher.getMatchObject
     *
     * Returns all the matches of the next or requested round as key-value pairs
     *
     * If object lists are not generated (see `Matcher.doObjLists) an
     * error is thrown.
     *
     * @param {number} x Optional. The x-th round. Default: Matcher.x
     * @param {number} y Optional. The y-th match within the x-th round.
     *    Default: Matcher.y
     *
     * @return {object|null} The next or requested match, or null if not found
     *
     * @see Matcher.x
     * @see Matcher.y
     * @see Matcher.doObjLists
     * @see Matcher.resolvedMatchesObj
     */
    Matcher.prototype.getMatchObject = function(x, y) {
        if (!this.resolvedMatchesObj) {
            throw new Error('Matcher.getMatchObject: no obj matches found.');
        }
        return hasOrGetNext.call(this, 'getMatchObject', 3, x, y);
    };

    /**
     * ### Matcher.normalizeRound
     *
     * Returns the round index given the current number of matches
     *
     * For example, if the are only 10 matches repeated in cycle,
     * but the game has 20 rounds, round 13th will have normalized
     * round index equal to 3.
     *
     * Important! Matches are 0-based, but rounds are 1-based. This
     * method takes care of it.
     *
     * @param {number} round The round to normalize
     *
     * @return {object} The next or requested match, or null if not found
     *
     * @see Matcher.x
     * @see Matcher.matches
     */
    Matcher.prototype.normalizeRound = function(round) {
        if (!this.matches) {
            throw new TypeError('Matcher.normalizeRound: no matches found.');
        }
        if ('number' !== typeof round || isNaN(round) || round < 1) {
            throw new TypeError('Matcher.normalizeRound: round must be a ' +
                                'number > 0. Found: ' + round);
        }
        return (round-1) % this.matches.length;
    };

    /**
     * ### Matcher.replaceId
     *
     * Replaces an id with a new one in all matches
     *
     * @param {string} oldId The id to be replaced
     * @param {string} newId The replacing id
     *
     * @return {boolean} TRUE, if the oldId was found and replaced
     *
     * @see MatcherManager.replaceId
     * @see Roler.replaceId
     */
    Matcher.prototype.replaceId = function(oldId, newId) {
        var m;
        var i, len, j, lenJ, h, lenH;
        var rowFound;
        if ('string' !== typeof oldId) {
            throw new TypeError('Matcher.replaceId: oldId should be string. ' +
                                'Found: ' + oldId);
        }
        if ('string' !== typeof newId || newId.trim() === '') {
            throw new TypeError('Matcher.replaceId: newId should be a ' +
                                'non-empty string. Found: ' + newId);
        }

        // No id was assigned yet.
        if (!this.resolvedMatches) return false;

        // IdsMap.
        m = this.idsMap[oldId];
        if ('undefined' === typeof m) return false;

        this.idsMap[newId] = true;
        delete this.idsMap[oldId];

        // Ids.
        m = this.ids;
        i = -1, len = m.length;
        for ( ; ++i < len ; ) {
            if (m[i] === oldId) {
                m[i] = newId;
                break;
            }
        }

        // AssignedIds and AssignedIdsMap.
        m = this.assignedIdsMap;
        m[newId] = m[oldId];
        delete m[oldId];
        this.assignedIds[m[newId]] = newId;

        // Update resolvedMatches.
        m = this.resolvedMatches;
        if (!m) return true;

        i = -1, len = m.length;
        for ( ; ++i < len ; ) {
            j = -1, lenJ = m[i].length;
            rowFound = false;
            for ( ; ++j < lenJ ; ) {
                h = -1, lenH = m[i][j].length;
                for ( ; ++h < lenH ; ) {
                    if (m[i][j][h] === oldId) {
                        m[i][j][h] = newId;
                        rowFound = true;
                        break;
                    }
                }
                if (rowFound) break;
            }
        }

        // Update resolvedMatchesObj.
        m = this.resolvedMatchesObj;

        i = -1, len = m.length;
        for ( ; ++i < len ; ) {
            for (j in m[i]) {
                if (m[i].hasOwnProperty(j)) {
                    if (j === oldId) {
                        // Do the swap.
                        m[i][newId] = m[i][oldId];
                        m[i][m[i][oldId]] = newId;
                        delete m[i][oldId];
                        break;
                    }
                }
            }
        }

        // Update resolvedMatchesById.
        m = this.resolvedMatchesById;
        for (i in m) {
            if (m.hasOwnProperty(i)) {
                if (i === oldId) {
                    m[newId] = m[oldId];
                    delete m[oldId];
                }
                else {
                    lenJ = m[i].length;
                    // THIS OPTIMIZATION DOES NOT SEEM TO WORK.
                    // In fact, there might be more matches with the same
                    // partner in sequence.
                    // And also if === 1, it should be checked.
                    // if (lenJ == 1) {
                    //     m[i][0] = newId;
                    // }
                    // else if (lenJ === 2) {
                    //     if (m[i][0] === oldId) m[i][0] = newId;
                    //     else m[i][1] = newId;
                    // }
                    // else {
                    j = -1;
                    for ( ; ++j < lenJ ; ) {
                        if (m[i][j] === oldId) {
                            m[i][j] = newId;
                        }
                    }
                    // }
                }
            }
        }

        return true;
    };

    /**
     * ### Matcher.clear
     *
     * Clears the matcher as it would be a newly created object
     */
    Matcher.prototype.clear = function() {
        this.x = null;
        this.y = null;
        this.matches = null;
        this.resolvedMatches = null;
        this.resolvedMatchesObj = null;
        this.ids = null;
        this.assignedIds = null;
        this.idsMap = null;
        this.assignedIdsMap = null;
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
        matcher.resolvedMatchesObj = null;
        matcher.resolvedMatchesById = null;
        matcher.assignedIds = null;
        matcher.assignedIdsMap = null;
    }

    /**
     * ### pairMatcherOld
     *
     * Creates tournament schedules for different algorithms
     *
     * @param {string} alg The name of the algorithm
     * @param {number|array} n The number of participants (>1) or
     *   an array containing the ids of the participants
     * @param {object} options Optional. Configuration object
     *   contains the following options:
     *
     *   - bye: identifier for dummy competitor. Default: -1.
     *   - skypeBye: flag whether players matched with the dummy
     *        competitor should be added or not. Default: true.
     *   - rounds: number of rounds to repeat matching. Default:
     *   - cycle: if there are more rounds than possible combinations
     *        this option specifies how to fill extra rounds. Available
     *        settings:
     *
     *        - 'repeat': repeats all available matches (default)
     *        - 'repeat_invert': repeats all available matches, but inverts
     *             the position of ids in the match
     *        - 'mirror': repeats all available matches in mirrored order.
     *        - 'mirror_invert': repeats all available matches in mirrored
     *              order and also inverts the position of the ids in the match
     *
     * @return {array} matches The matches according to the algorithm
     */
    function pairMatcher(alg, n, options) {
        var ps, matches, bye;
        var i, lenI, j, lenJ, jj;
        var id1, id2;
        var roundsLimit, cycle, cycleI, skipBye;
        var fixedRolesNoSameMatch;

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

        bye = 'undefined' !== typeof options.bye ? options.bye : -1;
        skipBye = options.skipBye || false;

        // Make sure we have even numbers.
        if ((n % 2) === 1) {
            ps.push(bye);
            n += 1;
        }

        // Does not work.
        if (options.fixedRoles && (options.canMatchSameRole === false)) {
            fixedRolesNoSameMatch = true;
        }

        // Limit rounds.
        if ('number' === typeof options.rounds) {
            if (options.rounds <= 0) {
                throw new Error('pairMatcher.' + alg + ': options.rounds ' +
                                'must be a positive number or undefined. ' +
                                'Found: ' + options.rounds);
            }
            if (options.rounds > (n-1)) {
                throw new Error('pairMatcher.' + alg + ': ' +
                                'options.rounds cannot be greater than ' +
                                (n-1) + '. Found: ' + options.rounds);
            }
            // Here roundsLimit does not depend on n (must be smaller).
            roundsLimit = options.rounds;
        }
        else if (fixedRolesNoSameMatch) {
            roundsLimit = Math.floor(n/2);
        }
        else {
            roundsLimit = n-1;
        }

        if ('undefined' !== typeof options.cycle) {
            cycle = options.cycle;
            if (cycle !== 'mirror_invert' && cycle !== 'mirror' &&
                cycle !== 'repeat_invert' && cycle !== 'repeat') {

                throw new Error('pairMatcher.' + alg + ': options.cycle ' +
                                'must be equal to "mirror"/"mirror_invert", ' +
                                '"repeat"/"repeat_invert" or undefined . ' +
                                'Found: ' + options.cycle);
            }

            matches = new Array(roundsLimit*2);
        }
        else {
            matches = new Array(roundsLimit);
        }

        i = -1, lenI = roundsLimit;
        for ( ; ++i < lenI ; ) {
            // Shuffle list of ids for random.
            if (alg === 'random') ps = J.shuffle(ps);
            // Create a new array for round i.
            lenJ = n / 2;
            matches[i] = skipBye ? new Array(lenJ-1) : new Array(lenJ);
            // Check if new need to cycle.
            if (cycle) {
                if (cycle === 'mirror' || cycle === 'mirror_invert') {
                    cycleI = (roundsLimit*2) -i -1;
                }
                else {
                    cycleI = i+roundsLimit;
                }
                matches[cycleI] = skipBye ?
                    new Array(lenJ-1) : new Array(lenJ);
            }
            // Counter jj is updated only if not skipBye,
            // otherwise we create holes in the matches array.
            jj = j = -1;
            for ( ; ++j < lenJ ; ) {
                if (fixedRolesNoSameMatch) {
                    id1 = ps[j*2];
                    id2 = ps[((i*2)+(j*2)+1) % n];
                }
                else {
                    id1 = ps[j];
                    id2 = ps[n - 1 - j];
                }
                if (!skipBye || (id1 !== bye && id2 !== bye)) {
                    jj++;
                    // Insert match.
                    matches[i][jj] = [ id1, id2 ];
                    // Insert cycle match (if any).
                    if (cycle === 'repeat') {
                        matches[cycleI][jj] = [ id1, id2 ];
                    }
                    else if (cycle === 'repeat_invert') {
                        matches[cycleI][jj] = [ id2, id1 ];
                    }
                    else if (cycle === 'mirror') {
                        matches[cycleI][jj] = [ id1, id2 ];
                    }
                    else if (cycle === 'mirror_invert') {
                        matches[cycleI][jj] = [ id2, id1 ];
                    }
                }
            }
            // Permutate for next round.
            if (!fixedRolesNoSameMatch) ps.splice(1, 0, ps.pop());
        }
        return matches;
    }

    /**
     * ## fetchMatch
     *
     * Maps method names to a return function to execute in case of success
     *
     *   - 0: hasNext -> returns true
     *   - 1: getMatch -> returns an array, or array of arrays
     *   - 2: getMatchFor -> returns a string
     *   - 3: getMatchObject -> returns an object
     *
     * @see hasOrGetNext
     */
    fetchMatch = [
        // hasNext.
        function() {
            return true;
        },
        // getMatch.
        function(x, y) {
            return 'number' === typeof y ?
                this.resolvedMatches[x][y] : this.resolvedMatches[x];
        },
        // getMatchFor.
        function(x, y, id) {
            if ('number' === typeof x && 'number' === typeof y) {
                return this.resolvedMatchesById[id][x];
            }
            return this.resolvedMatchesById[id];
        },
        // getMatchObject.
        function(x, y) {
            var match, res;
            if ('number' === typeof y) {
                res = {};
                match = this.resolvedMatches[x][y];
                res[match[0]] = match[1];
                res[match[1]] = match[0];
                return res;
            }
            return this.resolvedMatchesObj[x];
        }
    ];

    /**
     * ### hasOrGetNext
     *
     * Returns TRUE or the match if there is next match
     *
     * If in `get` mode it also updates the x and y indexes.
     *
     * @param {string} m The name of the method invoking it
     * @param {boolean} get TRUE, if the method should return the match
     * @param {number} x Optional. The x-th round. Default: Matcher.x
     * @param {number} y Optional. The y-th match within the x-th round
     *    Default: Matcher.y
     * @param {string} id Optional. Used by method getMatchFor
     *
     * @return {boolean|array|null} TRUE or the next match (if found),
     *   FALSE or null (if not found)
     *
     * @see Matcher.x
     * @see Matcher.y
     * @see Matcher.resolvedMatches
     * @see fetchMatch
     */
    function hasOrGetNext(m, mod, x, y, id) {
        var nRows, nCols;

        // Check if there is any match yet.
        if (!J.isArray(this.resolvedMatches) || !this.resolvedMatches.length) {
            throw new Error('Matcher.' + m + ': no resolved matches found.');
        }

        nRows = this.resolvedMatches.length - 1;

        // No x, No y get the next match.
        if ('undefined' === typeof x) {
            // Check both x and y.
            if ('undefined' !== typeof y) {
                throw new Error('Matcher.' + m +
                                ': cannot specify y without x.');
            }

            // No match was ever requested.
            if (null === this.x) {
                this.x = 0;
                this.y = 0;
                return fetchMatch[mod].call(this, 0, 0, id);
            }

            x = this.x;
            y = this.y + 1;
            if (x <= nRows) {
                nCols = this.resolvedMatches[x].length - 1;
                if (y <= nCols) {
                    if (mod) {
                        this.x = x;
                        this.y = y;
                        return fetchMatch[mod].call(this, x, y, id);
                        // return this.resolvedMatches[x][y];
                    }
                    else {
                        return true;
                    }
                }
                else {
                    x = x + 1;
                    y = 0;
                    if (mod) {
                        this.x = x;
                        this.y = y;
                    }
                    if (x <= nRows) {
                        return fetchMatch[mod].call(this, x, y, id);
                        // return mod ? this.resolvedMatches[x][y] : true;
                    }
                    else {
                        return mod ? null : false;
                    }
                }
            }
            else {
                return mod ? null : false;
            }
        }
        // End undefined x.

        // Validate x.
        if ('number' !== typeof x) {
            throw new TypeError('Matcher.' + m + ': x must be number ' +
                                'or undefined. Found: ' + x);
        }
        else if (x < 0 || isNaN(x)) {
            throw new Error('Matcher.' + m + ': x cannot be negative or NaN. ' +
                            'Found: ' + x);
        }

        if (x > nRows) {
            if (mod) {
                this.x = x;
                this.y = 0;
                return null;
            }
            else {
                return false;
            }
        }

        // Default y (whole row).
        if ('undefined' === typeof y) {
            if (mod) {
                this.x = x;
                this.y = this.resolvedMatches[nRows].length;
                // Return the whole row.
                return fetchMatch[mod].call(this, x, y, id);
                // return this.resolvedMatches[x];
            }
            else {
                return true;
            }
        }

        // Validate y.
        if ('number' !== typeof y) {
            throw new TypeError('Matcher.' + m  + ': y must be number ' +
                                'or undefined.');
        }
        else if (y < 0 || isNaN(y)) {
            throw new Error('Matcher.' + m + ': y cannot be negative or NaN. ' +
                            'Found: ' + y);
        }

        nCols = this.resolvedMatches[x].length - 1;

        // Valid x,y match.
        if (y <= nCols) {
            if (mod) {
                this.x = x;
                this.y = y;
                return fetchMatch[mod].call(this, x, y);
                // return this.resolvedMatches[x][y];
            }
            else {
                return true;
            }
        }
        // Out of bound.
        else {
            if (mod) {
                this.x = x;
                this.y = y;
                return null;
            }
            else {
                return false;
            }
        }
    }

    // ## Closure
})(
    'undefined' !== typeof node ? node : module.exports,
    'undefined' !== typeof node ? node : module.parent.exports
);
