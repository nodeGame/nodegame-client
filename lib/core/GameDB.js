/**
 * # GameDB
 * Copyright(c) 2020 Stefano Balietti
 * MIT Licensed
 *
 * Provides a simple, lightweight NO-SQL database for nodeGame
 *
 * It automatically indexes inserted items by:
 *
 *  - player,
 *  - stage.
 *
 * @see GameStage.compare
 * @see NDDB
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
        options.name = options.name || 'memory';

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

        this.hash('player', function(o) {
            return o.player;
        });

        this.hash('stage', function(o) {
            if (o.stage) return GameStage.toHash(o.stage, 'S.s.r');
        });

        this.view('done');

        this.on('save', function(options, info) {
            if (info.format === 'csv') decorateCSVSaveOptions(that, options);
        }, true);

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
            throw new TypeError('GameDB.add: player missing or invalid: ', o);
        }
        if ('object' !== typeof o.stage) {
            throw new Error('GameDB.add: stage missing or invalid: ', o);
        }

        if (!o.timestamp) o.timestamp = Date.now ?
            Date.now() : new Date().getTime();

        o.session = this.node.nodename;

        o.treatment = this.node.game.settings.treatmentName;

        this.insert(o);
    };

    /**
     * ### decorateCSVSaveOptions
     *
     * Adds default options to improve data saving.
     *
     * @param {object} opts Optional. The option object to decorate
     */
    function decorateCSVSaveOptions(that, opts) {
        var toId, split, plot;
        if ('undefined' === typeof opts.bool2num) opts.bool2num = true;

        // Handle stage object.
        toId = 'undefined' === typeof opts.stageNum2Id ?
                    true : opts.stageNum2Id;
        split = 'undefined' === typeof opts.splitStage ?
                    true : opts.splitStage;

        plot = that.node.game.plot;

        if (!opts.adapter) opts.adapter = {};

        if (opts.append) opts.flags = 'a';

        if (split) {
            if ('undefined' === typeof opts.adapter.stage) {
                opts.adapter.stage = function(i) {
                    if (!i.stage) return;
                    return toId ? plot.getStage(i.stage).id : i.stage.stage;
                };
            }
            if ('undefined' === typeof opts.adapter.step) {
                opts.adapter.step = function(i) {
                    if (!i.stage) return;
                    return toId ? plot.getStep(i.stage).id : i.stage.step;
                };
            }
            if ('undefined' === typeof opts.adapter.round) {
                opts.adapter.round = function(i) { return i.stage.round; };
            }
        }
        else {
            if ('undefined' === typeof opts.adapter.stage) {
                opts.adapter.stage = function(i) {
                    var s = i.stage;
                    if (!s) return;
                    if (toId) {
                        return plot.getStage(s).id + '.' +
                               plot.getStep(s).id + '.' + s.round;
                    }
                    return s.stage + '.' + s.step + '.' + s.round;
                };
            }
        }

        if ('undefined' === typeof opts.header &&
            'undefined' === typeof opts.headers) {

            opts.header = 'all';
        }

        // Flatten.
        if (opts.flatten) {
            opts.preprocess = function(item, current) {
                var s;
                s = item.stage.stage + '.' + item.stage.step +
                '.' + item.stage.round;
                if (item.time) item['time_' + s] = item.time;
                if (item.timeup) item['timeup_' + s] = item.timeup;
                if (item.timestamp) item['timestamp_' + s] = item.timestamp;
                delete item.time;
                delete item.timestamp;
            };
        }
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
