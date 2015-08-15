/**
 * # Stager
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` container and builder of the game sequence
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    exports.Stager = Stager;

    var stepRules = parent.stepRules;
    var J = parent.JSUS;

    // ## Static methods

    /**
     * ## Stager.defaultCallback
     *
     * Default callback added to steps when none is specified
     *
     * @see Stager.setDefaultCallback
     * @see Stager.getDefaultCallback
     */
    Stager.defaultCallback = function() {
        this.node.log(this.getCurrentStepObj().id);
        this.node.done();
    };

    /**
     * ## Stager constructor
     *
     * Creates a new instance of Stager
     *
     * @param {object} stateObj Optional. State to initialize the new
     *   Stager object with. See `Stager.setState`.
     *
     * @see Stager.setState
     */
    function Stager(stateObj) {

        // ## Properties

        /**
         * ### Stager.steps
         *
         * Step object container
         *
         * key: step ID,  value: step object
         *
         * @see Stager.addStep
         */
        this.steps = {};

        /**
         * ### Stager.stages
         *
         * Stage object container
         *
         * key: stage ID,  value: stage object
         *
         * Stage aliases are stored the same way, with a reference to
         * the original stage object as the value.
         *
         * @see Stager.addStage
         */
        this.stages = {};

        /**
         * ### Stager.sequence
         *
         * Sequence block container
         *
         * Stores the game plan in 'simple mode'.
         *
         * @see Stager.gameover
         * @see Stager.next
         * @see Stager.repeat
         * @see Stager.loop
         * @see Stager.doLoop
         */
        this.sequence = [];

        /**
         * ### Stager.generalNextFunction
         *
         * General next-stage decider function
         *
         * Returns the id of the next game step.
         * Available only when nodegame is executed in _flexible_ mode.
         *
         * @see Stager.registerGeneralNext
         */
        this.generalNextFunction = null;

        /**
         * ### Stager.nextFunctions
         *
         * Per-stage next-stage decider function
         *
         * key: stage ID,  value: callback function
         *
         * Stores functions to be called to yield the id of the next
         * game stage for a specific previous stage.
         *
         * @see Stager.registerNext
         */
        this.nextFunctions = {};

        /**
         * ### Stager.defaultStepRule
         *
         * Default step-rule function
         *
         * This function decides whether it is possible to proceed to
         * the next step/stage. If a step/stage object defines a
         * `steprule` property, then that function is used instead.
         *
         * @see Stager.getDefaultStepRule
         * @see GamePlot.getStepRule
         */
        this.setDefaultStepRule();

        /**
         * ### Stager.defaultGlobals
         *
         * Defaults of global variables
         *
         * This map holds the default values of global variables. These
         * values are overridable by more specific version in step and
         * stage objects.
         *
         * @see Stager.setDefaultGlobals
         * @see GamePlot.getGlobal
         */
        this.defaultGlobals = {};

        /**
         * ### Stager.defaultProperties
         *
         * Defaults of properties
         *
         * This map holds the default values of properties. These values
         * are overridable by more specific version in step and stage
         * objects.
         *
         * @see Stager.setDefaultProperties
         * @see GamePlot.getProperty
         */
        this.defaultProperties = {};

        /**
         * ### Stager.onInit
         *
         * Initialization function
         *
         * This function is called as soon as the game is instantiated,
         * i.e. at stage 0.0.0.
         *
         * Event listeners defined here stay valid throughout the whole
         * game, unlike event listeners defined inside a function of the
         * gamePlot, which are valid only within the specific function.
         */
        this.onInit = null;

        /**
         * ### Stager.onGameover
         *
         * Cleaning up function
         *
         * This function is called after the last stage of the gamePlot
         * is terminated.
         */
        this.onGameover = null;

        /**
         * ### Stager.blocks
         *
         * List of all Blocks used to build the hierarchy
         */
        this.blocks = [];

        /**
         * ### Stager.unfinishedBlocks
         *
         * List of all Blocks stager might still modify
         */
        this.unfinishedBlocks = [];

        /**
         * ### Stager.finalized
         *
         * Flag indicating if the hierarchy of has been set
         *
         * Indicates if the hierarchy of stages and steps has been set.
         */
        this.finalized = false;

        /**
         * ### Stager.currentType
         *
         * Name of the stage currently worked with in building hierarchy
         */
        this.currentType = "__default";

        /**
         * ### Stager.currentBlockType
         *
         * Indicates what type of Block was added last
         */
        this.currentBlockType = "__default";

        /**
         * ### Stager.toSkip
         *
         * List of stages and steps to skip when building the sequence
         */
        this.toSkip = {
            stages: {},
            steps: {}
        };

        /**
         * ## Stager.defaultCallback
         *
         * Default callback assigned to a step if none is provided
         */
        this.defaultCallback = null;

        /**
         * ## Stager.cacheReset
         *
         * Cache used to reset the state of the stager after finalization
         */
        this.cacheReset = {
            unfinishedBlocks: []
        };

        /**
         * ### Stager.log
         *
         * Default standard output. Override to redirect.
         */
        this.log = console.log;

        // Set the state if one is passed.
        if (stateObj) {
            if ('object' !== typeof stateObj) {
                throw new TypeError('Stager: stateObj must be object.');
            }
            this.setState(stateObj);
        }
        else {
            // Add first block.
            this.stageBlock('linear', { id: '__default_block' });
        }
    }

    // ## Stager methods

    // Clear, init, finalize, reset.

    /**
     * ### Stager.clear
     *
     * Clears the state of the stager
     *
     * @return {Stager} this object
     */
    Stager.prototype.clear = function() {
        this.steps = {};
        this.stages = {};
        this.sequence = [];
        this.generalNextFunction = null;
        this.nextFunctions = {};
        this.setDefaultStepRule();
        this.defaultGlobals = {};
        this.defaultProperties = {};
        this.onInit = null;
        this.onGameover = null;
        this.blocks = [];
        this.unfinishedBlocks = [];
        this.finalized = false;
        this.currentType = "__default";
        this.currentBlockType = "__default";
        this.toSkip = { stages: {}, steps: {} };
        this.defaultCallback = null;
        this.cacheReset = { unfinishedBlocks: [] };
        return this;
    };

    /**
     * ### Stager.init
     *
     * Clears the state of the stager and adds a default block
     *
     * @return {Stager} this object
     *
     * @see Stager.clear
     */
    Stager.prototype.init = function() {
        this.clear();
        this.stageBlock('linear', { id: '__default_block' });
        return this;
    };

    /**
     * ## Stager.finalize
     *
     * Builds stage and step sequence from the Block hieararchy
     *
     * @see Stager.reset
     */
    Stager.prototype.finalize = function() {
        var currentItem, stageId, stepId;
        var outermostBlock, blockIndex;
        var i, len, seqItem;

        // Already finalized.
        if (this.finalized) return;

        // Nothing to do, finalize called to early.
        if (!this.blocks.length) return;

        // Cache the ids of unfinishedBlocks for future calls to .reset.
        i = -1, len = this.unfinishedBlocks.length;
        for ( ; ++i < len ; ) {
            this.cacheReset.unfinishedBlocks.push(this.unfinishedBlocks[i].id);
            // Need to backup unfinished blocks before calling endAllBlocks().
            this.unfinishedBlocks[i].backup();
        }

        // Closes unclosed blocks.
        this.endAllBlocks();
        // Fixes the position of unfixed elements inside each block.
        for (blockIndex = 0; blockIndex < this.blocks.length; ++blockIndex) {
            this.blocks[blockIndex].finalize();
        }

        // Take outermost block and start building sequence.
        outermostBlock = this.blocks[0];
        currentItem = outermostBlock.next();
        while (!!currentItem) {
            if (currentItem.type === "__stage") {
                stageId = currentItem.item.id;
                // Add it to sequence if it was
                // not marked as `toSkip`, or it is a gameover stage.
                if (currentItem.item.type === 'gameover' ||
                    !this.isSkipped(stageId)) {

                    seqItem = J.clone(currentItem.item);
                    seqItem.steps = [];
                    this.sequence.push(seqItem);
                }
            }
            else {
                // It is a step, currentItem.type = stage id (TODO: change).
                stageId = currentItem.type;
                stepId = currentItem.item;
                // Add it to sequence if it was not marked as `toSkip`.
                if (!this.isSkipped(stageId, stepId)) {
                    i = -1, len = this.sequence.length;
                    for ( ; ++i < len ; ) {
                        if (this.sequence[i].id === stageId) {
                            this.sequence[i].steps.push(stepId);
                            break;
                        }
                    }
                }
            }
            currentItem = outermostBlock.next();
        }
        this.finalized = true;
    };

    /**
     * ## Stager.reset
     *
     * Undoes a previous call to `finalize`
     *
     * Allows to call `Stager.finalize` again to build a potentially
     * different sequence from the Block hierarchy.
     *
     * @see Stager.finalize
     * @see Stager.cacheReset
     */
    Stager.prototype.reset = function() {
        var blockIndex;
        var i, lenCache, lenBlocks, blocks;

        if (!this.finalized) return this;

        // Restore unfinishedBlocks, if any.
        lenCache = this.cacheReset.unfinishedBlocks.length;
        if (lenCache) {
            // Create index of blocks by id.
            blocks = {};
            i = -1, lenBlocks = this.blocks.length;
            for ( ; ++i < lenBlocks ; ) {
                blocks[this.blocks[i].id] = this.blocks[i];
            }
            // Copy by reference cached blocks.
            i = -1;
            for ( ; ++i < lenCache ; ) {
                this.unfinishedBlocks
                    .push(blocks[this.cacheReset.unfinishedBlocks[i]]);
            }
            this.cacheReset = { unfinishedBlocks: []};
        }
        // End restore unfinishedBlocks.

        // Call restore on individual blocks.
        for (blockIndex = 0; blockIndex < this.blocks.length; ++blockIndex) {
            this.blocks[blockIndex].restore();
        }
        this.sequence = [];
        this.finalized = false;
    };

    // Setters, Getters.

    /**
     * ### Stager.setState
     *
     * Sets the internal state of the Stager
     *
     * The passed state object can have the following fields:
     * steps, stages, sequence, generalNextFunction, nextFunctions,
     * defaultStepRule, defaultGlobals, defaultProperties, onInit,
     * onGameover.
     * All fields are optional.
     *
     * This function calls the corresponding functions to set these
     * fields, and performs error checking.
     *
     * If updateRule is 'replace', the Stager is cleared before applying
     * the state.
     *
     * @param {object} stateObj The Stager's state
     * @param {string} updateRule Optional. Whether to
     *    'replace' (default) or to 'append'.
     *
     * @see Stager.getState
     */
    Stager.prototype.setState = function(stateObj, updateRule) {
        var idx;
        var stageObj;
        var seqObj;

        if ('object' !== typeof stateObj) {
            throw new TypeError('Stager.setState: stateObj must be object.');
        }

        updateRule = updateRule || 'replace';

        if ('string' !== typeof updateRule) {
            throw new TypeError('Stager.setState: updateRule must be object ' +
                                'or undefined.');
        }

        // Clear previous state:
        if (updateRule === 'replace') {
            this.clear();
        }
        else if (updateRule !== 'append') {
            throw new Error('Stager.setState: invalid updateRule: ' +
                            updateRule);
        }

        // Add steps:
        for (idx in stateObj.steps) {
            if (stateObj.steps.hasOwnProperty(idx)) {
                this.addStep(stateObj.steps[idx]);
            }
        }

        // Add stages:
        // first, handle all non-aliases
        // (key of `stages` entry is same as `id` field of its value)
        for (idx in stateObj.stages) {
            stageObj = stateObj.stages[idx];
            if (stateObj.stages.hasOwnProperty(idx) &&
                stageObj.id === idx) {
                    this.addStage(stageObj);
            }
        }
        // second, handle all aliases
        // (key of `stages` entry is different from `id` field of
        // its value)
        for (idx in stateObj.stages) {
            stageObj = stateObj.stages[idx];
            if (stateObj.stages.hasOwnProperty(idx) &&
                stageObj.id !== idx) {
                    this.stages[idx] = this.stages[stageObj.id];
            }
        }

        // Add sequence blocks:
        if (stateObj.hasOwnProperty('sequence')) {
            for (idx = 0; idx < stateObj.sequence.length; idx++) {
                seqObj = stateObj.sequence[idx];

                this.sequence[idx] = seqObj;

                //switch (seqObj.type) {
                //case 'gameover':
                    //this.gameover();
                    //break;

                //case 'plain':
                    //if (!this.next(seqObj.id)) {
                        //throw new Error('Stager.setState: invalid' +
                        //+ 'sequence.');
                    //}
                    //break;

                //case 'repeat':
                    //if (!this.repeat(seqObj.id, seqObj.num)) {
                        //throw new Error('Stager.setState: invalid' +
                        //+ 'sequence.');                    //}
                    //break;

                //case 'loop':
                    //if (!this.loop(seqObj.id, seqObj.cb)) {
                        //throw new Error('Stager.setState: invalid' +
                        //+ 'sequence.');                    //}
                    //}
                    //break;

                //case 'doLoop':
                    //if (!this.doLoop(seqObj.id, seqObj.cb)) {
                        //throw new Error('Stager.setState: invalid' +
                        //+ 'sequence.');                    //}

                    //}
                    //break;

                //default:
                    //// Unknown type:
                        //throw new Error('Stager.setState: invalid' +
                        //+ 'sequence.');                    //}

                //}
            }
        }

        // Set general next-decider:
        if (stateObj.hasOwnProperty('generalNextFunction')) {
            this.registerGeneralNext(stateObj.generalNextFunction);
        }

        // Set specific next-deciders:
        for (idx in stateObj.nextFunctions) {
            if (stateObj.nextFunctions.hasOwnProperty(idx)) {
                this.registerNext(idx, stateObj.nextFunctions[idx]);
            }
        }

        // Set default step-rule:
        if (stateObj.hasOwnProperty('defaultStepRule')) {
            this.setDefaultStepRule(stateObj.defaultStepRule);
        }

        // Set default globals:
        if (stateObj.hasOwnProperty('defaultGlobals')) {
            this.setDefaultGlobals(stateObj.defaultGlobals);
        }

        // Set default properties:
        if (stateObj.hasOwnProperty('defaultProperties')) {
            this.setDefaultProperties(stateObj.defaultProperties);
        }

        // Set onInit:
        if (stateObj.hasOwnProperty('onInit')) {
            this.setOnInit(stateObj.onInit);
        }

        // Set onGameover:
        if (stateObj.hasOwnProperty('onGameover')) {
            this.setOnGameover(stateObj.onGameover);
        }

        // Set toSkip.
        if (stateObj.hasOwnProperty('toSkip')) {
            this.toSkip = stateObj.toSkip;
        }

        // Set defaultCallback
        if (stateObj.hasOwnProperty('defaultCallback')) {
            this.setDefaultCallback(stateObj.defaultCallback);
        }

        // Cache reset.
        if (stateObj.hasOwnProperty('cacheReset')) {
            this.cacheReset = stageObj.cacheReset;
        }

        // Mark finalized.
        this.finalized = true;
    };

    /**
     * ### Stager.getState
     *
     * Finalizes the stager and returns a copy of internal state
     *
     * Fields of returned object:
     *
     * steps, stages, sequence, generalNextFunction, nextFunctions,
     * defaultStepRule, defaultGlobals, defaultProperties, onInit,
     * onGameover, blocks.
     *
     * @return {object} Clone of the Stager's state
     *
     * @see Stager.setState
     * @see Stager.finalize
     */
    Stager.prototype.getState = function() {
        this.finalize();

        return J.clone({
            steps:               this.steps,
            stages:              this.stages,
            sequence:            this.sequence,
            generalNextFunction: this.generalNextFunction,
            nextFunctions:       this.nextFunctions,
            defaultStepRule:     this.defaultStepRule,
            defaultGlobals:      this.defaultGlobals,
            defaultProperties:   this.defaultProperties,
            onInit:              this.onInit,
            onGameover:          this.onGameover,
            blocks:              this.blocks,
            toSkip:              this.toSkip,
            defaultCallback:     this.defaultCallback
        });
    };

    /**
     * ### Stager.setDefaultStepRule
     *
     * Sets the default step-rule function
     *
     * @param {function} stepRule Optional. The step-rule function.
     *   If undefined, the `SOLO` rule is set.
     *
     * @see Stager.defaultStepRule
     * @see stepRules
     */
    Stager.prototype.setDefaultStepRule = function(stepRule) {
        if (stepRule) {
            if ('function' !== typeof stepRule) {
                throw new TypeError('Stager.setDefaultStepRule: ' +
                                    'stepRule must be function or ' +
                                    'undefined.');
            }

            this.defaultStepRule = stepRule;
        }
        else {
            // Initial default.
            this.defaultStepRule = stepRules.SOLO;
        }
    };

    /**
     * ### Stager.getDefaultStepRule
     *
     * Returns the default step-rule function
     *
     * @return {function} The default step-rule function
     */
    Stager.prototype.getDefaultStepRule = function() {
        return this.defaultStepRule;
    };

    /**
     * ### Stager.setDefaultCallback
     *
     * Sets the default callback
     *
     * @param {function|null} cb The default callback or null to unset it
     *
     * @see Stager.defaultCallback
     * @see Stager.getDefaultCallback
     */
    Stager.prototype.setDefaultCallback = function(cb) {
        if (cb !== null && 'function' !== typeof cb) {
            throw new TypeError('Stager.setDefaultCallback: ' +
                                'defaultCallback must be function or null.');
        }
        this.defaultCallback = cb;
    };

    /**
     * ### Stager.getDefaultCallback
     *
     * Returns the default callback
     *
     * If the default callback is not set return the static function
     * `Stager.defaultCallback`
     *
     * @return {function} The default callback
     *
     * @see Stager.defaultCallback (static)
     * @see Stager.defaultCallback
     * @see Stager.setDefaultCallback
     */
    Stager.prototype.getDefaultCallback = function() {
        return this.defaultCallback || Stager.defaultCallback;
    };

    /**
     * ### Stager.setDefaultGlobals
     *
     * Sets/mixes in the default globals
     *
     * @param {object} defaultGlobals The map of default global
     *   variables
     * @param {boolean} mixin Optional. If TRUE, parameter defaultGlobals
     *    will be mixed-in with current globals, otherwise it will replace
          it. Default FALSE.
     *
     * @see Stager.defaultGlobals
     * @see GamePlot.getGlobal
     */
    Stager.prototype.setDefaultGlobals = function(defaultGlobals, mixin) {
        if (!defaultGlobals || 'object' !== typeof defaultGlobals) {
            throw new TypeError('Stager.setDefaultGlobals: ' +
                                'defaultGlobals must be object.');
        }
        if (mixin) J.mixin(this.defaultGlobals, defaultGlobals);
        else this.defaultGlobals = defaultGlobals;
    };

    /**
     * ### Stager.getDefaultGlobals
     *
     * Returns the default globals
     *
     * @return {object} The map of default global variables
     *
     * @see Stager.defaultGlobals
     * @see GamePlot.getGlobal
     */
    Stager.prototype.getDefaultGlobals = function() {
        return this.defaultGlobals;
    };

    /**
     * ### Stager.setDefaultProperty
     *
     * Sets a default property
     *
     * @param {string} name The name of the default property
     * @param {mixed} value The value for the default property
     *
     * @see Stager.defaultProperties
     * @see Stager.setDefaultProperties
     * @see GamePlot.getProperty
     */
    Stager.prototype.setDefaultProperty = function(name, value) {
        if ('string' !== typeof name) {
            throw new TypeError('Stager.setDefaultProperty: name ' +
                                'must be string.');
        }
        this.defaultProperties[name] = value;
    };

    /**
     * ### Stager.setDefaultProperties
     *
     * Sets the default properties
     *
     * @param {object} defaultProperties The map of default properties
     * @param {boolean} mixin Optional. If TRUE, parameter defaulProperties
     *    will be mixed-in with current globals, otherwise it will replace
          it. Default FALSE.
     *
     * @see Stager.defaultProperties
     * @see GamePlot.getProperty
     */
    Stager.prototype.setDefaultProperties = function(defaultProperties,
                                                     mixin) {
        if (!defaultProperties ||
            'object' !== typeof defaultProperties) {
            throw new TypeError('Stager.setDefaultProperties: ' +
                                'defaultProperties must be object.');
        }
        if (mixin) J.mixin(this.defaultProperties, defaultProperties);
        else this.defaultProperties = defaultProperties;
    };

    /**
     * ### Stager.getDefaultProperties
     *
     * Returns the default properties
     *
     * @return {object} The map of default properties
     *
     * @see Stager.defaultProperties
     * @see GamePlot.getProperty
     */
    Stager.prototype.getDefaultProperties = function() {
        return this.defaultProperties;
    };

    /**
     * ### Stager.setOnInit
     *
     * Sets onInit function
     *
     * @param {function|null} func The onInit function.
     *   NULL can be given to signify non-existence.
     *
     * @see Stager.onInit
     */
    Stager.prototype.setOnInit = function(func) {
        if (func && 'function' !== typeof func) {
            throw new TypeError('Stager.setOnInit: func must be' +
                                ' function or undefined.');
        }
        this.onInit = func;
    };

    /**
     * ### Stager.getOnInit
     *
     * Gets onInit function
     *
     * @return {function|null} The onInit function.
     *  NULL signifies non-existence.
     *
     * @see Stager.onInit
     */
    Stager.prototype.getOnInit = function(func) {
        return this.onInit;
    };

    /**
     * ### Stager.setOnGameover
     *
     * Sets onGameover function
     *
     * @param {function|null} func The onGameover function.
     *   NULL can be given to signify non-existence.
     *
     * @see Stager.onGameover
     */
    Stager.prototype.setOnGameover = function(func) {
        if (func && 'function' !== typeof func) {
            throw new Error('Stager.setOnGameover: func must be ' +
                                'function or undefined.');
        }
        this.onGameover = func;
    };

    /**
     * ### Stager.setOnGameOver
     *
     * Alias for `setOnGameover`
     *
     * @see Stager.setOnGameover
     */
    Stager.prototype.setOnGameOver = Stager.prototype.setOnGameover;

    /**
     * ### Stager.getOnGameover
     *
     * Gets onGameover function
     *
     * @return {function|null} The onGameover function, or NULL if none
     *    is found
     *
     * @see Stager.onGameover
     */
    Stager.prototype.getOnGameover = function(func) {
        return this.onGameover;
    };

    /**
     * ### Stager.getOnGameOver
     *
     * Alias for `getOnGameover`
     *
     * @see Stager.getOnGameover
     */
    Stager.prototype.getOnGameOver = Stager.prototype.getOnGameover;


    // Add stages, steps.

    /**
     * ### Stager.addStep
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
     * ### Stager.addStage
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
     * ### Stager.step
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

        return this;
    };

    /**
     * ### Stager.next | stage
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

            handleStageAdd(this, {
                type: 'plain',
                id: stageName
            }, positions);

            // Must be done after handleStageAdd is called.
            addStepsToCurrentBlock(this, this.stages[stageName]);
            return this;
        };

    /**
     * ### Stager.repeat | repeatStage
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

            handleStageAdd(this, {
                type: 'repeat',
                id: stageName,
                num: parseInt(nRepeats, 10)
            }, positions);

            // Must be done after handleStageAdd is called.
            addStepsToCurrentBlock(this, this.stages[stageName]);
            return this;
        };

    /**
     * ### Stager.loop | loopStage
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
     * ### Stager.doLoop | doLoopStage
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
     * ### Stager.gameover
     *
     * Adds gameover block to sequence
     *
     * @return {Stager} this object
     */
    Stager.prototype.gameover = function() {
        handleStageAdd(this, { type: 'gameover' });
        return this;
    };

    // Extend stages, modify sequence

    /**
     * ### Stager.extendStep
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
     * ### Stager.extendStage
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
     * ### Stager.skip
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
     * ### Stager.unskip
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
     * ### Stager.isSkipped
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

    // Block operations.

    /**
     * ## Stager.beginBlock
     *
     * Begins a new Block
     *
     * @param {string} positions Optional. Positions within the
     *    enclosing Block that this block can occupy.
     * @param {object} options for the Block constructor
     *
     * @return {Stager} Reference to the current instance for method chainining
     *
     * @see Block
     */
    Stager.prototype.beginBlock = function(positions, options) {
        var block;
        options = options || {};
        J.mixin(options, {type: this.currentType});
        block = new Block(positions, options);
        this.unfinishedBlocks.push(block);
        this.blocks.push(block);
        return this;
    };

    /**
     * ## Stager.endBlock
     *
     * Ends the current Block
     *
     * param {object} options Optional If `options.finalize` is set, the
     *   block gets finalized.
     *
     * @return {Stager} Reference to the current instance for method chainining
     */
    Stager.prototype.endBlock = function(options) {
        var block, currentBlock;
        if (!this.unfinishedBlocks.length) return this;

        block = this.unfinishedBlocks.pop();
        currentBlock = this.getCurrentBlock();

        options = options || {};
        if (currentBlock) currentBlock.add(block, block.positions);

        if (options.finalize) block.finalize();

        return this;
    };

    /**
     * ## Stager.endBlocks
     *
     * Ends multiple Blocks
     *
     * @param Number n Number of Blocks to be ended.
     * @param {object} options Optional If options.finalize is set, the
     *      block gets finalized.
     */
    Stager.prototype.endBlocks = function(n, options) {
        var i;
        for (i = 0; i < n; ++i) {
            this.endBlock(options);
        }
        return this;
    };

    /**
     * ## Stager.endAllBlocks
     *
     * Ends all unfinished Blocks.
     */
    Stager.prototype.endAllBlocks = function() {
        this.endBlocks(this.unfinishedBlocks.length);
    };

    /**
     * ## Stager.stepBlock
     *
     * Begins a new Block of steps
     *
     * @param {string} positions Optional. Positions within the
     *   enclosing Block that this block can occupy.
     *
     * @return {Stager} Reference to the current instance for method chainining
     */
    Stager.prototype.stepBlock = function(position, options) {
        this.currentBlockType = "__step";
        this.beginBlock(position, options);
        return this;
    };

    /**
     * ## Stager.stageBlock
     *
     * Begins a new Block of stages
     *
     * @param {string} positions Optional. Positions within the
     *   enclosing Block that this block can occupy.
     *
     * @return {Stager} Reference to the current instance for method chainining
     */
    Stager.prototype.stageBlock = function(positions, options) {
        if (this.currentType !== "__default") {
            this.endBlocks(2);
        }
        this.currentType = "__default";
        this.currentBlockType = "__stage";
        this.beginBlock(positions, options);
        return this;
    };

    /**
     * ## Stager.nextBlock
     *
     * Ends current Block and begins a new one of the same type
     *
     * @param {string} positions Optional. Positions within the
     *   enclosing Block that this block can occupy.
     *
     * @return {Stager} Reference to the current instance for method chainining
     */
    Stager.prototype.nextBlock = function(positions, options) {
        this.endBlock();
        if (this.currentBlockType === "__stage") {
            this.stageBlock(positions, options);
        }
        else if (this.currentBlockType === "__step") {
            this.stepBlock(positions, options);
        }
        return this;
    };

    /**
     * ## Stager.getCurrentBlock
     *
     * Returns the Block that Stager is currently working on
     *
     * @param {string} positions Optional. Positions within the
     *      enclosing Block that this block can occupy.
     *
     * @return {object|boolean} Currently open block, or FALSE if no
     *   unfinished block is found
     */
    Stager.prototype.getCurrentBlock = function(options) {
        if (this.unfinishedBlocks.length > 0) {
            return this.unfinishedBlocks[this.unfinishedBlocks.length -1];
        }
        return false;
    };

    // Get Info out.

    /**
     * ### Stager.getSequence
     *
     * Returns the sequence of stages
     *
     * @param {string} format 'hstages' for an array of human-readable
     *   stage descriptions, 'hsteps' for an array of human-readable
     *   step descriptions, 'o' for the internal JavaScript object
     *
     * @return {array|object|null} The stage sequence in requested
     *   format. NULL on error.
     */
    Stager.prototype.getSequence = function(format) {
        var result;
        var seqIdx;
        var seqObj;
        var stepPrefix;

        switch (format) {
        case 'hstages':
            result = [];

            for (seqIdx in this.sequence) {
                if (this.sequence.hasOwnProperty(seqIdx)) {
                    seqObj = this.sequence[seqIdx];

                    switch (seqObj.type) {
                    case 'gameover':
                        result.push('[game over]');
                        break;

                    case 'plain':
                        result.push(seqObj.id);
                        break;

                    case 'repeat':
                        result.push(seqObj.id + ' [x' + seqObj.num +
                            ']');
                        break;

                    case 'loop':
                        result.push(seqObj.id + ' [loop]');
                        break;

                    case 'doLoop':
                        result.push(seqObj.id + ' [doLoop]');
                        break;

                    default:
                        throw new Error('Stager.getSequence: unknown' +
                                        'sequence object type.');
                    }
                }
            }
            break;

        case 'hsteps':
            result = [];

            for (seqIdx in this.sequence) {
                if (this.sequence.hasOwnProperty(seqIdx)) {
                    seqObj = this.sequence[seqIdx];
                    stepPrefix = seqObj.id + '.';

                    switch (seqObj.type) {
                    case 'gameover':
                        result.push('[game over]');
                        break;

                    case 'plain':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix + stepID);
                            }
                        );
                        break;

                    case 'repeat':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix + stepID +
                                    ' [x' + seqObj.num + ']');
                            }
                        );
                        break;

                    case 'loop':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix +
                                            stepID + ' [loop]');
                            }
                        );
                        break;

                    case 'doLoop':
                        seqObj.steps.map(
                            function(stepID) {
                                result.push(stepPrefix +
                                            stepID + ' [doLoop]');
                            }
                        );
                        break;

                    default:
                        throw new Error('Stager.getSequence: unknown' +
                                        'sequence object type.');
                    }
                }
            }
            break;

        case 'o':
            result = this.sequence;
            break;

        default:
            throw new Error('Stager.getSequence: invalid format.');
        }

        return result;
    };

    /**
     * ### Stager.extractStage
     *
     * Returns a minimal state package containing one or more stages
     *
     * The returned package consists of a `setState`-compatible object
     * with the `steps` and `stages` properties set to include the given
     * stages.
     * The `sequence` is optionally set to a single `next` block for the
     * stage.
     *
     * @param {string|array} ids Valid stage name(s)
     * @param {boolean} useSeq Optional. Whether to generate a singleton
     *   sequence.  TRUE by default.
     *
     * @return {object|null} The state object on success, NULL on error
     *
     * @see Stager.setState
     */
    Stager.prototype.extractStage = function(ids, useSeq) {
        var result;
        var stepIdx, stepId;
        var stageId;
        var stageObj;
        var idArray, idIdx, id;

        if (ids instanceof Array) {
            idArray = ids;
        }
        else if ('string' === typeof ids) {
            idArray = [ ids ];
        }
        else return null;

        result = { steps: {}, stages: {}, sequence: [] };

        // undefined (default) -> true
        useSeq = (useSeq === false) ? false : true;

        for (idIdx in idArray) {
            if (idArray.hasOwnProperty(idIdx)) {
                id = idArray[idIdx];

                stageObj = this.stages[id];

                if (!stageObj) return null;

                // Add step objects:
                for (stepIdx in stageObj.steps) {
                    if (stageObj.steps.hasOwnProperty(stepIdx)) {
                        stepId = stageObj.steps[stepIdx];
                        result.steps[stepId] = this.steps[stepId];
                    }
                }

                // Add stage object:
                stageId = stageObj.id;
                result.stages[stageId] = stageObj;

                // If given id is alias, also add alias:
                if (stageId !== id) result.stages[id] = stageObj;

                // Add mini-sequence:
                if (useSeq) {
                    result.sequence.push({
                        type: 'plain',
                        id: stageId
                    });
                }
            }
        }

        return result;
    };

    /**
     * ### Stager.getStepsFromStage
     *
     * Returns the steps of a stage
     *
     * @param {string} id A valid stage name
     *
     * @return {array|null} The steps in the stage. NULL on invalid
     *   stage.
     */
    Stager.prototype.getStepsOfStage = function(id) {
        if (!this.stages[id]) return null;
        return this.stages[id].steps;
    };

    // Flexible Mode

    /**
     * ### Stager.registerGeneralNext
     *
     * Sets general callback for next stage decision
     *
     * Available only when nodegame is executed in _flexible_ mode.
     * The callback given here is used to determine the next stage.
     *
     * @param {function|null} func The decider callback. It should
     *   return the name of the next stage, 'NODEGAME_GAMEOVER' to end
     *   the game or FALSE for sequence end. NULL can be given to
     *   signify non-existence.
     */
    Stager.prototype.registerGeneralNext = function(func) {
        if (func !== null && 'function' !== typeof func) {
            throw new TypeError('Stager.registerGeneralNext: ' +
                                'func must be function or undefined.');
        }
        this.generalNextFunction = func;
    };

    /**
     * ### Stager.registerNext
     *
     * Registers a step-decider callback for a specific stage
     *
     * The function overrides the general callback for the specific
     * stage, and determines the next stage.
     * Available only when nodegame is executed in _flexible_ mode.
     *
     * @param {string} id The name of the stage after which the decider
     *   function will be called
     * @param {function} func The decider callback. It should return the
     *   name of the next stage, 'NODEGAME_GAMEOVER' to end the game or
     *   FALSE for sequence end.
     *
     * @see Stager.registerGeneralNext
     */
    Stager.prototype.registerNext = function(id, func) {
        if ('function' !== typeof func) {
            throw new TypeError('Stager.registerNext: func must be ' +
                'function.');
        }

        if (!this.stages[id]) {
            throw new TypeError('Stager.registerNext: non existent ' +
                               'stage id: ' + id + '.');
        }

        this.nextFunctions[id] = func;
    };


    // ## Stager private methods

    /**
     * ### handleStepsArray
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
     * ### addLoop
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

        handleStageAdd(that, {
            type: type,
            id: stageName,
            cb: loopFunc
        }, positions);

        // Must be done after handleStageAdd is called.
        addStepsToCurrentBlock(that, that.stages[stageName]);
        return that;
    }

    /**
     * ## addStepsToCurrentBlock
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
        var i, len;
        curBlock = that.getCurrentBlock();

        i = -1, len = stage.steps.length;
        for ( ; ++i < len ; ) {
            // Add step, if not already added.
            if (!curBlock.hasItem(stage.steps[i])) {
                curBlock.add({
                    type: that.currentType,
                    item: stage.steps[i]
                });
            }
        }
    }

    /**
     * ### extractAlias
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
     * ### handleAlias
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
     * ### checkFinalized
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
     * ### checkStepValidity
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
     * ### validateExtendedStep
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
        if (updateFunction) {
            if (!update || 'object' !== typeof update) {
                throw new TypeError('Stager.extendStep: update function ' +
                                    'must return an object with id and cb: ' +
                                    stepId + '.');
            }
            if (update.id !== stepId) {
                throw new Error('Stager.extendStep: update function ' +
                                'cannot alter the step id: ' + stepId + '.');
            }
            if ('function' !== typeof update.cb) {
                throw new TypeError('Stager.extendStep: update function ' +
                                    'must return an object with a valid ' +
                                    'callback. Step id:' + stepId + '.');
            }
        }
        else {
             if (update.hasOwnProperty('id')) {
                throw new Error('Stager.extendStep: update.id cannot be set. ' +
                               'Step id: ' + stepId + '.');
            }
            if ('function' !== typeof update.cb) {
                throw new TypeError('Stager.extendStep: update.cb must be ' +
                                    'function. Step id: ' + stepId + '.');
            }
        }
    }

    /**
     * ### validateExtendedStage
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
        if ((updateFunction && update.id !== stageId) ||
            (!updateFunction && update.hasOwnProperty('id'))) {

            throw new Error('Stager.extendStage: id cannot be altered: ' +
                            stageId + '.');
        }
        if (update.hasOwnProperty('cb')) {
            throw new TypeError('Stager.extendStage: update.cb cannot be ' +
                                'specified. Stage id: ' + stageId + '.');
        }
        if (update.hasOwnProperty('steps')) {
            if ((!J.isArray(update.steps) || !update.steps.length) ||
                update.steps === undefined || update.steps === null) {

                throw new Error('Stager.extendStage: found update.steps, but ' +
                                'it is not a non-empty array. Stage id: ' +
                               stageId + '.');
            }

            // Process every step in the array. Steps array is modified.
            handleStepsArray(that, stageId, update.steps, 'extendStage');
        }
    }

    /**
     * ### checkStepParameter
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
     * ### handleStageParameter
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
                that.addStage({
                    id: id,
                    cb: that.getDefaultCallback()
                });
            }
        }

        return alias || id;
    }

    /**
     * ### checkPositionsParameter
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
            if (isNaN(positions) || positions < 0) err = true;
            else positions += '';
        }

        if (err || 'string' !== typeof positions || positions.trim() === '') {
            throw new TypeError('Stager.' + method + ': positions must ' +
                                'be a non-empty string, a positive number, ' +
                                'or undefined. Found: ' + positions + '.');
        }
        return positions;
    }

    /**
     * ### handleStageAdd
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
    function handleStageAdd(that, stage, positions) {
        var name, curBlock;
        name = stage.id || stage.type;

        // Begin stage block.
        if (that.currentType !== "__default") that.endBlocks(2);

        that.beginBlock(positions, { id: "__enclosing_" + name });

        curBlock = that.getCurrentBlock();
        curBlock.add({
            type: "__stage",
            item: stage
        });

        that.currentType = name;

        // Add step block inside stage block.
        that.beginBlock('linear', { id: "__steps_" + name });
    }

    /**
     * ## extendStageStep
     *
     * Extends the properties of a stage step with those from an update object
     *
     * Properties of the extended stage/step are overwritten with the
     * corresponding properties of the update object. However if the
     * property of the update object is a function, it is wrapped in
     * another function that passes the old value of property of the
     * extended step/stage object as the first parameter to the
     * extending function. Any other parameters will be passed
     * along in 2nd, 3rd, etc. position.
     *
     * @param {Stager} that Stager object
     * @param {object} original The original object
     * @param {object} update The update object
     */
