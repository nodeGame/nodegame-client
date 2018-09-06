/**
 * # Player
 * Copyright(c) 2017 Stefano Balietti
 * MIT Licensed
 *
 * Player related functions
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient,
    Player = parent.Player,
    constants = parent.constants;

    /**
     * ### NodeGameClient.createPlayer
     *
     * Creates player object and places it in node.player
     *
     * @param {object} player A player object with a valid id property
     *
     * @return {object} The player object
     *
     * @see node.setup.player
     * @emit PLAYER_CREATED
     */
    NGC.prototype.createPlayer = function(player) {
        if (this.player &&
            this.player.stateLevel > constants.stateLevels.STARTING &&
            this.player.stateLevel !== constants.stateLevels.GAMEOVER) {
            throw new Error('node.createPlayer: cannot create player ' +
                            'while game is running.');
        }
        if (this.game.pl.exist(player.id)) {
            throw new Error('node.createPlayer: id already found in ' +
                            'playerList: ' + player.id);
        }
        // Cast to player (will perform consistency checks)
        player = new Player(player);
        player.stateLevel = this.player.stateLevel;
        player.stageLevel = this.player.stageLevel;

        this.player = player;
        // Slice because here it is SP/123, and on server it is /123.
        this.player.strippedSid = this.player.sid.slice(2);

        this.emit('PLAYER_CREATED', this.player);

        return this.player;
    };

    /**
     * ### NodeGameClient.setLanguage
     *
     * Sets the language for the client
     *
     * @param {object|string} lang Language information. If string, it must
     *   be the full name, and the the first 2 letters lower-cased are used
     *   as shortName. If object it must have the following format:
     *   ``{
     *      name: 'English',
     *      shortName: 'en',
     *      nativeName: 'English',
     *      path: 'en/' // Optional, default equal to shortName + '/'.
     *   }``
     *
     * @param {boolean} updateUriPrefix Optional. If TRUE, the window uri
     *   prefix isset to the value of lang.path. node.window must be defined,
     *   otherwise a warning is shown. Default, FALSE.
     * @param {boolean} sayIt Optional. If TRUE, a LANG message is sent to
     *   the server to notify the selection. Default: FALSE.
     *
     * @return {object} The language object
     *
     * @see node.setup.lang
     * @see GameWindow.setUriPrefix
     *
     * @emit LANGUAGE_SET
     */
    NGC.prototype.setLanguage = function(lang, updateUriPrefix, sayIt) {
        var language;
        language = 'string' === typeof lang ? makeLanguageObj(lang) : lang;

        if (!language || 'object' !== typeof language) {
            throw new TypeError('node.setLanguage: language must be object ' +
                               'or string. Found: ' + lang);
        }
        if ('string' !== typeof language.shortName) {
            throw new TypeError(
                'node.setLanguage: language.shortName must be string. Found: ' +
                    language.shortName);
        }
        this.player.lang = language;
        if (!this.player.lang.path) {
            this.player.lang.path = language.shortName + '/';
        }

        // Updates the URI prefix.
        if (updateUriPrefix) {
            if ('undefined' !== typeof this.window) {
                this.window.setUriPrefix(this.player.lang.path);
            }
            else {
                node.warn('node.setLanguage: updateUriPrefix is true, ' +
                          'but window not found. Are you in a browser?');
            }
        }

        // Send a message to notify server.
        if (sayIt) {
            node.socket.send(node.msg.create({
                target: 'LANG',
                data: this.player.lang
            }));
        }

        this.emit('LANGUAGE_SET');

        return this.player.lang;
    };

    // ## Helper functions.

    /**
     * ### makeLanguageObj
     *
     * From a language string returns a fully formatted obj
     *
     * @param {string} langStr The language string.
     *
     * @return {object} The language object
     */
    function makeLanguageObj(langStr) {
        var shortName;
        shortName = langStr.toLowerCase().substr(0,2);
        return {
            name: langStr,
            shortName: shortName,
            nativeName: langStr,
            path: shortName + '/'
        };
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
