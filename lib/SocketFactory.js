/**
 * # SocketFactory
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` component responsible for registering and instantiating 
 * new GameSocket clients
 * 
 * Contract: Socket prototypes must implement the following methods:
 * 
 * 	- connect: establish a communication channel with a ServerNode instance
 * 	- send: pushes messages into the communication channel
 * 
 * ---
 * 
 */


(function( exports ) {


    // Storage for socket types
    var types = {};

    function checkContract( proto ) {
    	if (!proto.send) return false;
    	if (!proto.connect) return false;
    }
    
    function getTypes() {
    	return types;
    }
    
    function get( type, options ) {
    	var Socket = types[type];

    	return (Socket) ? return new Socket(options) : null;
    }

    function register( type, className ) {
    	if (!type || !className) return;
    	
        var proto = className.prototype;

        // only register classes that fulfill the contract
        if ( checkContract() ) {
            types[type] = proto;
        }
        else {
        	node.err('Cannot register invalid Socket class: ' + type);
        }
    }
    
    // expose the socketFactory methods
    exports.socketFactory = {
    	checkContract: checkContract,
    	getTypes: getTypes,
    	get: get,
    	register: register
    };
    
    
// ## Closure	
})( 'undefined' != typeof node ? node : module.exports );