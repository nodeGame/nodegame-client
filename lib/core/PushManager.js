/**
 * # PushManager
 *
 * Push players to advance to next step, otherwise disconnects them.
 *
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 */
(function(exports, parent) {

    "use strict";

    var GameStage = parent.GameStage;
    var J = parent.JSUS;

    var DONE = parent.constants.stageLevels.DONE;

    PushManager.replyWaitTime = 4000;
    PushManager.checkPushWaitTime = 5000;
    PushManager.offsetWaitTime = 10000;

    /**
     * ## PushManager.
     *
     * Creates a new instance of PushManager
     *
     * @param {NodeGameClient} node A nodegame-client instance
     * @param {object} options Optional. Configuration options
     */
    function PushManager(node, options) {

        /**
         * ### PushManager.node
         *
         * Reference to a nodegame-client instance
         */
        this.node = node;

        /**
         * ### PushManager.timeout
         *
         * The timeout object that will fire the checking of clients
         *
         * @see PushManager.startTimeout
         */
        this.timeout = null;

        /**
         * ### PushManager.offsetWaitTime
         *
         * Time that is always added to the timer value of
         *
         * @see PushManager.startTimeout
         */
        this.offsetWaitTime = PushManager.offsetWaitTime;

        /**
         * ### PushManager.replyWaitTime
         *
         * Time to wait to get a reply from a pushed client
         *
         * @see PushManager.pushGame
         */
        this.replyWaitTime = PushManager.replyWaitTime;

        /**
         * ### PushManager.checkPushWaitTime
         *
         * Time to wait to check if a pushed client updated its state
         *
         * @see PushManager.pushGame
         */
        this.checkPushWaitTime = PushManager.checkPushWaitTime;


        this.init(options);
    };

    /**
     * ### PushManager.init
     *
     * Inits the configuration for the instance
     *
     * @param {object} Optional. Configuration object
     */
    PushManager.prototype.init = function(options) {
        options = options || {};

        if ('number' === typeof options.offsetWaitTime) {
            this.offsetWaitTime === options.offsetWaitTime;
        }
        if ('number' === typeof options.replyWaitTime) {
            this.replyWaitTime === options.replyWaitTime;
        }
        if ('number' === typeof options.checkPushWaitTime) {
            this.checkPushWaitTime === options.checkPushWaitTime;
        }
    };

    /**
     * ## PushManager.startTimeout
     *
     * Sets a timeout for checking if all clients have finished current step
     *
     * The length of the timeout is equal to timer + offset.
     *
     * By default, it looks up the `timer` property in the current
     * step object. If no `timer` property is found, timer is set to 0.
     *
     * If timeout expires `PushManager.pushGame` will be called.
     *
     * @param {number} timer Optional. If set, overwrite the default behavior
     *   and this number will be used instead of the `timer` property from
     *   current step object.
     *
     * @see PushManager.offsetWaitTime
     * @see PushManager.pushGame
     */
    PushManager.prototype.startTimeout = function(timer) {
        var node, gameStage, timer;

        node = this.node;

        if (this.timeout) this.clearTimeout();

        // Determine the value for timer. Total timeout = timer + offset.
        if ('undefined' === typeof timer) {
            gameStage = node.game.getCurrentGameStage();
            timer = node.game.plot.getProperty(gameStage, 'timer');
            console.log('Setting push game function.');
            if ('function' === typeof timer) timer = timer.call(node.game);
        }
        else if ('number' !== typeof timer) {
            throw new TypeError('PushManager.startTimeout: timer must be ' +
                                'number or undefined.');
        }
        timer = timer || 0;

        this.timeout = setTimeout(this.pushGame, (timer + this.offsetWaitTime));
    };

    /**
     * ## PushManager.clearTimeout
     *
     * Clears timeout for checking if all clients have finished current step
     *
     * @see PushManager.startTimeout
     */
    PushManager.prototype.clearTimeout = function() {
        console.log('Clearing old push players timeout.');
        clearTimeout(this.timeout);
    };

    /**
     * ### PushManager.pushGame
     *
     * Pushes any client that is connected, but not DONE, to step forward
     *
     * It sends a GET message to all clients whose stage level is not
     * marked as DONE (100), and waits for the reply. If the reply does
     * not arrive it will disconnect them. If the reply arrives, it will
     * later check if they manage to step, and if not disconnects them.
     *
     * @see checkIfPushWorked
     */
    PushManager.prototupe.pushGame = function() {
        var that, node;
        that = this;
        node = this.node;
        node.log('node.pushManager: timeout expired, shall we push somebody?');
        node.game.pl.each(function(p) {
            var stage;
            if (p.stageLevel !== DONE) {
                console.log('Push needed ', p.id);
                stage = p.stage;
                // Send push.
                node.get('pushGame',
                         function(value) {
                             checkIfPushWorked(node, p, that.checkPushWaitTime);
                         },
                         p.id,
                         {
                             timeoutCb: function() {

                                 // No reply to GET, disconnect client.
                                 node.log('node.pushManager: no reply from ' +
                                          p.id);
                                 forceDisconnect(node, p);
                             },
                             timeout: that.replyWaitTime,
                             executeOnce: true
                         });
            }
        });
    };

    // ## Helper methods

    /**
     * ### checkIfPushWorked
     *
     * Checks whether the stage of a client has changed after
     *
     * @param {NodeGameClient} node The node instance used to send msg
     * @param {object} p The player object containing info about id and sid
     * @param {number} milliseconds Optional The number of milliseconds to
     *   wait before checking again the stage of a client. Default 0.
     */
    function checkIfPushWorked(node, p, milliseconds) {
        var stage;
        node.log('node.pushManager: checking if push worked for ', p.id);
        stage = {
            stage: p.stage.stage, step: p.stage.step, round: p.stage.round
        };
        setTimeout(function() {
            var pp;
            if (node.game.pl.exist(p.id)) {
                pp = node.game.pl.get(p.id);
                if (GameStage.compare(pp.stage, stage) === 0) {
                    node.log('node.pushManager: push did not work for ', p.id);
                    forceDisconnect(node, pp);
                }
                else {
                    node.log('node.pushManager: push worked for ', p.id);
                }
            }
        }, milliseconds || 0);
    }

    /**
     * ### forceDisconnect
     *
     * Disconnects one player by sending a DISCONNECT msg to server
     *
     * @param {NodeGameClient} node The node instance used to send msg
     * @param {object} p The player object containing info about id and sid
     */
    function forceDisconnect(node, p) {
        var msg;
        msg = node.msg.create({
            target: 'SERVERCOMMAND',
            text: 'DISCONNECT',
            data: {
                id: p.id,
                sid: p.sid
            }
        });
        node.socket.send(msg);
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
