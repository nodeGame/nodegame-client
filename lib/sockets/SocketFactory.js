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


(function( exports, node ) {


    // Storage for socket types
    var types = {};

    function checkContract( proto ) {
    	var test = proto;
//    	if (!proto.prototype) {
    		test = new proto();
//    	}
    	
    	if (!test.send) {
    		console.log('no send')
    		return false;
    	}
    	if (!test.connect){
    		console.log('no connect')
    		return false;
    	}
    	
    	return true;
    }
    
    function getTypes() {
    	return types;
    }
    
    function get( type, options ) {
    	var Socket = types[type];

    	console.log('------')
    	console.log(type)
    	console.log(types)
    	console.log(Socket);
    	console.log('so')
    	
    	return (Socket) ? new Socket(options) : null;
    }

    function register( type, proto ) {
    	if (!type || !proto) return;
    	

//        proto = (proto.prototype) ? proto.prototype : proto;
//
//        console.log(proto)
        
        // only register classes that fulfill the contract
        if ( checkContract(proto) ) {
            types[type] = proto;
        }
        else {
        	node.err('cannot register invalid Socket class: ' + type);
        }
    }
    
    // expose the socketFactory methods
    exports.SocketFactory = {
    	checkContract: checkContract,
    	getTypes: getTypes,
    	get: get,
    	register: register
    };
    
    
// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);