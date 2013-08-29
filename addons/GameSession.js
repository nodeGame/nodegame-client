/**
 * # GameSession
 *
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 *
 * Addon to save and load the nodeGame session in the browser
 *
 *  @see node.store
 *
 * ---
 *
 */

(function (exports) {

    // ## Global scope

    var store = exports.store;

    var prefix = 'nodegame_';

    function GameSession(node) {
        this.node = node;
    }

    /**
     * ## GameSession.getCurrentSession
     *
     * Loads a nodeGame session
     *
     * If no parameter is passed it will return the current session.
     * Else, it will try to load a session with the given id.
     *
     * This method interact with the `node.store` object that provides
     * lower level capabilities to write to a persistent support (e.g.
     * the browser localStorate).
     *
     * @param {number} sid Optional. The session id to load
     * @return {object} The session object
     *
     * @see GameSession.getStoredSession
     * @see GameSession.store
     */
    GameSession.prototype.getCurrentSession = function() {
        var session, node;
        node = this.node;

        session = {
            id:     node.gsc.session,
            player: node.player,
            memory: node.game.memory,
            state:  node.game.state,
            game:   node.game.metadata.name,
            history: undefined
        };

        // If we saved the emitted events, add them to the
        // session object
        if (node.events.history || node.events.history.length) {
            session.history = node.events.history.fetch();
        }

        return session;
    };

    /**
     * ## GameSession.getStoredSession
     *
     * Tries to retrieve a previously stored session
     *
     * @param {string} The id of the session to retrieve
     * @return {object|boolean|undefined} The session object, FALSE if session storing 
     *   is not enabled, or undefined if no session with the given id was found
     *
     * @see GameSession.getCurrentSession
     * @see GameSession.store
     * @see GameSession.isEnabled
     */
    GameSession.prototype.getStoredSession = function(sid) {
        if (!this.node.session.isEnabled()) return false;
        // Tries to return a stored session
        return this.node.store(prefix + sid);
    };

    
    /**
     * ## GameSession.store
     *
     * Stores the current session to a persistent medium
     *
     * @return {boolean} TRUE, if session saving was successful
     */
    GameSession.prototype.store = function() {
        var session, sid, node;
        node = this.node;
        if (!this.isEnabled()) {
            node.warn('Game session could not be saved.');
            return false;
        }

        session = node.session();
        sid = session.id;
        node.store(prefix + sid, session);
        node.log('Game session saved with id ' + sid);
        return true;
    }

    /**
     * ## GameSession.isEnabled
     *
     * Verifies the session support
     *
     * @return {boolean} TRUE, if the session can be saved to a persistent support
     */
    GameSession.prototype.isEnabled = function() {
        return (this.node.store) ? this.node.store.isPersistent() : false;
    };



    // <!--
    //  node.session.restore = function (sessionObj, sid) {
    //
    //          if (!sessionObj) return false;
    //          if (!sessionObj.player) return false;
    //          if (!sessionObj.state) return false;
    //
    //          sid = sid || sessionObj.player.sid;
    //          if (!sid) return false;
    //
    //          var player = {
    //                          id:     sessionObj.player.id,
    //                          sid:    sid,
    //                          name:   node.gsc.name,
    //          };
    //
    //          that.createPlayer(player);
    //
    //          node.gsc.session        = sessionObj.id;
    //          node.game.memory        = sessionObj.memory;
    //
    //          node.goto(session.state);
    //
    //          return true;
    //
    //  };
    // -->

    // ## Closure
})('undefined' != typeof node ? node : module.parent.exports);
