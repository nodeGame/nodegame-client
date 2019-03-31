/**
 * # SAY, SET, GET, DONE
 *
 * Implementation of node.[say|set|get|done].
 *
 * Copyright(c) 2019 Stefano Balietti
 * MIT Licensed
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;
    var J = parent.JSUS;

    var GETTING_DONE = parent.constants.stageLevels.GETTING_DONE;

    /**
     * ### NodeGameClient.say
     *
     * Sends a DATA message to a specified recipient
     *
     * @param {string} text The label associated to the msg
     * @param {string|array} Optional. to The recipient/s of the msg.
     *   Default: 'SERVER'
     * @param {mixed} payload Optional. Addional data to send along
     *
     * @return {boolean} TRUE, if SAY message is sent
     */
    NGC.prototype.say = function(label, to, payload) {
        var msg;
        if ('string' !== typeof label || label === '') {
            throw new TypeError('node.say: label must be string. Found: ' +
                                label);
        }
        if (to && 'string' !== typeof to && (!J.isArray(to) || !to.length)) {
            throw new TypeError('node.say: to must be a non-empty array, ' +
                                'string or undefined. Found: ' + to);
        }
        msg = this.msg.create({
            target: this.constants.target.DATA,
            to: to,
            text: label,
            data: payload
        });
        return this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.set
     *
     * Stores an object in the server's memory
     *
     * @param {object|string} o The value to set
     * @param {string} to Optional. The recipient. Default `SERVER`
     * @param {string} text Optional. The text property of the message.
     *   If set, it allows one to define on.data listeners on receiver.
     *   Default: undefined
     *
     * @return {boolean} TRUE, if SET message is sent
     */
    NGC.prototype.set = function(o, to, text) {
        var msg, tmp;
        if ('string' === typeof o) {
            tmp = o, o = {}, o[tmp] = true;
        }
        else if ('object' !== typeof o) {
            throw new TypeError('node.set: o must be object or string. ' +
                                'Found: ' + o);
        }
        msg = this.msg.create({
            action: this.constants.action.SET,
            target: this.constants.target.DATA,
            to: to || 'SERVER',
            reliable: 1,
            data: o
        });
        if (text) msg.text = text;
        return this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.get
     *
     * Sends a GET message to a recipient and listen to the reply
     *
     * The receiver of a GET message must be implement an *internal* listener
     * of the type "get.<label>", and return the value requested. For example,
     *
     * ```javascript
     *
     * // Sender.
     * node.get('myLabel, function(reply) {});
     *
     * // Receiver.
     * node.on('get.myLabel', function(msg) { return 'OK'; });
     *
     * ```
     *
     * The label string cannot contain any "." (dot) characther for security
     * reason.
     *
     * The listener function is removed immediately after its first execution.
     * To allow multiple execution, it is possible to specify a positive timeout
     * after which the listener will be removed, or specify the timeout as -1,
     * and in this case the listener will not be removed at all.
     *
     * If a timeout is specified is possible to specify also a timeout-callback,
     * which will be executed if no was reply was received until the end of
     * the timeout.
     *
     * If the socket is not able to send the GET message for any reason, the
     * listener function is never registered.
     *
     * Important: depending on the server settings, GET messages might
     * disclose the real ID of the sender. For this reason, GET messages from
     * admins to players should be used only if necessary.
     *
     * @param {string} key The label of the GET message
     * @param {function} cb The callback function to handle the return message
     * @param {string} to Optional. The recipient of the msg. Default: SERVER
     * @param {object} options Optional. Extra options as follows:
     *
     *      - {number} timeout The number of milliseconds after which
     *            the listener will be removed.
     *      - {function} timeoutCb A callback function to call if
     *            the timeout is fired (no reply received)
     *      - {boolean} executeOnce TRUE if listener should be removed after
     *            one execution. It will also terminate the timeout, if set
     *      - {mixed} data Data field of the GET msg
     *      - {string} target Set to override the default DATA target of msg
     *
     * @return {boolean} TRUE, if GET message is sent and listener registered
     */
    NGC.prototype.get = function(key, cb, to, options) {
        var msg, g, ee;
        var that, res;
        var timer, success;
        var data, timeout, timeoutCb, executeOnce, target;

        if ('string' !== typeof key) {
            throw new TypeError('node.get: key must be string. Found: ' + key);
        }

        if (key === '') {
            throw new TypeError('node.get: key cannot be empty.');
        }

        if (key.split('.') > 1) {
            throw new TypeError(
                'node.get: key cannot contain the dot "." character: ' + key);
        }

        if ('function' !== typeof cb) {
            throw new TypeError('node.get: cb must be function. Found: ' + cb);
        }

        if ('undefined' === typeof to) {
            to = 'SERVER';
        }

        if ('string' !== typeof to) {
            throw new TypeError('node.get: to must be string or ' +
                                'undefined. Found: ' + to);
        }

        if (options) {
            if ('object' !== typeof options) {
                throw new TypeError('node.get: options must be object ' +
                                    'or undefined. Found: ' + options);
            }

            timeout = options.timeout;
            timeoutCb = options.timeoutCb;
            data = options.data;
            executeOnce = options.executeOnce;
            target = options.target;

            if ('undefined' !== typeof timeout) {
                if ('number' !== typeof timeout) {
                    throw new TypeError('node.get: options.timeout must be ' +
                                        'number. Found: ' + timeout);
                }
                if (timeout < 0 && timeout !== -1 ) {
                    throw new TypeError('node.get: options.timeout must be ' +
                                        'positive, 0, or -1. Found: ' +
                                        timeout);
                }
            }

            if (timeoutCb && 'function' !== typeof timeoutCb) {
                throw new TypeError('node.get: options.timeoutCb must be ' +
                                    'function or undefined. Found: ' +
                                    timeoutCb);
            }

            if (target &&
                ('string' !== typeof target || target.trim() === '')) {

                throw new TypeError('node.get: options.target must be ' +
                                    'a non-empty string or undefined. Found: ' +
                                    target);
            }

        }

        msg = this.msg.create({
            action: this.constants.action.GET,
            target: target || this.constants.target.DATA,
            to: to,
            reliable: 1,
            text: key,
            data: data
        });

        // TODO: check potential timing issues. Is it safe to send the GET
        // message before registering the relate listener? (for now yes)
        res = this.socket.send(msg);

        // The key is updated with the id of the message, so
        // that only those who received it can reply.
        key = key + '_' + msg.id;

        if (res) {
            that = this;
            ee = this.getCurrentEventEmitter();

            // Listener function. If a timeout is not set, the listener
            // will be removed immediately after its execution.
            g = function(msg) {
                if (msg.text === key) {
                    success = true;
                    if (executeOnce) {
                        ee.remove('in.say.DATA', g);
                        if ('undefined' !== typeof timer) {
                            that.timer.destroyTimer(timer);
                        }
                    }
                    cb.call(that.game, msg.data);
                }
            };

            ee.on('in.say.DATA', g);

            // If a timeout is set the listener is removed independently,
            // of its execution after the timeout is fired.
            // If timeout === -1, the listener is never removed.
            if (timeout > 0) {
                timer = this.timer.createTimer({
                    milliseconds: timeout,
                    timeup: function() {
                        ee.remove('in.say.DATA', g);
                        if ('undefined' !== typeof timer) {
                            that.timer.destroyTimer(timer);
                        }
                        // success === true we have received a reply.
                        if (timeoutCb && !success) timeoutCb.call(that.game);
                    }
                });
                timer.start();
            }
        }
        return res;
    };

    /**
     * ### NodeGameClient.done
     *
     * Marks the end of a game step
     *
     * It performs the following sequence of operations:
     *
     *  - Checks if `done` was already called in the same stage, and
     *      if so returns with a warning.
     *  - Checks it there a `done` hanlder in the step, and if so
     *      executes. If the return value is falsy procedure stops.
     *  - Marks the step as `willBeDone` and no further calls to
     *      `node.done` are allowed in the same step.
     *  - Creates and send a SET message to server containing the time
     *      passed from the beginning of the step, if `done` was a timeup
     *      event, passing along any other parameter given to `node.done`
     *  - Asynchronously emits 'DONE', which starts the procedure to
     *      evaluate the step rule, and eventually to enter into the next
     *      step.
     *
     * Technical note. The done event needs to be asynchronous because
     * it can be triggered by the callback of a load frame, and in
     * this case it must be emitted last.
     *
     * All input parameters are passed along to `node.emit`.
     *
     * @return {boolean} TRUE, if the method is authorized, FALSE otherwise
     *
     * @see NodeGameClient.emit
     * @emits DONE
     */
    NGC.prototype.done = function() {
        var that, game, doneCb, len, i;
        var arg1, arg2, args, args2;
        var stepTime, timeup;
        var autoSet;

        // Get step execution time.
        stepTime = this.timer.getTimeSince('step');

        game = this.game;
        if (game.willBeDone || game.getStageLevel() >= GETTING_DONE) {
            this.err('node.done: done already called in step: ' +
                     game.getCurrentGameStage());
            return false;
        }

        len = arguments.length;

        // Evaluating `done` callback if any.
        doneCb = game.plot.getProperty(game.getCurrentGameStage(), 'done');

        // A done callback can manipulate arguments, add new values to
        // send to server, or even halt the procedure if returning false.
        if (doneCb) {
            switch(len) {
            case 0:
                args = doneCb.call(game);
                break;
            case 1:
                args = doneCb.call(game, arguments[0]);
                break;
            case 2:
                args = doneCb.call(game, arguments[0], arguments[1]);
                break;
            default:
                args = new Array(len);
                for (i = -1 ; ++i < len ; ) {
                    args[i] = arguments[i];
                }
                args = doneCb.apply(game, args);
            };

            // If a `done` callback returns false, exit.
            if ('boolean' === typeof args) {
                if (args === false) {
                    this.silly('node.done: done callback returned false.');
                    return false;
                }
                else {
                    console.log('***');
                    console.log('node.done: done callback returned true. ' +
                                'For retro-compatibility the value is not ' +
                                'processed and sent to server. If you wanted ' +
                                'to return "true" return an array: [true]. ' +
                                'In future releases any value ' +
                                'different from false and undefined will be ' +
                                'treated as a done argument and processed.');
                    console.log('***');

                    args = null;
                }
            }
            // If a value is provided make it an array, if not already one.
            else if ('undefined' !== typeof args &&
                Object.prototype.toString.call(args) !== '[object Array]') {

                args = [args];
            }
        }

        // Build set object (will be sent to server).
        // Back-compatible checks.
        if (game.timer && game.timer.isTimeup) {
            timeup = game.timer.isTimeup();
        }

        autoSet = game.plot.getProperty(game.getCurrentGameStage(), 'autoSet');

        // Keep track that the game will be done (done is asynchronous)
        // to avoid calling `node.done` multiple times in the same stage.
        game.willBeDone = true;

        // TODO: it is possible that DONE messages (in.set.DATA) are sent
        // to server before PLAYING is set. Is this OK?

        // Args can be the original arguments array, or
        // the one returned by the done callback.
        // TODO: check if it safe to copy arguments by reference.
        if (!args) args = arguments;
        else len = args.length;
        that = this;
        // The arguments object must not be passed or leaked anywhere.
        // Therefore, we recreate an args array here. We have a different
        // timeout in a different branch for optimization.
        switch(len) {

        case 0:
            if (autoSet) {
                this.set(getSetObj(stepTime, timeup), 'SERVER', 'done');
            }
            setTimeout(function() { that.events.emit('DONE'); }, 0);
            break;
        case 1:
            arg1 = args[0];
            if (autoSet) {
                this.set(getSetObj(stepTime, timeup, arg1), 'SERVER', 'done');
            }
            setTimeout(function() { that.events.emit('DONE', arg1); }, 0);
            break;
        case 2:
            arg1 = args[0], arg2 = args[1];
            // Send two setObjs.
            if (autoSet) {
                this.set(getSetObj(stepTime, timeup, arg1), 'SERVER', 'done');
                this.set(getSetObj(stepTime, timeup, arg2), 'SERVER', 'done');
            }
            setTimeout(function() { that.events.emit('DONE', arg1, arg2); }, 0);
            break;
        default:
            args2 = new Array(len+1);
            args2[0] = 'DONE';
            for (i = 0; i < len; i++) {
                args2[i+1] = args[i];
                if (autoSet) {
                    this.set(getSetObj(stepTime, timeup, args2[i+1]),
                             'SERVER', 'done');
                }
            }
            setTimeout(function() {
                that.events.emit.apply(that.events, args2);
            }, 0);
        }

        return true;
    };

    // ## Helper methods

    function getSetObj(time, timeup, arg) {
        var o;
        o = { time: time , timeup: timeup };
        if ('object' === typeof arg) J.mixin(o, arg);
        else if ('string' === typeof arg || 'number' === typeof arg) {
            o[arg] = true;
        }
        o.done = true;
        return o;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
