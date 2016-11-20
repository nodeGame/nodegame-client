/**
 * # Extra
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` extra functions
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;
    var J = parent.JSUS;

    /**
     * ### node.env
     *
     * Fetches an environment variables, and optionally executes a callback
     *
     * Notice: the value of the requested variable is returned after
     * the execution of the callback, that could modify it.
     *
     * @param {string} env The name of the environmental variable
     * @param {function} func Optional A callback to execute if the current
     *   value of env is truthy.
     * @param {object} ctx Optional. The context of execution
     * @param {array} params Optional. An array of parameters for the callback
     *
     * @return {mixed} The current value of the requested variable
     *
     * @see node.setup.env
     * @see node.clearEnv
     */
    NGC.prototype.env = function(env, func, ctx, params) {
        var envValue, args;
        if ('string' !== typeof env) {
            throw new TypeError('node.env: env must be string.');
        }
        if (func && 'function' !== typeof func) {
            throw new TypeError('node.env: func must be function ' +
                                'or undefined.');
        }
        if (ctx && 'object' !== typeof ctx) {
            throw new TypeError('node.env: ctx must be object or undefined.');
        }

        envValue = this._env[env];
        args = [ envValue ];

        if (params) {
            if (!J.isArray(params)) {
                throw new TypeError('node.env: params must be array ' +
                                    'or undefined. Found: ' + params);
            }
            params = params.concat(args);
        }

        // Executes the function conditionally to _envValue_.
        if (func && envValue) func.apply((ctx || this), args);

        // Returns the value of the requested _env_ variable in any case.
        return envValue;
    };

    /**
     * ### node.clearEnv
     *
     * Deletes all previously set enviroment variables
     *
     * @see node.env
     * @see node.setup.env
     */
    NGC.prototype.clearEnv = function() {
        this._env = {};
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
