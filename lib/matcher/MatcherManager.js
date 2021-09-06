/**
 * # MatcherManager
 * Copyright(c) 2020 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Handles matching roles to players and players to players.
 *
 * ---
 * nodegame.org
 */
(function(exports, parent) {

    "use strict";

    exports.MatcherManager = MatcherManager;

    /**
     * ## MatcherManager constructor
     *
     * Creates a new instance of role mapper
     */
    function MatcherManager(node) {

        /**
         * ### MatcherManager.node
         *
         * Reference to the node object
         */
        this.node = node;

        /**
         * ### MatcherManager.roler
         *
         * The roler object
         *
         * @see Roler
         */
        this.roler = new parent.Roler();

        /**
         * ### MatcherManager.matcher
         *
         * The matcher object
         *
         * @see Matcher
         */
        this.matcher = new parent.Matcher({ roler: this.roler });

        /**
         * ### MatcherManager.lastSettings
         *
         * Reference to the last settings parsed
         */
        this.lastSettings = null;

        /**
         * ### MatcherManager.lastMatches
         *
         * Reference to the last matches
         */
        this.lastMatches = null;

        /**
         * ### MatcherManager.lastMatchesById
         *
         * Reference to the last matches organized by id of client
         */
        this.lastMatchesById = {};
    }

    /**
     * ### MatcherManager.clear
     *
     * Clears current matches and roles
     *
     * @param {string} mod Optional. Modifies what must be cleared.
     *    Values: 'roles', 'matches', 'all'. Default: 'all'
     */
    MatcherManager.prototype.clear = function(mod) {

        this.lastMatches = null;
        this.lastSettings = null;
        this.lastMatchesById = {};

        switch(mod) {
        case 'roles':
            this.roler.clear();
            break;
        case 'matches':
            this.matcher.clear();
            break;
        default:
            this.roler.clear();
            this.matcher.clear();
        }
    };

    /**
     * ### MatcherManager.match
     *
     * Parses a conf object and returns the desired matches of roles and players
     *
     * Stores references of last settings and matches.
     *
     * Returned matches are in a format which is ready to be sent out as
     * remote options. That is:
     *
     *     matches = [
     *         {
     *             id: 'playerId',
     *             options: {
     *                 role: "A", // Optional.
     *                 partner: "partnerId", // Optional.
     *                 group: "yyy" // For future use.
     *             }
     *         },
     *         // More matches...
     *     ];
     *
     * @param {object} settings The settings to generate the matches.
     *   The object is passed to `Matcher.match`
     *
     * @return {array} Array of matches ready to be sent out as remote options.
     *
     * @see randomPairs
     * @see MatcherManager.lastMatches
     * @see MatcherManager.lastMatchesById
     * @see MatcherManager.lastSettings
     * @see Matcher.match
     * @see Game.gotoStep
     */
    MatcherManager.prototype.match = function(settings) {
        var matches;

        // String is turned into object. Might still fail.
        if ('string' === typeof settings) settings = { match: settings };

        if ('object' !== typeof settings || settings === null) {
            throw new TypeError('MatcherManager.match: settings must be ' +
                                'object or string. Found: ' + settings);
        }

        if (settings.match === 'random_pairs' ||
            (settings.match === 'round_robin' ||
             settings.match === 'roundrobin')) {

            matches = randomPairs.call(this, settings);
        }
        else {
            throw new Error('MatcherManager.match: only "random_pairs" and ' +
                            '"round_robin" algorithms supported. Found: ' +
                            settings.match);
        }

        if (!matches || !matches.length) {
            throw new Error('MatcheManager.match: "' + settings.match +
                            '" did not return matches.');
        }

        return matches;
    };

    /**
     * ### MatcherManager.getMatches
     *
     * Returns all the matches in a round in the requested format
     *
     * Accepts two parameters to specify a round, and a modifier for
     * the return value. Important! Both parameters are optional and
     * they can be passed in either order.
     *
     * Valid modifiers and return values:
     *
     *  - 'ARRAY' (default): [ [ 'id1', 'id2' ], [ 'id3', 'id4' ], ... ]
     *
     *  - 'ARRAY_ROLES': [ [ 'ROLE1', 'ROLE2' ], [ 'ROLE1', 'ROLE2' ] ]
     *
     *  - 'ARRAY_ROLES_ID': [ { ROLE1: 'id1', ROLE2: 'id2' },
     *                     { ROLE1: 'id3', ROLE2: 'id4' }, ... ]
     *
     *  - 'ARRAY_ID_ROLES': [ { id1: 'ROLE1', id2: 'ROLE2' },
     *                        { id3: 'ROLE1', id4: 'ROLE4' }, ... ]
     *
     *  - 'OBJ': { id1: 'id2', id2: 'id1', id3: 'id4', id4: 'id3' }
     *
     *  - 'OBJ_ROLES_ID': { ROLE1: [ 'id1', 'id3' ], ROLE2: [ 'id2', 'id4' ] }
     *
     *  - 'OBJ_ID_ROLES': { id1: 'ROLE1', id2: 'ROLE2',
     *                      id3: 'ROLE1', id4: 'ROLE2' }
     *
     * @param {string} mod Optional. A valid modifier (default: 'ARRAY')
     * @param {number} round Optional. The round of the matches
     *   (default: current game round).
     *
     * @return {array|object|null} The requested matches in the requested
     *   format, or null matches are not yet set
     *
     * @see round2Index
     * @see Matcher.getMatch
     * @see Matcher.getMatchObject
     * @see Roler.getRoleObj
     * @see Roler.getIdRoleObj
     */
    MatcherManager.prototype.getMatches = function(mod, round) {

        if ('string' !== typeof mod) {
            if ('undefined' !== typeof mod) {
                throw new TypeError('MatcherManager.getMatches: mod must be ' +
                                    'undefined or string. Found: ' + mod);
            }
            mod = 'ARRAY';
        }

        if ('undefined' !== typeof round && 'number' !== typeof round) {
            throw new TypeError('MatcherManager.getMatches: round ' +
                                'must be undefined or number. Found: ' + round);
        }

        if (!this.matcher.getMatches()) return null;

        round = round2Index.call(this, 'getMatches', round);

        if (mod === 'ARRAY') return this.matcher.getMatch(round);
        if (mod === 'ARRAY_ROLES') return this.roler.getRoleMatch(round);
        if (mod === 'ARRAY_ID_ROLES') return this.roler.getId2RoleMatch(round);
        if (mod === 'ARRAY_ROLES_ID') return this.roler.getRole2IdMatch(round);

        if (mod === 'OBJ') return this.matcher.getMatchObject(round);
        if (mod === 'OBJ_ROLES_ID') return this.roler.getRole2IdRoundMap(round);
        if (mod === 'OBJ_ID_ROLES') return this.roler.getId2RoleRoundMap(round);

        throw new Error('MatcherManager.getMatches: unknown modifier: ' + mod);
    };

    /**
     * ### MatcherManager.getMatchFor
     *
     * Returns the match for the specified id
     *
     * @param {string} id The id to search a match for
     * @param {number} round Optional. Specifies a round other
     *   than current (will be normalized if there are more
     *   rounds than matches)
     *
     * @return {string|null} The current match for the id, or null
     *    if the id is not found or matches are not set
     *
     * @see Matcher.getMatchFor
     * @see round2Index
     */
    MatcherManager.prototype.getMatchFor = function(id, round) {
        if (!this.matcher.getMatches()) return null;
        round = round2Index.call(this, 'getMatchFor', round);
        return this.matcher.getMatchFor(id, round);
    };

    /**
     * ### MatcherManager.getRoleFor
     *
     * Returns the role for the specified id
     *
     * @param {string} id The id to search a role for
     * @param {number} round Optional. Specifies a round other
     *   than current (will be normalized if there are more
     *   rounds than matches)
     *
     * @return {string|null} The role hold by id at the
     *    specified round or null if matches are not yet set
     *
     * @see Roler.getRolerFor
     * @see round2Index
     */
    MatcherManager.prototype.getRoleFor = function(id, round) {
        if (!this.matcher.getMatches()) return null;
        round = round2Index.call(this, 'getRoleFor', round);
        return this.roler.getRoleFor(id, round);
    };

    /**
     * ### Roler.getIdForRole
     *
     * Returns the id/s holding a roles at round x
     *
     * @param {string} role The role to check
     * @param {number} round Optional. Specifies a round other
     *   than current (will be normalized if there are more
     *   rounds than matches)
     *
     * @return {array|null} Array of id/s holding the role at round x, or
     *   null if matches are not yet set
     *
     * @see Roler.getIdForRole
     * @see round2Index
     */
    MatcherManager.prototype.getIdForRole = function(role, round) {
        if (!this.matcher.getMatches()) return null;
        round = round2Index.call(this, 'getIdForRole', round);
        return this.roler.getIdForRole(role, round);
    };

    /**
     * ### MatcherManager.getIterationRound
     *
     * Returns the pointer the round in the matcher (matches are cycled through)
     *
     * @return {number} The current iteration round
     *
     * @see Matcher.x
     * @see Matcher.hasNext
     */
    MatcherManager.prototype.getIterationRound = function() {
        return this.matcher.x || 0;
    };

    /**
     * ### MatcherManager.replaceId
     *
     * Replaces an id with a new one in all roles and matches
     *
     * If the number of players and rounds is large,
     * this operation becomes costly. Consider replacing the ID
     * manually after being returned.
     *
     * @param {string} oldId The id to be replaced
     * @param {string} newId The replacing id
     *
     * @return {boolean} TRUE, if the oldId was found and replaced
     *
     * @see Matcher.replaceId
     * @see Roler.replaceId
     *
     * @experimental
     *
     * TODO: this does not scale up. Maybe have another registry of
     * substituted ids.
     *
     * TODO: maybe return info about the replaced id, e.g. current
     * options, instead of boolean.
     */
    MatcherManager.prototype.replaceId = function(oldId, newId) {
        var res;
        res = this.matcher.replaceId(oldId, newId);
        res = res && this.roler.replaceId(oldId, newId);
        return res;
    };

    /**
     * ### MatcherManager.getSetupFor
     *
     * Returns the setup object (partner and role options) for a specific id
     *
     * @param {string} id The id to get the setup object for
     *
     * @return {object|null} The requested setup object or null if not found
     *
     * @see Matcher.match
     * @see round2index
     */
    MatcherManager.prototype.getSetupFor = function(id) {
        var out;
        if ('string' !== typeof id) {
            throw new TypeError('MatcherManager.getSetupFor: id must be ' +
                                'string. Found: ' + id);
        }
        out = this.lastMatchesById[id];
        return out || null;
    };

    // ## Helper Methods.

    /**
     * ### round2Index
     *
     * Parses a round into corresponding index of matches
     *
     * Important! Matches are 0-based, but rounds are 1-based.
     * `Matcher.normalizeRound` takes care of it.
     *
     * @param {number} round Optional. The round to parse to an index.
     *   Default: current game round.
     *
     * @return {number} The normalized round
     *
     * @see Matcher.normalizeRound
     * @see Matcher.x
     * @see Game.getCurrentGameStage
     */
    function round2Index(method, round) {
        if ('undefined' === typeof round) {
            round = this.node.game.getRound();
            if (round === 0) {
                throw new Error('MatcherManager.' + method + ': game stage ' +
                                'is 0.0.0, please specify a valid round');
            }
        }
        if ('number' === typeof round) {
            round = this.matcher.normalizeRound(round);
        }
        return round;
    }

    /**
     * ### randomPairs
     *
     * Matches players and/or roles in random pairs
     *
     * Supports odd number of players, if 3 roles are given in settings.
     *
     * @param {object} settings The settings object
     *
     * @return {array} The array of matches.
     */
    function randomPairs(settings) {
        var r1, r2;
        var ii, i, len;
        var roundMatches, nMatchesIdx, match, id1, id2, missId;
        var matches, matchesById, sayPartner, doRoles;
        var opts, roles, matchedRoles;

        var game, n;
        var nRounds;

        // Delete previous results.
        this.lastMatches = null;
        this.lastMatchesById = null;

        // Init local variables.

        matchesById = {};

        sayPartner = 'undefined' === typeof settings.sayPartner ?
            true : !!settings.sayPartner;

        doRoles = !!settings.roles;

        game = this.node.game;
        n = game.pl.size();

        // Settings the number of rounds.
        if ('undefined' !== typeof settings.rounds) {
            nRounds = settings.rounds;
        }
        else {
            nRounds = game.plot.getRound(game.getNextStep(), 'total');
        }
        if (nRounds > n-1) nRounds = n-1;

        // Algorithm: random.
        if (settings.match === 'random') {
            if (doRoles) {
                this.roler.clear();
                this.roler.setRoles(settings.roles, 2);
                this.matcher.init({ doRoles: doRoles });
            }
            this.matcher.generateMatches('random', n, {
                rounds: nRounds,
                // cycle: settings.cycle,
                skipBye: settings.skipBye,
                bye: settings.bye,
                fixedRoles: settings.fixedRoles,
                canMatchSameRole: settings.canMatchSameRole
            });
            this.matcher.setIds(game.pl.id.getAllKeys());
            // Generates new random matches for this round.
            this.matcher.match(true);
        }

        // Algorithm: round robin (but only if not already initialized
        // or if reInit = true).
        else {
            if (!this.matcher.matches || settings.reInit) {
                if (doRoles) {
                    this.roler.clear();
                    this.roler.setRoles(settings.roles, 2);
                    this.matcher.init({ doRoles: doRoles });
                }
                // Make a manual copy of settings object, and generate matches.
                this.matcher.generateMatches('roundrobin', n, {
                    rounds: nRounds,
                    cycle: settings.cycle,
                    skipBye: settings.skipBye,
                    bye: settings.bye,
                    fixedRoles: settings.fixedRoles,
                    canMatchSameRole: settings.canMatchSameRole
                });
                if (settings.assignerCb) {
                    this.matcher.setAssignerCb(settings.assignerCb);
                }
                this.matcher.setIds(game.pl.id.getAllKeys());
                // Generates matches.
                this.matcher.match(true);
            }
            // Cycle through the matches, if we do not have enough.
            else if (!this.matcher.hasNext()) {
                this.matcher.init( { x: null, y: null });
            }
        }

        // Get all the matches for round x, and increments x.
        nMatchesIdx = 'number' === typeof this.matcher.x ?
            (this.matcher.x + 1) : 0;
        // This also increments the index matcher.x.
        roundMatches = this.matcher.getMatch(nMatchesIdx);

        len = roundMatches.length;

        // Contains one remoteOptions object per player.
        matches = ((n % 2) === 0) ?
            new Array((len*2)) :
            (settings.skipBye ? new Array((len*2)-2) : new Array((len*2)-1));

        // The id in case the number of player is odd.
        missId = this.matcher.missingId;

        matchedRoles = this.roler.getRolifiedMatches();

        // While we have matches, send them to clients.
        ii = i = -1;
        for ( ; ++i < len ; ) {
            ii++;
            match = roundMatches[i];
            id1 = match[0];
            id2 = match[1];

            // Verify that id1 and id2 are still connected.
            if (!game.pl.exist(id1)) id1 = missId;
            if (!game.pl.exist(id2)) id2 = missId;

            // If both id1 and id2 are disconnected, skip matching them.
            if (id1 === id2) {
                // Reduce matches array length.
                len--;
                matches.length--;
                continue;
            }

            if (doRoles) {
                roles = matchedRoles[nMatchesIdx][i];

                // Prepare options to send to player 1, if role1 is defined.
                r1 = roles[0];

                if (r1) {
                    if (!sayPartner) {
                        opts = { id: id1, options: { role: r1 } };
                    }
                    else {
                        opts = { id: id1, options: { role: r1, partner: id2 } };
                    }
                    // Add options to array.
                    matches[ii] = opts;

                    // Keep reference.
                    matchesById[id1] = opts.options;
                }

                // Prepare options to send to player 2, if role2 is defined.
                r2 = roles[1];

                if (r2) {

                    // Increment ii index if both r1 and r2 are defined.
                    if (r1) ii++;

                    if (!sayPartner) {
                        opts = { id: id2, options: { role: r2 } };
                    }
                    else {
                        opts = { id: id2, options: { role: r2, partner: id1 } };
                    }
                    // Add options to array.
                    matches[ii] = opts;

                    // Keep reference.
                    matchesById[id2] = opts.options;
                }
            }
            else if (sayPartner) {
                if (id1 !== missId) {
                    opts = { id: id1, options: { partner: id2 } };
                    matches[ii] = opts;
                    matchesById[id1] = opts.options;
                }
                if (id2 !== missId) {
                    if (id1 !== missId) ii++;
                    opts = { id: id2, options: { partner: id1 } };
                    matches[ii] = opts;
                    matchesById[id2] = opts.options;
                }
            }
        }

        // Store references.
        this.lastMatches = matches;
        this.lastMatchesById = matchesById;
        this.lastSettings = settings;

        return matches;
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
