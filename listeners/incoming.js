/**
 * # incoming
 * Copyright(c) 2014 Stefano Balietti
 * MIT Licensed
 *
 * Listeners for incoming messages
 *
 * TODO: PRECONNECT events are not handled, just emitted.
 * Maybe some default support should be given, or some
 * default handlers provided.
 */
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
     * @param {boolean} force Whether to force re-adding the listeners
     * @return {boolean} TRUE on success
     */
    NGC.prototype.addDefaultIncomingListeners = function(force) {
        var node = this;

        if (node.conf.incomingAdded && !force) {
            node.err('node.addDefaultIncomingListeners: listeners already ' +
                     'added once. Use the force flag to re-add.');
            return false;
        }

        this.info('node: adding incoming listeners.');

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
            if (node.game.shouldStep()) {
                node.game.step();
            }
            node.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.PDISCONNECT
         *
         * Removes a player from the player list
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PDISCONNECT', function(msg) {
            if (!msg.data) return;
            node.game.pl.remove(msg.data.id);
            if (node.game.shouldStep()) {
                node.game.step();
            }
            node.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.MCONNECT
         *
         * Adds a new monitor to the monitor list
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
         * Removes a monitor from the player list
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
         * Creates a new player-list object
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
         * Creates a new monitor-list object
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
         * Re-emits the incoming message, and replies back to the sender
         *
         * Does the following operations:
         *
         * - Validates the msg.text field
         * - Emits a get.<msg.text> event
         * - Replies to the sender with with the return values of the emit call
         */
        node.events.ng.on( IN + get + 'DATA', function(msg) {
            var res;

            if ('string' !== typeof msg.text || msg.text === '') {
                node.warn('node.in.get.DATA: invalid / missing event name.');
                return;
            }
            res = node.emit(get + msg.text, msg);
            if (!J.isEmpty(res)) {
                node.say(msg.text + '_' + msg.id, msg.from, res);
            }
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
            feature = msg.text;
            if ('string' !== typeof feature) {
                node.err('node.on.in.say.SETUP: msg.text must be string.');
                return false;
            }
            if (!node.setup[feature]) {
                node.err('node.on.in.say.SETUP: no such setup function: ' +
                        feature + '.');
                return false;
            }

            payload = 'string' === typeof msg.data ?
                J.parse(msg.data) : msg.data;

            if (!payload) {
                node.err('node.on.in.say.SETUP: error while parsing ' +
                         'payload of incoming remote setup message.');
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
            // console.log('GM', msg);
            if (!msg.text || !parent.constants.gamecommands[msg.text]) {
                node.err('node.on.in.say.GAMECOMMAND: unknown game command ' +
                         'received: ' + msg.text);
                return;
            }
            node.emit('NODEGAME_GAMECOMMAND_' + msg.text, msg.data);
        });

        /**
         * ## in.say.ALERT
         *
         * Displays an alert message (if in the browser window)
         *
         * If in Node.js, the message will be printed to standard output.
         *
         * @see node.setup
         */
        node.events.ng.on( IN + say + 'ALERT', function(msg) {
            if (J.isEmpty(msg.text)) {
                node.err('Alert message received, but content is empty.');
                return;
            }
            if ('undefined' !== typeof window) {
                if ('undefined' === typeof alert) {
                    node.err('Alert msg received, but alert is not defined:' +
                             msg.text);
                    return;
                }
                alert(msg.text);
            }
            else {
                console.log('****** ALERT ******');
                console.log(msg.text);
                console.log('*******************');
            }
        });

        /**
         * ## in.get.SESSION
         *
         * Gets the value of a variable registered in the session
         *
         * If msg.text is undefined returns all session variables
         *
         * @see GameSession.get
         */
        node.events.ng.on( IN + get + 'SESSION', function(msg) {
            return node.session.get(msg.text);
        });

        /**
         * ## in.get.PLOT
         *
         * Gets the current plot sequence or the full plot state.
         *
         * @see GamePlot
         * @see Stager
         */
        node.events.ng.on( IN + get + 'PLOT', function(msg) {
            if (!node.game.plot.stager) return null;
            if (msg.text === 'state') {
                return node.game.plot.stager.getState();
            }
            return node.game.plot.stager.getSequence();
        });

        /**
         * ## in.get.PLIST
         *
         * Gets the current _PlayerList_ object
         *
         * @see PlayerList
         * @see node.game.pl
         */
        node.events.ng.on( IN + get + 'PLIST', function() {
            return node.game.pl.db;
        });

        /**
         * ## in.get.PLAYER
         *
         * Gets the current _Player_ object
         *
         * @see Player
         */
        node.events.ng.on( get + 'PLAYER', function() {
            return node.player;
        });

        /**
         * ## in.get.LANG | get.LANG
         *
         * Gets the currently used language
         *
         * @see node.player.lang
         */
        node.events.ng.on( IN + get + 'LANG', function() {
            return node.player.lang;
        });

        node.events.ng.on( get + 'LANG', function() {
            return node.player.lang;
        });

        /**
         * ## in.set.LANG
         *
         * Sets the currently used language
         *
         * @see NodeGameClient.setLanguage
         * @see node.player.lang
         */
        node.events.ng.on( IN + set + 'LANG', function(msg) {
            node.setLanguage(msg.data);
        });

        /**
         * ## get.PING
         *
         * Returns a dummy reply to PING requests
         */
        node.events.ng.on( get + 'PING', function() {
            return 'pong';
        });


        node.conf.incomingAdded = true;
        node.silly('node: incoming listeners added.');
        return true;
    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
