/**
 * # Stepping Rules
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Collections of rules to determine whether the game should step forward.
 */
(function(exports, parent) {

    "use strict";

    exports.stepRules = {};

    // Renaming parent to node, so that functions can be executed
    // context-less in the browser too.
    var node = parent;

    // Important! Cannot define DONE = node.constants.stageLevels.DONE;
    // It is not defined on browsers then.

    // ## SOLO
    //
    // Always steps when current step is DONE
    //
    exports.stepRules.SOLO = function(stage, myStageLevel, pl, game) {
        return myStageLevel === node.constants.stageLevels.DONE;
    };

    // ## SOLO_STEP
    //
    // Steps when current step is DONE, but only if it is not last step in stage
    //
    // When the last step in current stage is done, then it waits
    // for an explicit step command.
    //
    exports.stepRules.SOLO_STEP = function(stage, myStageLevel, pl, game) {
        // If next step is going to be a new stage, then wait.
        if (game.plot.stepsToNextStage(stage, true) === 1) return false;
        else return myStageLevel === node.constants.stageLevels.DONE;
    };

    // ## WAIT
    //
    // Always waits for explicit step command
    //
    exports.stepRules.WAIT = function(stage, myStageLevel, pl, game) {
        return false;
    };

    // ## SYNC_STEP
    //
    // Steps when current step is DONE for all clients (including itself)
    //
    // If no other clients are connected, then it behaves like SOLO.
    //
    exports.stepRules.SYNC_STEP = function(stage, myStageLevel, pl, game) {
        return myStageLevel === node.constants.stageLevels.DONE &&
            pl.isStepDone(stage);
    };

    // ## SYNC_STAGE
    //
    // Like SOLO, but in the last step of a stage behaves like SYNC_STEP
    //
    // If no other clients are connected, then it behaves like SOLO also
    // in the last step.
    //
    // Important: it assumes that the number of steps in current
    // stage is the same in all clients (including this one).
    //
    exports.stepRules.SYNC_STAGE = function(stage, myStageLevel, pl, game) {
        var iamdone;
        iamdone = myStageLevel === node.constants.stageLevels.DONE;
        // If next step is going to be a new stage, wait for others.
        if (game.plot.stepsToNextStage(stage) > 1) return iamdone;
        else return iamdone && pl.isStepDone(stage, 'STAGE_UPTO');
    };

    // ## OTHERS_SYNC_STEP
    //
    // Like SYNC_STEP, but does not look at own stage level
    //
    // If no other clients are connected, then it behaves like WAIT.
    //
    exports.stepRules.OTHERS_SYNC_STEP = function(stage, myStageLevel, pl) {
        if (!pl.size()) return false;
        stage = pl.first().stage;
        return pl.arePlayersSync(stage, node.constants.stageLevels.DONE,
                                 'EXACT');
    };

    // ## OTHERS_SYNC_STAGE
    //
    // Like SYNC_STAGE, but does not look at own stage level
    //
    // If no other clients are connected, then it behaves like WAIT.
    //
    // Important: it assumes that the number of steps in current
    // stage is the same in all clients (including this one).
    //
    exports.stepRules.OTHERS_SYNC_STAGE = function(stage, myStageLevel, pl,
                                                   game) {

        var nSteps;
        if (!pl.size()) return false;
        stage = pl.first().stage;
        nSteps = game.plot.stepsToNextStage(stage);
        // Manual clone in case there are more steps to go.
        if (nSteps !== 1) {
            stage = {
                stage: stage.stage,
                step: stage.step + (nSteps - 1),
                round: stage.round
            };
        }
        return pl.arePlayersSync(stage, node.constants.stageLevels.DONE,
                                 'EXACT', true);
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
