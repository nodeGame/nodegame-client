/**
 * # Game
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 *
 * Wrapper class for a `GameLoop` object and functions to control the game flow
 *  
 */
	
(function (exports, node) {
	
	var GameState = node.GameState,
		GameMsg = node.GameMsg,
		GameDB = node.GameDB,
		PlayerList = node.PlayerList,
		GameLoop = node.GameLoop,
		JSUS = node.JSUS;
	
	// ### Expose constructor
	exports.Game = Game;
	
	function Game (settings) {
		settings = settings || {};
		
		// TODO: transform into private variables, otherwise they can accidentally 
		// modified  by the execution of the loops functions
		
		// If not defined they take default settings
		this.name = settings.name || 'A standard game';
		this.description = settings.description || 'No Description';
		
		this.observer = ('undefined' !== typeof settings.observer) ? settings.observer 
																   : false;
		
		this.gameLoop = new GameLoop(settings.loops);
		 
		// TODO: gameState should be inside player
		this.player = null;	
		this.state = this.gameState = new GameState();
		
		this.auto_step = ('undefined' !== typeof settings.auto_step) ? settings.auto_step 
																	 : true;
		this.auto_wait = ('undefined' !== typeof settings.auto_wait) ? settings.auto_wait 
																	 : false; 
		
		this.minPlayers = settings.minPlayers || 1;
		this.maxPlayers = settings.maxPlayers || 1000;
		
		// TODO: Check this
		this.init = settings.init || this.init;
		
		this.pl = new PlayerList();
		
		this.memory = new GameDB();

		Object.defineProperty(this, 'ready', {
			set: function(){},
			get: function(){
				//console.log('GameState is: ' + this.gameState.is, 'DEBUG');
				if (this.gameState.is < GameState.iss.LOADED) return false;
				
				// Check if there is a gameWindow obj and whether it is loading
				if (node.window) {	
					//console.log('WindowState is: ' + node.window.state, 'DEBUG');
					return (node.window.state >= GameState.iss.LOADED) ? true : false;
				}
				return true;
			},
	    	enumerable: true,
		});
		
		
		var that = this;
		var say = GameMsg.actions.SAY + '.';
		var set = GameMsg.actions.SET + '.';
		var get = GameMsg.actions.GET + '.'; 	
		var IN  = GameMsg.IN;
		var OUT = GameMsg.OUT;
		
		// INCOMING EVENTS
		var incomingListeners = function() {
			
			// Get
			
			node.on( IN + get + 'DATA', function (msg) {
				
				if (msg.text === 'LOOP'){
					node.gsc.sendDATA(GameMsg.actions.SAY, this.gameLoop, msg.from, 'GAME');
				}
				
				// We could double emit
				//node.emit(msg.text, msg.data);
			});
			
			// Set
			node.on( IN + set + 'STATE', function (msg) {
				that.memory.add(msg.text, msg.data, msg.from);
			});
			
			node.on( IN + set + 'DATA', function (msg) {
				that.memory.add(msg.text, msg.data, msg.from);
			});
			
			// Say

			// If the message is from the server, update the game state
			// If the message is from a player, update the player state
			node.on( IN + say + 'STATE', function (msg) {
				
				// Player exists
				if (that.pl.exist(msg.from)) {
					//node.log('updatePlayer', 'DEBUG);
					that.pl.updatePlayerState(msg.from, msg.data);
					node.emit('UPDATED_PLIST');
					that.pl.checkState();
				}
				// Assume this is the server for now
				// TODO: assign a string-id to the server
				else {
					//node.log('updateState: ' + msg.from + ' -- ' + new GameState(msg.data), 'DEBUG');
					that.updateState(msg.data);
				}
			});
			
			node.on( IN + say + 'PLIST', function (msg) {
				that.pl = new PlayerList({}, msg.data);
				node.emit('UPDATED_PLIST');
				that.pl.checkState();
			});
			
		}();
		
		var outgoingListeners = function() {
			
			// SAY
			
			node.on( OUT + say + 'HI', function() {
				// Upon establishing a successful connection with the server
				// Enter the first state
				if (that.auto_step) {
					that.updateState(that.next());
				}
				else {
					// The game is ready to step when necessary;
					that.gameState.is = GameState.iss.LOADED;
					node.gsc.sendSTATE(GameMsg.actions.SAY, that.gameState);
				}
			});
			
			node.on( OUT + say + 'STATE', function (state, to) {
				//node.log('BBBB' + p + ' ' + args[0] + ' ' + args[1] + ' ' + args[2], 'DEBUG');
				node.gsc.sendSTATE(GameMsg.actions.SAY, state, to);
			});	
			
			node.on( OUT + say + 'TXT', function (text, to) {
				node.gsc.sendTXT(text,to);
			});
			
			node.on( OUT + say + 'DATA', function (data, to, key) {
				node.gsc.sendDATA(GameMsg.actions.SAY, data, to, key);
			});
			
			// SET
			
			node.on( OUT + set + 'STATE', function (state, to) {
				node.gsc.sendSTATE(GameMsg.actions.SET, state, to);
			});
			
			node.on( OUT + set + 'DATA', function (data, to, key) {
				node.gsc.sendDATA(GameMsg.actions.SET, data, to, key);
			});
			
			// GET
			
			node.on( OUT + get + 'DATA', function (data, to, key) {
				node.gsc.sendDATA(GameMsg.actions.GET, data, to, data);
			});
			
		}();
		
		var internalListeners = function() {
			
			// All the players are done?
			node.on('STATEDONE', function() {
				// If we go auto
				if (that.auto_step && !that.observer) {
//					node.log('WE PLAY AUTO', 'DEBUG');
//					node.log(that.pl);
//					node.log(that.pl.length);
					var morePlayers = ('undefined' !== that.minPlayers) ? that.minPlayers - that.pl.length : 0 ;
					//node.log(morePlayers);
					
					if ( morePlayers > 0 ) {
						node.emit('OUT.say.TXT', morePlayers + ' player/s still needed to play the game');
						node.log( morePlayers + ' player/s still needed to play the game');
					}
					// TODO: differentiate between before the game starts and during the game
					else {
						node.emit('OUT.say.TXT', this.minPlayers + ' players ready. Game can proceed');
						node.log( that.pl.length + ' players ready. Game can proceed');
						that.updateState(that.next());
					}
				}
		
//				else {
//					node.log('WAITING FOR MONITOR TO STEP', 'DEBUG');
//				}
			});
			
			node.on('DONE', function(p1, p2, p3) {
				
				// Execute done handler before updatating state
				var ok = true;
				var done = that.gameLoop.getAllParams(that.gameState).done;
				
				if (done) ok = done.call(that, p1, p2, p3);
				if (!ok) return;
				that.gameState.is = GameState.iss.DONE;
				
				// Call all the functions that want to do 
				// something before changing state
				node.emit('BEFORE_DONE');
				
				if (that.auto_wait) {
					if (node.window) {	
						node.emit('WAITING...');
					}
				}
				that.publishState();
				
			});
			
			node.on('PAUSE', function(msg) {
				that.gameState.paused = true;
				that.publishState();
			});
			
			node.on('WINDOW_LOADED', function() {
				if (that.ready) {
					node.emit('BEFORE_LOADING');
					node.emit('LOADED');
				}
			});
			
			node.on('GAME_LOADED', function() {
				if (that.ready) {
					node.emit('BEFORE_LOADING');
					node.emit('LOADED');
				}
			});
			
			node.on('LOADED', function() {
				that.gameState.is =  GameState.iss.PLAYING;
				//TODO: the number of messages to emit to inform other players
				// about its own state should be controlled. Observer is 0 
				//that.publishState();
				node.gsc.clearBuffer();
				
			});
			
		}();
	}
	
	// Dealing with the STATE
	
	Game.prototype.pause = function() {
		this.gameState.paused = true;
	};
	
	Game.prototype.resume = function() {
		this.gameState.paused = false;
	};
	
	Game.prototype.next = function(times) {
		if (!times) return this.gameLoop.next(this.gameState);
		return this.gameLoop.jumpTo(this.gameState, Math.abs(times));
	};
	
	Game.prototype.previous = function (times) {
		if (!times) return this.gameLoop.previous(this.gameState);
		return this.gameLoop.jumpTo(this.gameState, -Math.abs(times));
	};
	
	Game.prototype.jumpTo = function (jump) {
		var gs = this.gameLoop.jumpTo(this.gameState, jump);
		if (!gs) return false;
		return this.updateState(gs);
	};
	
	Game.prototype.publishState = function() {
		//node.log('Publishing ' + this.gameState, 'DEBUG');
		
		// TODO: check do we need this??
		//node.gsc.gmg.state = this.gameState;
		
		
		// Important: SAY
		
		if (!this.observer) {
			var stateEvent = GameMsg.OUT + GameMsg.actions.SAY + '.STATE'; 
			node.emit(stateEvent,this.gameState,'ALL');
		}
		
		node.emit('STATECHANGE');
		
		node.log('New State = ' + new GameState(this.gameState), 'DEBUG');
	};
	
	Game.prototype.updateState = function(state) {
		
		node.log('New state is going to be ' + new GameState(state));
		
		if (this.step(state) !== false) {
			this.paused = false;
			this.gameState.is =  GameState.iss.LOADED;
			if (this.ready) {
				node.emit('BEFORE_LOADING');
				node.emit('LOADED');
			}
		}		
		else {
			node.log('Error in stepping', 'ERR');
			// TODO: implement sendERR
			node.emit('TXT','State was not updated');
			// Removed
			//this.publishState(); // Notify anyway what happened
		}
	};
	
	Game.prototype.step = function(state) {
		
		var gameState = state || this.next();
		if (gameState) {
			
			var func = this.gameLoop.getFunction(gameState);
			
			// Experimental: node.window should load the func as well
//			if (node.window) {
//				var frame = this.gameLoop.getAllParams(gameState).frame;
//				node.window.loadFrame(frame);
//			}
			
			
			
			if (func) {

				// For NDDB EventEmitter
				//console.log('HOW MANY LISTENERS???');
				//console.log(node._ee._listeners.count());
				
				// Local Listeners from previous state are erased 
				// before proceeding to next one
				node._ee.clearState(this.gameState);
				
				// For NDDB EventEmitter
				//console.log(node._ee._listeners.count());
				
				gameState.is = GameState.iss.LOADING;
				this.gameState = gameState;
			
				// This could speed up the loading in other client,
				// but now causes problems of multiple update
				this.publishState();
				
				
				return func.call(node.game);
			}
		}
		
		return false;
		
	};
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);