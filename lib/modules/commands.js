/**
 * # NodeGameClient Events Handling  
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
     * @param {string} who A player id or 'ALL'
     * @return {boolean} TRUE, if the redirect message is sent
     */
    NGC.prototype.redirect = function (url, who) {
        var msg;
        if ('string' !== typeof url) {
            this.err('redirect requires a valid string');
            return false;
        }
        if ('undefined' === typeof who) {
            this.err('redirect requires a valid recipient');
            return false;
        }
        msg = this.msg.create({
            target: this.constants.target.REDIRECT,
            data: url,
            to: who
        });
        this.socket.send(msg);
        return true;
    };

    /**
     * ### NodeGameClient.remoteCommand
     *
     * Executes a game command on a client
     *
     * Works only if it is a monitor client to send
     * the message, i.e. players cannot send game commands
     * to each others
     *
     * @param {string} command The command to execute
     * @param {string} to The id of the player to command
     * @return {boolean} TRUE, if the game command is sent
     */
    NGC.prototype.remoteCommand = function (command, to, options) {
        var msg;
        if (!command) {
            this.err('remoteCommand requires a valid command');
            return false;
        }
        if ('undefined' === typeof to) {
            this.err('remoteCommand requires a valid recipient');
            return false;
        }

        msg = this.msg.create({
            target: this.constants.target.GAMECOMMAND,
            text: command,
            data: options,
            to: to
        });
        return this.socket.send(msg);
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
