/**
 * # EventEmitter
 * 
 * Event emitter engine for `nodeGame`
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed
 * 
 * Keeps a register of events and function listeners.
 * 
 * ---
 *  
 */
(function (exports, node) {
	
// ## Global scope	
	
var NDDB = node.NDDB;

exports.EventEmitter = EventEmitter;

/**
 * ## EventEmitter constructor
 * 
 * Creates a new instance of EventEmitter
 */
function EventEmitter() {

// ## Public properties	
	
/**
 * ### EventEmitter.global
 * 
 * 
 * Global listeners always active during the game
 * 
 */	
    this.global = this._listeners = {};
    
 /**
  * ### EventEmitter.local
  * 
  * Local listeners erased after every state update
  * 
  */   
    this.local = this._localListeners = {};

/**
 * ### EventEmitter.history
 * 
 * Database of emitted events
 * 
 * 	@see NDDB
 * 	@see EventEmitter.store
 * 
 */      
    this.history = new NDDB({
    	update: {
    		indexes: true,
    }});
    
    this.history.h('state', function(e) {
    	if (!e) return;
    	var state = ('object' === typeof e.state) ? e.state
    											  : node.game.state;
    	return node.GameState.toHash(state, 'S.s.r');
    });
}

// ## EventEmitter methods

EventEmitter.prototype = {

    constructor: EventEmitter,
	
/**
 * ### EventEmitter.add
 * 
 * Registers a global listener for an event
 * 
 * Listeners registered with this method are valid for the
 * whole length of the game
 * 
 * @param {string} type The event name
 * @param {function} listener The function to fire
 * 
 * @see EventEmitter.addLocal
 */
    add: function (type, listener) {
    	if (!type || !listener) return;
    	if ('undefined' === typeof this.global[type]){
    		this.global[type] = [];
    	}
        node.log('Added Listener: ' + type + ' ' + listener, 'DEBUG');
        this.global[type].push(listener);
    },
    
/**
 * ### EventEmitter.addLocal
 * 
 * Registers a local listener for an event
 * 
 * Listeners registered with this method are valid *only* 
 * for the same game state (step) in which they have been
 * registered 
 * 
 * @param {string} type The event name
 * @param {function} listener The function to fire
 * 
 * @see EventEmitter.add
 * 
 */
    addLocal: function (type, listener) {
    	if (!type || !listener) return;
    	if ('undefined' === typeof this.local[type]){
            this.local[type] = [];
        }
    	node.log('Added Local Listener: ' + type + ' ' + listener, 'DEBUG');
        this.local[type].push(listener);
    },

/**
 * ### EventEmitter.emit
 * 
 * Fires all the listeners associated with an event
 * 
 * @param event {string|object} The event name or an object of the type
 * 
 * 		{ type: 'myEvent',
 * 		  target: this, } // optional
 * 
 * @param {object} p1 Optional. A parameter to be passed to the listener
 * @param {object} p2 Optional. A parameter to be passed to the listener
 * @param {object} p3 Optional. A parameter to be passed to the listener
 * 
 * @TODO accepts any number of parameters
 */
    emit: function(event, p1, p2, p3) { // Up to 3 parameters
    	if (!event) return;
    	
    	if ('string' === typeof event) {
            event = { type: event };
        }
        if (!event.target){
            event.target = this;
        }
        
        if (!event.type) {  //falsy
            throw new Error("Event object missing 'type' property.");
        }
    	
        
        // Log the event into node.history object, if present
        if (!node.conf || !node.conf.events) {
        	node.log('node.conf.events object not found. Is everthing all right?', 'WARN');
        }
        else {
        	
        	if (node.conf.events.history) {
	        	var o = {
		        		event: event.type,
		        		//target: node.game,
		        		state: node.state,
		        		p1: p1,
		        		p2: p2,
		        		p3: p3,
		        	};
	        	
	        	this.history.insert(o);
        	}
        	
        	// <!-- Debug
            if (node.conf.events.dumpEvents) {
            	node.log('Fired ' + event.type);
            }
        }
        
        
        // Fires global listeners
        if (this.global[event.type] instanceof Array) {
            var listeners = this.global[event.type];
            for (var i=0, len=listeners.length; i < len; i++){
            	listeners[i].call(this.game, p1, p2, p3);
            }
        }
        
        // Fires local listeners
        if (this.local[event.type] instanceof Array) {
            var listeners = this.local[event.type];
            for (var i=0, len=listeners.length; i < len; i++) {
            	listeners[i].call(this.game, p1, p2, p3);
            }
        }
       
    },

/**
 * ### EventEmitter.remove
 * 
 * Deregister an event, or an event listener
 * 
 * @param {string} type The event name
 * @param {function} listener Optional. The specific function to deregister 
 * 
 * @return Boolean TRUE, if the removal is successful
 */
	remove: function(type, listener) {
	
		function removeFromList(type, listener, list) {
	    	//<!-- console.log('Trying to remove ' + type + ' ' + listener); -->
	    	
	        if (list[type] instanceof Array) {
	        	if (!listener) {
	        		delete list[type];
	        		//console.log('Removed listener ' + type);
	        		return true;
	        	}
	        	
	            var listeners = list[type];
	            var len=listeners.length;
	            for (var i=0; i < len; i++) {
	            	//console.log(listeners[i]);
	            	
	                if (listeners[i] == listener) {
	                    listeners.splice(i, 1);
	                    node.log('Removed listener ' + type + ' ' + listener, 'DEBUG');
	                    return true;
	                }
	            }
	        }
	        
	        return false;
		}
		
		var r1 = removeFromList(type, listener, this.global);
		var r2 = removeFromList(type, listener, this.local);
	
		return r1 || r2;
	},
    
/**
 * ### EventEmitter.clearState
 * 
 * Undocumented (for now)
 * 
 * @TODO: This method wraps up clearLocalListeners. To re-design.
 */ 
	clearState: function(state) {
		this.clearLocal();
		return true;
	},
    
/**
 * ### EventEmitter.clearLocalListeners
 * 
 * Removes all entries from the local listeners register
 * 
 */
	clearLocal: function() {
		node.log('Cleaning Local Listeners', 'DEBUG');
		for (var key in this.local) {
			if (this.local.hasOwnProperty(key)) {
				this.remove(key, this.local[key]);
			}
		}
		
		this.local = {};
	},
    
/**
 * ### EventEmitter.printAll
 * 
 * Prints to console all the registered functions 
 */
	printAll: function() {
		node.log('nodeGame:\tPRINTING ALL LISTENERS', 'DEBUG');
	    
		for (var i in this.global){
	    	if (this.global.hasOwnProperty(i)){
	    		console.log(i + ' ' + i.length);
	    	}
	    }
		
		for (var i in this.local){
	    	if (this.local.hasOwnProperty(i)){
	    		console.log(i + ' ' + i.length);
	    	}
	    }
	    
}
};

/**
 * # Listener
 * 
 * Undocumented (for now)
 */

function Listener (o) {
	var o = o || {};
	
	// event name
	this.event = o.event; 					
	
	// callback function
	this.listener = o.listener; 			
	
	// events with higher priority are executed first
	this.priority = o.priority || 0; 	
	
	// the state in which the listener is
	// allowed to be executed
	this.state = o.state || node.state || undefined; 	
	
	// for how many extra steps is the event 
	// still valid. -1 = always valid
	this.ttl = ('undefined' !== typeof o.ttl) ? o.ttl : -1; 
	
	// function will be called with
	// target as 'this'		
	this.target = o.target || undefined;	
};
	 
// ## Closure

})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);