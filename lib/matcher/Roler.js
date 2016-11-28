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
         * @see Roler.clearRoles
         */
        this.rolesArray = [];

        /**
         * ### Roler.map
         *
         * The map roles-ids
         */
        this.map = {};
    }

    /**
     * ### Roler.clear
     *
     * Clears the roles list
     */
    Roler.prototype.clear = function() {
        this.rolesArray = [];
        this.roles = {};
        this.map = {};
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


    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
