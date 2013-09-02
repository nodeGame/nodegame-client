/**
 * # Player related functions
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * ---
 *
 */

(function (exports, parent) {

    var NGC = parent.NodeGameClient,
    Player = parent.Player,
    constants = parent.constants;

    

    

    /**
     * ### NodeGameClient.createPlayer
     *
     * Creates player
     */
    NGC.prototype.createPlayer = function (player) {
        if (this.player &&
            this.player.stateLevel > constants.stateLevels.STARTING &&
            this.player.stateLevel !== constants.stateLevels.GAMEOVER) {
            throw new this.NodeGameIllegalOperationError(
                'createPlayer: cannot create player while game is running');
        }

        player = new Player(player);
        player.stateLevel = this.player.stateLevel;
        player.stageLevel = this.player.stageLevel;

        // Overwrite existing 'current' player:
        if (this.player && this.player.id) {
            this.game.pl.remove(this.player.id);
        }

        this.player = this.game.pl.add(player);

        this.emit('PLAYER_CREATED', this.player);

        return this.player;
    };


})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
