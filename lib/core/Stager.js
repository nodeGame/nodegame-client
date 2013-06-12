/**
 * # Stager
 *
 * `nodeGame` container and builder of the game sequence
 *
 * ---
 */
(function(exports, node) {

// ## Global scope
exports.Stager = Stager;

/**
 * ## Stager constructor
 *
 * Creates a new instance of Stager
 *
 * @param {object} stateObj Optional. State to initialize the new Stager
 *  object with. See `Stager.setState`.
 *
 * @see Stager.setState
 */
function Stager(stateObj) {
    if (stateObj) {
        this.setState(stateObj);
    }
    else {
        this.clear();
    }
}

// ## Stager methods

/**
 * ### Stager.clear
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
     * Stage aliases are stored the same way, with a reference to the original
     * stage object as the value.
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
     * Stores functions to be called to yield the id of the next game stage
     * for a specific previous stage.
     *
     * @see Stager.registerNext
     */
    this.nextFunctions = {};


    /**
     * ### Stager.defaultStepRule
     *
     * Default step-rule function
     *
     * This function decides whether it is possible to proceed to the next
     * step/stage. If a step/stage object defines a `steprule` property,
     * then that function is used instead.
     *
     * @see Stager.setDefaultStepRule
     * @see Stager.getDefaultStepRule
     * @see GamePlot.getStepRule
     */
    this.setDefaultStepRule();


    /**
     * ### Stager.defaultGlobals
     *
     * Defaults of global variables
     *
     * This map holds the default values of global variables. These values are
     * overridable by more specific version in step and stage objects.
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
     * This map holds the default values of properties. These values are
     * overridable by more specific version in step and stage objects.
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

    return this;
};

/**
 * ### Stager.registerGeneralNext
 *
 * Sets general callback for next stage decision
 *
 * Available only when nodegame is executed in _flexible_ mode.
 * The callback given here is used to determine the next stage.
 *
 * @param {function|null} func The decider callback.  It should return the name of
 *  the next stage, 'NODEGAME_GAMEOVER' to end the game or FALSE for sequence end.
 *  NULL can be given to signify non-existence.
 *
 * @return {boolean} TRUE on success, FALSE on error
 */
Stager.prototype.registerGeneralNext = function(func) {
    if (func !== null && 'function' !== typeof func) {
        node.warn("registerGeneralNext didn't receive function parameter");
        return false;
    }

    this.generalNextFunction = func;
    return true;
};

/**
 * ### Stager.registerNext
 *
 * Registers a step-decider callback for a specific stage
 *
 * The function overrides the general callback for the specific stage,
 * and determines the next stage.
 * Available only when nodegame is executed in _flexible_ mode.
 *
 * @param {string} id The name of the stage after which the decider function will be called
 * @param {function} func The decider callback.  It should return the name of
 *  the next stage, 'NODEGAME_GAMEOVER' to end the game or FALSE for sequence end.
 *
 * @return {boolean} TRUE on success, FALSE on error
 *
 * @see Stager.registerGeneralNext
 */
Stager.prototype.registerNext = function(id, func) {
    if ('function' !== typeof func) {
        node.warn("registerNext didn't receive function parameter");
        return false;
    }

    if (!this.stages[id]) {
        node.warn('registerNext received nonexistent stage id');
        return false;
    }

    this.nextFunctions[id] = func;
    return true;
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
 *
 * @return {boolean} TRUE on success, FALSE on error
 */
Stager.prototype.setDefaultStepRule = function(steprule) {
    if (steprule) {
        if ('function' !== typeof steprule) {
            node.warn("setDefaultStepRule didn't receive function parameter");
            return false;
        }

        this.defaultStepRule = steprule;
    }
    else {
        // Initial default:
        this.defaultStepRule = function() { return true; };
    }

    return true;
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
 * @param {object} defaultGlobals The map of default global variables
 *
 * @return {boolean} TRUE on success, FALSE on error
 *
 * @see Stager.defaultGlobals
 * @see GamePlot.getGlobal
 */
Stager.prototype.setDefaultGlobals = function(defaultGlobals) {
    if (!defaultGlobals || 'object' !== typeof defaultGlobals) {
        node.warn("setDefaultGlobals didn't receive object parameter");
        return false;
    }

    this.defaultGlobals = defaultGlobals;
    return true;
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
 * ### Stager.setDefaultProperties
 *
 * Sets the default properties
 *
 * @param {object} defaultProperties The map of default properties
 *
 * @return {boolean} TRUE on success, FALSE on error
 *
 * @see Stager.defaultProperties
 * @see GamePlot.getProperty
 */
Stager.prototype.setDefaultProperties = function(defaultProperties) {
    if (!defaultProperties || 'object' !== typeof defaultProperties) {
        node.warn("setDefaultProperties didn't receive object parameter");
        return false;
    }

    this.defaultProperties = defaultProperties;
    return true;
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
 *  NULL can be given to signify non-existence.
 *
 * @return {boolean} TRUE on success, FALSE on error
 *
 * @see Stager.onInit
 */
Stager.prototype.setOnInit = function(func) {
    if (func !== null && 'function' !== typeof func) {
        node.warn("setOnInit didn't receive function parameter");
        return false;
    }

    this.onInit = func;
    return true;
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
 *  NULL can be given to signify non-existence.
 *
 * @return {boolean} TRUE on success, FALSE on error
 *
 * @see Stager.onGameover
 */
Stager.prototype.setOnGameover = function(func) {
    if (func !== null && 'function' !== typeof func) {
        node.warn("setOnGameover didn't receive function parameter");
        return false;
    }

    this.onGameover = func;
    return true;
};

/**
 * ### Stager.setOnGameOver
 * 
 * Alias for `setOnGameover` 
 *
 * A rescue net in case of human error.
 *
 * @see Stager.setOnGameover
 */
Stager.prototype.setOnGameOver = Stager.prototype.setOnGameover;

/**
 * ### Stager.getOnGameover
 *
 * Gets onGameover function
 *
 * @return {function|null} The onGameover function.
 *  NULL signifies non-existence.
 *
 * @see Stager.onGameover
 */
Stager.prototype.getOnGameover = function(func) {
    return this.onGameover;
};

/**
 * ### Stager.addStep
 *
 * Adds a new step
 *
 * Registers a new game step object.  This must have at least the following fields:
 *
 *  - id (string): The step's name
 *  - cb (function): The step's callback function
 *
 * @param {object} step A valid step object.  Shallowly copied.
 *
 * @return {boolean} TRUE on success, FALSE on error
 */
Stager.prototype.addStep = function(step) {
    if (!this.checkStepValidity(step)) {
        node.warn('addStep received invalid step');
        return false;
    }

    this.steps[step.id] = step;
    return true;
};

/**
 * ### Stager.addStage
 *
 * Adds a new stage
 *
 * Registers a new game stage object. This must have at least the following fields:
 *
 *  - id (string): The stage's name
 *  - steps (array of strings): The names of the steps that belong to this stage.
 *     These must have been added with the `addStep` method before this call.
 *
 * Alternatively, a step object may be given.  Then that step and a stage
 * containing only that step are added.
 *
 * @param {object} stage A valid stage or step object.  Shallowly copied.
 *
 * @return {boolean} TRUE on success, FALSE on error
 *
 * @see Stager.addStep
 */
Stager.prototype.addStage = function(stage) {
    // Handle wrapped steps:
    if (this.checkStepValidity(stage)) {
        if (!this.addStep(stage)) return false;
        if (!this.addStage({
            id: stage.id,
            steps: [ stage.id ]
        })) return false;

        return true;
    }

    if (!this.checkStageValidity(stage)) {
        node.warn('addStage received invalid stage');
        return false;
    }

    this.stages[stage.id] = stage;
    return true;
};

/**
 * ### Stager.init
 *
 * Resets sequence
 *
 * @return {Stager} this object
 */
Stager.prototype.init = function() {
    this.sequence = [];

    return this;
};

/**
 * ### Stager.gameover
 *
 * Adds gameover block to sequence
 *
 * @return {Stager} this object
 */
Stager.prototype.gameover = function() {
    this.sequence.push({ type: 'gameover' });

    return this;
};

/**
 * ### Stager.next
 *
 * Adds stage block to sequence
 *
 * The `id` parameter must have the form 'stageID' or 'stageID AS alias'.
 * stageID must be a valid stage and it (or alias if given) must be unique
 * in the sequence.
 *
 * @param {string} id A valid stage name with optional alias
 *
 * @return {Stager|null} this object on success, NULL on error
 *
 * @see Stager.addStage
 */
Stager.prototype.next = function(id) {
    var stageName = this.handleAlias(id);

    if (stageName === null) {
        node.warn('next received invalid stage name');
        return null;
    }

    this.sequence.push({
        type: 'plain',
        id: stageName
    });

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
Stager.prototype.repeat = function(id, nRepeats) {
    var stageName = this.handleAlias(id);

    if (stageName === null) {
        node.warn('repeat received invalid stage name');
        return null;
    }

    if ('number' !== typeof nRepeats) {
        node.warn('repeat received invalid number of repetitions');
        return null;
    }

    this.sequence.push({
        type: 'repeat',
        id: stageName,
        num: nRepeats
    });

    return this;
};

/**
 * ### Stager.loop
 *
 * Adds looped stage block to sequence
 *
 * The given stage will be repeated as long as the `func` callback returns TRUE.
 * If it returns FALSE on the first time, the stage is never executed.
 *
 * @param {string} id A valid stage name with optional alias
 * @param {function} func Callback returning TRUE for repetition
 *
 * @return {Stager|null} this object on success, NULL on error
 *
 * @see Stager.addStage
 * @see Stager.next
 * @see Stager.doLoop
 */
Stager.prototype.loop = function(id, func) {
    var stageName = this.handleAlias(id);

    if (stageName === null) {
        node.warn('loop received invalid stage name');
        return null;
    }

    if ('function' !== typeof func) {
        node.warn('loop received invalid callback');
        return null;
    }

    this.sequence.push({
        type: 'loop',
        id: stageName,
        cb: func
    });

    return this;
};

/**
 * ### Stager.doLoop
 *
 * Adds alternatively looped stage block to sequence
 *
 * The given stage will be repeated once plus as many times as the `func`
 * callback returns TRUE.
 *
 * @param {string} id A valid stage name with optional alias
 * @param {function} func Callback returning TRUE for repetition
 *
 * @return {Stager|null} this object on success, NULL on error
 *
 * @see Stager.addStage
 * @see Stager.next
 * @see Stager.loop
 */
Stager.prototype.doLoop = function(id, func) {
    var stageName = this.handleAlias(id);

    if (stageName === null) {
        node.warn('doLoop received invalid stage name');
        return null;
    }

    if ('function' !== typeof func) {
        node.warn('doLoop received invalid callback');
        return null;
    }

    this.sequence.push({
        type: 'doLoop',
        id: stageName,
        cb: func
    });

    return this;
};

/**
 * ### Stager.getSequence
 *
 * Returns the sequence of stages
 *
 * @param {string} format 'hstages' for an array of human-readable stage descriptions,
 *  'hsteps' for an array of human-readable step descriptions,
 *  'o' for the internal JavaScript object
 *
 * @return {array|object|null} The stage sequence in requested format. NULL on error.
 */
Stager.prototype.getSequence = function(format) {
    var result;
    var seqIdx;
    var seqObj;
    var stepPrefix;
    var gameOver = false;

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
                    result.push(seqObj.id + ' [x' + seqObj.num + ']');
                    break;

                case 'loop':
                    result.push(seqObj.id + ' [loop]');
                    break;

                case 'doLoop':
                    result.push(seqObj.id + ' [doLoop]');
                    break;

                default:
                    node.warn('unknown sequence object type');
                    return null;
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
                    this.stages[seqObj.id].steps.map(function(stepID) {
                        result.push(stepPrefix + stepID);
                    });
                    break;

                case 'repeat':
                    this.stages[seqObj.id].steps.map(function(stepID) {
                        result.push(stepPrefix + stepID + ' [x' + seqObj.num + ']');
                    });
                    break;

                case 'loop':
                    this.stages[seqObj.id].steps.map(function(stepID) {
                        result.push(stepPrefix + stepID + ' [loop]');
                    });
                    break;

                case 'doLoop':
                    this.stages[seqObj.id].steps.map(function(stepID) {
                        result.push(stepPrefix + stepID + ' [doLoop]');
                    });
                    break;

                default:
                    node.warn('unknown sequence object type');
                    return null;
                }
            }
        }
        break;

    case 'o':
        result = this.sequence;
        break;

    default:
        node.warn('getSequence got invalid format characters');
        return null;
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
 * @return {array|null} The steps in the stage. NULL on invalid stage.
 */
Stager.prototype.getStepsFromStage = function(id) {
    if (!this.stages[id]) return null;
    return this.stages[id].steps;
};

/**
 * ### Stager.setState
 *
 * Sets the internal state of the Stager
 *
 * The passed state object can have the following fields:
 * steps, stages, sequence, generalNextFunction, nextFunctions, defaultStepRule,
 * defaultGlobals, defaultProperties, onInit, onGameover.
 * All fields are optional.
 *
 * This function calls the corresponding functions to set these fields, and
 * performs error checking.
 *
 * If updateRule is 'replace', the Stager is cleared before applying the state.
 *
 * Throws `NodeGameMisconfiguredGameError` if the given state is invalid.
 *
 * @param {object} stateObj The Stager's state
 * @param {string} updateRule Optional. Whether to 'replace' (default) or
 *  to 'append'.
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
        throw new node.NodeGameMisconfiguredGameError(
                'setState got invalid updateRule');
    }

    if (!stateObj) {
        throw new node.NodeGameMisconfiguredGameError(
                'setState got invalid stateObj');
    }

    // Add steps:
    for (idx in stateObj.steps) {
        if (stateObj.steps.hasOwnProperty(idx)) {
            if (!this.addStep(stateObj.steps[idx])) {
                throw new node.NodeGameMisconfiguredGameError(
                        'setState got invalid steps');
            }
        }
    }

    // Add stages:
    // first, handle all non-aliases (key of `stages` entry is same as `id` field of its value)
    for (idx in stateObj.stages) {
        stageObj = stateObj.stages[idx];
        if (stateObj.stages.hasOwnProperty(idx) && stageObj.id === idx) {
            if (!this.addStage(stageObj)) {
                throw new node.NodeGameMisconfiguredGameError(
                        'setState got invalid stages');
            }
        }
    }
    // second, handle all aliases (key of `stages` entry is different from `id` field of its value)
    for (idx in stateObj.stages) {
        stageObj = stateObj.stages[idx];
        if (stateObj.stages.hasOwnProperty(idx) && stageObj.id !== idx) {
            this.stages[idx] = this.stages[stageObj.id];
        }
    }

    // Add sequence blocks:
    for (idx = 0; idx < stateObj.sequence.length; idx++) {
        seqObj = stateObj.sequence[idx];

        switch (seqObj.type) {
        case 'gameover':
            this.gameover();
            break;

        case 'plain':
            if (!this.next(seqObj.id)) {
                throw new node.NodeGameMisconfiguredGameError(
                        'setState got invalid sequence');
            }
            break;

        case 'repeat':
            if (!this.repeat(seqObj.id, seqObj.num)) {
                throw new node.NodeGameMisconfiguredGameError(
                        'setState got invalid sequence');
            }
            break;

        case 'loop':
            if (!this.loop(seqObj.id, seqObj.cb)) {
                throw new node.NodeGameMisconfiguredGameError(
                        'setState got invalid sequence');
            }
            break;

        case 'doLoop':
            if (!this.doLoop(seqObj.id, seqObj.cb)) {
                throw new node.NodeGameMisconfiguredGameError(
                        'setState got invalid sequence');
            }
            break;

        default:
            // Unknown type:
            throw new node.NodeGameMisconfiguredGameError(
                    'setState got invalid sequence');
        }
    }

    // Set general next-decider:
    if (stateObj.hasOwnProperty('generalNextFunction')) {
        if (!this.registerGeneralNext(stateObj.generalNextFunction)) {
            throw new node.NodeGameMisconfiguredGameError(
                    'setState got invalid general next-decider');
        }
    }

    // Set specific next-deciders:
    for (idx in stateObj.nextFunctions) {
        if (stateObj.nextFunctions.hasOwnProperty(idx)) {
            if (!this.registerNext(idx, stateObj.nextFunctions[idx])) {
                throw new node.NodeGameMisconfiguredGameError(
                        'setState got invalid specific next-deciders');
            }
        }
    }

    // Set default step-rule:
    if (stateObj.hasOwnProperty('defaultStepRule')) {
        if (!this.setDefaultStepRule(stateObj.defaultStepRule)) {
            throw new node.NodeGameMisconfiguredGameError(
                    'setState got invalid default step-rule');
        }
    }

    // Set default globals:
    if (stateObj.hasOwnProperty('defaultGlobals')) {
        if (!this.setDefaultGlobals(stateObj.defaultGlobals)) {
            throw new node.NodeGameMisconfiguredGameError(
                    'setState got invalid default globals');
        }
    }

    // Set default properties:
    if (stateObj.hasOwnProperty('defaultProperties')) {
        if (!this.setDefaultProperties(stateObj.defaultProperties)) {
            throw new node.NodeGameMisconfiguredGameError(
                    'setState got invalid default properties');
        }
    }

    // Set onInit:
    if (stateObj.hasOwnProperty('onInit')) {
        if (!this.setOnInit(stateObj.onInit)) {
            throw new node.NodeGameMisconfiguredGameError(
                    'setState got invalid onInit');
        }
    }

    // Set onGameover:
    if (stateObj.hasOwnProperty('onGameover')) {
        if (!this.setOnGameover(stateObj.onGameover)) {
            throw new node.NodeGameMisconfiguredGameError(
                    'setState got invalid onGameover');
        }
    }
};

/**
 * ### Stager.getState
 *
 * Returns the internal state of the Stager
 *
 * Fields of returned object:
 * steps, stages, sequence, generalNextFunction, nextFunctions, defaultStepRule,
 * defaultGlobals, defaultProperties, onInit, onGameover.
 *
 * @return {object} The Stager's state
 *
 * @see Stager.setState
 */
Stager.prototype.getState = function() {
    return {
        steps:               this.steps,
        stages:              this.stages,
        sequence:            this.sequence,
        generalNextFunction: this.generalNextFunction,
        nextFunctions:       this.nextFunctions,
        defaultStepRule:     this.defaultStepRule,
        defaultGlobals:      this.defaultGlobals,
        defaultProperties:   this.defaultProperties,
        onInit:              this.onInit,
        onGameover:          this.onGameover
    };
};

// DEBUG:  Run sequence.  Should be deleted later on.
Stager.prototype.seqTestRun = function(expertMode, firstStage) {
    var seqObj;
    var curStage;
    var stageNum;

    console.log('* Commencing sequence test run!');

    if (!expertMode) {
        for (stageNum in this.sequence) {
            if (this.sequence.hasOwnProperty(stageNum)) {
                seqObj = this.sequence[stageNum];
                console.log('** num: ' + stageNum + ', type: ' + seqObj.type);
                switch (seqObj.type) {
                case 'gameover':
                    console.log('* Game Over.');
                    return;

                case 'plain':
                    this.stageTestRun(seqObj.id);
                    break;

                case 'repeat':
                    for (var i = 0; i < seqObj.num; i++) {
                        this.stageTestRun(seqObj.id);
                    }
                    break;

                case 'loop':
                    while (seqObj.cb()) {
                        this.stageTestRun(seqObj.id);
                    }
                    break;

                case 'doLoop':
                    do {
                        this.stageTestRun(seqObj.id);
                    } while (seqObj.cb());
                    break;

                default:
                    node.warn('unknown sequence object type');
                    break;
                }
            }
        }
    }
    else {
        // Get first stage:
        if (firstStage) {
            curStage = firstStage;
        }
        else if (this.generalNextFunction) {
            curStage = this.generalNextFunction();
        }
        else {
            curStage = null;
        }

        while (curStage) {
            this.stageTestRun(curStage);

            // Get next stage:
            if (this.nextFunctions[curStage]) {
                curStage = this.nextFunctions[curStage]();
            }
            else if (this.generalNextFunction) {
                curStage = this.generalNextFunction();
            }
            else {
                curStage = null;
            }

            // Check stage validity:
            if (curStage !== null && !this.stages[curStage]) {
                node.warn('next-deciding callback yielded invalid stage');
                curStage = null;
            }
        }
    }
};

// DEBUG:  Run stage.  Should be deleted later on.
Stager.prototype.stageTestRun = function(stageId) {
    var steps = this.stages[stageId].steps;
    var stepId;

    for (var i in steps) {
        if (steps.hasOwnProperty(i)) {
            stepId = steps[i];
            this.steps[stepId].cb();
        }
    }
};


// ## Stager private methods

/**
 * ### Stager.checkStepValidity
 *
 * Returns whether given step is valid
 *
 * Checks for existence and type correctness of the fields.
 *
 * @param {object} step The step object
 *
 * @return {bool} TRUE for valid step objects, FALSE otherwise
 *
 * @see Stager.addStep
 *
 * @api private
 */
Stager.prototype.checkStepValidity = function(step) {
    if (!step) return false;
    if ('string' !== typeof step.id) return false;
    if ('function' !== typeof step.cb) return false;

    return true;
};

/**
 * ### Stager.checkStepValidity
 *
 * Returns whether given stage is valid
 *
 * Checks for existence and type correctness of the fields.
 * Checks for referenced step existence.
 * Steps objects are invalid.
 *
 * @param {object} stage The stage object
 *
 * @return {bool} TRUE for valid stage objects, FALSE otherwise
 *
 * @see Stager.addStage
 *
 * @api private
 */
Stager.prototype.checkStageValidity = function(stage) {
    if (!stage) return false;
    if ('string' !== typeof stage.id) return false;
    if (!stage.steps && !stage.steps.length) return false;

    // Check whether the referenced steps exist:
    for (var i in stage.steps) {
        if (stage.steps.hasOwnProperty(i)) {
            if (!this.steps[stage.steps[i]]) return false;
        }
    }

    return true;
};

/**
 * ### Stager.handleAlias
 *
 * Handles stage id and alias strings
 *
 * Takes a string like 'stageID' or 'stageID AS alias' and registers the alias,
 * if existent.
 * Checks whether parameter is valid and unique.
 *
 * @param {string} nameAndAlias The stage-name string
 *
 * @return {string|null} NULL on error,
 *  the alias part of the parameter if it exists,
 *  the stageID part otherwise
 *
 * @see Stager.next
 *
 * @api private
 */
Stager.prototype.handleAlias = function(nameAndAlias) {
    var tokens = nameAndAlias.split(' AS ');
    var id = tokens[0].trim();
    var alias = tokens[1] ? tokens[1].trim() : undefined;
    var stageName = alias || id;
    var seqIdx;

    // Check ID validity:
    if (!this.stages[id]) {
        node.warn('handleAlias received nonexistent stage id');
        return null;
    }

    // Check uniqueness:
    for (seqIdx in this.sequence) {
        if (this.sequence.hasOwnProperty(seqIdx) &&
                this.sequence[seqIdx].id === stageName) {
            node.warn('handleAlias received non-unique stage name');
            return null;
        }
    }

    // Add alias:
    if (alias) {
        this.stages[alias] = this.stages[id];
        return alias;
    }

    return id;
};

// ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