//     function extendStageStep(original, update) {
//         var property;
//
//         for (property in update) {
//             if (update.hasOwnProperty(property)) {
//                 // Extend function with wrapping function.
//                 if ('function' === typeof update[property]) {
//
//                     // Saving a copy of original property.
//                     saveExtendedProperty(original, property);
//
//                     (function(oldCb, newCb) {
//
//                         original[property] = function() {
//                             var args, i, len, extCopyName;
//
//
//
//                             len = arguments.length;
//                             args = new Array(len+1);
//                             args[0] = original.__extended[extCopy]
//                             switch(len) {
//                             case 1:
//                                 args[1] = arguments[0]; break;
//                             case 2:
//                                 args[1] = arguments[0];
//                                 args[2] = arguments[1]; break;
//                             case 3:
//                                 args[1] = arguments[0];
//                                 args[2] = arguments[1];
//                                 args[3] = arguments[2]; break;
//                             default:
//                                 i = -1;
//                                 for ( ; ++i < len ; ) {
//                                     args[i+1] = arguments[i];
//                                 }
//                             }
//                             newCb.apply(this, args);
//                         };
//                     })(original[property], update[property]);
//                 }
//                 // Otherwise overwrite.
//                 else {
//                     original[property] = update[property];
//                 }
//             }
//         }
//     }

    /**
     * ### setSkipStageStep
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

    // ## Block
    /**
     * ## Block constructor
     *
     * Creates a new instance of Block
     *
     * @param {string} positions Optional. Positions within the
     *      enclosing Block that this block can occupy
     * @param {object} options Optional. Configuration object
     */
    function Block(positions, options) {
        options = options || {};

        /**
         * ### Block.id
         *
         * An identifier (name) for the block instance
         */
        this.id = options.id;

        /**
         * ### Block.positions
         *
         * Positions in the enclosing Block that this block can occupy
         */
        this.positions = positions;

        /**
         * ### Block.takenPositions
         *
         * Positions within this Block that this are occupied
         */
        this.takenPositions = [];

        /**
         * ### Block.items
         *
         * The items within this Block
         */
        this.items = [];

        /**
         * ### Block.unfinishedEntries
         *
         * Items that have not been assigned a position in this block
         */
        this.unfinishedEntries = [];

        /**
         * ### Block.allItemsIds
         *
         * List of ids of all items added to the block, finished or not
         */
        this.allItemsIds = {};

         /**
         * ### Block.index
         *
         * Index of the current element to be returned by Block.next
         *
         * @see Block.next
         */
        this.index = 0;

        /**
         * ### Block.finalized
         *
         * Flag to indicate whether a block is completed
         */
        this.finalized = false;

        /**
         * ### Block.numberOfItems
         *
         * The number of items in the block
         */
        this.numberOfItems = 0;

        /**
         * ### Block.resetCache
         *
         * Cache object to reset Block after finalization
         */
        this.resetCache = null;
    }

    /**
     * ## Block.add
     *
     * Adds an item to a block
     *
     * @param {object} item. The item to be added
     * @param {string} positions. The positions where item can be added
     *   Setting this parameter to "linear" or undefined adds the
     *   item to the next free n-th position where this is the n-th
     *   call to add.
     */
    Block.prototype.add = function(item, positions) {
        if (this.finalized) {
            throw new Error('Block.add: stager already finalized, cannot add ' +
                            'further items.');
        }

        // Save the id of the added item.
        this.allItemsIds[item.item] = item;

        if ('undefined' === typeof positions || positions === 'linear') {
            this.takenPositions.push(this.numberOfItems);
            this.items[this.numberOfItems] = item;
        }
        else {
            this.unfinishedEntries.push({
                item: item,
                positions: positions
            });
        }

        ++this.numberOfItems;
    };

    /**
     * ## Block.hasItem
     *
     * Checks if an item has been previously added to block
     *
     * @param {string} item. The item to check
     *
     * @return {boolean} TRUE, if the item is found
     */
    Block.prototype.hasItem = function(item) {
        return !!this.items[item];
    };

    /**
     * ## Block.finalize
     *
     * Processes all unfinished entries, assigns each to a position
     *
     * Sets the finalized flag.
     */
    Block.prototype.finalize = function() {
        var entry, item, positions, i, len, chosenPosition;
        var available;

        if (this.finalized) return;

        available = [];

        // Range in which the indeces must be.
        for (i = 0; i < this.numberOfItems; ++i) {
            available[i] = i;
        }
        // Accounting for already taken positions.
        available = J.arrayDiff(available, this.takenPositions);

        // Parsing all of the position strings into arrays.
        i = -1, len = this.unfinishedEntries.length;
        for ( ; ++i < len ; ) {
            positions = this.unfinishedEntries[i].positions;
            this.unfinishedEntries[i].positions =
                J.range(positions, available);
        }

        // Assigning positions.
        while (this.unfinishedEntries.length > 0) {
            // Select entry with least possibilities of where to go.
            this.unfinishedEntries.sort(sortFunction);
            entry = this.unfinishedEntries.pop();
            item = entry.item;
            positions = entry.positions;

            // No valid position specified.
            if (positions.length === 0) {
                throw new Error('Block.finalize: No valid position ' +
                    'specified in Block ' + this.id + '.');
            }

            // Chose position randomly among possibilities.
            chosenPosition =  positions[
                J.randomInt(0, positions.length) - 1];
            this.items[chosenPosition] = item;
            this.takenPositions.push(chosenPosition);

            // Adjust possible positions of remaining entries.
            for (i in this.unfinishedEntries) {
                if (this.unfinishedEntries.hasOwnProperty(i)) {
                        J.removeElement(chosenPosition,
                            this.unfinishedEntries[i].positions);
                }
            }
        }
        this.finalized = true;
    };

    /**
     * ## Block.next
     *
     * Gets the next item in a hierarchy of Blocks
     *
     * If there is not next item, false is returned.
     * If the next item is another Block, next is called recursively.
     *
     * @return {object|boolean} The the item in hierarchy, or FALSE
     *   if none is found.
     */
    Block.prototype.next = function() {
        var item;
        if (this.index < this.items.length) {
            item = this.items[this.index];
            if (item instanceof Block) {
                item = item.next();
                if (item === false) {
                    this.index++;
                    return this.next();
                }
                else {
                    return item;
                }
            }
            else {
                this.index++;
                return item;
            }
        }
        return false;
    };

    /**
     * ## Block.backup
     *
     * Saves the current state of the block
     *
     * @see Block.restore
     */
    Block.prototype.backup = function() {
        this.resetCache = J.classClone({
            takenPositions: this.takenPositions,
            unfinishedEntries: this.unfinishedEntries,
            items: this.items,
            numberOfItems: this.numberOfItems
        }, 3);
    };

    /**
     * ## Block.restore
     *
     * Resets the state of the block to the latest saved state
     *
     * Even if the reset cache for the block is empty, it sets
     * index to 0 and finalized to false.
     *
     * Marks the block as not `finalized`
     *
     * @see Block.finalize
     * @see Block.finalize
     */
    Block.prototype.restore = function() {
        this.index = 0;
        this.finalized = false;
        if (!this.resetCache) return;
        this.unfinishedEntries = this.resetCache.unfinishedEntries;
        this.takenPositions = this.resetCache.takenPositions;
        this.items = this.resetCache.items;
        this.numberOfItems = this.resetCache.numberOfItems;
        this.resetCache = null;
    };

    // ## Helper Functions

    /**
     * ### sortFunction
     *
     * Sorts elements in block by number of available positions
     *
     * @api private
     */
    function sortFunction(left, right) {
        return left.positions.length < right.positions.length;
    }

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
