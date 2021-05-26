/**
 * # SizeManager
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles changes in the number of connected players.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    // Exposing SizeManager constructor
    exports.SizeManager = SizeManager;

    var J = parent.JSUS;

    /**
     * ## SizeManager constructor
     *
     * Creates a new instance of SizeManager
     *
     * @param {NodeGameClient} node A valid NodeGameClient object
     */
    function SizeManager(node) {

        /**
         * ### SizeManager.node
         *
         * Reference to a nodegame-client instance
         */
        this.node = node;

        /**
         * ### SizeManager.checkSize
         *
         * Checks if the current number of players is right
         *
         * This function is recreated each step based on the values
         * of properties `min|max|exactPlayers` found in the Stager.
         *
         * It is used by `Game.shouldStep` to determine if we go to the
         * next step.
         *
         * Unlike `SizeManager.changeHandler` this method does not
         * accept parameters nor execute callbacks, just returns TRUE/FALSE.
         *
         * @return {boolean} TRUE if all checks are passed
         *
         * @see Game.shouldStep
         * @see Game.shouldEmitPlaying
         * @see SizeManager.init
         * @see SizeManager.changeHandler
         */
        this.checkSize = function() { return true; };

        /**
         * ### SizeManager.changeHandler
         *
         * Handles changes in the number of players
         *
         * This function is recreated each step based on the values
         * of properties `min|max|exactPlayers` found in the Stager.
         *
         * Unlike `SizeManager.checkSize` this method requires input
         * parameters and executes the appropriate callback functions
         * in case a threshold is hit.
         *
         * @param {string} op The name of the operation:
         *   'pdisconnect', 'pconnect', 'pupdate', 'replace'
         * @param {Player|PlayerList} obj The object causing the update
         *
         * @return {boolean} TRUE, if no player threshold is passed
         *
         * @see SizeManager.min|max|exactPlayers
         * @see SizeManager.min|max|exactCbCalled
         * @see SizeManager.init
         * @see SizeManager.checkSize
         */
        this.changeHandler = function(op, obj) { return true; };

        /**
         * ### SizeManager.minThresold
         *
         * The min-players threshold currently set
         */
        this.minThresold = null;

        /**
         * ### SizeManager.minCb
         *
         * The callback to execute once the min threshold is hit
         */
        this.minCb = null;

        /**
         * ### SizeManager.minCb
         *
         * The callback to execute once the min threshold is restored
         */
        this.minRecoveryCb = null;

        /**
         * ### SizeManager.maxThreshold
         *
         * The max-players threshold currently set
         */
        this.maxThreshold = null;

        /**
         * ### SizeManager.minCbCalled
         *
         * TRUE, if the minimum-player callback has already been called
         *
         * This is reset when the max-condition is satisfied again.
         *
         * @see SizeManager.changeHandler
         */
        this.minCbCalled = false;

        /**
         * ### SizeManager.maxCb
         *
         * The callback to execute once the max threshold is hit
         */
        this.maxCb = null;

        /**
         * ### SizeManager.maxCb
         *
         * The callback to execute once the max threshold is restored
         */
        this.maxRecoveryCb = null;

        /**
         * ### SizeManager.maxCbCalled
         *
         * TRUE, if the maximum-player callback has already been called
         *
         * This is reset when the max-condition is satisfied again.
         *
         * @see SizeManager.changeHandler
         */
        this.maxCbCalled = false;

        /**
         * ### SizeManager.exactThreshold
         *
         * The exact-players threshold currently set
         */
        this.exactThreshold = null;

        /**
         * ### SizeManager.exactCb
         *
         * The callback to execute once the exact threshold is hit
         */
        this.exactCb = null;

        /**
         * ### SizeManager.exactCb
         *
         * The callback to execute once the exact threshold is restored
         */
        this.exactRecoveryCb = null;

        /**
         * ### SizeManager.exactCbCalled
         *
         * TRUE, if the exact-player callback has already been called
         *
         * This is reset when the exact-condition is satisfied again.
         *
         * @see SizeManager.changeHandler
         */
        this.exactCbCalled = false;
    }

    /**
     * ### SizeManager.init
     *
     * Sets all internal references to null
     *
     * @see SizeManager.init
     */
    SizeManager.prototype.clear = function() {
        this.minThreshold = null;
        this.minCb = null;
        this.minRecoveryCb = null;
        this.minCbCalled = false;

        this.maxThreshold = null;
        this.maxCb = null;
        this.maxRecoveryCb = null;
        this.maxCbCalled = false;

        this.exactThreshold = null;
        this.exactCb = null;
        this.exactRecoveryCb = null;
        this.exactCbCalled = false;

        this.changeHandler = function(op, obj) { return true; };
        this.checkSize = function() { return true; };
    };

    /**
     * ### SizeManager.init
     *
     * Evaluates the requirements for the step and store references internally
     *
     * If required, it adds a listener to changes in the size of player list.
     *
     * At the beginning, calls `SizeManager.clear`
     *
     * @param {GameStage} step Optional. The step to evaluate.
     *   Default: node.player.stage
     *
     * @return {boolean} TRUE if a full handler was added
     *
     * @see SizeManager.changeHandlerFull
     * @see SizeManager.clear
     */
    SizeManager.prototype.init = function(step) {
        var node, property, doPlChangeHandler;

        this.clear();

        node = this.node;
        step = step || node.player.stage;
        property = node.game.plot.getProperty(step, 'minPlayers');
        if (property) {
            this.setHandler('min', property);
            doPlChangeHandler = true;
        }

        property = node.game.plot.getProperty(step, 'maxPlayers');
        if (property) {
            this.setHandler('max', property);

            if (this.minThreshold === '*') {
                throw new Error('SizeManager.init: maxPlayers cannot be' +
                                '"*" if minPlayers is "*"');
            }

            if (this.maxThreshold <= this.minThreshold) {
                throw new Error('SizeManager.init: maxPlayers must be ' +
                                'greater than minPlayers: ' +
                                this.maxThreshold + '<=' + this.minThreshold);
            }

            doPlChangeHandler = true;
        }

        property = node.game.plot.getProperty(step, 'exactPlayers');
        if (property) {
            if (doPlChangeHandler) {
                throw new Error('SizeManager.init: exactPlayers ' +
                                'cannot be set if either minPlayers or ' +
                                'maxPlayers is set.');
            }
            this.setHandler('exact', property);
            doPlChangeHandler = true;
        }

        if (doPlChangeHandler) {

            this.changeHandler = this.changeHandlerFull;
            // Maybe this should be a parameter.
            // this.changeHandler('init');
            this.addListeners();

            this.checkSize = this.checkSizeFull;
        }
        else {
            // Set bounds-checking function.
            this.checkSize = function() { return true; };
            this.changeHandler = function() { return true; };
        }

        return doPlChangeHandler;
    };

    /**
     * ### SizeManager.checkSizeFull
     *
     * Implements SizeManager.checkSize
     *
     * @see SizeManager.checkSize
     */
    SizeManager.prototype.checkSizeFull =  function() {
        var nPlayers, limit;
        nPlayers = this.node.game.pl.size();

        // Players should count themselves too.
        if (!this.node.player.admin) nPlayers++;

        limit = this.minThreshold;
        if (limit && limit !== '*' && nPlayers < limit) {
            return false;
        }

        limit = this.maxThreshold;
        if (limit && limit !== '*' && nPlayers > limit) {
            return false;
        }

        limit = this.exacThreshold;
        if (limit && limit !== '*' && nPlayers !== limit) {
            return false;
        }

        return true;
    };

    /**
     * ### SizeManager.changeHandlerFull
     *
     * Implements SizeManager.changeHandler
     *
     * @see SizeManager.changeHandler
     */
    SizeManager.prototype.changeHandlerFull = function(op, player) {
        var threshold, cb, nPlayers;
        var game, res;

        res = true;
        game = this.node.game;
        nPlayers = game.pl.size();
        // Players should count themselves too.
        if (!this.node.player.admin) nPlayers++;

        threshold = this.minThreshold;
        if (threshold) {
            if (op === 'pdisconnect') {
                if (threshold === '*' || nPlayers < threshold) {

                    if (!this.minCbCalled) {
                        this.minCbCalled = true;
                        cb = game.getProperty('onWrongPlayerNum');

                        cb.call(game, 'min', this.minCb, player);
                    }
                    res = false;
                }
            }
            else if (op === 'pconnect') {
                if (this.minCbCalled) {
                    cb = game.getProperty('onCorrectPlayerNum');
                    cb.call(game, 'min', this.minRecoveryCb, player);
                }
                // Must stay outside if.
                this.minCbCalled = false;
            }
        }

        threshold = this.maxThreshold;
        if (threshold) {
            if (op === 'pconnect') {
                if (threshold === '*' || nPlayers > threshold) {

                    if (!this.maxCbCalled) {
                        this.maxCbCalled = true;
                        cb = game.getProperty('onWrongPlayerNum');
                        cb.call(game, 'max', this.maxCb, player);
                    }
                    res = false;
                }
            }
            else if (op === 'pdisconnect') {
                if (this.maxCbCalled) {
                    cb = game.getProperty('onCorrectPlayerNum');
                    cb.call(game, 'max', this.maxRecoveryCb, player);
                }
                // Must stay outside if.
                this.maxCbCalled = false;
            }
        }

        threshold = this.exactThreshold;
        if (threshold) {
            if (nPlayers !== threshold) {
                if (!this.exactCbCalled) {
                    this.exactCbCalled = true;
                    cb = game.getProperty('onWrongPlayerNum');
                    cb.call(game, 'exact', this.exactCb, player);
                }
                res = false;
            }
            else {
                if (this.exactCbCalled) {
                    cb = game.getProperty('onCorrectPlayerNum');
                    cb.call(game, 'exact', this.exactRecoveryCb, player);
                }
                // Must stay outside if.
                this.exactCbCalled = false;
            }
        }

        return res;
    };

    /**
     * ### SizeManager.setHandler
     *
     * Sets the desired handler
     *
     * @param {string} type One of the available types: 'min', 'max', 'exact'
     * @param {number|array} The value/s for the handler
     */
    SizeManager.prototype.setHandler = function(type, values) {
        values = checkMinMaxExactParams(type, values, this.node);
        this[type + 'Threshold'] = values[0];
        this[type + 'Cb'] = values[1];
        this[type + 'RecoveryCb'] = values[2];
    };

    /**
     * ### SizeManager.addListeners
     *
     * Adds listeners to disconnect and connect to the `step` event manager
     *
     * Notice: PRECONNECT is not added and must handled manually.
     *
     * @see SizeManager.removeListeners
     */
    SizeManager.prototype.addListeners = function() {
        var that;
        that = this;
        this.node.events.step.on('in.say.PCONNECT', function(p) {
            that.changeHandler('pconnect', p.data);
        }, 'plManagerCon');
        this.node.events.step.on('in.say.PDISCONNECT', function(p) {
            that.changeHandler('pdisconnect', p.data);
        }, 'plManagerDis');
    };

    /**
     * ### SizeManager.removeListeners
     *
     * Removes the listeners to disconnect and connect
     *
     * Notice: PRECONNECT is not added and must handled manually.
     *
     * @see SizeManager.addListeners
     */
    SizeManager.prototype.removeListeners = function() {
        this.node.events.step.off('in.say.PCONNECT', 'plManagerCon');
        this.node.events.step.off('in.say.PDISCONNECT', 'plManagerDis');
    };

    // ## Helper methods.

   /**
     * ### checkMinMaxExactParams
     *
     * Checks the parameters of min|max|exactPlayers property of a step
     *
     * @param {string} name The name of the parameter: min|max|exact
     * @param {number|array} property The property to check
     * @param {NodeGameClient} node Reference to the node instance
     *
     * @see SizeManager.init
     */
    function checkMinMaxExactParams(name, property, node) {
        var num, cb, recoverCb, newArray;

        if ('number' === typeof property) {
            newArray = true;
            property = [property];
        }
        else if (!J.isArray(property)) {
            throw new TypeError('SizeManager.init: ' + name +
                                'Players property must be number or ' +
                                'non-empty array. Found: ' + property);
        }

        num = property[0];
        cb = property[1] || null;
        recoverCb = property[2] || null;

        if (num === '@') {
            num = node.game.pl.size() || 1;
            // Recreate the array to avoid altering the reference.
            if (!newArray) {
                property = property.slice(0);
                property[0] = num;
            }
        }
        else if (num !== '*' &&
                 ('number' !== typeof num || !isFinite(num) || num < 1)) {

            throw new TypeError('SizeManager.init: ' + name +
                                'Players must be a finite number greater ' +
                                'than 1 or a wildcard (*,@). Found: ' + num);
        }

        if (!cb) {
            property[1] = null;
        }
        else if ('function' !== typeof cb) {

            throw new TypeError('SizeManager.init: ' + name +
                                'Players cb must be ' +
                                'function or undefined. Found: ' + cb);
        }

        if (!recoverCb) {
            property[2] = null;
        }
        else if ('function' !== typeof cb) {

            throw new TypeError('SizeManager.init: ' + name +
                                'Players recoverCb must be ' +
                                'function or undefined. Found: ' + recoverCb);
        }

        return property;
    }


    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
