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
     * @param {string|array} events The event/s under which the listeners 
     *   will be registered
     * @param {function} modifier Optional. If set the return value will be 
     *   passed as parameter of the emitted event
     */	
    NGC.prototype.alias = function(alias, events, modifier) {
	var that, func;
        if ('string' !== typeof alias) {
            throw new TypeError('node.alias: alias must be string.');
	}
        if ('string' === typeof events) {
            events = [events];
        }
        if (!J.isArray(events)) {
            throw new TypeError('node.alias: events must be array or string.');
        }
        if (modifier && 'function' !== typeof modifier) {
            throw new TypeError(
                'node.alias: modifier must be function or undefined.');
        }   

	that = this;
        J.each(events, function(event){
            // This function - called `definer` - will be used
            // by developer to register new callbacks on the alias.
            // It can accepts any number of parameters, but one
            // must be a function.
            that.on[alias] = function(func) {
                
                // Actual registration of the event listener.
                that.on(event, (modifier) ?
                        // The arguments of this function are those
                        // passed by the original emitted event.
                        function() {
                            var res;
                            res = modifier.apply(node.game, arguments);
                            // Fires the alias callback, only if 
                            // the modifier returns a value.
                            if (res) func.call(node.game, res);
                        }
                        : function() {
                            func.apply(node.game, arguments);
                        }
                       );

            };
        });
    };
})(
    'undefined' != typeof node ? node : module.exports,
    'undefined' != typeof node ? node : module.parent.exports
);