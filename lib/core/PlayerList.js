/**
 * # PlayerList
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * Handles a collection of `Player` objects.
 * ---
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    // Exposing constructor
    exports.PlayerList = PlayerList;

    // Setting up global scope variables
    var J = parent.JSUS,
        NDDB = parent.NDDB,
        GameStage = parent.GameStage,
        Game = parent.Game,
        NodeGameRuntimeError = parent.NodeGameRuntimeError;

    var stageLevels = parent.constants.stageLevels;
    var stateLevels = parent.constants.stateLevels;

    // Inheriting from NDDB
    PlayerList.prototype = new NDDB();
    PlayerList.prototype.constructor = PlayerList;

    /**
     * ### PlayerList.comparePlayers
     *
     * Comparator functions between two players
     *
     * @param {Player} p1 The first player
     * @param {Player} p2 The second player
     * @return {number} The result of the comparison
     *
     * @see NDDB.globalCompare
     */
    PlayerList.comparePlayers = function(p1, p2) {
        if (p1.id === p2.id) return 0;
        if (p1.count < p2.count) return 1;
        if (p1.count > p2.count) return -1;
        return 0;
    };

    /**
     * ## PlayerList constructor
     *
     * Creates an instance of PlayerList
     *
     * The class inherits his prototype from `node.NDDB`.
     *
     * It indexes players by their _id_.
     *
     * @param {object} options Optional. Configuration object
     * @param {array} db Optional. An initial set of players to import
     * @param {PlayerList} parent Optional. A parent object for the instance
     *
     * @see NDDB.constructor
     */
    function PlayerList(options, db) {
        options = options || {};
        
        // Updates indexes on the fly.
        if (!options.update) options.update = {};
        if ('undefined' === typeof options.update.indexes) {
            options.update.indexes = true;
        }
   
        // Invoking NDDB constructor.
        NDDB.call(this, options);
        
        // We check if the index are not existing already because
        // it could be that the constructor is called by the breed function
        // and in such case we would duplicate them.
        if (!this.id) {
            this.index('id', function(p) {
                return p.id;
            });
        }
      
        // Importing initial items
        // (should not be done in constructor of NDDB) 
        if (db) this.importDB(db);

        // Assigns a global comparator function.
        this.globalCompare = PlayerList.comparePlayers;

        // The internal counter that will be used to assing the `count`
        // property to each inserted player
        this.pcounter = this.db.length || 0;
    }

    // ## PlayerList methods

    /**
     * ### PlayerList.importDB
     *
     * Adds an array of players to the database at once
     *
     * Overrides NDDB.importDB
     *
     * @param {array} pl The array of player to import at once
     */
    PlayerList.prototype.importDB = function(pl) {
        var i;
        if (!pl) return;
        for (i = 0; i < pl.length; i++) {
            this.add(pl[i]);
        }
    };

    /**
     * ### PlayerList.add
     *
     * Adds a new player to the database
     *
     * Before insertion, objects are checked to be valid `Player` objects,
     * that is they must have a unique player id. Objects will then
     * automatically casted to type Player.
     *
     * The `count` property is added to the player object, and
     * the internal `pcounter` variable is incremented.
     *
     * @param {Player} player The player object to add to the database
     * @return {player} The inserted player
     */
    PlayerList.prototype.add = function(player) {
        if (!(player instanceof Player)) {
            if (!player || 'undefined' === typeof player.id) {
                throw new NodeGameRuntimeError(
                        'PlayerList.add: player.id was not given');
            }
            player = new Player(player);
        }

        if (this.exist(player.id)) {
            throw new NodeGameRuntimeError(
                'PlayerList.add: Player already exists (id ' + player.id + ')');
        }
        this.insert(player);
        player.count = this.pcounter;
        this.pcounter++;

        return player;
    };

    /**
     * ### PlayerList.get
     *
     * Retrieves a player with the given id
     *
     * @param {number} id The id of the player to retrieve
     * @return {Player} The player with the speficied id
     */
    PlayerList.prototype.get = function(id) {
        var player;
        if ('undefined' === typeof id) {
            throw new NodeGameRuntimeError(
                    'PlayerList.get: id was not given');

        }
        player = this.id.get(id);
        if (!player) {
            throw new NodeGameRuntimeError(
                    'PlayerList.get: Player not found (id ' + id + ')');
        }
        return player;
    };

    /**
     * ### PlayerList.remove
     *
     * Removes the player with the given id
     *
     * Notice: this operation cannot be undone
     *
     * @param {number} id The id of the player to remove
     * @return {object} The removed player object
     */
    PlayerList.prototype.remove = function(id) {
        var player;
        if ('undefined' === typeof id) {
            throw new NodeGameRuntimeError(
                'PlayerList.remove: id was not given');
        }
        player = this.id.pop(id);
        if (!player) {
            throw new NodeGameRuntimeError(
                'PlayerList.remove: Player not found (id ' + id + ')');
        }
        return player;
    };

    // ### PlayerList.pop
    // @deprecated
    // TODO remove after transition is complete
    PlayerList.prototype.pop = PlayerList.prototype.remove;

    /**
     * ### PlayerList.exist
     *
     * Checks whether a player with the given id already exists
     *
     * @param {string} id The id of the player
     * @return {boolean} TRUE, if a player with the specified id is found
     */
    PlayerList.prototype.exist = function(id) {
        return this.id.get(id) ? true : false;
    };

    /**
     * ### PlayerList.updatePlayer
     *
     * Updates the state of a player
     *
     * @param {number} id The id of the player
     * @param {object} playerState An update with fields to update in the player
     * @return {object} The updated player object
     */
    PlayerList.prototype.updatePlayer = function(id, playerState) {
        // TODO: check playerState

        if (!this.exist(id)) {
            throw new NodeGameRuntimeError(
                'PlayerList.updatePlayer: Player not found (id ' + id + ')');
        }

        if ('undefined' === typeof playerState) {
            throw new NodeGameRuntimeError(
                'PlayerList.updatePlayer: Attempt to assign to a player an ' +
                    'undefined playerState');
        }
        var player = this.id.get(id);
        J.mixin(player, playerState);
        return player;
        // This creates some problems with the _autoUpdate...to be investigated.
        //return this.id.update(id, playerState);
    };

    /**
     * ### PlayerList.isStepDone
     *
     * Checks whether all players have terminated the specified game step
     *
     * A stage is considered _DONE_ if all players that are found playing
     * that game step have the property `stageLevel` equal to:
     *
     * `node.constants.stageLevels.DONE`.
     *

     // TODO UPDATE DOC

     * Players at other steps are ignored.
     *
     * If no player is found at the desired step, it returns TRUE.
     *
     * @param {GameStage} gameStage The GameStage of reference
     * @param {boolean} upTo Optional. If TRUE, all players in the stage up to the
     *   given step are checked. Defaults, FALSE.
     *
     * @return {boolean} TRUE, if all checked players have terminated the stage
     * @see PlayerList.arePlayersSync
     */
    PlayerList.prototype.isStepDone = function(gameStage, type, checkOutliers) {
        return this.arePlayersSync(gameStage, stageLevels.DONE, type, checkOutliers);
    };

    /**
     * ### PlayerList.isStepLoaded
     *
     * Checks whether all players have loaded the specified game step
     *
     * A stage is considered _LOADED_ if all players that are found playing
     * that game step have the property `stageLevel` equal to:
     *
     * `node.constants.stageLevels.LOADED`.
     *
     * Players at other steps are ignored.

     // TODO UPDATE DOC
     
     *
     * If no player is found at the desired step, it returns TRUE.
     *
     * @param {GameStage} gameStage The GameStage of reference
     * @return {boolean} TRUE, if all checked players have loaded the stage
     * @see PlayerList.arePlayersSync
     */
    PlayerList.prototype.isStepLoaded = function(gameStage) {
        return this.arePlayersSync(gameStage, stageLevels.LOADED, 'EXACT');
    };
    
    /**
     * ## PlayerList.arePlayersSync
     *
     * Verifies that all players in the same stage are at the same stageLevel. 
     *
     * Players at other game steps are ignored, unless the `upTo` parameter is
     * set. In this case, if players are found in earlier game steps, the method
     * will return false. Players at later game steps will still be ignored.
     *
     // TODO UPDATE DOC
     
     strict: same stage, step, round, stageLevel
     stage: same stage
     stage_up_to: 
     
     players in other stages - ignore - false

     * @param {GameStage} gameStage The GameStage of reference
     * @param {numeric} stageLevel The stageLevel of reference
     * @param {string} Optional. type. Flag to say what players will be checked.
     * @return {boolean} TRUE, if all checked players are sync
     */
    PlayerList.prototype.arePlayersSync = function(gameStage, stageLevel, type, checkOutliers) {
        var p, i, len, cmp, types, outlier;

        if (!gameStage) {
            throw new TypeError('PlayerList.arePlayersSync: invalid gameStage.');
        }
        if ('undefined' !== typeof stageLevel &&
            'number' !== typeof stageLevel) {
            throw new TypeError('PlayerList.arePlayersSync: stagelevel must ' +
                                'be number or undefined.');
        }
        
        type = type || 'EXACT';
        if ('string' !== typeof type) {
            throw new TypeError('PlayerList.arePlayersSync: type must be ' +
                                ' string or undefined.');
        }
        types = {STAGE: '', STAGE_UPTO: '', EXACT: ''};
        if ('undefined' === typeof types[type]) {
            throw new Error('PlayerList.arePlayersSync: unknown type: ' +
                            type + '.');
        }
        
        checkOutliers = 'undefined' === typeof checkOutliers ?
            true : checkOutliers;

        if ('boolean' !== typeof checkOutliers) {
            throw new TypeError('PlayerList.arePlayersSync: checkOutliers' +
                                ' must be boolean or undefined.');
        }

        if (!checkOutliers && type === 'EXACT') {
            throw new Error('PlayerList.arePlayersSync: incompatible options:' +
                            ' type=EXACT and checkOutliers=FALSE.');
        }
        
        // Cast the gameStage to object.
        gameStage = new GameStage(gameStage);

        len = this.db.length;
        for (i = 0; i < len; i++) {
            p = this.db[i];
            
            switch(type) {
            
            case 'EXACT':
                // Players in same stage, step and round.
                cmp = GameStage.compare(gameStage, p.stage);
                if (cmp !== 0) return false;
                break;

            case 'STAGE':
                if (gameStage.stage !== p.stage.stage) {
                    outlier = true;
                }
                break;
                
             case 'STAGE_UPTO':                
                // Players in current stage up to the reference step.
                cmp = GameStage.compare(gameStage, p.stage);
                
                // Player in another stage or in later step
                if (gameStage.stage !== p.stage.stage || cmp < 0) {
                    outlier = true;
                    break;
                }
                // Player before given step.
                if (cmp > 0) {
                    return false;
                }
                break;
            }
            
            // If outliers are not allowed returns false if one was found.
            if (checkOutliers && outlier) return false;
            
            // If the stageLevel check is required let's do it!
            if ('undefined' !== typeof stageLevel &&
                p.stageLevel !== stageLevel) {
                return false;
            }
        }
        return true;
    };

    /**
     * ### PlayerList.toString
     *
     * Returns a string representation of the stage of the
     * PlayerList
     *
     * @param {string} eol Optional. End of line separator between players
     * @return {string} out The string representation of the stage of the PlayerList
     */
    PlayerList.prototype.toString = function(eol) {
        var out = '', EOL = eol || '\n', stage;
        this.forEach(function(p) {
            out += p.id + ': ' + p.name;
            stage = new GameStage(p.stage);
            out += ': ' + stage + EOL;
        });
        return out;
    };

    /**
     * ### PlayerList.getNGroups
     *
     * Creates N random groups of players
     *
     * @param {number} N The number of groups
     * @return {Array} Array containing N `PlayerList` objects
     *
     * @see JSUS.getNGroups
     */
    PlayerList.prototype.getNGroups = function(N) {
        if (!N) return;
        var groups = J.getNGroups(this.db, N);
        return PlayerList.array2Groups(groups);
    };

    /**
     * ### PlayerList.getGroupsSizeN
     *
     * Creates random groups of N players
     *
     * @param {number} N The number player per group
     * @return {Array} Array containing N `PlayerList` objects
     *
     * @see JSUS.getGroupsSizeN
     */
    PlayerList.prototype.getGroupsSizeN = function(N) {
        if (!N) return;
        var groups = J.getGroupsSizeN(this.db, N);
        return PlayerList.array2Groups(groups);
    };

    /**
     * ### PlayerList.getRandom
     *
     * Returns a set of N random players
     *
     * @param {number} N The number of players in the random set. Defaults N = 1
     * @return {Player|Array} A single player object or an array of
     */
    PlayerList.prototype.getRandom = function(N) {
        if (!N) N = 1;
        if (N < 1) {
            throw new NodeGameRuntimeError(
                    'PlayerList.getRandom: N must be an integer >= 1');
        }
        this.shuffle();
        return N === 1 ? this.first() : this.limit(N).fetch();
    };

    /**
     * # Player Class
     *
     * A Player object is a wrapper object for a number of properties
     * to associate to a player during the game.
     *
     * Some of the properties are `private` and can never be changed
     * after an instance of a Player has been created. Defaults one are:
     *
     *  `sid`: The Socket.io session id associated to the player
     *  `id`: The nodeGame session id associate to the player
     *  `count`: The id of the player within a PlayerList object
     *  `admin`: Whether the player is an admin
     *  `disconnected`: Whether the player has disconnected
     *
     * Others properties are public and can be changed during the game.
     *
     *  `name`: An alphanumeric name associated to the player
     *  `stage`: The current stage of the player as relative to a game
     *  `ip`: The ip address of the player
     *
     * All the additional properties in the configuration object passed
     * to the constructor are also created as *private* and cannot be further
     * modified during the game.
     *
     * For security reasons, non-default properties cannot be `function`, and
     * cannot overwrite any previously existing property.
     * ---
     */

    // Expose Player constructor
    exports.Player = Player;

    /**
     * ## Player constructor
     *
     * Creates an instance of Player
     *
     * @param {object} pl The object literal representing the player
     */
    function Player(player) {
        var key;

        if ('object' !== typeof player) {
            throw new TypeError('Player constructor: player must be ' +
                                'an object.');
        }
        if (!player.id) {
            throw new TypeError('Player constructor: missing id property.');
        }

        /**
         * ### Player.id
         *
         * The nodeGame session id associate to the player
         *
         * Usually it is the same as the Socket.io id, but in
         * case of reconnections it can change
         */
        this.id = player.id;

        /**
         * ### Player.sid
         *
         * The session id received from the nodeGame server
         */
        this.sid = player.sid;


        /**
         * ### Player.count
         *
         * The ordinal position of the player in a PlayerList object
         *
         * @see PlayerList
         */
        this.count = player.count;

        /**
         * ### Player.admin
         *
         * The admin status of the client
         */
        this.admin = !!player.admin;

        /**
         * ### Player.disconnected
         *
         * The connection status of the client
         */
        this.disconnected = !!player.disconnected;

        // ## Player public properties

        /**
         * ### Player.ip
         *
         * The ip address of the player
         *
         * Note: this can change in mobile networks
         */
        this.ip = player.ip;

        /**
         * ### Player.name
         *
         * An alphanumeric name associated with the player
         */
        this.name = player.name;

        /**
         * ### Player.stage
         *
         * Reference to the game-stage the player currently is
         *
         * @see node.game.stage
         * @see GameStage
         */
        this.stage = player.stage || new GameStage();

        /**
         * ### Player.stageLevel
         *
         * The current stage level of the player in the game
         *
         * @see node.stageLevels
         */
        this.stageLevel = player.stageLevel || stageLevels.UNINITIALIZED;

        /**
         * ### Player.stateLevel
         *
         * The current state level of the player in the game
         *
         * @see node.stateLevels
         */
        this.stateLevel = player.stateLevel || stateLevels.UNINITIALIZED;


        /**
         * ## Extra properties
         *
         * Non-default properties are all added as private
         *
         * For security reasons, they cannot be of type function, and they
         * cannot overwrite any previously defined variable
         */
        for (key in player) {
            if (player.hasOwnProperty(key)) {
                if ('function' !== typeof player[key]) {
                    if (!this.hasOwnProperty(key)) {
                        this[key] = player[key];
                    }
                }
            }
        }
    }

    // ## Player methods

    /**
     * ### Player.toString
     *
     * Returns a string representation of a player
     *
     * @return {string} The string representation of a player
     */
    Player.prototype.toString = function() {
        return (this.name || '' ) + ' (' + this.id + ') ' + new GameStage(this.stage);
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
 ,  'undefined' != typeof node ? node : module.parent.exports
);
