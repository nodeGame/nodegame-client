/**
 * # GamePlot
 *
 * `nodeGame` container of game-state functions
 *
 * ---
 */
(function(exports, node) {

// ## Global scope
exports.GamePlot = GamePlot;

var Stager = node.Stager;
var GameStage = node.GameStage;

// ## Constants
GamePlot.GAMEOVER = 'NODEGAME_GAMEOVER';
GamePlot.END_SEQ  = 'NODEGAME_END_SEQ';
GamePlot.NO_SEQ   = 'NODEGAME_NO_SEQ';

/**
 * ## GamePlot constructor
 *
 * Creates a new instance of GamePlot
 *
 * Takes a sequence object created with Stager.
 *
 * If the Stager parameter has an empty sequence, flexibile mode is assumed
 * (used by e.g. GamePlot.next).
 *
 * @param {Stager} stager Optional. The Stager object.
 *
 * @see Stager
 */
function GamePlot(stager) {
    this.init(stager);
}

// ## GamePlot methods

/**
 * ### GamePlot.init
 *
 * Initializes the GamePlot with a stager
 *
 * @param {Stager} stager Optional. The Stager object.
 *
 * @see Stager
 */
GamePlot.prototype.init = function(stager) {
    if (stager) {
        if ('object' !== typeof stager) {
            throw new node.NodeGameMisconfiguredGameError(
                    'init called with invalid stager');
        }

        this.stager = stager;
    }
    else {
        this.stager = null;
    }
};

/**
 * ### GamePlot.next
 *
 * Returns the next stage in the stager
 *
 * If the step in `curStage` is an integer and out of bounds, that bound is assumed.
 *
 * @param {GameStage} curStage Optional. The GameStage object from which to get
 *  the next one. Defaults to returning the first stage.
 *
 * @return {GameStage|string} The GameStage describing the next stage
 *
 * @see GameStage
 */
GamePlot.prototype.next = function(curStage) {
    // GamePlot was not correctly initialized
    if (!this.stager) return GamePlot.NO_SEQ;

    // Find out flexibility mode:
    var flexibleMode = this.stager.sequence.length === 0;

    var seqIdx, seqObj = null, stageObj;
    var stageNo, stepNo;
    var normStage = null;
    var nextStage = null;

    curStage = new GameStage(curStage);

    if (flexibleMode) {
        if (curStage.stage === 0) {
            // Get first stage:
            if (this.stager.generalNextFunction) {
                nextStage = this.stager.generalNextFunction();
            }

            if (nextStage) {
                return new GameStage({
                    stage: nextStage,
                    step:  1,
                    round: 1
                });
            }

            return GamePlot.END_SEQ;
        }

        // Get stage object:
        stageObj = this.stager.stages[curStage.stage];

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
        if (this.stager.nextFunctions[stageObj.id]) {
            nextStage = this.stager.nextFunctions[stageObj.id]();
        }
        else if (this.stager.generalNextFunction) {
            nextStage = this.stager.generalNextFunction();
        }

        // If next-deciding function returns GamePlot.GAMEOVER,
        // consider it game over.
        if (nextStage === GamePlot.GAMEOVER)  {
            return GamePlot.GAMEOVER;
        }
        else if (nextStage) {
            return new GameStage({
                stage: nextStage,
                step:  1,
                round: 1
            });
        }

        return GamePlot.END_SEQ;
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
        seqObj   = this.stager.sequence[stageNo - 1];
        if (seqObj.type === 'gameover') return GamePlot.GAMEOVER;
        stageObj = this.stager.stages[seqObj.id];

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
        if (stageNo < this.stager.sequence.length) {
            // Skip over loops if their callbacks return false:
            while (this.stager.sequence[stageNo].type === 'loop' &&
                    !this.stager.sequence[stageNo].cb()) {
                stageNo++;
                if (stageNo >= this.stager.sequence.length) return GamePlot.END_SEQ;
            }

            // Handle gameover:
            if (this.stager.sequence[stageNo].type === 'gameover') {
                return GamePlot.GAMEOVER;
            }

            return new GameStage({
                stage: stageNo + 1,
                step:  1,
                round: 1
            });
        }

        // No more stages remaining:
        return GamePlot.END_SEQ;
    }
};

/**
 * ### GamePlot.previous
 *
 * Returns the previous stage in the stager
 *
 * Works only in simple mode.
 * Behaves on loops the same as `GamePlot.next`, with round=1 always.
 *
 * @param {GameStage} curStage The GameStage object from which to get the previous one
 *
 * @return {GameStage} The GameStage describing the previous stage
 *
 * @see GameStage
 */
GamePlot.prototype.previous = function(curStage) {
    // GamePlot was not correctly initialized
    if (!this.stager) return GamePlot.NO_SEQ;

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
    seqObj   = this.stager.sequence[stageNo - 1];

    // Handle stepping:
    if (stepNo > 1) {
        return new GameStage({
            stage: stageNo,
            step:  stepNo - 1,
            round: curStage.round
        });
    }

    if ('undefined' !== typeof seqObj.id) {
        stageObj = this.stager.stages[seqObj.id];
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
    while (this.stager.sequence[stageNo - 2].type === 'loop' &&
            !this.stager.sequence[stageNo - 2].cb()) {
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
    prevSeqObj = this.stager.sequence[stageNo - 2];

    // Get number of steps in previous stage:
    prevStepNo = this.stager.stages[prevSeqObj.id].steps.length;

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
 * ### GamePlot.jump
 *
 * Returns a distant stage in the stager
 *
 * Works with negative delta only in simple mode.
 * Uses `GamePlot.previous` and `GamePlot.next` for stepping.
 * If a sequence end is reached, returns immediately.
 *
 * @param {GameStage} curStage The GameStage object from which to get the offset one
 * @param {number} delta The offset. Negative number for backward stepping.
 *
 * @return {GameStage|string} The GameStage describing the distant stage
 *
 * @see GameStage
 * @see GamePlot.previous
 * @see GamePlot.next
 */
GamePlot.prototype.jump = function(curStage, delta) {
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
 * ### GamePlot.stepsToNextStage
 *
 * Returns the number of steps until the beginning of the next stage
 *
 * @param {GameStage|string} gameStage The GameStage object,
 *  or its string representation
 *
 * @return {number|null} The number of steps to go, minimum 1. NULL on error.
 */
GamePlot.prototype.stepsToNextStage = function(gameStage) {
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
 * ### GamePlot.stepsToPreviousStage
 *
 * Returns the number of steps back until the end of the previous stage
 *
 * @param {GameStage|string} gameStage The GameStage object,
 *  or its string representation
 *
 * @return {number|null} The number of steps to go, minimum 1. NULL on error.
 */
GamePlot.prototype.stepsToPreviousStage = function(gameStage) {
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
 * ### GamePlot.getStage
 *
 * Returns the stage object corresponding to a GameStage
 *
 * @param {GameStage|string} gameStage The GameStage object,
 *  or its string representation
 *
 * @return {object|null} The corresponding stage object, or NULL
 *  if the step was not found
 */
GamePlot.prototype.getStage = function(gameStage) {
    var stageObj;

    if (!this.stager) return null;
    gameStage = new GameStage(gameStage);
    if ('number' === typeof gameStage.stage) {
        stageObj = this.stager.sequence[gameStage.stage - 1];
        return stageObj ? this.stager.stages[stageObj.id] : null;
    }
    else {
        return this.stager.stages[gameStage.stage] || null;
    }
};

/**
 * ### GamePlot.getStep
 *
 * Returns the step object corresponding to a GameStage
 *
 * @param {GameStage|string} gameStage The GameStage object,
 *  or its string representation
 *
 * @return {object|null} The corresponding step object, or NULL
 *  if the step was not found
 */
GamePlot.prototype.getStep = function(gameStage) {
    var stageObj;

    if (!this.stager) return null;
    gameStage = new GameStage(gameStage);
    if ('number' === typeof gameStage.step) {
        stageObj = this.getStage(gameStage);
        return stageObj ? this.stager.steps[stageObj.steps[gameStage.step - 1]] : null;
    }
    else {
        return this.stager.steps[gameStage.step] || null;
    }
};

/**
 * ### GamePlot.getStepRule
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
 * @param {GameStage|string} gameStage The GameStage object,
 *  or its string representation
 *
 * @return {function|null} The step-rule function. NULL on error.
 */
GamePlot.prototype.getStepRule = function(gameStage) {
    var stageObj = this.getStage(gameStage),
        stepObj  = this.getStep(gameStage);

    if (!stageObj || !stepObj) return null;

    if ('function' === typeof  stepObj.steprule) return  stepObj.steprule;
    if ('function' === typeof stageObj.steprule) return stageObj.steprule;

    // TODO: Use first line once possible (serialization issue):
    //return this.stager.getDefaultStepRule();
    return this.stager.defaultStepRule;
};

/**
 * ### GamePlot.getGlobal
 *
 * Looks up the value of a global variable
 *
 * Looks for definitions of a global variable in
 *
 * 1. the globals property of the step object of the given gameStage,
 *
 * 2. the globals property of the stage object of the given gameStage,
 *
 * 3. the defaults, defined in the Stager.
 *
 * @param {GameStage|string} gameStage The GameStage object,
 *  or its string representation
 * @param {string} globalVar The name of the global variable
 *
 * @return {mixed|null} The value of the global variable if found,
 *   NULL otherwise.
 */
GamePlot.prototype.getGlobal = function(gameStage, globalVar) {
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
    if (this.stager) {
        defaultGlobals = this.stager.getDefaultGlobals();
        if (defaultGlobals && defaultGlobals.hasOwnProperty(globalVar)) {
            return defaultGlobals[globalVar];
        }
    }

    // Not found:
    return null;
};

/**
 * ### GamePlot.getProperty
 *
 * Looks up the value of a property
 *
 * Looks for definitions of a property in
 *
 * 1. the step object of the given gameStage,
 *
 * 2. the stage object of the given gameStage,
 *
 * 3. the defaults, defined in the Stager.
 *
 * @param {GameStage|string} gameStage The GameStage object,
 *  or its string representation
 * @param {string} property The name of the property
 *
 * @return {mixed|null} The value of the property if found, NULL otherwise.
 */
GamePlot.prototype.getProperty = function(gameStage, property) {
    var stepObj, stageObj;
    var defaultProps;

    gameStage = new GameStage(gameStage);

    // Look in current step:
    stepObj = this.getStep(gameStage);
    if (stepObj && stepObj.hasOwnProperty(property)) {
        return stepObj[property];
    }

    // Look in current stage:
    stageObj = this.getStage(gameStage);
    if (stageObj && stageObj.hasOwnProperty(property)) {
        return stageObj[property];
    }

    // Look in Stager's defaults:
    if (this.stager) {
        defaultProps = this.stager.getDefaultProperties();
        if (defaultProps && defaultProps.hasOwnProperty(property)) {
            return defaultProps[property];
        }
    }

    // Not found:
    return null;
};

/**
 * ### GamePlot.getName
 *
 * TODO: To remove once transition is complete
 * @deprecated
 */
GamePlot.prototype.getName = function(gameStage) {
    var s = this.getStep(gameStage);
    return s ? s.name : s;
};

/**
 * ### GamePlot.getAllParams
 *
 * TODO: To remove once transition is complete
 * @deprecated
 */
GamePlot.prototype.getAllParams = GamePlot.prototype.getStep;

/**
 * ### GamePlot.normalizeGameStage
 *
 * Converts the GameStage fields to numbers
 *
 * Works only in simple mode.
 *
 * @param {GameStage} gameStage The GameStage object
 *
 * @return {GameStage|null} The normalized GameStage object; NULL on error
 *
 * @api private
 */
GamePlot.prototype.normalizeGameStage = function(gameStage) {
    var stageNo, stepNo, seqIdx, seqObj;

    if (!gameStage || 'object' !== typeof gameStage) return null;

    // Find stage number:
    if ('number' === typeof gameStage.stage) {
        stageNo = gameStage.stage;
    }
    else {
        for (seqIdx = 0; seqIdx < this.stager.sequence.length; seqIdx++) {
            if (this.stager.sequence[seqIdx].id === gameStage.stage) {
                break;
            }
        }
        stageNo = seqIdx + 1;
    }
    if (stageNo < 1 || stageNo > this.stager.sequence.length) {
        node.warn('normalizeGameStage received nonexistent stage: ' + gameStage.stage);
        return null;
    }

    // Get sequence object:
    seqObj = this.stager.sequence[stageNo - 1];
    if (!seqObj) return null;

    if (seqObj.type === 'gameover') {
        return new GameStage({
            stage: stageNo,
            step:  1,
            round: gameStage.round
        });
    }

    // Get stage object:
    stageObj = this.stager.stages[seqObj.id];
    if (!stageObj) return null;

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

    // Check round property:
    if ('number' !== typeof gameStage.round) return null;

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