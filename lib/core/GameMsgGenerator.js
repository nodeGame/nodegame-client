/**
 * # GameMsgGenerator
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` component rensponsible creating messages
 *
 * Static factory of objects of type `GameMsg`.
 *
 * All message are reliable, but TXT messages.
 *
 * @see GameMSg
 * @see node.target
 * @see node.action
 * ---
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope
    
    exports.GameMsgGenerator = GameMsgGenerator;

    var GameMsg = parent.GameMsg,
    GameStage = parent.GameStage,
    constants = parent.constants;

    /**
     * ## GameMsgGenerator constructor
     *
     * Creates an instance of GameMSgGenerator
     *
     */
    function GameMsgGenerator(node) {
        this.node = node;
    }

    // ## General methods

    /**
     * ### GameMsgGenerator.create
     *
     * Primitive for creating a new GameMsg object
     *
     * Decorates an input object with all the missing properties
     * of a full GameMsg object
     *
     * @param {object} Optional. The init object
     * @return {GameMsg} The full GameMsg object
     *
     * @see GameMsg
     */
    GameMsgGenerator.prototype.create = function(msg) {
        var gameStage, node;
        node = this.node;

        if (msg.stage) {
            gameStage = msg.stage;
        }
        else {
            gameStage = node.game ? node.game.getCurrentGameStage() : new GameStage('0.0.0');
        }

        return new GameMsg({
            session: 'undefined' !== typeof msg.session ? msg.session : node.socket.session,
            stage: gameStage,
            action: msg.action || constants.action.SAY,
            target: msg.target || constants.target.DATA,
            from: node.player ? node.player.id : node.UNDEFINED_PLAYER, // TODO change to id
            to: 'undefined' !== typeof msg.to ? msg.to : 'SERVER',
            text: msg.text || null,
            data: msg.data || null,
            priority: msg.priority || null,
            reliable: msg.reliable || 1
        });

    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
