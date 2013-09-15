/**
 * # NodeGameClient: SAY, SET, GET, DONE
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * ---
 *
 */

(function (exports, parent) {


    var NGC = parent.NodeGameClient;

    /**
     * ### NodeGameClient.say
     *
     * Sends a DATA message to a specified recipient
     *
     * @param {string} text The label associated to the message
     * @param {string} to Optional. The recipient of the message. Defaults, 'SERVER'
     * @param {mixed} data Optional. The content of the DATA message
     *
     */
    NGC.prototype.say = function (label, to, payload) {
        var msg;

        if ('undefined' === typeof label) {
            this.err('cannot say empty message');
            return false;
        }

        msg = this.msg.create({
            target: this.constants.target.DATA,
            to: to || 'SERVER',
            text: label,
            data: payload
        });
        debugger
        this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.set
     *
     * Stores a key-value pair in the server memory
     *
     *
     *
     * @param {string} key An alphanumeric (must not be unique)
     * @param {mixed} The value to store (can be of any type)
     *
     */
    NGC.prototype.set = function (key, value, to) {
        var msg;

        if ('undefined' === typeof key) {
            this.err('cannot set undefined key');
            return false;
        }

        msg = this.msg.create({
            action: this.constants.action.SET,
            target: this.constants.target.DATA,
            to: to || 'SERVER',
            reliable: 1,
            text: key,
            data: value
        });
        // @TODO when refactoring is finished, emit this event.
        // By default there nothing should happen, but people could listen to it
        //this.emit('out.set.DATA', msg);
        this.socket.send(msg);
    };


    /**
     * ### NodeGameClient.get
     *
     * Sends a GET message to a recipient and listen to the reply
     *
     * @param {string} key The label of the GET message
     * @param {function} cb The callback function to handle the return message
     */
    NGC.prototype.get = function (key, cb, to, params) {
        var msg, g, ee;

        if ('string' !== typeof key) {
            throw new TypeError('node.get: key must be string.');
            return false;
        }

        if ('function' !== typeof cb) {
            throw new TypeError('node.get: cb must be function.');
        }

        msg = this.msg.create({
            action: this.constants.action.GET,
            target: this.constants.target.DATA,
            to: to || 'SERVER',
            reliable: 1,
            text: key
        });

        ee = this.getCurrentEventEmitter();

        function g(msg) {
            if (msg.text === key) {
                cb.call(this.game, msg.data);
                ee.remove('in.say.DATA', g);
            }
        };

        ee.on('in.say.DATA', g);
    };

    /**
     * ### NodeGameClient.done
     *
     * Emits a DONE event
     *
     * A DONE event signals that the player has completed
     * a game step. After a DONE event the step rules are
     * evaluated.
     *
     * Accepts any number of input parameters that will be
     * passed to `emit`.
     *
     * @see NodeGameClient.emit
     * @emits DONE
     */
    NGC.prototype.done = function() {
        var args, len;
        switch(arguments.length) {

        case 0:
            this.emit('DONE');
            break;
        case 1:
            this.emit('DONE', arguments[0]);
            break;
        case 2:
            this.emit('DONE', arguments[0], arguments[1]);
            break;
        default:

            len = arguments.length;
            args = new Array(len - 1);
            for (i = 1; i < len; i++) {
                args[i - 1] = arguments[i];
            }
            this.emit.apply('DONE', args);
        }
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
