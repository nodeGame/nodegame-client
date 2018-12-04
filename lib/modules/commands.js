/**
 * # Commands
 * Copyright(c) 2018 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` commands for admins
 *
 * Command messages sent by players will be filtered out by the server.
 *
 */
(function(exports, node) {

    "use strict";

    var NGC = node.NodeGameClient;
    var J = node.JSUS;

    /**
     * ### NodeGameClient.redirect
     *
     * Redirects a client to the specified url
     *
     * Examples:
     *
     * ```javascript
     *
     * // Redirect to http://mydomain/mygame/missing_auth
     * node.redirect('missing_auth', 'xxx');
     *
     * // Redirect to external urls
     * node.redirect('http://www.google.com');
     * ```

     * @param {string} url the url of the redirection
     * @param {string|array} who A player id or any other valid _to_ field
     */
    NGC.prototype.redirect = function(url, who) {
        var msg;
        if ('string' !== typeof url) {
            throw new TypeError('node.redirect: url must be string. Found: ' +
                                url);
        }
        if ('string' !== typeof who && !J.isArray(who)) {
            throw new TypeError('node.redirect: who must be string. Found: ' +
                                who);
        }
        msg = this.msg.create({
            target: this.constants.target.REDIRECT,
            data: url,
            to: who
        });
        this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.remoteCommand
     *
     * Executes a game command on a client
     *
     * @param {string} command The command to execute
     * @param {string|array} to The id or the array of ids of client/s
     * @param {mixed} options Optional Options passed to the command.
     *   If set, options are stringified with JSUS.stringifyAll, therefore
     *   values such as null, undefined and functions are passed.
     *
     * @see JSUS.stringify
     * @see JSUS.stringifyAll
     * @see JSUS.parse
     */
    NGC.prototype.remoteCommand = function(command, to, options) {
        var msg;
        if ('string' !== typeof command) {
            throw new TypeError('node.remoteCommand: command must be string.');
        }
        if (!node.constants.gamecommands[command]) {
            throw new Error('node.remoteCommand: unknown command: ' +
                            command);
        }
        if ('string' !== typeof to && !J.isArray(to)) {
            throw new TypeError('node.remoteCommand: to must be string ' +
                                'or array. Found: ' + to);
        }

        // Stringify options, if any.
        if (options) options = J.stringify(options);

        msg = this.msg.create({
            target: this.constants.target.GAMECOMMAND,
            text: command,
            data: options,
            to: to
        });
        this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.remoteAlert
     *
     * Displays an alert message in the screen of the client
     *
     * Message is effective only if the client has a _window_ object
     * with a global _alert_ method.
     *
     * @param {string} text The text of of the messagex
     * @param {string} to The id of the player to alert
     */
    NGC.prototype.remoteAlert = function(text, to) {
        var msg;
        if ('string' !== typeof text) {
            throw new TypeError('node.remoteAlert: text must be string. ' +
                               'Found: ' + text);
        }
        if ('string' !== typeof to && !J.isArray(to)) {
            throw new TypeError('node.remoteAlert: to must be string ' +
                                'or array. Found: ' + to);
        }
        msg = this.msg.create({
            target: this.constants.target.ALERT,
            text: text,
            to: to
        });
        this.socket.send(msg);
    };

    /**
     * ### NodeGameClient.disconnectClient
     *
     * Disconnects one client by sending a DISCONNECT msg to server
     *
     * @param {object} p The client object containing info about id and sid
     */
    NGC.prototype.disconnectClient = function(p) {
        var msg;
        if ('object' !== typeof p) {
            throw new TypeError('node.disconnectClient: p must be ' +
                                'object. Found: ' + p);
        }

        this.info('node.disconnectClient: ' + p.id);

        msg = this.msg.create({
            target: 'SERVERCOMMAND',
            text: 'DISCONNECT',
            data: {
                id: p.id,
                sid: p.sid
            }
        });
        this.socket.send(msg);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
