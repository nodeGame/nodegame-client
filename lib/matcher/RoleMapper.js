/**
 * # RoleMapper
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` manager of player ids and aliases
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    var J = parent.JSUS;

    exports.RoleMapper = RoleMapper;

    /**
     * ## RoleMapper constructor
     *
     * Creates a new instance of role mapper
     */
    function RoleMapper(node) {

        /**
         * ### RoleMapper.node
         *
         * Reference to the node object
         */
        this.node = node;
        
        /**
         * ### RoleMapper.rolesArray
         *
         * The array of currently available roles
         *
         * @see RoleMapper.setRoles
         * @see RoleMapper.clearRoles
         */
        this.rolesArray = [];

        /**
         * ### RoleMapper.roles
         *
         * The roles list
         *
         * @see RoleMapper.setRoles
         * @see RoleMapper.clearRoles
         */
        this.roles = {};

        /**
         * ### RoleMapper.map
         *
         * The map roles-ids
         */
        this.map = {};

        /**
         * ### RoleMapper.matcher
         *
         * The matcher object
         *
         * TODO: maybe should be moved: (i) at node.game, or
         * inside the each algorithm
         */
        this.matcher = new parent.Matcher();
    }

    /**
     * ### RoleMapper.clear
     *
     * The roles list
     *
     * @see RoleMapper.setRoles
     * @see RoleMapper.clearRoles
     */
    RoleMapper.prototype.clear = function() {
        this.clearRoles();
        this.map = {};
        this.matcher = new parent.Matcher();
    };

    /**
     * ### RoleMapper.clearRoles
     *
     * TODO: should we just use .clear?
     */    
    RoleMapper.prototype.clearRoles = function() {
        this.rolesArray = [];
        this.roles = {};
    };

    
    /**
     * ### RoleMapper.setRoles
     *
     * Validates and sets the roles
     *
     * @param {array} roles Array of roles (string)
     * @param {number} min At least _min_ roles must be specified. Default: 2
     * @param {number} max At least _max_ roles must be specified. Default: inf
     *
     * @see RoleMapper.setRoles
     * @see RoleMapper.clearRoles
     */
    RoleMapper.prototype.setRoles = function(roles, min, max) {
        var rolesObj, role;
        var i, len;
        var min, max, err;

        if (min && 'number' !== typeof min || min < 2) {
            throw new TypeError('RoleMapper.setRoles: min must be a number ' +
                                '> 2 or undefined. Found: ' + min);
        }
        min = min || 2;
        
        if (max && 'number' !== typeof max || max < min) {
            throw new TypeError('RoleMapper.setRoles: max must be number ' +
                                'or undefined. Found: ' + max);
        }
        
        // At least two roles must be defined
        if (!J.isArray(roles)) {
            throw new TypeError('RoleMapper.setRoles: roles must be array. ' +
                                'Found: ' + roles);
        }

        len = roles.length;
        // At least two roles must be defined
        if (len < min || len > max) {
            err = 'RoleMapper.setRoles: roles must contain at least ' +
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
                throw new TypeError('RoleMapper.setRoles: each role must be ' +
                                    'a non-empty string. Found: ' + role);
            }
            rolesObj[role] = '';
        }
        // All data validated.
        this.roles = rolesObj;
        this.rolesArray = roles;
    };

    RoleMapper.prototype.roleExists = function(role) {        
        if ('string' !== typeof role || role.trim() === '') {
            throw new TypeError('RoleMapper.roleExists: role must be ' +
                                'a non-empty string. Found: ' + role);
        }
        return !!this.roles[role];
    };
    
    RoleMapper.prototype.getRole = function(role) {        
        if ('string' !== typeof role || role.trim() === '') {
            throw new TypeError('RoleMapper.getRole: role must be ' +
                                'a non-empty string. Found: ' + role);
        }
        return this.rolesMap[role] || null;
    };

    /**
     * ### RoleMapper.match
     *
     * Matches roles to ids
     *
     * @param {object} settings The settings for the requested map
     *
     * @return {array} Array of matches ready to be sent out as remote options.
     */
    RoleMapper.prototype.match = function(settings) {        
        
        // String is turned into object. Might still fail.
        if ("string" === typeof settings) settings = { match: settings };
        
        if ('object' !== typeof settings || settings === null) {
            throw new TypeError('RoleMapper.map: settings must be ' +
                                'object. Found: ' + settings);
        }
       
        if (settings.match !== 'random_pairs') {
            throw new Error('RoleMapper.match: only "random_pairs" match ' +
                            "supported. Found: " + settings.match);
        }

        return randomPairs.call(this, settings);
    };

    /**
     * ## randomPairs
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
                    this.map[id1] = r1;
                    this.map[id2] = r2;

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
                    throw new Error('RoleMapper.match: role3 required, but ' +
                                    'not found.');
                }
                soloId = id1 === 'bot' ? id2 : id1;
                this.map[soloId] = r3;

                matches.push({
                    id: soloId,
                    options: { role: r3 }
                });

            }
            match = this.matcher.getMatch();
        }
      
        // Store reference to last valid settings.
        this.mapSettings = settings;

        return matches;
    }
    
    
//     // XXXX
//     
//     (function(game) {
// 
//         var matcher, map, roles, rolesArray;
// 
//         matcher = new parent.Matcher();
//         map = {};
//         roles = {};
//         rolesArray = [];
//         return {
//             setRoles: function(roles) {
//                 rolesArray = roles;
//                 var i, len;
//                 i = -1, len = roles.length;
//                 for ( ; ++i < len ; ) {
//                     roles[roles[i]] = '';
//                 }
// 
//             },
//             roleExists: function(role) {
//                 return !!roles[role];
//             },
//             getRole: function(id) {
//                 return map[id] || null;
//             },
//             map: function(settings) {
//                 var r1, r2, r3;
//                 var match, id1, id2, soloId;
//                 var matches;
// 
//                 // TODO: what kind of settings?
//                 if (settings.map !== 'random_pairs') {
//                     throw new Error('roleMapper: ' +
//                                     'only random_pairs supported.');
//                 }
// 
//                 // TODO: integrate with the matcher.
//                 debugger
//                 r1 = settings.roles[0];
//                 r2 = settings.roles[1];
//                 r3 = settings.roles[2];
// 
//                 // Resets all roles.
//                 map = {};
// 
//                 matcher.generateMatches('random', game.pl.size());
//                 matcher.setIds(game.pl.id.getAllKeys());
// 
//                 matches = [];
//                 // Generates new random matches for this round.
//                 matcher.match(true)
//                 match = matcher.getMatch();
// 
//                 // While we have matches, send them to clients.
//                 while (match) {
//                     id1 = match[0];
//                     id2 = match[1];
//                     if (id1 !== 'bot' && id2 !== 'bot') {
//                         map[id1] = r1;
//                         map[id2] = r2;
// 
//                         matches.push({
//                             id: id1,
//                             options: { role: r1, partner: id2 }
//                         });
//                         matches.push({
//                             id: id2,
//                             options: { role: r2, partner: id1 }
//                         });
//                     }
//                     else {
//                         soloId = id1 === 'bot' ? id2 : id1;
//                         map[soloId] = r3;
// 
//                         matches.push({
//                             id: soloId,
//                             options: { role: r3 }
//                         });
// 
//                     }
//                     match = matcher.getMatch();
//                 }
//                 console.log('Matching completed.');
// 
//                 return matches;
//             }
//         };
//     })(this);
    

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
