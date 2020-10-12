/**
 * # GameMsgGenerator
 *
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` component rensponsible creating messages
 *
 * Static factory of objects of type `GameMsg`.
 *
 * @see GameMsg
 * @see node.target
 * @see node.action
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

    // ## GameMsgGenerator methods

    /**
     * ### GameMsgGenerator.create
     *
     * Primitive for creating a new GameMsg object
     *
     * Decorates an input object with all the missing properties
     * of a full GameMsg object.
     *
     * By default GAMECOMMAND, REDIRECT, PCONNET, PDISCONNECT, PRECONNECT
     * have priority 1, all the other targets have priority 0.
     *
     * @param {object} msg Optional. The init object
     *
     * @return {GameMsg} The full GameMsg object
     *
     * @see GameMsg
     */
    GameMsgGenerator.prototype.create = function(msg) {
        var gameStage, priority, node;
        node = this.node;

        if (msg.stage) {
            gameStage = msg.stage;
        }
        else {
            gameStage = node.game ?
                node.game.getCurrentGameStage() : new GameStage('0.0.0');
        }

        if ('undefined' !== typeof msg.priority) {
            priority = msg.priority;
        }
        else if (msg.target === constants.target.GAMECOMMAND ||
                 msg.target === constants.target.REDIRECT ||
                 msg.target === constants.target.PCONNECT ||
                 msg.target === constants.target.PDISCONNECT ||
                 msg.target === constants.target.PRECONNECT ||
                 msg.target === constants.target.SERVERCOMMAND ||
                 msg.target === constants.target.SETUP) {

            priority = 1;
        }
        else {
            priority = 0;
        }

        return new GameMsg({
            session: 'undefined' !== typeof msg.session ?
                msg.session : node.socket.session,
            stage: gameStage,
            action: msg.action || constants.action.SAY,
            target: msg.target || constants.target.DATA,
            from: node.player ? node.player.id : constants.UNDEFINED_PLAYER,
            to: 'undefined' !== typeof msg.to ? msg.to : 'SERVER',
            text: 'undefined' !== typeof msg.text ? "" + msg.text : null,
            data: 'undefined' !== typeof msg.data ? msg.data : {},
            priority: priority,
            reliable: msg.reliable || 1
        });

    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
