(function (exports, node) {
	
	var GameMsg = node.GameMsg;
	var GameState = node.GameState;
	var Player = node.Player;
	var JSUS = node.JSUS;
	
	/*
	 * GameMsgGenerator
	 * 
	 * All message are reliable, but TXT messages.
	 * 
	 */
	
	/**
	 * Expose constructor
	 * 
	 * TODO: make a static class
	 */
	
	exports.GameMsgGenerator = GameMsgGenerator; 
	
	function GameMsgGenerator () {
		
//		Object.defineProperty(this, 'session', {
//	    	value: session,
//	    	enumerable: true,
//		});
	}
	
	
	// General
	GameMsgGenerator.create = function(msg) {
	
	  // SAY, DATA, reliable, to SERVER
	  var base = {
			session: node.gsc.session, 
			state: node.state,
			action: GameMsg.actions.SAY,
			target: GameMsg.targets.DATA,
			from: node.player.sid,
			to: 'SERVER',
			text: null,
			data: null,
			priority: null,
			reliable: 1,
	  };
	
	  msg = JSUS.merge(base, msg);
	  return new GameMsg(msg);
	
	};
	
	// HI
	
	//Notice: this is different from the server;
	GameMsgGenerator.createHI = function(player, to, reliable) {
	
	  var rel = reliable || 1;
	  
	  return new GameMsg( {
	            			session: node.gsc.session,
	            			state: node.state,
	            			action: GameMsg.actions.SAY,
	            			target: GameMsg.targets.HI,
	            			from: node.player.sid,
	            			to: to,
	            			text: new Player(player) + ' ready.',
	            			data: player,
	            			priority: null,
	            			reliable: rel
	  });
	
	
	};
	
	// STATE
	
	GameMsgGenerator.saySTATE = function (plist, to, reliable) {
		return this.createSTATE(GameMsg.SAY, plist, to,reliable);
	};
	
	GameMsgGenerator.setSTATE = function (plist, to, reliable) {
		return this.createSTATE(GameMsg.SET, plist, to,reliable);
	};
	
	GameMsgGenerator.getSTATE = function (plist, to, reliable) {
		return this.createSTATE(GameMsg.GET, plist, to,reliable);
	};
	
	GameMsgGenerator.createSTATE = function (action, state, to, reliable) {
		
		var rel = reliable || 1;
		
		
		return new GameMsg({
							session: node.gsc.session,
							state: node.state,
							action: action,
							target: GameMsg.targets.STATE,
							from: node.player.sid,
							to: to,
							text: 'New State: ' + GameState.stringify(state),
							data: state,
							priority: null,
							reliable: rel
		});
	};
	
	
	// PLIST
	
	GameMsgGenerator.sayPLIST = function (plist, to, reliable) {
		return this.createPLIST(GameMsg.actions.SAY, plist, to,reliable);
	};
	
	GameMsgGenerator.setPLIST = function (plist, to, reliable) {
		return this.createPLIST(GameMsg.actions.SET, plist, to,reliable);
	};
	
	GameMsgGenerator.getPLIST = function (plist, to, reliable) {
		return this.createPLIST(GameMsg.actions.GET, plist, to, reliable);
	};
	
	GameMsgGenerator.createPLIST = function (action, plist, to, reliable) {
		
		//node.log('Creating plist msg ' + plist + ' ' + plist.length);
		
		var rel = reliable || 1;
		
		return new GameMsg({
							session: node.gsc.session, 
							state: node.state,
							action: action,
							target: GameMsg.targets.PLIST,
							from: node.player.sid,
							to: to,
							text: 'List of Players: ' + plist.length,
							data: plist.pl,
							priority: null,
							reliable: rel
		});
	};
	
	
	// TXT
	
	GameMsgGenerator.createTXT = function (text, to, reliable) {
		
		//node.log("STE: " + text);
		
		var rel = reliable || 0;
		
		return new GameMsg({
							session: node.gsc.session,
							state: node.state,
							action: GameMsg.actions.SAY,
							target: GameMsg.targets.TXT,
							from: node.player.sid,
							to: to,
							text: text,
							data: null,
							priority: null,
							reliable: rel
		});
		
		
	};
	
	
	// DATA


	GameMsgGenerator.sayDATA = function (data, to, text, reliable) {
		return this.createDATA(GameMsg.actions.SAY, data, to, text, reliable);
	};

	GameMsgGenerator.setDATA = function (data, to, text, reliable) {
		return this.createDATA(GameMsg.actions.SET, data, to, text, reliable);
	};

	GameMsgGenerator.getPLIST = function (data, to, text, reliable) {
		return this.createDATA(GameMsg.actions.GET, data, to, text, reliable);
	};
	
	GameMsgGenerator.createDATA = function (action, data, to, text, reliable) {
		
		var rel = reliable || 1;
		var text = text || 'data msg';
		
		return new GameMsg({
							session: node.gsc.session, 
							state: node.state,
							action: action,
							target: GameMsg.targets.DATA,
							from: node.player.sid,
							to: to,
							text: text,
							data: data,
							priority: null,
							reliable: rel
		});
	};
	
	
	// ACK
	
	GameMsgGenerator.createACK = function (gm, to, reliable) {
		
		var rel = reliable || 0;
		
		var newgm = new GameMsg({
								session: node.gsc.session, 
								state: node.state,
								action: GameMsg.actions.SAY,
								target: GameMsg.targets.ACK,
								from: node.player.sid,
								to: to,
								text: 'Msg ' + gm.id + ' correctly received',
								data: gm.id,
								priority: null,
								reliable: rel
		});
		
		if (gm.forward) {
			newgm.forward = 1;
		}
		
		return newgm;
	}; 

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);