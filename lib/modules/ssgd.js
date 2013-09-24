/**
 * # NodeGameClient: SAY, SET, GET, DONE
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 * ---
 */
(function (exports, parent) {

    var NGC = parent.NodeGameClient;

    /**
     * ### NodeGameClient.say
     *
     * Sends a DATA message to a specified recipient
     *
     * @param {string} text The label associated to the msg
     * @param {string} to Optional. The recipient of the msg. Defaults, 'SERVER'
     * @param {mixed} data Optional. Addional data to send along
     */
    NGC.prototype.say = function (label, to, payload) {
        var msg;
        if ('string' !== typeof label) {
            throw new TypeError('node.say: label must be string.');
        }
        msg = this.msg.create({
            target: this.constants.target.DATA,
            to: to || 'SERVER',
            text: label,
            data: payload
        });
        this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.set
     *
     * Stores a key-value pair in the server memory
     *
     * @param {string} key An alphanumeric (must not be unique)
     * @param {mixed} The value to store (can be of any type)
     *
     */
    NGC.prototype.set = function (key, value, to) {
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
        this.socket.send(msg);
    };


    /**
     * ### NodeGameClient.get
     *
     * Sends a GET message to a recipient and listen to the reply
     *
     * The listener function is removed immediately after its first execution.
     * To allow multiple execution, it is possible to specify a positive timeout
     * after which the listener will be removed, or specify the timeout as -1,
     * and in this case the listener will not be removed at all.
     *
     * @param {string} key The label of the GET message
     * @param {function} cb The callback function to handle the return message
     * @param {string} to Optional. The recipient of the msg. Defaults, SERVER
     * @param {mixed} params Optional. Additional parameters to send along
     * @param {number} timeout Optional. The number of milliseconds after which
     *    the listener will be removed. If equal -1, the listener will not be
     *    removed. Defaults, 0. 
     */
    NGC.prototype.get = function (key, cb, to, params, timeout) {
        var msg, g, ee;
        var that;
        
        if ('string' !== typeof key) {
            throw new TypeError('node.get: key must be string.');
            return false;
        }
        if ('function' !== typeof cb) {
            throw new TypeError('node.get: cb must be function.');
        }
        if ('undefined' !== typeof timeout) {
            if ('number' !== typeof number) {
                throw new TypeError('node.get: timeout must be number.');
            }
            if (timeout < 0 && timeout !== -1 ) {
                throw new TypeError('node.get: timeout must be positive, ' +
                                   '0, or -1.');
            }
        }
        msg = this.msg.create({
            action: this.constants.action.GET,
            target: this.constants.target.DATA,
            to: to || 'SERVER',
            reliable: 1,
            text: key
        });
        
        // TODO: check potential timing issues. Is it safe to send the GET
        // message before registering the relate listener? (for now yes)
        this.socket.send(msg);
        
        ee = this.getCurrentEventEmitter();
        
        that = this;

        // Listener function. If a timeout is not set, the listener
        // will be removed immediately after its execution.
        g = function(msg) {
            if (msg.text === key) {
                cb.call(that.game, msg.data);
                if (!timeout) ee.remove('in.say.DATA', g);
            }
        };
        
        ee.on('in.say.DATA', g);
        
        // If a timeout is set the listener is removed independently,
        // of its execution after the timeout is fired.
        // If timeout === -1, the listener is never removed.
        if (timeout > 0) {
            setTimeout(function() {
                ee.remove('in.say.DATA', g);
            }, timeout);
        }
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
