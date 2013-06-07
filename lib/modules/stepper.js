/**
 * # Stager
 *
 * `nodeGame` container and builder of the game sequence
 *
 * ---
 */
(function(exports, node) {

    // Storage for socket rules
    var rules = {};

    addDefaultRules();

    function getRules() {
    	return rules;
    }

    function get( id ) {
    	return rules[id];
    }

    function register( id, cb ) {
    	if ('undefined' === typeof id) {
            node.err('stepper rule id cannot be undefined');
        }

        else if ('function' !== typeof cb) {
            node.err('stepping rule is not a function');
        }

        else {
            rules[id] = cb;
        }

    }

    function addDefaultRules() {
        
        // ### SYNC_ALL
        // Player waits that all the clients have terminated the 
        // current step before going to the next
        rules['SYNC_ALL'] = function(stage, myStageLevel, pl, game) {
            console.log('SYNC_ALL');
            console.log(arguments);
            return myStageLevel === node.Game.stageLevels.DONE &&
                pl.isStageDone(stage);
        };
        
        // ### SOLO
        // Player proceeds to the next step as soon as the current one
        // is DONE, regardless to the situation of other players
        rules['SOLO'] = function(stage, myStageLevel, pl, game) {
            return myStageLevel === node.Game.stageLevels.DONE;
        };

        // ### WAIT
        // Player waits for explicit step command
        rules['WAIT'] = function(stage, myStageLevel, pl, game) {
            return false;
        };
    
        // ### SYNC_STAGE
        // Player can advance freely within the steps of one stage,
        // but has to wait before going to the next one
        rules['SYNC_STAGE'] = function(stage, myStageLevel, pl, game) {
            // if next step is going to be a new stage, wait for others
            return myStageLevel === node.Game.stageLevels.DONE;
                (game.gameLoop.stepsToNextStage(stage) > 1 ||
                 pl.isStageDone(stage));
        };
    }

    function clear() {
        rules = {};
    }

    // expose the methods
    node.stepRules = {
    	getRules: getRules,
    	get: get,
    	register: register,
        clear: clear,
        addDefaultRules: addDefaultRules
    };


// ## Closure
})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);