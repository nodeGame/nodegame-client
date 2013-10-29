/**
 * # Player related functions
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 * ---
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
     * @param {object} A player object with a valid id property
     *
     * @see node.setup.player
     * @emit PLAYER_CREATED
     */
    NGC.prototype.createPlayer = function(player) {
        if (this.player &&
            this.player.stateLevel > constants.stateLevels.STARTING &&
            this.player.stateLevel !== constants.stateLevels.GAMEOVER) {
            throw new this.NodeGameIllegalOperationError(
                'node.createPlayer: cannot create player while game is running');
        }

        player = new Player(player);
        player.stateLevel = this.player.stateLevel;
        player.stageLevel = this.player.stageLevel;

        if (this.game.pl.exist(player.id)) {
            throw new Error('node.createPlayer: already id already found in ' +
                            'playerList: ' + player.id);
        }
        
        this.player = player;
        this.emit('PLAYER_CREATED', this.player);

        return this.player;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);