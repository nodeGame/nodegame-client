/**
 * Exposing the node object
 */
(function (node) {

    var tmp = node;
    node = new exports.NodeGameClient();
    JSUS.mixin(node, tmp);

})(window.node);