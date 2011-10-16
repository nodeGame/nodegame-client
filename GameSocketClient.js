/*
 *
 *
 */

function GameSocketClient(options,nodeGame) {
	
	this.name = options.name;
	
	this.host = options.host;
	this.port = options.port;
	this.servername = null;
	
	this.socket = this.connect();
	
	this.game = null;
}

GameSocketClient.prototype.setGame = function(game) {
	this.game = game;
};

GameSocketClient.prototype.connect = function() {
	// TODO: add check if http:// is already in
	var url = "http://" + this.host + ":" + this.port;
	console.log('nodeGame: connecting to ' + url);
	var socket = io.connect(url);
    this.attachFirstListeners(socket);
    return socket;
};


/*

I/O Functions

*/

//Parse the message received in the Socket
GameSocketClient.prototype.secureParse = function (msg) {
	
	try {
		//console.log(msg);
		var gameMsg = GameMsg.clone(JSON.parse(msg));
		console.log('R: ' + gameMsg);
		node.fire('LOG', 'R: ' + gameMsg.toSMS());
		return gameMsg;
	}
	catch(e) {
		var error = "Malformed msg received: " + e;
		node.fire('LOG', 'E: ' + error);
		return false;
	}
	
};

/**
 * Nothing is done until the SERVER send an HI msg. All the others msgs will 
 * be ignored otherwise.
 */
GameSocketClient.prototype.attachFirstListeners = function (socket) {
	
	var that = this;
	
	socket.on('connect', function (msg) {
		var connString = 'nodeGame: connection open';
	    console.log(connString); 
	    
	    socket.on('message', function (msg) {	
			
	    	var msg = that.secureParse(msg);
	    	
	    	if (msg) { // Parsing successful
				if (msg.target === 'HI') {
					that.player = new Player(msg.data,that.name);
					that.servername = msg.from;
					
					// Get Ready to play
					that.attachMsgListeners(socket, msg.session);
					
					// Send own name to SERVER
					that.sendHI(that.player);
			   	 } 
	    	}
	    });
	    
	});
	
    socket.on('disconnect', function() {
    	// TODO: this generates an error: attempt to run compile-and-go script on a cleared scope
    	console.log('closed');
    });
};

GameSocketClient.prototype.attachMsgListeners = function (socket, session) {   
	var that = this;
	
	console.log('nodeGame: Attaching FULL listeners');
	socket.removeAllListeners('message');
		
	this.gmg = new GameMsgGenerator(session,this.player.getId(),new GameState());

	socket.on('message', function(msg) {
		var msg = that.secureParse(msg);
		
		if (msg) { // Parsing successful
			node.fire(msg.toInEvent(), msg);
		}
	});
};

GameSocketClient.prototype.sendHI = function (state, to) {
	var to = to || 'SERVER';
	var msg = this.gmg.createHI(this.player, to);
	this.game.player = this.player;
	this.send(msg);
};

// TODO: other things rely on this methods which has changed
GameSocketClient.prototype.sendSTATE = function(action, state, to) {	
	var msg = this.gmg.createSTATE(action,state,to);
	this.send(msg);
};

GameSocketClient.prototype.sendTXT = function(text, to) {	
	var msg = this.gmg.createTXT(text,to);
	this.send(msg);
};

GameSocketClient.prototype.sendDATA = function (data, to, msg) {
	var to = to || 'SERVER';
	var msg = this.gmg.createDATA(data,to,msg);
	this.send(msg);
};

/**
 * Write a msg into the socket. 
 * 
 * The msg is actually received by the client itself as well.
 */
GameSocketClient.prototype.send = function (msg) {
	
	// TODO: Check Do volatile msgs exist for clients?
	
	//if (msg.reliable) {
		this.socket.send(msg.stringify());
	//}
	//else {
	//	this.socket.volatile.send(msg.stringify());
	//}
	console.log('S: ' + msg);
	node.fire('LOG', 'S: ' + msg.toSMS());
};