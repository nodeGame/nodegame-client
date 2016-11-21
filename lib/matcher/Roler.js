/**
 * # Roler
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Hadnles matching roles to players and players to players.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;

    exports.Roler = Roler;

    /**
     * ## Roler constructor
     *
     * Creates a new instance of role mapper
     */
    function Roler(node) {

        /**
         * ### Roler.node
         *
         * Reference to the node object
         */
        this.node = node;

        /**
         * ### Roler.roles
         *
         * List of available roles
         *
         * @see Roler.setRoles
         * @see Roler.clearRoles
         */
        this.roles = {};

        /**
         * ### Roler.rolesArray
         *
         * The array of currently available roles
         *
         * @see Roler.setRoles
         * @see Roler.clearRoles
         */
        this.rolesArray = [];

        /**
         * ### Roler.rolesMap
         *
         * The map roles-ids
         */
        this.rolesMap = {};

        /**
         * ### Roler.matcher
         *
         * The matcher object
         *
         * @see Matcher
         */
        this.matcher = new parent.Matcher();

        /**
         * ### Roler.lastSettings
         *
         * Reference to the last settings parsed
         */
        this.lastSettings = null;
    }

    /**
     * ### Roler.clear
     *
     * Clears current matches and roles
     *
     * @param {string} mod Optional. Modifies what must be cleared.
     *    Values: 'roles', 'matches', 'all'. Default: 'all'
     *
     * @see Roler.setRoles
     * @see Roler.clearRoles
     */
    Roler.prototype.clear = function(mod) {
        switch(mod) {
        case 'roles':
            this.clearRoles();
            break;
        case 'matches':
            this.matcher.clear();
            break;
        default:
            this.clearRoles();
            this.matcher.clear();
        }
    };

    /**
     * ### Roler.setRoles
     *
     * Validates and sets the roles
     *
     * @param {array} roles Array of roles (string)
     * @param {number} min At least _min_ roles must be specified. Default: 2
     * @param {number} max At least _max_ roles must be specified. Default: inf
     *
     * @see Roler.setRoles
     * @see Roler.clearRoles
     */
    Roler.prototype.setRoles = function(roles, min, max) {
        var rolesObj, role;
        var i, len;
        var min, max, err;

        if (min && 'number' !== typeof min || min < 2) {
            throw new TypeError('Roler.setRoles: min must be a ' +
                                'number > 2 or undefined. Found: ' + min);
        }
        min = min || 2;

        if (max && 'number' !== typeof max || max < min) {
            throw new TypeError('Roler.setRoles: max must ' +
                                'be number or undefined. Found: ' + max);
        }

        // At least two roles must be defined
        if (!J.isArray(roles)) {
            throw new TypeError('Roler.setRoles: roles must ' +
                                'be array. Found: ' + roles);
        }

        len = roles.length;
        // At least two roles must be defined
        if (len < min || len > max) {
            err = 'Roler.setRoles: roles must contain at least ' +
                min + ' roles';
            if (max) err += ' and no more than ' + max;
            err += '. Found: ' + len;
            throw new Error(err);
        }

        rolesObj = {};
        i = -1;
        for ( ; ++i < len ; ) {
            role = roles[i];
            if ('string' !== typeof role || role.trim() === '') {
                throw new TypeError('Roler.setRoles: each role ' +
                                    'must be a non-empty string. Found: ' +
                                    role);
            }
            rolesObj[role] = '';
        }
        // All data validated.
        this.roles = rolesObj;
        this.rolesArray = roles;
    };

    /**
     * ### Roler.roleExists
     *
     * Returns TRUE if the requested role exists
     *
     * @param {string} role The role to check
     *
     * @see Roler.roles
     */
    Roler.prototype.roleExists = function(role) {
        if ('string' !== typeof role || role.trim() === '') {
            throw new TypeError('Roler.roleExists: role must be ' +
                                'a non-empty string. Found: ' + role);
        }
        return !!this.roles[role];
    };

    /**
     * ### Roler.match
     *
     * Matches roles to ids
     *
     * @param {object} settings The settings for the requested map
     *
     * @return {array} Array of matches ready to be sent out as remote options.
     */
    Roler.prototype.match = function(settings) {

        // String is turned into object. Might still fail.
        if ('string' === typeof settings) settings = { match: settings };

        if ('object' !== typeof settings || settings === null) {
            throw new TypeError('Roler.match: settings must be ' +
                                'object or string. Found: ' + settings);
        }

        if (settings.match !== 'random_pairs') {
            throw new Error('Roler.match: only "random_pairs" match ' +
                            "supported. Found: " + settings.match);
        }

        return randomPairs.call(this, settings);
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
        var match, id1, id2, soloId;
        var matches, opts1, opts2, sayPartner, doRoles;

        sayPartner = 'undefined' === typeof settings.sayPartner ?
            true : !!settings.sayPartner;


        doRoles = !!settings.roles;
        if (doRoles) {
            this.setRoles(settings.roles, 2); // TODO: pass the alg name?

            r1 = settings.roles[0];
            r2 = settings.roles[1];
            r3 = settings.roles[2];

            // Resets all roles.
            this.rolesMap = {};
        }

        // TODO: This part needs to change / be conditional, depending if
        // we do roundrobin, or not.
        // Here we do a new random pair match each time.
        //////////////////////////////////////////////////////////////////
        this.matcher.generateMatches('random', this.node.game.pl.size());
        this.matcher.setIds(this.node.game.pl.id.getAllKeys());

        // Generates new random matches for this round.
        this.matcher.match(true);
        match = this.matcher.getMatch();
        /////////////////////////////////////////////////////////////////

        // TODO: determine size of array beforehand.
        matches = [];

        // While we have matches, send them to clients.
        while (match) {
            id1 = match[0];
            id2 = match[1];
            if (id1 !== 'bot' && id2 !== 'bot') {

                if (doRoles) {
                    // Create role map.
                    this.rolesMap[id1] = r1;
                    this.rolesMap[id2] = r2;

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
                matches.push(opts1);
                matches.push(opts2);
            }
            else if (doRoles) {
                if (!r3) {
                    throw new Error('Roler.match: role3 required, ' +
                                    'but not found.');
                }
                soloId = id1 === 'bot' ? id2 : id1;
                this.rolesMap[soloId] = r3;

                matches.push({
                    id: soloId,
                    options: { role: r3 }
                });

            }
            match = this.matcher.getMatch();
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
