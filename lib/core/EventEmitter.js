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
exports.EventEmitterManager = EventEmitterManager;

/**
 * ## EventEmitter constructor
 *
 * creates a new instance of EventEmitter
 */
function EventEmitter(name) {

// ## Public properties

    this.name = 'undefined' !== typeof name ? name : 'EE';

/**
 * ### EventEmitter.listeners
 *
 *
 * Event listeners collection
 *
 */
    this.events = {};

/**
 * ### EventEmitter.history
 *
 * Database of emitted events
 *
 * @see NDDB
 * @see EventEmitter.EventHistory
 * @see EventEmitter.store
 *
 */
    this.history = new EventHistory();
}

// ## EventEmitter methods

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
EventEmitter.prototype.on = function (type, listener) {
    if ('undefined' === typeof type || !listener) {
	node.err(this.name + ': trying to add invalid event-listener pair');
	return;
    }

    if (!this.events[type]) {
	// Optimize the case of one listener. Don't need the extra array object.
	this.events[type] = listener;
    } 
    else if (typeof this.events[type] === 'object') {
	// If we've already got an array, just append.
	this.events[type].push(listener);
    }
    else {
	// Adding the second element, need to change to array.
	this.events[type] = [this.events[type], listener];
    }
    
    node.silly(this.name + ': added Listener: ' + type + ' ' + listener);  
};

/**
 * ### node.once
 * 
 * Registers an event listener that will be removed 
 * after its first invocation
 * 
 * @param {string} event The name of the event
 * @param {function} listener The callback function
 * 
 * @see EventEmitter.on
 * @see EventEmitter.off
 */	
EventEmitter.prototype.once = function(type, listener) {
    function g() {
	this.remove(type, g);
	listener.apply(node.game, arguments);
    }
    this.on(type, g); 
};


    


/**
 * ### EventEmitter.emit
 *
 * Fires all the listeners associated with an event
 *
 * The first parameter be the name of the event as _string_, 
 * followed by any number of parameters that will be passed to the
 * handler callback.
 *
 */
EventEmitter.prototype.emit = function() { 
	
    var handler, len, args, i, listeners, type; 

    type = arguments[0];
    handler = this.events[type];
    
    if (typeof handler === 'undefined') return false;

    // <!-- Debug
    if (node.conf.events.dumpEvents) {
        node.log('F: ' + event.type);
    }
    
    if (typeof handler === 'function') {	
	
	switch (arguments.length) {
	    // fast cases
	case 1:
	    handler.call(node.game);
	    break;
	case 2:
	    handler.call(node.game, arguments[1]);
	    break;
	case 3:
	    handler.call(node.game, arguments[1], arguments[2]);
	    break;
	case 4:
	    handler.call(node.game, arguments[1], arguments[2], arguments[3]);
	    break;
	    
	default:
	    // slower
	    len = arguments.length;
	    args = new Array(len - 1);
	    for (i = 1; i < len; i++) {
		args[i - 1] = arguments[i];
	    }
	    handler.apply(node.game, args);
	}
    } 
    else if (typeof handler === 'object') {
	len = arguments.length;
	args = new Array(len - 1);
	for (i = 1; i < len; i++) {
	    args[i - 1] = arguments[i];
	}
	listeners = handler.slice();
	len = listeners.length;
	
	for (i = 0; i < len; i++) {
	    listeners[i].apply(node.game, args);
	}
    }

    
    // Log the event into node.history object, if present
    if (node.conf && node.conf.events && node.conf.events.history) {   
        this.history.insert({
            stage: node.game.getCurrentGameStage(),
            args: arguments
        });
    }
};

/**
 * ### EventEmitter.remove
 *
 * Deregisters one or multiple event listeners
 *
 * @param {string} type The event name
 * @param {function} listener Optional. The specific function to deregister
 *
 * @return Boolean TRUE, if the removal is successful
 */
