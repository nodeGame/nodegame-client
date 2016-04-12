/**
 * # GamePlot
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` container of game stages functions
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    exports.GamePlot = GamePlot;

    var GameStage = parent.GameStage;
    var J = parent.JSUS;

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
     * If the Stager parameter has an empty sequence, flexible mode is assumed
     * (used by e.g. GamePlot.next).
     *
     * @param {NodeGameClient} node Reference to current node object
     * @param {Stager} stager Optional. The Stager object.
     *
     * @see Stager
     */
    function GamePlot(node, stager) {

        /**
         * ## GamePlot.node
         *
         * Reference to the node object
         */
        this.node = node;

        /**
         * ## GamePlot.stager
         *
         * The stager object used to perform stepping operations
         */
        this.stager = null;

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
                throw new Error('GamePlot.init: called with invalid stager.');
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
     * Returns the next stage in the sequence
     *
     * If the step in `curStage` is an integer and out of bounds,
     * that bound is assumed.
     *
     * @param {GameStage} curStage The GameStage of reference
     * @param {bolean} execLoops Optional. If true, loop and doLoop
     *   conditional function will be executed to determine next stage.
     *   If false, null will be returned if the next stage depends
     *   on the execution of the loop/doLoop conditional function.
     *   Default: true.
     *
     * @return {GameStage|string} The GameStage after _curStage_
     *
     * @see GameStage
     */
    GamePlot.prototype.next = function(curStage, execLoops) {
        var seqObj, stageObj;
        var stageNo, stepNo, steps;
        var normStage, nextStage;
        var flexibleMode;

        // GamePlot was not correctly initialized.
        if (!this.stager) return GamePlot.NO_SEQ;

        // Init variables.
        seqObj = null, stageObj = null, normStage = null, nextStage = null;
        // Find out flexibility mode.
        flexibleMode = this.isFlexibleMode();

        if (flexibleMode) {
            curStage = new GameStage(curStage);

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
                throw new Error('Gameplot.next: received nonexistent stage: ' +
                                curStage.stage);
            }

            // Find step number:
            if ('number' === typeof curStage.step) {
                stepNo = curStage.step;
            }
            else {
                stepNo = stageObj.steps.indexOf(curStage.step) + 1;
            }
            if (stepNo < 1) {
                throw new Error('GamePlot.next: received nonexistent step: ' +
                                stageObj.id + '.' + curStage.step);
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

        // Standard Mode.
        else {
            // Get normalized GameStage:
            // makes sures stage is with numbers and not strings.
            normStage = this.normalizeGameStage(curStage);
            if (normStage === null) {
                this.node.warn('GamePlot.next: invalid stage: ' + curStage);
                return null;
            }

            stageNo = normStage.stage;

            if (stageNo === 0) {
                return new GameStage({
                    stage: 1,
                    step:  1,
                    round: 1
                });
            }

            stepNo = normStage.step;
            seqObj = this.stager.sequence[stageNo - 1];

            if (seqObj.type === 'gameover') return GamePlot.GAMEOVER;

            execLoops = 'undefined' === typeof execLoops ? true : execLoops;

            // Get stage object.
            stageObj = this.stager.stages[seqObj.id];

            steps = seqObj.steps;

            // Handle stepping:
            if (stepNo + 1 <= steps.length) {
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
            if (seqObj.type === 'doLoop' || seqObj.type === 'loop') {

                // Return null if a loop is found and can't be executed.
                if (!execLoops) return null;

                // Call loop function. True means continue loop.
                if (seqObj.cb.call(this.node.game)) {
                    return new GameStage({
                        stage: stageNo,
                        step:  1,
                        round: normStage.round + 1
                    });
                }
            }

            // Go to next stage.
            if (stageNo < this.stager.sequence.length) {
                seqObj = this.stager.sequence[stageNo];

                // Return null if a loop is found and can't be executed.
                if (!execLoops && seqObj.type === 'loop') return null;

                // Skip over loops if their callbacks return false:
                while (seqObj.type === 'loop' &&
                       !seqObj.cb.call(this.node.game)) {

                    stageNo++;
                    if (stageNo >= this.stager.sequence.length) {
                        return GamePlot.END_SEQ;
                    }
                    // Update seq object.
                    seqObj = this.stager.sequence[stageNo];
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
     *
     * Previous of 0.0.0 is 0.0.0.
     *
     * @param {GameStage} curStage The GameStage of reference
     * @param {bolean} execLoops Optional. If true, loop and doLoop
     *   conditional function will be executed to determine previous stage.
     *   If false, null will be returned if the previous stage depends
     *   on the execution of the loop/doLoop conditional function.
     *   Default: true.
     *
     * @return {GameStage|null} The GameStage before _curStage_, or null
     *   if _curStage_ is invalid.
     *
     * @see GameStage
     */
    GamePlot.prototype.previous = function(curStage, execLoops) {
        var normStage;
        var seqObj, stageObj;
        var prevSeqObj;
        var stageNo, stepNo, prevStepNo;

        // GamePlot was not correctly initialized.
        if (!this.stager) return GamePlot.NO_SEQ;

        seqObj = null, stageObj = null;

        // Get normalized GameStage (calls GameStage constructor).
        normStage = this.normalizeGameStage(curStage);
        if (normStage === null) {
            this.node.warn('GamePlot.previous: invalid stage: ' + curStage);
            return null;
        }
        stageNo = normStage.stage;

        // Already 0.0.0, there is nothing before.
        if (stageNo === 0) return new GameStage();

        stepNo = normStage.step;
        seqObj = this.stager.sequence[stageNo - 1];

        execLoops = 'undefined' === typeof execLoops ? true : execLoops;

        // Within same stage.

        // Handle stepping.
        if (stepNo > 1) {
            return new GameStage({
                stage: stageNo,
                step:  stepNo - 1,
                round: normStage.round
            });
        }

        // Handle rounds:
        if (normStage.round > 1) {
            return new GameStage({
                stage: stageNo,
                step:  seqObj.steps.length,
                round: normStage.round - 1
            });
        }

        // Handle beginning (0.0.0).
        if (stageNo === 1) return new GameStage();

        // Go to previous stage.

        // Get previous sequence object:
        prevSeqObj = this.stager.sequence[stageNo - 2];

        // Return null if a loop is found and can't be executed.
        if (!execLoops && seqObj.type === 'loop') return null;

        // Skip over loops if their callbacks return false:
        while (prevSeqObj.type === 'loop' &&
               !prevSeqObj.cb.call(this.node.game)) {

            stageNo--;
            // (0.0.0).
            if (stageNo <= 1) return new GameStage();

            // Update seq object.
            prevSeqObj = this.stager.sequence[stageNo - 2];
        }

        // Get number of steps in previous stage:
        prevStepNo = prevSeqObj.steps.length;

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
     *
     * Uses `GamePlot.previous` and `GamePlot.next` for stepping.
     *
     * @param {GameStage} curStage The GameStage of reference
     * @param {number} delta The offset. Negative number for backward stepping.
     * @param {bolean} execLoops Optional. If true, loop and doLoop
     *   conditional function will be executed to determine next stage.
     *   If false, null will be returned when a loop or doLoop is found
     *   and more evaluations are still required. Default: true.
     *
     * @return {GameStage|string|null} The distant game stage
     *
     * @see GameStage
     * @see GamePlot.previous
     * @see GamePlot.next
     */
    GamePlot.prototype.jump = function(curStage, delta, execLoops) {
        var stageType;
        execLoops = 'undefined' === typeof execLoops ? true : execLoops;
        if (delta < 0) {
            while (delta < 0) {
                curStage = this.previous(curStage, execLoops);

                if (!(curStage instanceof GameStage) || curStage.stage === 0) {
                    return curStage;
                }
                delta++;
                if (!execLoops) {
                    // If there are more steps to jump, check if we have loops.
                    stageType = this.stager.sequence[curStage.stage -1].type
                    if (stageType === 'loop') {
                        if (delta < 0) return null;
                    }
                    else if (stageType === 'doLoop') {
                        if (delta < -1) return null;
                        else return curStage;
                    }
                }
            }
        }
        else {
            while (delta > 0) {
                curStage = this.next(curStage, execLoops);
                // If we find a loop return null.
                if (!(curStage instanceof GameStage)) return curStage;

                delta--;
                if (!execLoops) {
                    // If there are more steps to jump, check if we have loops.
                    stageType = this.stager.sequence[curStage.stage -1].type
                    if (stageType === 'loop' || stageType === 'doLoop') {
                        if (delta > 0) return null;
                        else return curStage;
                    }
                }
            }
        }

        return curStage;
    };

    /**
     * ### GamePlot.stepsToNextStage
     *
     * Returns the number of steps from next stage (normalized)
     *
     * The next stage can be a repetition of the current one, if inside a
     * loop or a repeat stage.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     *
     * @return {number|null} The number of steps including current one,
     *   or NULL on error.
     */
    GamePlot.prototype.stepsToNextStage = function(gameStage) {
        var seqObj, stepNo, limit;
        if (!this.stager) return null;

        gameStage = this.normalizeGameStage(gameStage);
        if (!gameStage) return null;
        if (gameStage.stage === 0) return 1;
        seqObj = this.getSequenceObject(gameStage);
        if (!seqObj) return null;
        stepNo = gameStage.step;
        return 1 + seqObj.steps.length - stepNo;
    };


    GamePlot.prototype.stepsToPreviousStage = function(gameStage) {
        console.log('GamePlot.stepsToPreviousStage is **deprecated**. Use' +
                    'GamePlot.stepsFromPreviousStage instead.');
        return this.stepsFromPreviousStage(gameStage);
    };

    /**
     * ### GamePlot.stepsFromPreviousStage
     *
     * Returns the number of steps from previous stage (normalized)
     *
     * The previous stage can be a repetition of the current one, if inside a
     * loop or a repeat stage.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     *
     * @return {number|null} The number of steps including current one, or
     *   NULL on error.
     */
    GamePlot.prototype.stepsFromPreviousStage = function(gameStage) {
        var seqObj, stepNo, limit;
        if (!this.stager) return null;

        gameStage = this.normalizeGameStage(gameStage);
        if (!gameStage || gameStage.stage === 0) return null;
        seqObj = this.getSequenceObject(gameStage);
        if (!seqObj) return null;
        stepNo = gameStage.step;
        return (stepNo < 1 || stepNo > seqObj.steps.length) ? null : stepNo;
    };

    /**
     * ### GamePlot.getSequenceObject
     *
     * Returns the sequence object corresponding to a GameStage
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *   or its string representation
     *
     * @return {object|null} The corresponding sequence object,
     *   or NULL if not found
     */
    GamePlot.prototype.getSequenceObject = function(gameStage) {
        if (!this.stager) return null;
        gameStage = this.normalizeGameStage(gameStage);
        return gameStage ? this.stager.sequence[gameStage.stage - 1] : null;
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
        gameStage = this.normalizeGameStage(gameStage);
        if (gameStage) {
            stageObj = this.stager.sequence[gameStage.stage - 1];
            stageObj = stageObj ? this.stager.stages[stageObj.id] : null;
        }
        return stageObj || null;
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
        var seqObj, stepObj;
        if (!this.stager) return null;
        gameStage = this.normalizeGameStage(gameStage);
        if (gameStage) {
            seqObj = this.getSequenceObject(gameStage);
            if (seqObj) {
                stepObj = this.stager.steps[seqObj.steps[gameStage.step - 1]];
            }
        }
        return stepObj || null;
    };

    /**
     * ### GamePlot.getStepRule
     *
     * Returns the step-rule function corresponding to a GameStage
     *
     * If gameStage.stage = 0, it returns a function that always returns TRUE.
     *
     * Otherwise, the order of lookup is:
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
        var stageObj, stepObj, rule;

        gameStage = new GameStage(gameStage);

        if (gameStage.stage === 0) {
            return function() { return false; };
        }

        stageObj = this.getStage(gameStage);
        stepObj  = this.getStep(gameStage);

        if (!stageObj || !stepObj) {
            // TODO is this an error?
            return null;
        }

        // return a step-defined rule
        if ('string' === typeof stepObj.stepRule) {
            rule = parent.stepRules[stepObj.stepRule];
        }
        else if ('function' === typeof stepObj.stepRule) {
            rule = stepObj.stepRule;
        }
        if ('function' === typeof rule) return rule;

        // return a stage-defined rule
        if ('string' === typeof stageObj.stepRule) {
            rule = parent.stepRules[stageObj.stepRule];
        }
        else if ('function' === typeof stageObj.stepRule) {
            rule = stageObj.stepRule;
        }
        if ('function' === typeof rule) return rule;

        // Default rule.
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
     * ### GamePlot.getGlobals
     *
     * Looks up and build the _globals_ object for the specified game stage
     *
     * Globals properties are mixed in at each level (defaults, stage, step)
     * to form the complete set of globals available for the specified
     * game stage.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     *
     * @return {object} The _globals_ object for the specified  game stage
     */
    GamePlot.prototype.getGlobals = function(gameStage) {
        var stepstage, globals;
        if ('string' !== typeof gameStage && 'object' !== typeof gameStage) {
            throw new TypeError('GamePlot.getGlobals: gameStage must be ' +
                                'string or object.');
        }
        globals = {};
        // No stager found, no globals!
        if (!this.stager) return globals;

        // Look in Stager's defaults:
        J.mixin(globals, this.stager.getDefaultGlobals());

        // Look in current stage:
        stepstage = this.getStage(gameStage);
        if (stepstage) J.mixin(globals, stepstage.globals);

        // Look in current step:
        stepstage = this.getStep(gameStage);
        if (stepstage) J.mixin(globals, stepstage.globals);

        return globals;
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
        var stepObj, stageObj, defaultProps;

        gameStage = new GameStage(gameStage);

        if ('string' !== typeof property) {
            throw new TypeError('GamePlot.getProperty: property must be ' +
                                'string');
        }

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
     * ### GamePlot.updateProperty
     *
     * Looks up a property and updates it to the new value
     *
     * Looks follows the steps described in _GamePlot.getProperty_.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     * @param {string} property The name of the property
     * @param {mixed} value The new value for the property.
     *
     * @return {bool} TRUE, if property is found and updated, FALSE otherwise.
     */
    GamePlot.prototype.updateProperty = function(gameStage, property, value) {
        var stepObj, stageObj, defaultProps;

        gameStage = new GameStage(gameStage);

        if ('string' !== typeof property) {
            throw new TypeError('GamePlot.updateProperty: property must be ' +
                                'string');
        }

        // Look in current step:
        stepObj = this.getStep(gameStage);
        if (stepObj && stepObj.hasOwnProperty(property)) {
            stepObj[property] = value;
            return true;
        }

        // Look in current stage:
        stageObj = this.getStage(gameStage);
        if (stageObj && stageObj.hasOwnProperty(property)) {
            stageObj[property] = value;
            return true;
        }

        // Look in Stager's defaults:
        if (this.stager) {
            defaultProps = this.stager.getDefaultProperties();
            if (defaultProps && defaultProps.hasOwnProperty(property)) {
                defaultProps[property] = value;
                return true;
            }
        }

        // Not found:
        return false;
    };

    /**
     * ### GamePlot.isReady
     *
     * Returns whether the stager has any content
     *
     * @return {boolean} FALSE if stager is empty, TRUE otherwise
     */
    GamePlot.prototype.isReady = function() {
        return this.stager &&
            (this.stager.sequence.length > 0 ||
             this.stager.generalNextFunction !== null ||
             !J.isEmpty(this.stager.nextFunctions));
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
     * ### GamePlot.normalizeGameStage
     *
     * Converts the GameStage fields to numbers
     *
     * Works only in simple mode.
     *
     * @param {GameStage|string} gameStage The GameStage object
     *
     * @return {GameStage|null} The normalized GameStage object; NULL on error
     */
    GamePlot.prototype.normalizeGameStage = function(gameStage) {
        var stageNo, stageObj, stepNo, seqIdx, seqObj, tokens, round;
        var gs;

        gs = new GameStage(gameStage);

        // Find stage number.
        if ('number' === typeof gs.stage) {
            if (gs.stage === 0) return new GameStage();
            stageNo = gs.stage;
        }
        else if ('string' === typeof gs.stage) {
            for (seqIdx = 0; seqIdx < this.stager.sequence.length; seqIdx++) {
                if (this.stager.sequence[seqIdx].id === gs.stage) {
                    break;
                }
            }
            stageNo = seqIdx + 1;
        }
        else {
            throw new Error('GamePlot.normalizeGameStage: gameStage.stage ' +
                            'must be number or string: ' +
                            (typeof gs.stage));
        }

        if (stageNo < 1 || stageNo > this.stager.sequence.length) {
            this.node.warn('GamePlot.normalizeGameStage: nonexistent stage: ' +
                           gs.stage);
            return null;
        }

        // Get sequence object.
        seqObj = this.stager.sequence[stageNo - 1];
        if (!seqObj) return null;

        if (seqObj.type === 'gameover') {
            return new GameStage({
                stage: stageNo,
                step:  1,
                round: gs.round
            });
        }

        // Get stage object.
        stageObj = this.stager.stages[seqObj.id];
        if (!stageObj) return null;

        // Find step number.
        if ('number' === typeof gs.step) {
            stepNo = gs.step;
        }
        else if ('string' === typeof gs.step) {
            stepNo = seqObj.steps.indexOf(gs.step) + 1;
        }
        else {
            throw new Error('GamePlot.normalizeGameStage: gameStage.step ' +
                            'must be number or string: ' +
                            (typeof gs.step));
        }

        if (stepNo < 1 || stepNo > stageObj.steps.length) {
            this.node.warn('normalizeGameStage received nonexistent step: ' +
                           stageObj.id + '.' + gs.step);
            return null;
        }

        // Check round property.
        if ('number' !== typeof gs.round) return null;

        return new GameStage({
            stage: stageNo,
            step:  stepNo,
            round: gs.round
        });
    };

    /**
     * ### GamePlot.isFlexibleMode
     *
     * Returns TRUE if operating in _flexible_ mode
     *
     * In _flexible_ mode the next step to be executed is decided by a
     * a callback function.
     *
     * In standard mode all steps are already inserted in a sequence.
     *
     * @return {boolean} TRUE if flexible mode is on
     */
    GamePlot.prototype.isFlexibleMode = function() {
        return this.stager.sequence.length === 0;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
