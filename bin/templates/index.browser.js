/**
 * # nodeGame: Social Experiments in the Browser
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * nodeGame is a free, open source, event-driven javascript framework,
 * for real-time multiplayer games in the browser.
 */
(function(window) {
    if ('undefined' !== typeof window.node) {
        throw new Error('nodegame-client: a global node variable is already ' +
                        'defined. Aborting...');
    }

    // Defining an empty node object. Will be overwritten later on.
    var node = window.node = {};

    if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
    if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
    if ('undefined' !== typeof store) node.store = store;
    node.support = JSUS.compatibility();

    // Auto-Generated.
    node.version = {VERSION};

})(window);
