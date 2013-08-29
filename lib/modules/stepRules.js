/**
 * # Stepping Rules
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` variables and constants module
 *
 * ---
 *
 */

(function (exports, parent) {

    
    // ## SYNC_ALL
    // Player waits that all the clients have terminated the
    // current step before going to the next
    exports.SYNC_ALL = function(stage, myStageLevel, pl, game) {
        return myStageLevel === this.stageLevels.DONE &&
            pl.isStepDone(stage);
    };

    // ## SOLO
    // Player proceeds to the next step as soon as the current one
    // is DONE, regardless to the situation of other players
    exports.SOLO = function(stage, myStageLevel, pl, game) {
        return myStageLevel === this.stageLevels.DONE;
    };

    // ## WAIT
    // Player waits for explicit step command
    exports.WAIT = function(stage, myStageLevel, pl, game) {
        return false;
    };

    // ## SYNC_STAGE
    // Player can advance freely within the steps of one stage,
    // but has to wait before going to the next one
    exports.SYNC_STAGE = function(stage, myStageLevel, pl, game) {
        var iamdone = myStageLevel === this.stageLevels.DONE;
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
 ,  'undefined' != typeof node ? node : module.parent.exports
);