/**
 * # Variables
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` variables and constants module
 * 
 * ---
 * 
 */

(function (exports, node) {
	
	// ## Constants

/**
 * ### node.actions
 * 
 * Collection of available nodeGame actions
 * 
 * The action adds an initial semantic meaning to the
 * message. It specify the nature of requests
 * "Why the message was sent?"
 * 
 * Semantics:
 * 
 * - SET: Store / changes the value of a property in the receiver of the msg
 * - GET: Asks the value value of a property to the receiver of the msg
 * - SAY: Announces a change of state or other global property in the sender of the msg
 * 
 */
	node.action = {};

	node.action.SET = 'set'; 	
	node.action.GET = 'get'; 	
	node.action.SAY = 'say'; 	

/**
 * ### node.target
 * 
 * Collection of available nodeGame targets
 * 
 * The target adds an additional level of semantic 
 * for the message, and specifies the nature of the
 * information carried in the message. 
 * 
 * It answers the question: "What is the content of the message?" 
 */
	node.target = {};


// #### target.DATA
// Generic identifier for any type of data 
	node.target.DATA		= 'DATA';		
	
// #### target.HI
// A client is connecting for the first time
	node.target.HI = 'HI';		

// #### target.HI_AGAIN
// A client re-connects to the server within the same session	
	node.target.HI_AGAIN = 'HI_AGAIN'; 	

// #### target.PCONNECT
// A new client just connected to the player endpoint	
	node.target.PCONNECT = 'PCONNECT';
	
// #### target.PDISCONNECT
// A client that just disconnected from the player endpoint 
	node.target.PDISCONNECT = 'PDISCONNECT';

// #### target.MCONNECT
// A client that just connected to the admin (monitor) endpoint	
	node.target.MCONNECT = 'MCONNECT'; 		

// #### target.MDISCONNECT
// A client just disconnected from the admin (monitor) endpoint 
	node.target.MDISCONNECT = 'MDISCONNECT';

// #### target.PLIST
// The list of clients connected to the player endpoint was updated
	node.target.PLIST = 'PLIST';
	
// #### target.MLIST	
// The list of clients connected to the admin (monitor) endpoint was updated	
	node.target.MLIST = 'MLIST';

// #### target.STATE
// A client notifies his own state
	node.target.STATE = 'STATE';
	
// #### target.STAGE
// A client notifies his own state
	node.target.STAGE = 'STAGE';	
	
// #### target.REDIRECT
// Redirects a client to a new uri
	node.target.REDIRECT = 'REDIRECT'; 

// #### target.SETUP
// Asks a client update its configuration	
	node.target.SETUP = 'SETUP'; 
	
// #### target.GAMECOMMAND
// Ask a client to start/pause/stop/resume the game	
	node.target.GAMECOMMAND = 'GAMECOMMAND'; 	
	
// #### target.JOIN
// Asks a client to join another channel/subchannel/room
	node.target.JOIN = 'JOIN';

// #### target.LOG
// A log entry
	node.target.LOG = 'LOG';

//#### not used targets (for future development)
	
	node.target.TXT 		= 'TXT';	// Text msg
	
	// Still to implement
	node.target.BYE			= 'BYE';	// Force disconnects
	node.target.ACK			= 'ACK';	// A reliable msg was received correctly

	node.target.WARN 		= 'WARN';	// To do.
	node.target.ERR			= 'ERR';	// To do.


/**
 * ### Game commands
 * 
 * - node.gamecommand.start
 * - node.gamecommand.pause
 * - node.gamecommand.resume
 * - node.gamecommand.stop
 */
	node.gamecommand = {	
			start: 'start',
			pause: 'pause',
			resume: 'resume',
			stop: 'stop',
			restart: 'restart',
			goto_stage: 'goto_stage'
	};
		

	

/**
 * ### Direction
 * 
 * Distiguishes between incoming and outgoing messages
 * 
 * - node.IN
 * - node.OUT
 */
	node.IN		= 'in.';
	node.OUT	= 'out.';	


/**
 * ### node.is
 * 
 * Levels associates to the states of the nodeGame engine
 * 
 */	
	node.is = {};

// #### is.UNKNOWN
// A game has not been initialized
	node.is.UNKNOWN = 0;

// #### is.INITIALIZING
// The engine is loading all the modules	
	node.is.INITIALIZING = 1;

// #### is.INITIALIZED
// The engine is fully loaded, but there is still no game	
	node.is.INITIALIZED = 5;	
	
// #### is.GAMELOADED
// The engine is fully loaded, and a game has been loaded	
	node.is.GAMELOADED = 10;	
	
// #### is.DEAD
// An unrecoverable error has occurred	
	node.is.DEAD = -1;		
	
// TODO: remove these	
// #### is.LOADING
// A game is loading	
	node.is.LOADING = 10;		
	
// #### is.LOADED
// A game has been loaded, but the GameWindow object could still require some time	
	node.is.LOADED  = 25;		
	
// #### is.PLAYING
// Everything is ready	
	node.is.PLAYING = 50;		
	
// #### is.DONE
// The player completed the game state	
	node.is.DONE = 100;	
	
	


	
	

})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);
