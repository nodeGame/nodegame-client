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
        if (stateObj) {
            if ('object' !== typeof stateObj) {
                throw new TypeError('Stager: stateObj must be object.');
            }
            this.setState(stateObj);
        }
        else {
            this.clear();
            this.init();
        }

        /**
         * ### Stager.log
         *
         * Default stdout output. Override to redirect.
         */
        this.log = console.log;
    }

    // ## Stager methods

    // ### Init / Clear

    /**
     * ## Stager.clear
     *
     * Resets Stager object to initial state
     *
     * Called by the constructor.
     */
    Stager.prototype.clear = function() {

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
         * ### Stager.defaultSteps
         *
         * Holds the default steps of each stage
         *
         * Default steps are either none if any step is defined for that
         * stage and a step with the same name as the stage otherwise.
         */
        this.defaultSteps = {};

        return this;
    };

    /**
     * ### Stager.init
     *
     * Resets sequence
     *
     * TODO: should blocks be cleared also ? Merge with clear?
     *
     * @return {Stager} this object
     */
    Stager.prototype.init = function() {
        this.sequence = [];
        this.stageBlock('linear', { id: '__default_block' });
        return this;
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

        // Clear previous state:
        if (!updateRule || updateRule === 'replace') {
            this.clear();
        }
        else if(updateRule !== 'append') {
            throw new Error('Stager.setState: invalid updateRule.');
        }

        if (!stateObj) {
            throw new Error('Stager.setState: invalid stateObj.');
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

        this.finalized = true;

    };

    /**
     * ### Stager.getState
     *
     * Returns a copy of the internal state of the Stager
     *
     * Fields of returned object:
     * steps, stages, sequence, generalNextFunction, nextFunctions,
     * defaultStepRule, defaultGlobals, defaultProperties, onInit,
     * onGameover.
     *
     * @return {object} Clone of the Stager's state
     *
     * @see Stager.setState
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
            blocks:              this.blocks
        });
    };

    /**
     * ### Stager.setDefaultStepRule
     *
     * Sets the default step-rule function
     *
     * @param {function} steprule Optional. The step-rule function.
     *   If not given, the initial default is restored.
     *
     * @see Stager.defaultStepRule
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
     * ### Stager.setDefaultGlobals
     *
     * Sets the default globals
     *
     * @param {object} defaultGlobals The map of default global
     *   variables
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
     * @param {mixed} value  The value for the default property
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


    ////// Add stages, steps.


    /**
     * ### Stager.addStep
     *
     * Adds a new step
     *
     * Registers a new game step object. This must have at least the
     * following fields:
     *
     * - id (string): The step's name
     * - cb (function): The step's callback function
     *
     * @param {object} step A valid step object. Shallowly copied.
     */
    Stager.prototype.addStep = function(step) {
        var res, unique;
        unique = true;
        res = checkStepValidity(this, step, unique);
        if (res !== null) {
            throw new Error('Stager.addStep: invalid step received: ' +
                            res + '.');
        }
        this.steps[step.id] = step;
    };

    /**
     * ### Stager.addStage
     *
     * Adds a new stage
     *
     * Registers a new game stage object. The object must have an id
     * field.
     *
     * - id (string): The stage's name
     *
     * and exactly one of the following fields:
     *
     * - steps (array of strings): The names of the steps that belong
     *   to this stage. These must have been added with the `addStep`
     *   method before this call.
     * - cb (function): The callback function. If this field is used,
     *   then a step with the same name as the stage will be created.
     *
     * @param {object} stage A valid stage or step object. Shallowly
     *    copied.
     *
     * @see Stager.checkStepValidity
     * @see Stager.checkStageValidity
     */
    Stager.prototype.addStage = function(stage) {
        var res, unique;

        if ((!stage.steps && !stage.cb) || (stage.steps && stage.cb)) {
            throw new TypeError('Stager.addStage: stage must have ' +
                                'either a steps or a cb property.');
        }

        if ('string' !== typeof stage.id) {
            throw new TypeError('Stager.addStage: id must be string.');
        }

        if (this.stages.hasOwnProperty(stage.id)) {
            throw new Error('Stager.addStage: stage id already ' +
                            'existing: ' + stage.id +
                            '. Use extendStage to modify it.');
        }

        unique = true;

        // Step.
        if (stage.cb) {
            this.addStep(stage);

            this.stages[stage.id] = {
                id: stage.id,
                steps: [ stage.id ]
            };
        }
        // Stage.
        else {

            res = checkStageValidity(this, stage);
            if (res !== null) {
                throw new Error('Stager.addStage: invalid stage ' +
                                'received: ' + res + '.');
            }

            this.stages[stage.id] = stage;
        }
    };

    /**
     * ### Stager.step
     *
     * Adds a step to the current Block.
     *
     * @param {various} stage A valid step object or the stepId string.
     * @param {string} positions Optional. Positions within the
     *      enclosing Block that this step can occupy.
     */
    Stager.prototype.step = function(step, positions) {
        if ('string' === typeof step) {
            step = {
                id: step,
                cb: function(){}
            };
        }
        this.addStep(step);
        this.getCurrentBlock().add({
            type: this.currentType,
            item: step.id
        }, positions);

        this.defaultSteps[this.currentType] = [];
        return this;
    };

    /**
     * ## Stager.handleStageAdd
     *
     * TODO: document
     *
     */
    Stager.prototype.handleStageAdd = function(stage, positions) {
        var name;
        name = stage.id || stage.type;

        // Begin stage block.
        if (this.currentType !== "__default") this.endBlocks(2);

        this.beginBlock(positions, { id: "__enclosing_" + name });

        this.getCurrentBlock().add({
            type: "__stage",
            item: stage
        });

        this.currentType = name;

        // Add step block inside stage block.
        this.beginBlock('linear', { id: "__steps_" + name });
    };

    /**
     * ### Stager.next
     *
     * Adds stage block to sequence
     *
     * The `id` parameter must have the form 'stageID' or
     * 'stageID AS alias'.
     * stageID must be a valid stage and it (or alias if given) must be
     * unique in the sequence.
     *
     * @param {string} id A valid stage name with optional alias
     *
     * @return {Stager|null} this object on success, NULL on error
     *
     * @see Stager.addStage
     */
    Stager.prototype.next = function(stage, positions) {
        var id, cb, stageName;
        if ('object' === typeof stage) {
            if ('string' !== typeof stage.id) {
                throw new TypeError('Stager.next: stage.id must be string.');
            }
            if (stage.cb && 'function' !== typeof stage.cb) {
                throw new TypeError('Stager.next: stage.cb must be function ' +
                                    'or undefined.');
            }
            id = stage.id;
            cb = stage.cb;
        }
        else {
            if ('string' !== typeof stage) {
                throw new TypeError('Stager.next: stage must be string or ' +
                                    'object.');
            }
            id = stage;
        }

        stageName = handleAlias(this, id, cb);
        if (stageName === null) {
            throw new Error('Stager.next: invalid stage name received: ' +
                           stage);
        }

        this.handleStageAdd({
            type: 'plain',
            id: stageName
        }, positions);

        // Ste: commented out.
        // if (cb) this.step({id: id, cb: cb}, '0');

        // TODO: do we need this also ?
        // this.defaultSteps[id] = [id];

        return this;
    };

    /**
     * ### Stager.repeat
     *
     * Adds repeated stage block to sequence
     *
     * @param {string} id A valid stage name with optional alias
     * @param {number} nRepeats The number of repetitions
     *
     * @return {Stager|null} this object on success, NULL on error
     *
     * @see Stager.addStage
     * @see Stager.next
     */
    Stager.prototype.repeat = function(id, nRepeats, positions) {
        var stageName = handleAlias(this, id);

        if (stageName === null) {
            throw new Error('Stager.repeat: ' +
                            'received invalid stage name.');
        }

        if ('number' !== typeof nRepeats) {
            throw new Error('Stager.repeat: ' +
                            'received invalid number of repetitions.');
        }

        this.handleStageAdd({
            type: 'repeat',
            id: stageName,
            num: nRepeats
        }, positions);

        return this;
    };

    /**
     * ### Stager.loop
     *
     * Adds looped stage block to sequence
     *
     * The given stage will be repeated as long as the `func` callback
     * returns TRUE. If it returns FALSE on the first time, the stage is
     * never executed.
     *
     * If no callback function is specified the loop is repeated
     * indefinitely.
     *
     * @param {string} id A valid stage name with optional alias
     * @param {function} func Optional. Callback returning TRUE for
     *   repetition.
     *   Default: a function that returns always TRUE
     *
     * @return {Stager|null} this object on success, NULL on error
     *
     * @see Stager.addStage
     * @see Stager.next
     * @see Stager.doLoop
     */
    Stager.prototype.loop = function(id, func, positions) {
        return addLoop(this, 'loop', id, func, positions);
    };

    /**
     * ### Stager.doLoop
     *
     * Adds alternatively looped stage block to sequence
     *
     * The given stage will be repeated once plus as many times as the
     * `func` callback returns TRUE.
     *
     * @param {string} id A valid stage name with optional alias
     * @param {function} func Optional. Callback returning TRUE for
     *   repetition.
     *   Default: a function that returns always TRUE
     *
     * @return {Stager|null} this object on success, NULL on error
     *
     * @see Stager.addStage
     * @see Stager.next
     * @see Stager.loop
     */
    Stager.prototype.doLoop = function(id, func, positions) {
        return addLoop(this, 'doLoop', id, func, positions);
    };


    /**
     * ### Stager.gameover
     *
     * Adds gameover block to sequence
     *
     * @return {Stager} this object
     */
    Stager.prototype.gameover = function(positions) {
        this.handleStageAdd({ type: 'gameover' }, positions);
        return this;
    };

    //////////// Finalize

    /**
     * ## Stager.finalize
     *
     * Builds stage and step sequence from the Block hieararchy
     */
    Stager.prototype.finalize = function() {
        var currentItem;
        var outermostBlock, type, blockIndex;

        if (this.finalized) {
            return this;
        }
        this.endAllBlocks();

        for (blockIndex = 0; blockIndex < this.blocks.length;
            ++blockIndex) {
                this.blocks[blockIndex].finalize();
        }

        // Do we really need this ???.
        for (type in this.defaultSteps) {
            if (this.defaultSteps.hasOwnProperty(type)) {
                this.stages[type].steps = J.clone(
                    this.defaultSteps[type]
                );
            }
        }

        outermostBlock = this.blocks[0];
        // Create sequence.
        currentItem = outermostBlock.next();
        while (!!currentItem) {
            if (currentItem.type === "__stage") {
                    this.sequence.push(currentItem.item);
            }
            else {
                this.stages[currentItem.type].steps.push(
                    currentItem.item);
            }
            currentItem = outermostBlock.next();
        }
        this.finalized = true;
        return this;
    };

    /**
     * ## Stager.reset
     *
     * Undoes Stager.finalize
     *
     * Allows to call Stager.finalize again to build a potentially
     * different sequence from the Block hierarchy.
     */
    Stager.prototype.reset = function() {
        var type, blockIndex;

        if (!this.finalized) {
            return this;
        }
        for (blockIndex = 0; blockIndex < this.blocks.length;
            ++blockIndex) {
            this.blocks[blockIndex].reset();
        }
        this.sequence = [];
        for (type in this.defaultSteps) {
            if (this.defaultSteps.hasOwnProperty(type)) {
                this.stages[type].steps = this.defaultSteps[type];
            }
        }

        this.finalized = false;
        return this;
    };

    //////////// Blocks

    /**
     * ## Stager.beginBlock
     *
     * Begins a new Block
     *
     * @param {string} positions Optional. Positions within the
     *       enclosing Block that this block can occupy.
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
     * Ends the current Block.
     *
     * param {object} options Optional If options.finalize is set, the
     *      block gets finalized.
     */
    Stager.prototype.endBlock = function(options) {
        var block = this.unfinishedBlocks.pop();
        var currentBlock = this.getCurrentBlock();

        options = options || {};
        if (currentBlock) {
            currentBlock.add(block, block.positions);
        }

        if (options.finalize) {
            block.finalize();
        }

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
     *      enclosing Block that this block can occupy.
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
     *      enclosing Block that this block can occupy.
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
     *      enclosing Block that this block can occupy.
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
     */
    Stager.prototype.getCurrentBlock = function(options) {
        if (this.unfinishedBlocks.length > 0) {
            return this.unfinishedBlocks[
                this.unfinishedBlocks.length -1];
        }
        return false;
    };

    ///////////// Extend, Modify


    /**
     * ### Stager.extendStep
     *
     * Extends existing step
     *
     * Extends an existing game step object. The extension object must
     * have at least an id field that matches an already existing step.
     *
     * If a valid object is provided, the fields of the new object are
     * merged into the existing object (done via JSUS.mixin). Note that
     * this overwrites already existing fields if the new object
     * redefines them.
     *
     * @param {string} stepId The id of the step to update
     * @param {object} update The object containing the properties to update
     *
     * @see Stager.addStep
     */
    Stager.prototype.extendStep = function(stepId, update) {
        var newCallback, oldCallback, attribute;
        if ('string' !== typeof stepId) {
            throw new TypeError('Stager.extendStep: stepId must be a' +
                                ' string.');
        }
        if (!update || 'object' !== typeof update) {
            throw new TypeError('Stager.extendStep: update must be' +
                                ' object.');
        }
        if (update.id) {
            throw new TypeError('Stager.extendStep: update.id must ' +
                                'be undefined.');
        }
        if (update.cb &&
            'function' !== typeof update.cb &&
            'object' !== typeof update.cb &&
            !(update.cb.cb && update.cb.extend)) {
            throw new TypeError('Stager.extendStep: update.cb must ' +
                                'be function, undefined or an object' +
                                'with the properties "extend" and' +
                                ' "cb".');
        }
        if (!this.steps[stepId]) {
            throw new Error('Stager.extendStage: stageId not found: ' +
                            stepId + '.');
        }

        for (attribute in update) {
            if (update.hasOwnProperty(attribute)) {
                if (update[attribute].extend) {
                    newCallback = update[attribute].cb;
                    oldCallback = this.steps[stepId].cb;
                    update[attribute] = function() {
                        oldCallback();
                        newCallback();
                    };
                }
            }
        }

        J.mixin(this.steps[stepId], update);
    };

    /**
     * ### Stager.extendStage
     *
     * Extends an existing stage
     *
     * Extends an existing game stage object. The updating object cannot
     * have an `id` property, and if `cb` property is set, it must be
     * function.
     *
     * If a valid object is provided, the fields of the new object are
     * merged into the existing object (done via JSUS.mixin). Note that
     * this overwrites already existing fields if the new object
     * redefines them.
     *
     * @param {string} stageId The id of the stage to update
     * @param {object} update The object containing the properties to
     *   update
     *
     * @see Stager.addStage
     */
    Stager.prototype.extendStage = function(stageId, update) {
        var attribute, newCallback, oldCallback;

        if ('string' !== typeof stageId) {
            throw new TypeError('Stager.extendStage: stageId must be ' +
                                'a string.');
        }
        if (!update || 'object' !== typeof update) {
            throw new TypeError('Stager.extendStage: update must be' +
                                ' object.');
        }
        if (update.id) {
            throw new TypeError('Stager.extendStage: update.id must ' +
                                'be undefined.');
        }
        if (update.cb &&
            'function' !== typeof update.cb &&
            'object' !== typeof update.cb &&
            !(update.cb.cb && update.cb.extend)) {
            throw new TypeError('Stager.extendStep: update.cb must ' +
                                'be function, undefined or an object' +
                                'with the properties "extend" and' +
                                ' "cb".');
        }
        if (update.steps && !J.isArray(update.steps)) {
            throw new TypeError('Stager.extendStage: update.steps ' +
                                'must be array or undefined.');
        }
        if (update.steps && update.cb) {
            throw new TypeError('Stager.extendStage: update must have' +
                                ' either a steps or a cb property.');
        }
        if (!this.stages[stageId]) {
            throw new Error('Stager.extendStage: stageId not found: ' +
                            stageId + '.');
        }

        for (attribute in update) {
            if (update.hasOwnProperty(attribute)) {
                if (update[attribute].extend) {
                    newCallback = update[attribute].cb;
                    oldCallback = this.steps[stageId].cb;
                    update[attribute] = function() {
                        oldCallback();
                        newCallback();
                    };
                }
            }
        }

        J.mixin(this.stages[stageId], update);
    };

    /**
     * ### Stager.skip
     *
     * Removes one stage from the sequence.
     *
     * @param {string} stageId The id of the stage to remove from
     *   sequence.
     * @see Stager.addStage
     */
    Stager.prototype.skip = function(stageId) {
        var i, len;
        if ('string' !== typeof stageId) {
            throw new TypeError('Stager.skip: stageId must be a' +
                                ' string.');
        }
        if (!this.stages[stageId]) {
            throw new Error('Stager.skip: stageId not found: ' +
                            stageId + '.');
        }

        i = -1, len = this.sequence.length;
        for ( ; ++i < len ; ) {
            if (this.sequence[i].id === stageId) {
                this.sequence.splice(i,1);
                break;
            }
        }
    };

    ///// Get Info out.


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
                        this.stages[seqObj.id].steps.map(
                            function(stepID) {
                                result.push(stepPrefix + stepID);
                            }
                        );
                        break;

                    case 'repeat':
                        this.stages[seqObj.id].steps.map(
                            function(stepID) {
                                result.push(stepPrefix + stepID +
                                    ' [x' + seqObj.num + ']');
                            }
                        );
                        break;

                    case 'loop':
                        this.stages[seqObj.id].steps.map(
                            function(stepID) {
                                result.push(stepPrefix +
                                            stepID + ' [loop]');
                            }
                        );
                        break;

                    case 'doLoop':
                        this.stages[seqObj.id].steps.map(
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
        var result = {
            steps: {}, stages: {}, sequence: []
        };
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
    Stager.prototype.getStepsFromStage = function(id) {
        if (!this.stages[id]) return null;
        return this.stages[id].steps;
    };


    ///// Flexible Mode

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
    function addLoop(that, type, id, func, positions) {
        var stageName = handleAlias(that, id);

        if (stageName === null) {
            throw new Error('Stager.' + type +
                            ': received invalid stage name.');
        }

        if ('undefined' === typeof func) {
            func = function() { return true; };
        }

        if ('function' !== typeof func) {
            throw new Error('Stager.' + type + ': received invalid' +
                            ' callback.');
        }

        that.handleStageAdd({
            type: type,
            id: stageName,
            cb: func
        }, positions);


        return that;
    }

    /**
     * checkStepValidity
     *
     * Returns whether given step is valid
     *
     * Checks for existence and type correctness of the fields.
     * Optionally, checks also for id uniqueness.
     *
     * @param {object} step The step object
     * @param {boolean} unique If TRUE, checks also for id uniqueness
     *
     * @return {string} NULL for valid stages, error description else
     *
     * @see Stager.addStep
     *
     * @api private
     */
    function checkStepValidity(that, step, unique) {
        if (!step)  return 'missing step object';
        if ('string' !== typeof step.id) return 'missing ID';
        if ('function' !== typeof step.cb) return 'missing callback';

        if (unique && that.steps.hasOwnProperty(step.id)) {
            return 'step ID already existing: ' + step.id +
                '. Use extendStep to modify it';
        }
        return null;
    }

    /**
     * checkStageValidity
     *
     * Returns whether given stage is valid
     *
     * Checks for existence and type correctness of the fields.
     * Checks for referenced step existence.
     *
     * @param {object} stage The stage object
     *
     * @return {string} NULL for valid stages, error description else
     *
     * @see Stager.addStage
     *
     * @api private
     */
    function checkStageValidity(that, stage, unique) {
        if (!stage) return 'missing stage object';
        if ('string' !== typeof stage.id) return 'missing ID';
        if (!stage.steps || !stage.steps.length) {
            return 'missing "steps" array';
        }

        if (unique && that.stages.hasOwnProperty(stage.id)) {
            return 'stage id already existing: ' + stage.id +
                '. Use extendStage to modify it';
        }

        // Check whether the all referenced steps exist.
        for (var i = 0; i < stage.steps.length; ++i) {
            if (!that.steps[stage.steps[i]]) {
                return 'unknown step "' + stage.steps[i] + '"';
            }
        }
        return null;
    }

    /**
     * handleAlias
     *
     * Handles stage id and alias strings
     *
     * Takes a string like 'stageID' or 'stageID AS alias' and registers
     * the alias, if existent. Checks whether parameter is valid and unique.
     *
     * @param {object} that Reference to Stager object
     * @param {string} nameAndAlias The stage-name string
     * @param {function} cb Optional. The callback for the stage
     *
     * @return {string} the alias part of the parameter if it exists,
     *  the stageID part otherwise
     *
     * @see Stager.next
     *
     * @api private
     */
    function handleAlias(that, nameAndAlias, cb) {
        var tokens = nameAndAlias.split(' AS ');
        var id = tokens[0].trim();
        var alias = tokens[1] ? tokens[1].trim() : undefined;
        var stageName = alias || id;
        var seqIdx;

        // Check ID validity:
        if (!that.stages[id]) {
            that.addStage({
                id: id,
                cb: cb || function() {
                    this.node.log(this.getCurrentStepObj().id);
                    this.node.done();
                }
            });
        }

        // Check uniqueness:
        for (seqIdx in that.sequence) {
            if (that.sequence.hasOwnProperty(seqIdx) &&
                that.sequence[seqIdx].id === stageName) {
                throw new Error('Stager.handleAlias: ' +
                                'received non-unique stage name.');
            }
        }

        // Add alias:
        if (alias) {
            that.stages[alias] = that.stages[id];
            return alias;
        }

        return id;
    }


    // ## Block
    /**
     * ## Block constructor
     *
     * Creates a new instance of Block
     *
     * @param {string} positions Optional. Positions within the
     *      enclosing Block that this block can occupy.
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
         * ### Block.tajenPositions
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
     *      Setting this parameter to "linear" or undefined adds the
     *      item to the next free n-th position where this is the n-th
     *      call to add.
     */
    Block.prototype.add = function(item, positions) {
        if (this.finalized) {
            throw new Error("Block.add: Cannot add items after" +
                            " finalization.");
        }

        if ("undefined" === typeof positions ||
            positions === "linear") {
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
     * ## Block.finalize
     *
     * Processes all unfinished entries, assigns each to a position
     */
    Block.prototype.finalize = function() {
        var entry, item, positions, i, chosenPosition;
        var available = [];
        var sortFunction = function(left, right) {
            return left.positions.length < right.positions.length;
        };

        if (this.finalized) {
            return;
        }
        // Cache the current state before finalization for later reset.
        this.resetCache = J.classClone({
            takenPositions: this.takenPositions,
            unfinishedEntries: this.unfinishedEntries,
            items: this.items
        },3);

        // Range in which the indeces must be.
        for (i = 0; i < this.numberOfItems; ++i) {
            available[i] = i;
        }
        // Accounting for already taken positions.
        available = J.arrayDiff(available, this.takenPositions);

        // Parseing all of the position strings into arrays.
        for (i in this.unfinishedEntries) {
            if (this.unfinishedEntries.hasOwnProperty(i)) {
                positions = this.unfinishedEntries[i].positions;
                this.unfinishedEntries[i].positions =
                    J.range(positions, available);
            }
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
                throw new Error("Block.finalize: No valid position " +
                    "specified in Block " + this.id);
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
        return this;
    };

    /**
     * ## Block.next
     *
     * Gets the next item in a hierarchy of Blocks
     *
     * If there is not next item, false is returned.
     * If the next item is not a Block it is returned, otherwise next is
     *  called recursively.
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
     * ## Block.reset
     *
     * Reset the Block to the state before finalization
     *
     * @see Block.finalize
     */
    Block.prototype.reset = function() {
        this.unfinishedEntries = this.resetCache.unfinishedEntries;
        this.takenPositions = this.resetCache.takenPositions;
        this.items = this.resetCache.items;
        this.index = 0;
        this.finalized = false;

        return this;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
