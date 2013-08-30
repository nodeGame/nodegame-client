/**
 * # nodeGame
 *
 * Social Experiments in the Browser
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * nodeGame is a free, open source, event-driven javascript framework for on line,
 * multiplayer games in the browser.
 */
(function (exports) {

    if ('object' === typeof module && 'function' === typeof require) {
        // <!-- Node.js -->

        // TODO: why is it no working with just exports ?

        // Load all classes
        module.exports = require('./init.node.js');

        module.exports.getClient = function(options) {
            var node;
            node = new module.exports.NodeGameClient();
            module.exports.JSUS.mixin(node, exports.constants); // TODO maybe not necessary, maybe keep them in .constants
            module.exports.JSUS.mixin(node, exports.stepRules); // TODO see above
            
            // TODO: find a good way to incorpare all the classes
            
            node.Stager = module.exports.Stager;
            node.stepRules = module.exports.stepRules;
            node.NodeGameRuntimeError = module.exports.NodeGameRuntimeError;
            node.NodeGameStageCallbackError = module.exports.NodeGameStageCallbackError;
            node.NodeGameMisconfiguredGameError = module.exports.NodeGameMisconfiguredGameError;
            node.NodeGameIllegalOperationError = module.exports.NodeGameIllegalOperationError;

            
            return node;
        }

    }
    else {
        // <!-- Browser -->
        if ('undefined' !== typeof JSUS) exports.JSUS = JSUS;
        if ('undefined' !== typeof NDDB) exports.NDDB = NDDB;
        if ('undefined' !== typeof store) exports.store = store;

        exports.support = JSUS.compatibility();
    }

})('object' === typeof module ? module.exports : (window.node = {}));