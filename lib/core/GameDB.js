/**
 * # GameDB
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed 
 * 
 * ### Provides a simple, lightweight NO-SQL database for nodeGame
 * 
 * Entries are stored as GameBit messages.
 * 
 * It automatically creates three indexes.
 * 
 * 1. by player,
 * 2. by stage,
 * 3. by key.
 * 
 * Uses GameStage.compare to compare the stage property of each entry.
 * 
 * @see GameBit
 * @see GameStage.compare
 * ---
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope  
    var JSUS = parent.JSUS,
    NDDB = parent.NDDB,
    GameStage = parent.GameStage;

    // Inheriting from NDDB     
    GameDB.prototype = new NDDB();
    GameDB.prototype.constructor = GameDB;


    // Expose constructors
    exports.GameDB = GameDB;
    exports.GameBit = GameBit;

    /**
     * ## GameDB constructor 
     *
     * Creates an instance of GameDB
     * 
     * @param {object} options Optional. A configuration object
     * @param {array} db Optional. An initial array of items
     * 
     * @see NDDB constructor
     */
    function GameDB(options, db) {
        options = options || {};
        options.name = options.name || 'gamedb';

        if (!options.update) options.update = {};

        // Auto build indexes by default.
        options.update.indexes = true;
        
        NDDB.call(this, options, db);
        
        this.comparator('stage', GameBit.compareState);
        
        if (!this.player) {
            this.hash('player', function(gb) {
                return gb.player;
            });
        }
        if (!this.stage) {
            this.hash('stage', function(gb) {
                if (gb.stage) {
                    return GameStage.toHash(gb.stage, 'S.s.r');
                }
            });
        }  
        if (!this.key) {
            this.hash('key', function(gb) {
                return gb.key;
            });
        }

        this.node = this.__shared.node;
    }

    // ## GameDB methods

    /**
     * ## GameDB.syncWithNode
     *
     * If set, automatically adds property to newly inserted items
     *
     * Adds `node.player` and `node.game.getCurrentGameStage()`
     *
     * @param {NodeGameClient} A NodeGameClient instance
     */
    GameDB.prototype.syncWithNode = function(node) {
        if ('object' !== typeof node) {
            throw new Error('GameDB.syncWithNode: invalid parameter received');
        }
        this.node = node;
    }
    
    /**
     * ### GameDB.add
     * 
     * Creates a GameBit and adds it to the database
     * 
     * @param {string} key An alphanumeric id for the entry
     * @param {mixed} value Optional. The value to store
     * @param {Player} player Optional. The player associated to the entry
     * @param {GameStage} player Optional. The stage associated to the entry
     * 
     * @return {boolean} TRUE, if insertion was successful
     * 
     * @see GameBit
     */
    GameDB.prototype.add = function(key, value, player, stage) {
        var gb;
        if ('string' !== typeof key) {
            throw new TypeError('GameDB.add: key must be string.');
        }
        
        if (this.node) {
            if ('undefined' === typeof player) {
                player = this.node.player;
            }
            if ('undefined' === typeof stage) {
                stage = this.node.game.getCurrentGameStage();
            }
        }
        gb = new GameBit({
            player: player, 
            key: key,
            value: value,
            stage: stage
        });
        this.insert(gb);
        return gb;
    };

    /**
     * # GameBit
     * 
     * Container of relevant information for the game
     *  
     * A GameBit unit always contains the following properties:
     * 
     * - stage GameStage
     * - player Player
     * - key 
     * - value
     * - time 
     */

    // ## GameBit methods

    /**
     * ### GameBit constructor
     * 
     * Creates a new instance of GameBit
     */
    function GameBit(options) {
        this.stage = options.stage;
        this.player = options.player;
        this.key = options.key;
        this.value = options.value;
        this.time = (Date) ? Date.now() : null;
    }

    /**
     * ### GameBit.toString
     * 
     * Returns a string representation of the instance of GameBit
     * 
     * @return {string} string representation of the instance of GameBit
     */
    GameBit.prototype.toString = function() {
        return this.player + ', ' + GameStage.stringify(this.stage) + 
            ', ' + this.key + ', ' + this.value;
    };

    /** 
     * ### GameBit.equals (static)
     * 
     * Compares two GameBit objects
     * 
     * Returns TRUE if the attributes of `player`, `stage`, and `key`
     * are identical. 
     *  
     * If the strict parameter is set, also the `value` property 
     * is used for comparison
     *  
     * @param {GameBit} gb1 The first game-bit to compare
     * @param {GameBit} gb2 The second game-bit to compare
     * @param {boolean} strict Optional. If TRUE, compares also the 
     *  `value` property
     * 
     * @return {boolean} TRUE, if the two objects are equals
     * 
     * @see GameBit.comparePlayer
     * @see GameBit.compareState
     * @see GameBit.compareKey
     * @see GameBit.compareValue
     */
    GameBit.equals = function(gb1, gb2, strict) {
        if (!gb1 || !gb2) return false;
        strict = strict || false;
        if (GameBit.comparePlayer(gb1, gb2) !== 0) return false;
        if (GameBit.compareState(gb1, gb2) !== 0) return false;
        if (GameBit.compareKey(gb1, gb2) !== 0) return false;
        if (strict &&
            gb1.value && GameBit.compareValue(gb1, gb2) !== 0) return false;
        return true;    
    };

    /**
     * ### GameBit.comparePlayer (static)
     * 
     * Sort two game-bits by player numerical id
     * 
     * Returns a numerical id that can assume the following values
     * 
     * - `-1`: the player id of the second game-bit is larger 
     * - `1`: the player id of the first game-bit is larger
     * - `0`: the two gamebits belong to the same player
     * 
     * @param {GameBit} gb1 The first game-bit to compare
     * @param {GameBit} gb2 The second game-bit to compare
     * 
     * @return {number} The result of the comparison
     */
    GameBit.comparePlayer = function(gb1, gb2) {
        if (!gb1 && !gb2) return 0;
        if (!gb1) return 1;
        if (!gb2) return -1;
        if (gb1.player === gb2.player) return 0;
        if (gb1.player > gb2.player) return 1;
        return -1;
    };

    /**
     * ### GameBit.compareState (static)
     * 
     * Sort two game-bits by their stage property
     * 
     * GameStage.compare is used for comparison
     * 
     * @param {GameBit} gb1 The first game-bit to compare
     * @param {GameBit} gb2 The second game-bit to compare
     * 
     * @return {number} The result of the comparison
     * 
     *  @see GameStage.compare
     */
    GameBit.compareState = function(gb1, gb2) {
        return GameStage.compare(gb1.stage, gb2.stage);
    };

    /**
     * ### GameBit.compareKey (static)
     * 
     *  Sort two game-bits by their key property 
     * 
     * Returns a numerical id that can assume the following values
     * 
     * - `-1`: the key of the first game-bit comes first alphabetically  
     * - `1`: the key of the second game-bit comes first alphabetically 
     * - `0`: the two gamebits have the same key
     * 
     * @param {GameBit} gb1 The first game-bit to compare
     * @param {GameBit} gb2 The second game-bit to compare
     * 
     * @return {number} The result of the comparison
     */
    GameBit.compareKey = function(gb1, gb2) {
        if (!gb1 && !gb2) return 0;
        if (!gb1) return 1;
        if (!gb2) return -1;
        if (gb1.key === gb2.key) return 0;
        if (gb1.key < gb2.key) return -1;
        return 1;
    };

    /**
     * ### GameBit.compareValue (static)
     *  
     * Sorts two game-bits by their value property
     * 
     * Uses JSUS.equals for equality. If they differs, 
     * further comparison is performed, but results will be inaccurate
     * for objects. 
     * 
     * Returns a numerical id that can assume the following values
     * 
     * - `-1`: the value of the first game-bit comes first alphabetically or
     *    numerically
     * - `1`: the value of the second game-bit comes first alphabetically or
     *   numerically 
     * - `0`: the two gamebits have identical value properties
     * 
     * @param {GameBit} gb1 The first game-bit to compare
     * @param {GameBit} gb2 The second game-bit to compare
     * 
     * @return {number} The result of the comparison
     * 
     * @see JSUS.equals
     */
    GameBit.compareValue = function(gb1, gb2) {
        if (!gb1 && !gb2) return 0;
        if (!gb1) return 1;
        if (!gb2) return -1;
        if (JSUS.equals(gb1.value, gb2.value)) return 0;
        if (gb1.value > gb2.value) return 1;
        return -1;
    };  

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);