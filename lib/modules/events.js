/**
 * # Events
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` events handling
 */

(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var GameStage = parent.GameStage;

    var STAGE_INIT = parent.constants.stateLevels.STAGE_INIT;
    var STAGE_EXIT = parent.constants.stateLevels.STAGE_EXIT;

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
        var gameStage, stateL;

        // NodeGame default listeners
        if (!this.game) return this.events.ee.ng;
        gameStage = this.game.getCurrentGameStage();
        if (!gameStage) return this.events.ee.ng;

        // Game listeners.
        if ((GameStage.compare(gameStage, new GameStage()) === 0 )) {
            return this.events.ee.game;
        }

        // Stage listeners.
        stateL = this.game.getStateLevel();
        if (stateL === STAGE_INIT || stateL === STAGE_EXIT) {
            return this.events.ee.stage;
        }

        // Step listeners.
        return this.events.ee.step;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
