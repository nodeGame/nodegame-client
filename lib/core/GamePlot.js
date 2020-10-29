/**
 * # GamePlot
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Wraps a stager and exposes methods to navigate through the sequence
 *
 * TODO: previousStage
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

        // ## GamePlot Properties

        /**
         * ### GamePlot.node
         *
         * Reference to the node object
         */
        this.node = node;

        /**
         * ### GamePlot.stager
         *
         * The stager object used to perform stepping operations
         */
        this.stager = null;

        /**
         * ### GamePlot.cache
         *
         * Caches the value of previously fetched properties per game stage
         */
        this.cache = {};

        /**
         * ### GamePlot.tmpCache
         *
         * Handles a temporary cache for properties of current step
         *
         * If set, properties are served first by the `getProperty` method.
         * This cache is deleted each time a step is done.
         * Used, for example, to reset some properties upon reconnect.
         *
         * Defined two additional methods:
         *
         *   - tmpCache.hasOwnProperty
         *   - tmpCache.clear
         *
         * @param {string} prop the name of the property to retrieve or set
         * @param {mixed} value The value of property to set
         *
         * @return {mixed} The current value of the property
         */
        this.tmpCache = (function() {
            var tmpCache, handler;
            tmpCache = {};
            handler = function(prop, value) {
                if ('undefined' === typeof prop) {
                    return tmpCache;
                }
                else if ('string' === typeof prop) {
                    if (arguments.length === 1) return tmpCache[prop];
                    tmpCache[prop] = value;
                    return value;
                }

                throw new TypeError('GamePlot.tmpCache: prop must be ' +
                                    'string. Found: ' + prop);
            };

            handler.clear = function() {
                var tmp;
                tmp = tmpCache;
                tmpCache = {};
                return tmp;
            };

            handler.hasOwnProperty = function(prop) {
                if ('string' !== typeof prop) {
                    throw new TypeError('GamePlot.tmpCache.hasProperty: ' +
                                        'prop must be string. Found: ' +
                                        prop);
                }
                return tmpCache.hasOwnProperty(prop);
            };

            return handler;
        })();

        /**
        * ### GamePlot._normalizedCache
        *
        * Caches the value of previously normalized Game Stages objects.
        *
        * @api private
        */
        this._normalizedCache = {};

        this.init(stager);
    }

    // ## GamePlot methods

    /**
     * ### GamePlot.init
     *
     * Initializes the GamePlot with a stager
     *
     * Clears the cache also.
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
        this.cache = {};
        this.tmpCache.clear();
    };

    /**
     * ### GamePlot.next
     *
     * Returns the next step in the sequence
     *
     * If the step in `curStage` is an integer and out of bounds,
     * that bound is assumed.
     *
     * // TODO: previousStage
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
    GamePlot.prototype.nextStage = function(curStage, execLoops) {
        var seqObj, stageObj;
        var stageNo, stepNo, steps;
        var normStage, nextStage;
        var flexibleMode;

        // GamePlot was not correctly initialized.
        if (!this.stager) return GamePlot.NO_SEQ;

        flexibleMode = this.isFlexibleMode();
        if (flexibleMode) {
            // TODO. What does next stage mean in flexible mode?
            // Calling the next cb of the last step? A separate cb?
            console.log('***GamePlot.nextStage: method not available in ' +
                        'flexible mode.***');
            return null;
        }

        // Standard Mode.
        else {
            // Get normalized GameStage:
            // makes sures stage is with numbers and not strings.
            normStage = this.normalizeGameStage(curStage);
            if (normStage === null) {
                this.node.silly('GamePlot.nextStage: invalid stage: ' +
                               curStage);
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
            seqObj = this.stager.sequence[stageNo - 1];

            if (seqObj.type === 'gameover') return GamePlot.GAMEOVER;

            execLoops = 'undefined' === typeof execLoops ? true : execLoops;

            // Get stage object.
            stageObj = this.stager.stages[seqObj.id];

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
     * ### GamePlot.next
     *
     * Returns the next step in the sequence
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
                throw new Error('Gameplot.next: received non-existent stage: ' +
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
                throw new Error('GamePlot.next: received non-existent step: ' +
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
                this.node.silly('GamePlot.next: invalid stage: ' + curStage);
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
     * Returns the previous step in the sequence
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
                    stageType = this.stager.sequence[curStage.stage -1].type;
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
                    stageType = this.stager.sequence[curStage.stage -1].type;
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
     * Returns the number of steps to reach the next stage
     *
     * By default, each stage repetition is considered as a new stage.
     *
     * @param {GameStage|string} gameStage The reference step
     * @param {boolean} countRepeat If TRUE stage repetitions are
     *  considered as current stage, and included in the count. Default: FALSE.
     *
     * @return {number|null} The number of steps including current one,
     *   or NULL on error.
     *
     * @see GamePlot.normalizeGameStage
     */
    GamePlot.prototype.stepsToNextStage = function(gameStage, countRepeat) {
        var seqObj, totSteps, stepNo;
        if (!this.stager) return null;

        // Checks stage and step ranges.
        gameStage = this.normalizeGameStage(gameStage);
        if (!gameStage) return null;
        if (gameStage.stage === 0) return 1;
        seqObj = this.getSequenceObject(gameStage);
        if (!seqObj) return null;
        stepNo = gameStage.step;
        totSteps = seqObj.steps.length;
        if (countRepeat) {
            if (seqObj.type === 'repeat') {
                if (gameStage.round > 1) {
                    stepNo = ((gameStage.round-1) * totSteps) + stepNo;
                }
                totSteps = totSteps * seqObj.num;
            }
            else if (seqObj.type === 'loop' || seqObj.type === 'doLoop') {
                return null;
            }
        }
        return 1 + totSteps - stepNo;
    };

    // TODO: remove in next version.
    GamePlot.prototype.stepsToPreviousStage = function(gameStage) {
        console.log('GamePlot.stepsToPreviousStage is **deprecated**. Use' +
                    'GamePlot.stepsFromPreviousStage instead.');
        return this.stepsFromPreviousStage(gameStage);
    };

    /**
     * ### GamePlot.stepsFromPreviousStage
     *
     * Returns the number of steps passed from the previous stage
     *
     * By default, each stage repetition is considered as a new stage.
     *
     * @param {GameStage|string} gameStage The reference step
     * @param {boolean} countRepeat If TRUE stage repetitions are
     *  considered as current stage, and included in the count. Default: FALSE.
     *
     * @return {number|null} The number of steps including current one, or
     *   NULL on error.
     *
     * @see GamePlot.normalizeGameStage
     */
    GamePlot.prototype.stepsFromPreviousStage = function(gameStage,
                                                         countRepeat) {

        var seqObj, stepNo;
        if (!this.stager) return null;

        // Checks stage and step ranges.
        gameStage = this.normalizeGameStage(gameStage);
        if (!gameStage || gameStage.stage === 0) return null;
        seqObj = this.getSequenceObject(gameStage);
        if (!seqObj) return null;
        stepNo = gameStage.step;
        if (countRepeat) {
            if (seqObj.type === 'repeat') {
                if (gameStage.round > 1) {
                    stepNo = (seqObj.steps.length * (gameStage.round-1)) +
                        stepNo;
                }
            }
            else if (seqObj.type === 'loop' || seqObj.type === 'doLoop') {
                return null;
            }
        }
        return stepNo;
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
        // Game stage is normalized inside getSequenceObject.
        seqObj = this.getSequenceObject(gameStage);
        if (seqObj) {
            stepObj = this.stager.steps[seqObj.steps[gameStage.step - 1]];
        }
        return stepObj || null;
    };

    /**
     * ### GamePlot.getStepRule
     *
     * Returns the step-rule function for a given game-stage
     *
     * Otherwise, the order of lookup is:
     *
     * 1. step object
     * 2. stage object
     * 3. default property
     * 4. default step-rule of the Stager object
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *   or its string representation
     *
     * @return {function} The step-rule function or the default rule
     *
     * @see Stager.getDefaultStepRule
     */
    GamePlot.prototype.getStepRule = function(gameStage) {
        var rule;
        rule = this.getProperty(gameStage, 'stepRule');
        if ('string' === typeof rule) rule = parent.stepRules[rule];
        return rule || this.stager.getDefaultStepRule();
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
     * Looks up the value of a property in a hierarchy of lookup locations
     *
     * The hierarchy of lookup locations is:
     *
     * 1. the temporary cache, if game stage equals current game stage
     * 2. the game plot cache
     * 3. the step object of the given gameStage,
     * 4. the stage object of the given gameStage,
     * 5. the defaults, defined in the Stager.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *   or its string representation
     * @param {string} prop The name of the property
     * @param {mixed} notFound Optional. A value to return if
     *   property is not found. Default: NULL
     * @param {object} mask Optional. An object disabling specific lookup
     *    locations. Default:
     * ```
     * { tmpCache: false, cache: false, step: false, stage: false, game: false }
     * ```
     *
     * @return {mixed|null} The value of the property if found, NULL otherwise.
     *
     * @see GamePlot.cache
     */
    GamePlot.prototype.getProperty = function(gameStage, prop, notFound, mask) {

        var stepObj, stageObj, defaultProps, found, res;

        if ('string' !== typeof prop) {
            throw new TypeError('GamePlot.getProperty: property must be ' +
                                'string. Found: ' + prop);
        }

        gameStage = new GameStage(gameStage);

        mask = mask || {};
        if ('object' !== typeof mask) {
            throw new TypeError('GamePlot.getProperty: mask must be ' +
                                'object or undefined. Found: ' + mask);
        }

        // Look in the tmpCache (cleared every step).
        if (!mask.tmpCache && this.tmpCache.hasOwnProperty(prop) &&
            GameStage.compare(gameStage,this.node.player.stage) === 0) {

            return this.tmpCache(prop);
        }

        // Look in the main cache (this persists over steps).
        if (!mask.tmpCache && this.cache[gameStage] &&
            this.cache[gameStage].hasOwnProperty(prop)) {

            return this.cache[gameStage][prop];
        }

        // Look in current step.
        if (!mask.step) {
            stepObj = this.getStep(gameStage);
            if (stepObj && stepObj.hasOwnProperty(prop)) {
                res = stepObj[prop];
                found = true;
            }
        }

        // Look in current stage.
        if (!found && !mask.stage) {
            stageObj = this.getStage(gameStage);
            if (stageObj && stageObj.hasOwnProperty(prop)) {
                res = stageObj[prop];
                found = true;
            }
        }

        // Look in Stager's defaults.
        if (!found && !mask.game && this.stager) {
            defaultProps = this.stager.getDefaultProperties();
            if (defaultProps && defaultProps.hasOwnProperty(prop)) {
                res = defaultProps[prop];
                found = true;
            }
        }

        // Cache it and return it.
        if (found) {
            cacheStepProperty(this, gameStage, prop, res);
            return res;
        }

        // Return notFound.
        return 'undefined' === typeof notFound ? null : notFound;
    };


    /**
     * ### GamePlot.updateProperty
     *
     * Looks up a property and updates it to the new value
     *
     * Look up follows the steps described in _GamePlot.getProperty_,
     * excluding step 1. If a property is found and updated, its value
     * is stored in the cached.
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *   or its string representation
     * @param {string} property The name of the property
     * @param {mixed} value The new value for the property.
     *
     * @return {bool} TRUE, if property is found and updated, FALSE otherwise.
     *
     * @see GamePlot.cache
     */
    GamePlot.prototype.updateProperty = function(gameStage, property, value) {
        var stepObj, stageObj, defaultProps, found;

        gameStage = new GameStage(gameStage);

        if ('string' !== typeof property) {
            throw new TypeError('GamePlot.updateProperty: property must be ' +
                                'string. Found: ' + property);
        }

        // Look in current step.
        stepObj = this.getStep(gameStage);
        if (stepObj && stepObj.hasOwnProperty(property)) {
            stepObj[property] = value;
            found = true;
        }

        // Look in current stage.
        if (!found) {
            stageObj = this.getStage(gameStage);
            if (stageObj && stageObj.hasOwnProperty(property)) {
                stageObj[property] = value;
                found = true;
            }
        }

        // Look in Stager's defaults.
        if (!found && this.stager) {
            defaultProps = this.stager.getDefaultProperties();
            if (defaultProps && defaultProps.hasOwnProperty(property)) {
                defaultProps[property] = value;
                found = true;
            }
        }

        // Cache it and return it.
        if (found) {
            cacheStepProperty(this, gameStage, property, value);
            return true;
        }

        // Not found.
        return false;
    };

    /**
     * ### GamePlot.setStepProperty
     *
     * Sets the value a property in a step object
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     * @param {string} property The name of the property
     * @param {mixed} value The new value for the property.
     *
     * @return {bool} TRUE, if property is found and updated, FALSE otherwise.
     *
     * @see GamePlot.cache
     */
    GamePlot.prototype.setStepProperty = function(gameStage, property, value) {
        var stepObj;

        gameStage = new GameStage(gameStage);

        if ('string' !== typeof property) {
            throw new TypeError('GamePlot.setStepProperty: property must be ' +
                                'string');
        }

        // Get step.
        stepObj = this.getStep(gameStage);

        if (stepObj) {
            stepObj[property] = value;
            // Cache it.
            cacheStepProperty(this, gameStage, property, value);
            return true;
        }

        return false;
    };

    /**
     * ### GamePlot.setStageProperty
     *
     * Sets the value a property in a step object
     *
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     * @param {string} property The name of the property
     * @param {mixed} value The new value for the property.
     *
     * @return {bool} TRUE, if property is found and updated, FALSE otherwise.
     *
     * @see GamePlot.cache
     */
    GamePlot.prototype.setStageProperty = function(gameStage, property, value) {
        var stageObj;

        gameStage = new GameStage(gameStage);

        if ('string' !== typeof property) {
            throw new TypeError('GamePlot.setStageProperty: property must be ' +
                                'string');
        }

        // Get stage.
        stageObj = this.getStage(gameStage);

        if (stageObj) {
            stageObj[property] = value;
            return true;
        }

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
     * ### GamePlot.normalizeGameStage
     *
     * Converts the GameStage fields to numbers
     *
     * Checks if stage and step numbers are within the range
     * of what found in the stager.
     *
     * Works only in simple mode.
     *
     * @param {GameStage|string} gameStage The GameStage object
     *
     * @return {GameStage|null} The normalized GameStage object; NULL on error
     */
    GamePlot.prototype.normalizeGameStage = function(gameStage) {
        var stageNo, stageObj, stepNo, seqIdx, seqObj;
        var gs;

        if (this.isFlexibleMode()) {
            throw new Error('GamePlot.normalizeGameStage: invalid call in ' +
                            'flexible sequence.')
        }

        // If already normalized and in cache, return it.
        if ('string' === typeof gameStage) {
            if (this._normalizedCache[gameStage]) {
                return this._normalizedCache[gameStage];
            }
        }

        gs = new GameStage(gameStage);

        // Find stage number.
        if ('number' === typeof gs.stage) {
            if (gs.stage === 0) return new GameStage();
            stageNo = gs.stage;
        }
        else if ('string' === typeof gs.stage) {
            if (gs.stage ===  GamePlot.GAMEOVER ||
                gs.stage === GamePlot.END_SEQ ||
                gs.stage === GamePlot.NO_SEQ) {

                return null;
            }

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
            this.node.silly('GamePlot.normalizeGameStage: non-existent ' +
                            'stage: ' + gs.stage);
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
            this.node.silly('normalizeGameStage non-existent step: ' +
                           stageObj.id + '.' + gs.step);
            return null;
        }

        // Check round property.
        if ('number' !== typeof gs.round) return null;

        gs = new GameStage({
            stage: stageNo,
            step:  stepNo,
            round: gs.round
        });

        if ('string' === typeof gameStage) {
            this._normalizedCache[gameStage] = gs;
        }

        return gs;
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

    /**
     * ### GamePlot.getRound
     *
     * Returns the current/remaining/past/total round number in a game stage
     *
     * @param {mixed} gs The game stage of reference
     * @param {string} mod Optional. Modifies the return value.
     *
     *   - 'current': current round number (default)
     *   - 'total': total number of rounds
     *   - 'remaining': number of rounds remaining (excluding current round)
     *   - 'past': number of rounds already past  (excluding current round)
     *
     * @return {number|null} The requested information, or null if
     *   the number of rounds is not known (e.g. if the stage is a loop)
     *
     * @see GamePlot.getSequenceObject
     */
    GamePlot.prototype.getRound = function(gs, mod) {
        var seqObj;
        gs = new GameStage(gs);
        if (gs.stage === 0) return null;

        seqObj = this.getSequenceObject(gs);
        if (!seqObj) return null;

        if (!mod || mod === 'current') return gs.round;
        if (mod === 'past') return gs.round - 1;

        if (mod === 'total') {
            if (seqObj.type === 'repeat') return seqObj.num;
            else if (seqObj.type === 'plain') return 1;
            else return null;
        }
        if (mod === 'remaining') {
            if (seqObj.type === 'repeat') return seqObj.num - gs.round;
            else if (seqObj.type === 'plain') return 1;
            else return null;
        }

        throw new TypeError('GamePlot.getRound: mod must be a known string ' +
                            'or undefined. Found: ' + mod);
    };

    // ## Helper Methods

    /**
     * ### cacheStepProperty
     *
     * Sets the value of a property in the cache
     *
     * Parameters are not checked
     *
     * @param {GamePlot} that The game plot instance
     * @param {GameStage|string} gameStage The GameStage object,
     *  or its string representation
     * @param {string} property The name of the property
     * @param {mixed} value The value of the property
     *
     * @see GamePlot.cache
     *
     * @api private
     */
    function cacheStepProperty(that, gameStage, property, value) {
        if (!that.cache[gameStage]) that.cache[gameStage] = {};
        that.cache[gameStage][property] = value;
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
