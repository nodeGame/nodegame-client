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
    function RoleMapper() {

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
    RoleMapper.prototype.clear: function() {
        this.clearRoles();
        this.map = {};
        this.matcher = new parent.Matcher();
    };

    /**
     * ### RoleMapper.clearRoles
     *
     * TODO: should we just use .clear?
     */    
    RoleMapper.prototype.clearRoles: function() {
        this.rolesArray = [];
        this.roles = {};
    };

    
    /**
     * ### RoleMapper.setRoles
     *
     * Sets the roles
     *
     * @param {array} Array of roles (string)
     *
     * @see RoleMapper.setRoles
     * @see RoleMapper.clearRoles
     */
    RoleMapper.prototype.setRoles: function(roles) {
        var rolesObj, role;
        var i, len;

        if (!J.isArray(roles) || !roles.length) {
            throw new TypeError('RoleMapper.setRoles: roles must be array. ' +
                                'Found: ' + roles);
        }

        i = -1, len = roles.length;
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
     * ### RoleMapper.map
     *
     * Generates the roles map
     *
     * @param {object} settings The settings for the requested map
     *
     * @return {object} The roles map
     */
    RoleMapper.prototype.map = function(settings) {        
        var r1, r2, r3;
        var match, id1, id2, soloId;
        var matches;

        if ('object' !== typeof settings || !object) {
            throw new TypeError('RoleMapper.map: settings must be ' +
                                'object. Found: ' + settings);
        }
       
        // TODO: what kind of settings?
        if (settings.map !== 'random_pairs') {
            throw new Error('RoleMapper.map: only "random_pairs" supported.');
        }

        if (!J.isArray(settings.role)) {
            throw new TypeError('RoleMapper.map: "random_pairs" requires ' +
                                'settings.roles to be an array. Found:' +
                                settings.roles);
        }
        
        r1 = settings.roles[0];
        r2 = settings.roles[1];
        r3 = settings.roles[2];

        if (!this.roles[r1]) {
            throw new Error('RoleMapper.map: unknown role1: ' + r1); 
        }
        if (!this.roles[r2]) {
            throw new Error('RoleMapper.map: unknown role2: ' + r2); 
        }
        if (r3 && !this.roles[r3]) {
            throw new Error('RoleMapper.map: unknown role3: ' + r3); 
        }
        
        // Resets all roles.
        this.rolesMap = {};

        this.matcher.generateMatches('random', game.pl.size());
        this.matcher.setIds(game.pl.id.getAllKeys());

        matches = [];
        // Generates new random matches for this round.
        this.matcher.match(true)
        match = this.matcher.getMatch();

        // While we have matches, send them to clients.
        while (match) {
            id1 = match[0];
            id2 = match[1];
            if (id1 !== 'bot' && id2 !== 'bot') {
                this.map[id1] = r1;
                this.map[id2] = r2;

                matches.push({
                    id: id1,
                    options: { role: r1, partner: id2 }
                });
                matches.push({
                    id: id2,
                    options: { role: r2, partner: id1 }
                });
            }
            else {
                if (!r3) {
                    throw new Error('RoleMapper.map: role3 required, but ' +
                                    'not found.');
                }
                soloId = id1 === 'bot' ? id2 : id1;
                map[soloId] = r3;

                matches.push({
                    id: soloId,
                    options: { role: r3 }
                });

            }
            match = matcher.getMatch();
        }
        console.log('Matching completed.');

        // Store reference to last valid settings.
        this.mapSettings = settings;
        
        return matches;
    };
      
    
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
