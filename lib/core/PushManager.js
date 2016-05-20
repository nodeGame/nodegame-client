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

    // ## Global scope
    exports.PushManager = PushManager;

    var GameStage = parent.GameStage;
    var J = parent.JSUS;

    var DONE = parent.constants.stageLevels.DONE;
    var PUSH_STEP = parent.constants.gamecommands.push_step;
    var GAMECOMMAND = parent.constants.target.GAMECOMMAND;

    PushManager.replyWaitTime = 2000;
    PushManager.checkPushWaitTime = 2000;
    PushManager.offsetWaitTime = 5000;

    /**
     * ## PushManager constructor
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
         * ### PushManager.timer
         *
         * The timer object that will fire the checking of clients
         *
         * @see PushManager.startTimer
         */
        this.timer = this.node.timer.createTimer({ name: 'push_clients' });

        /**
         * ### PushManager.offsetWaitTime
         *
         * Time that is always added to the timer value of
         *
         * @see PushManager.startTimer
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
    }

    /**
     * ### PushManager.init
     *
     * Inits the configuration for the instance
     *
     * @param {object} Optional. Configuration object
     */
    PushManager.prototype.init = function(options) {
        options = options || {};
        checkAndAssignAllWaitTimes('init', options, this);
    };

    /**
     * ## PushManager.startTimer
     *
     * Sets a timer for checking if all clients have finished current step
     *
     * The length of the timer is equal to timer + offset.
     *
     * By default, it looks up the `timer` property in the current
     * step object. If no `timer` property is found, timer is set to 0.
     *
     * If timer expires `PushManager.pushGame` will be called.
     *
     * @param {object} conf Optional. Configuration passed to `pushGame` method.
     *    The pushMethod will be called when the push-manager timer expires,
     *    that is equal conf.timer + conf.offset. conf.timer is interpreted
     *    by the GameTimer, and can be function, number, object or string.
     *
     * @see PushManager.offsetWaitTime
     * @see PushManager.pushGame
     * @see GameTimer.parseMilliseconds
     */
    PushManager.prototype.startTimer = function(conf) {
        var gameStage, pushCb, that, timer, offset;

        if (this.timer) this.clearTimer();

        conf = conf || {};

        if ('function' === typeof conf.timer) {
            timer = conf.timer.call(this.node.game);
        }
        // timer = GameTimer.parseMilliseconds(conf.timer) || 0;
        timer = timer || 0;

        offset = 'undefined' !== typeof offset ? offset : this.offsetWaitTime;

        that = this;
        pushCb = function() { that.pushGame.call(that, conf); };

        console.log('TIMER: ', timer, this.offsetWaitTime,
                    this.node.player.stage);

        // Make sure milliseconds and update are the same.
        timer = timer + offset;
        this.timer.init({
            milliseconds: timer,
            update: timer,
            timeup: pushCb,
        });

        this.timer.start();
    };

    /**
     * ## PushManager.clearTimer
     *
     * Clears timer for checking if all clients have finished current step
     *
     * @see PushManager.startTimer
     */
    PushManager.prototype.clearTimer = function() {
        console.log('Clearing old push players timer.');
        if (!this.timer.isStopped()) this.timer.stop();
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
    PushManager.prototype.pushGame = function(conf) {
        var m, node, replyWaitTime, checkPushWaitTime;
        node = this.node;

        if ('object' === typeof conf) {
            m = 'pushGame';
            replyWaitTime = checkAndAssignWaitTime(m, conf, 'reply', conf);
            checkPushWaitTime = checkAndAssignWaitTime(m, conf, 'check', conf);
        }
        if ('undefined' === typeof replyWaitTime) {
            replyWaitTime = this.replyWaitTime;
        }
        if ('undefined' === typeof checkPushWaitTime) {
            checkPushWaitTime = this.checkPushWaitTime;
        }

        node.game.pl.each(function(p) {
            var stage;
            if (p.stageLevel !== DONE) {
                console.log('Push needed ', p.id, node.player.stage);
                stage = p.stage;
                // Send push.
                node.get(PUSH_STEP,
                         function(value) {
                             checkIfPushWorked(node, p, checkPushWaitTime);
                         },
                         p.id,
                         {
                             timeout: replyWaitTime,
                             executeOnce: true,
                             target: GAMECOMMAND,
                             timeoutCb: function() {
                                 // No reply to GET, disconnect client.
                                 console.log('NO REPLY ', p.id, stage);
                                 //node.log('node.pushManager: no reply from ' +
                                 //         p.id);
                                 forceDisconnect(node, p);
                             }
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
        stage = {
            stage: p.stage.stage, step: p.stage.step, round: p.stage.round
        };
        console.log('received reply from ', p.id, stage);

        setTimeout(function() {
            var pp;

            if (node.game.pl.exist(p.id)) {
                pp = node.game.pl.get(p.id);

        //console.log('CONSOLE checking if push worked for ', p.id);
        //node.log('node.pushManager: checking if push worked for ', p.id);
                //console.log(pp.stage, stage);
                if (GameStage.compare(pp.stage, stage) === 0) {
                    console.log('PUSH did NOT work for ', p.id, stage);
               //node.log('node.pushManager: push did not work for ', p.id);
                    forceDisconnect(node, pp);
                }
                else {
                    console.log('PUSH worked for ', p.id, stage);
                    //node.log('node.pushManager: push worked for ', p.id);
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

    /**
     * ### checkAndAssignWaitTime
     *
     * Checks if a valid wait time is found in options object, if so assigns it
     *
     * Option name is first tried as it is, and if not found, 'WaitTime'
     * is appended, and check if performed again.
     *
     * If set, properties must be positive numbers, otherwise an error is
     * thrown.
     *
     * @param {string} method Then name of the method invoking the function
     * @param {object} options Configuration options
     * @param {string} name The name of the option to check and assign.
     *    If the option is not defined, it appends 'WaitTime', and tries again.
     * @param {object} that The instance to which assign the correct value
     *
     * @return {number} The validated number, or undefined if not set
     */
    function checkAndAssignWaitTime(method, options, name, that) {
        var n;
        n = options[name];
        if ('undefined' !== typeof n) {
            name = name + 'WaitTime';
            n = options[name];
        }
        if ('undefined' !== typeof n) {
            if ('number' !== typeof n || n < 0) {
                throw new TypeError('PushManager.' + method + ': options.' +
                                    name + 'must be a positive number. ' +
                                    'Found: ' + n);
            }
            that[name] = n;
            return n;
        }
    }

    /**
     * ### checkAndAssignAllWaitTimes
     *
     * Validates properties 'offset', 'reply', and 'check' of an object
     *
     * @param {string} method Then name of the method invoking the function
     * @param {object} options Configuration options
     * @param {object} that The instance to which assign the correct value
     *
     * @see PushManager.init
     * @see checkAndAssignWaitTime
     */
    function checkAndAssignAllWaitTimes(method, options, that) {
        checkAndAssignWaitTime(method, options, 'offset', that);
        checkAndAssignWaitTime(method, options, 'reply', that);
        checkAndAssignWaitTime(method, options, 'check', that);
    }
})(
    'undefined' !== typeof node ? node : module.exports,
    'undefined' !== typeof node ? node : module.parent.exports
);
