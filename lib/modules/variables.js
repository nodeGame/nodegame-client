/**
 * # Setup
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` setup module
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
	node.actions = {};

	node.actions.SET = 'set'; 	
	node.actions.GET = 'get'; 	
	node.actions.SAY = 'say'; 	

	/**
	 * ### node.targets
	 * 
	 * Collection of available nodeGame targets
	 * 
	 * The target adds an additional level of semantic 
	 * for the message, and specifies the nature of the
	 * information carried in the message. 
	 * 
	 * It answers the question: "What is the content of the message?" 
	 */
	node.targets = {};

	node.targets.HI			= 'HI';			// Client connects
	node.targets.HI_AGAIN	= 'HI_AGAIN'; 	// Client reconnects

	node.targets.PCONNECT	= 'PCONNECT'; 		// A new player just connected
	node.targets.PDISCONNECT = 'PDISCONNECT';	// A player just disconnected

	node.targets.MCONNECT	= 'MCONNECT'; 		// A new monitor just connected
	node.targets.MDISCONNECT = 'MDISCONNECT';	// A monitor just disconnected

	node.targets.PLIST 		= 'PLIST';	// PLIST
	node.targets.MLIST 		= 'MLIST';	// PLIST

	node.targets.STATE		= 'STATE';	// STATE

	node.targets.TXT 		= 'TXT';	// Text msg
	node.targets.DATA		= 'DATA';	// Contains a data-structure in the data field

	node.targets.REDIRECT	= 'REDIRECT'; // redirect a client to a new address

	node.targets.ENV		= 'ENV'; // setup global variables

	node.targets.SETUP		= 'SETUP'; // general setup

	node.targets.GAME		= 'GAME'; // set the game



	// Still to implement
	node.targets.BYE			= 'BYE';	// Force disconnects
	node.targets.ACK			= 'ACK';	// A reliable msg was received correctly
	node.targets.WARN 		= 'WARN';	// To do.
	node.targets.ERR			= 'ERR';	// To do.




	/**
	 * ### Direction
	 * 
	 * Distiguish between incoming and outgoing messages
	 * 
	 * - node.IN
	 * - node.OUT
	 */

	node.IN					= 'in.';
	node.OUT					= 'out.';	


	
	node.iss = {};
	node.iss.UNKNOWN = 0; 		// Game has not been initialized
	node.iss.LOADING = 10;		// The game is loading
	node.iss.LOADED  = 25;		// Game is loaded, but the GameWindow could still require some time
	node.iss.PLAYING = 50;		// Everything is ready
	node.iss.DONE = 100;		// The player completed the game state

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);