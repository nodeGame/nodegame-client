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


//## Aliases	


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
	node.alias = function(alias, events, cb) {
		if (!alias || !events) { 
			node.err('undefined alias or events'); 
			return; 
		}
		if (!J.isArray(events)) events = [events];
		
		J.each(events, function(event){
			node.on[alias] = function(func) {
				node.on(event, function(msg){
					func.call(node.game, cb ? cb(msg) : msg);
				});
			};
		});
	};	
				
	
/**
 *  ### node.DONE
 * 
 * Emits locally a DONE event
 * 
 * The DONE event signals that the player has terminated a game stage, 
 * and that it is ready to advance to the next one.
 * 
 * @param {mixed} param Optional. An additional parameter passed along
 */
    node.DONE = function (param) {
	node.emit("DONE", param);
    };

/**
 *  ### node.TXT
 * 
 *  Emits locally a TXT event
 *  
 *  The TXT event signals that a text message needs to be delivered
 *  to a recipient.
 *  
 *  @param {string} text The text of the message
 *  @param {string} to The id of the recipient
 */	
    node.TXT = function (text, to) {
	node.emit('out.say.TXT', text, to);
    };			
	
// ### node.on.txt	
    node.alias('txt', 'in.say.TXT');
	
// ### node.on.data	
    node.alias('data', ['in.say.DATA', 'in.set.DATA']);
	
// ### node.on.state	
    node.alias('state', 'in.set.STATE');
	
// ### node.on.stage	
    node.alias('stage', 'in.set.STAGE');	
	
// ### node.on.plist	
    node.alias('plist', ['in.set.PLIST', 'in.say.PLIST']);

// ### node.on.pconnect
    node.alias('pconnect', 'in.say.PCONNECT', function(msg) {
        return msg.data;
    });
 		
	node.onTXT = function(func) {
		if (!func) return;
		node.on("", function(msg) {
			func.call(node.game,msg);
		});
	};
	
	node.onDATA = function(text, func) {
		if (!text || !func) return;
		
		node.on('in.say.DATA', function(msg) {
			if (msg.text === text) {
				func.call(node.game, msg);
			}
		});
		
		node.on('in.set.DATA', function(msg) {
			if (msg.text === text) {
				func.call(node.game, msg);
			}
		});
	};
	
	node.onSTATE = function(func) {
		node.on("in.set.STATE", function(msg) {
			func.call(node.game, msg);
		});
	};
	
	node.onSTAGE = function(func) {
		node.on("in.set.STAGE", function(msg) {
			func.call(node.game, msg);
		});
	};
	
	node.onPLIST = function(func) {
		node.on("in.set.PLIST", function(msg) {
			func.call(node.game, msg);
		});
		
		node.on("in.say.PLIST", function(msg) {
			func.call(node.game, msg);
		});
	};
		


})(
	'undefined' != typeof node ? node : module.exports,
	'undefined' != typeof node ? node : module.parent.exports
);
