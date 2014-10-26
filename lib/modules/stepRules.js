/**
 * # Stepping Rules
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Collections of rules to determine whether the game should step.
 * ---
 */
(function(exports, parent) {

    "use strict";

    exports.stepRules = {};
    
    // Renaming parent to node, so that functions can be executed
    // context-less in the browser too.
    var node = parent;

    // ## SOLO
    // Player proceeds to the next step as soon as the current one
    // is DONE, regardless to the situation of other players
    exports.stepRules.SOLO = function(stage, myStageLevel, pl, game) {
        return myStageLevel === node.constants.stageLevels.DONE;
    };

    // ## WAIT
    // Player waits for explicit step command
    exports.stepRules.WAIT = function(stage, myStageLevel, pl, game) {
        return false;
    };

    // ## SYNC_STEP
    // Player waits that all the clients have terminated the
    // current step before going to the next
    exports.stepRules.SYNC_STEP = function(stage, myStageLevel, pl, game) {
        return myStageLevel === node.constants.stageLevels.DONE &&
            pl.isStepDone(stage);
    };

    // ## SYNC_STAGE
    // Player can advance freely within the steps of one stage,
    // but has to wait before going to the next one
    exports.stepRules.SYNC_STAGE = function(stage, myStageLevel, pl, game) {
        var iamdone = myStageLevel === node.constants.stageLevels.DONE;
        if (game.plot.stepsToNextStage(stage) > 1) {
            return iamdone;
        }
        else {
            // If next step is going to be a new stage, wait for others.
            return iamdone && pl.isStepDone(stage, 'STAGE_UPTO');
        }
    };

    // ## OTHERS_SYNC_STEP
    // All the players in the player list must be sync in the same
    // stage and DONE. My own stage does not matter.
    exports.stepRules.OTHERS_SYNC_STEP = function(stage, myStageLevel, pl) {
        var stage;
        if (!pl.size()) return false;
        stage = pl.first().stage;
        return pl.arePlayersSync(stage, node.constants.stageLevels.DONE,
                                 'EXACT');
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
