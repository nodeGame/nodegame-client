/**
 * # Block
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Block structure to contain stages and steps of the game sequence.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    exports.Block = Block;

    var J = parent.JSUS;

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

        // ### Properties

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
        this.positions = positions;

        /**
         * #### Block.takenPositions
         *
         * Positions within this Block that this are occupied
         */
        this.takenPositions = [];

        /**
         * #### Block.items
         *
         * The items within this Block
         */
        this.items = [];

        /**
         * #### Block.unfinishedEntries
         *
         * Items that have not been assigned a position in this block
         */
        this.unfinishedEntries = [];

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

        /**
         * #### Block.allItemsIds
         *
         * List of ids of all items added to the block, finished or not
         */
        // this.allItemsIds = {};
        /**
         * #### Block.numberOfItems
         *
         * The number of items in the block
         */
        // this.numberOfItems = 0;
    }

    // ### Methods

    /**
     * #### Block.add
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
        var size;
        if (this.finalized) {
            throw new Error('Block.add: stager already finalized, cannot add ' +
                            'further items.');
        }

        if ('undefined' === typeof positions || positions === 'linear') {
            size = this.size();
            this.takenPositions.push(size);
            this.items[size] = item;

        }
        else {
            this.unfinishedEntries.push({
                item: item,
                positions: positions
            });
        }
    };

    /**
     * #### Block.hasItem
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

        // Range in which the indeces must be,
        // accounting for already taken positions.
        available = J.arrayDiff(J.seq(0,this.size()-1), this.takenPositions);

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
            unfinishedEntries: this.unfinishedEntries,
            items: this.items
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
     * @see Block.finalize
     */
    Block.prototype.restore = function() {
        this.index = 0;
        this.finalized = false;
        if (!this.resetCache) return;
        this.unfinishedEntries = this.resetCache.unfinishedEntries;
        this.takenPositions = this.resetCache.takenPositions;
        this.items = this.resetCache.items;
        this.resetCache = null;
    };

    Block.prototype.size = function() {
        return this.items.length + this.unfinishedEntries.length;
    };

    // ## Helper Functions

    /**
     * #### sortFunction
     *
     * Sorts elements in block by number of available positions
     *
     * @api private
     */
    function sortFunction(left, right) {
        return left.positions.length < right.positions.length;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
