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
     *
     * @see NodeGameClient.game.plot
     * @see NodeGameClient.game.pl
     */
    function SizeManager(node) {

        // References added for convenience.
        this.node = node;
        this.plot = this.node.game.plot;
        this.pl = this.node.game.pl;

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
        this.changeHandler = function(op, obj) { return true };

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
     * Evaluates the requirements for the step and store references internally
     *
     * If required, it adds a listener to changes in the size of player list.
     *
     * @param {GameStage} step Optional. The step to evaluate.
     *   Default: node.player.stage
     *
     * @return {boolean} TRUE if a full handler was added
     *
     * @see SizeManager.changeHandlerFull
     */
    SizeManager.prototype.init = function(step) {
        var node;
        var property, handler;
        var doPlChangeHandler;

        node = this.node;
        step = step || node.player.stage;

        property = this.plot.getProperty(step, 'minPlayers');
        if (property) {
            property = checkMinMaxExactParams('min', property, node);
            this.minThresold = property[0];
            this.minCb = property[1] || null;
            this.minRecoverCb = property[2] || null;

            doPlChangeHandler = true;
        }

        property = this.plot.getProperty(step, 'maxPlayers');
        if (property) {
            property = checkMinMaxExactParams('max', property, node);
            this.maxThreshold = property[0];
            this.maxCb = property[1] || null;
            this.maxRecoverCb = property[2] || null;

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

        property = this.plot.getProperty(step, 'exactPlayers');
        if (property) {
            if (doPlChangeHandler) {
                throw new Error('SizeManager.init: exactPlayers ' +
                                'cannot be set if either minPlayers or ' +
                                'maxPlayers is set.');
            }
            property = checkMinMaxExactParams('exact', property, node);
            this.exactThreshold = property[0];
            this.exactCb = property[1] || null;
            this.exactRecoverCb = property[2] || null;

            doPlChangeHandler = true;
        }

        if (doPlChangeHandler) {

            this.changeHandler = this.changeHandlerFull;

            // Check conditions explicitly:
            this.changeHandler('init');

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
        nPlayers = this.pl.size();

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
        var game, res

        res = true;
        game = this.node.game;
        nPlayers = game.pl.size();
        // Players should count themselves too.
        if (!this.node.player.admin) nPlayers++;

        threshold = this.minThreshold;
        if (minThreshold) {
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
                    cb.call(game, 'min', this.minRecoverCb, player);
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
                    cb.call(game, 'max', this.maxRecoverCb, player);
                }
                // Must stay outside if.
                this.maxCbCalled = false;
            }
        }

        threshold = this.exactThreshold
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
                    cb.call(game, 'exact', this.exactRecoverCb, player);
                }
                // Must stay outside if.
                this.exactCbCalled = false;
            }
        }

        return res;
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
            that.changehandler('pconnect', p);
        }, 'plManager');
        this.node.events.step.on('in.say.PDISCONNECT', function(p) {
            that.changeHandler('pdisconnect', p);
        }, 'plManager');
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
        this.node.events.step.off('in.say.PCONNECT', 'plManager');
        this.node.events.step.off('in.say.PDISCONNECT','plManager');
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
        cb = property[1];
        recoverCb = property[2];

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
                                'than 1 or one of the wildcards: *,@. Found: ' +
                                num);
        }

        if ('undefined' !== typeof cb && 'function' !== typeof cb) {

            throw new TypeError('SizeManager.init: ' + name +
                                'Players cb must be ' +
                                'function or undefined. Found: ' + cb);
        }

        if ('undefined' !== typeof recoverCb && 'function' !== typeof cb) {

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


//  // Register event handler.
//  handler = function(op, player) {
//      var cb, nPlayers, wrongNumCb, correctNumCb;
//      var minThreshold, maxThreshold, exacThreshold;
//      var that, res;
//      res = true;
//      that = node.game;
//      nPlayers = node.game.pl.size();
//      // Players should count themselves too.
//      if (!node.player.admin) nPlayers++;
//
//      minThreshold = that.minPlayers;
//      maxThreshold = that.maxPlayers;
//      exactThreshold = that.exactPlayers;
//
//      if (minThreshold) {
//          if (op === 'pconnect') {
//              if (that.minPlayersCbCalled) {
//                  console.log('calling recovery threshold');
//                  cb = that.getProperty('onCorrectPlayerNum');
//                  cb.call(that, 'min', minRecoverCb, player);
//                  that.minPlayersCbCalled = false;
//              }
//          }
//          // pdisconnect.
//          else if (op === 'pdisconnect') {
//              if (minThreshold === '*' ||
//                   nPlayers < minThreshold) {
//
//                  if (!that.minPlayersCbCalled) {
//                      console.log('calling disconnect threshold');
//                      that.minPlayersCbCalled = true;
//                      cb = that.getProperty('onWrongPlayerNum');
//                      cb.call(that, 'min', minCallback, player);
//                  }
//                  res = false;
//              }
//          }
//      }
//
//      if (maxThreshold) {
//          if (op === 'pdisconnect') {
//              if (that.maxPlayersCbCalled) {
//                  cb = that.getProperty('onCorrectPlayerNum');
//                  cb.call(that, 'max', maxRecoverCb);
//                  that.maxPlayersCbCalled = false;
//              }
//          }
//          else if (op === 'pconnect') {
//              if (maxThreshold === '*' ||
//                  nPlayers > maxThreshold) {
//
//                  if (!that.maxPlayersCbCalled) {
//                      that.maxPlayersCbCalled = true;
//                      cb = that.getProperty('onWrongPlayerNum');
//                      cb.call(that, 'max', maxCallback);
//                  }
//                  res = false;
//              }
//          }
//      }
//
//      if (exactThreshold) {
//          if (that.exactPlayersCbCalled) {
//              cb = that.getProperty('onCorrectPlayerNum');
//              cb.call(that, 'exact', exactRecoverCb);
//              that.exactPlayersCbCalled = false;
//          }
//
//          else if (exactThreshold === '*' ||
//              nPlayers !== exactThreshold) {
//
//              if (!that.exactPlayersCbCalled) {
//                  that.exactPlayersCbCalled = true;
//                  cb = that.getProperty('onWrongPlayerNum');
//                  cb.call(that, 'exact', exactCallback);
//              }
//              res = false;
//          }
//      }
//
//      return res;
//  };
