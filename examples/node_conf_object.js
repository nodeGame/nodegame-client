// # nodegame-client configuration object

// ## Configuration options

// - url: a string containing the relative or absolute uri mapping to the a nodegame channel
// - verbosity: a number representing the default verbosity level. The higher the number
//   the greater the verbosity of nodegame-client
// - io: a configuration object to be passed to the socket.io constructor. See https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO
// - window: a configuration object to be passed to the node.window object. Options:
//		- promptOnLeave: an alert will be automatically displayed to the user when he tries to leave the page
//		- noEscape: captures the 'ESC' key and binds it to a NULL event. If FALSE, pressing 'ESC' will cause the socket to reset the connection
// - env: an object containing variables accessible from the method node.env
// - events: configuration object to be passed to the constructor of the EventEmitter class. Options:
//		- history: if TRUE, all the emitted events will be stored, and it will be possible to re-emit them. If TRUE, it may drive down performance.
//		- dumpEvents: if TRUE, all the fired events will be dumped to console. If TRUE, it may drive down performance.
//


// ## Example object

// All configuration options are listed below with their default value.
// Options prefixed with 'my' are examples of properties that can be added
// in nested configuration objects.

var conf = {

	url: "/mygame",

	verbosity: 0,

	io: {
		reconnect: false,
	},

	window: {
		promptOnleave: true,
		noEscape: true,
	},

	player: {
		myName: 'myName',
	},

	env: {
		myEnv: true,
	},

	events: {
		history: false,
		dumpEvents: false,
	}


};
