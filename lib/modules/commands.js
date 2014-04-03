/**
 * # NodeGameClient Events Handling  
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * ---
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;
    
    /**
     * ### NodeGameClient.redirect
     *
     * Redirects a player to the specified url
     *
     * Works only if it is a monitor client to send
     * the message, i.e. players cannot redirect each
     * other.
     *
     * Examples
     *
     *  // Redirect to http://mydomain/mygame/missing_auth
     *  node.redirect('missing_auth', 'xxx');
     *
     *  // Redirect to external urls
     *  node.redirect('http://www.google.com');
     *
     * @param {string} url the url of the redirection
     * @param {string} who A player id or any other valid _to_ field
     */
    NGC.prototype.redirect = function(url, who) {
        var msg;
        if ('string' !== typeof url) {
            throw new TypeError('node.redirect: url must be string.');
        }
        if ('string' !== typeof who) {
            throw new TypeError('node.redirect: who must be string.');
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
     * By default, only admins can send use this method, as messages
     * sent by players will be filtered out by the server.
     *
     * @param {string} command The command to execute
     * @param {string} to The id of the player to command
     */
    NGC.prototype.remoteCommand = function(command, to, options) {
        var msg;
        if ('string' !== typeof command) {
            throw new TypeError('node.remoteCommand: command must be string.');
        }
        if (!parent.constants.gamecommands[command]) {
            throw new Error('node.remoteCommand: unknown command: ' +
                            command + '.');
        }
        if ('string' !== typeof to) {
            throw new TypeError('node.remoteCommand: to must be string.');
        }

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
            throw new TypeError('node.remoteAlert: text must be string.');
        }
        if ('undefined' === typeof to) {
            throw new TypeError('node.remoteAlert: to must be string.');
        }
        msg = this.msg.create({
            target: this.constants.target.ALERT,
            text: text,
            to: to
        });
        this.socket.send(msg);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
