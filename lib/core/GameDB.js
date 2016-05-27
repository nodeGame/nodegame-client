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
    GameStage = parent.GameStage,
    J = parent.JSUS;

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
        var that;
        that = this;
        options = options || {};
        options.name = options.name || 'gamedb';

        if (!options.update) options.update = {};

        // Auto build indexes by default.
        options.update.indexes = true;

        NDDB.call(this, options, db);

        this.comparator('stage', function(o1, o2) {
            var _o2;
            if ('string' === typeof o2.stage && that.node) {
                if (false === J.isInt(o2.stage)) {
                    _o2 = that.node.game.plot.normalizeGameStage(o2.stage);
                    if (_o2) o2.stage = _o2;
                }
            }
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

        this.node = this.__shared.node;
    }

    /**
     * ### GameDB.add
     *
     * Wrapper around NDDB.insert
     *
     * Checks that the object contains a player and stage
     * property and also adds a timestamp and session field.
     *
     * @param {object} o The object to add
     *
     * @NDDB.insert
     */
    GameDB.prototype.add = function(o) {
        if ('string' !== typeof o.player) {
            throw new TypeError('GameDB.add: player field ' +
                                'missing or invalid: ', o);
        }
        if ('object' !== typeof o.stage) {
            throw new Error('GameDB.add: stage field ' +
                            'missing or invalid: ', o);
        }
        // if (node.nodename !== nodename) o.session = node.nodename;
        if (!o.timestamp) o.timestamp = Date ? Date.now() : null;
        this.insert(o);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
