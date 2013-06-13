/**
 * # nodeGame
 *
 * Social Experiments in the Browser
 *
 * Copyright(c) 2012 Stefano Balietti MIT Licensed
 *
 * *nodeGame* is a free, open source, event-driven javascript framework for on
 * line, multiplayer games in the browser.
 *
 * ---
 *
 */
(function (exports, node) {

    var EventEmitterManager = node.EventEmitterManager,
        EventEmitter = node.EventEmitter,
        Socket = node.Socket,
        GameStage = node.GameStage,
        GameMsg = node.GameMsg,
        Game = node.Game,
        Player = node.Player,
        GameSession = node.GameSession,
        J = node.JSUS;

// ## Methods


/**
 * ### node.env
 *
 * Executes a block of code conditionally to nodeGame environment variables
 *
 * @param env {string} The name of the environment
 * @param func {function} The callback function to execute
 * @param ctx {object} Optional. The context of execution
 * @param params {array} Optional. An array of additional parameters for the callback
 *
 */
    node.env = function (env, func, ctx, params) {
        if (!env || !func || !node.env[env]) return;
        ctx = ctx || node;
        params = params || [];
        func.apply(ctx, params);
    };


/**
 * ### node.createPlayer
 *
 * Creates player
 */
    node.createPlayer = function (player) {
        player = new Player(player);

        if (node.player &&
                node.player.stateLevel >= node.stateLevels.STARTING &&
                node.player.stateLevel !== node.stateLevels.GAMEOVER) {
            throw new node.NodeGameIllegalOperationError(
                    'createPlayer: cannot create player while game is running');
        }

        // Overwrite existing 'current' player:
        if (node.player) {
            node.game.pl.remove(node.player.id);
        }

        node.player = node.game.pl.add(player);

        node.emit('PLAYER_CREATED', node.player);

        return node.player;
    };

/**
 * ### node.connect
 *
 * Establishes a connection with a nodeGame server
 *
 * @param {object} conf A configuration object
 * @param {object} game The game object
 */
    node.connect = function (url) {
        if (node.socket.connect(url)) {
            node.emit('NODEGAME_CONNECTED');
        }
    };


/**
 * ### node.play
 *
 * Starts a game
 */
    node.play = function() {
        node.game.start();
    };

/**
 * ### node.replay
 *
 * Moves the game stage to 1.1.1
 *
 * @param {boolean} rest TRUE, to erase the game memory before update the game stage
 */
    node.replay = function (reset) {
        if (reset) node.game.memory.clear(true);
        node.game.execStep(node.plot.getStep("1.1.1"));
    };


/**
 * ### node.emit
 *
 * Emits an event locally on all registered event handlers
 *
 * The first parameter be the name of the event as _string_,
 * followed by any number of parameters that will be passed to the
 * handler callback.
 *
 * @see EventEmitterManager.emit
 */
    node.emit = function () {
        node.events.emit.apply(node.events, arguments);
    };

/**
 * ### node.say
 *
 * Sends a DATA message to a specified recipient
 *
 * @param {string} text The label associated to the message
 * @param {string} to Optional. The recipient of the message. Defaults, 'SERVER'
 * @param {mixed} data Optional. The content of the DATA message
 *
 */
    node.say = function (label, to, payload) {
        var msg;

        if ('undefined' === typeof label) {
            node.err('cannot say empty message');
            return false;
        }

        msg = node.msg.create({
            target: node.target.DATA,
            to: to || 'SERVER',
            text: label,
            data: payload
        });
        // @TODO when refactoring is finished, emit this event.
        // By default there nothing should happen, but people could listen to it
        //node.emit('out.say.DATA', msg);
        this.socket.send(msg);
    };

/**
 * ### node.set
 *
 * Stores a key-value pair in the server memory
 *
 *
 *
 * @param {string} key An alphanumeric (must not be unique)
 * @param {mixed} The value to store (can be of any type)
 *
 */
    node.set = function (key, value, to) {
        var msg;

        if ('undefined' === typeof key) {
            node.err('cannot set undefined key');
            return false;
        }

        msg = node.msg.create({
            action: node.action.SET,
            target: node.target.DATA,
            to: to || 'SERVER',
            reliable: 1,
            text: key,
            data: value
        });
        // @TODO when refactoring is finished, emit this event.
        // By default there nothing should happen, but people could listen to it
        //node.emit('out.set.DATA', msg);
        this.socket.send(msg);
    };


/**
 * ### node.get
 *
 * Sends a GET message to a recipient and listen to the reply
 *
 * @param {string} key The label of the GET message
 * @param {function} cb The callback function to handle the return message
 *
 * Experimental. Undocumented (for now)
 */
    node.get = function (key, cb, to) {
        var msg, g, ee;

        if ('undefined' === typeof key) {
            node.err('cannot get empty key');
            return false;
        }

        if ('function' !== typeof cb) {
            node.err('node.get requires a valid callback function');
            return false;
        }

        msg = node.msg.create({
            action: node.action.GET,
            target: node.target.DATA,
            to: to || 'SERVER',
            reliable: 1,
            text: key
        });

        // @TODO when refactoring is finished, emit this event.
        // By default there nothing should happen, but people could listen to it
        //node.events.emit('out.get.DATA', msg);

        ee = node.getCurrentEventEmitter();

        function g(msg) {
            if (msg.text === key) {
                cb.call(node.game, msg.data);
                ee.remove('in.say.DATA', g);
            }
        };

        ee.on('in.say.DATA', g);
    };

/**
 * ### node.on
 *
 * Registers an event listener
 *
 * Listeners registered before a game is started, e.g. in
 * the init function of the game object, will stay valid
 * throughout the game. Listeners registered after the game
 * is started will be removed after the game has advanced
 * to its next stage.
 *
 * @param {string} event The name of the event
 * @param {function} listener The callback function
 */
    node.on = function (event, listener) {
        var ee;
        ee = node.getCurrentEventEmitter();
        ee.on(event, listener);
    };

/**
 * ### node.done
 *
 * Emits a DONE event
 *
 * A DONE event signals that the player has completed
 * a game step. After a DONE event the step rules are
 * evaluated.
 *
 * Accepts any number of input parameters that will be
 * passed to the `node.emit`.
 *
 * @see node.emit
 * @emits DONE
 */
    node.done = function() {
        var args, len;
        switch(arguments.length) {

        case 0:
            node.emit('DONE');
            break;
        case 1:
            node.emit('DONE', arguments[0]);
            break;
        case 2:
            node.emit('DONE', arguments[0], arguments[1]);
            break;
        default:

            len = arguments.length;
            args = new Array(len - 1);
            for (i = 1; i < len; i++) {
                args[i - 1] = arguments[i];
            }
            node.emit.apply('DONE', args);
        }
    };

/**
 * ### node.getCurrentEventEmitter
 *
 * Returns the last active event emitter obj
 *
 * TODO: finish the method
 *
 * TODO: add proper doc
 *
 * @param {EventEmitter} The current event emitter obj
 */
    node.getCurrentEventEmitter = function() {
        // NodeGame default listeners
        if (!node.game || !node.game.getCurrentGameStage()) {
            return node.events.ee.ng;
        }

        // It is a game init function
        if ((GameStage.compare(node.game.getCurrentGameStage(), new GameStage()) === 0 )) {
            return node.events.ee.game;
        }

        // TODO return the stage ee

        // It is a game step function
        else {
            return node.events.ee.step;
        }
    };

/**
 * ### node.once
 *
 * Registers an event listener that will be removed
 * after its first invocation
 *
 * @param {string} event The name of the event
 * @param {function} listener The callback function
 *
 * @see node.on
 * @see node.off
 */
    node.once = function (event, listener) {
        if (!event || !listener) return;
        node.on(event, listener);
        node.on(event, function(event, listener) {
            node.events.remove(event, listener);
        });
    };

/**
 * ### node.off
 *
 * Deregisters one or multiple event listeners
 *
 * @param {string} event The name of the event
 * @param {function} listener The callback function
 *
 * @see node.on
 * @see node.EventEmitter.remove
 */
    node.off  = function (event, func) {
        return node.events.remove(event, func);
    };

/**
 * ### node.redirect
 *
 * Redirects a player to the specified url
 *
 * Works only if it is a monitor client to send
 * the message, i.e. players cannot redirect each
 * other.
 *
 * Examples
 *
 *  // Redirect to http://mydomain/mygame/missing_auth
 *  node.redirect('missing_auth', 'xxx');
 *
 *  // Redirect to external urls
 *  node.redirect('http://www.google.com');
 *
 * @param {string} url the url of the redirection
 * @param {string} who A player id or 'ALL'
 * @return {boolean} TRUE, if the redirect message is sent
 */
    node.redirect = function (url, who) {
        var msg;
        if ('string' !== typeof url) {
            node.err('redirect requires a valid string');
            return false;
        }
        if ('undefined' === typeof who) {
            node.err('redirect requires a valid recipient');
            return false;
        }
        msg = node.msg.create({
            target: node.target.REDIRECT,
            data: url,
            to: who
        });
        node.socket.send(msg);
        return true;
    };

/**
 * ### node.remoteCommand
 *
 * Executes a game command on a client
 *
 * Works only if it is a monitor client to send
 * the message, i.e. players cannot send game commands
 * to each others
 *
 * @param {string} command The command to execute
 * @param {string} to The id of the player to command
 * @return {boolean} TRUE, if the game command is sent
 */
    node.remoteCommand = function (command, to, options) {
        var msg;
        if (!command) {
            node.err('remoteCommand requires a valid command');
            return false;
        }
        if ('undefined' === typeof to) {
            node.err('remoteCommand requires a valid recipient');
            return false;
        }

        msg = node.msg.create({
            target: node.target.GAMECOMMAND,
            text: command,
            data: options,
            to: to
        });
        return node.socket.send(msg);
    };

    node.info(node.version + ' loaded');


    // Creating the objects
    // <!-- object commented in index.js -->
    node.events = new EventEmitterManager();

    node.msg = node.GameMsgGenerator;

    node.session = new GameSession();

    node.socket = new Socket();

    node.game = new Game();


})(
    this
 ,  'undefined' != typeof node ? node : module.parent.exports
);
