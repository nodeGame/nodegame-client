/**
 * # Stepping Rules
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * ---
 */
(function (exports, parent) {

    exports.stepRules = {};
    
    // Renaming parent to node, so that functions can be executed
    // context-less in the browser too.
    var node = parent;

    // ## SYNC_ALL
    // Player waits that all the clients have terminated the
    // current step before going to the next
    exports.stepRules.SYNC_ALL = function(stage, myStageLevel, pl, game) {
        return myStageLevel === node.constants.stageLevels.DONE &&
            pl.isStepDone(stage);
    };

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

    // ## SYNC_STAGE
    // Player can advance freely within the steps of one stage,
    // but has to wait before going to the next one
    exports.stepRules.SYNC_STAGE = function(stage, myStageLevel, pl, game) {
        var iamdone = myStageLevel === node.constants.stageLevels.DONE;
        console.log();
        console.log('*** myStageLevel: ' + myStageLevel + ' (iamdone: ' + iamdone + ')');
        console.log('*** stepsToNextStage: ' + game.plot.stepsToNextStage(stage));
        console.log('*** isStepDone [upTo]: ' + pl.isStepDone(stage, true));
        if (game.plot.stepsToNextStage(stage) > 1) {
            return iamdone;
        }
        else {
            // if next step is going to be a new stage, wait for others
            return iamdone && pl.isStepDone(stage, true);
        }
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);
