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

    this.name = 'EE';

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
	    this.events[type] = [this._events[type], listener];
        }
	
        node.log('Added Listener: ' + type + ' ' + listener, 'DEBUG');
        
    },


/**
 * ### EventEmitter.emit
 *
 * Fires all the listeners associated with an event
 *
 * @param event {string|object} The event name or an object of the type
 *
 *      { type: 'myEvent',
 *        target: this, } // optional
 *
 * @param {object} p1 Optional. A parameter to be passed to the listener
 * @param {object} p2 Optional. A parameter to be passed to the listener
 * @param {object} p3 Optional. A parameter to be passed to the listener
 *
 * @TODO accepts any number of parameters
 */
    emit: function(type) { // Up to 3 parameters
	
	var handler, len, args, i, listeners; 

	handler = this._events[type];
	
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
		handler.apply(this, args);
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
		listeners[i].apply(this, args);
	    }
	}

  
        // Log the event into node.history object, if present
        if (node.conf && node.conf.events && node.conf.events.history) {   
            this.history.insert({
                stage: node.game.getCurrentGameStage(),
                args: arguments
            });
        }
    },

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
    remove: function(type, listener) {

	var listeners, len, i, type;

	if (!this.events[type]) {
	    node.debug(this.name + ': attempt to remove unexisting event ' + type);
	    return false;
	}
	
	if (!listener) {
            delete this.events[type];
            node.debug('Removed listener ' + type);
            return true;
        }

	if (listener && 'function' !== typeof listener) {
	    throw TypeError(this.name ': listener must be a function');
	}
	

        if ('function' === typeof this.events[type] ) {
            if (listeners == listener) {
                listeners.splice(i, 1);
                node.debug(this.name ': removed listener ' + type + ' ' + listener);
                return true;
            }
	}

	// array
        listeners = this.events[type];
        len = listeners.length;
        for (i = 0; i < len; i++) {  
            if (listeners[i] == listener) {
                listeners.splice(i, 1);
                node.debug('Removed listener ' + type + ' ' + listener);
                return true;
            }
        }

        return false;
        
    },


/**
 * ### EventEmitter.printAll
 *
 * Prints to console all the registered functions
 */
    printAll: function() {
    	var i;
        for (i in this.events){
            if (this.events.hasOwnProperty(i)){
                console.log(i + ' ' + i.length);
            }
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

    if (!this.history.count()) {
        node.log('no event history was found to remit', 'WARN');
        return false;
    }

    node.log('remitting ' + node.events.history.count() + ' events', 'DEBUG');

    var hash, db;

    if (stage) {

        this.history.rebuildIndexes();

        hash = new GameStage(session.stage).toHash('S.s.r');

        if (!this.history.stage) {
            node.log('no old events to re-emit were found during session recovery', 'DEBUG');
            return false;
        }
        if (!this.history.stage[hash]){
            node.log('the current stage ' + hash + ' has no events to re-emit', 'DEBUG');
            return false;
        }

        db = this.history.stage[hash];
    }
    else {
        db = this.history;
    }

    // cleaning up the events to remit

    if (discard) {
        db.select('event', 'in', discard).remove();
    }

    if (keep) {
        db = db.select('event', 'in', keep);
    }

    if (!db.count()){
        node.log('no valid events to re-emit after cleanup', 'DEBUG');
        return false;
    }

    var remit = function () {
        node.log('re-emitting ' + db.count() + ' events', 'DEBUG');
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
