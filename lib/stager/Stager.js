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
 * The sequence of blocks always begins with the default block:
 *
 * ```js
 * { type: '__stageBlock_',
     id: '__default',
     positions: 'linear',
     takenPositions: Array(0),
     items: Array(0),
     itemsIds: {},
     unfinishedItems: [],
     index: 0,
     finalized: false,
     resetCache: null
  }
* ```
*
* which will contain all the others.
*
* A block


> stager.blocks[1]
{ type: '__enclosing_stages',
  id: '__enclosing_distr_groups_1',
  positions: 'linear',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[2]
{ type: '__enclosing_steps',
  id: '__enclosing_distr_groups_steps_1',
  positions: 'linear',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[3]
{ type: '__stepBlock_',
  id: 'Intro Groups',
  positions: '*',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[4]
{ type: '__stepBlock_',
  id: 'Between Groups',
  positions: '*',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[5]
{ type: '__stepBlock_',
  id: 'Within Groups',
  positions: '*',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[6]
{ type: '__enclosing_stages',
  id: '__enclosing_justification_3',
  positions: 'linear',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[7]
{ type: '__enclosing_steps',
  id: '__enclosing_justification_steps_3',
  positions: 'linear',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[8]
{ type: '__enclosing_stages',
  id: '__enclosing_feedback_4',
  positions: 'linear',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[9]
{ type: '__enclosing_steps',
  id: '__enclosing_feedback_steps_4',
  positions: 'linear',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[10]
{ type: '__enclosing_stages',
  id: '__enclosing_end_5',
  positions: 'linear',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[11]
{ type: '__enclosing_steps',
  id: '__enclosing_end_steps_5',
  positions: 'linear',
  takenPositions: Array(0),
  items: Array(0),
  ... }
> stager.blocks[12]
{ type: '__enclosing_stages',
  id: '__enclosing_gameover_6',
  positions: 'linear',
  takenPositions: Array(0),
  items: Array(0),
  ... }

 * and unfinshed blocks:

 < [
<   Block {
<     type: '__stageBlock_',
<     id: '__default',
<     positions: 'linear',
<     takenPositions: [],
<     items: [],
<     itemsIds: {},
<     unfinishedItems: [],
<     index: 0,
<     finalized: false,
<     resetCache: null
<   },
<   Block {
<     type: '__enclosing_stages',
<     id: '__enclosing_distr_groups_1',
<     positions: 'linear',
<     takenPositions: [],
<     items: [],
<     itemsIds: { distr_groups: true },
<     unfinishedItems: [ [Object] ],
<     index: 0,
<     finalized: false,
<     resetCache: null
<   },
<   Block {
<     type: '__enclosing_steps',
<     id: '__enclosing_distr_groups_steps_1',
<     positions: 'linear',
<     takenPositions: [],
<     items: [],
<     itemsIds: {
<       distr_groups: true,
<       'Within Groups': true,
<       'Between Groups': true
<     },
<     unfinishedItems: [ [Object], [Object], [Object] ],
<     index: 0,
<     finalized: false,
<     resetCache: null
<   },
<   Block {
<     type: '__stepBlock_',
<     id: 'Intro Groups',
<     positions: '*',
<     takenPositions: [],
<     items: [],
<     itemsIds: {
<       groups_intro: true,
<       groups_intro_treatment: true,
<       tutorial_groups_quiz: true,
<       tutorial_groups: true,
<       groups_task: true,
<       __enclosing_justification_3: true,
<       __enclosing_feedback_4: true,
<       __enclosing_end_5: true
<     },
<     unfinishedItems: [
<       [Object], [Object],
<       [Object], [Object],
<       [Object], [Object],
<       [Object], [Object]
<     ],
<     index: 0,
<     finalized: false,
<     resetCache: null
<   },
<   Block {
<     type: '__enclosing_stages',
<     id: '__enclosing_gameover_6',
<     positions: 'linear',
<     takenPositions: [],
<     items: [],
<     itemsIds: { gameover: true },
<     unfinishedItems: [ [Object] ],
<     index: 0,
<     finalized: false,
<     resetCache: null
<   },
<   Block {
<     type: '__enclosing_steps',
<     id: '__enclosing_gameover_steps_6',
<     positions: 'linear',
<     takenPositions: [],
<     items: [],
<     itemsIds: {},
<     unfinishedItems: [],
<     index: 0,
<     finalized: false,
<     resetCache: null
<   }
< ]


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
     * ## Stager Constructor
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
         * #### Stager.steps
         *
         * Maps step ids to step objects
         *
         * Format:
         *
         * ```js
         * {
         *     oneStep:  { id: 'stepId', cb: function() { ... } },
         *     anotherStep: { id: 'anotherStep', cb: function() { ... } }
         * }
         * ```
         *
         * @see Stager.addStep
         */
        this.steps = {};

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
         *     oneStep:  { id: 'stepId', steps: [ { ...  } },
         *     anotherStep: { id: 'anotherStep', steps: [ { ... } ] }
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
         * #### Stager.finalized
         *
         * Flag indicating if the hierarchy of has been set
         *
         * Indicates if the hierarchy of stages and steps has been set.
         */
        this.finalized = false;

        /**
         * #### Stager.currentType
         *
         * Name of the stage currently worked with in building hierarchy
         */
        this.currentType = blockTypes.BLOCK_DEFAULT;

        /**
         * #### Stager.currentBlockType
         *
         * Indicates what type of Block was added last
         */
        this.currentBlockType = blockTypes.BLOCK_DEFAULT;

        /**
         * #### Stager.toSkip
         *
         * List of stages and steps to skip when building the sequence
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
        this.currentType = blockTypes.BLOCK_DEFAULT;
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
     * Builds stage and step sequence from the Block hieararchy
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
        while (!!currentItem) {
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
