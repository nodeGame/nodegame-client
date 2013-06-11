/**
 * # GameStage
 *
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 *
 * Representation of the stage of a game:
 *
 *  `stage`: the higher-level building blocks of a game
 *  `step`: the sub-unit of a stage
 *  `round`: the number of repetition for a stage. Defaults round = 1
 *
 *
 * @see GamePlot
 *
 * ---
 *
 */

(function(exports, node) {

// ## Global scope

var JSUS = node.JSUS;

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
 * It accepts an object literal or an hash string as defined in `GameStage.defaults.hash`.
 *
 * The stage and step can be either an integer (1-based index) or a string
 * (valid stage/step name).  The round must be an integer.
 *
 * If no parameter is passed, all the properties of the GameStage
 * object are set to 0
 *
 * @param {object|string} gs An object literal | hash string representing the game stage
 *
 * @see GameStage.defaults.hash
 */
function GameStage(gs) {

// ## Public properties

/**
 * ### GameStage.stage
 *
 * The N-th game-block (stage) in the game-plot currently being executed
 *
 * @see GamePlot
 *
 */
    this.stage = 0;

/**
 * ### GameStage.step
 *
 * The N-th game-block (step) nested in the current stage
 *
 *  @see GameStage.stage
 *
 */
    this.step = 1;

/**
 * ### GameStage.round
 *
 * The number of times the current stage was repeated
 *
 */
    this.round = 1;

    if (!gs || 'undefined' === typeof gs) {
        this.stage = 0;
        this.step  = 0;
        this.round = 0;
    }
    else if ('string' === typeof gs) {
        var tokens = gs.split('.');
        var stageNum = parseInt(tokens[0], 10);
        var stepNum  = parseInt(tokens[1], 10);
        var roundNum = parseInt(tokens[2], 10);

        if (tokens[0])
            this.stage = !isNaN(stageNum) ? stageNum : tokens[0];

        if ('undefined' !== typeof tokens[1])
            this.step  = !isNaN(stepNum)  ? stepNum  : tokens[1];

        if ('undefined' !== typeof tokens[2])
            this.round = roundNum;
    }
    else if ('object' === typeof gs) {
        if ('undefined' !== typeof gs.stage)
            this.stage = gs.stage;

        if ('undefined' !== typeof gs.step)
            this.step  = gs.step;

        if ('undefined' !== typeof gs.round)
            this.round = gs.round;
    }

}

/**
 * ## GameStage.toString
 *
 * Converts the current instance of GameStage to a string
 *
 * @return {string} out The string representation of the stage of the GameStage
 */
GameStage.prototype.toString = function() {
    return this.toHash('S.s.r');
};

/**
 * ## GameStage.toHash
 *
 * Returns a simplified hash of the stage of the GameStage,
 * according to the input string
 *
 * @param {string} str The hash code
 * @return {string} hash The hashed game stages
 *
 * @see GameStage.toHash (static)
 */
GameStage.prototype.toHash = function(str) {
    return GameStage.toHash(this, str);
};

/**
 * ## GameStage.toHash (static)
 *
 * Returns a simplified hash of the stage of the GameStage,
 * according to the input string.
 *
 * The following characters are valid to determine the hash string
 *
 *  - S: stage
 *  - s: step
 *  - r: round
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
 * @param {string} str The hash code
 * @return {string} hash The hashed game stages
 */
GameStage.toHash = function(gs, str) {
    if (!gs || 'object' !== typeof gs) return false;
    if (!str || !str.length) return gs.toString();

    var hash = '',
        symbols = 'Ssr',
        properties = ['stage', 'step', 'round'];

    for (var i = 0; i < str.length; i++) {
        var idx = symbols.indexOf(str[i]);
        hash += (idx < 0) ? str[i] : gs[properties[idx]];
    }
    return hash;
};

/**
 * ## GameStage.compare (static)
 *
 * Compares two GameStage objects|hash strings and returns
 *
 *  - 0 if they represent the same game stage
 *  - a positive number if gs1 is ahead of gs2
 *  - a negative number if gs2 is ahead of gs1
 *
 * The accepted hash string format is the following: 'S.s.r'.
 * Refer to `GameStage.toHash` for the semantic of the characters.
 *
 *
 * @param {GameStage|string} gs1 The first GameStage object|string to compare
 * @param {GameStage|string} gs2 The second GameStage object|string to compare
 *
 * @return {Number} result The result of the comparison
 *
 * @see GameStage.toHash (static)
 *
 */
GameStage.compare = function(gs1, gs2) {
    var result;
    if ('undefined' === typeof gs1 && 'undefined' === typeof gs2) return 0;
    if ('undefined' === typeof gs2) return 1;
    if ('undefined' === typeof gs1) return -1;

    // Convert the parameters to objects, if an hash string was passed
    if ('string' === typeof gs1) gs1 = new GameStage(gs1);
    if ('string' === typeof gs2) gs2 = new GameStage(gs2);

    result = gs1.stage - gs2.stage;

    if (result === 0 && 'undefined' !== typeof gs1.round) {
        result = gs1.round - gs2.round;

        if (result === 0 && 'undefined' !== typeof gs1.step) {
            result = gs1.step - gs2.step;
        }
    }
    
    return result;
};

/**
 * ## GameStage.stringify (static)
 *
 * Converts an object GameStage-like to its string representation
 *
 * @param {GameStage} gs The object to convert to string
 * @return {string} out The string representation of a GameStage object
 */
GameStage.stringify = function(gs) {
    if (!gs) return;
    var out = new GameStage(gs).toHash('(r) S.s_i');
    return out;
};

// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
