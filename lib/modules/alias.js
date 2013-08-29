/**
 * # Alias
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` aliasing module
 * 
 * ---
 * 
 */

(function (exports, node) {
    
    // ## Global scope
    
    var GameMsg = node.GameMsg,
    Player = node.Player,
    GameMsgGenerator = node.GameMsgGenerator,
    J = node.JSUS;


    var NGC = node.NodeGameClient;


    /**
     * ### node.alias
     * 
     * Creates event listeners aliases
     * 
     * This method creates a new property to the `node.on` object named
     * after the alias. The alias can be used as a shortcut to register
     * to new listeners on the given events.
     * 
     * 
     * ```javascript
     * 	node.alias('myAlias', ['in.say.DATA', 'myEvent']);
     * 
     * 	node.on.myAlias(function(){ console.log('myEvent or in.say.DATA'); };
     * ```	
     * 
     * @param {string} alias The name of alias
     * @param {string|array} events The event/s under which the listeners will be registered to
     * @param {function} cb Optional. If set the return value will be passed as parameter
     *   of the emitted event
     */	
    NGC.prototype.alias = function(alias, events, cb) {
	var that;
        if (!alias || !events) { 
	    this.err('undefined alias or events'); 
	    return; 
	}
	if (!J.isArray(events)) events = [events];
	that = this;
	J.each(events, function(event) {
	    that.on[alias] = function(func) {
		that.on(event, (cb) ? 
			function() {
			    func.call(that.game, cb.apply(that.game, arguments));
			}
			: function() {
			    func.apply(that.game, arguments);
			}
		       );
                
	    };
	});
    };	
    
    



})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);