/**
 * # Stager stages and steps
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var J = node.JSUS;
    var Stager = node.Stager;
    var Block      = node.Block;
    var blockTypes = Block.blockTypes;

    // Add private functions to Stager.
    Stager.checkPositionsParameter = checkPositionsParameter;
    Stager.addStageBlock = addStageBlock;
    Stager.addBlock = addBlock;
    Stager.checkFinalized = checkFinalized;
    Stager.handleStepsArray = handleStepsArray;


    var BLOCK_DEFAULT     = blockTypes.BLOCK_DEFAULT;
    var BLOCK_STAGEBLOCK  = blockTypes.BLOCK_STAGEBLOCK;
    var BLOCK_STAGE       = blockTypes. BLOCK_STAGE;
    var BLOCK_STEPBLOCK   = blockTypes. BLOCK_STEPBLOCK;
    var BLOCK_STEP        = blockTypes.BLOCK_STEP;

    var BLOCK_ENCLOSING          = blockTypes.BLOCK_ENCLOSING;
    var BLOCK_ENCLOSING_STEPS    = blockTypes. BLOCK_ENCLOSING_STEPS;
    var BLOCK_ENCLOSING_STAGES   = blockTypes.BLOCK_ENCLOSING_STAGES;

    /**
     * #### Stager.addStep
     *
     * Adds a new step
     *
     * Registers a new game step object. Must have the following fields:
     *
     * - id (string): The step's name
     * - cb (function): The step's callback function
     *
     * @param {object} step A valid step object. Shallowly copied.
     */
    Stager.prototype.addStep = function(step) {
        checkStepValidity(step, 'addStep');

        if (this.steps.hasOwnProperty(step.id)) {
            throw new Error('Stager.addStep: step id already ' +
                            'existing: ' + step.id +
                            '. Use extendStep to modify it.');
        }
        this.steps[step.id] = step;
    };

    /**
     * #### Stager.addStage
     *
     * Adds a new stage
     *
     * Registers a new game stage object. Must have an id field:
     *
     * - id (string): The stage's name
     *
     * and either of the two following fields:
     *
     * - steps (array of strings|objects): The names of the steps belonging
     *     to this stage, or the steps objects to define them. In the latter
     *     case steps with the same id must not have been defined before.
     *
     * - cb (function): The callback function. If this field is used,
     *     then a step with the same name as the stage will be created,
     *     containing all the properties. The stage will be an empty
     *     container referencing
     *
     * @param {object} stage A valid stage or step object. Shallowly
     *    copied.
     *
     * @see checkStageValidity
     */
    Stager.prototype.addStage = function(stage) {
        var id;

        checkStageValidity(stage, 'addStage');

        id = stage.id;

        if (this.stages.hasOwnProperty(id)) {
            throw new Error('Stager.addStage: stage id already existing: ' +
                            id + '. Use extendStage to modify it.');
        }

        // The stage contains only 1 step inside given through the callback
        // function. A step will be created with same id and callback.
        if (stage.cb) {
            this.addStep({
                id: id,
                cb: stage.cb
            });
            delete stage.cb;
            stage.steps = [ id ];
        }
        else {
            // Process every step in the array. Steps array is modified.
            handleStepsArray(this, id, stage.steps, 'addStage');
        }
        this.stages[id] = stage;
    };

    /**
     * #### Stager.cloneStep
     *
     * Clones a stage and assigns a new id to it
     *
     * @param {string} stepId The name of the stage to clone
     * @param {string} newStepId The new unique id to assign to the clone
     *
     * @return {object} step Reference to the cloned step
     *
     * @see Stager.addStep
     */
    Stager.prototype.cloneStep = function(stepId, newStepId) {
        var step;
        if ('string' !== typeof stepId) {
            throw new TypeError('Stager.cloneStep: stepId must be string.');
        }
        if ('string' !== typeof newStepId) {
            throw new TypeError('Stager.cloneStep: newStepId must be string.');
        }
        if (this.steps[newStepId]) {
            throw new Error('Stager.cloneStep: newStepId already taken: ' +
                            newStepId + '.');
        }
        step = this.steps[stepId];
        if (!step) {
            throw new Error('Stager.cloneStep: step not found: ' +
                            stepId + '.');
        }
        step = J.clone(step);
        step.id = newStepId;
        this.addStep(step);
        return step;
    };

    /**
     * #### Stager.cloneStage
     *
     * Clones a stage and assigns a new id to it
     *
     * @param {string} stageId The id of the stage to clone
     * @param {string} newStageId The new unique id to assign to the clone
     *
     * @return {object} stage Reference to the cloned stage
     *
     * @see Stager.addStage
     */
    Stager.prototype.cloneStage = function(stageId, newStageId) {
        var stage;
        if ('string' !== typeof stageId) {
            throw new TypeError('Stager.cloneStage: stageId must be string.');
        }
        if ('string' !== typeof newStageId) {
            throw new TypeError('Stager.cloneStage: newStageId must ' +
                                'be string.');
        }
        if (this.stages[newStageId]) {
            throw new Error('Stager.cloneStage: newStageId already taken: ' +
                            newStageId + '.');
        }
        stage = this.stages[stageId];
        if (!stage) {
            throw new Error('Stager.cloneStage: stage not found: ' +
                            stageId + '.');
        }
        stage = J.clone(stage);
        stage.id = newStageId;
        this.addStage(stage);
        return stage;
    };

    /**
     * #### Stager.step
     *
     * Adds a step to the current Block.
     *
     * @param {string|object} stage A valid step object or the stepId string.
     * @param {string} positions Optional. Positions within the
     *    enclosing Block that this step can occupy.
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStep
     */
    Stager.prototype.step = function(step, positions) {
        var id;

        checkFinalized(this, 'step');
        id = checkStepParameter(this, step, 'step');
        positions = checkPositionsParameter(positions, 'step');

        this.getCurrentBlock().add({
            type: this.currentType,
            item: id
        }, positions);

        this.stages[this.currentType].steps.push(id);

        return this;
    };

    /**
     * #### Stager.next | stage
     *
     * Adds a stage block to sequence
     *
     * The `id` parameter must have the form 'stageID' or 'stageID AS alias'.
     * stageID must be a valid stage and it (or alias if given) must be
     * unique in the sequence.
     *
     * @param {string|object} id A stage name with optional alias
     *   or a stage object.
     * @param {string} positions Optional. Allowed positions for the stage
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStage
     */
    Stager.prototype.stage = Stager.prototype.next =
        function(stage, positions) {
            var stageName;

            checkFinalized(this, 'next');
            stageName = handleStageParameter(this, stage, 'next');
            positions = checkPositionsParameter(positions, 'next');

            addStageToCurrentBlock(this, {
                type: 'plain',
                id: stageName
            }, positions);

            // Must be done after addStageToCurrentBlock is called.
            addStepsToCurrentBlock(this, this.stages[stageName]);
            return this;
        };

    /**
     * #### Stager.repeat | repeatStage
     *
     * Adds repeated stage block to sequence
     *
     * @param {string|object} stage A stage name with optional alias
     *   or a stage object.
     * @param {string} positions Optional. Allowed positions for the stage
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStage
     * @see Stager.next
     */
    Stager.prototype.repeatStage = Stager.prototype.repeat =
        function(stage, nRepeats, positions) {
            var stageName;

            checkFinalized(this, 'repeat');

            stageName = handleStageParameter(this, stage, 'next');

            if ('number' !== typeof nRepeats ||
                isNaN(nRepeats) ||
                nRepeats <= 0) {

                throw new Error('Stager.repeat: nRepeats must be a positive ' +
                                'number. Found: ' + nRepeats + '.');
            }

            positions = checkPositionsParameter(positions, 'repeat');

            addStageToCurrentBlock(this, {
                type: 'repeat',
                id: stageName,
                num: parseInt(nRepeats, 10)
            }, positions);

            // Must be done after addStageToCurrentBlock is called.
            addStepsToCurrentBlock(this, this.stages[stageName]);
            return this;
        };

    /**
     * #### Stager.loop | loopStage
     *
     * Adds looped stage block to sequence
     *
     * The given stage will be repeated as long as the `func` callback
     * returns TRUE. If it returns FALSE on the first time, the stage is
     * never executed.
     *
     * @param {string|object} stage A stage name with optional alias
     *   or a stage object.
     * @param {function} loopFunc Callback returning TRUE for
     *   repetition.
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStage
     * @see Stager.next
     * @see Stager.doLoop
     */
    Stager.prototype.loopStage = Stager.prototype.loop =
        function(stage, loopFunc, positions) {

            return addLoop(this, 'loop', stage, loopFunc, positions);
        };

    /**
     * #### Stager.doLoop | doLoopStage
     *
     * Adds alternatively looped stage block to sequence
     *
     * The given stage will be repeated once plus as many times as the
     * `func` callback returns TRUE.
     *
     * @param {string|object} stage A stage name with optional alias
     *   or a stage object.
     * @param {function} loopFunc Optional. Callback returning TRUE for
     *   repetition.
     *
     * @return {Stager} Reference to this instance for method chaining
     *
     * @see Stager.addStage
     * @see Stager.next
     * @see Stager.loop
     */
    Stager.prototype.doLoopStage = Stager.prototype.doLoop =
        function(stage, loopFunc, positions) {

            return addLoop(this, 'doLoop', stage, loopFunc, positions);
        };

    /**
     * #### Stager.gameover
     *
     * Adds gameover block to sequence
     *
     * @return {Stager} this object
     */
    Stager.prototype.gameover = function() {
        addStageToCurrentBlock(this, { type: 'gameover' });
        return this;
    };

    // ## Private Methods

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
                    that.addStep({
                        id: steps[i],
                        cb: that.getDefaultCallback()
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
     * #### addLoop
     *
     * Handles adding a looped stage (doLoop or loop)
     *
     * @param {object} that Reference to Stager object
     * @param {string} type The type of loop (doLoop or loop)
     * @param {string|object} stage The stage to loop
     * @param {function} loopFunc The function checking the
     * @param {string} positions Optional. Positions within the
     *      enclosing Block that this block can occupy.
     *
     * @return {Stager|null} this object on success, NULL on error
     *
     * @see Stager.loop
     * @see Stager.doLoop
     *
     * @api private
     */
    function addLoop(that, type, stage, loopFunc, positions) {
        var stageName;

        checkFinalized(that, type);

        stageName = handleStageParameter(that, stage, type);

        if ('function' !== typeof loopFunc) {
            throw new TypeError('Stager.' + type + ': loopFunc must be ' +
                                'function. Found: ' + loopFunc + '.');
        }

        positions = checkPositionsParameter(positions, type);

        addStageToCurrentBlock(that, {
            type: type,
            id: stageName,
            cb: loopFunc
        }, positions);

        // Must be done after addStageToCurrentBlock is called.
        addStepsToCurrentBlock(that, that.stages[stageName]);
        return that;
    }

    /**
     * #### addStageToCurrentBlock
     *
     * Performs several meta operations necessary to add a stage block
     *
     * Operations:
     *
     *  - Ends any unclosed blocks.
     *  - Begin a new enclosing block.
     *  - Adds a stage block.
     *  - Adds a steps block.
     *
     * @param {Stager} that Stager object
     * @param {object} stage The stage to add containing its type
     * @param {string} positions Optional. The allowed positions for the stage
     *
     * @api private
     */
    function addStageToCurrentBlock(that, stage, positions) {
        var name, curBlock, rndName;
        name = stage.id || stage.type;

        rndName = '_' + J.randomInt(10000);

        addStageBlock(that,
                      BLOCK_ENCLOSING + name + rndName,
                      BLOCK_ENCLOSING_STAGES,
                      positions,
                      BLOCK_STAGE);

        curBlock = that.getCurrentBlock();
        curBlock.add({
            type: BLOCK_STAGE,
            item: stage
        });

        that.currentType = name;

        addBlock(that,
                 BLOCK_ENCLOSING + name + '_steps' + rndName,
                 BLOCK_ENCLOSING_STEPS,
                 'linear',
                 BLOCK_STEP);
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
     * #### addStageBlock
     *
     * Adds a new block of the specified type to the sequence
     *
     * @param {Stager} that The stager instance
     * @param {string} id Optional. The id of the stage block
     * @param {string} type The type of the stage block
     * @param {string|number} The allowed positions for the block
     * @param {string} cbType The type of the currentBlock
     *    (BLOCK_STAGE or BLOCK_STEP)
     */
    function addBlock(that, id, type, positions, type2) {
        var block, options;
        options = {};

        options.id = id || J.uniqueKey(that.blocksIds, type);
        options.type = type;

        that.currentBlockType = type2;

        // Create the new block, and add it block arrays.
        block = new Block(positions, options);
        that.unfinishedBlocks.push(block);
        that.blocks.push(block);

        // Save block id into the blocks map.
        that.blocksIds[options.id] = (that.blocks.length - 1);
    }

    /**
     * #### addStepsToCurrentBlock
     *
     * Adds steps to current block
     *
     * For each step inside stage.step, it checks whether the step was
     * already added to current block, and if not, it adds it.
     *
     * @param {object} that Reference to Stager object
     * @param {object} stage The stage object
     */
    function addStepsToCurrentBlock(that, stage) {
        var curBlock;
        var i, len, stepInBlock;
        curBlock = that.getCurrentBlock();

        i = -1, len = stage.steps.length;
        for ( ; ++i < len ; ) {
            // Add step, if not already added.
            // TODO: This If might be always true.
            if (!curBlock.hasItem(stage.steps[i])) {
                stepInBlock = {
                    type: that.currentType,
                    item: stage.steps[i]
                };
                if (that.steps[stage.steps[i]]._defaultStep) {
                    stepInBlock._defaultStep = true;
                }
                curBlock.add(stepInBlock);
            }
        }
    }

    /**
     * #### extractAlias
     *
     * Returns an object where alias and id are separated
     *
     * @param {string} nameAndAlias The stage-name string
     *
     * @return {object} Object with properties id and alias (if found)
     *
     * @api private
     *
     * @see handleAlias
     */
    function extractAlias(nameAndAlias) {
        var tokens;
        tokens = nameAndAlias.split(' AS ');
        return {
            id: tokens[0].trim(),
            alias: tokens[1] ? tokens[1].trim() : undefined
        };
    }

    /**
     * #### handleAlias
     *
     * Handles stage id and alias strings
     *
     * Takes a string like 'stageID' or 'stageID AS alias' and return 'alias'.
     * Checks that alias and stage id are different.
     *
     * @param {object} that Reference to Stager object
     * @param {string} nameAndAlias The stage-name string
     * @param {string} method The name of the method calling the validation
     *
     * @return {object} Object with properties id and alias (if found)
     *
     * @see Stager.next
     * @see handleAlias
     *
     * @api private
     */
    function handleAlias(that, nameAndAlias, method) {
        var tokens, id, alias;
        tokens = extractAlias(nameAndAlias);
        id = tokens.id;
        alias = tokens.alias;
        if (id === alias) {
            throw new Error('Stager.' + method + ': id equal to alias: ' +
                            nameAndAlias + '.');
        }
        if (alias && !that.stages[id]) {
            throw new Error('Stager.' + method + ': alias is referencing ' +
                            'non-existing stage: ' + id + '.');
        }
        if (alias && that.stages[alias]) {
            throw new Error('Stager.' + method + ': alias is not unique: ' +
                            alias + '.');
        }
        return tokens;
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
     * #### checkStepValidity
     *
     * Returns whether given step is valid
     *
     * Checks for syntactic validity of the step object. Does not validate
     * whether the name is unique, etc.
     *
     * @param {object} step The step object
     * @param {string} method The name of the method calling the validation
     *
     * @see Stager.addStep
     *
     * @api private
     */
    function checkStepValidity(step, method) {
        if ('object' !== typeof step) {
            throw new TypeError('Stager.' + method + ': step must be object.');
        }
        if ('function' !== typeof step.cb) {
            throw new TypeError('Stager.' + method + ': step.cb must be ' +
                                'function.');
        }
        if ('string' !== typeof step.id) {
            throw new TypeError('Stager.' + method + ': step.id must ' +
                                'be string.');
        }
        if (step.id.trim() === '') {
            throw new TypeError('Stager.' + method + ': step.id cannot ' +
                                'be an empty string.');
        }
    }

     /**
      * checkStageValidity
      *
      * Returns whether given stage is valid
      *
      * Checks for syntactic validity of the stage object. Does not validate
      * whether the stage name is unique, the steps exists, etc.
      *
      * @param {object} stage The stage to validate
      * @param {string} method The name of the method calling the validation
      *
      * @see Stager.addStage
      *
      * @api private
      */
    function checkStageValidity(stage, method) {
        if ('object' !== typeof stage) {
            throw new TypeError('Stager.' + method + ': stage must be object.');
        }
        if ((!stage.steps && !stage.cb) || (stage.steps && stage.cb)) {
            throw new TypeError('Stager.' + method + ': stage must have ' +
                                'either a steps or a cb property.');
        }
        if (J.isArray(stage.steps)) {
            if (!stage.steps.length) {
                throw new Error('Stager.' + method + ': stage.steps cannot ' +
                                'be empty.');
            }
        }
        else if (stage.steps) {
            throw new TypeError('Stager.' + method + ': stage.steps must be ' +
                                'array or undefined.');
        }
        if ('string' !== typeof stage.id) {
            throw new TypeError('Stager.' + method + ': stage.id must ' +
                                'be string.');
        }
        if (stage.id.trim() === '') {
            throw new TypeError('Stager.' + method + ': stage.id cannot ' +
                                'be an empty string.');
        }
     }

    /**
     * #### checkStepParameter
     *
     * Check validity of a stage parameter, eventually adds it if missing
     *
     * @param {Stager} that Stager object
     * @param {string|object} step The step to validate
     * @param {string} method The name of the method calling the validation
     *
     * @return {string} The id of the step
     *
     * @api private
     */
    function checkStepParameter(that, step, method) {
        if ('string' === typeof step) {
            step = {
                id: step,
                cb: that.getDefaultCallback()
            };
        }
        else if ('object' !== typeof step) {
            throw new TypeError('Stager.' + method + ': step must be ' +
                                'string or object.');
        }

        // A new step is created if not found (performs validation).
        if (!that.steps[step.id]) that.addStep(step);

        return step.id;
    }

    /**
     * #### handleStageParameter
     *
     * Check validity of a stage parameter, eventually adds it if missing
     *
     * Called by: `stage`, `repeat`, `doLoop`, 'loop`.
     *
     * @param {Stager} that Stager object
     * @param {string|object} stage The stage to validate
     * @param {string} method The name of the method calling the validation
     *
     * @return {string} The id or alias of the stage
     *
     * @api private
     */
    function handleStageParameter(that, stage, method) {
        var tokens, id, alias;
        if ('object' === typeof stage) {
            id = stage.id;
            // It's a step.
            if (stage.cb) {
                if (!that.steps[id]) that.addStep(stage);
                stage = { id: id, steps: [ id ] };
            }
            // A new stage is created if not found (performs validation).
            if (!that.stages[id]) that.addStage(stage);
        }
        else {
            if ('string' !== typeof stage) {
                throw new TypeError('Stager.' + method + ': stage must be ' +
                                    'string or object.');
            }

            // See whether the stage id contains an alias. Throws errors.
            tokens = handleAlias(that, stage, method);
            alias = tokens.alias;
            id = tokens.id;
            // Alias must reference an existing stage (checked before).
            if (alias) {
                that.stages[alias] = that.stages[id];
            }
            else if (!that.stages[id]) {
                // Add the step if not existing and flag it as default.
                if (!that.steps[id]) {
                    that.addStep({
                        id: id,
                        cb: that.getDefaultCallback(),
                        _defaultStep: true
                    });
                }
                that.addStage({
                    id: id,
                    steps: [ id ]
                });
            }
        }

        return alias || id;
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

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);