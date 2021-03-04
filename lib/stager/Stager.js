/**
 * # Stager
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Builds and store the game sequence.
 *
 * The game sequence is a sequence of blocks which can be moved around
 * until they are finalized.
 *
 * Blocks are generic containers and can contain steps, stages, and
 * even other blocks.
 *
 * ## Stager Technical Guide
 *
 * ### The Default block.
 *
 * The sequence of blocks always begins with the default block:
 *
 * ```js
 * {
 *     type: '__stageBlock_',
 *     id: '__default',
 *     positions: 'linear',
 *     takenPositions: Array(0),
 *     items: Array(0),
 *     itemsIds: {},
 *     unfinishedItems: [],
 *     index: 0,
 *     finalized: false,
 *     resetCache: null
 *  }
 * ```
 *
 * which will contain all the other blocks. This block is added to both:
 *
 * - `Stager.blocks`, and
 * - `Stager.unfinishedBlocks`.
 *
 *
 * We test now this sequence and how it affects the stager internals.
 *
 * ```js
 * stager.stage('myStage')
 * stager.step('myStep')
 * stager.stage('anotherStage')
 * stager.stageBlock('myStageBlock', 'linear')
 * stager.stage('stageInBlock')
 * stager.stage('stageInBlock2')
 * stager.stepBlock('myStepBlock', 'linear')
 * stager.step('stepInBlock')
 * stager.step('stepInBlock2')
 * stager.stepBlock('anotherStepBlock', 'linear')
 * stager.step('anotherStepInBlock')
 * stager.step('anotherStepInBlock2')
 * stager.stage('stageInBlock3')
 * stager.stageBlock('anotherStageBlock', 'linear')
 * stager.stage('lastStageInBlock')
 * ```
 *
 * ### Adding a first stage
 *
 * If we add a stage with
 *
 * ```js
 * stager.stage('myStage');
 * ```
 *
 * two blocks are added:
 *
 * ```js
 * {
 *     type: '__enclosing_stages',
 *     id: '__enclosing_myStage_1',
 *     positions: 'linear',
 *     ...
 * },
 * { type: '__enclosing_steps',
 *   id: '__enclosing_myStage_steps_1',
 *   positions: 'linear',
 *   ...
 * }
 * ```
 *
 * to both `blocks` and `unfinishedBlocks`.
 *
 * ### Adding a first step inside the stage
 *
 * If we add a step with
 *
 * ```js
 * stager.step('myStep');
 * ```
 *
 * no new blocks are added, but one item is added inside the `unfinishedItems`
 * array of the last open block ('__enclosing_myStage_steps_1').
 *
 * Note! When the user adds the first step to a stage, it is actually the second
 * item in the `unfinishedItems` array. The first one the default step named
 * after the name of the stage. This default item will be removed upon
 * finalizing the stage (if there are other steps in the stage)
 *
 * Any other step added inside the stage will add an item in the
 * `unfinishedItems` array.
 *
 *
 * ### Adding a second stage
 *
 * If we add another stage with
 *
 * ```js
 * stager.stage('anotherStage');
 * ```
 *
 * two blocks are added to the `blocks` array:
 *
 * ```js
 * {
 *    type: '__enclosing_stages',
 *    id: '__enclosing_anotherStage_2',
 *    positions: 'linear',
 *    ...
 * },
 * {
 *   type: '__enclosing_steps',
 *   id: '__enclosing_anotherStage_steps_2',
 *   positions: 'linear',
 *   ...
 * }
 * ```
 *
 * The last two blocks in the `unfinishedBlocks` array removed, and two new
 * ones for the new stage are added.
 *
 *
 * ### Adding a first stage block
 *
 * If we add a stage block with:
 *
 * ```js
 * stager.stageBlock('myStageBlock', 'linear');
 * ```
 *
 * one block is added to the `blocks` array:
 *
 * ```js
 * {
 * type: '__stageBlock_',
 * id: 'First StageBlock',
 * positions: 'linear',
 * ...
 * }
 * ```
 *
 * The last block in the `unfinishedBlocks` array is removed (for the steps
 * of the previous stage), and a new one for the new stage block is added
 * No enclosing stages and steps blocks added yet.
 *
 *
 * ### Adding one stage within a stage block
 *
 * If we add a stage in the block with:
 *
 * ```js
 * stager.stage('stageInBlock');
 * ```
 *
 * two blocks are added to the `blocks` array:
 *
 * ```js
 {
     type: '__enclosing_stages',
     id: '__enclosing_stageInBlock_3',
     positions: 'linear',
     ...
 },
 {
    type: '__enclosing_steps',
    id: '__enclosing_stageInBlock_steps_3',
    positions: 'linear',
    ...
 }
 * ```
 *
 * to both `blocks` and `unfinishedBlocks`. The two last blocks from
 * `unfinishedBlocks` are removed before (the stage-block enclosing this stage
 * and the stage from previous block). ??? TODO CHECK whether this makes sense.
 *
 * Adding another stage within the stage block will behave the same way,
 * will remove the current last two blocks from the `unfinishedBlocks` array
 * and replaced with two blocks for the new stage.
 *
 *
 * ### Adding a step block inside a stage
 *
 * If we add a step block inside a stage with:
 *
 * ```js
 *     stager.stepBlock('myStepBlock', 'linear');
 * ```
 *
 * Adds a new block:
 *
 * ```js
 * {
 *     type: '__stepBlock_',
 *     id: 'myStepBlock',
 *     positions: 'linear',
 *     ...
 * }
 * ```
 *
 * to both `blocks` and `unfinishedBlocks`. No block is removed from
 * the `unfinishedBlocks` array.
 *
 *
 * ### Adding a step inside the step block
 *
 *  If we add a step inside the step block with:
 *
 * ```js
 *     stager.step('stepInBlock');
 * ```
 *
 * no new blocks are added, but one item is added inside the `unfinishedItems`
 * array of the last open block ('myStepBlock').
 *
 * ```js
 * {
 *    type: 'stageInBlock2',
 *    item: 'stepInBlock',
 *    id: 'stepInBlock'
 * }
 * ```
 *
 * Further steps in the same step block will add new items here.
 *
 *
 * ### Adding another step block inside a stage
 *
 * If we add an additional step block inside a stage with:
 *
 * ```js
 *     stager.stepBlock('anotherStepBlock', 'linear');
 * ```
 *
 * Adds a new block:
 *
 * ```js
 * {
 *     type: '__stepBlock_',
 *     id: 'anotherStepBlock',
 *     positions: 'linear',
 *     ...
 * }
 * ```
 *
 * to both `blocks` and `unfinishedBlocks`. No block is removed from
 * the `unfinishedBlocks` array.
 *
 * ### Adding another stage after a step block
 *
 * If we add another stage with
 *
 * ```js
 * stager.stage('stageInBlock3');
 * ```
 *
 * two blocks are added to the `blocks` array:
 *
 * ```js
 * {
 *    type: '__enclosing_stages',
 *    id: '__enclosing_stageInBlock3_6',
 *    positions: 'linear',
 *    ...
 * },
 * {
 *   type: '__enclosing_steps',
 *   id: '__enclosing_stageInBlock3_steps_6',
 *   positions: 'linear',
 *   ...
 * }
 * ```
 *
 * The last two blocks in the `unfinishedBlocks` array plus all step blocks
 * (in total 4 blocks) are removed, and two new ones for the new
 * stage are added.
 *
 *
 * ### Adding a second stage block
 *
 * If we add a second stage block with:
 *
 * ```js
 * stager.stageBlock('anotherStageBlock', 'linear');
 * ```
 *
 * one block is added to the `blocks` array:
 *
 * ```js
 * {
 * type: '__stageBlock_',
 * id: 'anotherStageBlock',
 * positions: 'linear',
 * ...
 * }
 * ```
 *
 * The last block in the `unfinishedBlocks` array is removed (for the steps
 * of the previous stage), and a new one for the new stage block is added
 * No enclosing stages and steps blocks added yet.
 *
 *
 * ### Adding one stage within the second stage block
 *
 * If we add a stage in the block with:
 *
 * ```js
 * stager.stage('stageInBlock');
 * ```
 *
 * two blocks are added to the `blocks` array:
 *
 * ```js
 {
     type: '__enclosing_stages',
     id: '__enclosing_stageInBlock_3',
     positions: 'linear',
     ...
 },
 {
    type: '__enclosing_steps',
    id: '__enclosing_stageInBlock_steps_3',
    positions: 'linear',
    ...
 }
 * ```
 *
 * to both `blocks` and `unfinishedBlocks`. The two last blocks from
 * `unfinishedBlocks` are removed before (the stage-block enclosing this stage
 * and the stage from previous block). ??? TODO CHECK whether this makes sense.
 *
 * Adding another stage within the stage block will behave the same way,
 * will remove the current last two blocks from the `unfinishedBlocks` array
 * and replaced with two blocks for the new stage.
 *
 *
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    var J = parent.JSUS;

    // What is in the Stager obj at this point.
    var tmpStager = parent.Stager
    // Add it to the Stager class.
    J.mixin(Stager, tmpStager);
    // Export the Stager class.
    exports.Stager = Stager;

    // Referencing shared entities.
    var blockTypes = Stager.blockTypes;
    var isDefaultStep = Stager.isDefaultStep;

    // ## Static Methods

    /**
     * #### Stager.defaultCallback
     *
     * Default callback added to steps when none is specified
     *
     * @see Stager.setDefaultCallback
     * @see Stager.getDefaultCallback
     */
    Stager.defaultCallback = function() {
        this.node.log(this.getCurrentStepObj().id);
    };

    // Flag it as `default`.
    Stager.makeDefaultCb(Stager.defaultCallback);

    /**
     * ## Stager constructor
     *
     * Creates a new instance of Stager
     *
     * @param {object} stateObj Optional. State to initialize the new
     *   Stager object.
     *
     * @see Stager.setState
     */
    function Stager(stateObj) {

        // ## Properties

        /**
        * #### Stager.sequence
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
         * #### Stager.stages
         *
         * Maps stage ids to stage objects
         *
         * Each stage object contains an array of steps referencing an object
         * in `Stager.steps`.
         *
         * Format:
         *
         * ```js
         * {
         *     oneStage:  { id: 'oneStage', steps: [ { ...  } },
         *     anotherStage: { id: 'anotherStage', steps: [ { ... } ] }
         * }
         * ```
         *
         * Stage aliases are stored the same way, with a reference to
         * the original stage object as the value.
         *
         * @see Stager.steps
         * @see Stager.addStage
         */
        this.stages = {};

        /**
         * #### Stager.steps
         *
         * Maps step ids to step objects
         *
         * Format:
         *
         * ```js
         * {
         *     oneStep:  { id: 'oneStep', cb: function() { ... } },
         *     anotherStep: { id: 'anotherStep', cb: function() { ... } }
         * }
         * ```
         *
         * @see Stager.addStep
         */
        this.steps = {};

        /**
         * #### Stager.blocks
         *
         * Array of blocks in the order they were added to the stager
         */
        this.blocks = [];

        /**
         * #### Stager.blocksIds
         *
         * Map block-id to block-position in the blocks array
         *
         * @see blocks
         */
        this.blocksIds = {};

        /**
         * #### Stager.unfinishedBlocks
         *
         * List of all Blocks stager might still modify
         */
        this.unfinishedBlocks = [];

        /**
         * #### Stager.openStepBlocks
         *
         * Number of step blocks that need to be closed when the stage is closed
         *
         * @see addStageBlock
         */
        this.openStepBlocks = 0;

        /**
         * #### Stager.currentStage
         *
         * Name of the current stage in the blocks' hierarchy
         */
        this.currentStage = blockTypes.BLOCK_DEFAULT;

        /**
         * #### Stager.currentBlockType
         *
         * The type of block tharwas added last
         *
         * @see blockTypes
         */
        this.currentBlockType = blockTypes.BLOCK_DEFAULT;

        /**
         * #### Stager.generalNextFunction
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
         * #### Stager.nextFunctions
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
         * #### Stager.defaultStepRule
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
         * #### Stager.defaultGlobals
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
         * #### Stager.defaultProperties
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
         * #### Stager.onInit
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
         * #### Stager.onGameover
         *
         * Cleaning up function
         *
         * This function is called after the last stage of the gamePlot
         * is terminated.
         */
        this.onGameover = null;


        /**
         * #### Stager.finalized
         *
         * Flag indicating if the hierarchy of has been set
         *
         * Indicates if the hierarchy of stages and steps has been set.
         */
        this.finalized = false;



        /**
         * #### Stager.toSkip
         *
         * List of stages and steps to skip when building the sequence
         *
         * Skipped steps are stored as "stageId.stepId".
         *
         * If a stage/step is unskipped, its entry is set to null.
         *
         * @see Stager.skip
         * @see Stager.unskip
         */
        this.toSkip = {
            stages: {},
            steps: {}
        };

        /**
         * #### Stager.defaultCallback
         *
         * Default callback assigned to a step if none is provided
         */
        this.defaultCallback = Stager.defaultCallback;

        /**
         * #### Stager.cacheReset
         *
         * Cache used to reset the state of the stager after finalization
         */
        this.cacheReset = {
            unfinishedBlocks: []
        };

        /**
         * #### Stager.log
         *
         * Default standard output. Override to redirect.
         */
        this.log = console.log;

        // Set the state if one is passed.
        if (stateObj) {
            if ('object' !== typeof stateObj) {
                throw new TypeError('Stager: stateObj must be object. ' +
                'Found: ' + stateObj);
            }
            this.setState(stateObj);
        }
        else {
            // Add first block.
            this.stageBlock(blockTypes.BLOCK_DEFAULT, 'linear');
        }
    }

    // ## Methods

    // ### Clear, init, finalize, reset.

    /**
     * #### Stager.clear
     *
     * Clears the state of the stager
     *
     * @return {Stager} this object
     */
    Stager.prototype.clear = function() {
        this.steps = {};
        this.stages = {};
        this.sequence = [];
        this.openStepBlocks = 0;
        this.generalNextFunction = null;
        this.nextFunctions = {};
        this.setDefaultStepRule();
        this.defaultGlobals = {};
        this.defaultProperties = {};
        this.onInit = null;
        this.onGameover = null;
        this.blocks = [];
        this.blocksIds = {};
        this.unfinishedBlocks = [];
        this.finalized = false;
        this.currentStage = blockTypes.BLOCK_DEFAULT;
        this.currentBlockType = blockTypes.BLOCK_DEFAULT;
        this.toSkip = { stages: {}, steps: {} };
        this.defaultCallback = Stager.defaultCallback;
        this.cacheReset = { unfinishedBlocks: [] };
        return this;
    };

    /**
     * #### Stager.init
     *
     * Clears the state of the stager and adds a default block
     *
     * @return {Stager} this object
     *
     * @see Stager.clear
     */
    Stager.prototype.init = function() {
        this.clear();
        this.stageBlock(blockTypes.BLOCK_DEFAULT, 'linear');
        return this;
    };

    /**
     * #### Stager.finalize
     *
     * Builds stage and step sequence from the blocks' hieararchy
     *
     * Stages and steps are excluded from the sequence if they were marked
     * as _toSkip_.
     *
     * Steps are excluded from the sequence if they were added as
     * _default step_, but then other steps have been added to the same stage.
     *
     * @see Stager.reset
     */
    Stager.prototype.finalize = function() {
        var currentItem, stageId, stepId;
        var outermostBlock, blockIndex;
        var i, len, seqItem;

        // Already finalized.
        if (this.finalized) return;

        // Nothing to do, finalize called too early.
        if (!this.blocks.length) return;

        // Cache the ids of unfinishedBlocks for future calls to .reset.
        i = -1, len = this.unfinishedBlocks.length;
        for ( ; ++i < len ; ) {
            this.cacheReset.unfinishedBlocks.push(this.unfinishedBlocks[i].id);
        }

        // Need to backup all blocks before calling endAllBlocks().
        for (blockIndex = 0; blockIndex < this.blocks.length; ++blockIndex) {
            this.blocks[blockIndex].backup();
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
        while (currentItem) {
            if (currentItem.type === blockTypes.BLOCK_STAGE) {
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

                // 1 - Step was marked as `toSkip`.
                if (!this.isSkipped(stageId, stepId) &&

                    // 2 - Step was a default step,
                    //     but other steps have been added.
                    (!isDefaultStep(this.steps[stepId]) ||
                     this.stages[stageId].steps.length === 1)) {

                    // Ok, add the step to the sequence (must look up stage).
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
     * #### Stager.reset
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
        var blockIdx, i, len;

        if (!this.finalized) return this;

        // Restore unfinishedBlocks, if any.
        len = this.cacheReset.unfinishedBlocks.length;
        if (len) {
            // Copy by reference cached blocks.
            i = -1;
            for ( ; ++i < len ; ) {
                blockIdx = this.blocksIds[this.cacheReset.unfinishedBlocks[i]];
                this.unfinishedBlocks.push(this.blocks[blockIdx]);
            }
            this.cacheReset = { unfinishedBlocks: []};
        }
        // End restore unfinishedBlocks.

        // Call restore on individual blocks.
        for (blockIdx = 0; blockIdx < this.blocks.length; ++blockIdx) {
            this.blocks[blockIdx].restore();
        }

        this.sequence = [];
        this.finalized = false;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
