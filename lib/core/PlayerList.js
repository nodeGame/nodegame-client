/**
 * # PlayerList
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Handles a collection of `Player` objects
 *
 * Offers methods to update, search and retrieve players.
 *
 * It extends the NDDB class.
 */
(function(exports, parent) {

    "use strict";

    // ## Global scope

    // Exposing constructor
    exports.PlayerList = PlayerList;

    // Setting up global scope variables
    var J = parent.JSUS,
        NDDB = parent.NDDB,
        GameStage = parent.GameStage;

    var stageLevels = parent.constants.stageLevels;
    var stateLevels = parent.constants.stateLevels;

    // Inheriting from NDDB
    PlayerList.prototype = new NDDB();
    PlayerList.prototype.constructor = PlayerList;

    // Sync types used by PlayerList.arePlayersSync
    var syncTypes;

    /**
     * ## PlayerList.comparePlayers
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

        options.name = options.name || 'plist';

        // Updates indexes on the fly.
        if (!options.update) options.update = {};
        if ('undefined' === typeof options.update.indexes) {
            options.update.indexes = true;
        }

        // The internal counter that will be used to assing the `count`
        // property to each inserted player.
        this.pcounter = 0;

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
    }

    // ## PlayerList methods

    /**
     * ### PlayerList.importDB
     *
     * Adds an array of players to the database at once
     *
     * Overrides NDDB.importDB
     *
     * @param {array} db The array of player to import at once
     */
    PlayerList.prototype.importDB = function(db) {
        var i, len;
        if (!J.isArray(db)) {
            throw new TypeError('PlayerList.importDB: db must be array.');
        }
        i = -1, len = db.length;
        for ( ; ++i < len ; ) {
            this.add(db[i]);
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
     * @param {object} updateRules Optional. Update rules overwriting
     *   `this.__update`
     *
     * @return {player} The inserted player
     */
    PlayerList.prototype.add = function(player, updateRules) {
        if (!(player instanceof Player)) {
            if ('object' !== typeof player) {
                throw new TypeError('PlayerList.add: player must be object. ' +
                                    'Found: ' + player);
            }
            if ('string' !== typeof player.id) {
                throw new TypeError('PlayerList.add: player.id must be ' +
                                    'string. Found: ' + player.id);
            }
            player = new Player(player);
        }

        if (this.exist(player.id)) {
            throw new Error('PlayerList.add: player already existing: ' +
                            player.id + '.');
        }
        this.insert(player, updateRules);
        player.count = this.pcounter;
        this.pcounter++;
        return player;
    };

// NEW GET AND REMOVE (no errors are thrown)

//     /**
//      * ### PlayerList.get
//      *
//      * Retrieves a player with the given id
//      *
//      * @param {number} id The client id of the player to retrieve
//      *
//      * @return {Player} The player with the speficied id
//      */
//     PlayerList.prototype.get = function(id) {
//         if ('string' !== typeof id) {
//             throw new TypeError('PlayerList.get: id must be string.');
//         }
//         return this.id.get(id);
//     };
//
//     /**
//      * ### PlayerList.remove
//      *
//      * Removes the player with the given id
//      *
//      * Notice: this operation cannot be undone
//      *
//      * @param {number} id The id of the player to remove
//      *
//      * @return {object} The removed player object
//      */
//     PlayerList.prototype.remove = function(id) {
//         if ('string' !== typeof id) {
//             throw new TypeError('PlayerList.remove: id must be string.');
//         }
//         return this.id.remove(id);
//     };

// OLD GET AND REMOVE: throw errors

    /**
     * ### PlayerList.get
     *
     * Retrieves a player with the given id
     *
     * @param {number} id The id of the player to retrieve
     *
     * @return {Player} The player with the speficied id
     */
    PlayerList.prototype.get = function(id) {
        var player;
        if ('string' !== typeof id) {
            throw new TypeError('PlayerList.get: id must be string');

        }
        player = this.id.get(id);
        if (!player) {
            throw new Error('PlayerList.get: Player not found: ' + id);
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
     *
     * @return {object} The removed player object
     */
    PlayerList.prototype.remove = function(id) {
        var player;
        if ('string' !== typeof id) {
            throw new TypeError('PlayerList.remove: id must be string. ' +
                                'Found: ' + id);
        }
        player = this.id.remove(id);
        if (!player) {
            throw new Error('PlayerList.remove: player not found: ' + id);
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
     *
     * @return {boolean} TRUE, if a player with the specified id is found
     */
    PlayerList.prototype.exist = function(id) {
        return this.id.get(id) ? true : false;
    };

     /**
      * ### PlayerList.clear
      *
      * Clears the PlayerList and rebuilds the indexes
      */
     PlayerList.prototype.clear = function() {
         NDDB.prototype.clear.call(this);
         // We need this to recreate the (empty) indexes.
         this.rebuildIndexes();
     };

    /**
     * ### PlayerList.updatePlayer
     *
     * Updates the state of a player
     *
     * @param {number} id The id of the player
     * @param {object} playerState An update with fields to update in the player
     *
     * @return {object} The updated player object
     */
    PlayerList.prototype.updatePlayer = function(id, update) {
        var player;
        if ('string' !== typeof id) {
            throw new TypeError(
                'PlayerList.updatePlayer: id must be string. Found: ' + id);
        }
        if ('object' !== typeof update) {
            throw new TypeError(
                'PlayerList.updatePlayer: update must be object. Found: ' +
                    update);
        }

        if ('undefined' !== typeof update.id) {
            throw new Error('PlayerList.updatePlayer: update cannot change ' +
                            'the player id.');
        }

        player = this.id.update(id, update);

        if (!player) {
            throw new Error(
                'PlayerList.updatePlayer: player not found: ' + id);
        }

        return player;
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
     * By default, players at other steps are ignored.
     *
     * If no player is found at the desired step, it returns TRUE
     *
     * @param {GameStage} gameStage The GameStage of reference
     * @param {string} type Optional. The type of checking. Default 'EXACT'
     * @param {boolean} checkOutliers Optional. If TRUE, players at other
     *   steps are also checked. Default FALSE
     *
     * @return {boolean} TRUE, if all checked players have terminated the stage
     *
     * @see PlayerList.arePlayersSync
     */
    PlayerList.prototype.isStepDone = function(gameStage, type, checkOutliers) {
        return this.arePlayersSync(gameStage, stageLevels.DONE, type,
                                   checkOutliers);
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
     * By default, players at other steps are ignored.
     *
     * If no player is found at the desired step, it returns TRUE.
     *
     * @param {GameStage} gameStage The GameStage of reference
     *
     * @return {boolean} TRUE, if all checked players have loaded the stage
     *
     * @see PlayerList.arePlayersSync
     */
    PlayerList.prototype.isStepLoaded = function(gameStage) {
        return this.arePlayersSync(gameStage, stageLevels.LOADED, 'EXACT');
    };

    /**
     * ### PlayerList.arePlayersSync
     *
     * Verifies that all players in the same stage are at the same stageLevel
     *
     * Players at other game steps are ignored, unless the
     * `checkOutliers` parameter is set. In this case, if players are
     * found in earlier game steps, the method will return
     * false. Players at later game steps will still be ignored.
     *
     * The `type` parameter can assume one of the following values:
     *
     *  - 'EXACT': same stage, step, round
     *  - 'STAGE': same stage, but different steps and rounds are accepted
     *  - 'STAGE_UPTO': up to the same stage is ok
     *
     * Finally, if `stageLevel` is set, it even checks for the stageLevel,
     * for example: PLAYING, DONE, etc.
     *
     * TODO: see the checkOutliers param, if it is needed after all.
     *
     * @param {GameStage} gameStage The GameStage of reference
     * @param {number} stageLevel The stageLevel of reference
     * @param {string} type Optional. Flag to say what players will be checked
     * @param {boolean} checkOutliers Optional. Whether to check for outliers.
     *   Can't be TRUE if type is 'exact'
     *
     * @return {boolean} TRUE, if all checked players are sync
     */
    PlayerList.prototype.arePlayersSync = function(gameStage, stageLevel, type,
                                                   checkOutliers) {

        var p, i, len, cmp, outlier;

        // Cast the gameStage to object. It can throw errors.
        gameStage = new GameStage(gameStage);

        if ('undefined' !== typeof stageLevel &&
            'number'    !== typeof stageLevel) {

            throw new TypeError('PlayerList.arePlayersSync: stagelevel must ' +
                                'be number or undefined.');
        }

        type = type || 'EXACT';
        if ('string' !== typeof type) {
            throw new TypeError('PlayerList.arePlayersSync: type must be ' +
                                'string or undefined.');
        }

        if ('undefined' === typeof syncTypes[type]) {
            throw new Error('PlayerList.arePlayersSync: unknown type: ' +
                            type + '.');
        }

        checkOutliers = 'undefined' === typeof checkOutliers ?
            true : !!checkOutliers;

        if (!checkOutliers && type === 'EXACT') {
            throw new Error('PlayerList.arePlayersSync: incompatible options:' +
                            ' type=EXACT and checkOutliers=FALSE.');
        }

        i = -1, len = this.db.length;
        for ( ; ++i < len ; ) {

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
                // Player in another stage or in later step.
                if (gameStage.stage !== p.stage.stage || cmp < 0) {
                    outlier = true;
                    break;
                }
                // Player before given step.
                if (cmp > 0) return false;

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
     * Returns a string representation of the PlayerList
     *
     * @param {string} eol Optional. End of line separator between players
     *
     * @return {string} out The string representation of the PlayerList
     */
    PlayerList.prototype.toString = function(eol) {
        var out, EOL;
        out = '', EOL = eol || '\n';
        this.each(function(p) {
            var stage;
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
     *
     * @return {array} Array containing N `PlayerList` objects
     *
     * @see JSUS.getNGroups
     */
    PlayerList.prototype.getNGroups = function(N) {
        var groups;
        if ('number' !== typeof N || isNaN(N) || N < 1) {
            throw new TypeError('PlayerList.getNGroups: N must be a number ' +
                                '> 0: ' + N);
        }
        groups = J.getNGroups(this.db, N);
        return array2Groups.call(this, groups);
    };

    /**
     * ### PlayerList.getGroupsSizeN
     *
     * Creates random groups of N players
     *
     * @param {number} N The number player per group
     *
     * @return {array} Array containing N `PlayerList` objects
     *
     * @see JSUS.getGroupsSizeN
     */
    PlayerList.prototype.getGroupsSizeN = function(N) {
        var groups;
        if ('number' !== typeof N || isNaN(N) || N < 1) {
            throw new TypeError('PlayerList.getNGroups: N must be a number ' +
                                '> 0: ' + N);
        }
        groups = J.getGroupsSizeN(this.db, N);
        return array2Groups.call(this, groups);
    };

    /**
     * ### PlayerList.getRandom
     *
     * Returns a set of N random players
     *
     * @param {number} N The number of players in the random set. Defaults N = 1
     *
     * @return {Player|array} A single player object or an array of
     */
    PlayerList.prototype.getRandom = function(N) {
        var shuffled;
        if ('undefined' === typeof N) N = 1;
        if ('number' !== typeof N || isNaN(N) || N < 1) {
            throw new TypeError('PlayerList.getRandom: N must be a number ' +
                                '> 0 or undefined: ' + N + '.');
        }
        shuffled = this.shuffle();
        return N === 1 ? shuffled.first() : shuffled.limit(N).fetch();
    };


    // ## Helper Methods and Objects

    /**
     * ### array2Groups
     *
     * Transforms an array of array (of players) into an
     * array of PlayerList instances and returns it.
     *
     * The original array is modified.
     *
     * @param {array} array The array to transform
     *
     * @return {array} array The array of `PlayerList` objects
     */
    function array2Groups(array) {
        var i, len, settings;
        settings = this.cloneSettings();
        i = -1, len = array.length;
        for ( ; ++i < len ; ) {
            array[i] = new PlayerList(settings, array[i]);
        }
        return array;
    }

    syncTypes = {STAGE: '', STAGE_UPTO: '', EXACT: ''};

    /**
     * # Player
     *
     * Wrapper for a number of properties for players
     *
     *  `sid`: The Socket.io session id associated to the player
     *  `id`: The nodeGame session id associate to the player
     *  `count`: The id of the player within a PlayerList object
     *  `admin`: Whether the player is an admin
     *  `disconnected`: Whether the player has disconnected
     *  `lang`: the language chosen by player (default English)
     *  `name`: An alphanumeric name associated to the player
     *  `stage`: The current stage of the player as relative to a game
     *  `ip`: The ip address of the player
     *
     */

    // Expose Player constructor
    exports.Player = Player;

    /**
     * ## Player constructor
     *
     * Creates an instance of Player
     *
     * @param {object} player The object literal representing the player.
     *   Must contain at very least the `id` property
     */
    function Player(player) {
        var key;

        if ('object' !== typeof player) {
            throw new TypeError('Player constructor: player must be object. ' +
                               'Found: ' + player);
        }
        if ('string' !== typeof player.id) {
            throw new TypeError('Player constructor: id must be string. ' +
                                'Found: ' + player.id);
        }

        // ## Default properties

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
         * ### Player.clientType
         *
         * The client type (e.g. player, admin, bot, ...)
         */
        this.clientType = player.clientType || null;

        /**
         * ### Player.group
         *
         * The group to which the player belongs
         */
        this.group = player.group || null;

        /**
         * ### Player.role
         *
         * The role of the player
         */
        this.role = player.role || null;

        /**
         * ### Player.partner
         *
         * The partner of the player
         */
        this.partner = player.partner || null;

        /**
         * ### Player.count
         *
         * The ordinal position of the player in a PlayerList object
         *
         * @see PlayerList
         */
        this.count = 'undefined' === typeof player.count ? null : player.count;

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

        /**
         * ### Player.ip
         *
         * The ip address of the player
         *
         * Note: this can change in mobile networks
         */
        this.ip = player.ip || null;

        /**
         * ### Player.name
         *
         * An alphanumeric name associated with the player
         */
        this.name = player.name || null;

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
         * ### Player.lang
         *
         * The current language used by the player
         *
         * Default language is English with the default path `en/`.
         */
        this.lang = {
            name: 'English',
            shortName: 'en',
            nativeName: 'English',
            path: 'en/'
        };

        /**
         * ## Extra properties
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
        return (this.name || '' ) + ' (' + this.id + ') ' +
            new GameStage(this.stage);
    };

    // ## Closure
})(
    'undefined' != typeof node ? node : module.exports
 ,  'undefined' != typeof node ? node : module.parent.exports
);
