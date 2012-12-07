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
	GameState = node.GameState,
	Player = node.Player,
	GameMsgGenerator = node.GameMsgGenerator,
	J = node.JSUS;

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
			node.game.memory.fetch();
		}
	});
	
	this.register('events.history', {
		set: function(value) {
			node.events.history.history.clear(true);
			node.events.history.history.importDB(value);
		},
		get: function() {
			node.events.history.history.fetch();
		}
	});
	
	
	this.register('game.state', {
		set: GameSession.restoreState
	});
}


GameSession.prototype.restoreState = function(state) {
		
	try {
		// GOTO STATE
		node.goto(state);
		
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
		               'STATEDONE', // maybe not here
		               'out.say.HI'	               
		];
		
		// RE-EMIT EVENTS
		node.events.history.remit(node.game.state, discard);
		node.info('game state restored');
		return true;
	}
	catch(e) {
		node.err('could not restore game state. An error has occurred: ' + e);
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
										  J.getNestedValue(path, node);
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
	
	delete this.session[path];	
	return true;
};

SessionManager.prototype.getSession = function() {
	var session = {};
	for (var path in this.session) {
		if (this.session.hasOwnProperty(path)) {
			session[path] = session[path].get();
		}
	}
	
	return session;
};

SessionManager.prototype.restore = function (sessionObj) {
	if (!sessionObj) {
		node.err('cannot restore empty session object');
		return;
	}
	
	var value;
	for (var i in sessionObj) {
		if (sessionObj.hasOwnProperty(i)) {
			value = sessionObj[i].get();
			sessionObj[i].set(i, value);
		}
	}
	
	return true;
};

SessionManager.prototype.store = function() {
	node.store(node.socket.id, this.getSession());
};



/**
 * ### node.createPlayer
 * 
 * Mixes in default properties for the player object and
 * additional configuration variables from node.conf.player
 * 
 * Writes the node.player object
 * 
 * Properties: `id`, `sid`, `ip` can never be overwritten.
 * 
 * Properties added as local configuration cannot be further
 * modified during the game. 
 * 
 * Only the property `name`, can be changed.
 * 
 */
node.createPlayer = function (player) {
	
	player = new Player(player);
	
	if (node.conf && node.conf.player) {			
		var pconf = node.conf.player;
		for (var key in pconf) {
			if (pconf.hasOwnProperty(key)) {
				if (JSUS.in_array(key, ['id', 'sid', 'ip'])) {
					continue;
				} 
				
				// Cannot be overwritten properties previously 
				// set in other sessions (recovery)
//				if (player.hasOwnProperty(key)) {
//					continue;
//				}
				if (node.support.defineProperty) {
					Object.defineProperty(player, key, {
				    	value: pconf[key],
				    	enumerable: true
					});
				}
				else {
					player[key] = pconf[key];
				}
			}
		}
	}
	
	
	if (node.support.defineProperty) {
		Object.defineProperty(node, 'player', {
	    	value: player,
	    	enumerable: true
		});
	}
	else {
		node.player = player;
	}
	
	node.emit('PLAYER_CREATED', player);
	
	return player;
};


// Helping functions

//function isReference(value) {
//	var type = typeof(value);
//	if ('function' === type) return true;
//	if ('object' === type) return true;
//	return false;
//}


})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);