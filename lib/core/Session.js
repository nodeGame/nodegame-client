/**
 * # GameSession
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` session manager
 */
(function(exports, node) {

    "use strict";

    // ## Global scope

    var J = node.JSUS;

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
         * ### GameSession.node
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

        this.register('stage', {
            set: function() {
                // GameSession.restoreStage
            },
            get: function() {
                return node.player.stage;
            }
        });

        this.register('node.env');
    }


//    GameSession.prototype.restoreStage = function(stage) {
//
//        try {
//            // GOTO STATE
//            node.game.execStage(node.plot.getStep(stage));
//
//            var discard = ['LOG',
//                           'STATECHANGE',
//                           'WINDOW_LOADED',
//                           'BEFORE_LOADING',
//                           'LOADED',
//                           'in.say.STATE',
//                           'UPDATED_PLIST',
//                           'NODEGAME_READY',
//                           'out.say.STATE',
//                           'out.set.STATE',
//                           'in.say.PLIST',
//                           'STAGEDONE', // maybe not here
//                           'out.say.HI'
//                          ];
//
//            // RE-EMIT EVENTS
//            node.events.history.remit(node.game.getStateLevel(), discard);
//            node.info('game stage restored');
//            return true;
//        }
//        catch(e) {
//            node.err('could not restore game stage. ' +
//                     'An error has occurred: ' + e);
//            return false;
//        }
//
//    };

    /**
     * ## SessionManager constructor
     *
     * Creates a new session manager.
     */
    function SessionManager() {

        /**
         * ### SessionManager.session
         *
         * Container of all variables registered in the session.
         */
        this.session = {};
    }

    // ## SessionManager methods

    /**
     * ### SessionManager.getVariable (static)
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
     * ### SessionManager.setVariable (static)
     *
     * Default session setter.
     *
     * @param {string} p The path to the variable to set in _node_
     * @param {mixed} value The value to set
     */
    SessionManager.setVariable = function(p, value) {
        J.setNestedValue(p, value, node);
    };

    /**
     * ### SessionManager.register
     *
     * Register a new variable to the session
     *
     * Overwrites previously registered variables with the same name.
     *
     * Usage example:
     *
     * ```javascript
     * node.session.register('player', {
     *       set: function(p) {
     *           node.createPlayer(p);
     *       },
     *       get: function() {
     *           return node.player;
     *       }
     * });
     * ```
     *
     * @param {string} path A string containing a path to a variable
     * @param {object} conf Optional. Configuration object containing setters
     *   and getters
     */
    SessionManager.prototype.register = function(path, conf) {
        if ('string' !== typeof path) {
            throw new TypeError('SessionManager.register: path must be ' +
                                'string.');
        }
        if (conf && 'object' !== typeof conf) {
            throw new TypeError('SessionManager.register: conf must be ' +
                                'object or undefined.');
        }

        this.session[path] = {

            get: (conf && conf.get) ?
                conf.get : function() {
                    return J.getNestedValue(path, node);
                },

            set: (conf && conf.set) ?
                conf.set : function(value) {
                    J.setNestedValue(path, value, node);
                }
        };

        return this.session[path];
    };

    /**
     * ### SessionManager.unregister
     *
     * Unegister a variable from session
     *
     * @param {string} path A string containing a path to a variable previously
     *   registered.
     *
     * @see SessionManager.register
     */
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

    /**
     * ### SessionManager.clear
     *
     * Unegister all registered session variables
     *
     * @see SessionManager.unregister
     */
    SessionManager.prototype.clear = function() {
        this.session = {};
    };

    /**
     * ### SessionManager.get
     *
     * Returns the value/s of one/all registered session variable/s
     *
     * @param {string|undefined} path A previously registred variable or
     *   undefined to return all values
     *
     * @see SessionManager.register
     */
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

    /**
     * ### SessionManager.isRegistered
     *
     * Returns TRUE, if a variable is registred
     *
     * @param {string} path A previously registred variable
     *
     * @return {boolean} TRUE, if the variable is registered
     *
     * @see SessionManager.register
     * @see SessionManager.unregister
     */
    SessionManager.prototype.isRegistered = function(path) {
        if ('string' !== typeof path) {
            throw new TypeError('SessionManager.isRegistered: path must be ' +
                                'string.');
        }
        return this.session.hasOwnProperty(path);
    };

    /**
     * ### SessionManager.serialize
     *
     * Returns an object containing that can be to restore the session
     *
     * The serialized session is an object containing _getter_, _setter_, and
     * current value of each of the registered session variables.
     *
     * @return {object} session The serialized session
     *
     * @see SessionManager.restore
     */
    SessionManager.prototype.serialize = function() {
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

    /**
     * ### SessionManager.restore
     *
     * Restore a previously serialized session object
     *
     * @param {object} session A serialized session object
     * @param {boolean} register Optional. If TRUE, every path is also
     *    registered before being restored.
     */
    SessionManager.prototype.restore = function(session, register) {
        var i;
        if ('object' !== typeof session) {
            throw new TypeError('SessionManager.restore: session must be ' +
                                'object.');
        }
        register = 'undefined' !== typeof register ? register : true;
        for (i in session) {
            if (session.hasOwnProperty(i)) {
                if (register) this.register(i, session[i]);
                session[i].set(session[i].value);
            }
        }
    };

//    SessionManager.prototype.store = function() {
//        //node.store(node.socket.id, this.get());
//    };

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
