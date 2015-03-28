/**
 * Exposing the node object
 */
(function() {
    var tmp = new window.node.NodeGameClient();
    JSUS.mixin(tmp, window.node);
    window.node = tmp;
})();
