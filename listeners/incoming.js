// # Incoming listeners
// Incoming listeners are fired in response to incoming messages
(function (exports, parent) {

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

        if (this.incomingAdded && !force) {
            this.err('Default incoming listeners already added once. Use the force flag to re-add.');
            return false;
        }
        
        /**
         * ## in.say.PCONNECT
         *
         * Adds a new player to the player list from the data contained in the message
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        this.events.ng.on( IN + say + 'PCONNECT', function (msg) {
            if (!msg.data) return;
            this.game.pl.add(new Player(msg.data));
            this.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.PDISCONNECT
         *
         * Removes a player from the player list based on the data contained in the message
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        this.events.ng.on( IN + say + 'PDISCONNECT', function (msg) {
            if (!msg.data) return;
            this.game.pl.remove(msg.data.id);
            this.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.MCONNECT
         *
         * Adds a new monitor to the monitor list from the data contained in the message
         *
         * @emit UPDATED_MLIST
         * @see Game.ml
         */
        this.events.ng.on( IN + say + 'MCONNECT', function (msg) {
            if (!msg.data) return;
            this.game.ml.add(new Player(msg.data));
            this.emit('UPDATED_MLIST');
        });

        /**
         * ## in.say.MDISCONNECT
         *
         * Removes a monitor from the player list based on the data contained in the message
         *
         * @emit UPDATED_MLIST
         * @see Game.ml
         */
        this.events.ng.on( IN + say + 'MDISCONNECT', function (msg) {
            if (!msg.data) return;
            this.game.ml.remove(msg.data.id);
            this.emit('UPDATED_MLIST');
        });


        /**
         * ## in.say.PLIST
         *
         * Creates a new player-list object from the data contained in the message
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        this.events.ng.on( IN + say + 'PLIST', function (msg) {
            if (!msg.data) return;
            this.game.pl = new PlayerList({}, msg.data);
            this.emit('UPDATED_PLIST');
        });

        /**
         * ## in.say.MLIST
         *
         * Creates a new monitor-list object from the data contained in the message
         *
         * @emit UPDATED_MLIST
         * @see Game.pl
         */
        this.events.ng.on( IN + say + 'MLIST', function (msg) {
            if (!msg.data) return;
            this.game.ml = new PlayerList({}, msg.data);
            this.emit('UPDATED_MLIST');
        });

        /**
         * ## in.get.DATA
         *
         * Experimental feature. Undocumented (for now)
         */
        this.events.ng.on( IN + get + 'DATA', function (msg) {
            if (msg.text === 'LOOP'){
                this.socket.sendDATA(action.SAY, this.game.plot, msg.from, 'GAME');
            }
            // <!-- We could double emit
            // this.emit(msg.text, msg.data); -->
        });

        /**
         * ## in.set.STATE
         *
         * Adds an entry to the memory object
         *
         */
        this.events.ng.on( IN + set + 'STATE', function (msg) {
            this.game.memory.add(msg.text, msg.data, msg.from);
        });

        /**
         * ## in.set.DATA
         *
         * Adds an entry to the memory object
         *
         */
        this.events.ng.on( IN + set + 'DATA', function (msg) {
            this.game.memory.add(msg.text, msg.data, msg.from);
        });

        /**
         * ## in.say.PLAYER_UPDATE
         *
         * Updates the player's state in the player-list object
         *
         * @emit UPDATED_PLIST
         * @see Game.pl
         */
        this.events.ng.on( IN + say + 'PLAYER_UPDATE', function (msg) {
            this.game.pl.updatePlayer(msg.from, msg.data);
            this.emit('UPDATED_PLIST');
            this.game.shouldStep();
        });

        /**
         * ## in.say.STAGE
         *
         * Updates the game stage
         */
        this.events.ng.on( IN + say + 'STAGE', function (msg) {
            this.game.execStep(this.game.plot.getStep(msg.data));
        });

        /**
         * ## in.say.STAGE_LEVEL
         *
         * Updates the stage level
         */
        this.events.ng.on( IN + say + 'STAGE_LEVEL', function (msg) {
            //this.game.setStageLevel(msg.data);
        });

        /**
         * ## in.say.REDIRECT
         *
         * Redirects to a new page
         *
         * @see node.redirect
         */
        this.events.ng.on( IN + say + 'REDIRECT', function (msg) {
            if (!msg.data) return;
            if ('undefined' === typeof window || !window.location) {
                this.err('window.location not found. Cannot redirect');
                return false;
            }

            window.location = msg.data;
        });


        /**
         * ## in.say.SETUP
         *
         * Setups a features of nodegame
         *
         * Unstrigifies the payload before calling `node.setup`
         *
         * @see node.setup
         * @see JSUS.parse
         */
        this.events.ng.on( IN + say + 'SETUP', function (msg) {
            if (!msg.text) return;
            var feature = msg.text,
            payload = ('string' === typeof msg.data) ? J.parse(msg.data) : msg.data;

            if (!payload) {
                this.err('error while parsing incoming remote setup message');
                return false;
            }
            this.setup.apply(this, [feature].concat(payload));
        });


        /**
         * ## in.say.GAMECOMMAND
         *
         * Setups a features of nodegame
         *
         * @see node.setup
         */
        this.events.ng.on( IN + say + 'GAMECOMMAND', function (msg) {
            if (!msg.text || !this.gamecommand[msg.text]) {
                this.err('unknown game command received: ' + msg.text);
                return;
            }
            this.emit('NODEGAME_GAMECOMMAND_' + msg.text, msg.data);
        });

        /**
         * ## in.say.JOIN
         *
         * Invites the client to leave the current channel and joining another one
         *
         * It differs from `REDIRECT` messages because the client
         * does not leave the page, it just switches channel.
         *
         * @experimental
         */
        this.events.ng.on( IN + say + 'JOIN', function (msg) {
            if (!msg.text) return;
            //this.socket.disconnect();
            this.connect(msg.text);
        });

        this.incomingAdded = true;
        this.silly('incoming listeners added');
        return true;
    };

    
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
// <!-- ends incoming listener -->