/**
 * # Stager extend stages, modify sequence
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var J = node.JSUS;
    var Stager = node.Stager;

    var checkFinalized   = Stager.checkFinalized;
    var handleStepsArray = Stager.handleStepsArray;
    var addStepToBlock   = Stager.addStepToBlock;

    /**
     * #### Stager.extendStep
     *
     * Extends an existing step
     *
     * Notice: properties `id` cannot be modified, and property `cb`
     * must always be a function.
     *
     * @param {string} stepId The id of the step to update
     * @param {object|function} update The object containing the
     *   properties to update, or an update function that takes a copy
     *   of current step and returns the whole new updated step
     *
     * @see Stager.addStep
     * @see validateExtendedStep
     */
    Stager.prototype.extendStep = function(stepId, update) {
        var step;
        if ('string' !== typeof stepId) {
            throw new TypeError('Stager.extendStep: stepId must be a' +
                                ' string.');
        }
        step = this.steps[stepId];
        if (!step) {
            throw new Error('Stager.extendStep: stepId not found: ' +
                            stepId + '.');
        }
        if ('function' === typeof update) {
            step = update(J.clone(step));
            validateExtendedStep(stepId, step, true);
            this.steps[stepId] = step;

        }
        else if (update && 'object' === typeof update) {
            validateExtendedStep(stepId, update, false);
            J.mixin(step, update);
        }
        else {
            throw new TypeError('Stager.extendStep: update must be object ' +
                                'or function. Step id: ' + stepId + '.');
        }
    };

    /**
     * #### Stager.extendStage
     *
     * Extends an existing stage
     *
     * Notice: properties `id` and `cb` cannot be modified / added.
     *
     * @param {string} stageId The id of the stage to update
     * @param {object|function} update The object containing the
     *   properties to update, or an update function that takes a copy
     *   of current stage and returns the whole new updated stage
     *
     * @see Stager.addStage
     * @see validateExtendedStage
     */
    Stager.prototype.extendStage = function(stageId, update) {
        var stage;

        if ('string' !== typeof stageId) {
            throw new TypeError('Stager.extendStage: stageId must be ' +
                                'a string.');
        }
        stage = this.stages[stageId];
        if (!stage) {
            throw new Error('Stager.extendStage: stageId not found: ' +
                            stageId + '.');
        }

        if ('function' === typeof update) {
            stage = update(J.clone(stage));
            if (!stage || 'object' !== typeof stage ||
                !stage.id || !stage.steps) {

                throw new TypeError('Stager.extendStage: update function ' +
                                    'must return an object with id and steps.');
            }
            validateExtendedStage(this, stageId, stage, true);
            this.stages[stageId] = stage;

        }
        else if (update && 'object' === typeof update) {
            validateExtendedStage(this, stageId, update, false);
            J.mixin(stage, update);
        }
        else {
            throw new TypeError('Stager.extendStage: update must be object ' +
                                'or function. Stage id: ' + stageId + '.');
        }
    };

    /**
     * #### Stager.extendAllSteps
     *
     * Extends all existing steps
     *
     * @param {object|function} update The object containing the
     *   properties to update, or an update function that takes a copy
     *   of current step and returns the whole new updated step
     *
     * @see Stager.addStep
     * @see Stager.extendStep
     */
    Stager.prototype.extendAllSteps = function(update) {
        var step;
        for (step in this.steps) {
            if (this.steps.hasOwnProperty(step)) {
                this.extendStep(step, update);
            }
        }
    };

    /* #### Stager.extendAllStages
     *
     * Extends all existing stages
     *
     * @param {object|function} update The object containing the
     *   properties to update, or an update function that takes a copy
     *   of current stage and returns the whole new updated stage
     *
     * @see Stager.addStage
     * @see Stager.extendStage
     */
    Stager.prototype.extendAllStages = function(update) {
        var stage;
        for (stage in this.stages) {
            if (this.stages.hasOwnProperty(stage)) {
                this.extendStage(stage, update);
            }
        }
    };

    /**
     * #### Stager.skip
     *
     * Marks a stage or as step as `toSkip` and won't be added to sequence
     *
     * Must be called before invoking `Stager.finalize()`.
     *
     * @param {string} stageId The id of the stage to skip
     * @param {string} stepId Optional. The id of the step within
     *   the stage to skip
     *
     * @see Stager.unskip
     * @see Stager.finalize
     */
    Stager.prototype.skip = function(stageId, stepId) {
        checkFinalized(this, 'skip');
        setSkipStageStep(this, stageId, stepId, true, 'skip');
    };

    /**
     * #### Stager.unskip
     *
     * Unskips a stage or step
     *
     * Must be called before invoking `Stager.finalize()`.
     *
     * @param {string} stageId The id of the stage
     * @param {string} stepId Optional. The id of the step within the stage
     *
     * @see Stager.skip
     * @see Stager.finalize
     */
    Stager.prototype.unskip = function(stageId, stepId) {
        checkFinalized(this, 'unskip');
        setSkipStageStep(this, stageId, stepId, null, 'unskip');
    };

    /**
     * #### Stager.isSkipped
     *
     * Returns TRUE if a stage or step is currently marked as `toSkip`
     *
     * @param {string} stageId The id of the stage
     * @param {string} stepId Optional. The id of the step within the stage
     *
     * @return {boolean} TRUE, if the stage or step is marked as `toSkip`
     *
     * @see Stager.skip
     * @see Stager.unskip
     */
    Stager.prototype.isSkipped = function(stageId, stepId) {
        return !!setSkipStageStep(this, stageId, stepId, undefined,
                                  'isSkipped');
    };

    /**
     * #### setSkipStageStep
     *
     * Sets/Gets the value for the flag `toSkip` for a stage or a step
     *
     * @param {Stager} that Stager object
     * @param {string} stageId The id of the stage
     * @param {string} stepId Optional. The id of the step within the stage
     * @param {mixed} value If defined, is assigned to the stage or step
     * @param {string} method The name of the method calling the validation
     *
     * @return {boolean|null} The current value for the stage or step
     *
     * @api private
     */
    function setSkipStageStep(that, stageId, stepId, value, method) {
        if ('string' !== typeof stageId || stageId.trim() === '') {
            throw new TypeError('Stager.' + method + ': stageId must ' +
                                'be a non-empty string.');
        }
        if (stepId) {
            if ('string' !== typeof stepId || stepId.trim() === '') {
                throw new TypeError('Stager.' + method + ': stepId must ' +
                                    'be a non-empty string or undefined.');
            }
            if ('undefined' !== typeof value) {
                that.toSkip.steps[stageId + '.' + stepId] = value;
            }
            return that.toSkip.steps[stageId + '.' + stepId];
        }
        if ('undefined' !== typeof value) that.toSkip.stages[stageId] = value;
        return that.toSkip.stages[stageId];
    }


    /**
     * #### validateExtendedStep
     *
     * Validates the modification to a step (already known as object)
     *
     * Each step inside the steps array is validated via `handleStepsArray`.
     *
     * @param {string} stepId The original step id
     * @param {object} update The update/updated object
     * @param {boolean} updateFunction TRUE if the update object is the
     *    value returned by an update function
     *
     * @see handleStepsArray
     */
    function validateExtendedStep(stepId, update, updateFunction) {
        var errBegin;
        if (updateFunction) {
            errBegin = 'Stager.extendStep: update function must return ' +
                'an object with ';

            if (!update || 'object' !== typeof update) {
                throw new TypeError(errBegin + 'id and cb. Found: ' + update +
                                    '. Step id: ' +  stepId + '.');
            }
            if (update.id !== stepId) {
                throw new Error('Stager.extendStep: update function ' +
                                'cannot alter the step id: ' + stepId + '.');
            }
            if ('function' !== typeof update.cb) {
                throw new TypeError(errBegin + 'a valid callback. Step id:' +
                                    stepId + '.');
            }
            if (update.init && 'function' !== typeof update.init) {
                throw new TypeError(errBegin + 'invalid init property. ' +
                                    'Function or undefined expected, found: ' +
                                    typeof update.init + '. Step id:' +
                                    stepId + '.');
            }
            if (update.exit && 'function' !== typeof update.exit) {
                throw new TypeError(errBegin + 'invalid exit property. ' +
                                    'Function or undefined expected, found: ' +
                                    typeof update.exit + '. Step id:' +
                                    stepId + '.');
            }
            if (update.done && 'function' !== typeof update.done) {
                throw new TypeError(errBegin + 'invalid done property. ' +
                                    'Function or undefined expected, found: ' +
                                    typeof update.done + '. Step id:' +
                                    stepId + '.');
            }
        }
        else {
            if (update.hasOwnProperty('id')) {
                throw new Error('Stager.extendStep: update.id cannot be set. ' +
                                'Step id: ' + stepId + '.');
            }
            if (update.cb && 'function' !== typeof update.cb) {
                throw new TypeError('Stager.extendStep: update.cb must be ' +
                                    'function or undefined. Step id:' +
                                    stepId + '.');
            }
            if (update.init && 'function' !== typeof update.init) {
                throw new TypeError('Stager.extendStep: update.init must be ' +
                                    'function or undefined. Step id:' +
                                    stepId + '.');
            }
            if (update.exit && 'function' !== typeof update.exit) {
                throw new TypeError('Stager.extendStep: update.exit must be ' +
                                    'function or undefined. Step id:' +
                                    stepId + '.');
            }
            if (update.done && 'function' !== typeof update.done) {
                throw new TypeError('Stager.extendStep: update.done must be ' +
                                    'function or undefined. Step id:' +
                                    stepId + '.');
            }

        }
    }

    /**
     * #### validateExtendedStage
     *
     * Validates the modification to a stage (already known as object)
     *
     * Each step inside the steps array is validated via `handleStepsArray`.
     *
     * @param {Stager} that Stager object
     * @param {string} stageId The original stage id
     * @param {object} update The update/updated object
     * @param {boolean} updateFunction TRUE if the update object is the
     *    value returned by an update function
     *
     * @see handleStepsArray
     */
    function validateExtendedStage(that, stageId, update, updateFunction) {
        var block, i, len;
        if ((updateFunction && update.id !== stageId) ||
            (!updateFunction && update.hasOwnProperty('id'))) {

            throw new Error('Stager.extendStage: id cannot be altered: ' +
                            stageId + '.');
        }
        if (update.cb) {
            throw new TypeError('Stager.extendStage: update.cb cannot be ' +
                                'specified. Stage id: ' + stageId + '.');
        }
        if (update.init && 'function' !== typeof update.init) {
            throw new TypeError('Stager.extendStage: update.init must be ' +
                                'function or undefined. Stage id:' +
                                stageId + '.');
        }
        if (update.exit && 'function' !== typeof update.exit) {
            throw new TypeError('Stager.extendStage: update.exit must be ' +
                                'function or undefined. Stage id:' +
                                stageId + '.');
        }
        if (update.done && 'function' !== typeof update.done) {
            throw new TypeError('Stager.extendStage: update.done must be ' +
                                'function or undefined. Stage id:' +
                                stageId + '.');
        }
        if (update.steps) {
            if ((!J.isArray(update.steps) || !update.steps.length) ||
                update.steps === undefined || update.steps === null) {

                throw new Error('Stager.extendStage: found update.steps, but ' +
                                'it is not a non-empty array. Stage id: ' +
                               stageId + '.');
            }

            // No changes to the steps array, just exit.
            if (J.equals(that.stages[stageId].steps, update.steps)) return;

            // Process every step in the array. Steps array is modified.
            handleStepsArray(that, stageId, update.steps, 'extendStage');

            // We need to get the enclosing steps block,
            // following the stage block.
            block = that.findBlockWithItem(stageId);

            // Stage is not in any block, just exit.
            if (!block) return;

            // We need to update the block in which the stage was.

            if ('undefined' !== typeof block.unfinishedItems[1]) {
                block = block.unfinishedItems[1].item;
            }
            // The stage block was not ended yet,
            // so the the step block is the last of the sequence.
            else {
                block = that.blocks[that.blocks.length -1];
            }

            // Remove all previous steps before adding the updated steps.
            block.removeAllItems();

            // Add steps to block (if necessary).
            i = -1, len = update.steps.length;
            for ( ; ++i < len ; ) {
                addStepToBlock(that, block, update.steps[i], stageId);
            }
        }
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
