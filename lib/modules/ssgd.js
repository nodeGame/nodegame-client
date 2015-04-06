/**
 * # SAY, SET, GET, DONE
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var DONE_CALLED = parent.constants.stageLevels.DONE_CALLED;

    /**
     * ### NodeGameClient.say
     *
     * Sends a DATA message to a specified recipient
     *
     * @param {string} text The label associated to the msg
     * @param {string} to The recipient of the msg.
     * @param {mixed} payload Optional. Addional data to send along
     *
     * @return {boolean} TRUE, if SAY message is sent
     */
    NGC.prototype.say = function(label, to, payload) {
        var msg;
        if ('string' !== typeof label) {
            throw new TypeError('node.say: label must be string.');
        }
        if (to && 'string' !== typeof to) {
            throw new TypeError('node.say: to must be string or undefined.');
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
     * Stores a key-value pair in the server memory
     *
     * @param {string} key An alphanumeric (must not be unique)
     * @param {mixed} value The value to store (can be of any type)
     * @param {string} to The recipient
     *
     * @return {boolean} TRUE, if SET message is sent
     */
    NGC.prototype.set = function(key, value, to) {
        var msg;
        if ('string' !== typeof key) {
            throw new TypeError('node.set: key must be string.');
        }
        msg = this.msg.create({
            action: this.constants.action.SET,
            target: this.constants.target.DATA,
            to: to || 'SERVER',
            reliable: 1,
            text: key,
            data: value
        });
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
     * node.on('get.myLabel', function() { return 'OK'; });
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
     * @param {mixed} params Optional. Additional parameters to send along
     * @param {number} timeout Optional. The number of milliseconds after which
     *   the listener will be removed. If equal -1, the listener will not be
     *   removed. Default: 0
     * @param {function} timeoutCb Optional. A callback function to call if
     *   the timeout is fired (no reply recevied)
     *
     * @return {boolean} TRUE, if GET message is sent and listener registered
     */
    NGC.prototype.get = function(key, cb, to, params, timeout, timeoutCb) {
        var msg, g, ee;
        var that, res;
        var timer, success;

        if ('string' !== typeof key) {
            throw new TypeError('node.get: key must be string.');
        }

        if (key === '') {
            throw new TypeError('node.get: key cannot be empty.');
        }

        if (key.split('.') > 1) {
            throw new TypeError(
                'node.get: key cannot contain the dot "." character.');
        }

        if ('function' !== typeof cb) {
            throw new TypeError('node.get: cb must be function.');
        }

        if ('undefined' === typeof to) {
            to = 'SERVER';
        }

        if ('string' !== typeof to) {
            throw new TypeError('node.get: to must be string or undefined.');
        }

        if ('undefined' !== typeof timeout) {
            if ('number' !== typeof timeout) {
                throw new TypeError('node.get: timeout must be number.');
            }
            if (timeout < 0 && timeout !== -1 ) {
                throw new TypeError('node.get: timeout must be positive, ' +
                                   '0, or -1.');
            }
        }

        if (timeoutCb && 'function' !== typeof timeoutCb) {
            throw new TypeError('node.get: timeoutCb must be function ' +
                                'or undefined.');
        }

        msg = this.msg.create({
            action: this.constants.action.GET,
            target: this.constants.target.DATA,
            to: to,
            reliable: 1,
            text: key,
            data: params
        });

        // TODO: check potential timing issues. Is it safe to send the GET
        // message before registering the relate listener? (for now yes)
        res = this.socket.send(msg);

        // The key is updated with the id of the message, so
        // that only those who received it can reply.
        key = key + '_' + msg.id;

        if (res) {
            ee = this.getCurrentEventEmitter();

            that = this;

            // Listener function. If a timeout is not set, the listener
            // will be removed immediately after its execution.
            g = function(msg) {
                if (msg.text === key) {
                    success = true;
                    cb.call(that.game, msg.data);
                    if (!timeout) ee.remove('in.say.DATA', g);
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
                        that.timer.destroyTimer(timer);
                        // success === true we have received a reply.
                        if (timeoutCb && !success) timeoutCb.call(that.game);
                    }
                });
                timer.start();
            }
        }
        return res;
    };

// OLD DONE

//     /**
//      * ### NodeGameClient.done
//      *
//      * Emits a DONE event
//      *
//      * A DONE event signals that the player has completed
//      * a game step. After a DONE event the step rules are
//      * evaluated.
//      *
//      * Accepts any number of input parameters that will be
//      * passed to `emit`.
//      *
//      * @see NodeGameClient.emit
//      * @emits DONE
//      */
//     NGC.prototype.done = function() {
//         var args, len;
//         switch(arguments.length) {
//
//         case 0:
//             this.emit('DONE');
//             break;
//         case 1:
//             this.emit('DONE', arguments[0]);
//             break;
//         case 2:
//             this.emit('DONE', arguments[0], arguments[1]);
//             break;
//         default:
//
//             len = arguments.length;
//             args = new Array(len - 1);
//             for (i = 1; i < len; i++) {
//                 args[i - 1] = arguments[i];
//             }
//             this.emit.apply('DONE', args);
//         }
//     };


    /**
     * ### NodeGameClient.done
     *
     * Asynchrounously emits a DONE event (if authorized)
     *
     * A DONE event signals that the player has completed a game step.
     *
     * After a DONE event, the `done` handler of the stage/step is
     * evaluated, and if successful, the step rules are evaluated, and
     * eventually the client will move forward in the game.
     *
     * This method cannot be called again until the DONE event is
     * emitted and evaluated. Then, two scenarios are possible:
     *
     *   - The `done` handler returns FALSE, and the procedure is
     *     aborted. `node.done()` can be called immediately after.
     *
     *   - The `done` handler returns TRUE, and the client prepares to
     *     to step. Until the next step is executed (might need to
     *     wait for other players as well), `node.done()` cannot be
     *     called again.
     *
     * If `node.done()` is called during an unauthorized state, an
     * error message will be logged and the function returns FALSE.
     *
     * Technical note. The done event needs to be asynchronous because
     * it can be triggered by the callback of a load frame, and in
     * this case it must be emitted last.
     *
     * All input parameters are passed along to `node.emit`.
     *
     * @return {boolean} TRUE, if the method is authorized
     *
     * @see NodeGameClient.emit
     * @emits DONE
     */
    NGC.prototype.done = function() {
        var that, len, args, i;

        if (this.game.getStageLevel() >= DONE_CALLED) {
            node.err('node.done: done already called in this step.');
            return false;
        }
        this.game.setStageLevel(DONE_CALLED);

        len = arguments.length;
        that = this;
        // The arguments object must not be passed or leaked anywhere.
        // Therefore, we recreate an args array here. We have a different
        // timeout in a different branch for optimization.
        switch(len) {

        case 0:
            setTimeout(function() { that.events.emit('DONE'); }, 0);
            break;
        case 1:
            setTimeout(function() {
                that.events.emit('DONE', arguments[0]);
            }, 0);
            break;
        case 2:
            setTimeout(function() {
                that.events.emit('DONE', arguments[0], arguments[1]);
            }, 0);
            break;
        default:
            args = new Array(len+1);
            args[0] = 'DONE';
            for (i = 1; i < len; i++) {
                args[i+1] = arguments[i];
            }
            setTimeout(function() {
                that.events.emit.apply(that.events, args);
            }, 0);
        }

        return true;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
