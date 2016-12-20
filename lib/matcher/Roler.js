/**
 * # Roler
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles assigning roles to matches.
 *
 * Currently only supports assigning roles to matches of size 2.
 */
(function(exports, parent) {

    "use strict";

    // TODO: have x, y indexes like in Matcher?
    // TODO: getRoles method

    // ## Global scope
    var J = parent.JSUS;

    exports.Roler = Roler;

    // ## Static methods.

    /**
     * ### Roler.linearRolifier
     *
     * Applies roles to a single match
     *
     * This is the default callback copied over `Matcher.rolify`.
     *
     * @param {array} A match array containing two valid ids, or
     *   one id and a 'missing-id'
     *
     * @return {array} roles An array containing the roles for the match.
     *   Missing ids will receive an undefined role
     *
     * @see Roler.id2RoleMap
     * @see Roler.rolify
     * @see Roler.setRolifyCb
     */
    Roler.linearRolifier = function(match, x, y) {
        var roles, len;
        var id1, id2, soloIdx;
        len = match.length;
        if (!len) {
            throw new Error('Roler.rolify: match must be a non empty array. ' +
                            'Found: ' + match);
        }
        id1 = match[0];
        id2 = match[1];
        roles = new Array(len);
        if (id1 !== this.missingId && id2 !== this.missingId) {
            this.setRoleFor(id1, this.rolesArray[0], x);
            this.setRoleFor(id2, this.rolesArray[1], x);
            roles = [ this.rolesArray[0], this.rolesArray[1] ];
        }
        else {
            if (!this.rolesArray[2]) {
                throw new Error('Roler.rolify: role3 required, but not found.');
            }
            soloIdx = (id1 === this.missingId) ? 1 : 0;
            this.setRoleFor(match[soloIdx], this.rolesArray[2], x);
            roles[soloIdx] = this.rolesArray[2];
        }
        return roles;
    };

    /**
     * ## Roler constructor
     *
     * Creates a new instance of role mapper
     */
    function Roler() {

        /**
         * ### Roler.roles
         *
         * List of all available roles
         *
         * @see Roler.setRoles
         */
        this.roles = {};

        /**
         * ### Roler.rolesArray
         *
         * The array of currently available roles
         *
         * @see Roler.setRoles
         * @see Roler.clear
         */
        this.rolesArray = [];

        /**
         * ### Roler.id2RoleMap
         *
         * Array of maps of ids-roles per round
         */
        this.id2RoleMap = [];

        /**
         * ### Roler.role2IdMap
         *
         * Array of maps of ids-roles per round
         */
        this.role2IdMap = [];

        /**
         * ### Roler.rolesMap
         *
         * The map of all roles for all matches in all rounds
         *
         * @see Roler.rolifyAll
         * @see Roler.setRolesMap
         */
        this.rolesMap = null;

        /**
         * ### Roler.rolesMapObj
         *
         * The map of all roles and ids for all matches in all rounds
         *
         * @see Roler.rolifyAll
         * @see Roler.setRolesMap
         */
        this.rolesMapObj = null;

        /**
         * ### Roler.rolesMapObj
         *
         * The map of all roles and ids for all matches in all rounds
         *
         * @see Roler.rolifyAll
         * @see Roler.setRolesMap
         */
        this.rolesMapObjById = null;

        /**
         * ### Roler.rolify
         *
         * Callback that assigns roles to a single match
         *
         * @see Roler.linearRolifier
         */
        this.rolify = Roler.linearRolifier

        /**
         * ### Roler.missingId
         *
         * The id indicating a skipped match (i.e. a bye in a match)
         *
         * @see Matcher.missingId
         */
        this.missingId = 'bot';
    }

    /**
     * ### Roler.init
     *
     * Inits the Roler instance
     *
     * @param {object} options
     */
    Roler.prototype.init = function(options) {
        options = options || {};
        if (options.rolifyCb) this.setRolifyCb(options.rolifyCb);
        if (options.roles) this.setRoles(options.roles);
        if (options.missingId) this.missingId = options.missingId;
    };

    /**
     * ### Roler.clear
     *
     * Clears all roles lists
     */
    Roler.prototype.clear = function() {
        this.roles = {};
        this.rolesArray = [];
        this.id2RoleMap = [];
        this.role2IdMap = [];
        this.rolesMap = null;
        this.rolesMapObj = null;
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
     * @see Roler.clear
     */
    Roler.prototype.setRoles = function(roles, min, max) {
        var rolesObj, role;
        var i, len;
        var err;

        // Clear previousd data.
        this.clear();

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
            rolesObj[role] = true;
        }
        // All data validated.
        this.roles = rolesObj;
        this.rolesArray = roles;
    };

    /**
     * ### Roler.setRolesMap
     *
     * Sets a preinited role map
     *
     * @param {array} rolesMap The roles map
     * @param {boolean} validate Optional. Boolean flag to
     *   turn on/off validation. Default: TRUE
     *
     * @see Roler.rolesMap
     */
    Roler.prototype.setRolesMap = function(rolesMap, validate) {
        var i, len;
        var j, lenJ;
        if ('undefined' === typeof validate || !!validate) {
            if (!J.isArray(rolesMap) || !rolesMap.length) {
                throw new Error('Roler.setRolesMap: rolesMap must be a ' +
                                'non-empty array. Found: ' + rolesMap);
            }
            i = -1, len = rolesMap.length;
            for ( ; ++i < len ; ) {
                i = -1, lenJ = rolesMap[i].length;
                if (!lenJ) {
                    throw new Error('Roler.setRolesMap: rolesMap round ' + i +
                                    'has no elements.');
                }
                for ( ; ++i < lenJ ; ) {
                    if (!J.isArray(rolesMap[i][j])) {
                        throw new Error('Roler.setRolesMap: rolesMap round ' +
                                        + i + ' element ' + j + ' should be ' +
                                        'array. Found: ' + rolesMap[i][j]);
                    }
                    // These are specific to the rolify cb.
                    if (rolesMap[i][j].length !== 2) {
                        throw new Error('Roler.setRolesMap: roles map (' +
                                        i + ',' + j + ') was expected to have' +
                                        ' length 2: ' + rolesMap[i][j]);
                    }
                    if ('string' !== typeof rolesMap[i][j][0] ||
                        'string' !== typeof rolesMap[i][j][1] ||
                        rolesMap[i][j][0].trim() === '' ||
                        rolesMap[i][j][1].trim() === '') {

                        throw new Error('Roler.setRolesMap: roles map (' +
                                        i + ',' + j + ') has invalid ' +
                                        'elements: ' + rolesMap[i][j]);
                    }
                }

            }
        }
        this.rolesMap = rolesMap;
    };

    /**
     * ### Roler.setRolesMapObj
     *
     * Sets a preinited role-obj map
     *
     * @param {array} map The roles-obj map
     * @param {boolean} validate Optional. Boolean flag to
     *   turn on/off validation. Default: TRUE
     *
     * @see Roler.rolesMap
     */
    Roler.prototype.setRolesMapObj = function(map, validate) {
        var i, len;
        var j, lenJ;
        var k, nKeys;
        if ('undefined' === typeof validate || !!validate) {
            validateRolesMapObj('setRolesMapObj', map);
        }
        this.rolesMapObj = map;
    };

    /**
     * ### Roler.setRolesMapObjById
     *
     * Sets a preinited id-role map
     *
     * @param {array} map The roles-obj map
     * @param {boolean} validate Optional. Boolean flag to
     *   turn on/off validation. Default: TRUE
     *
     * @see Roler.rolesMap
     */
    Roler.prototype.setRolesMapObjById = function(map, validate) {
        if ('undefined' === typeof validate || !!validate) {
            validateRolesMapObj('setRolesMapObjById', map);
        }
        this.rolesMapIdObj = map;
    };

    /**
     * ### Roler.setRoleFor
     *
     * Sets the current role for the given id
     *
     * @param {string} id The id of a player
     * @param {string} role A valid role for the id
     * @param {number} x The x-th round the role is being set for
     *
     * @see Roler.id2RoleMap
     * @see Roler.role2IdMap
     */
    Roler.prototype.setRoleFor = function(id, role, x) {
        if ('string' !== typeof id) {
            throw new TypeError('Roler.setRoleFor: id must be string. Found: ' +
                                id);
        }
        if ('string' !== typeof role) {
            throw new TypeError('Roler.setRoleFor: role must be string. ' +
                                'Found: ' + role);
        }
        if (!this.roles[role]) {
            throw new Error('Roler.setRoleFor: unknown role: ' + role);
        }
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.setRoleFor: x must be a non-negative ' +
                                'number. Found: ' + x);
        }
        // Id to role.
        if (!this.id2RoleMap[x]) this.id2RoleMap[x] = {};
        this.id2RoleMap[x][id] = role;

        // Role to id.
        if (!this.role2IdMap[x]) this.role2IdMap[x] = {};
        if (!this.role2IdMap[x][role]) this.role2IdMap[x][role] = [];
        this.role2IdMap[x][role].push(id);
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
     * ### Roler.hasRole
     *
     * Returns TRUE if a given id is holding the specified role at round x
     *
     * @param {string} id The id to check
     * @param {string} role The role to check
     * @param {number} x The round to check
     *
     * @return {boolean} True if id has given role
     *
     * @see Roler.id2RoleMap
     */
    Roler.prototype.hasRole = function(id, role, x) {
        if ('string' !== typeof id) {
            throw new TypeError('Roler.hasRole: id must be string. Found: ' +
                                id);
        }
        if ('string' !== typeof role) {
            throw new TypeError('Roler.hasRole: role must be string. Found: ' +
                                role);
        }
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.hasRole: x must be a non-negative ' +
                                'number. Found: ' + x);
        }
        return this.id2RoleMap[x][id] === role;
    };

    /**
     * ### Roler.getRoleFor
     *
     * Returns the role hold by an id at round x
     *
     * @param {string} id The id to check
     * @param {number} x The round to check
     *
     * @return {string|null} The role currently hold, or null
     *    if the id is not found
     *
     * @see Roler.id2RoleMap
     */
    Roler.prototype.getRoleFor = function(id, x) {
        if ('string' !== typeof id) {
            throw new TypeError('Roler.getRoleFor: id must be string. Found: ' +
                                id);
        }
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getRoleFor: x must be a non-negative ' +
                                'number. Found: ' + x);
        }
        return this.id2RoleMap[x][id] || null;
    };

    /**
     * ### Roler.getIdForRole
     *
     * Returns the id/s holding a roles at round x
     *
     * @param {string} role The role to check
     * @param {number} x The round to check
     *
     * @return {array} Array of id/s holding the role at round x
     *
     * @see Roler.id2RoleMap
     */
    Roler.prototype.getIdForRole = function(role, x) {
        if ('string' !== typeof role) {
            throw new TypeError('Roler.getIdForRole: role must be string. ' +
                                'Found: ' + id);
        }
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getIdForRole: x must be a ' +
                                'non-negative number. Found: ' + x);
        }
        return this.role2IdMap[x][role] || [];
    };

    /**
     * ### Roler.getRole
     *
     * Returns the requested roles
     *
     * @param {number} x The round of the roles
     * @param {number} y Optional. The y-th role within round x
     *
     * @return {object|null} The role/s requested or null
     *    if the x or y indexes are out of bounds
     *
     * @see Roler.rolesMap
     */
    Roler.prototype.getRole = function(x, y) {
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getRole: x must be a non-negative ' +
                                'number. Found: ' + x);
        }

        if ('undefined' === typeof y) {
            return this.rolesMap[x] || null;
        }

        if ('number' !== typeof y || y < 0 || isNaN(y)) {
            throw new TypeError('Roler.getRole: y must be a non-negative ' +
                                'number. Found: ' + y);
        }

        return this.rolesMap[x][y] || null;
    };

    /**
     * ### Roler.getRoleObj
     *
     * Returns the requested roles
     *
     * @param {number} x The round of the roles
     * @param {number} y Optional. The y-th role within round x
     *
     * @return {object|null} The role/s requested or null
     *    if the x or y indexes are out of bounds
     *
     * @see Roler.rolesMap
     */
    Roler.prototype.getRoleObj = function(x, y) {
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getRoleObj: x must be a non-negative ' +
                                'number. Found: ' + x);
        }

        if ('undefined' === typeof y) {
            return this.role2IdMap[x] || null;
        }

        if ('number' !== typeof y || y < 0 || isNaN(y)) {
            throw new TypeError('Roler.getRoleObj: y must be a non-negative ' +
                                'number. Found: ' + y);
        }

        return this.role2IdMap[x][y] || null;
    };

    /**
     * ### Roler.getIdRoleObj
     *
     * Returns the requested roles
     *
     * @param {number} x The round of the roles
     * @param {number} y Optional. The y-th role within round x
     *
     * @return {object|null} The role/s requested or null
     *    if the x or y indexes are out of bounds
     *
     * @see Roler.rolesMap
     */
    Roler.prototype.getIdRoleObj = function(x, y) {
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getRoleObj: x must be a non-negative ' +
                                'number. Found: ' + x);
        }

        if ('undefined' === typeof y) {
            return this.id2RoleMap[x] || null;
        }

        if ('number' !== typeof y || y < 0 || isNaN(y)) {
            throw new TypeError('Roler.getRoleObj: y must be a non-negative ' +
                                'number. Found: ' + y);
        }

        return this.id2RoleMap[x][y] || null;
    };

    /**
     * ### Roler.setRolifyCb
     *
     * Sets the callback assigning the roles
     *
     * The callback takes as input a match array, and optionally its
     * x and y coordinates in the array of matches.
     *
     * @param {function} cb The rolifier cb
     *
     * @see Roler.rolify
     */
    Roler.prototype.setRolifyCb = function(cb) {
        if ('function' !== typeof cb) {
            throw new TypeError('Roler.setRolifyCb: cb must be function. ' +
                                'Found: ' + cb);
        }
        this.rolify = cb;
    };

    /**
     * ### Roler.rolifyAll
     *
     * Applies roles to all matches
     *
     * @param {array} Array of array of matches
     *
     * @return {array} rolesMap The full maps of roles
     *
     * @see Roler.rolesMap
     */
    Roler.prototype.rolifyAll = function(matches) {
        var i, len, j, lenJ, row, rolesMap;
        if (!J.isArray(matches) || !matches.length) {
            throw new Error('Roler.rolifyAll: match must be a non empty ' +
                            'array. Found: ' + matches);
        }
        i = -1, len = matches.length;
        rolesMap = new Array(len);
        for ( ; ++i < len ; ) {
            row = matches[i];
            j = -1, lenJ = row.length;
            rolesMap[i] = new Array(lenJ);
            for ( ; ++j < lenJ ; ) {
                rolesMap[i][j] = this.rolify(row[j], i, j);
            }
        }
        this.rolesMap = rolesMap;
        return rolesMap;
    };

    // ## Helper methods.

    function validateRolesMapObj(method, map) {
        var i, len;
        var j, lenJ;
        var k, nKeys;
        var arrayOk, elem, isArray;
        if (!J.isArray(map) || !map.length) {
            throw new Error('Roler.' + method + ': map must be a ' +
                            'non-empty array. Found: ' + map);
        }
        arrayOk = (method === 'setRolesMapObj') ? true : false;
        i = -1, len = map.length;
        for ( ; ++i < len ; ) {
            i = -1, lenJ = map[i].length;
            if (!lenJ) {
                throw new Error('Roler.' + method + ': map round ' +
                                i + 'has no elements.');
            }
            for ( ; ++i < lenJ ; ) {
                if ('object' !== typeof map[i][j]) {
                    throw new Error('Roler.' + method + ': map ' +
                                    'round ' + i + ' element ' + j +
                                    ' should be object. Found: ' +
                                    map[i][j]);
                }

                nKeys = 0;
                isArray = false;
                for (k in map[i][j]) {
                    if (map[i][j].hasOwnProperty(k)) {
                        nKeys++;
                        if (k.trim() === '') {
                            throw new Error('Roler.' + method + ': ' +
                                            'roles map (' + i + ',' + j +
                                            ') has invalid key: ' + k);
                        }
                        elem = map[i][j][k];
                        if (arrayOk && J.isArray(elem)) {
                            isArray = true;
                            if (elem.length !== 2) {
                                throw new Error('Roler.' + method + ': ' +
                                                'roles map (' + i + ',' + j +
                                                ', ' + k + ') has invalid ' +
                                                'length: ' + elem);
                            }
                            validString(method, elem[0], i, j, k);
                            validString(method, elem[1], i, j, k);
                        }
                        else {
                            validString(method, elem, i, j, k);
                        }
                    }
                }
                // These are specific to the rolify cb.
                if ((isArray && nKeys !== 1) || (!isArray && nKeys !== 2)) {
                    throw new Error('Roler.' + method + ': roles map (' +
                                    i + ',' + j + ') was expected to have ' +
                                    '2 elements in total. Found: ' + map[i][j]);
                }
            }
        }
    }


    function validString(method, elem, i, j, k) {
        if ('string' !== typeof elem || elem.trim() === '') {
            throw new Error('Roler.' + method + ': roles map (' + i + ',' + j +
                            ',' + k +') has invalid elements: ' + elem);
        }
    }

    // ## Closure
})(
    'undefined' !== typeof node ? node : module.exports,
    'undefined' !== typeof node ? node : module.parent.exports
);
