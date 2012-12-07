/**
 * # GameSocketClient
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` component rensponsible for dispatching events and messages 
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

var buffer,
	session;


var log_prefix = 'nodeGame session recovery: ';


function SessionManager() {
	this.session = {};
}

SessionManager.prototype.register = function(path) {
	if (!path) {
		node.err('cannot add an empty path to session');
		return false;
	}
	
	this.session[path] = J.getNestedValue(path, node);	
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

SessionManager.prototype.get = function() {
	
	for (var path in this.session) {
		if (this.session.hasOwnProperty(path)) {
			// If it is not a reference, refresh its value
			if (!isReference(this.session[path])) {
				this.session[path] = J.getNestedValue(path, node);
			}		
		}
	}
	
	return this.session;
};

SessionManager.prototype.restore = function (sessionObj) {
	if (!sessionObj) {
		node.err('cannot restore empty session object');
		return;
	}
	
	node.info('restoring session');
	node.emit('NODEGAME_RECOVERY', sid);
	
	
	for (var i in sessionObj) {
		if (sessionObj.hasOwnProperty(i)) {
			restorePath(i, sessionObj);
		}
	}
	
	return true;
};

SessionManager.prototype.restorePlayer = function() {
	node.createPlayer(session.player);
};


SessionManager.prototype.restoreState = function() {
		
	
	// GOTO STATE
	
	node.goto(session.state);
	
	
	var discard = [ 'LOG', 
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
	this.remit(node.game.state, discard);
	
};


// EventEmitter

SessionManager.prototype.remit = function(state, discard, keep) {
	
	if (!node.events || !node.events.history) {
		node.log('No event history was found to recover', 'WARN', log_prefix);
		return false;
	}
	
	node.log('recovering ' + node.events.history.count() + ' events', 'DEBUG', log_prefix);
	
	var hash, db;
	
	if (state) {
		hash = new GameState(session.state).toHash('S.s.r'); 
		
		if (!node.events.history.state) {
			node.log('no old events to re-emit were found during session recovery', 'DEBUG', log_prefix);
			return false; 
		}
		if (!node.events.history.state[hash]){
			node.log('the current state ' + hash + ' has no events to re-emit', 'DEBUG', log_prefix);
			return false; 
		}
		
		db = node.events.history.state[hash];
	}
	else {
		db = node.events.history;
	}
	
	if (discard) {
		// cleaning up the events to remit
		db.select('event', 'in', discard).remove();
	}
	
	if (keep) {
		db = db.select('event', 'in', keep);
		
	}
		
	if (!db.count()){
		node.log('no valid events to re-emit after cleanup', 'DEBUG', log_prefix);
		return false;
	}
	
	var remit = function () {
		node.log('re-emitting ' + db.count() + ' events', 'DEBUG', log_prefix);
		// We have events that were fired at the state when 
		// disconnection happened. Let's fire them again 
		db.each(function(e) {
			node.emit(e.event, e.p1, e.p2, e.p3);
		});
	};
	
	if (node.game.isReady()) {
		remit.call(node.game);
	}
	else {
		node.on('LOADED', function(){
			remit.call(node.game);
		});
	}
	
	return true;
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

SessionManager.prototype.store = function() {
	node.store(node.socket.id, this.getSession());
};






// Helping functions

function isReference(value) {
	var type = typeof(value);
	if ('function' === type) return true;
	if ('object' === type) return true;
	return false;
}

function restorePath = function(p, sessionObj) {
	J.setNestedValue('node.' + p, sessionObj[p], node);
}


})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
  , 'undefined' != typeof io ? io : module.parent.exports.io
);