EventEmitter.prototype.remove = function(type, listener) {

    var listeners, len, i, type;

    if (!this.events[type]) {
	node.warn('attempt to remove unexisting event ' + type, this.name);
	return false;
    }
    
    if (!listener) {
        delete this.events[type];
        node.silly('Removed listener ' + type);
        return true;
    }

    if (listener && 'function' !== typeof listener) {
	throw TypeError('listener must be a function', this.name);
    }
    

    if ('function' === typeof this.events[type] ) {
        if (listeners == listener) {
            listeners.splice(i, 1);
            node.silly('removed listener ' + type + ' ' + listener, this.name);
            return true;
        }
    }

    // array
    listeners = this.events[type];
    len = listeners.length;
    for (i = 0; i < len; i++) {  
        if (listeners[i] == listener) {
            listeners.splice(i, 1);
            node.silly('Removed listener ' + type + ' ' + listener, this.name);
            return true;
        }
    }

    return false;
    
};

/**
 * ### EventEmitter.printAll
 *
 * Removes all registered event listeners
 */
    EventEmitter.prototype.clear =  function() {
	this.events = {};
    };
    
/**
 * ### EventEmitter.printAll
 *
 * Prints to console all the registered functions
 */
    EventEmitter.prototype.printAll =  function() {
	for (var i in this.events) {
            if (this.events.hasOwnProperty(i)) {
		console.log(i + ': ' + i.length ? i.length : 1 + ' listener/s');
            }
	}
    };


/**
 * # EventEmitterManager
 *
 */
    function EventEmitterManager() {
	this.ee = {};
	this.createEE('ng');
	this.createEE('game');
	this.createEE('stage');
	this.createEE('step');
	
	this.createEEGroup('game', 'step', 'stage', 'game');
	this.createEEGroup('stage', 'stage', 'game');
    };

    EventEmitterManager.prototype.createEEGroup = function(groupName) {
	var len, that, args;
	len = arguments.length, that = this;
	
	if (!len) {
	    throw new Error('EEGroup needs a name and valid members');
	}
	if (len === 1) {
	    throw new Error('EEGroup needs at least one member');
	}
	
	// Checking if each ee exist
	for (i = 1; i < len; i++) {
	    if ('string' !== typeof arguments[i]) {
		throw new TypeError('EventEmitter name must be a string');
	    }
	    if (!this.ee[arguments[i]]) {
		throw new Error('non-existing EventEmitter in group ' + groupName + ': ' + arguments[i]);
	    }
	}
	
	// copying the args obj into an array;
	args = new Array(len - 1);
	for (i = 1; i < len; i++) {
	    args[i - 1] = arguments[i];
	}

	switch (len) {
	    // fast cases
	case 2:
	    this[groupName] = this.ee[args[0]];
	    break;
	case 3:
	    this[groupName] = {
		emit: function() {
		    that.ee[args[0]].emit(arguments);
		    that.ee[args[1]].emit(arguments);
		},
		on: this.ee[args[0]].on,
		once: this.ee[args[1]].once,
		clear: function() {
		    that.ee[args[0]].clear();
		    that.ee[args[1]].clear();
		},
		remove: function() {
		    that.ee[args[0]].remove(arguments);
		    that.ee[args[1]].remove(arguments);
		},
		printAll: function() {
		    that.ee[args[0]].printAll();
		    that.ee[args[1]].printAll();
		}
	    };
	    break;
	case 4:
	    this[groupName] = {
		emit: function() {
		    that.ee[args[0]].emit(arguments);
		    that.ee[args[1]].emit(arguments);
		    that.ee[args[2]].emit(arguments);
		},
		on: this.ee[args[0]].on,
		once: this.ee[args[1]].once,
		clear: function() {
		    that.ee[args[0]].clear();
		    that.ee[args[1]].clear();
		    that.ee[args[2]].clear();
		},
		remove: function() {
		    that.ee[args[0]].remove(arguments);
		    that.ee[args[1]].remove(arguments);
		    that.ee[args[2]].remove(arguments);
		},
		printAll: function() {
		    that.ee[args[0]].printAll();
		    that.ee[args[1]].printAll();
		    that.ee[args[2]].printAll();
		}
	    };
	    break;
	default:
	    // slower
	    len = args.len;
	    this[groupName] = {
		emit: function() {
		    for (i = 0; i < len; i++) {
			that.ee[args[i]].emit(arguments);
		    }
		},
		on: this.ee[args[0]].on,
		once: this.ee[args[1]].once,
		clear: function() {
		    for (i = 0; i < len; i++) {
			that.ee[args[i]].clear();
		    }
		   
		},
		remove: function() {
		     for (i = 0; i < len; i++) {
			 that.ee[args[i]].remove(arguments);
		     }
		},
		printAll: function() {
		    for (i = 0; i < len; i++) {
			that.ee[args[i]].printAll();
		    }
		}
	    };
	}
	return this[groupName];
    };


    EventEmitterManager.prototype.createEE = function(name) {
	this.ee[name] = new EventEmitter(name);
	this[name] = this.ee[name];
	return this.ee[name];
    };

    EventEmitterManager.prototype.destroyEE = function(name) {
	var ee;
	ee = this.ee[name];
	if (!ee) {
	    node.warn('cannot destroy undefined EventEmitter');
	    return false;
	}
	delete this[name];
	delete this.ee[name];
    };

        
    EventEmitterManager.prototype.clear = function() {
	for (i in this.ee) {
	    if (this.ee.hasOwnProperty(i)) {
		this.ee[i].clear();
	    }
	}
    };	


    EventEmitterManager.prototype.emit = function() {
	var i, event;
	debugger;
	event = arguments[0];
	if ('undefined' === typeof event) {
	    node.warn('cannot emit undefined event');
	    return false;
	}

	for (i in this.ee) {
	    if (this.ee.hasOwnProperty(i)) {
		this.ee[i].emit.apply(this.ee[i], arguments);
	    }
	}
    };
	
    EventEmitterManager.prototype.remove = function(event, listener) {
	var i;
	
	if ('undefined' === typeof event) {
	    node.err('cannot remove listener of undefined event');
	    return false;
	}

	if (listener && 'function' === typeof listener) {
	    node.err('listener must be of type function');
	    return false;
	}
	
	for (i in this.ee) {
	    if (this.ee.hasOwnProperty(i)) {
		this.ee[i].remove(event, listener);
	    }
	}
    };

