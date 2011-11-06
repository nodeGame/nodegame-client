(function (exports, node) {
	
	var GameState = node.GameState;
	var Utils = node.Utils;
	
	/*
	 * Holds information about the list of players.
	 *
	 */
	
	/**
	 * Expose constructor
	 */
	exports.PlayerList = PlayerList;
	
	function PlayerList(list) {
		
		this.pl = list || {};
		
		this.size = function() {
			return Utils.getListSize(this.pl);
		};
		
	//	console.log('This is the size ' + this.size());
	
	}
	
	exports.PlayerList.prototype.importIDS = function(arrayIDS) {
	
		var PREFIX = 'P_';
		var i = this.size();
		var j = 0;
		for (;j<arrayIDS.length;j++){
			this.add(arrayIDS[j],'P_' + ++i);
		}
	};
		
	PlayerList.prototype.addPlayer = function (player) {
		return this.add(player.id, player.name);
	};
	
	PlayerList.prototype.add = function (connid,name) {	
		// Check if the id is unique
		if (typeof(this.pl[connid]) === 'undefined') {
			this.pl[connid] = new Player({id: connid, name: name});
			console.log('Added Player ' + this.pl[connid]);
			return true;
		}
			
		console.log('E: Attempt to add a new player already in the player list' + this.pl.id);//[connid]);
		return false;
	};
	
	PlayerList.prototype.remove = function (connid) {	
		// Check if the id exists
		if (typeof(this.pl[connid]) !== 'undefined') {
			delete this.pl[connid];
			return true;
		}
		
		console.log('E: Attempt to remove a non-existing player from the the player list');
		return false;
	};
	
	PlayerList.prototype.get = function (connid) {	
		// Check if the id exists
		if (typeof(this.pl[connid]) !== 'undefined') {
			return this.pl[connid];
		}
		
		console.log('W: Attempt to access a non-existing player from the the player list ' + connid);
	};
	
	PlayerList.prototype.pop = function (connid) {	
		var p = this.get(connid);
		this.remove(connid);
		return p;
	};
	
	PlayerList.prototype.getRandom = function () {	
		return this.toArray()[Math.floor(Math.random()*(this.size()))];
	};
	
	
	PlayerList.prototype.getAllIDs = function () {	
		
	     return this.map(function(o){
	    	 return o.getId();
	     	});
	};
	
	
	PlayerList.prototype.updatePlayer = function (player) {
		
		if (typeof(this.pl[player.id]) !== 'undefined') {
			this.pl[connid] = player;
			return true;
		}
		
		console.log('W: Attempt to access a non-existing player from the the player list ' + player.id);
		return false;
	};
	
	// Returns an array of array of n groups of players {connid: name}
	//The last group could have less elements.
	PlayerList.prototype.getNGroups = function (n) {
		
		var copy = this.toArray();
		var nPlayers = copy.length;
		
		var gSize = Math.floor( nPlayers / n);
		var inGroupCount = 0;
		
		var result = new Array();
		
		// Init values for the loop algorithm
		var i;
		var idx;
		var gid = -1;
		var count = gSize +1; // immediately creates a new group in the loop
		for (i=0;i<nPlayers;i++){
			
			// Prepare the array container for the elements of the new group
			if (count >= gSize) {
				gid++;
				result[gid] = new PlayerList();
				count = 0;
			}
			
			// Get a random idx between 0 and array length
			idx = Math.floor(Math.random()*copy.length);
			
			result[gid].add(copy[idx].id,copy[idx].name);
			copy.splice(idx,1);
			count++;
		}
		
		return result;
	};
	
	// Returns an array of array of groups of n players {connid: name};
	// The last group could have less elements.
	PlayerList.prototype.getGroupsSizeN = function (n) {
		// TODO: getGroupsSizeN
	};
	
	// TODO: improve
	// Returns true if all the players are on the same gameState = gameState
	// and they are all GameState = DONE.
	// If strict is TRUE, also not initialized players are taken into account
	PlayerList.prototype.isStateDone = function(gameState, strict) {
		var strict = strict || false;
		
		var result = this.map(function(p){
			var gs = new GameState(p.state);
			
			//console.log('Going to compare ' + gs + ' and ' + gameState);
			
			// Player is done for his state
			if (p.state.is !== GameState.iss.DONE) {
				return 0;
			}
			// The state of the player is actually the one we are interested in
			if (GameState.compare(gameState, p.state, false) !== 0) {
				return 0;
			}
			
			return 1;
		});
		
		var i;
		var sum = 0;
		for (i=0; i<result.length;i++) {
			sum = sum + Number(result[i]);
		}
		
		var total = (strict) ? this.size() : this.actives(); 
		
		return (sum === total) ? true : false;
		
	};
	
	// Returns the number of player whose state is different from 0:0:0
	PlayerList.prototype.actives = function(gameState) {
		var result = 0;
		
		this.forEach(function(p){
			var gs = new GameState(p.state);
			
			// Player is done for his state
			if (GameState.compare(gs, new GameState()) !== 0) {
				result++;
			}
			
		});
		
		console.log('ACTIVES: ' + result);
		
		return result;
	};
	
	
	PlayerList.prototype.toArray = function () {
	
		var result = Array();
		
		for (var key in this.pl) {
		    if (this.pl.hasOwnProperty(key)) {
		    	result.push(this.pl[key]);
		    }
		}
		return result;
		return result.sort();
		
	};
	
	PlayerList.prototype.forEach = function(callback, thisArg) {
		  
		for (var key in this.pl) {
		    if (this.pl.hasOwnProperty(key)) {
		    	callback.call(thisArg, this.pl[key]);
		    }
		  }
	};
	
	PlayerList.prototype.map = function(callback, thisArg) {
		 
		 var result = new Array();
		 
		 for (var key in this.pl) {
			 if (this.pl.hasOwnProperty(key)) {
				 result.push(callback.call(thisArg, this.pl[key]));
			 }
		  }
	
		  return result;
	};
	
	
	PlayerList.prototype.toString = function (eol) {
		
		var out = '';
		var EOL = eol || '\n';
		
		for (var key in this.pl) {
		    if (this.pl.hasOwnProperty(key)) {
		    	out += key + ': ' + this.pl[key].name;
		    	var state = new GameState(this.pl[key].state);
		    	//console.log('STATE: ' + this.pl[key].state.state);
		    	
		    	out += ': ' + state + EOL;
		    }
		}
		
		return out;
		
	};
	
	//Player
	
	/**
	 * Expose constructor
	 */
	
	exports.Player = Player;
	
	function Player (pl) {
		
		// PRIVATE variables
		this.id = pl.id;
		this.name = pl.name;
		this.state = pl.state || new GameState();
	}
	
	Player.prototype.getId = function() {
		return this.id;
	};
	
	Player.prototype.getName = function() {
		return this.name;
	};
	
	Player.prototype.updateState = function (state) {
		this.state = state;
	};
	
	Player.prototype.toString = function() {
		var out = this.getName() + ' (' + this.getId() + ') ' + new GameState(this.state);
		return out;
	};

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);