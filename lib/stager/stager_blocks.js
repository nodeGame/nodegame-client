/**
 * # Stager blocks operations
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 */
(function(exports, node) {

    var Stager = node.Stager;

    var checkPositionsParameter = Stager.checkPositionsParameter;
    var addStageBlock = Stager.addStageBlock;
    var addBlock = Stager.addBlock;

    var blockTypes               = Stager.blockTypes;
    var BLOCK_DEFAULT            = blockTypes.BLOCK_DEFAULT;
    var BLOCK_STAGEBLOCK         = blockTypes.BLOCK_STAGEBLOCK;
    var BLOCK_STEPBLOCK          = blockTypes.BLOCK_STEPBLOCK;
    var BLOCK_STEP               = blockTypes.BLOCK_STEP;
    var BLOCK_ENCLOSING          = blockTypes.BLOCK_ENCLOSING;
    var BLOCK_ENCLOSING_STEPS    = blockTypes.BLOCK_ENCLOSING_STEPS;

    /**
     * #### Stager.stepBlock
     *
     * Begins a new Block of steps
     *
     * This function just validates the input paramters and passes them
     * to lower level function `addBlock`.
     *
     * @param {string} id The id of the block.
     * @param {string|number} positions Optional. Positions within the
     *   enclosing Block that this block may occupy.
     *
     * @return {Stager} Reference to the current instance for method chaining
     */
    Stager.prototype.stepBlock = function(id, positions) {
        var curBlock, err;

        if (arguments.length === 1) {
            console.log('***deprecation warning: Stager.stepBlock will ' +
                        'require two parameters in the next version.***');

           positions = id;
        }
        else {
            if ('string' !== typeof id || id.trim() === '') {
                throw new TypeError('Stager.stepBlock: id must be a ' +
                                    'non-empty string. Found: ' + id);
            }
            if (this.blocksIds[id]) {
                throw new Error('Stager.stepBlock: non-unique id: ' + id);
            }
        }

        // Check if a stage block can be added in this position.
        curBlock = this.getCurrentBlock();

        if (!curBlock || curBlock.id === BLOCK_DEFAULT ||
            (!curBlock.isType(BLOCK_ENCLOSING_STEPS) &&
            !curBlock.isType(BLOCK_STEPBLOCK))) {

            err = 'Stager.stepBlock: block ';
            if (id) err += '"' +  id + '"';
            err += 'cannot be added here. Did add at least one stage before?'
            throw new Error(err);
        }


           // !curBlock.isType(BLOCK_STEPBLOCK))
        if (curBlock.isType(BLOCK_STEPBLOCK) && curBlock.size() === 0) {
            err = 'Stager.stepBlock: block ';
            if (id) err += '"' +  id + '"';
            err += 'cannot be added here. Did add at least one step ' +
                   'in the previous step block?'
            throw new Error(err);
        }

        checkPositionsParameter(positions, 'stepBlock');

        addBlock(this, id, BLOCK_STEPBLOCK, positions, BLOCK_STEP);
        this.openStepBlocks++;

        return this;
    };

    /**
     * #### Stager.stageBlock
     *
     * Begins a new Block of stages
     *
     * This function just validates the input paramters and passes them
     * to lower level function `addStageBlock`.
     *
     * @param {string} id The id of the block.
     * @param {string|number} positions Optional. Positions within the
     *   enclosing Block that this block can occupy.
     *
     * @return {Stager} Reference to the current instance for method chainining
     *
     * @see addStageBlock
     */
    Stager.prototype.stageBlock = function(id, positions) {
        var curBlock, err;

        if (arguments.length === 1) {
            console.log('***deprecation warning: Stager.stageBlock will ' +
                        'require two parameters in the next version.***');

           positions = id;
        }
        else {
            if ('string' !== typeof id || id.trim() === '') {
                throw new TypeError('Stager.stageBlock: id must be a ' +
                                    'non-empty string. Found: ' + id);
            }
            if (this.blocksIds[id]) {
                throw new Error('Stager.stageBlock: non-unique id: ' + id);
            }
        }

        // Check if a stage block can be added in this position.
        curBlock = this.getCurrentBlock();

        if (curBlock && curBlock.id !== BLOCK_DEFAULT &&
            // (curBlock.isType(BLOCK_STAGE) ||
            curBlock.isType(BLOCK_STAGEBLOCK)) {

            err = 'Stager.stageBlock: block ';
            if (id) err += '"' +  id + '"';
            err += 'cannot be added here. Did add at least one stage ' +
                   'in the previous stage block?'
            throw new Error(err);
        }

        checkPositionsParameter(positions, 'stageBlock');

        // Closes last step and stage blocks.
        // Then adds a new enclosing-stages block.
        addStageBlock(this, id, BLOCK_STAGEBLOCK, positions);

        return this;
    };

    /**
     * #### Stager.getCurrentBlock
     *
     * Returns the Block that Stager is currently working on
     *
     * @return {object|boolean} Currently open block, or FALSE if no
     *   unfinished block is found
     */
    Stager.prototype.getCurrentBlock = function() {
        if (this.unfinishedBlocks.length === 0) return false;
        return this.unfinishedBlocks[this.unfinishedBlocks.length -1];
    };

    /**
     * #### Stager.endBlock
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
        var found, i;
        if (!this.unfinishedBlocks.length) return this;
        options = options || {};

        block = this.unfinishedBlocks.pop();

        // Step block.
        if (block.isType(BLOCK_STEPBLOCK)) {

            // We find the first enclosing block for the step block
            // (in between there could several steps).
            i = this.blocks.length-1;
            do {
                currentBlock = this.blocks[i];
                found = currentBlock.id.indexOf(BLOCK_ENCLOSING) !== -1;
                i--;
            }
            while (!found && i >= 0)

            if (found) {
                currentBlock.add(block, block.positions);
            }
            else {
                throw new Error('Stager.endBlock: could not find enclosing ' +
                                'block for stepBlock ' + block.name);
            }

        }
        // Normal stage / step block, add it to previous
        else if (!block.isType(BLOCK_STAGEBLOCK)) {

            currentBlock = this.getCurrentBlock();
            if (currentBlock) currentBlock.add(block, block.positions);

        }
        // Add stage block to default block.
        else if (block.id !== BLOCK_DEFAULT &&
                 block.id.indexOf(BLOCK_ENCLOSING) === -1) {

            this.blocks[0].add(block, block.positions);
        }
        if (options.finalize) block.finalize();
        return this;
    };

    /**
     * #### Stager.endBlocks
     *
     * Ends multiple unfinished Blocks
     *
     * @param Number n Number of unfinished Blocks to be ended.
     * @param {object} options Optional If options.finalize is set, the
     *    block gets finalized.
     */
    Stager.prototype.endBlocks = function(n, options) {
        var i;
        for (i = 0; i < n; ++i) {
            this.endBlock(options);
        }
        return this;
    };

    /**
     * #### Stager.endAllBlocks
     *
     * Ends all unfinished Blocks.
     */
    Stager.prototype.endAllBlocks = function() {
        this.endBlocks(this.unfinishedBlocks.length);
    };

    /**
     * #### Stager.findBlockWithItem
     *
     * Returns the block where the item (step|stage) with specified id is found
     *
     * @param {string} itemId The id of the item
     *
     * @return {object|boolean} The block containing the requested item,
     *    or FALSE if none is found
     */
    Stager.prototype.findBlockWithItem = function(itemId) {
        var i, len;
        i = -1, len = this.blocks.length;
        for ( ; ++i < len ; ) {
            if (this.blocks[i].hasItem(itemId)) return this.blocks[i];
        }
        return false;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
