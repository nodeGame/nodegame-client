/**
 * # Roler
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles matching roles to players.
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
    function Roler() {

        /**
         * ### Roler.roles
         *
         * List of available roles
         *
         * Also contains which ids are associated to the role.
         *
         * @see Roler.setRoles
         * @see Roler.clear
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
         * ### Roler.map
         *
         * The map ids-roles
         */
        this.map = {};

        /**
         * ### Roler.mapByRole
         *
         * Maps ids to a position in the roles array (role must be known)
         *
         * @api private
         */
        this._map = {};
    }

    /**
     * ### Roler.clear
     *
     * Clears the roles lists
     */
    Roler.prototype.clear = function() {
        this.rolesArray = [];
        this.roles = {};
        this.map = {};
        this.mapByRole = {};
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
        var min, max, err;

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
     * @param {string} role The role to check
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
        this.map[id] = role;
        // Save reference of numeric position in roles array to role.
        this._map[role] = this.roles[role].length;
        // Add the id to the roles array.
        this.roles[role].push(id);
    };

    /**
     * ### Roler.setRoleFor
     *
     * Sets the current role for the given id
     *
     * @param {string} role The role to check
     *
     * @see Roler.roles
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
            if (!role) {
                throw new Error('Roler.removeRoleFor: could find any role ' +
                                'assigned to id: ' + id);
            }
        }
        if (!this.roles[role]) {
            throw new Error('Roler.setRoleFor: unknown role: ' + role);
        }
        this.map[id] = null;
        this.roles[role].splice(this._map[id])
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
     * @see Roler.map
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
        return this.map[id] === role;
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
     * @see Roler.map
     */
    Roler.prototype.getRoleFor = function(id) {
        if ('string' !== typeof id) {
            throw new TypeError('Roler.getRoleFor: id must be string. Found: ' +
                                id);
        }
        return this.map[id] || null;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
