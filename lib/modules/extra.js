/**
 * # Log
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` logging module
 * 
 * ---
 * 
 */

(function (exports, parent) {
    
    var NGC = parent.NodeGameClient
    
    //## Extra
    
    /**
     * ### node.env
     *
     * Executes a block of code conditionally to nodeGame environment variables
     *
     * @param env {string} The name of the environment
     * @param func {function} The callback function to execute
     * @param ctx {object} Optional. The context of execution
     * @param params {array} Optional. An array of additional parameters for the callback
     *
     */
    NGC.prototype.env = function (env, func, ctx, params) {
        if (!env || !func || !this.env[env]) return;
        ctx = ctx || node;
        params = params || [];
        func.apply(ctx, params);
    };

    /**
     * ### NodeGameClient.randomEmit
     *
     * Emits an event after a random time interval between 0 and maxWait
     *
     * @param {string} event The name of the event
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before emitting the event. to Defaults, 6000
     */
    NGC.prototype.randomEmit = function (event, maxWait){
        maxWait = maxWait || 6000;
        setTimeout(function(event) {
            node.emit(event);
        }, Math.random() * maxWait, event);
    };

    /**
     * ### NodeGameClient.randomExec
     *
     * Executes a callback function after a random time interval between 0 and maxWait
     *
     * @param {function} The callback function to execute
     * @param {number} maxWait Optional. The maximum time (in milliseconds)
     *   to wait before executing the callback. to Defaults, 6000
     */
    NGC.prototype.randomExec = function (func, maxWait) {
        maxWait = maxWait || 6000;
        setTimeout(function(func) {
            func.call();
        }, Math.random() * maxWait, func);
    };

    /**
     * ###  NodeGameClient.play
     *
     * Starts a game
     *
     * @deprecated use game.start directly
     */
    NGC.prototype.play = function() {
        this.game.start();
    };

    /**
     * ### NodeGameClient.replay
     *
     * Moves the game stage to 1.1.1
     *
     * @param {boolean} rest TRUE, to erase the game memory before update the game stage
     *
     * @deprecated use game.start directly
     * also this.plot is wrong
     */
    NGC.prototype.replay = function (reset) {
        if (reset) this.game.memory.clear(true);
        this.game.execStep(this.plot.getStep("1.1.1"));
    };


})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
