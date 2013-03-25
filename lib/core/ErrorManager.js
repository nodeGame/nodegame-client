/**
 * # Stager
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * `nodeGame` container of game-state functions, and parameters
 * 
 * ---
 * 
 */
(function (exports, node) {
	
// ## Global scope
	var J = node.JSUS;
	
	node.debug = false;

	var NodeGameRuntimeError = (function() {
		var NodeGameRuntimeError, err;
		NodeGameRuntimeError = (function() {
			function NodeGameRuntimeError() {
		      var err;
		      err = new Error();
		      err.name = "NodeGameRuntimeError";
		      if (err.stack) this.stack = err.stack;
		    }
		    return NodeGameRuntimeError;
		})();
		err = new Error();
		err.name = "NodeGameRuntimeError";
		NodeGameRuntimeError.prototype = err;

		return NodeGameRuntimeError;
	}).call(this);



			
			var ex = new NodeGameRuntimeError();
			
			node.err("ERR");
			
			if (node.debug) {
				throw ex;
			}
			else {
				
			}
		}
	}
	
	
// ## Closure	
})(
	'undefined' != typeof node ? node : module.exports
  , 'undefined' != typeof node ? node : module.parent.exports
);