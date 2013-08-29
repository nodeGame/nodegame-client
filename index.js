/**
 * # nodeGame
 * 
 * Social Experiments in the Browser
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * nodeGame is a free, open source, event-driven javascript framework for on line, 
 * multiplayer games in the browser.
 * 
 * 
 */

(function (exports) {

    if ('object' === typeof module && 'function' === typeof require) {
        // <!-- Node.js -->

        // Load all classes
        var ngc = require('./init.node.js');

        exports.getClient = function(options) {
            var node;
            node = new ngc.NodeGameClient();
            ngc.JSUS.mixin(node, ngc.constants); // TODO maybe not necessary, maybe keep them in .constants
            ngc.JSUS.mixin(node, ngc.stepRules); // TODO see above
            return node;
        }
    }
    else {
        // <!-- Browser -->
        if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
        if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
        if ('undefined' !== typeof store) node.store = store;
        
        node.support = JSUS.compatibility();
    }
    
})('object' === typeof module ? module.exports : (window.node = {}));	
