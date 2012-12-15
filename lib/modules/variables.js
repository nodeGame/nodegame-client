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

	node.target.HI			= 'HI';			// Client connects
	node.target.HI_AGAIN	= 'HI_AGAIN'; 	// Client reconnects

	node.target.PCONNECT	= 'PCONNECT'; 		// A new player just connected
	node.target.PDISCONNECT = 'PDISCONNECT';	// A player just disconnected

	node.target.MCONNECT	= 'MCONNECT'; 		// A new monitor just connected
	node.target.MDISCONNECT = 'MDISCONNECT';	// A monitor just disconnected

	node.target.PLIST 		= 'PLIST';	// PLIST
	node.target.MLIST 		= 'MLIST';	// PLIST

	node.target.STATE		= 'STATE';	// STATE

	node.target.TXT 		= 'TXT';	// Text msg
	node.target.DATA		= 'DATA';	// Contains a data-structure in the data field

	node.target.REDIRECT	= 'REDIRECT'; // redirect a client to a new address

	node.target.ENV		= 'ENV'; // setup global variables

	node.target.SETUP		= 'SETUP'; // general setup

	node.target.GAME		= 'GAME'; // set the game



	// Still to implement
	node.target.BYE			= 'BYE';	// Force disconnects
	node.target.ACK			= 'ACK';	// A reliable msg was received correctly
	node.target.WARN 		= 'WARN';	// To do.
	node.target.ERR			= 'ERR';	// To do.




	/**
	 * ### Direction
	 * 
	 * Distiguish between incoming and outgoing messages
	 * 
	 * - node.IN
	 * - node.OUT
	 */

	node.IN		= 'in.';
	node.OUT	= 'out.';	


	
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