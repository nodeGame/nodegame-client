(function (node) {
	
	
	/**
	 * GameSession
	 * 
	 */
	
	var JSUS = node.JSUS;
	var NDDB = node.NDDB;
	var store = node.store;
	
	var prefix = 'nodegame_';
	

	node.session = function(sid) {
				
		// Returns the current session
		if (!sid) {
			return {
				session: node.gsc.session,
				player: node.player,
				memory: node.game.memory,
				state: node.game.gameState,
				game: node.game.name,
			};
		}
		
		if (!node.session.enabled) {
			return false;
		}
		
		// Tries to return a stored session
		return node.store(prefix + sid);
	};
	
	Object.defineProperty(node.session, 'enabled', {
    	get: function(){
    		return (node.store) ? node.store.persistent : false;
    	},
    	configurable: false,
    	enumerable: true,
	});
	
	node.session.store = function() {
		if (!node.session.enabled) {
			node.log('Could not save the session ' + sid);
			return false;
		}
		
		node.store(prefix + sid, this);
		node.log('Session saved with id ' + sid);
		return true;
	}
	
	
	node.session.restore = function(sessionObj) {
		if (!sessionObj) return false;
		if (!sessionObj.player) return false;
		if (!sessionObj.state) return false;
		
		node.gmg.gsc = new GameSocketClient()
	};

	
})('undefined' != typeof node ? node : module.parent.exports);