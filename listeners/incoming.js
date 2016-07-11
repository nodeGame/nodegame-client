/**
 * # incoming
 * Copyright(c) 2016 Stefano Balietti
 * MIT Licensed
 *
 * Listeners for incoming messages
 */
(function(exports, parent) {

    "use strict";

    var NGC = parent.NodeGameClient;

    var PlayerList = parent.PlayerList,
    Player = parent.Player,
    J = parent.JSUS;

    var action = parent.constants.action;

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
     *
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
        node.events.ng.on( IN + say + 'BYE', function(msg) {
            var force;
            if (msg.data) {
                // Options for reconnections, for example.
                // Sending data, do something before disconnect.
            }
            force = true;
            node.socket.disconnect(force);
        });

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

            if ('string' !== typeof msg.text || msg.text.trim() === '') {
                node.err('"in.get.DATA": msg.data must be a non-empty string.');
                return;
            }
            res = node.emit(get + msg.text, msg);
            if (!J.isEmpty(res)) {
                node.say(msg.text + '_' + msg.id, msg.from, res);
            }
        });

        /**
         * ## in.set.DATA
         *
         * Adds an entry to the memory object
         *
         * Decorates incoming msg.data object with the following properties:
         *
         *   - player: msg.from
         *   - stage: msg.stage
         */
        node.events.ng.on( IN + set + 'DATA', function(msg) {
            var o = msg.data;
            o.player = msg.from, o.stage = msg.stage;
            node.game.memory.add(o);
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
         * ## in.say.REDIRECT
         *
         * Redirects to a new page
         *
         * @see node.redirect
         */
        node.events.ng.on( IN + say + 'REDIRECT', function(msg) {
            if ('string' !== typeof msg.data) {
                node.err('"in.say.REDIRECT": msg.data must be string: ' +
                         msg.data);
                return false;
            }
            if ('undefined' === typeof window || !window.location) {
                node.err('"in.say.REDIRECT": window.location not found.');
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
                node.err('"in.say.SETUP": msg.text must be string: ' +
                         feature);
                return;
            }
            if (!node._setup[feature]) {
                node.err('"in.say.SETUP": no such setup function: ' +
                         feature);
                return;
            }

            payload = 'string' === typeof msg.data ?
                J.parse(msg.data) : msg.data;

            if (!payload) {
                node.err('"in.say.SETUP": error while parsing ' +
                         'payload of incoming remote setup message.');
                return;
            }

            node.setup.apply(node, [feature].concat(payload));
        });

        /**
         * ## in.say.GAMECOMMAND
         *
         * Executes a game command (pause, resume, etc.)
         */
        node.events.ng.on( IN + say + 'GAMECOMMAND', function(msg) {
            if (!checkGameCommandMsg(msg)) return;
            node.emit('NODEGAME_GAMECOMMAND_' + msg.text, msg.data);
        });

        /**
         * ## in.get.GAMECOMMAND
         *
         * Executes a game command (pause, resume, etc.) and gives confirmation
         */
        node.events.ng.on( IN + get + 'GAMECOMMAND', function(msg) {
            var res;
            if (!checkGameCommandMsg(msg)) return;
            res = node.emit('NODEGAME_GAMECOMMAND_' + msg.text, msg.data);
            if (!J.isEmpty(res)) {
                // New key must contain msg.id.
                node.say(msg.text + '_' + msg.id, msg.from, res);
            }
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
            if ('string' !== typeof msg.text || msg.text.trim() === '') {
                node.err('"in.say.ALERT": msg.text must be a non-empty string');
                return;
            }
            if ('undefined' !== typeof window) {
                if ('undefined' === typeof alert) {
                    node.err('"in.say.ALERT": alert is not defined: ' +
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

    // ## Helper functions.

    /**
     * ### checkGameCommandMsg
     *
     * Checks that the incoming message contains a valid command and options
     *
     * Msg.data contains the options for the command. If string, it will be
     * parsed with JSUS.parse
     *
     * @param {GameMsg} msg The incoming message
     *
     * @see JSUS.parse
     */
    function checkGameCommandMsg(msg) {
        if ('string' !== typeof msg.text || msg.text.trim() === '') {
            node.err('"in.' + msg.action + '.GAMECOMMAND": msg.text must be ' +
                     'a non-empty string: ' + msg.text);
            return false;
        }
        if (!parent.constants.gamecommands[msg.text]) {
            node.err('"in.' + msg.action + '.GAMECOMMAND": unknown game  ' +
                     'command received: ' + msg.text);
            return false;
        }

        // Parse msg.data.
        if ('string' === typeof msg.data) msg.data = J.parse(msg.data);

        return true;
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
