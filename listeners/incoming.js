// # Incoming listeners
// Incoming listeners are fired in response to incoming messages
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var GameMsg = parent.GameMsg,
    GameSage = parent.GameStage,
    PlayerList = parent.PlayerList,
    Player = parent.Player,
    J = parent.JSUS;

    var action = parent.constants.action,
    target = parent.constants.target;

    var say = action.SAY + '.',
    set = action.SET + '.',
    get = action.GET + '.',
        IN = parent.constants.IN;

    /**
     * ## NodeGameClient.addDefaultIncomingListeners
     *
     * Adds a battery of event listeners for incoming messages
     *
     * If executed once, it requires a force flag to re-add the listeners
     *
     * @param {boolean} TRUE, to force re-adding the listeners
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultIncomingListeners = function(force) {
        var node = this;

        if (node.incomingAdded && !force) {
            node.err('node.addDefaultIncomingListeners: listeners already ' +
                     'added once. Use the force flag to re-add.');
            return false;
        }

        /**
         * ## in.say.PCONNECT
         *
         * Adds a new player to the player list
         *
         * @emit UDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PCONNECT', function(msg) {
            if (!msg.data) return;
            node.game.pl.add(new Player(msg.data));
            node.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.PDISCONNECT
         *
         * Removes a player from the player list based on the data contained in the message
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PDISCONNECT', function(msg) {
            if (!msg.data) return;
            node.game.pl.remove(msg.data.id);
            node.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.MCONNECT
         *
         * Adds a new monitor to the monitor list from the data contained in the message
         *
         * @emit UPDATED_MLIST
         * @see Game.ml
         */
        node.events.ng.on( IN + say + 'MCONNECT', function(msg) {
            if (!msg.data) return;
            node.game.ml.add(new Player(msg.data));
            node.emit('UPDATED_MLIST');
        });

        /**
         * ## in.say.MDISCONNECT
         *
         * Removes a monitor from the player list based on the data contained in the message
         *
         * @emit UPDATED_MLIST
         * @see Game.ml
         */
        node.events.ng.on( IN + say + 'MDISCONNECT', function(msg) {
            if (!msg.data) return;
            node.game.ml.remove(msg.data.id);
            node.emit('UPDATED_MLIST');
        });

        /**
         * ## in.say.PLIST
         *
         * Creates a new player-list object from the data contained in the message
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PLIST', function(msg) {
            if (!msg.data) return;
            node.game.pl = new PlayerList({}, msg.data);
            node.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.MLIST
         *
         * Creates a new monitor-list object from the data contained in the message
         *
         * @emit UPDATED_MLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'MLIST', function(msg) {
            if (!msg.data) return;
            node.game.ml = new PlayerList({}, msg.data);
            node.emit('UPDATED_MLIST');
        });

        /**
         * ## in.get.DATA
         *
         * Experimental feature. Undocumented (for now)
         */
        node.events.ng.on( IN + get + 'DATA', function(msg) {
            var res;
            if (!msg.text) {
                node.warn('node.in.get.DATA: no event name');
                return;
            }
            res = node.emit(msg.text, msg.data);
            node.say(msg.text, msg.from, res);
        });

        /**
         * ## in.set.STATE
         *
         * Adds an entry to the memory object
         *
         * TODO: check, this should be a player update
         */
        node.events.ng.on( IN + set + 'STATE', function(msg) {
            node.game.memory.add(msg.text, msg.data, msg.from);
        });

        /**
         * ## in.set.DATA
         *
         * Adds an entry to the memory object
         *
         */
        node.events.ng.on( IN + set + 'DATA', function(msg) {
            node.game.memory.add(msg.text, msg.data, msg.from);
        });

        /**
         * ## in.say.PLAYER_UPDATE
         *
         * Updates the player's state in the player-list object
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PLAYER_UPDATE', function(msg) {
            console.log(msg.data);
            node.game.pl.updatePlayer(msg.from, msg.data);
            node.emit('UPDATED_PLIST');
            if (node.game.shouldStep()) {
                node.game.step();
            }
            else if (node.game.shouldEmitPlaying()) {
                node.emit('PLAYING');
            }
        });

        /**
         * ## in.say.STAGE
         *
         * Updates the game stage
         */
        node.events.ng.on( IN + say + 'STAGE', function(msg) {
            var stageObj;
            if (!msg.data) {
                node.warn('Received in.say.STAGE msg with empty stage');
                return;
            }
            stageObj = node.game.plot.getStep(msg.data);

            if (!stageObj) {
                node.err('Received in.say.STAGE msg with invalid stage');
                return;
            }
            // TODO: renable when it does not cause problems.
            // At the moment the AdminServer sends this kind of msg
            // each time an admin publishes its own state
            //node.game.execStep(stageObj);
        });

        /**
         * ## in.say.STAGE_LEVEL
         *
         * Updates the stage level
         */
        node.events.ng.on( IN + say + 'STAGE_LEVEL', function(msg) {
            //node.game.setStageLevel(msg.data);
        });

        /**
         * ## in.say.REDIRECT
         *
         * Redirects to a new page
         *
         * @see node.redirect
         */
        node.events.ng.on( IN + say + 'REDIRECT', function(msg) {
            if (!msg.data) return;
            if ('undefined' === typeof window || !window.location) {
                node.err('window.location not found. Cannot redirect');
                return false;
            }

            window.location = msg.data;
        });

        /**
         * ## in.say.SETUP
         *
         * Setups a features of nodegame
         *
         * Unstrigifies the payload before calling `node.setup`.
         *
         * @see node.setup
         * @see JSUS.parse
         */
        node.events.ng.on( IN + say + 'SETUP', function(msg) {
            var payload, feature;
            if (!msg.text) return;
            feature = msg.text,
            payload = 'string' === typeof msg.data ?
                J.parse(msg.data) : msg.data;

            if (!payload) {
                node.err('node.on.in.say.SETUP: error while parsing ' +
                         'incoming remote setup message');
                return false;
            }
            node.setup.apply(node, [feature].concat(payload));
        });

        /**
         * ## in.say.GAMECOMMAND
         *
         * Setups a features of nodegame
         *
         * @see node.setup
         */
        node.events.ng.on( IN + say + 'GAMECOMMAND', function(msg) {
            if (!msg.text || !parent.constants.gamecommand[msg.text]) {
                node.err('unknown game command received: ' + msg.text);
                return;
            }
            node.emit('NODEGAME_GAMECOMMAND_' + msg.text, msg.data);
        });

        node.incomingAdded = true;
        node.silly('incoming listeners added');
        return true;
    };


})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
// <!-- ends incoming listener -->
