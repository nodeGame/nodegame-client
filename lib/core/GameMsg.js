/**
 * # GameMsg
 *
 * Copyright(c) 2018 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` exchangeable data format
 */
(function(exports, node) {

    "use strict";

    // ## Global scope
    var GameStage = node.GameStage,
    J = node.JSUS;

    exports.GameMsg = GameMsg;

    /**
     * ### GameMSg.clone (static)
     *
     * Returns a perfect copy of a game-message
     *
     * @param {GameMsg} gameMsg The message to clone
     * @return {GameMsg} The cloned messaged
     */
    GameMsg.clone = function(gameMsg) {
        return new GameMsg(gameMsg);
    };

    /**
     * ## GameMsg constructor
     *
     * Creates an instance of GameMsg
     *
     * @param {object} gm Optional. Initial values for the game message fields
     */
    function GameMsg(gm) {
        gm = gm || {};

        /**
         * ### GameMsg.id
         *
         * A randomly generated unique id
         */
        this.id = 'undefined' === typeof gm.id ?
            Math.floor(Math.random()*1000000) : gm.id;

        /**
         * ### GameMsg.sid
         *
         * The socket id, if provided
         *
         * Used by SocketIO to prevent spoofing, not used by other sockets
         * TODO: could this be session instead?
         */
        this.sid = gm.sid;

        /**
         * ### GameMsg.session
         *
         * The session id in which the message was generated
         */
        this.session = gm.session;

        /**
         * ### GameMsg.stage
         *
         * The game-stage in which the message was generated
         *
         * @see GameStage
         */
        this.stage = gm.stage;

        /**
         * ### GameMsg.action
         *
         * The action of the message
         *
         * @see node.constants.action
         */
        this.action = gm.action;

        /**
         * ### GameMsg.target
         *
         * The target of the message
         *
         * @see node.constants.target
         */
        this.target = gm.target;

        /**
         * ### GameMsg.from
         *
         * The id of the sender of the message
         *
         * @see Player.id
         * @see node.player.id
         */
        this.from = gm.from;

        /**
         * ### GameMsg.to
         *
         * The id of the receiver of the message
         *
         * @see Player.id
         * @see node.player.id
         */
        this.to = gm.to;

        /**
         * ### GameMsg.text
         *
         * An optional text adding a description for the message
         */
        this.text = gm.text;

        /**
         * ### GameMsg.data
         *
         * An optional payload field for the message
         */
        this.data = gm.data;

        /**
         * ### GameMsg.priority
         *
         * A priority index associated to the message
         */
        this.priority = gm.priority;

        /**
         * ### GameMsg.reliable
         *
         * Experimental. Disabled for the moment
         *
         * If set, requires ackwnoledgment of delivery
         */
        this.reliable = gm.reliable;

        /**
         * ### GameMsg.created
         *
         * A timestamp of the date of creation
         */
        this.created = J.getDate();

        /**
         * ### GameMsg.forward
         *
         * If TRUE, the message is a forward.
         *
         * E.g. between nodeGame servers
         */
        this.forward = 0;
    }

    /**
     * ### GameMsg.stringify
     *
     * Calls JSON.stringify on the message
     *
     * @return {string} The stringified game-message
     *
     * @see GameMsg.toString
     */
    GameMsg.prototype.stringify = function() {
        return JSON.stringify(this);
    };

    // ## GameMsg methods

    /**
     * ### GameMsg.toString
     *
     * Creates a human readable string representation of the message
     *
     * @return {string} The string representation of the message
     * @see GameMsg.stringify
     */
    GameMsg.prototype.toString = function() {
        var SPT, TAB, DLM, line, UNKNOWN, tmp;
        SPT = ",\t";
        TAB = "\t";
        DLM = "\"";
        UNKNOWN = "\"unknown\"\t";
        line  = this.created + SPT;
        line += this.id + SPT;
        line += this.session + SPT;
        line += this.action + SPT;

        line += this.target ?
            this.target.length < 6  ?
            this.target + SPT + TAB : this.target + SPT : UNKNOWN;
        line += this.from ?
            this.from.length < 6  ?
            this.from + SPT + TAB : this.from + SPT : UNKNOWN;
        line += this.to ?
            this.to.length < 6  ?
            this.to + SPT + TAB : this.to + SPT : UNKNOWN;

        if (this.text === null || 'undefined' === typeof this.text) {
            line += "\"no text\"" + SPT;
        }
        else if ('number' === typeof this.text) {
            line += "" + this.text;
        }
        else {
            tmp = this.text.toString();

            if (tmp.length > 12) {
                line += DLM + tmp.substr(0,9) + "..." + DLM + SPT;
            }
            else if (tmp.length < 6) {
                line += DLM + tmp + DLM + SPT + TAB;
            }
            else {
                line += DLM + tmp + DLM + SPT;
            }
        }

        if (this.data === null || 'undefined' === typeof this.data) {
            line += "\"no data\"" + SPT;
        }
        else if ('number' === typeof this.data) {
            line += "" + this.data;
        }
        else {
            tmp = this.data.toString();
            if (tmp.length > 12) {
                line += DLM + tmp.substr(0,9) + "..." + DLM + SPT;
            }
            else if (tmp.length < 9) {
                line += DLM + tmp + DLM + SPT + TAB;
            }
            else {
                line += DLM + tmp + DLM + SPT;
            }
        }

        line += new GameStage(this.stage) + SPT;
        line += this.reliable + SPT;
        line += this.priority;
        return line;
    };

    /**
     * ### GameMSg.toSMS
     *
     * Creates a compact visualization of the most important properties
     *
     * @return {string} A compact string representing the message
     *
     * TODO: Create an hash method as for GameStage
     */
    GameMsg.prototype.toSMS = function() {
        var line = '[' + this.from + ']->[' + this.to + ']\t';
        line += '|' + this.action + '.' + this.target + '|'+ '\t';
        line += ' ' + this.text + ' ';
        return line;
    };

    /**
     * ### GameMsg.toInEvent
     *
     * Hashes the action and target properties of an incoming message
     *
     * @return {string} The hash string
     * @see GameMsg.toEvent
     */
    GameMsg.prototype.toInEvent = function() {
        return 'in.' + this.toEvent();
    };

    /**
     * ### GameMsg.toOutEvent
     *
     * Hashes the action and target properties of an outgoing message
     *
     * @return {string} The hash string
     * @see GameMsg.toEvent
     */
    GameMsg.prototype.toOutEvent = function() {
        return 'out.' + this.toEvent();
    };

    /**
     * ### GameMsg.toEvent
     *
     * Hashes the action and target properties of the message
     *
     * @return {string} The hash string
     */
    GameMsg.prototype.toEvent = function() {
        return this.action + '.' + this.target;
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