/**
 * # EventHistory
 *
 */
function EventHistory() {

    /**
     * ### EventHistory.history
     *
     * Database of emitted events
     *
     * @see NDDB
     * @see EventEmitter.store
     *
     */
    this.history = new NDDB();

    this.history.h('stage', function(e) {
        if (!e) return;
        var stage = ('object' === typeof e.stage) ? e.stage
                                                  : node.game.stage;
        return node.GameStage.toHash(stage, 'S.s.r');
    });

}

EventHistory.prototype.remit = function(stage, discard, keep) {
    var hash, db, remit;

    if (!this.history.count()) {
        node.log('no event history was found to remit', 'WARN');
        return false;
    }

    node.silly('remitting ' + node.events.history.count() + ' events');

    if (stage) {

        this.history.rebuildIndexes();

        hash = new GameStage(session.stage).toHash('S.s.r');

        if (!this.history.stage) {
            node.silly('no old events to re-emit were found during session recovery');
            return false;
        }
        if (!this.history.stage[hash]){
            node.silly('the current stage ' + hash + ' has no events to re-emit');
            return false;
        }

        db = this.history.stage[hash];
    }
    else {
        db = this.history;
    }

    // cleaning up the events to remit
    // @TODO NDDB commands have changed, update 
    if (discard) {
        db.select('event', 'in', discard).remove();
    }

    if (keep) {
        db = db.select('event', 'in', keep);
    }

    if (!db.count()){
        node.silly('no valid events to re-emit after cleanup');
        return false;
    }

    remit = function () {
        node.silly('re-emitting ' + db.count() + ' events');
        // We have events that were fired at the stage when
        // disconnection happened. Let's fire them again
        db.each(function(e) {
            node.emit(e.event, e.p1, e.p2, e.p3);
        });
    };

    if (node.game.isReady()) {
        remit.call(node.game);
    }
    else {
        node.on('LOADED', function(){
            remit.call(node.game);
        });
    }

    return true;
};



/**
 * # Listener
 *
 * Undocumented (for now)
 */

function Listener (o) {
    o = o || {};

    // event name
    this.event = o.event;

    // callback function
    this.listener = o.listener;

    // events with higher priority are executed first
    this.priority = o.priority || 0;

    // the stage in which the listener is
    // allowed to be executed
    this.stage = o.stage || node.game.stage;

    // for how many extra steps is the event
    // still valid. -1 = always valid
    this.ttl = ('undefined' !== typeof o.ttl) ? o.ttl : -1;

    // function will be called with
    // target as 'this'
    this.target = o.target || undefined;
}

// ## Closure

})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);
