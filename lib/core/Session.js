/**
 * # GameSession
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` session manager
 * 
 * ---
 * 
 */

(function (exports, node) {
	
// ## Global scope
	
var GameMsg = node.GameMsg,
	Player = node.Player,
	GameMsgGenerator = node.GameMsgGenerator,
	J = node.JSUS;

//Exposing constructor
exports.GameSession = GameSession;
exports.GameSession.SessionManager = SessionManager;

GameSession.prototype = new SessionManager();
GameSession.prototype.constructor = GameSession; 

function GameSession() {
	SessionManager.call(this);
	
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
			return (node.events.history) ? node.events.history.history.fetch() : null;
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


/// Session Manager

function SessionManager() {
	this.session = {};
}

SessionManager.getVariable = function(p) {
	J.getNestedValue(p, node);
};

SessionManager.setVariable = function(p, value) {
	J.setNestedValue(p, value, node);
};

SessionManager.prototype.register = function(path, options) {
	if (!path) {
		node.err('cannot add an empty path to session');
		return false;
	}
	
	this.session[path] = {
			
		get: (options && options.get) ? options.get
									  : function() {
										  return J.getNestedValue(path, node);
									  },
									  
		set: (options && options.set) ? options.set 
									  : function(value) {
										  J.setNestedValue(path, value, node);
									  }
		
	};
	
	return true;
};

SessionManager.prototype.unregister = function(path) {
	if (!path) {
		node.err('cannot delete an empty path from session');
		return false;
	}
	if (!this.session[path]) {
		node.err(path + ' is not registered in the session');
		return false;
	}
	
	delete this.session[path];	
	return true;
};

SessionManager.prototype.get = function(path) {
	var session = {};
	
	if (path) {
		 return (this.session[path]) ? this.session[path].get() : undefined;
	}
	else {
		for (path in this.session) {
			if (this.session.hasOwnProperty(path)) {
				session[path] = this.session[path].get();
			}
		}

		return session;
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

SessionManager.prototype.restore = function (sessionObj) {
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
//	var type = typeof(value);
//	if ('function' === type) return true;
//	if ('object' === type) return true;
//	return false;
//}


})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);
