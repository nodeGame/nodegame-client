/**
 * # GameStage
 *
 * Copyright(c) 2018 Stefano Balietti
 * MIT Licensed
 *
 * Representation of the stage of a game:
 *
 * - `stage`: the higher-level building blocks of a game
 * - `step`: the sub-unit of a stage
 * - `round`: the number of repetition for a stage. Defaults round = 1
 *
 * @see GamePlot
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    // Expose constructor
    exports.GameStage = GameStage;

    GameStage.defaults = {};

    /**
     * ### GameStage.defaults.hash
     *
     * Default hash string for game-stages
     *
     *  @see GameStage.toHash
     */
    GameStage.defaults.hash = 'S.s.r';

    /**
     * ## GameStage constructor
     *
     * Creates an instance of a GameStage
     *
     * It accepts an object literal, a number, or an hash string as defined in
     * `GameStage.defaults.hash`.
     *
     * The stage and step can be either an integer (1-based index) or a string
     * (valid stage/step name). The round must be an integer.
     *
     * If no parameter is passed, all the properties of the GameStage
     * object are set to 0
     *
     * @param {object|string|number} gameStage Optional. The game stage
     *
     * @see GameStage.defaults.hash
     */
    function GameStage(gameStage) {
        var tokens, stageNum, stepNum, roundNum, err;

        // ## Public properties

        /**
         * ### GameStage.stage
         *
         * The N-th game-block (stage) in the game-plot currently being executed
         */
        this.stage = 0;

        /**
         * ### GameStage.step
         *
         * The N-th game-block (step) nested in the current stage
         */
        this.step = 0;

        /**
         * ### GameStage.round
         *
         * The number of times the current stage was repeated
         */
        this.round = 0;

        // String.
        if ('string' === typeof gameStage) {
            if (gameStage === '') {
                throw new Error('GameStage constructor: gameStage name ' +
                                'cannot be an empty string.');
            }
            if (gameStage.charAt(0) === '.') {
                throw new Error('GameStage constructor: gameStage name ' +
                                'cannot start with a dot. Name: ' + gameStage);
            }

            tokens = gameStage.split('.');

            stageNum = parseInt(tokens[0], 10);
            this.stage = !isNaN(stageNum) ? stageNum : tokens[0];

            if ('string' === typeof tokens[1]) {
                if (!tokens[1].length) {
                    throw new Error('GameStage constructor: gameStage ' +
                                    'contains empty step: ' + gameStage);
                }
                stepNum = parseInt(tokens[1], 10);
                this.step = !isNaN(stepNum) ? stepNum : tokens[1];
            }
            else if (this.stage !== 0) {
                this.step = 1;
            }
            if ('string' === typeof tokens[2]) {
                if (!tokens[2].length) {
                    throw new Error('GameStage constructor: gameStage ' +
                                    'contains empty round: ' + gameStage);
                }
                roundNum = parseInt(tokens[2], 10);
                this.round = roundNum;
            }
            else if (this.stage !== 0) {
                this.round = 1;
            }
        }
        // Not null object.
        else if (gameStage && 'object' === typeof gameStage) {
            this.stage = gameStage.stage;
            this.step = 'undefined' !== typeof gameStage.step ?
                gameStage.step : this.stage === 0 ? 0 : 1;
            this.round = 'undefined' !== typeof gameStage.round ?
                gameStage.round : this.stage === 0 ? 0 : 1;
        }
        // Number.
        else if ('number' === typeof gameStage) {
            if (gameStage % 1 !== 0) {
               throw new TypeError('GameStage constructor: gameStage ' +
                                   'cannot be a non-integer number. Found: ' +
                                   gameStage);
            }
            this.stage = gameStage;
            if (this.stage === 0) {
                this.step = 0;
                this.round = 0;
            }
            else {
                this.step = 1;
                this.round = 1;
            }
        }
        // Defaults or error.
        else if (gameStage !== null && 'undefined' !== typeof gameStage) {
            throw new TypeError('GameStage constructor: gameStage must be ' +
                                'string, object, number, undefined, or null. ' +
                                'Found: ' + gameStage);
        }

        // At this point we must have positive numbers, or strings for step
        // and stage, round can be only a positive number, or 0.0.0.
        if ('number' === typeof this.stage) {
            if (this.stage < 0) err = 'stage';
        }
        else if ('string' !== typeof this.stage) {
            throw new Error('GameStage constructor: gameStage.stage must be ' +
                            'number or string: ' + typeof this.stage);
        }

        if ('number' === typeof this.step) {
            if (this.step < 0) err = err ? err + ', step' : 'step';
        }
        else if ('string' !== typeof this.step) {
            throw new Error('GameStage constructor: gameStage.step must be ' +
                            'number or string: ' + typeof this.step);
        }

        if ('number' === typeof this.round) {
            if (this.round < 0) err = err ? err + ', round' : 'round';
        }
        else {
            throw new Error('GameStage constructor: gameStage.round must ' +
                            'be number. Found: ' + this.round);
        }

        if (err) {
            throw new TypeError('GameStage constructor: ' + err + ' field/s ' +
                                'contain/s negative numbers.');
        }

        // Either 0.0.0 or no 0 is allowed.
        if (!(this.stage === 0 && this.step === 0 && this.round === 0)) {
            if (this.stage === 0 || this.step === 0 || this.round === 0) {
                throw new Error('GameStage constructor: malformed game ' +
                                'stage: ' + this.toString());
            }
        }
    }

    // ## GameStage methods

    /**
     * ### GameStage.toString
     *
     * Converts the current instance of GameStage to a string
     *
     * @return {string} out The string representation of game stage
     */
    GameStage.prototype.toString = function() {
        return this.stage + '.' + this.step + '.' + this.round;
    };

    // ## GameStage Static Methods

    /**
     * ### GameStage.toHash
     *
     * Returns a simplified hash of the stage of the GameStage
     *
     * The following characters are valid to determine the hash string
     *
     * - S: stage
     * - s: step
     * - r: round
     *
     * E.g.
     *
     * ```javascript
     *      var gs = new GameStage({
     *          round: 1,
     *          stage: 2,
     *          step: 1
     *      });
     *
     *      gs.toHash('(R) S.s'); // (1) 2.1
     * ```
     *
     * @param {GameStage} gs The game stage to hash
     * @param {string} str Optional. The hash code. Default: S.s.r
     *
     * @return {string} hash The hashed game stages
     */
    GameStage.toHash = function(gs, str) {
        var hash, i, idx, properties, symbols;
        if (!gs || 'object' !== typeof gs) {
            throw new TypeError('GameStage.toHash: gs must be object. Found: ' +
                                gs);
        }
        if (!str || !str.length) {
            return gs.stage + '.' + gs.step + '.' + gs.round;
        }

        hash = '',
        symbols = 'Ssr',
        properties = ['stage', 'step', 'round'];

        for (i = 0; i < str.length; i++) {
            idx = symbols.indexOf(str.charAt(i));
            hash += (idx < 0) ? str.charAt(i) : gs[properties[idx]];
        }
        return hash;
    };

    /**
     * ### GameStage.toObject
     *
     * Returns a clone of the game stage with Object as prototype
     *
     * @return {object} A new object
     */
    GameStage.toObject = function() {
        return {
            stage: this.stage,
            step: this.step,
            round: this.round
        };
    };

    /**
     * ### GameStage.compare
     *
     * Converts inputs to GameStage objects and sort them by sequence order
     *
     * Returns value is:
     *
     * - 0 if they represent the same game stage
     * - -1 if gs1 is ahead of gs2
     * - +1 if gs2 is ahead of gs1
     *
     * The accepted hash string format is the following:
     *
     *   - 'S.s.r' (stage.step.round)
     *
     * When comparison contains a missing value or a string (e.g. a step id),
     * the object is placed ahead.
     *
     * @param {mixed} gs1 The first game stage to compare
     * @param {mixed} gs2 The second game stage to compare
     *
     * @return {number} result The result of the comparison
     *
     * @see GameStage constructor
     * @see GameStage.toHash (static)
     */
    GameStage.compare = function(gs1, gs2) {
        var result;
        // null, undefined, 0.
        if (!gs1 && !gs2) return 0;
        if (!gs2) return -1;
        if (!gs1) return 1;

        gs1 = new GameStage(gs1);
        gs2 = new GameStage(gs2);

        if ('number' === typeof gs1.stage) {
            if ('number' === typeof gs2.stage) {
                result = gs2.stage - gs1.stage;
            }
            else {
                result = -1;
            }
        }
        else if ('number' === typeof gs2.stage) {
            result = 1;
        }

        if (result === 0) {
            if ('number' === typeof gs1.round) {
                if ('number' === typeof gs2.round) {
                    result = gs2.round - gs1.round;
                }
                else {
                    result = -1;
                }

            }
            else if ('number' === typeof gs2.round) {
                result = 1;
            }
        }

        if (result === 0) {
            if ('number' === typeof gs1.step) {
                if ('number' === typeof gs2.step) {
                    result = gs2.step - gs1.step;
                }
                else {
                    result = -1;
                }

            }
            else if ('number' === typeof gs2.step) {
                result = 1;
            }
        }

        return result > 0 ? 1 : result < 0 ? -1 : 0;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
