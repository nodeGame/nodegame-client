(function (exports) {
	
   /**
    * Expose constructor.
    */
	exports.EventEmitter = EventEmitter;
	
	//var parser = exports.parser = {};
		 
	function EventEmitter() {
	    this._listeners = {};
	    this._localListeners = {};
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
	        
	        if (!event.type){  //falsy
	            throw new Error("Event object missing 'type' property.");
	        }
	    	// Debug
	        //console.log('Fired ' + event.type);
	        
	        
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
	    
	    // TODO: remove fire when all the code has been updated
//	    fire: function(event, p1, p2, p3) { // Up to 3 parameters
//	    	this.emit(event, p1, p2, p3);
//	    },
	
	    removeListener: function(type, listener) {
	
	    	function removeFromList(type, listener, list) {
		    	//console.log('Trying to remove ' + type + ' ' + listener);
		    	
		        if (list[type] instanceof Array) {
		        	
		        	if (listener === null || listener === undefined) {
		        		delete list[type];
		        		//console.log('Removed listener ' + type);
		        		return true;
		        	}
		        	
		            var listeners = list[type];
		            for (var i=0, len=listeners.length; i < len; i++) {
		            	
		            	//console.log(listeners[i]);
		            	
		                if (listeners[i] === listener){
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

})('object' === typeof module ? module.exports : (window.node = {}));
