/**
 * # GameDB
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Provides a simple, lightweight NO-SQL database for nodeGame
 *
 * Entries are stored as GameBit messages.
 *
 * It automatically creates indexes.
 *
 * 1. by player,
 * 2. by stage
 *
 * @see GameStage.compare
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope.
    var NDDB = parent.NDDB,
    GameStage = parent.GameStage;

    // Inheriting from NDDB.
    GameDB.prototype = new NDDB();
    GameDB.prototype.constructor = GameDB;

    // Expose constructors
    exports.GameDB = GameDB;

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

        this.comparator('stage', function(o1, o2) {
            return GameStage.compare(o1.stage, o2.stage);
        });

        if (!this.player) {
            this.hash('player', function(o) {
                return o.player;
            });
        }
        if (!this.stage) {
            this.hash('stage', function(o) {
                if (o.stage) {
                    return GameStage.toHash(o.stage, 'S.s.r');
                }
            });
        }

        this.on('insert', function(o) {
            if ('string' !== typeof o.player) {
                throw new Error('GameDB.insert: player field ' +
                                'missing or invalid: ', o);
            }
            if (!o.stage) throw new Error('GameDB.insert: stage field ' +
                                          'missing or invalid: ', o);
            if (!o.timestamp) o.timestamp = Date ? Date.now() : null;
        });

        this.node = this.__shared.node;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
