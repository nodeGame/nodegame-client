/**
 * 
 * # TriggerManager: 
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * Manages a collection of function called sequentially
 *  
 * this.return flag determines how the hooks are called:
 * 
 * - 'first': returns the value from the first trigger which matches the object
 * - 'last': returns the value from the last trigger, after all have been executed
 * 
 */

(function(exports, node){

// ## Global scope
	
exports.TriggerManager = TriggerManager;

TriggerManager.first = 'first';
TriggerManager.last = 'last';

/**
 * ## TriggerManager constructor
 * 
 * Creates a new instance of TriggerManager
 * 
 */
function TriggerManager (options) {
// ## Public properties
	
	this.options = options = options || {};
	this.triggers = [];
	this.return = TriggerManager.first; // options are first, last 
	this.init(this.options);
	
	Object.defineProperty(this, 'length', {
    	set: function(){},
    	get: function(){
    		return this.triggers.length;
    	},
    	configurable: true
	});
};

// ## TriggerManager methods

/**
 * ### TriggerManager.
 * 
 * 
 */
TriggerManager.prototype.init = function(options) {
	this.options = options || this.options;
	if (this.options.return === TriggerManager.first || this.options.return === TriggerManager.last) {
		this.return = this.options.return || this.return;
	}
	this.resetTriggers();
};

/**
 * ### TriggerManager.
 * 
 * 
 */
TriggerManager.prototype.initTriggers = function(triggers) {
	if (triggers) {
		if (!(triggers instanceof Array)) {
			triggers = [triggers];
		}
		for (var i=0; i< triggers.length; i++) {
			this.triggers.push(triggers[i]);
		}
	} 
  };
	
/**
 * ### TriggerManager.
 *   
 * Delete existing render functions and add the default
 * ones, if any.
 */
TriggerManager.prototype.resetTriggers = function () {
	this.triggers = [];
	this.initTriggers(this.options.triggers);
};

/**
 * ### TriggerManager.
 * 
 * 
 */
TriggerManager.prototype.clear = function (clear) {
	if (!clear) {
		node.log('Do you really want to clear the current TriggerManager obj? Please use clear(true)', 'WARN');
		return false;
	}
	this.triggers = [];
	return clear;
};
	
/**
 * ### TriggerManager.
 * 
 * 
 */	  
TriggerManager.prototype.addTrigger = function (trigger, pos) {
	if (!trigger) return;
	if (!pos) {
		this.triggers.push(trigger);
	}
	else {
		this.triggers.splice(pos, 0, trigger);
	}
	return true;
};
	  
/**
 * ### TriggerManager.
 * 
 * 
 */	  
TriggerManager.prototype.removeTrigger = function (trigger) {
	for (var i=0; i< this.triggers.length; i++) {
		if (this.triggers[i] == trigger) {
			return this.triggers.splice(i,1);
		}
	}  
	return false;
};

/**
 * ### TriggerManager.
 * 
 * 
 */	
TriggerManager.prototype.pullTriggers = function (o) {
	if (!o) return;
	// New criteria are fired first
	for (var i = this.triggers.length; i > 0; i--) {
		var out = this.triggers[(i-1)].call(this, o);
		if (out) {
			if (this.return === TriggerManager.first) {
				return out;
			}
		}
	}
	// Safety return
	return o;
};

/**
 * ### TriggerManager.
 * 
 * 
 */
TriggerManager.prototype.size = function () {
	return this.triggers.length;
};
	

// ## Closure	
})(
	('undefined' !== typeof node) ? node : module.exports
  , ('undefined' !== typeof node) ? node : module.parent.exports
);