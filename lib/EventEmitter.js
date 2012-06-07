(function (exports, node) {
		
	var NDDB = node.NDDB;
	
   /**
    * Expose constructor 
    */
	exports.EventEmitter = EventEmitter;
	
	//var parser = exports.parser = {};
		 
	function EventEmitter() {
	    this._listeners = {};
	    this._localListeners = {};
	    this._history = new NDDB({
	    	update: {
	    		indexes: true,
	    }});
	    
	    this._history.h('state', function(e) {
	    	if (node.state) return node.state.toHash('S.s.r');
	    });
	}
	
	EventEmitter.prototype = {
	
	    constructor: EventEmitter,
		
	    addListener: function (type, listener) {
	    	 if (typeof this._listeners[type] == "undefined"){
	             this._listeners[type] = [];
	         }
	         //console.log('Added Listener: ' + type + ' ' + listener);
	         this._listeners[type].push(listener);
	    },
	    
	    addLocalListener: function (type, listener) {
	    	if (typeof this._localListeners[type] == "undefined"){
	            this._localListeners[type] = [];
	        }
	
	        this._localListeners[type].push(listener);
	    },
	
	    emit: function(event, p1, p2, p3) { // Up to 3 parameters
	    	
	    	if (typeof event == "string") {
	            event = { type: event };
	        }
	        if (!event.target){
	            event.target = this;
	        }
	        
	        if (!event.type) {  //falsy
	            throw new Error("Event object missing 'type' property.");
	        }
	    	// Debug
	        //console.log('Fired ' + event.type);
	        if (this.store) {
	        	
	        	this._history.insert({
	        		event: event.type,
	        		target: event.target,
	        		p1: p1,
	        		p2: p2,
	        		p3: p3,
	        	});
	        }
	        
	        
	        //Global Listeners
	        if (this._listeners[event.type] instanceof Array) {
	            var listeners = this._listeners[event.type];
	            for (var i=0, len=listeners.length; i < len; i++){
	            	listeners[i].call(this.game, p1, p2, p3);
	            }
	        }
	        
	        // Local Listeners
	        if (this._localListeners[event.type] instanceof Array) {
	            var listeners = this._localListeners[event.type];
	            for (var i=0, len=listeners.length; i < len; i++) {
	            	listeners[i].call(this.game, p1, p2, p3);
	            }
	        }
	       
	    },
	
	    removeListener: function(type, listener) {
	
	    	function removeFromList(type, listener, list) {
		    	//console.log('Trying to remove ' + type + ' ' + listener);
		    	
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
		                    //console.log('Removed listener ' + type + ' ' + listener);
		                    return true;
		                }
		            }
		        }
		        
		        return false; // no listener removed
	    	}
	    	
	    	var r1 = removeFromList(type, listener, this._listeners);
	    	var r2 = removeFromList(type, listener, this._localListeners);

	    	return r1 || r2;
	    },
	    
	    // TODO: This method wraps up clearLocalListeners. To re-design.
	    clearState: function(state) {
	    	this.clearLocalListeners();
	    	return true;
	    },
	    
	    clearLocalListeners: function() {
	    	//console.log('Cleaning Local Listeners');
	    	for (var key in this._localListeners) {
	    		if (this._localListeners.hasOwnProperty(key)) {
	    			this.removeListener(key, this._localListeners[key]);
	    		}
	    	}
	    	
	    	this._localListeners = {};
	    },
	    
	    // Debug
	    printAllListeners: function() {
	    	console.log('nodeGame:\tPRINTING ALL LISTENERS');
		    
	    	for (var i in this._listeners){
		    	if (this._listeners.hasOwnProperty(i)){
		    		console.log(i + ' ' + i.length);
		    	}
		    }
	    	
	    	for (var i in this._localListeners){
		    	if (this._listeners.hasOwnProperty(i)){
		    		console.log(i + ' ' + i.length);
		    	}
		    }
	        
	    }
	};
	
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
	 
	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);