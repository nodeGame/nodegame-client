/**
 * # Roler
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * Handles assigning roles to matches.
 *
 * Currently only supports assigning roles to matches of size 2.
 */
(function(exports, parent) {

    "use strict";

    // TODO: have x, y indexes like in Matcher?

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
         * ### Roler.rolifiedMatches
         *
         * Array of arrays of roles assigned for all matches in all rounds
         *
         * For example:
         * ```javascript
         * [
         *     // Round 1.
         *     [  [ 'ROLE_A', 'ROLE_B' ], [ 'ROLE_A', 'ROLE_B' ], ... ],
         *     // Round 2.
         *     [  [ 'ROLE_A', 'ROLE_B' ], [ 'ROLE_A', 'ROLE_B' ], ... ],
         *     ...
         * ]
         * ```
         *
         * @see Roler.rolifyAll
         * @see Roler.setRolifiedMatches
         */
        this.rolifiedMatches = null;

        /**
         * ### Roler.role2IdMatches
         *
         * Array of arrays of maps role to id/s for all matches in all rounds
         *
         * For example:
         * ```javascript
         * [
         *     [ { ROLE_A: 'ID1', ROLE_B: 'ID2' }, ... ], // Round 1.
         *     [ { ROLE_A: [ 'ID1', 'ID2' ] }, ... ], // Round 2.
         *     ...
         * ]
         * ```
         *
         * @see Roler.rolifyAll
         * @see Roler.setRolifiedMatches
         */
        this.role2IdMatches = null;

        /**
         * ### Roler.id2RoleMatches
         *
         * Array of arrays of maps id to role for all matches in all rounds
         *
         * For example:
         * ```javascript
         * [
         *     [ { ID1: 'ROLE_A', ID2: 'ROLE_B' }, ... ], // Round 1.
         *     [ { ID1: 'ROLE_A', ID2: 'ROLE_A' }, ... ], // Round 2.
         *     ...
         * ]
         * ```
         *
         * @see Roler.rolifyAll
         * @see Roler.setRolifiedMatches
         */
        this.id2RoleMatches = null;

        /**
         * ### Roler.role2IdRoundMap
         *
         * Array of maps of role to id/s per each round
         *
         * For example:
         * ```javascript
         * [
         *     // Round 1.
         *     [ { ROLE_A: [ 'ID1', 'ID3', ... ], ROLE_B: 'ID2', ... } ],
         *     // Round 2.
         *     [ { ROLE_A: [ 'ID1', 'ID2', ... ], ROLE_B: 'ID3', ... } ],
         *     ...
         * ]
         * ```
         */
        this.role2IdRoundMap = [];

        /**
         * ### Roler.rolify
         *
         * Callback that assigns roles to a single match
         *
         * @see Roler.linearRolifier
         */
        this.rolify = Roler.linearRolifier;

        /**
         * ### Roler.missingId
         *
         * The id indicating a skipped match (i.e. a bye in a match)
         *
         * @see Matcher.missingId
         */
        this.missingId = 'bot';
    }

    // ## Init/clear.

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
        this.id2RoleRoundMap = [];
        this.role2IdRoundMap = [];
        this.rolifiedMatches = null;
        this.role2IdMatches = null;
        this.id2RoleMatches = null;
    };

    // ## Setters.

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
     * ### Roler.setRoleFor
     *
     * Sets a role for the given id at the specified round
     *
     * @param {string} id The id of a player
     * @param {string} role A valid role for the id
     * @param {number} x The x-th round the role is being set for
     *
     * @see Roler.id2RoleRoundMap
     * @see Roler.role2IdRoundMap
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
        if (!this.id2RoleRoundMap[x]) this.id2RoleRoundMap[x] = {};
        this.id2RoleRoundMap[x][id] = role;

        // Role to id.
        if (!this.role2IdRoundMap[x]) this.role2IdRoundMap[x] = {};
        if (!this.role2IdRoundMap[x][role]) this.role2IdRoundMap[x][role] = [];
        this.role2IdRoundMap[x][role].push(id);
    };

    /**
     * ### Roler.setRolifiedMatches
     *
     * Sets a preinited array of rolified matches
     *
     * @param {array} rolifiedMatches The rolified matches
     * @param {boolean} validate Optional. Boolean flag to
     *   turn on/off validation. Default: TRUE
     *
     * @see Roler.rolifiedMatches
     */
    Roler.prototype.setRolifiedMatches = function(rolifiedMatches, validate) {
        var i, len;
        var j, lenJ;
        if ('undefined' === typeof validate || !!validate) {
            if (!J.isArray(rolifiedMatches) || !rolifiedMatches.length) {
                throw new Error('Roler.setRolifiedMatches: rolifiedMatches ' +
                                'must be a non-empty array. Found: ' +
                                rolifiedMatches);
            }
            i = -1, len = rolifiedMatches.length;
            for ( ; ++i < len ; ) {
                i = -1, lenJ = rolifiedMatches[i].length;
                if (!lenJ) {
                    throw new Error('Roler.setRolifiedMatches: ' +
                                    'rolifiedMatches round ' + i +
                                    'has no elements.');
                }
                for ( ; ++i < lenJ ; ) {
                    if (!J.isArray(rolifiedMatches[i][j])) {
                        throw new Error('Roler.setRolifiedMatches: ' +
                                        'rolifiedMatches round ' + i +
                                        ' element ' + j +
                                        ' should be array. Found: ' +
                                        rolifiedMatches[i][j]);
                    }
                    // These are specific to the rolify cb.
                    if (rolifiedMatches[i][j].length !== 2) {
                        throw new Error('Roler.setRolifiedMatches: roles (' +
                                        i + ',' + j + ') was expected to have' +
                                        ' length 2: ' + rolifiedMatches[i][j]);
                    }
                    if ('string' !== typeof rolifiedMatches[i][j][0] ||
                        'string' !== typeof rolifiedMatches[i][j][1] ||
                        rolifiedMatches[i][j][0].trim() === '' ||
                        rolifiedMatches[i][j][1].trim() === '') {

                        throw new Error('Roler.setRolifiedMatches: roles (' +
                                        i + ',' + j + ') has invalid ' +
                                        'elements: ' + rolifiedMatches[i][j]);
                    }
                }

            }
        }
        this.rolifiedMatches = rolifiedMatches;
    };

    /**
     * ### Roler.setRole2IdMatches
     *
     * Sets a preinited array of role to id/s matches
     *
     * @param {array} matches The role to id/s matches
     * @param {boolean} validate Optional. Boolean flag to
     *   turn on/off validation. Default: TRUE
     *
     * @see Roler.rolifiedMatches
     */
    Roler.prototype.setRole2IdMatches = function(matches, validate) {
        if ('undefined' === typeof validate || !!validate) {
            validateRoleIdMatches('setRole2IdMatches', matches);
        }
        this.role2IdMatches = matches;
    };

    /**
     * ### Roler.setId2RoleMatches
     *
     * Sets a preinited array of id to role matches
     *
     * @param {array} matches The roles-obj matches
     * @param {boolean} validate Optional. Boolean flag to
     *   turn on/off validation. Default: TRUE
     *
     * @see Roler.id2RoleMatches
     */
    Roler.prototype.setId2RoleMatches = function(matches, validate) {
        if ('undefined' === typeof validate || !!validate) {
            validateRoleIdMatches('setId2RoleMatches', matches);
        }
        this.id2RoleMatches = matches;
    };

    // ## Getters.

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
     * @see Roler.id2RoleRoundMap
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
        return this.id2RoleRoundMap[x][id] || null;
    };

    /**
     * ### Roler.getIdForRole
     *
     * Returns the id/s holding the specified role at round x
     *
     * @param {string} role The role
     * @param {number} x The round
     *
     * @return {array} Array of id/s holding the role at round x
     *
     * @see Roler.role2IdRoundMap
     */
    Roler.prototype.getIdForRole = function(role, x) {
        if ('string' !== typeof role) {
            throw new TypeError('Roler.getIdForRole: role must be string. ' +
                                'Found: ' + role);
        }
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getIdForRole: x must be a ' +
                                'non-negative number. Found: ' + x);
        }
        return this.role2IdRoundMap[x][role] || [];
    };

    /**
     * ### Roler.getRolifiedMatches
     *
     * Returns all matched roles
     *
     * @return {array} The matched roles
     *
     * @see Roler.rolifiedMatches
     */
    Roler.prototype.getRolifiedMatches = function() {
        return this.rolifiedMatches;
    };

    /**
     * ### Roler.getRoleMatch
     *
     * Returns the requested roles
     *
     * @param {number} x The round of the roles
     * @param {number} y Optional. The y-th role within round x
     *
     * @return {array|null} The requested role matches or null
     *    if the x or y indexes are out of bounds
     *
     * @see Roler.rolifiedMatches
     */
    Roler.prototype.getRoleMatch = function(x, y) {
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getRoleMatch: x must be a ' +
                                'non-negative number. Found: ' + x);
        }
        if ('undefined' === typeof y) {
            return this.rolifiedMatches[x] || null;
        }
        if ('number' !== typeof y || y < 0 || isNaN(y)) {
            throw new TypeError('Roler.getRoleMatch: y must be undefined or ' +
                                'a non-negative number. Found: ' + y);
        }
        return this.rolifiedMatches[x][y] || null;
    };

    /**
     * ### Roler.getRole2IdMatch
     *
     * Returns the requested role to id matches
     *
     * @param {number} x The round of the roles
     * @param {number} y Optional. The y-th role within round x
     *
     * @return {array|object|null} The role to id/s matches or null
     *    if the x or y indexes are out of bounds
     *
     * @see Roler.role2IdRoundMatch
     */
    Roler.prototype.getRole2IdMatch = function(x, y) {
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getRole2IdMatch: x must be a ' +
                                'non-negative number. Found: ' + x);
        }
        if ('undefined' === typeof y) {
            return this.role2IdMatches[x] || null;
        }
        if ('number' !== typeof y || y < 0 || isNaN(y)) {
            throw new TypeError('Roler.getRole2IdMatch: y must be a ' +
                                'non-negative number. Found: ' + y);
        }
        return this.role2IdMatches[x][y] || null;
    };

    /**
     * ### Roler.getId2RoleMatch
     *
     * Returns the requested id to role matches
     *
     * @param {number} x The round of the roles
     * @param {number} y Optional. The y-th role within round x
     *
     * @return {array|object|null} The id to role matches or null
     *    if the x or y indexes are out of bounds
     *
     * @see Roler.rolifiedMatches
     */
    Roler.prototype.getId2RoleMatch = function(x, y) {
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getId2RoleMatch: x must be a ' +
                                'non-negative number. Found: ' + x);
        }
        if ('undefined' === typeof y) {
            return this.id2RoleMatches[x] || null;
        }
        if ('number' !== typeof y || y < 0 || isNaN(y)) {
            throw new TypeError('Roler.getId2RoleMatch: y must be a ' +
                                'non-negative number. Found: ' + y);
        }
        return this.id2RoleMatches[x][y] || null;
    };

    /**
     * ### Roler.getRole2IdRoundMap
     *
     * Returns the requested role to id/s mapping
     *
     * @param {number} x The round
     *
     * @return {object|null} The role to id/s map or null
     *    if x is out of bounds
     *
     * @see Roler.role2IdRoundMap
     */
    Roler.prototype.getRole2IdRoundMap = function(x) {
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getRole2IdRoundMap: x must be a ' +
                                'non-negative number. Found: ' + x);
        }
        return this.role2IdRoundMap[x] || null;
    };

    /**
     * ### Roler.getId2RoleRoundMap
     *
     * Returns the requested id to role mapping
     *
     * @param {number} x The round
     *
     * @return {object|null} The role-to-id map or null
     *    if x is out of bounds
     *
     * @see Roler.id2RoleRoundMap
     */
    Roler.prototype.getId2RoleRoundMap = function(x) {
        if ('number' !== typeof x || x < 0 || isNaN(x)) {
            throw new TypeError('Roler.getId2RoleRoundMap: x must be a ' +
                                'non-negative number. Found: ' + x);
        }
        return this.id2RoleRoundMap[x] || null;
    };

    // ## Rolify.

    /**
     * ### Roler.rolifyAll
     *
     * Applies roles to all matches
     *
     * @param {array} Array of array of matches
     *
     * @return {array} rolifiedMatches The full maps of roles
     *
     * @see Roler.rolifiedMatches
     * @see Roler.role2IdMatches
     * @see Roler.id2RoleMatches
     */
    Roler.prototype.rolifyAll = function(matches) {
        var i, len, j, lenJ, row, rolifiedMatches;
        var r1, r2, rolesObj, idRolesObj;

        if (!J.isArray(matches) || !matches.length) {
            throw new Error('Roler.rolifyAll: match must be a non empty ' +
                            'array. Found: ' + matches);
        }
        i = -1, len = matches.length;
        rolifiedMatches = new Array(len);
        rolesObj = new Array(len);
        idRolesObj = new Array(len);
        for ( ; ++i < len ; ) {
            row = matches[i];
            j = -1, lenJ = row.length;
            rolifiedMatches[i] = new Array(lenJ);
            rolesObj[i] = new Array(lenJ);
            idRolesObj[i] = new Array(lenJ);
            for ( ; ++j < lenJ ; ) {
                rolifiedMatches[i][j] = this.rolify(row[j], i, j);
                // TODO: this code is repeated in Matcher.match, make it one!
                r1 = rolifiedMatches[i][j][0];
                r2 = rolifiedMatches[i][j][1];
                rolesObj[i][j] = {};
                if (r1 !== r2) {
                    rolesObj[i][j][r1] = row[j][0];
                    rolesObj[i][j][r2] = row[j][1];
                }
                else {
                    rolesObj[i][j][r1] = [ row[j][0], row[j][1] ];
                }
                idRolesObj[i][j] = {};
                idRolesObj[i][j][row[j][0]] = r1;
                idRolesObj[i][j][row[j][1]] = r2;
            }
        }
        this.rolifiedMatches = rolifiedMatches;
        this.role2IdMatches = rolesObj;
        this.id2RoleMatches = idRolesObj;

        return rolifiedMatches;
    };

    // ## Checkings.

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
     * @see Roler.id2RoleRoundMap
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
        return this.id2RoleRoundMap[x][id] === role;
    };

    // ## Edit/Replace.

    /**
     * ### Roler.replaceId
     *
     * Replaces an id with a new one in all roles
     *
     * @param {string} oldId The id to be replaced
     * @param {string} newId The replacing id
     *
     * @return {boolean} TRUE, if the oldId was found and replaced
     *
     * @see MatcherManager.replaceId
     * @see Matcher.replaceId
     */
    Roler.prototype.replaceId = function(oldId, newId) {
        var m, n;
        var i, len, j, lenJ, h, lenH, k, lenK;
        var rowFound;
        var tmp, role;

        if ('string' !== typeof oldId) {
            throw new TypeError('Roler.replaceId: oldId should be string. ' +
                                'Found: ' + oldId);
        }
        if ('string' !== typeof newId && newId.trim() !== '') {
            throw new TypeError('Roler.replaceId: newId should be a ' +
                                'non-empty string. Found: ' + newId);
        }

        // No id was assigned yet.
        if (!this.id2RoleMatches) return false;

        // Update id2RoleMatches and role2IdMatches at the same time.
        m = this.id2RoleMatches;
        n = this.role2IdMatches;

        i = -1, len = m.length;
        for ( ; ++i < len ; ) {
            j = -1, lenJ = m[i].length;
            // If it was not found in the previous row, return FALSE.
            if (j > 0 && !rowFound) return false;
            for ( ; ++j < lenJ ; ) {
                rowFound = false;
                for (h in m[i][j]) {
                    if (m[i][j].hasOwnProperty(h)) {
                        if (h === oldId) {
                            role = m[i][j][oldId];
                            m[i][j][newId] = role;
                            delete m[i][j][oldId];
                            rowFound = true;

                            // All ids in match with same role.
                            tmp = n[i][j][role];

                            // If it is an array, try to optimize replacement.
                            if (J.isArray(tmp)) {
                                lenK = tmp.length;
                                if (lenK === 1) {
                                    tmp[0] = newId;
                                }
                                else if (lenK === 2) {
                                    if (tmp[0] === oldId) tmp[0] = newId;
                                    else tmp[1] = newId;
                                }
                                else {
                                    k = -1;
                                    for ( ; ++k < lenK ; ) {
                                        if (tmp[k] === oldId) {
                                            tmp[k] = newId;
                                            break;
                                        }
                                    }
                                }
                            }
                            else {
                                n[i][j][role] = newId;
                            }

                            break;
                        }
                    }
                }
                if (rowFound) break;
            }
        }

        // Update id2RoleRoundMap and role2IdRoundMap at the same time.
        m = this.id2RoleRoundMap;
        n = this.role2IdRoundMap;

        i = -1, len = m.length;
        for ( ; ++i < len ; ) {
            rowFound = false;
            for (j in m[i]) {
                if (m[i].hasOwnProperty(j)) {
                    if (j === oldId) {
                        m[i][newId] = m[i][oldId];
                        delete m[i][oldId];
                        rowFound = true;

                        // All ids with same role at same round.
                        tmp = n[i][m[i][newId]];

                        lenH = tmp.length;
                        if (lenH === 1) {
                            tmp[0] = newId;
                        }
                        else {
                            h = -1;
                            for ( ; ++h < len ; ) {
                                if (tmp[h] === oldId) {
                                    tmp[h] = newId;
                                    break;
                                }
                            }
                        }

                    }
                }
                if (rowFound) break;
            }
        }

        return true;
    };

    // ## Helper methods.

    /**
     * ### validateRoleIdMatches
     *
     * Deep validates role-id or id-role matches (object type), throws errors
     *
     * Validation:
     *
     *  - The map is an array of objects
     *  - Each object must have two info-items.
     *  - An info-item can contain:
     *      a) 2 keys-valus pairs (id-role|role-id), or
     *      b) an array of length 2 (role: id1, id2) [allowed only if
     *         invoking method is 'setRole2IdMatches']
     *
     * @param {string} method The name of the method invoking validation
     * @param {array} matches The matches to validate
     *
     * @see validString
     * @see setRole2IdMatches
     * @see setId2RoleMatches
     */
    function validateRoleIdMatches(method, matches) {
        var i, len;
        var j, lenJ;
        var k, nKeys;
        var arrayOk, elem, isArray;

        if (!J.isArray(matches) || !matches.length) {
            throw new Error('Roler.' + method + ': matches must be a ' +
                            'non-empty array. Found: ' + matches);
        }
        arrayOk = (method === 'setRole2IdMatches') ? true : false;
        i = -1, len = matches.length;
        for ( ; ++i < len ; ) {
            i = -1, lenJ = matches[i].length;
            if (!lenJ) {
                throw new Error('Roler.' + method + ': matches round ' +
                                i + 'has no elements.');
            }
            for ( ; ++i < lenJ ; ) {
                if ('object' !== typeof matches[i][j]) {
                    throw new Error('Roler.' + method + ': matches ' +
                                    'round ' + i + ' element ' + j +
                                    ' should be object. Found: ' +
                                    matches[i][j]);
                }

                nKeys = 0;
                isArray = false;
                for (k in matches[i][j]) {
                    if (matches[i][j].hasOwnProperty(k)) {
                        nKeys++;
                        if (k.trim() === '') {
                            throw new Error('Roler.' + method + ': ' +
                                            'roles matches (' + i + ',' + j +
                                            ') has invalid key: ' + k);
                        }
                        elem = matches[i][j][k];
                        if (arrayOk && J.isArray(elem)) {
                            isArray = true;
                            if (elem.length !== 2) {
                                throw new Error('Roler.' + method + ': ' +
                                                'roles matches (' + i + ',' +
                                                j + ', ' + k + ') has ' +
                                                'invalid length: ' + elem);
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
                    throw new Error('Roler.' + method + ': roles matches (' +
                                    i + ',' + j + ') was expected to have ' +
                                    '2 elements in total. Found: ' +
                                    matches[i][j]);
                }
            }
        }
    }

    /**
     * ### validString
     *
     * Validates the content of role/id or id/role match, throws errors
     *
     * @param {string} method The name of the method invoking validation
     * @param {mixed} elem The element to validate (should
     *    be non-empty string: id or role)
     * @param {number} i The i-th round in the matches array
     * @param {number} j The j-th match at round i-th in the matches array
     * @param {string} k The name of the key containig mapping to elem
     *
     * @see validString
     */
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
