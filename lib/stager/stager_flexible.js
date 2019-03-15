/**
 * # Stager flexible mode
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var Stager = node.Stager;

    /**
     * #### Stager.registerGeneralNext
     *
     * Sets general callback for next stage decision
     *
     * Available only when nodegame is executed in _flexible_ mode.
     * The callback given here is used to determine the next stage.
     *
     * @param {function|null} func The decider callback. It should
     *   return the name of the next stage, 'NODEGAME_GAMEOVER' to end
     *   the game or FALSE for sequence end. NULL can be given to
     *   signify non-existence.
     */
    Stager.prototype.registerGeneralNext = function(func) {
        if (func !== null && 'function' !== typeof func) {
            throw new TypeError('Stager.registerGeneralNext: ' +
                                'func must be function or undefined. Found: ' +
                                func);
        }
        this.generalNextFunction = func;
    };

    /**
     * #### Stager.registerNext
     *
     * Registers a step-decider callback for a specific stage
     *
     * The function overrides the general callback for the specific
     * stage, and determines the next stage.
     * Available only when nodegame is executed in _flexible_ mode.
     *
     * @param {string} id The name of the stage after which the decider
     *   function will be called
     * @param {function} func The decider callback. It should return the
     *   name of the next stage, 'NODEGAME_GAMEOVER' to end the game or
     *   FALSE for sequence end.
     *
     * @see Stager.registerGeneralNext
     */
    Stager.prototype.registerNext = function(id, func) {
        if ('function' !== typeof func) {
            throw new TypeError('Stager.registerNext: func must be ' +
                'function. Found: ' + func);
        }

        if (!this.stages[id]) {
            throw new TypeError('Stager.registerNext: non existent ' +
                               'stage id: ' + id);
        }

        this.nextFunctions[id] = func;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
