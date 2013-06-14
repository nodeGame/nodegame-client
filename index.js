/**
 * # nodeGame
 * 
 * Social Experiments in the Browser
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * nodeGame is a free, open source, event-driven javascript framework for on line, 
 * multiplayer games in the browser.
 * 
 * 
 */

(function (node) {

// ### version	
node.version = '0.6.3';


// ## Objects
/**
 * ### node.log
 * 
 * Standard out
 */	
node.log = function () {};

/**
 * ### node.events
 * 
 * Instance of the EventEmitter class
 * 
 * Takes care of emitting the events and calling the
 * proper listener functions 
 * 
 * @see node.EventEmitter
 */	
node.events = {};
	
/**
 * ### node.msg
 * 
 * Static factory of game messages
 * 
 * @see node.GameMsgGenerator
 */	
node.msg = {};
	

/**
 * ### node.socket
 * 
 * Instantiates the connection to a nodeGame server
 * 
 * @see node.GameSocketClient
 */	
node.socket = {};

/**
 * ### node.session
 * 
 * Contains a reference to all session variables
 * 
 * Session variables can be saved and restored at a later stage
 */
node.session = {};

/**
 * ### node.player
 * Instance of node.Player
 * 
 * Contains information about the player
 * 
 * @see node.PlayerList.Player
 */
node.player = { placeholder: true };

/**
 * ### node.game
 * 
 * Instance of node.Game
 * 
 * @see node.Game
 */
node.game = {};


/**
 * ### node.game.memory
 * 
 * Instance of node.GameDB database
 * 
 * @see node.GameDB
 */
node.game.memory = null;


/**
 * ### node.store
 * 
 * Makes the nodeGame session persistent, saving it
 * to the browser local database or to a cookie
 * 
 * @see shelf.js
 */
node.store = function() {};


/**
 * ### node.setup
 * 
 * Configures a specific feature of nodeGame and and stores 
 * the settings in `node.conf`.
 * 
 * @see Setup
 */
node.setup = function() {};


/**
 * ### node.conf
 * 
 * A reference to the current nodegame configuration
 * 
 * @see Setup
 */
node.conf = {};

/**
 * ### node.support 
 * 
 * A collection of features that are supported by the current browser
 */
node.support = {};


// ## Dependencies 
// Load dependencies

if ('object' === typeof module && 'function' === typeof require) {
    // <!-- Node.js -->
	
    require('./lib/modules/log.js');
    require('./lib/modules/variables.js');
    require('./lib/modules/stepper.js');
    
    require('./init.node.js');
    require('./lib/nodegame.js');
    
    require('./lib/modules/fs.js');
    require('./lib/modules/setup.js');
    require('./lib/modules/alias.js');
    require('./lib/modules/random.js');
    
    // ### Loading Sockets
    require('./lib/sockets/SocketIo.js');
    require('./lib/sockets/SocketDirect.js');
    
    // ### Loading Event listeners
    require('./listeners/incoming.js');
    require('./listeners/internal.js');
}
else {
    // <!-- Browser -->
    if ('undefined' !== typeof JSUS) node.JSUS = JSUS;
    if ('undefined' !== typeof NDDB) node.NDDB = NDDB;
    if ('undefined' !== typeof store) node.store = store;
    
    node.support = JSUS.compatibility();
}
	
})('object' === typeof module ? module.exports : (window.node = {}));	
