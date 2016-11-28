/**
 * # MatcherManager
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles matching roles to players and players to players.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;

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
        this.matcher = new parent.Matcher();

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
     * Stores a reference of last matches.
     *
     * Returned matches are in a format which is ready to be sent out as
     * remote options. That is:
     *
     *     matches = [
     *         {
     *             id: 'playerId',
     *             options: {
     *                 role: "A", // optional.
     *                 partner: "XXX", // or object.
     *                 group: "yyy"
     *             }
     *         },
     *         // More matches...
     *     ];
     *
     * @param {object} settings The settings for the requested map
     *
     * @return {array} Array of matches ready to be sent out as remote options.
     *
     * @see MatcherManager.lastMatches
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

        this.lastMatches = matches;
        return matches;
    };


    // ## Helper Methods

    /**
     * ## randomPairs
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
        var r1, r2, r3;

        var ii, i, len;
        var roundMatches, nMatchesIdx, match, id1, id2, soloId;
        var matches, opts1, opts2, sayPartner, doRoles;

        var game, n;
        var nRounds;

        sayPartner = 'undefined' === typeof settings.sayPartner ?
            true : !!settings.sayPartner;


        doRoles = !!settings.roles;
        if (doRoles) {

            // Resets all roles.
            this.roler.clear();

            this.roler.setRoles(settings.roles, 2); // TODO: pass the alg name?

            r1 = settings.roles[0];
            r2 = settings.roles[1];
            r3 = settings.roles[2];
        }

        game = this.node.game;
        n = game.pl.size();

        // Settings the number of rounds.
        if ('undefined' !== typeof settings.rounds) {
            nRounds = settings.rounds;
        }
        else {
            nRounds = game.plot.getRound(game.getNextStep(), 'total');
            if (nRounds > n-1) nRounds = n-1;
        }

        // Algorithm: random.
        if (settings.match === 'random') {
            this.matcher.generateMatches('random', n, {
                rounds: nRounds,
                // cycle: settings.cycle,
                skipBye: settings.skipBye,
                bye: settings.bye
            });
            this.matcher.setIds(game.pl.id.getAllKeys());
            // Generates new random matches for this round.
            this.matcher.match(true);
        }

        // Algorithm: round robin (but only if not already initialized
        // or if reInit = true).
        else {
            if (!this.matcher.matches || settings.reInit) {
                // Make a manual copy of settings object, and generate matches.
                this.matcher.generateMatches('roundrobin', n, {
                    rounds: nRounds,
                    cycle: settings.cycle,
                    skipBye: settings.skipBye,
                    bye: settings.bye
                });
                this.matcher.setIds(game.pl.id.getAllKeys());
                // Generates matches;
                this.matcher.match(true);
            }
            else if (!this.matcher.hasNext()) {
                this.matcher.init( { x: null, y: null });
            }
        }

        // Get all the matches for round x, and increments x.
        nMatchesIdx = 'number' === typeof this.matcher.x ?
            (this.matcher.x + 1) : 0;
        roundMatches = this.matcher.getMatch(nMatchesIdx);

        len = roundMatches.length;

        // Contains one remoteOptions object per player.
        matches = ((n % 2) === 0) ?
            new Array((len*2)) :
            (settings.skipBye ? new Array((len*2)-2) : new Array((len*2)-1));

        // While we have matches, send them to clients.
        ii = i = -1;
        for ( ; ++i < len ; ) {
            ii++;
            match = roundMatches[i];
            id1 = match[0];
            id2 = match[1];
            if (id1 !== 'bot' && id2 !== 'bot') {

                if (doRoles) {
                    // Create role map.
                    this.roler.map[id1] = r1;
                    this.roler.map[id2] = r2;

                    if (!sayPartner) {
                        // Prepare options to send to players.
                        opts1 = { id: id1, options: { role: r1 } };
                        opts2 = { id: id2, options: { role: r2 } };
                    }
                    else {
                        // Prepare options to send to players.
                        opts1 = { id: id1, options: { role: r1,partner: id2 } };
                        opts2 = { id: id2, options: { role: r2,partner: id1 } };
                    }
                }
                else {
                    opts1 = { id: id1, options: { partner: id2 } };
                    opts2 = { id: id2, options: { partner: id1 } };
                }

                // Add options to array.
                matches[ii] = opts1;
                ii++;
                matches[ii] = opts2;
            }
            else if (doRoles) {
                if (!r3) {
                    throw new Error('MatcherManager.match: role3 required, ' +
                                    'but not found.');
                }
                soloId = id1 === 'bot' ? id2 : id1;
                this.roler.map[soloId] = r3;

                matches[ii] = {
                    id: soloId,
                    options: { role: r3 }
                };

            }
        }

        // Store reference to last valid settings.
        this.lastSettings = settings;

        return matches;
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
