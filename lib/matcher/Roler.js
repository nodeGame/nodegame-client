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
            this.setRoleFor(id1, this.rolesArray[0]);
            this.setRoleFor(id2, this.rolesArray[1]);
            roles = [ this.rolesArray[0], this.rolesArray[1] ];
        }
        else {
            if (!this.rolesArray[2]) {
                throw new Error('Roler.rolify: role3 required, but not found.');
            }
            soloIdx = (id1 === this.missingId) ? 1 : 0;
            this.setRoleFor(match[soloIdx], this.rolesArray[2]);
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
         * List of available roles
         *
         * Also contains which ids are currently associated to the role.
         *
         * @see Roler.setRoles
         * @see Roler.setRoleFor
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
         * The current map of ids-roles
         */
        this.id2RoleMap = {};

        /**
         * ### Roler._id2PosMap
         *
         * Maps ids to the current position in the corresponding role array
         *
         * The role array is inside the roles object.
         *
         * For example:
         *
         * ```javascript
         * roler.roles.X = [ 'a', 'b', 'c', 'd' ];
         * roler.id2RoleMap.b = 'X';
         * roler._id2PosMap.b = 1;
         * ```
         *
         * @api private
         */
        this._id2PosMap = {};

        /**
         * ### Roler.rolesMap
         *
         * The map of all roles for all matches in all rounds
         *
         * @see Roler.rolifyAll
         */
        this.rolesMap = null;

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
     * Clears the roles lists
     */
    Roler.prototype.clear = function() {
        this.rolesArray = [];
        this.roles = {};
        this.id2RoleMap = {};
        this._id2PosMap = {};
        this.rolesMap = null;
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
            rolesObj[role] = [];
        }
        // All data validated.
        this.roles = rolesObj;
        this.rolesArray = roles;
    };

    /**
     * ### Roler.setRoleFor
     *
     * Sets the current role for the given id
     *
     * @param {string} id The id of a player
     * @param {string} role A valid role for the id
     *
     * @see Roler.roles
     */
    Roler.prototype.setRoleFor = function(id, role) {
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
        // Id to role.
        this.id2RoleMap[id] = role;
        // Save reference of numeric position in roles array to role.
        this._id2PosMap[role] = this.roles[role].length;
        // Add the id to the roles array.
        this.roles[role].push(id);
    };

    /**
     * ### Roler.removeRoleFor
     *
     * Removes the current role for the given id
     *
     * @param {string} id The id of the player
     * @param {string} role Optional. The role to remove, if known
     *
     * @return {string|null} role The removed role or null, if id had no role
     *
     * @see Roler.roles
     * @see Roler.id2RoleMap
     */
    Roler.prototype.removeRoleFor = function(id, role) {
        if ('string' !== typeof id) {
            throw new TypeError('Roler.setRoleFor: id must be string. Found: ' +
                                id);
        }
        if (role && 'string' !== typeof role) {
            throw new TypeError('Roler.setRoleFor: role must be string or ' +
                                'undefined. Found: ' + role);
        }
        else {
            role = this.getRoleFor(id);
            if (!role) return null;
        }
        if (!this.roles[role]) {
            throw new Error('Roler.setRoleFor: unknown role: ' + role);
        }
        this.id2RoleMap[id] = null;
        this.roles[role].splice(this._id2PosMap[id]);
        return role;
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
     * Returns TRUE if a given id is currently holding the specified role
     *
     * @param {string} id The id to check
     * @param {string} role The role to check
     *
     * @return {boolean} True if id has given role
     *
     * @see Roler.id2RoleMap
     */
    Roler.prototype.hasRole = function(id, role) {
        if ('string' !== typeof id) {
            throw new TypeError('Roler.hasRole: id must be string. Found: ' +
                                id);
        }
        if ('string' !== typeof role) {
            throw new TypeError('Roler.hasRole: role must be string. Found: ' +
                                role);
        }
        return this.id2RoleMap[id] === role;
    };

    /**
     * ### Roler.getRoleFor
     *
     * Returns the role currently hold by an id
     *
     * @param {string} id The id to check
     *
     * @return {string|null} The role currently hold, or null
     *    if the id is not found
     *
     * @see Roler.id2RoleMap
     */
    Roler.prototype.getRoleFor = function(id) {
        if ('string' !== typeof id) {
            throw new TypeError('Roler.getRoleFor: id must be string. Found: ' +
                                id);
        }
        return this.id2RoleMap[id] || null;
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
        len = matches ? null : matches.length;
        if (!len) {
            throw new Error('Roler.rolifyAll: match must be a non empty ' +
                            'array. Found: ' + matches);
        }
        i = -1;
        rolesMap = new Array(len);
        for ( ; ++i < len ; ) {
            row = matches[i];
            i = -1, lenJ = row.length;
            rolesMap[i] = new Array(lenJ);
            for ( ; ++j < lenJ ; ) {
                rolesMap[i][j] = this.rolify(row[j], i, j);
            }
        }
        this.rolesMap = rolesMap;
        return rolesMap;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
