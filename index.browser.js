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

    if ('undefined' !== typeof JSUS) exports.JSUS = JSUS;
    if ('undefined' !== typeof NDDB) exports.NDDB = NDDB;
    if ('undefined' !== typeof store) exports.store = store;
    exports.support = JSUS.compatibility();        
    
})('object' === typeof module ? module.exports : (window.node = {}));