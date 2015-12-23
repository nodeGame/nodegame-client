/**
 * # Stager stages and steps
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var J = node.JSUS;

    // Export Stager.
    var Stager = exports.Stager = {};

    /**
     * ## Block.blockTypes
     *
     * List of available block types
     */
    var blockTypes = {

        // #### BLOCK_DEFAULT
        //
        // The first block automatically added to the stager.
        //
        BLOCK_DEFAULT:           '__default',

        // #### BLOCK_STAGEBLOCK
        //
        // A block that is a collection of stages.
        //
        BLOCK_STAGEBLOCK:        '__stageBlock_',

        // #### BLOCK_STAGE
        //
        //
        //
        BLOCK_STAGE:             '__stage',

        // #### BLOCK_STEPBLOCK
        //
        // A block that is a collection of steps
        //
        BLOCK_STEPBLOCK:         '__stepBlock_',

        // #### BLOCK_STEP
        //
        // ?
        //
        BLOCK_STEP:              '__step',

        // BLOCK_ENCLOSING
        //
        //
        //
        BLOCK_ENCLOSING:         '__enclosing_',

        // #### BLOCK_ENCLOSING_STEPS
        //
        //
        //
        BLOCK_ENCLOSING_STEPS:   '__enclosing_steps',

        // #### BLOCK_ENCLOSING_STAGES
        //
        //
        //
        BLOCK_ENCLOSING_STAGES:  '__enclosing_stages',
    };

    // Add private functions to Stager.
    Stager.blockTypes = blockTypes;
    Stager.checkPositionsParameter = checkPositionsParameter;
    Stager.addStageBlock = addStageBlock;
    Stager.addBlock = addBlock;
    Stager.checkFinalized = checkFinalized;
    Stager.handleStepsArray = handleStepsArray;
    Stager.makeDefaultCb = makeDefaultCb;
    Stager.isDefaultCb = isDefaultCb;
    Stager.isDefaultStep = isDefaultStep;
    Stager.makeDefaultStep = makeDefaultStep;
    Stager.addStepToBlock = addStepToBlock;

    var BLOCK_DEFAULT     = blockTypes.BLOCK_DEFAULT;
    var BLOCK_STAGEBLOCK  = blockTypes.BLOCK_STAGEBLOCK;
    var BLOCK_STAGE       = blockTypes. BLOCK_STAGE;
    var BLOCK_STEPBLOCK   = blockTypes. BLOCK_STEPBLOCK;
    var BLOCK_STEP        = blockTypes.BLOCK_STEP;

    var BLOCK_ENCLOSING          = blockTypes.BLOCK_ENCLOSING;
    var BLOCK_ENCLOSING_STEPS    = blockTypes. BLOCK_ENCLOSING_STEPS;
    var BLOCK_ENCLOSING_STAGES   = blockTypes.BLOCK_ENCLOSING_STAGES;

    /**
     * #### handleStepsArray
     *
     * Validates the items of a steps array, creates new steps if necessary
     *
     * @param {Stager} that Stager object
     * @param {string} stageId The original stage id
     * @param {array} steps The array of steps to validate
     * @param {string} method The name of the method invoking the method
     */
    function handleStepsArray(that, stageId, steps, method) {
        var i, len;
        i = -1, len = steps.length;
        // Missing steps are added with default callback (if string),
        // or as they are if object.
        for ( ; ++i < len ; ) {
            if ('object' === typeof steps[i]) {
                // Throw error if step.id is not unique.
                that.addStep(steps[i]);
                // Substitute with its id.
                steps[i] = steps[i].id;
            }
            else if ('string' === typeof steps[i]) {
                if (!that.steps[steps[i]]) {
                    // Create a step with a default cb (will be substituted).
                    // Note: default callback and default step are two
                    // different things.
                    that.addStep({
                        id: steps[i],
                        cb: that.getDefaultCb()
                    });
                }
            }
            else {
                throw new TypeError('Stager.' + method + ': stage ' +
                                    stageId  + ': items of the steps array ' +
                                    'must be string or object.');
            }
        }
    }


    /**
     * #### addStageBlock
     *
     * Close last step and stage blocks and add a new stage block
     *
     * @param {Stager} that The stager instance
     * @param {string} id Optional. The id of the stage block
     * @param {string} type The type of the stage block
     * @param {string|number} The allowed positions for the block
     *
     * @see addBlock
     */
    function addStageBlock(that, id, type, positions) {
        // Begin stage block (closes two: steps and stage).
        if (that.currentType !== BLOCK_DEFAULT) that.endBlocks(2);
        that.currentType = BLOCK_DEFAULT;
        addBlock(that, id, type, positions, BLOCK_STAGE);
    }

    /**
     * #### addBlock
     *
     * Adds a new block of the specified type to the sequence
     *
     * @param {Stager} that The stager instance
     * @param {string} id Optional. The id of the stage block
     * @param {string} type The block type
     * @param {string|number} positions The allowed positions for the block
     * @param {string} type2 The value that the currentBlock variable
     *    will be set to (BLOCK_STAGE or BLOCK_STEP)
     */
    function addBlock(that, id, type, positions, type2) {
        var block, options;
        options = {};

        options.id = id || J.uniqueKey(that.blocksIds, type);
        options.type = type;
        options.positions = positions;

        that.currentBlockType = type2;

        // Create the new block, and add it block arrays.
        block = new node.Block(options);
        that.unfinishedBlocks.push(block);
        that.blocks.push(block);

        // Save block id into the blocks map.
        that.blocksIds[options.id] = (that.blocks.length - 1);
    }

    /**
     * #### checkFinalized
     *
     * Check whether the stager is already finalized, and throws an error if so
     *
     * @param {object} that Reference to Stager object
     * @param {string} method The name of the method calling the validation
     *
     * @api private
     */
    function checkFinalized(that, method) {
        if (that.finalized) {
            throw new Error('Stager.' + method + ': stager has been ' +
                            'already finalized.');
        }
    }

    /**
     * #### checkPositionsParameter
     *
     * Check validity of a positions parameter
     *
     * Called by: `stage`, `repeat`, `doLoop`, 'loop`.
     *
     * @param {string|number} stage The positions parameter to validate
     * @param {string} method The name of the method calling the validation
     *
     * @api private
     */
    function checkPositionsParameter(positions, method) {
        var err;
        if ('undefined' === typeof positions) return;
        if ('number' === typeof positions) {
            if (isNaN(positions) ||
                positions < 0 ||
                !isFinite(positions)) {
                err = true;
            }
            else {
                positions += '';
            }
        }

        if (err || 'string' !== typeof positions || positions.trim() === '') {
            throw new TypeError('Stager.' + method + ': positions must ' +
                                'be a non-empty string, a positive finite ' +
                                'number, or undefined. Found: ' +
                                positions + '.');
        }
        return positions;
    }

    /**
     * #### addStepToBlock
     *
     * Adds a step to a block
     *
     * Checks if a step with the same id was already added.
     *
     * @param {object} that Reference to Stager object
     * @param {object} stage The block object
     * @param {string} stepId The id of the step
     * @param {string} stageId The id of the stage the step belongs to
     * @param {string|number} positions Optional. Positions allowed for
     *    step in the block
     *
     * @return {boolean} TRUE if the step is added to the block
     */
    function addStepToBlock(that, block, stepId, stageId, positions) {
        var stepInBlock;
        // Add step, if not already added.
        if (block.hasItem(stepId)) return false;

        stepInBlock = {
            type: stageId,
            item: stepId,
            id: stepId
        };

        if (isDefaultStep(that.steps[stepId])) {
            makeDefaultStep(stepInBlock);
        }
        block.add(stepInBlock, positions);
        return true;
    }

    /**
     * #### makeDefaultCb
     *
     * Flags or create a callback function marked as `default`
     *
     * @param {function} cb Optional. The function to mark. If undefined,
     *   an empty function is used
     *
     * @return {function} A function flagged as `default`
     *
     * @see isDefaultCb
     */
    function makeDefaultCb(cb) {
        if ('undefined' === typeof cb) cb = function() {};
        cb._defaultCb = true;
        return cb;
    }

    /**
     * #### isDefaultCb
     *
     * Returns TRUE if a callback was previously marked as `default`
     *
     * @param {function} cb The function to check
     *
     * @return {boolean} TRUE if function is default callback
     *
     * @see makeDefaultCb
     */
    function isDefaultCb(cb) {
        return cb._defaultCb;
    }

    /**
     * #### makeDefaultStep
     *
     * Flags or create a step object marked as `default`
     *
     * @param {object|string} step The step object to mark. If a string
     *   is passed, a new step object with default cb is created.
     *
     * @return {function} A function flagged as `default`
     *
     * @see makeDefaultCb
     * @see isDefaultStep
     */
    function makeDefaultStep(step, cb) {
        if ('string' === typeof step) {
            step = {
                id: step,
                cb: makeDefaultCb(cb)
            };
        }
        step._defaultStep = true;
        return step;
    }

    /**
     * #### isDefaultStep
     *
     * Returns TRUE if a step object was previously marked as `default`
     *
     * @param {object} step The step object to check
     *
     * @return {boolean} TRUE if step object is default step
     *
     * @see makeDefaultStep
     */
    function isDefaultStep(step) {
        return step._defaultStep;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
