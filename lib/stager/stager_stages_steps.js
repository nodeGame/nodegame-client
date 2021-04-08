/**
 * # Stager stages and steps
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var J      = node.JSUS;
    var Stager = node.Stager;

    // Get reference to shared entities in Stager.
    var checkPositionsParameter = Stager.checkPositionsParameter;
    var addStageBlock           = Stager.addStageBlock;
    var addBlock                = Stager.addBlock;
    var checkFinalized          = Stager.checkFinalized;
    var handleStepsArray        = Stager.handleStepsArray;
    var makeDefaultStep         = Stager.makeDefaultStep;
    var addStepToBlock          = Stager.addStepToBlock;

    var blockTypes              = Stager.blockTypes;
    var BLOCK_STAGE             = blockTypes.BLOCK_STAGE;
    var BLOCK_STEPBLOCK         = blockTypes.BLOCK_STEPBLOCK;
    var BLOCK_STEP              = blockTypes.BLOCK_STEP;

    var BLOCK_ENCLOSING         = blockTypes.BLOCK_ENCLOSING;
    var BLOCK_ENCLOSING_STEPS   = blockTypes.BLOCK_ENCLOSING_STEPS;
    var BLOCK_ENCLOSING_STAGES  = blockTypes.BLOCK_ENCLOSING_STAGES;

    /**
     * #### Stager.addStep | createStep
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
    Stager.prototype.createStep = Stager.prototype.addStep = function(step) {
        checkStepValidity(step, 'addStep');

        if (this.steps.hasOwnProperty(step.id)) {
            throw new Error('Stager.addStep: step "' + step.id + '" already ' +
                            'existing, use extendStep to modify it');
        }
        this.steps[step.id] = step;
    };

    /**
     * #### Stager.addStage | createStage
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
    Stager.prototype.createStage = Stager.prototype.addStage = function(stage) {
        var id;

        checkStageValidity(stage, 'addStage');

        id = stage.id;

        if (this.stages.hasOwnProperty(id)) {
            throw new Error('Stager.addStage: stage "' + id + '" already ' +
                            'existing, use extendStage to modify it');
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
            throw new TypeError('Stager.cloneStep: stepId must be string. ' +
                               'Found: ' + stepId);
        }
        if ('string' !== typeof newStepId) {
            throw new TypeError('Stager.cloneStep: newStepId must be ' +
                                'string. Found: ' + newStepId);
        }
        if (this.steps[newStepId]) {
            throw new Error('Stager.cloneStep: newStepId already taken: ' +
                            newStepId);
        }
        step = this.steps[stepId];
        if (!step) {
            throw new Error('Stager.cloneStep: step not found: ' + stepId);
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
            throw new TypeError('Stager.cloneStage: stageId must be string.' +
                               'Found: ' + stageId);
        }
        if ('string' !== typeof newStageId) {
            throw new TypeError('Stager.cloneStage: newStageId must ' +
                                'be string. Found: ' + newStageId);
        }
        if (this.stages[newStageId]) {
            throw new Error('Stager.cloneStage: newStageId already taken: ' +
                            newStageId + '.');
        }
        stage = this.stages[stageId];
        if (!stage) {
            throw new Error('Stager.cloneStage: stage not found: ' + stageId);
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
        var id, curBlock;

        curBlock = this.getCurrentBlock();
        if (!curBlock.isType(BLOCK_ENCLOSING_STEPS) &&
            !curBlock.isType(BLOCK_STEPBLOCK)) {

            throw new Error('Stager.step: step "' +  step + '" cannot be ' +
                            'added here. Have you add at least one stage?');
        }

        checkFinalized(this, 'step');
        id = handleStepParameter(this, step, 'step');
        positions = checkPositionsParameter(positions, 'step');

        addStepToBlock(this, curBlock, id, this.currentStage, positions);

        this.stages[this.currentStage].steps.push(id);

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

            // Must be done after addStageToCurrentBlock.
            addStepsToCurrentBlock(this, this.stages[stageName].steps);
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
                                'number. Found: ' + nRepeats);
            }

            positions = checkPositionsParameter(positions, 'repeat');

            addStageToCurrentBlock(this, {
                type: 'repeat',
                id: stageName,
                num: parseInt(nRepeats, 10)
            }, positions);

            // Must be done after addStageToCurrentBlock is called.
            addStepsToCurrentBlock(this, this.stages[stageName].steps);
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
        addStageToCurrentBlock(this, {
            id: 'gameover',
            type: 'gameover'
        });
        return this;
    };

    // ## Private Methods

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
                                'function. Found: ' + loopFunc);
        }

        positions = checkPositionsParameter(positions, type);

        addStageToCurrentBlock(that, {
            type: type,
            id: stageName,
            cb: loopFunc
        }, positions);

        // Must be done after addStageToCurrentBlock is called.
        addStepsToCurrentBlock(that, that.stages[stageName].steps);
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

        // was:
        // rndName = '_' + J.randomInt(10000);
        rndName = '_' + Math.floor((that.blocks.length + 1)/2);

        // Closes last step and stage blocks.
        // Then adds a new enclosing-stages block.
        addStageBlock(that,
                      BLOCK_ENCLOSING + name + rndName,
                      BLOCK_ENCLOSING_STAGES,
                      positions);

        // Gets the enclosing-stages block just added.
        curBlock = that.getCurrentBlock();
        curBlock.add({
            type: BLOCK_STAGE,
            item: stage,
            id: stage.id
        });

        that.currentStage = name;

        addBlock(that,
                 BLOCK_ENCLOSING + name + '_steps' + rndName,
                 BLOCK_ENCLOSING_STEPS,
                 'linear',
                 BLOCK_STEP);
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
     * @param {array} steps Array containing the id of the steps
     *
     * @see addStepToBlock
     */
    function addStepsToCurrentBlock(that, steps) {
        var curBlock, i, len;
        curBlock = that.getCurrentBlock();
        i = -1, len = steps.length;
        for ( ; ++i < len ; ) {
            addStepToBlock(that, curBlock, steps[i], that.currentStage);
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
                            nameAndAlias);
        }
        if (alias && !that.stages[id]) {
            throw new Error('Stager.' + method + ': alias is referencing ' +
                            'non-existing stage: ' + id);
        }
        if (alias && that.stages[alias]) {
            throw new Error('Stager.' + method + ': alias is not unique: ' +
                            alias);
        }
        return tokens;
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
     * @see checkStageStepId
     *
     * @api private
     */
    function checkStepValidity(step, method) {
        if (step === null || 'object' !== typeof step) {
            throw new TypeError('Stager.' + method + ': step must be ' +
                                'object. Found: ' + step);
        }
        if ('function' !== typeof step.cb) {
            throw new TypeError('Stager.' + method + ': step.cb must be ' +
                                'function. Found: ' + step.cb);
        }
        checkStageStepId(method, 'step', step.id);
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
      * @see checkStageStepId
      *
      * @api private
      */
    function checkStageValidity(stage, method) {
        if ('object' !== typeof stage) {
            throw new TypeError('Stager.' + method + ': stage must be ' +
                                'object. Found: ' + stage);
        }
        if ((!stage.steps && !stage.cb) || (stage.steps && stage.cb)) {
            throw new TypeError('Stager.' + method + ': stage must have ' +
                                'either a steps or a cb property');
        }
        if (J.isArray(stage.steps)) {
            if (!stage.steps.length) {
                throw new Error('Stager.' + method + ': stage.steps cannot ' +
                                'be empty');
            }
        }
        else if (stage.steps) {
            throw new TypeError('Stager.' + method + ': stage.steps must be ' +
                                'array or undefined.  Found: ' + stage.steps);
        }
        checkStageStepId(method, 'stage', stage.id);
     }

    /**
     * #### handleStepParameter
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
    function handleStepParameter(that, step, method) {
        var id;
        if ('object' === typeof step) {
            id = step.id;
            if (that.steps[id]) {
                throw new Error('Stager.' + method + ': step is object, ' +
                                'but a step with the same id already ' +
                                'exists: ' + id);
            }
            // Add default callback, if missing.
            if (!step.cb) step.cb = that.getDefaultCallback();
        }
        else if ('string' === typeof step) {
            id = step;
            step = {
                id: id,
                cb: that.getDefaultCallback()
            };
        }
        else {
            throw new TypeError('Stager.' + method + ': step must be ' +
                                'string or object. Found: ' + step);
        }

        // A new step is created if not found (performs validation).
        if (!that.steps[id]) that.addStep(step);

        return id;
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
     *
     * @see checkStageValidity
     */
    function handleStageParameter(that, stage, method) {
        var tokens, id, alias;
        if ('object' === typeof stage) {
            id = stage.id;

            // Check only if it is already existing
            // (type checking is done later).
            if (that.stages[id]) {
                throw new Error('Stager.' + method + ': stage is object, ' +
                                'but a stage with the same id already ' +
                                'exists: ' + id);
            }

            // If both cb and steps are missing, adds steps array,
            // and create new step, if necessary.
            if (!stage.cb && !stage.steps) {
                stage.steps = [ id ];
                if (!that.steps[id]) {
                    that.addStep({ id: id, cb: that.getDefaultCb() });
                }
            }
            // If a cb property is present create a new step with that cb.
            // If a step with same id is already existing, raise an error.
            else if (stage.cb) {
                if (that.steps[id]) {
                    throw new Error('Stager.' + method + ': stage has ' +
                                    'cb property, but a step with the same ' +
                                    'id is already defined: ' + id);
                }
                that.addStep({ id: id, cb: stage.cb });
                delete stage.cb;
                stage.steps = [ id ];
            }
            that.addStage(stage);
        }
        else if ('string' === typeof stage) {

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
                    that.addStep(makeDefaultStep(id, that.getDefaultCb()));
                }
                that.addStage({
                    id: id,
                    steps: [ id ]
                });
            }
        }
        else {
            throw new TypeError('Stager.' + method + ': stage must be ' +
                                'string or object. Found: ' + stage);
        }

        return alias || id;
    }

    /**
     * #### checkStageStepId
     *
     * Check the validity of the ID of a step or a stage
     *
     * Must be non-empty string, and cannot begin with a dot.
     *
     * Notice: in the future, the following limitations might apply:
     *
     * - no dots at all in the name
     * - cannot begin with a number
     *
     * @param {string} method The name of the invoking method
     * @param {string} s A string taking value 'step' or 'stage'
     * @param {string} id The id to check
     */
    function checkStageStepId(method, s, id) {
        if ('string' !== typeof id) {
            throw new TypeError('Stager.' + method + ': ' + s + '.id must ' +
                                'be string. Found: ' + id);
        }
        if (id.trim() === '') {
            throw new TypeError('Stager.' + method + ': ' + s + '.id cannot ' +
                                'be an empty string.');
        }
        if (id.lastIndexOf('.') !== -1) {
            throw new Error('Stager.' + method + ': ' + s + '.id cannot ' +
                            'contains dots. Found: ' + id);
        }
        if (/^\d+$/.test(id.charAt(0))) {
            throw new Error('Stager.' + method + ': ' + s + '.id cannot ' +
                            'begin with a number. Found: ' + id);
        }
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
