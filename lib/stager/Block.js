/**
 * # Block
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Blocks contain items that can be sorted in the sequence.
 *
 * Blocks can also contain other blocks as items, in this case all
 * items are sorted recursevely.
 *
 * Each item must contain an id (unique within the block), and a type parameter.
 * Optionally, a `positions` parameter, controlling the positions that the item
 * can take in the sequence, can be be passed along.
 *
 * Items is encapsulated in objects of the type:
 *
 * ```js
 *    { item: item, positions: positions }
 * ```
 * and added to the `unfinishedItems` array.
 *
 * When the finalized method is called, items are sorted according to the
 * `positions` parameter and moved into the items array.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    exports.Block = Block;

    var J = parent.JSUS;

    // Mock stager object. Contains only shared variables at this point.
    // The stager class will be added later.
    var Stager = parent.Stager;

    // Referencing shared entities.
    var isDefaultStep = Stager.isDefaultStep;
    var blockTypes = Stager.blockTypes;
    var BLOCK_ENCLOSING_STEPS    = blockTypes.BLOCK_ENCLOSING_STEPS;


    /**
     * ## Block constructor
     *
     * Creates a new instance of Block
     *
     * @param {object} options Configuration object
     */
    function Block(options) {
        if ('object' !== typeof options) {
            throw new TypeError('Block constructor: options must be object: ' +
                                options);
        }

        if ('string' !== typeof options.type || options.type.trim() === '') {
            throw new TypeError('Block constructor: options.type must ' +
                                'be a non-empty string: ' + options.type);
        }

        if ('string' !== typeof options.id || options.id.trim() === '') {
            throw new TypeError('Block constructor: options.id must ' +
                                'be a non-empty string: ' + options.id);
        }

        // ### Properties

        /**
         * #### Block.type
         *
         * Stage or Step block
         */
        this.type = options.type;

        /**
         * #### Block.id
         *
         * An identifier (name) for the block instance
         */
        this.id = options.id;

        /**
         * #### Block.positions
         *
         * Positions in the enclosing Block that this block can occupy
         */
        this.positions = 'undefined' !== typeof options.positions ?
            options.positions : 'linear';

        /**
         * #### Block.takenPositions
         *
         * Positions within this Block that this are occupied
         */
        this.takenPositions = [];

        /**
         * #### Block.items
         *
         * The sequence of items within this Block
         */
        this.items = [];

        /**
         * #### Block.itemsIds
         *
         * List of the items added to the block so far
         */
        this.itemsIds = {};

        /**
         * #### Block.unfinishedItems
         *
         * Items that have not been assigned a position in this block
         */
        this.unfinishedItems = [];

         /**
         * #### Block.index
         *
         * Index of the current element to be returned by Block.next
         *
         * @see Block.next
         */
        this.index = 0;

        /**
         * #### Block.finalized
         *
         * Flag to indicate whether a block is completed
         */
        this.finalized = false;

        /**
         * #### Block.resetCache
         *
         * Cache object to reset Block after finalization
         */
        this.resetCache = null;

    }

    // ### Methods

    /**
     * #### Block.add
     *
     * Adds an item to a block
     *
     * @param {object} item The item to be added
     * @param {string} positions The positions where item can be added
     *   Setting this parameter to "linear" or undefined adds the
     *   item to the next free n-th position where this is the n-th
     *   call to add.
     */
    Block.prototype.add = function(item, positions) {

        if (this.finalized) {
            throw new Error('Block.add: block already finalized, ' +
                            'cannot add further items');
        }

        if ('string' !== typeof item.id) {
            throw new TypeError('Block.add: block ' + this.id + ': item id ' +
                                'must be string: ' + item.id || 'undefined');
        }
        if ('string' !== typeof item.type) {
            throw new TypeError('Block.add: block ' + this.id +
                                ': item type must be string: ' +
                                item.type || 'undefined');
        }

        if (this.itemsIds[item.id]) {
            throw new TypeError('Block.add: block ' + this.id +
                                ': item was already added to block: ' +
                                item.id);
        }


        // We cannot set the position as a number here,
        // because it might change with future modifications of
        // the block. Only on block.finalize the position is fixed.
        if ('undefined' === typeof positions) {
            positions = 'linear';
        }

        this.unfinishedItems.push({
            item: item,
            positions: positions
        });

        // Save item's id.
        this.itemsIds[item.id] = true;
    };

    /**
     * #### Block.remove
     *
     * Removes an item from a block
     *
     * @param {string} itemId The id of the item to be removed
     *
     * @return {object} The removed item, or undefined if the item
     *    does not exist
     */
    Block.prototype.remove = function(itemId) {
        var i, len;

        if (this.finalized) {
            throw new Error('Block.remove: block already finalized, ' +
                            'cannot remove items.');
        }

        if (!this.hasItem(itemId)) return;

        i = -1, len = this.unfinishedItems.length;
        for ( ; ++i < len ; ) {
            if (this.unfinishedItems[i].item.id === itemId) {
                this.itemsIds[itemId] = null;

                // Delete from cache as well.
                if (this.resetCache &&
                    this.resetCache.unfinishedItems[itemId]) {

                    delete this.resetCache.unfinishedItems[itemId];
                }
                return this.unfinishedItems.splice(i,1);
            }
        }

        throw new Error('Block.remove: item ' + itemId + ' was found in the ' +
                        'in the itemsIds list, but could not be removed ' +
                        'from block ' + this.id);
    };

    /**
     * #### Block.removeAllItems
     *
     * Removes all items from a block
     *
     * @see Block.remove
     */
    Block.prototype.removeAllItems = function() {
        var i, len;

        if (this.finalized) {
            throw new Error('Block.remove: block already finalized, ' +
                            'cannot remove items.');
        }

        i = -1, len = this.unfinishedItems.length;
        for ( ; ++i < len ; ) {
            // Always remove item 0, size is changing.
            this.remove(this.unfinishedItems[0].item.id);
        }

    };

    /**
     * #### Block.hasItem
     *
     * Checks if an item has been previously added to block
     *
     * @param {string} itemId The id of item to check
     *
     * @return {boolean} TRUE, if the item is found
     */
    Block.prototype.hasItem = function(itemId) {
        return !!this.itemsIds[itemId];
    };

    /**
     * #### Block.finalize
     *
     * Processes all unfinished entries, assigns each to a position
     *
     * Sets the finalized flag.
     */
    Block.prototype.finalize = function() {
        var entry, item, positions, i, len, chosenPosition;
        var available;

        if (this.finalized) return;
        if (!this.unfinishedItems.length) {
            this.finalized = true;
            return;
        }

        // Remove default step if it is BLOCK_STEP and further steps were added.
        if (this.isType(BLOCK_ENCLOSING_STEPS) && this.size() > 1) {
            if (isDefaultStep(this.unfinishedItems[0].item)) {
                // Remove the id of the removed item from the lists of ids.
                this.itemsIds[this.unfinishedItems[0].item.id] = null;
                this.unfinishedItems.splice(0,1);
            }
        }

        i = -1, len = this.unfinishedItems.length;
        // Update the positions of other steps as needed.
        for ( ; ++i < len ; ) {
            if (this.unfinishedItems[i].positions === 'linear') {
                this.unfinishedItems[i].positions = i;
            }
        }

        // Creating array of available positions:
        // from 0 to nItems accounting for already taken positions.
        available = J.seq(0, this.size()-1);

        // TODO: this could be done inside the while loop. However, as
        // every iterations also other entries are updated, it requires
        // multiple calls to J.range.
        // Parsing all of the position strings into arrays.
        i = -1, len = this.unfinishedItems.length;
        for ( ; ++i < len ; ) {
            positions = this.unfinishedItems[i].positions;
            this.unfinishedItems[i].positions = J.range(positions, available);
        }


        // Assigning positions.
        while (this.unfinishedItems.length > 0) {
            // Select entry with least possibilities of where to go.
            this.unfinishedItems.sort(sortFunction);
            entry = this.unfinishedItems.pop();
            item = entry.item;
            positions = entry.positions;

            // No valid position specified.
            if (positions.length === 0) {
                throw new Error('Block.finalize: no valid position for ' +
                                'entry ' + item.id + ' in Block ' + this.id);
            }

            // Chose position randomly among possibilities.
            chosenPosition =  positions[J.randomInt(0, positions.length) - 1];
            this.items[chosenPosition] = item;
            this.takenPositions.push(chosenPosition);

            // Adjust possible positions in remaining entries.
            i = -1, len = this.unfinishedItems.length;
            for ( ; ++i < len ; ) {
                J.removeElement(chosenPosition,
                                this.unfinishedItems[i].positions);
            }
        }
        this.finalized = true;
    };

    /**
     * #### Block.next
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
     * #### Block.backup
     *
     * Saves the current state of the block
     *
     * @see Block.restore
     */
    Block.prototype.backup = function() {
        this.resetCache = J.classClone({
            takenPositions: this.takenPositions,
            unfinishedItems: this.unfinishedItems,
            items: this.items,
            itemsIds: this.itemsIds
        }, 3);
    };

    /**
     * #### Block.restore
     *
     * Resets the state of the block to the latest saved state
     *
     * Even if the reset cache for the block is empty, it sets
     * index to 0 and finalized to false.
     *
     * Marks the block as not `finalized`
     *
     * @see Block.finalize
     */
    Block.prototype.restore = function() {
        this.index = 0;
        this.finalized = false;

        if (!this.resetCache) return;
        this.unfinishedItems = this.resetCache.unfinishedItems;
        this.takenPositions = this.resetCache.takenPositions;
        this.items = this.resetCache.items;
        this.itemsIds = this.resetCache.itemsIds;
        this.resetCache = null;
    };

    /**
     * ## Block.size
     *
     * Returns the total number of items inside the block
     *
     * @return {number} The total number of items in the block
     */
    Block.prototype.size = function() {
        return this.items.length + this.unfinishedItems.length;
    };

    /**
     * ## Block.isType | isOfType
     *
     * Returns TRUE if the block is of the specified type
     *
     * @param {string} type The type to check
     *
     * @return {boolean} TRUE if the block is of the specified type
     */
    Block.prototype.isType = Block.prototype.isOfType = function(type) {
        return this.type === type;
    };

    /**
     * ## Block.clone
     *
     * Returns a copy of the block
     *
     * @return {Block} A new instance of block with the same settings and items
     */
    Block.prototype.clone = function() {
        var block;
        block = new Block({
            type: this.type,
            id: this.id
        });

        block.positions = J.clone(this.positions);
        block.takenPositions = J.clone(this.takenPositions);
        block.items = J.clone(this.items);
        block.itemsIds = this.itemsIds;
        block.unfinishedItems = J.clone(this.unfinishedItems);
        block.index = this.index;
        block.finalized = this.finalized;
        block.resetCache = J.clone(this.resetCache);
        return block;
    };

    // ## Helper Functions

    /**
     * #### sortFunction
     *
     * Sorts elements in block by number of available positions
     *
     * Those with fewer positions go last, because then Array.pop is used.
     *
     * @api private
     */
    function sortFunction(left, right) {
        if (left.positions.length <= right.positions.length) return 1;
        return -1;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
