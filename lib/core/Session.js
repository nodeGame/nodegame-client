/**
 * # GameSession
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` session manager
 * @experimental
 * ---
 */
(function(exports, node) {

    "use strict";

    // ## Global scope

    var GameMsg = node.GameMsg,
    Player = node.Player,
    GameMsgGenerator = node.GameMsgGenerator,
    J = node.JSUS;

    // Exposing constructor.
    exports.GameSession = GameSession;
    exports.GameSession.SessionManager = SessionManager;

    GameSession.prototype = new SessionManager();
    GameSession.prototype.constructor = GameSession;

    /**
     * ## GameSession constructor
     *
     * Creates a new instance of GameSession
     *
     * @param {NodeGameClient} node A reference to the node object. 
     */
    function GameSession(node) {
        SessionManager.call(this);

        /**
         * ## GameSession.node
         *
         * The reference to the node object.
         */
        this.node = node;

        // Register default variables in the session.
        this.register('player', {
            set: function(p) {
                node.createPlayer(p);
            },
            get: function() {
                return node.player;
            }
        });

        this.register('game.memory', {
            set: function(value) {
                node.game.memory.clear(true);
                node.game.memory.importDB(value);
            },
            get: function() {
                return (node.game.memory) ? node.game.memory.fetch() : null;
            }
        });

        this.register('events.history', {
            set: function(value) {
                node.events.history.history.clear(true);
                node.events.history.history.importDB(value);
            },
            get: function() {
                return node.events.history ? 
                    node.events.history.history.fetch() : null;
            }
        });

        this.register('game.currentStepObj', {
            set: GameSession.restoreStage,
            get: function() {
                return node.game.getCurrentStep();
            }
        });

        this.register('node.env');
    }


    GameSession.prototype.restoreStage = function(stage) {

        try {
            // GOTO STATE
            node.game.execStage(node.plot.getStep(stage));

            var discard = ['LOG',
                           'STATECHANGE',
                           'WINDOW_LOADED',
                           'BEFORE_LOADING',
                           'LOADED',
                           'in.say.STATE',
                           'UPDATED_PLIST',
                           'NODEGAME_READY',
                           'out.say.STATE',
                           'out.set.STATE',
                           'in.say.PLIST',
                           'STAGEDONE', // maybe not here
                           'out.say.HI'
                          ];

            // RE-EMIT EVENTS
            node.events.history.remit(node.game.getStateLevel(), discard);
            node.info('game stage restored');
            return true;
        }
        catch(e) {
            node.err('could not restore game stage. An error has occurred: ' + e);
            return false;
        }

    };

    /**
     * ## Session Manager constructor
     *
     * Creates a new session manager.
     */ 
    function SessionManager() {
        
        /**
         * ## SessionManager.session
         *
         * Container of all variables registered in the session.
         */
        this.session = {};
    }

    /**
     * ## SessionManager.getVariable (static)
     *
     * Default session getter.
     *
     * @param {string} p The path to a variable included in _node_
     * @return {mixed} The requested variable
     */
    SessionManager.getVariable = function(p) {
        return J.getNestedValue(p, node);
    };

    /**
     * ## SessionManager.setVariable (static)
     *
     * Default session setter.
     *
     * @param {string} p The path to the variable to set in _node_
     * @param {mixed} value The value to set
     */
    SessionManager.setVariable = function(p, value) {
        J.setNestedValue(p, value, node);
    };

    SessionManager.prototype.register = function(path, options) {
        if ('string' !== typeof path) {
            throw new TypeError('SessionManager.register: path must be ' +
                                'string.');
        }
        if (options && 'object' !== typeof options) {
            throw new TypeError('SessionManager.register: options must be ' +
                                'object or undefined.');
        }

        this.session[path] = {

            get: (options && options.get) ? 
                options.get : function() {
                    return J.getNestedValue(path, node);
                },

            set: (options && options.set) ? 
                options.set : function(value) {
                    J.setNestedValue(path, value, node);
                }
        };

        return this.session[path];
    };

    SessionManager.prototype.unregister = function(path) {
        if ('string' !== typeof path) {
            throw new TypeError('SessionManager.unregister: path must be ' +
                                'string.');
        }
        if (!this.session[path]) {
            node.warn('SessionManager.unregister: path is not registered ' +
                      'in the session: ' + path + '.');
            return false;
        }

        delete this.session[path];
        return true;
    };

    SessionManager.prototype.get = function(path) {
        var session = {};
        // Returns one variable.
        if ('string' === typeof path) {
            return this.session[path] ? this.session[path].get() : undefined;
        }
        // Returns all registered variables.
        else if ('undefined' === typeof path) {
            for (path in this.session) {
                if (this.session.hasOwnProperty(path)) {
                    session[path] = this.session[path].get();
                }
            }
            return session;
        }
        else {
            throw new TypeError('SessionManager.get: path must be string or ' +
                                'undefined.');
        }
    };

    SessionManager.prototype.save = function() {
        var session = {};
        for (var path in this.session) {
            if (this.session.hasOwnProperty(path)) {
                session[path] = {
                    value: this.session[path].get(),
                    get: this.session[path].get,
                    set: this.session[path].set
                };
            }
        }
        return session;
    };

    SessionManager.prototype.load = function(session) {
        for (var i in session) {
            if (session.hasOwnProperty(i)) {
                this.register(i, session[i]);
            }
        }
    };

    SessionManager.prototype.clear = function() {
        this.session = {};
    };

    SessionManager.prototype.restore = function(sessionObj) {
        if (!sessionObj) {
            node.err('cannot restore empty session object');
            return ;
        }

        for (var i in sessionObj) {
            if (sessionObj.hasOwnProperty(i)) {
                sessionObj[i].set(sessionObj[i].value);
            }
        }

        return true;
    };

    SessionManager.prototype.store = function() {
        //node.store(node.socket.id, this.get());
    };

    SessionManager.prototype.store = function() {
        //node.store(node.socket.id, this.get());
    };

    // Helping functions

    //function isReference(value) {
    //    var type = typeof(value);
    //    if ('function' === type) return true;
    //    if ('object' === type) return true;
    //    return false;
    //}

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);