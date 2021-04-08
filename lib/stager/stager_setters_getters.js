/**
 * # Stager Setter and Getters
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var J = node.JSUS;
    var Stager = node.Stager;
    var stepRules = node.stepRules;

    // Referencing shared entities.
    var isDefaultCb = Stager.isDefaultCb;
    var makeDefaultCb = Stager.makeDefaultCb;

    /**
     * #### Stager.setState
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
        var stageObj, seqObj, blockObj;

        if ('object' !== typeof stateObj) {
            throw new TypeError('Stager.setState: stateObj must be object. ' +
                                'Found: ' + stageObj);
        }

        updateRule = updateRule || 'replace';

        if ('string' !== typeof updateRule) {
            throw new TypeError('Stager.setState: updateRule must be string ' +
                                'or undefined. Found: ' + updateRule);
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

        // Set openStepBlocks.
        if (stateObj.hasOwnProperty('openStepBlocks')) {
            this.openStepBlocks = stateObj.openStepBlocks;
        }

        // Add sequence:
        if (stateObj.hasOwnProperty('sequence')) {
            for (idx = 0; idx < stateObj.sequence.length; idx++) {
                seqObj = stateObj.sequence[idx];
                this.sequence[idx] = seqObj;
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

        // Set defaultCallback.
        if (stateObj.hasOwnProperty('defaultCallback')) {
            this.setDefaultCallback(stateObj.defaultCallback);
        }

        // Cache reset.
        if (stateObj.hasOwnProperty('cacheReset')) {
            this.cacheReset = stateObj.cacheReset;
        }

        // Blocks.
        if (stateObj.hasOwnProperty('blocks')) {
            this.blocksIds = {};
            for (idx = 0; idx < stateObj.blocks.length; idx++) {
                blockObj = stateObj.blocks[idx];
                this.blocks[idx] = blockObj;
                // Save block id into the blocks map.
                this.blocksIds[blockObj.id] = idx;
            }
        }
        if (stateObj.hasOwnProperty('currentStage')) {
            this.currentStage = stateObj.currentStage;
        }
        if (stateObj.hasOwnProperty('currentBlockType')) {
            this.currentBlockType = stateObj.currentBlockType;
        }

        // Mark finalized.
        this.finalized = true;
    };

    /**
     * #### Stager.getState
     *
     * Finalizes the stager and returns a copy of internal state
     *
     * // TODO: the finalize param does not do what expected
     * @param {boolean} finalize. If TRUE, it calls finalize before
     *   cloning the stager. Default: TRUE.
     *
     * @return {object} Clone of the Stager's state
     *
     * @see Stager.setState
     * @see Stager.finalize
     */
    Stager.prototype.getState = function(finalize) {
        var out, i, len;
        finalize = 'undefined' === typeof finalize ? true : !!finalize;
        if (finalize) this.finalize();

        out = J.clone({
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
            toSkip:              this.toSkip,
            defaultCallback:     this.defaultCallback,
            cacheReset:          this.cacheReset,
            currentStage:        this.currentStage,
            currentBlockType:    this.currentBlockType,
            openStepBlocks:      this.openStepBlocks
        });

        // Cloning blocks separately.
        out.blocks = [];
        i = -1, len = this.blocks.length;
        for ( ; ++i < len ; ) {
            out.blocks.push(this.blocks[i].clone());
        }
        if (!finalize) {
            out.unfinishedBlocks = [];
            i = -1, len = this.unfinishedBlocks.length;
            for ( ; ++i < len ; ) {
                out.unfinishedBlocks.push(this.unfinishedBlocks[i].clone());
            }
        }

        return out;
    };

    /**
     * #### Stager.setDefaultStepRule
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
                                    'undefined. Found: ' + stepRule);
            }

            this.defaultStepRule = stepRule;
        }
        else {
            // Initial default.
            this.defaultStepRule = stepRules.SOLO;
        }
    };

    /**
     * #### Stager.getDefaultStepRule
     *
     * Returns the default step-rule function
     *
     * @return {function} The default step-rule function
     */
    Stager.prototype.getDefaultStepRule = function() {
        return this.defaultStepRule;
    };

    /**
     * #### Stager.setDefaultCallback
     *
     * Sets the default callback
     *
     * The callback immediately replaces the current callback
     * in all the steps that have a default callback.
     *
     * Function will be modified and flagged as `default`.
     *
     * @param {function|null} cb The default callback or null to unset it
     *
     * @see Stager.defaultCallback
     * @see Stager.getDefaultCallback
     * @see makeDefaultCallback
     */
    Stager.prototype.setDefaultCallback = function(cb) {
        var i;
        if (cb === null) {
            cb = Stager.defaultCallback;
        }
        else if ('function' !== typeof cb) {
            throw new TypeError('Stager.setDefaultCallback: defaultCallback ' +
                                'must be function or null. Found: ' + cb);
        }
        this.defaultCallback = makeDefaultCb(cb);

        for (i in this.steps) {
            if (this.steps.hasOwnProperty(i)) {
                if (isDefaultCb(this.steps[i].cb)) {
                    this.steps[i].cb = this.defaultCallback;
                }
            }
        }
    };

    /**
     * #### Stager.getDefaultCallback | getDefaultCb
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
    Stager.prototype.getDefaultCb =
        Stager.prototype.getDefaultCallback = function() {
        return this.defaultCallback || Stager.defaultCallback;
    };

    /**
     * #### Stager.setDefaultGlobals
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
            throw new TypeError('Stager.setDefaultGlobals: defaultGlobals ' +
                                'must be object. Found: ' + defaultGlobals);
        }
        if (mixin) J.mixin(this.defaultGlobals, defaultGlobals);
        else this.defaultGlobals = defaultGlobals;
    };

    /**
     * #### Stager.getDefaultGlobals
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
     * #### Stager.setDefaultProperty
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
                                'must be string. Found: ' + name);
        }
        this.defaultProperties[name] = value;
    };

    /**
     * #### Stager.setDefaultProperties
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
                                'defaultProperties must be object. Found: ' +
                                defaultProperties);
        }
        if (mixin) J.mixin(this.defaultProperties, defaultProperties);
        else this.defaultProperties = defaultProperties;
    };

    /**
     * #### Stager.getDefaultProperties
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
     * #### Stager.setOnInit
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
            throw new TypeError('Stager.setOnInit: func must be ' +
                                'function or undefined. Found: ' + func);
        }
        this.onInit = func;
    };

    /**
     * #### Stager.getOnInit
     *
     * Gets onInit function
     *
     * @return {function|null} The onInit function.
     *  NULL signifies non-existence.
     *
     * @see Stager.onInit
     */
    Stager.prototype.getOnInit = function() {
        return this.onInit;
    };

    /**
     * #### Stager.setOnGameover
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
     * #### Stager.setOnGameOver
     *
     * Alias for `setOnGameover`
     *
     * @see Stager.setOnGameover
     */
    Stager.prototype.setOnGameOver = Stager.prototype.setOnGameover;

    /**
     * #### Stager.getOnGameover
     *
     * Gets onGameover function
     *
     * @return {function|null} The onGameover function, or NULL if none
     *    is found
     *
     * @see Stager.onGameover
     */
    Stager.prototype.getOnGameover = function() {
        return this.onGameover;
    };

    /**
     * #### Stager.getOnGameOver
     *
     * Alias for `getOnGameover`
     *
     * @see Stager.getOnGameover
     */
    Stager.prototype.getOnGameOver = Stager.prototype.getOnGameover;

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
