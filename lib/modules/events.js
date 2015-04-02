/**
 * # Events
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` events handling
 */

(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var GameStage = parent.GameStage;

    var STAGE = parent.constants.stageLevels.UNINITIALIZED;
    var STATE = parent.constants.stageLevels.INITIALIZED;

    /**
     * ### NodeGameClient.getCurrentEventEmitter
     *
     * Returns the currently active event emitter
     *
     * The following event emitters are active:
     *
     *  - NodeGame (ng): before a game is created or started.
     *    Events registered here never deleted.
     *
     *  - Game (game): during the initialization of a game
     *    Events registered here are deleted when a new game
     *    is created.
     *
     *  - Stage (stage): during the initialization of a stage.
     *    Events registered here are deleted when entering a
     *    new stage.
     *
     *  - Step (step): during the initialization of a step.
     *    Events registered here are deleted when entering a
     *    new step.
     *
     * @return {EventEmitter} The current event emitter
     *
     * @see EventEmitter
     * @see EventEmitterManager
     */
    NGC.prototype.getCurrentEventEmitter = function() {
        var gameStage, stageLevel, stateLevel;

        // NodeGame default listeners
        if (!this.game) return this.events.ee.ng;
        gameStage = this.game.getCurrentGameStage()
        if (!gameStage) return this.events.ee.ng;

        // Game listeners.
        if ((GameStage.compare(gameStage, new GameStage()) === 0 )) {
            return this.events.ee.game;
        }

        // Stage listeners.
        if (gameStage.step === 1 && gameStage.round === 1) {
            if (this.game.getStageLevel() === STAGE &&
                this.game.getStateLevel() === STATE) {

                return this.events.ee.stage;
            }
        }

        // Step listeners.
        return this.events.ee.step;
    };

    /**
     * ### NodeGameClient.emit
     *
     * Emits an event locally on all registered event handlers
     *
     * The first parameter be the name of the event as _string_,
     * followed by any number of parameters that will be passed to the
     * handler callback.
     *
     * @see EventEmitterManager.emit
     */
    NGC.prototype.emit = function() {
        return this.events.emit.apply(this.events, arguments);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
