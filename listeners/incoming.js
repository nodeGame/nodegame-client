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
                     'added. Use "force" to add again');
            return false;
        }

        this.info('node: adding incoming listeners');

        /**
         * ## in.say.BYE
         *
         * Forces disconnection
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
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        node.events.ng.on( IN + say + 'PCONNECT', function(msg) {
            var p;
            if ('object' !== typeof msg.data) {
                node.err('received PCONNECT, but invalid data: ' + msg.data);
                return;
            }
            p = (msg.data instanceof Player) ? node.game.pl.add(msg.data) :
                node.game.pl.add(new Player(msg.data));

            node.emit('UPDATED_PLIST', 'pconnect', p);
            if (node.game.shouldStep()) node.game.step();
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
            var p;
            if ('object' !== typeof msg.data) {
                node.err('received PDISCONNECT, but invalid data: ' + msg.data);
                return;
            }
            p = node.game.pl.remove(msg.data.id);
            node.emit('UPDATED_PLIST', 'pdisconnect', p);
            if (node.game.shouldStep()) node.game.step();
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
            if ('object' !== typeof msg.data) {
                node.err('received MCONNECT, but invalid data: ' + msg.data);
                return;
            }
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
            if ('object' !== typeof msg.data) {
                node.err('received MDISCONNECT, but invalid data: ' + msg.data);
                return;
            }
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
            node.emit('UPDATED_PLIST', 'replace', node.game.pl);
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
         * - Replies to sender with the return values of emit, only if
         *     the return value is not "empty"
         *
         * @see JSUS.isEmpty
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
            var p;
            p = node.game.pl.updatePlayer(msg.from, msg.data);
            node.emit('UPDATED_PLIST', 'pupdate', p);
            if (node.game.shouldStep()) node.game.step();
            else if (node.game.shouldEmitPlaying()) node.emit('PLAYING');
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
         * It unstrigifies the payload before calling `node.setup`.
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
            emitGameCommandMsg(node, msg);
        });

        /**
         * ## in.get.GAMECOMMAND
         *
         * Executes a game command (pause, resume, etc.) and gives confirmation
         */
        node.events.ng.on( IN + get + 'GAMECOMMAND', function(msg) {
            var res;
            res = emitGameCommandMsg(node, msg);
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

// TODO: not used for now.
//         /**
//          * ## in.get.SESSION
//          *
//          * Gets the value of a variable registered in the session
//          *
//          * If msg.text is undefined returns all session variables
//          *
//          * @see GameSession.get
//          */
//         node.events.ng.on( IN + get + 'SESSION', function(msg) {
//             return node.session.get(msg.text);
//         });

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
     * ### emitGameCommandMsg
     *
     * Checks that the incoming message is valid, parses its data, and emits it
     *
     * @param {GameMsg} msg The incoming message
     *
     * @return {mixed} The return value of the emit call
     *
     * @see JSUS.parse
     * @see node.emit
     */
    function emitGameCommandMsg(node, msg) {
        var opts;
        if ('string' !== typeof msg.text) {
            node.err('"in.' + msg.action + '.GAMECOMMAND": msg.text must be ' +
                     'string. Found: ' + msg.text);
            return false;
        }
        if (!parent.constants.gamecommands[msg.text]) {
            node.err('"in.' + msg.action + '.GAMECOMMAND": unknown game  ' +
                     'command received: ' + msg.text);
            return false;
        }

        opts = 'string' === typeof msg.data ? J.parse(msg.data) : msg.data;
        return node.emit('NODEGAME_GAMECOMMAND_' + msg.text, opts);
    }

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
