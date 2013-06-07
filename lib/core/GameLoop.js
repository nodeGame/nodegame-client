/**
 * # GameLoop
 *
 * `nodeGame` container of game-state functions
 *
 * ---
 */
(function(exports, node) {

// ## Global scope
exports.GameLoop = GameLoop;

var Stager = node.Stager;
var GameStage = node.GameStage;

// ## Constants
GameLoop.GAMEOVER = 'NODEGAME_GAMEOVER';
GameLoop.END_SEQ  = 'NODEGAME_END_SEQ';
GameLoop.NO_SEQ   = 'NODEGAME_NO_SEQ';

/**
 * ## GameLoop constructor
 *
 * Creates a new instance of GameLoop
 *
 * Takes a sequence object created with Stager.
 *
 * If the Stager parameter has an empty sequence, flexibile mode is assumed
 * (used by e.g. GameLoop.next).
 *
 * @param {Stager} plot Optional. The Stager object.
 *
 * @see Stager
 */
function GameLoop(plot) {
    this.plot = plot || null;
}

// ## GameLoop methods

/**
 * ### GameLoop.init
 *
 * Initializes the GameLoop with a plot
 *
 * @param {Stager} plot The Stager object
 *
 * @see Stager
 */
GameLoop.prototype.init = function(plot) {
    this.plot = plot;
};

/**
 * ### GameLoop.next
 *
 * Returns the next stage in the loop
 *
 * If the step in `curStage` is an integer and out of bounds, that bound is assumed.
 *
 * @param {GameStage} curStage Optional. The GameStage object from which to get
 *  the next one. Defaults to returning the first stage.
 *
 * @return {GameStage} The GameStage describing the next stage
 *
 * @see GameStage
 */
GameLoop.prototype.next = function(curStage) {
    // GameLoop was not correctly initialized
    if (!this.plot) return GameLoop.NO_SEQ;

    // Find out flexibility mode:
    var flexibleMode = this.plot.sequence.length === 0;

    var seqIdx, seqObj = null, stageObj;
    var stageNo, stepNo;
    var normStage = null;
    var nextStage = null;

    curStage = new GameStage(curStage);

    if (flexibleMode) {
        if (curStage.stage === 0) {
            // Get first stage:
            if (this.plot.generalNextFunction) {
                nextStage = this.plot.generalNextFunction();
            }

            if (nextStage) {
                return new GameStage({
                    stage: nextStage,
                    step:  1,
                    round: 1
                });
            }

            return GameLoop.END_SEQ;
        }

        // Get stage object:
        stageObj = this.plot.stages[curStage.stage];

        if ('undefined' === typeof stageObj) {
            node.warn('next received nonexistent stage: ' + curStage.stage);
            return null;
        }

        // Find step number:
        if ('number' === typeof curStage.step) {
            stepNo = curStage.step;
        }
        else {
            stepNo = stageObj.steps.indexOf(curStage.step) + 1;
        }
        if (stepNo < 1) {
            node.warn('next received nonexistent step: ' +
                    stageObj.id + '.' + curStage.step);
            return null;
        }

        // Handle stepping:
        if (stepNo + 1 <= stageObj.steps.length) {
            return new GameStage({
                stage: stageObj.id,
                step:  stepNo + 1,
                round: 1
            });
        }

        // Get next stage:
        if (this.plot.nextFunctions[stageObj.id]) {
            nextStage = this.plot.nextFunctions[stageObj.id]();
        }
        else if (this.plot.generalNextFunction) {
            nextStage = this.plot.generalNextFunction();
        }

        if (nextStage === GameLoop.GAMEOVER)  {
            return GameLoop.GAMEOVER;
        }
        else if (nextStage) {
            return new GameStage({
                stage: nextStage,
                step:  1,
                round: 1
            });
        }

        return GameLoop.END_SEQ;
    }
    else {
        if (curStage.stage === 0) {
            return new GameStage({
                stage: 1,
                step:  1,
                round: 1
            });
        }

        // Get normalized GameStage:
        normStage = this.normalizeGameStage(curStage);
        if (normStage === null) {
            node.warn('next received invalid stage: ' + curStage);
            return null;
        }
        stageNo  = normStage.stage;
        stepNo   = normStage.step;
        seqObj   = this.plot.sequence[stageNo - 1];
        if (seqObj.type === 'gameover') return GameLoop.GAMEOVER;
        stageObj = this.plot.stages[seqObj.id];

        // Handle stepping:
        if (stepNo + 1 <= stageObj.steps.length) {
            return new GameStage({
                stage: stageNo,
                step:  stepNo + 1,
                round: normStage.round
            });
        }

        // Handle repeat block:
        if (seqObj.type === 'repeat' && normStage.round + 1 <= seqObj.num) {
            return new GameStage({
                stage: stageNo,
                step:  1,
                round: normStage.round + 1
            });
        }

        // Handle looping blocks:
        if ((seqObj.type === 'doLoop' || seqObj.type === 'loop') && seqObj.cb()) {
            return new GameStage({
                stage: stageNo,
                step:  1,
                round: normStage.round + 1
            });
        }

        // Go to next stage:
        if (stageNo < this.plot.sequence.length) {
            // Skip over loops if their callbacks return false:
            while (this.plot.sequence[stageNo].type === 'loop' &&
                    !this.plot.sequence[stageNo].cb()) {
                stageNo++;
                if (stageNo >= this.plot.sequence.length) return GameLoop.END_SEQ;
            }

            // Handle gameover:
            if (this.plot.sequence[stageNo].type === 'gameover') {
                return GameLoop.GAMEOVER;
            }

            return new GameStage({
                stage: stageNo + 1,
                step:  1,
                round: 1
            });
        }

        // No more stages remaining:
        return GameLoop.END_SEQ;
    }
};

/**
 * ### GameLoop.previous
 *
 * Returns the previous stage in the loop
 *
 * Works only in simple mode.
 * Behaves on loops the same as `GameLoop.next`, with round=1 always.
 *
 * @param {GameStage} curStage The GameStage object from which to get the previous one
 *
 * @return {GameStage} The GameStage describing the previous stage
 *
 * @see GameStage
 */
GameLoop.prototype.previous = function(curStage) {
    // GameLoop was not correctly initialized
    if (!this.plot) return GameLoop.NO_SEQ;

    var normStage;
    var seqIdx, seqObj = null, stageObj = null;
    var prevSeqObj;
    var stageNo, stepNo, prevStepNo;

    curStage = new GameStage(curStage);

    // Get normalized GameStage:
    normStage = this.normalizeGameStage(curStage);
    if (normStage === null) {
        node.warn('previous received invalid stage: ' + curStage);
        return null;
    }
    stageNo  = normStage.stage;
    stepNo   = normStage.step;
    seqObj   = this.plot.sequence[stageNo - 1];

    // Handle stepping:
    if (stepNo > 1) {
        return new GameStage({
            stage: stageNo,
            step:  stepNo - 1,
            round: curStage.round
        });
    }

    if ('undefined' !== typeof seqObj.id) {
        stageObj = this.plot.stages[seqObj.id];
        // Handle rounds:
        if (curStage.round > 1) {
            return new GameStage({
                stage: stageNo,
                step:  stageObj.steps.length,
                round: curStage.round - 1
            });
        }

        // Handle looping blocks:
        if ((seqObj.type === 'doLoop' || seqObj.type === 'loop') && seqObj.cb()) {
            return new GameStage({
                stage: stageNo,
                step:  stageObj.steps.length,
                round: 1
            });
        }
    }

    // Handle beginning:
    if (stageNo <= 1) {
        return new GameStage({
            stage: 0,
            step:  0,
            round: 0
        });
    }

    // Go to previous stage:
    // Skip over loops if their callbacks return false:
    while (this.plot.sequence[stageNo - 2].type === 'loop' &&
            !this.plot.sequence[stageNo - 2].cb()) {
        stageNo--;

        if (stageNo <= 1) {
            return new GameStage({
                stage: 0,
                step:  0,
                round: 0
            });
        }
    }

    // Get previous sequence object:
    prevSeqObj = this.plot.sequence[stageNo - 2];

    // Get number of steps in previous stage:
    prevStepNo = this.plot.stages[prevSeqObj.id].steps.length;

    // Handle repeat block:
    if (prevSeqObj.type === 'repeat') {
        return new GameStage({
            stage: stageNo - 1,
            step:  prevStepNo,
            round: prevSeqObj.num
        });
    }

    // Handle normal blocks:
    return new GameStage({
        stage: stageNo - 1,
        step:  prevStepNo,
        round: 1
    });
};

/**
 * ### GameLoop.jump
 *
 * Returns a distant stage in the loop
 *
 * Works with negative delta only in simple mode.
 * Uses `GameLoop.previous` and `GameLoop.next` for stepping.
 * If a sequence end is reached, returns immediately.
 *
 * @param {GameStage} curStage The GameStage object from which to get the offset one
 * @param {number} delta The offset. Negative number for backward stepping.
 *
 * @return {GameStage} The GameStage describing the distant stage
 *
 * @see GameStage
 * @see GameLoop.previous
 * @see GameLoop.next
 */
GameLoop.prototype.jump = function(curStage, delta) {
    if (delta < 0) {
        while (delta < 0) {
            curStage = this.previous(curStage);
            delta++;

            if (!(curStage instanceof GameStage) || curStage.stage === 0) {
                return curStage;
            }
        }
    }
    else {
        while (delta > 0) {
            curStage = this.next(curStage);
            delta--;

            if (!(curStage instanceof GameStage)) {
                return curStage;
            }
        }
    }

    return curStage;
};

/**
 * ### GameLoop.stepsToNextStage
 *
 * Returns the number of steps until the beginning of the next stage
 *
 * @param {object|string} gameStage The GameStage object, or its string representation
 *
 * @return {number|null} The number of steps to go, minimum 1. Null on error.
 */
GameLoop.prototype.stepsToNextStage = function(gameStage) {
    var stageObj, stepNo;

    gameStage = new GameStage(gameStage);
    if (gameStage.stage === 0) return 1;
    stageObj = this.getStage(gameStage);
    if (!stageObj) return null;

    if ('number' === typeof gameStage.step) {
        stepNo = gameStage.step;
    }
    else {
        stepNo = stageObj.steps.indexOf(gameStage.step) + 1;
        // If indexOf returned -1, stepNo is 0 which will be caught below.
    }

    if (stepNo < 1 || stepNo > stageObj.steps.length) return null;

    return 1 + stageObj.steps.length - stepNo;
};

/**
 * ### GameLoop.stepsToPreviousStage
 *
 * Returns the number of steps back until the end of the previous stage
 *
 * @param {object|string} gameStage The GameStage object, or its string representation
 *
 * @return {number|null} The number of steps to go, minimum 1. Null on error.
 */
GameLoop.prototype.stepsToPreviousStage = function(gameStage) {
    var stageObj, stepNo;

    gameStage = new GameStage(gameStage);
    stageObj = this.getStage(gameStage);
    if (!stageObj) return null;

    if ('number' === typeof gameStage.step) {
        stepNo = gameStage.step;
    }
    else {
        stepNo = stageObj.steps.indexOf(gameStage.step) + 1;
        // If indexOf returned -1, stepNo is 0 which will be caught below.
    }

    if (stepNo < 1 || stepNo > stageObj.steps.length) return null;

    return stepNo;
};

/**
 * ### GameLoop.getStage
 *
 * Returns the stage object corresponding to a GameStage
 *
 * @param {object|string} gameStage The GameStage object, or its string representation
 *
 * @return {object|null} The corresponding stage object, or null value
 *  if the step was not found
 */
GameLoop.prototype.getStage = function(gameStage) {
    if (!this.plot) return null;
    var stageObj;
    gameStage = new GameStage(gameStage);
    if ('number' === typeof gameStage.stage) {
        stageObj = this.plot.sequence[gameStage.stage - 1];
        return stageObj ? this.plot.stages[stageObj.id] : null;
    }
    else {
        return this.plot.stages[gameStage.stage] || null;
    }
};

/**
 * ### GameLoop.getStep
 *
 * Returns the step object corresponding to a GameStage
 *
 * @param {object|string} gameStage The GameStage object, or its string representation
 *
 * @return {object|null} The corresponding step object, or null value
 *  if the step was not found
 */
GameLoop.prototype.getStep = function(gameStage) {
    if (!this.plot) return null;
    var stageObj;
    gameStage = new GameStage(gameStage);
    if ('number' === typeof gameStage.step) {
        stageObj = this.getStage(gameStage);
        return stageObj ? this.plot.steps[stageObj.steps[gameStage.step - 1]] : null;
    }
    else {
        return this.plot.steps[gameStage.step] || null;
    }
};

/**
 * ### GameLoop.getStepRule
 *
 * Returns the step-rule function corresponding to a GameStage
 *
 * The order of lookup is:
 *
 * 1. `steprule` property of the step object
 *
 * 2. `steprule` property of the stage object
 *
 * 3. default step-rule of the Stager object
 *
 * @param {object|string} gameStage The GameStage object, or its string representation
 *
 * @return {function|null} The step-rule function. Null on error.
 */
GameLoop.prototype.getStepRule = function(gameStage) {
    var stageObj = this.getStage(gameStage),
        stepObj  = this.getStep(gameStage);

    if (!stageObj || !stepObj) return null;

    if ('function' === typeof  stepObj.steprule) return  stepObj.steprule;
    if ('function' === typeof stageObj.steprule) return stageObj.steprule;

    // TODO: Use first line once possible (serialization issue):
    //return this.plot.getDefaultStepRule();
    return this.plot.defaultStepRule;
};

/**
 * ### GameLoop.getGlobal
 *
 * Looks up the value of a global variable
 *
 * Looks for definitions of a global variable in
 *
 * 1. the current step object,
 *
 * 2. the current stage object,
 *
 * 3. the defaults, defined in the Stager.
 *
 * @param {GameStage|string} gameStage The GameStage object, or its string representation
 * @param {string} global The name of the global variable
 *
 * @return {object|null} The value of the global variable if found,
 *   NULL otherwise.
 */
GameLoop.prototype.getGlobal = function(gameStage, globalVar) {
    var stepObj, stageObj;
    var stepGlobals, stageGlobals, defaultGlobals;

    gameStage = new GameStage(gameStage);

    // Look in current step:
    stepObj = this.getStep(gameStage);
    if (stepObj) {
        stepGlobals = stepObj.globals;
        if (stepGlobals && stepGlobals.hasOwnProperty(globalVar)) {
            return stepGlobals[globalVar];
        }
    }

    // Look in current stage:
    stageObj = this.getStage(gameStage);
    if (stageObj) {
        stageGlobals = stageObj.globals;
        if (stageGlobals && stageGlobals.hasOwnProperty(globalVar)) {
            return stageGlobals[globalVar];
        }
    }

    // Look in Stager's defaults:
    if (this.plot) {
        defaultGlobals = this.plot.getDefaultGlobals();
        if (defaultGlobals && defaultGlobals.hasOwnProperty(globalVar)) {
            return defaultGlobals[globalVar];
        }
    }

    // Not found:
    return null;
};

/**
 * ### GameLoop.getName
 *
 * TODO: To remove once transition is complete
 * @deprecated
 */
GameLoop.prototype.getName = function(gameStage) {
    var s = this.getStep(gameStage);
    return s ? s.name : s;
};

/**
 * ### GameLoop.getAllParams
 *
 * TODO: To remove once transition is complete
 * @deprecated
 */
GameLoop.prototype.getAllParams = GameLoop.prototype.getStep;

/**
 * ### GameLoop.normalizeGameStage
 *
 * Converts the GameStage fields to numbers
 *
 * Works only in simple mode.
 *
 * @param {GameStage} gameStage The GameStage object
 *
 * @return {GameStage} The normalized GameStage object; null on error
 *
 * @api private
 */
GameLoop.prototype.normalizeGameStage = function(gameStage) {
    var stageNo, stepNo, seqIdx, seqObj;

    // Find stage number:
    if ('number' === typeof gameStage.stage) {
        stageNo = gameStage.stage;
    }
    else {
        for (seqIdx = 0; seqIdx < this.plot.sequence.length; seqIdx++) {
            if (this.plot.sequence[seqIdx].id === gameStage.stage) {
                break;
            }
        }
        stageNo = seqIdx + 1;
    }
    if (stageNo < 1 || stageNo > this.plot.sequence.length) {
        node.warn('normalizeGameStage received nonexistent stage: ' + gameStage.stage);
        return null;
    }

    // Get sequence object:
    seqObj = this.plot.sequence[stageNo - 1];

    if (seqObj.type === 'gameover') {
        return new GameStage({
            stage: stageNo,
            step:  1,
            round: gameStage.round
        });
    }

    // Get stage object:
    stageObj = this.plot.stages[seqObj.id];

    // Find step number:
    if ('number' === typeof gameStage.step) {
        stepNo = gameStage.step;
    }
    else {
        stepNo = stageObj.steps.indexOf(gameStage.step) + 1;
    }
    if (stepNo < 1) {
        node.warn('normalizeGameStage received nonexistent step: ' +
                stageObj.id + '.' + gameStage.step);
        return null;
    }

    return new GameStage({
        stage: stageNo,
        step:  stepNo,
        round: gameStage.round
    });
};

// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
