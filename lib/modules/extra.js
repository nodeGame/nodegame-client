/**
 * # Extra
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` extra functions
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    /**
     * ### node.env
     *
     * Executes a block of code conditionally to nodeGame environment variables
     *
     * Notice: the value of the requested variable is returned after
     * the execution of the callback, that could modify it.
     *
     * @param {string} env The name of the environment
     * @param {function} func Optional The callback to execute conditionally
     * @param {object} ctx Optional. The context of execution
     * @param {array} params Optional. An array of parameters for the callback
     *
     * @see node.setup.env
     * @see node.clearEnv
     */
    NGC.prototype.env = function(env, func, ctx, params) {
        var envValue;
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
        if (params && 'object' !== typeof params) {
            throw new TypeError('node.env: params must be array-like ' +
                                'or undefined.');
        }

        envValue = this.env[env];
        // Executes the function conditionally to _envValue_.
        if (func && envValue) {
            ctx = ctx || node;
            params = params || [];
            func.apply(ctx, params);
        }
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
        for (var i in this.env) {
            if (this.env.hasOwnProperty(i)) {
                delete this.env[i];
            }
        }
    };



})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
