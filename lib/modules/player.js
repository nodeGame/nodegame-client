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
        this.emit('PLAYER_CREATED', this.player);

        return this.player;
    };

    /**
     * ### NodeGameClient.setLanguage
     *
     * Sets the language for a playerList
     *
     * @param {object} language Object describing language.
     *   Needs shortName property.
     * @param {boolean} prefix Optional. If TRUE, the window uri prefix is
     *   set to the value of lang.path. node.window must be defined,
     *   otherwise a warning is shown. Default, FALSE.
     *
     * @return {object} The language object
     *
     * @see node.setup.lang
     * @see GameWindow.setUriPrefix
     *
     * @emit LANGUAGE_SET
     */
    NGC.prototype.setLanguage = function(language, prefix) {
        if ('object' !== typeof language) {
            throw new TypeError('node.setLanguage: language must be object.');
        }
        if ('string' !== typeof language.shortName) {
            throw new TypeError(
                'node.setLanguage: language.shortName must be string.');
        }
        this.player.lang = language;
        if (!this.player.lang.path) {
            this.player.lang.path = language.shortName + '/';
        }

        if (prefix) {
            if ('undefined' !== typeof this.window) {
                this.window.setUriPrefix(this.player.lang.path);
            }
            else {
                node.warn('node.setLanguage: prefix is true, but no window ' +
                          'found.');
            }
        }

        this.emit('LANGUAGE_SET');

        return this.player.lang;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
