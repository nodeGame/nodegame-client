(function (exports) {

	exports.WaitScreen = WaitScreen;
	
	WaitScreen.id = 'waiting';
	WaitScreen.name = 'WaitingScreen';
	WaitScreen.version = '0.3.2';
	WaitScreen.description = 'Show a standard waiting screen';
	
	function WaitScreen (options) {
		this.id = options.id;
		
		this.text = 'Waiting for other players to be done...';
		this.waitingDiv = null;
	}
	
	// TODO: Write a proper init function
	WaitScreen.prototype.init = function (options) {};	
	
	WaitScreen.prototype.append = function (root) {
		return root;
	};
	
	WaitScreen.prototype.getRoot = function () {
		return this.waitingDiv;
	};
	
	WaitScreen.prototype.listeners = function () {
		var that = this;
		node.on('WAITING...', function (text) {
			if (!that.waitingDiv) {
				that.waitingDiv = node.window.addDiv(document.body, that.id);
			}
			
			if (that.waitingDiv.style.display === 'none'){
				that.waitingDiv.style.display = '';
			}			
		
			that.waitingDiv.innerHTML = text || that.text;
			node.game.pause();
		});
		
		// It is supposed to fade away when a new state starts
		node.on('LOADED', function(text) {
			if (that.waitingDiv) {
				
				if (that.waitingDiv.style.display === ''){
					that.waitingDiv.style.display = 'none';
				}
			// TODO: Document.js add method to remove element
			}
		});
		
	}; 
})(node.window.widgets);
(function (exports) {

	/*
	* NDDBBrowser
	* 
	* Sends DATA msgs
	* 
	*/
	
	exports.NDDBBrowser = NDDBBrowser;
	
	JSUS = node.JSUS;
	NDDB = node.NDDB;
	TriggerManager = node.TriggerManager;
	
	NDDBBrowser.id = 'nddbbrowser';
	NDDBBrowser.name = 'NDDBBrowser';
	NDDBBrowser.version = '0.1.2';
	NDDBBrowser.description = 'Provides a very simple interface to control a NDDB istance.';
	
	NDDBBrowser.dependencies = {
		JSUS: {},
		NDDB: {},
		TriggerManager: {}
	};
	
	function NDDBBrowser (options) {
		this.options = options;
		this.nddb = null;
		
		this.commandsDiv = document.createElement('div');
		this.id = options.id;
		if ('undefined' !== typeof this.id) {
			this.commandsDiv.id = this.id;
		}
		
		this.info = null;
		this.init(this.options);
	}
	
	NDDBBrowser.prototype.init = function (options) {
		
		function addButtons() {
			var id = this.id;
			node.window.addEventButton(id + '_GO_TO_FIRST', '<<', this.commandsDiv, 'go_to_first');
			node.window.addEventButton(id + '_GO_TO_PREVIOUS', '<', this.commandsDiv, 'go_to_previous');
			node.window.addEventButton(id + '_GO_TO_NEXT', '>', this.commandsDiv, 'go_to_next');
			node.window.addEventButton(id + '_GO_TO_LAST', '>>', this.commandsDiv, 'go_to_last');
			node.window.addBreak(this.commandsDiv);
		}
		function addInfoBar() {
			var span = this.commandsDiv.appendChild(document.createElement('span'));
			return span;
		}
		
		
		addButtons.call(this);
		this.info = addInfoBar.call(this);
		
		this.tm = new TriggerManager();
		this.tm.init(options.triggers);
		this.nddb = options.nddb || new NDDB({auto_update_pointer: true});
	};
	
	NDDBBrowser.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.commandsDiv);
		return root;
	};
	
	NDDBBrowser.prototype.getRoot = function (root) {
		return this.commandsDiv;
	};
	
	NDDBBrowser.prototype.add = function (o) {
		return this.nddb.insert(o);
	};
	
	NDDBBrowser.prototype.sort = function (key) {
		return this.nddb.sort(key);
	};
	
	NDDBBrowser.prototype.addTrigger = function (trigger) {
		return this.tm.addTrigger(trigger);
	};
	
	NDDBBrowser.prototype.removeTrigger = function (trigger) {
		return this.tm.removeTrigger(trigger);
	};
	
	NDDBBrowser.prototype.resetTriggers = function () {
		return this.tm.resetTriggers();
	};
	
	NDDBBrowser.prototype.listeners = function() {
		var that = this;
		var id = this.id;
		
		function notification (el, text) {
			if (el) {
				node.emit(id + '_GOT', el);
				this.writeInfo((this.nddb.nddb_pointer + 1) + '/' + this.nddb.length);
			}
			else {
				this.writeInfo('No element found');
			}
		}
		
		node.on(id + '_GO_TO_FIRST', function() {
			var el = that.tm.pullTriggers(that.nddb.first());
			notification.call(that, el);
		});
		
		node.on(id + '_GO_TO_PREVIOUS', function() {
			var el = that.tm.pullTriggers(that.nddb.previous());
			notification.call(that, el);
		});
		
		node.on(id + '_GO_TO_NEXT', function() {
			var el = that.tm.pullTriggers(that.nddb.next());
			notification.call(that, el);
		});

		node.on(id + '_GO_TO_LAST', function() {
			var el = that.tm.pullTriggers(that.nddb.last());
			notification.call(that, el);
			
		});
	};
	
	NDDBBrowser.prototype.writeInfo = function (text) {
		if (this.infoTimeout) clearTimeout(this.infoTimeout);
		this.info.innerHTML = text;
		var that = this;
		this.infoTimeout = setTimeout(function(){
			that.info.innerHTML = '';
		}, 2000);
	};
	
	
})(node.window.widgets);
(function (exports) {
	
	exports.DataBar	= DataBar;
	
	DataBar.id = 'databar';
	DataBar.name = 'Data Bar';
	DataBar.version = '0.3';
	DataBar.description = 'Adds a input field to send DATA messages to the players';
		
	function DataBar (options) {
		
		this.game = node.game;
		this.id = options.id || DataBar.id;
		
		this.bar = null;
		this.root = null;
		
		this.fieldset = {
			legend: 'Send DATA to players'
		};
		
		this.recipient = null;
	}
	
	DataBar.prototype.init = function (options) {};
	
	DataBar.prototype.append = function (root) {
		
		var sendButton = node.window.addButton(root);
		var dataInput = node.window.addTextInput(root);
		this.recipient = node.window.addRecipientSelector(root);
		
		var that = this;
	
		sendButton.onclick = function() {
			
			var to = that.recipient.value;
	
			//try {
				//var data = JSON.parse(dataInput.value);
				data = dataInput.value;
				console.log('Parsed Data: ' + JSON.stringify(data));
				
				node.fire(node.OUT + node.actions.SAY + '.DATA',data,to);
	//			}
	//			catch(e) {
	//				console.log('Impossible to parse the data structure');
	//			}
		};
		
		return root;
		
	};
	
	DataBar.prototype.listeners = function () {
		var that = this;
		var PREFIX = 'in.';
		
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient,msg.data);
		}); 
	};
	
})(node.window.widgets);
(function (exports) {
	

	/*
	* ServerInfoDisplay
	* 
	* Sends STATE msgs
	*/
	
	exports.ServerInfoDisplay = ServerInfoDisplay;	
		
	ServerInfoDisplay.id = 'serverinfodisplay';
	ServerInfoDisplay.name = 'Server Info Display';
	ServerInfoDisplay.version = '0.2';
	
	function ServerInfoDisplay (options) {	
		this.game = node.game;
		this.id = options.id;
		
		this.fieldset = { legend: 'Server Info',
							id: this.id + '_fieldset'
		};
		
		this.root = null;
		this.div = document.createElement('div');
		this.table = null; //new node.window.Table();
		this.button = null;
		
	}
	
	ServerInfoDisplay.prototype.init = function (options) {
		var that = this;
		if (!this.div) {
			this.div = document.createElement('div');
		}
		this.div.innerHTML = 'Waiting for the reply from Server...';
		if (!this.table) {
			this.table = new node.window.Table(options);
		}
		this.table.clear(true);
		this.button = document.createElement('button');
		this.button.value = 'Refresh';
		this.button.appendChild(document.createTextNode('Refresh'));
		this.button.onclick = function(){
			that.getInfo();
		};
		this.root.appendChild(this.button);
		this.getInfo();
	};
	
	ServerInfoDisplay.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.div);
		return root;
	};
	
	ServerInfoDisplay.prototype.getInfo = function() {
		var that = this;
		node.get('INFO', function (info) {
			node.window.removeChildrenFromNode(that.div);
			that.div.appendChild(that.processInfo(info));
		});
	};
	
	ServerInfoDisplay.prototype.processInfo = function(info) {
		this.table.clear(true);
		for (var key in info) {
			if (info.hasOwnProperty(key)){
				this.table.addRow([key,info[key]]);
			}
		}
		return this.table.parse();
	};
	
	ServerInfoDisplay.prototype.listeners = function () {
		var that = this;
		node.on('NODEGAME_READY', function(){
			that.init();
		});
	}; 
	
})(node.window.widgets);
(function (exports) {
	

	// TODO: handle different events, beside onchange
	
	/**
	* Controls
	* 
	*/
	
	exports.Controls = Controls;	
	exports.Controls.Slider = SliderControls;
	exports.Controls.jQuerySlider = jQuerySliderControls;
	exports.Controls.Radio	= RadioControls;
	
	Controls.id = 'controls';
	Controls.name = 'Controls';
	Controls.version = '0.2';
	Controls.description = 'Wraps a collection of user-inputs controls.';
		
	function Controls (options) {
		this.options = options;
		this.id = options.id;
		this.root = null;
		
		this.listRoot = null;
		this.fieldset = null;
		this.submit = null;
		
		this.changeEvent = this.id + '_change';
		
		this.init(options);
	}

	Controls.prototype.add = function (root, id, attributes) {
		// TODO: node.window.addTextInput
		//return node.window.addTextInput(root, id, attributes);
	};
	
	Controls.prototype.getItem = function (id, attributes) {
		// TODO: node.window.addTextInput
		//return node.window.getTextInput(id, attributes);
	};
	
	Controls.prototype.init = function (options) {

		this.hasChanged = false; // TODO: should this be inherited?
		if ('undefined' !== typeof options.change) {
			if (!options.change){
				this.changeEvent = false;
			}
			else {
				this.changeEvent = options.change;
			}
		}
		this.list = new node.window.List(options);
		this.listRoot = this.list.getRoot();
		
		if (!options.features) return;
		if (!this.root) this.root = this.listRoot;
		this.features = options.features;
		this.populate();
	};
	
	Controls.prototype.append = function (root) {
		this.root = root;
		var toReturn = this.listRoot;
		this.list.parse();
		root.appendChild(this.listRoot);
		
		if (this.options.submit) {
			var idButton = 'submit_' + this.id;
			if (this.options.submit.id) {
				idButton = this.options.submit.id;
				delete this.options.submit.id;
			}
			this.submit = node.window.addButton(root, idButton, this.options.submit, this.options.attributes);
			
			var that = this;
			this.submit.onclick = function() {
				if (that.options.change) {
					node.emit(that.options.change);
				}
			};
		}		
		
		return toReturn;
	};
	
	Controls.prototype.parse = function() {
		return this.list.parse();
	};
	
	Controls.prototype.populate = function () {
		var that = this;
		
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				// Prepare the attributes vector
				var attributes = this.features[key];
				var id = key;
				if (attributes.id) {
					id = attributes.id;
					delete attributes.id;
				}
							
				var container = document.createElement('div');
				// Add a different element according to the subclass instantiated
				var elem = this.add(container, id, attributes);
								
				// Fire the onChange event, if one defined
				if (this.changeEvent) {
					elem.onchange = function() {
						node.emit(that.changeEvent);
					};
				}
				
				if (attributes.label) {
					node.window.addLabel(container, elem, null, attributes.label);
				}
				
				// Element added to the list
				this.list.addDT(container);
			}
		}
	};
	
	Controls.prototype.listeners = function() {	
		var that = this;
		// TODO: should this be inherited?
		node.on(this.changeEvent, function(){
			that.hasChanged = true;
		});
				
	};

	Controls.prototype.refresh = function() {
		for (var key in this.features) {	
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el) {
//					node.log('KEY: ' + key, 'DEBUG');
//					node.log('VALUE: ' + el.value, 'DEBUG');
					el.value = this.features[key].value;
					// TODO: set all the other attributes
					// TODO: remove/add elements
				}
				
			}
		}
		
		return true;
	};
	
	Controls.prototype.getAllValues = function() {
		var out = {};
		for (var key in this.features) {	
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el) {
//					node.log('KEY: ' + key, 'DEBUG');
//					node.log('VALUE: ' + el.value, 'DEBUG');
					out[key] = Number(el.value);
				}
				
			}
		}
		
		return out;
	};
	
	Controls.prototype.highlight = function (code) {
		return node.window.highlight(this.listRoot, code);
	};
	
	// Sub-classes
	
	// Slider 
	
	SliderControls.prototype.__proto__ = Controls.prototype;
	SliderControls.prototype.constructor = SliderControls;
	
	SliderControls.id = 'slidercontrols';
	SliderControls.name = 'Slider Controls';
	SliderControls.version = '0.2';
	
	SliderControls.dependencies = {
		Controls: {}
	};
	
	
	function SliderControls (options) {
		Controls.call(this, options);
	}
	
	SliderControls.prototype.add = function (root, id, attributes) {
		return node.window.addSlider(root, id, attributes);
	};
	
	SliderControls.prototype.getItem = function (id, attributes) {
		return node.window.getSlider(id, attributes);
	};
	
	// jQuerySlider
    
    jQuerySliderControls.prototype.__proto__ = Controls.prototype;
    jQuerySliderControls.prototype.constructor = jQuerySliderControls;
    
    jQuerySliderControls.id = 'jqueryslidercontrols';
    jQuerySliderControls.name = 'Experimental: jQuery Slider Controls';
    jQuerySliderControls.version = '0.13';
    
    jQuerySliderControls.dependencies = {
        jQuery: {},
        Controls: {}
    };
    
    
    function jQuerySliderControls (options) {
        Controls.call(this, options);
    }
    
    jQuerySliderControls.prototype.add = function (root, id, attributes) {
        var slider = jQuery('<div/>', {
			id: id
		}).slider();
	
		var s = slider.appendTo(root);
		return s[0];
	};
	
	jQuerySliderControls.prototype.getItem = function (id, attributes) {
		var slider = jQuery('<div/>', {
			id: id
			}).slider();
		
		return slider;
	};


    ///////////////////////////

	
	
	

	
	// Radio
	
	RadioControls.prototype.__proto__ = Controls.prototype;
	RadioControls.prototype.constructor = RadioControls;
	
	RadioControls.id = 'radiocontrols';
	RadioControls.name = 'Radio Controls';
	RadioControls.version = '0.1.1';
	
	RadioControls.dependencies = {
		Controls: {}
	};
	
	function RadioControls (options) {
		Controls.call(this,options);
		this.groupName = ('undefined' !== typeof options.name) ? options.name : 
																node.window.generateUniqueId(); 
		//alert(this.groupName);
	}
	
	RadioControls.prototype.add = function (root, id, attributes) {
		//console.log('ADDDING radio');
		//console.log(attributes);
		// add the group name if not specified
		// TODO: is this a javascript bug?
		if ('undefined' === typeof attributes.name) {
//			console.log(this);
//			console.log(this.name);
//			console.log('MODMOD ' + this.name);
			attributes.name = this.groupName;
		}
		//console.log(attributes);
		return node.window.addRadioButton(root, id, attributes);	
	};
	
	RadioControls.prototype.getItem = function (id, attributes) {
		//console.log('ADDDING radio');
		//console.log(attributes);
		// add the group name if not specified
		// TODO: is this a javascript bug?
		if ('undefined' === typeof attributes.name) {
//			console.log(this);
//			console.log(this.name);
//			console.log('MODMOD ' + this.name);
			attributes.name = this.groupName;
		}
		//console.log(attributes);
		return node.window.getRadioButton(id, attributes);	
	};
	
	// Override getAllValues for Radio Controls
	RadioControls.prototype.getAllValues = function() {
		
		for (var key in this.features) {
			if (this.features.hasOwnProperty(key)) {
				var el = node.window.getElementById(key);
				if (el.checked) {
					return el.value;
				}
			}
		}
		return false;
	};
	
})(node.window.widgets);
(function (exports) {
	
	exports.VisualState	= VisualState;
	
	GameState = node.GameState;
	JSUS = node.JSUS;
	Table = node.window.Table;
	
	VisualState.id = 'visualstate';
	VisualState.name = 'Visual State';
	VisualState.version = '0.2.1';
	VisualState.description = 'Visually display current, previous and next state of the game.';
	
	VisualState.dependencies = {
		JSUS: {},
		Table: {}
	};
	
	
	function VisualState (options) {
		this.id = options.id;
		this.gameLoop = node.game.gameLoop;
		
		this.fieldset = {legend: 'State'};
		
		this.root = null;		// the parent element
		this.table = new Table();
		//this.init(options);
	}
	
	// TODO: Write a proper INIT method
	VisualState.prototype.init = function () {};
	
	VisualState.prototype.getRoot = function () {
		return this.root;
	};
	
	VisualState.prototype.append = function (root, ids) {
		var that = this;
		var PREF = this.id + '_';
		root.appendChild(this.table.table);
		this.writeState();
		return root;
	};
		
	VisualState.prototype.listeners = function () {
		var that = this;
		node.on('STATECHANGE', function() {
			that.writeState();
		}); 
	};
	
	VisualState.prototype.writeState = function () {
		var state = false;
		var pr = false;
		var nx = false;
		
		var miss = '-';
		
		if (node.game && node.game.state) {
			state = this.gameLoop.getName(node.game.state) || miss;
			pr = this.gameLoop.getName(node.game.previous()) || miss;
			nx = this.gameLoop.getName(node.game.next()) || miss;
		}
		else {
			state = 'Uninitialized';
			pr = miss;
			nx = miss;
		}
		this.table.clear(true);

		this.table.addRow(['Previous: ', pr]);
		this.table.addRow(['Current: ', state]);
		this.table.addRow(['Next: ', nx]);
	
		var t = this.table.select('y', '=', 2);
		t.addClass('strong');
		t.select('x','=',0).addClass('underline');
		this.table.parse();
	};
	
})(node.window.widgets);
(function (exports) {

	JSUS = node.JSUS;
	Table = node.window.Table;
	
	exports.StateDisplay = StateDisplay;	
	
	StateDisplay.id = 'statedisplay';
	StateDisplay.name = 'State Display';
	StateDisplay.version = '0.4.1';
	StateDisplay.description = 'Display basic information about player\'s status.';
	
	function StateDisplay (options) {
		
		this.id = options.id;
		
		this.fieldset = {
			legend: 'Player Status'
		};
		
		this.root = null;
		this.table = new Table();
	}
	
	// TODO: Write a proper INIT method
	StateDisplay.prototype.init = function () {};
	
	StateDisplay.prototype.getRoot = function () {
		return this.root;
	};
	
	
	StateDisplay.prototype.append = function (root) {
		var that = this;
		var PREF = this.id + '_';
		
		var idFieldset = PREF + 'fieldset';
		var idPlayer = PREF + 'player';
		var idState = PREF + 'state'; 
			
		var checkPlayerName = setInterval(function(idState,idPlayer){
			if (node.player !== null){
				clearInterval(checkPlayerName);
				that.updateAll();
			}
		}, 100);
	
		root.appendChild(this.table.table);
		this.root = root;
		return root;
		
	};
	
	StateDisplay.prototype.updateAll = function() {
		this.table.clear(true);
		this.table.addRow(['Name: ', node.player.name]);
		this.table.addRow(['State: ', new GameState(node.state).toString()]);
		this.table.addRow(['Id: ', node.player.id]);
		this.table.parse();
		
	};
	
	StateDisplay.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		var IN =  node.IN;
		var OUT = node.OUT;
		
		node.on( 'STATECHANGE', function() {
			that.updateAll(node.state);
		}); 
	}; 
	
})(node.window.widgets);
(function (exports) {

	var GameState = node.GameState;
	var PlayerList = node.PlayerList;
	var Table = node.window.Table;
	var HTMLRenderer = node.window.HTMLRenderer;
	
	/*!
	* DynamicTable
	* 
	* Show the memory state of the game
	*/
	
	DynamicTable.prototype = new Table();
	DynamicTable.prototype.constructor = Table;	
	
	exports.DynamicTable = DynamicTable;
	
	DynamicTable.id = 'dynamictable';
	DynamicTable.name = 'Dynamic Table';
	DynamicTable.version = '0.3.1';
	
	DynamicTable.dependencies = {
		Table: {},
		JSUS: {},
		HTMLRenderer: {}
	};
	
	function DynamicTable (options, data) {
		//JSUS.extend(node.window.Table,this);
		Table.call(this, options, data);
		this.options = options;
		this.id = options.id;
		this.name = options.name || 'Dynamic Table';
		this.fieldset = { legend: this.name,
							id: this.id + '_fieldset'
		};
		
		this.root = null;
		this.bindings = {};
		this.init(this.options);
	}
	
	DynamicTable.prototype.init = function (options) {
		this.options = options;
		this.name = options.name || this.name;
		this.auto_update = ('undefined' !== typeof options.auto_update) ? options.auto_update : true;
		this.replace = options.replace || false;
		this.htmlRenderer = new HTMLRenderer({renderers: options.renderers});
		this.c('state', GameState.compare);
		this.setLeft([]);
		this.parse(true);
	};
		
	DynamicTable.prototype.bind = function (event, bindings) {
		if (!event || !bindings) return;
		var that = this;

		node.on(event, function(msg) {
			
			if (bindings.x || bindings.y) {
				// Cell
				var func;
				if (that.replace) {
					func = function (x, y) {
						var found = that.get(x,y);
						if (found.length !== 0) {
							for (var ci=0; ci < found.length; ci++) {
								bindings.cell.call(that, msg, found[ci]);
							}
						}
						else {
							var cell = bindings.cell.call(that, msg, new Table.Cell({x: x, y: y}));
							that.add(cell);
						}
					};
				}
				else {
					func = function (x, y) {
						var cell = bindings.cell.call(that, msg, new Table.Cell({x: x, y: y}));
						that.add(cell, x, y);
					};
				}
				
				var x = bindings.x.call(that, msg);
				var y = bindings.y.call(that, msg);
				
				if (x && y) {
					
					x = (x instanceof Array) ? x : [x];
					y = (y instanceof Array) ? y : [y];
					
//					console.log('Bindings found:');
//					console.log(x);
//					console.log(y);
					
					for (var xi=0; xi < x.length; xi++) {
						for (var yi=0; yi < y.length; yi++) {
							// Replace or Add
							func.call(that, x[xi], y[yi]);
						}
					}
				}
				// End Cell
			}
			
			// Header
			if (bindings.header) {
				var h = bindings.header.call(that, msg);
				h = (h instanceof Array) ? h : [h];
				that.setHeader(h);
			}
			
			// Left
			if (bindings.left) {
				var l = bindings.left.call(that, msg);
				if (!JSUS.in_array(l, that.left)) {
					that.header.push(l);
				}
			}
			
			// Auto Update?
			if (that.auto_update) {
				that.parse();
			}
		});
		
	};

	DynamicTable.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.table);
		return root;
	};
	
	DynamicTable.prototype.listeners = function () {}; 

})(node.window.widgets);
(function (exports) {
	
	exports.GameBoard = GameBoard;
	
	GameState = node.GameState;
	PlayerList = node.PlayerList;
	
	GameBoard.id = 'gboard';
	GameBoard.name = 'GameBoard';
	GameBoard.version = '0.3.2';
	GameBoard.description = 'Offer a visual representation of the state of all players in the game.';
	
	function GameBoard (options) {
		
		this.id = options.id;
		
		this.board = null;
		this.root = null;
		
		this.noPlayers = 'No players connected...';
		
		this.fieldset = {
			legend: 'Game State'
		};
	}
	
	// TODO: Write a proper INIT method
	GameBoard.prototype.init = function () {};
	
	GameBoard.prototype.getRoot = function() {
		return this.root;
	};
	
	GameBoard.prototype.append = function (root) {
		this.root = root;
		this.board = node.window.addDiv(root, this.id);
		this.updateBoard(node.game.pl);
		return root;
	};
	
	GameBoard.prototype.listeners = function() {
		var that = this;
		
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		
		node.on('UPDATED_PLIST', function () {
			node.log('I Updating Board');
			that.updateBoard(node.game.pl);

		});
	};
	
	GameBoard.prototype.updateBoard = function (pl) {
		var that = this;
		that.board.innerHTML = 'Updating...';
		
		if (pl.length) {
			that.board.innerHTML = '';
			pl.forEach( function(p) {
				//node.log(p);
				var line = '[' + p.id + "|" + p.name + "]> \t"; 
				
				var pState = '(' +  p.state.round + ') ' + p.state.state + '.' + p.state.step; 
				pState += ' ';
				
				switch (p.state.is) {

					case GameState.iss.UNKNOWN:
						pState += '(unknown)';
						break;
						
					case GameState.iss.LOADING:
						pState += '(loading)';
						break;
						
					case GameState.iss.LOADED:
						pState += '(loaded)';
						break;
						
					case GameState.iss.PLAYING:
						pState += '(playing)';
						break;
					case GameState.iss.DONE:
						pState += '(done)';
						break;		
					default:
						pState += '('+p.state.is+')';
						break;		
				}
				
				if (p.state.paused) {
					pState += ' (P)';
				}
				
				that.board.innerHTML += line + pState +'\n<hr style="color: #CCC;"/>\n';
			});
		}
		else {
			that.board.innerHTML = that.noPlayers;
		}
	};
	
})(node.window.widgets);
(function (exports, JSUS) {
	
	var Table = node.window.Table;
	
	/**
	 * Expose constructor
	 */
	exports.ChernoffFaces = ChernoffFaces;
	exports.ChernoffFaces.FaceVector = FaceVector;
	exports.ChernoffFaces.FacePainter = FacePainter;
	
	
	ChernoffFaces.defaults = {};
	ChernoffFaces.defaults.canvas = {};
	ChernoffFaces.defaults.canvas.width = 100;
	ChernoffFaces.defaults.canvas.heigth = 100;
	
	ChernoffFaces.id = 'ChernoffFaces';
	ChernoffFaces.name = 'Chernoff Faces';
	ChernoffFaces.version = '0.3';
	ChernoffFaces.description = 'Display parametric data in the form of a Chernoff Face.'
	
	ChernoffFaces.dependencies = {
		JSUS: {},
		Table: {},
		Canvas: {},
		'Controls.Slider': {}
	};
	
	function ChernoffFaces (options) {
		this.options = options;
		this.id = options.id;
		this.table = new Table({id: 'cf_table'});
		this.root = options.root || document.createElement('div');
		this.root.id = this.id;
		
		this.sc = node.window.getWidget('Controls.Slider'); 	// Slider Controls
		this.fp = null; 	// Face Painter
		this.canvas = null;
		this.dims = null;	// width and height of the canvas

		this.change = 'CF_CHANGE';
		var that = this;
		this.changeFunc = function () {
			that.draw(that.sc.getAllValues());
		};
		
		this.features = null;
		this.controls = null;
		
		this.init(this.options);
	}
	
	ChernoffFaces.prototype.init = function (options) {
		var that = this;
		this.id = options.id || this.id;
		var PREF = this.id + '_';
		
		this.features = options.features || this.features || FaceVector.random();
		
		this.controls = ('undefined' !== typeof options.controls) ?  options.controls : true;
		
		var idCanvas = (options.idCanvas) ? options.idCanvas : PREF + 'canvas';
		var idButton = (options.idButton) ? options.idButton : PREF + 'button';

		this.dims = {
				width: (options.width) ? options.width : ChernoffFaces.defaults.canvas.width, 
				height:(options.height) ? options.height : ChernoffFaces.defaults.canvas.heigth
		};
		
		this.canvas = node.window.getCanvas(idCanvas, this.dims);
		this.fp = new FacePainter(this.canvas);		
		this.fp.draw(new FaceVector(this.features));
		
		var sc_options = {
			id: 'cf_controls',
			features: JSUS.mergeOnKey(FaceVector.defaults, this.features, 'value'),
			change: this.change,
			fieldset: {id: this.id + '_controls_fieldest', 
					   legend: this.controls.legend || 'Controls'
			},
			submit: 'Send'
		};
		
		this.sc = node.window.getWidget('Controls.Slider', sc_options);
		
		// Controls are always there, but may not be visible
		if (this.controls) {
			this.table.add(this.sc);
		}
		
		// Dealing with the onchange event
		if ('undefined' === typeof options.change) {	
			node.on(this.change, this.changeFunc); 
		} else {
			if (options.change) {
				node.on(options.change, this.changeFunc);
			}
			else {
				node.removeListener(this.change, this.changeFunc);
			}
			this.change = options.change;
		}
		
		
		this.table.add(this.canvas);
		this.table.parse();
		this.root.appendChild(this.table.table);
	};
	
	ChernoffFaces.prototype.getRoot = function() {
		return this.root;
	};
	
	ChernoffFaces.prototype.getCanvas = function() {
		return this.canvas;
	};
	
	ChernoffFaces.prototype.append = function (root) {
		root.appendChild(this.root);
		this.table.parse();
		return this.root;
	};
	
	ChernoffFaces.prototype.listeners = function () {};
	
	ChernoffFaces.prototype.draw = function (features) {
		if (!features) return;
		var fv = new FaceVector(features);
		this.fp.redraw(fv);
		// Without merging wrong values are passed as attributes
		this.sc.init({features: JSUS.mergeOnKey(FaceVector.defaults, features, 'value')});
		this.sc.refresh();
	};
	
	ChernoffFaces.prototype.getAllValues = function() {
		//if (this.sc) return this.sc.getAllValues();
		return this.fp.face;
	};
	
	ChernoffFaces.prototype.randomize = function() {
		var fv = FaceVector.random();
		this.fp.redraw(fv);
	
		var sc_options = {
				features: JSUS.mergeOnKey(FaceVector.defaults, fv, 'value'),
				change: this.change
		};
		this.sc.init(sc_options);
		this.sc.refresh();
	
		return true;
	};
	
	// FacePainter
	// The class that actually draws the faces on the Canvas
	function FacePainter (canvas, settings) {
			
		this.canvas = new node.window.Canvas(canvas);
		
		this.scaleX = canvas.width / ChernoffFaces.defaults.canvas.width;
		this.scaleY = canvas.height / ChernoffFaces.defaults.canvas.heigth;
	};
	
	//Draws a Chernoff face.
	FacePainter.prototype.draw = function (face, x, y) {
		if (!face) return;
		this.face = face;
		this.fit2Canvas(face);
		this.canvas.scale(face.scaleX, face.scaleY);
		
		//console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );
		
		var x = x || this.canvas.centerX;
		var y = y || this.canvas.centerY;
		
		this.drawHead(face, x, y);
			
		this.drawEyes(face, x, y);
	
		this.drawPupils(face, x, y);
	
		this.drawEyebrow(face, x, y);
	
		this.drawNose(face, x, y);
		
		this.drawMouth(face, x, y);
		
	};		
		
	FacePainter.prototype.redraw = function (face, x, y) {
		this.canvas.clear();
		this.draw(face,x,y);
	}
	
	FacePainter.prototype.scale = function (x, y) {
		this.canvas.scale(this.scaleX, this.scaleY);
	}
	
	// TODO: Improve. It eats a bit of the margins
	FacePainter.prototype.fit2Canvas = function(face) {
		if (!this.canvas) {
		console.log('No canvas found');
			return;
		}
		
		if (this.canvas.width > this.canvas.height) {
			var ratio = this.canvas.width / face.head_radius * face.head_scale_x;
		}
		else {
			var ratio = this.canvas.height / face.head_radius * face.head_scale_y;
		}
		
		face.scaleX = ratio / 2;
		face.scaleY = ratio / 2;
	}
	
	FacePainter.prototype.drawHead = function (face, x, y) {
		
		var radius = face.head_radius;
		
		this.canvas.drawOval({
					   x: x, 
					   y: y,
					   radius: radius,
					   scale_x: face.head_scale_x,
					   scale_y: face.head_scale_y,
					   color: face.color,
					   lineWidth: face.lineWidth
		});
	};
	
	FacePainter.prototype.drawEyes = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
		var spacing = face.eye_spacing;
			
		var radius = face.eye_radius;
		//console.log(face);
		this.canvas.drawOval({
						x: x - spacing,
						y: height,
						radius: radius,
						scale_x: face.eye_scale_x,
						scale_y: face.eye_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
						
		});
		//console.log(face);
		this.canvas.drawOval({
						x: x + spacing,
						y: height,
						radius: radius,
						scale_x: face.eye_scale_x,
						scale_y: face.eye_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	}
	
	FacePainter.prototype.drawPupils = function (face, x, y) {
			
		var radius = face.pupil_radius;
		var spacing = face.eye_spacing;
		var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
		
		this.canvas.drawOval({
						x: x - spacing,
						y: height,
						radius: radius,
						scale_x: face.pupil_scale_x,
						scale_y: face.pupil_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
		
		this.canvas.drawOval({
						x: x + spacing,
						y: height,
						radius: radius,
						scale_x: face.pupil_scale_x,
						scale_y: face.pupil_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	
	};
	
	FacePainter.prototype.drawEyebrow = function (face, x, y) {
		
		var height = FacePainter.computeEyebrowOffset(face,y);
		var spacing = face.eyebrow_spacing;
		var length = face.eyebrow_length;
		var angle = face.eyebrow_angle;
		
		this.canvas.drawLine({
						x: x - spacing,
						y: height,
						length: length,
						angle: angle,
						color: face.color,
						lineWidth: face.lineWidth
					
						
		});
		
		this.canvas.drawLine({
						x: x + spacing,
						y: height,
						length: 0-length,
						angle: -angle,	
						color: face.color,
						lineWidth: face.lineWidth
		});
		
	};
	
	FacePainter.prototype.drawNose = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
		var nastril_r_x = x + face.nose_width / 2;
		var nastril_r_y = height + face.nose_length;
		var nastril_l_x = nastril_r_x - face.nose_width;
		var nastril_l_y = nastril_r_y; 
		
		this.canvas.ctx.lineWidth = face.lineWidth;
		this.canvas.ctx.strokeStyle = face.color;
		
		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(x,height);
		this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
		this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
		//this.canvas.ctx.closePath();
		this.canvas.ctx.stroke();
		this.canvas.ctx.restore();
	
	};
			
	FacePainter.prototype.drawMouth = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
		var startX = x - face.mouth_width / 2;
	    var endX = x + face.mouth_width / 2;
		
		var top_y = height - face.mouth_top_y;
		var bottom_y = height + face.mouth_bottom_y;
		
		// Upper Lip
		this.canvas.ctx.moveTo(startX,height);
	    this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
	    this.canvas.ctx.stroke();
		
	    //Lower Lip
	    this.canvas.ctx.moveTo(startX,height);
	    this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
	    this.canvas.ctx.stroke();
	   
	};	
	
	
	//TODO Scaling ?
	FacePainter.computeFaceOffset = function (face, offset, y) {
		var y = y || 0;
		//var pos = y - face.head_radius * face.scaleY + face.head_radius * face.scaleY * 2 * offset;
		var pos = y - face.head_radius + face.head_radius * 2 * offset;
		//console.log('POS: ' + pos);
		return pos;
	};
	
	FacePainter.computeEyebrowOffset = function (face, y) {
		var y = y || 0;
		var eyemindistance = 2;
		return FacePainter.computeFaceOffset(face, face.eye_height, y) - eyemindistance - face.eyebrow_eyedistance;
	};
	
	
	/*!
	* 
	* A description of a Chernoff Face.
	*
	* This class packages the 11-dimensional vector of numbers from 0 through 1 that completely
	* describe a Chernoff face.  
	*
	*/

	
	FaceVector.defaults = {
			// Head
			head_radius: {
				// id can be specified otherwise is taken head_radius
				min: 10,
				max: 100,
				step: 0.01,
				value: 30,
				label: 'Face radius'
			},
			head_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 0.5,
				label: 'Scale head horizontally'
			},
			head_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale head vertically'
			},
			// Eye
			eye_height: {
				min: 0.1,
				max: 0.9,
				step: 0.01,
				value: 0.4,
				label: 'Eye height'
			},
			eye_radius: {
				min: 2,
				max: 30,
				step: 0.01,
				value: 5,
				label: 'Eye radius'
			},
			eye_spacing: {
				min: 0,
				max: 50,
				step: 0.01,
				value: 10,
				label: 'Eye spacing'
			},
			eye_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale eyes horizontally'
			},
			eye_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale eyes vertically'
			},
			// Pupil
			pupil_radius: {
				min: 1,
				max: 9,
				step: 0.01,
				value: 1,  //this.eye_radius;
				label: 'Pupil radius'
			},
			pupil_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale pupils horizontally'
			},
			pupil_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale pupils vertically'
			},
			// Eyebrow
			eyebrow_length: {
				min: 1,
				max: 30,
				step: 0.01,
				value: 10,
				label: 'Eyebrow length'
			},
			eyebrow_eyedistance: {
				min: 0.3,
				max: 10,
				step: 0.01,
				value: 3, // From the top of the eye
				label: 'Eyebrow from eye'
			},
			eyebrow_angle: {
				min: -2,
				max: 2,
				step: 0.01,
				value: -0.5,
				label: 'Eyebrow angle'
			},
			eyebrow_spacing: {
				min: 0,
				max: 20,
				step: 0.01,
				value: 5,
				label: 'Eyebrow spacing'
			},
			// Nose
			nose_height: {
				min: 0.4,
				max: 1,
				step: 0.01,
				value: 0.4,
				label: 'Nose height'
			},
			nose_length: {
				min: 0.2,
				max: 30,
				step: 0.01,
				value: 15,
				label: 'Nose length'
			},
			nose_width: {
				min: 0,
				max: 30,
				step: 0.01,
				value: 10,
				label: 'Nose width'
			},
			// Mouth
			mouth_height: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 0.75, 
				label: 'Mouth height'
			},
			mouth_width: {
				min: 2,
				max: 100,
				step: 0.01,
				value: 20,
				label: 'Mouth width'
			},
			mouth_top_y: {
				min: -10,
				max: 30,
				step: 0.01,
				value: -2,
				label: 'Upper lip'
			},
			mouth_bottom_y: {
				min: -10,
				max: 30,
				step: 0.01,
				value: 20,
				label: 'Lower lip'
			}					
	};
	
	//Constructs a random face vector.
	FaceVector.random = function () {
	  var out = {};
	  for (var key in FaceVector.defaults) {
	    if (FaceVector.defaults.hasOwnProperty(key)) {
	      if (!JSUS.in_array(key,['color','lineWidth','scaleX','scaleY'])) {
	        out[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
	      }
	    }
	  }
	  
	  out.scaleX = 1;
	  out.scaleY = 1;
	  
	  out.color = 'green';
	  out.lineWidth = 1; 
	  
	  return new FaceVector(out);
	};
	
	function FaceVector (faceVector) {
		  var faceVector = faceVector || {};

		this.scaleX = faceVector.scaleX || 1;
		this.scaleY = faceVector.scaleY || 1;


		this.color = faceVector.color || 'green';
		this.lineWidth = faceVector.lineWidth || 1;
		  
		  // Merge on key
		 for (var key in FaceVector.defaults) {
		   if (FaceVector.defaults.hasOwnProperty(key)){
		     if (faceVector.hasOwnProperty(key)){
		       this[key] = faceVector[key];
		     }
		     else {
		       this[key] = FaceVector.defaults[key].value;
		     }
		   }
		 }
		  
		};

	//Constructs a random face vector.
	FaceVector.prototype.shuffle = function () {
		for (var key in this) {
			if (this.hasOwnProperty(key)) {
				if (FaceVector.defaults.hasOwnProperty(key)) {
					if (key !== 'color') {
						this[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
						
					}
				}
			}
		}
	};
	
	//Computes the Euclidean distance between two FaceVectors.
	FaceVector.prototype.distance = function (face) {
		return FaceVector.distance(this,face);
	};
		
		
	FaceVector.distance = function (face1, face2) {
		var sum = 0.0;
		var diff;
		
		for (var key in face1) {
			if (face1.hasOwnProperty(key)) {
				diff = face1[key] - face2[key];
				sum = sum + diff * diff;
			}
		}
		
		return Math.sqrt(sum);
	};
	
	FaceVector.prototype.toString = function() {
		var out = 'Face: ';
		for (var key in this) {
			if (this.hasOwnProperty(key)) {
				out += key + ' ' + this[key];
			}
		};
		return out;
	};

})(node.window.widgets, node.JSUS);
(function (exports) {
	
	
	/*
	* EventButton
	* 
	* Sends DATA msgs
	* 
	*/
	
	exports.EventButton	= EventButton;
	
	JSUS = node.JSUS;
	
	EventButton.id = 'eventbutton';
	EventButton.name = 'Event Button';
	EventButton.version = '0.2';
	EventButton.dependencies = {
		JSUS: {}
	};
	
	function EventButton (options) {
		this.options = options;
		this.id = options.id;

		this.root = null;		// the parent element
		this.text = 'Send';
		this.button = document.createElement('button');
		this.callback = null;
		this.init(this.options);
	}
	
	EventButton.prototype.init = function (options) {
		options = options || this.options;
		this.button.id = options.id || this.id;
		var text = options.text || this.text;
		while (this.button.hasChildNodes()) {
			this.button.removeChild(this.button.firstChild);
		}
		this.button.appendChild(document.createTextNode(text));
		this.event = options.event || this.event;
		this.callback = options.callback || this.callback;
		var that = this;
		if (this.event) {
			// Emit Event only if callback is successful
			this.button.onclick = function() {
				var ok = true;
				if (this.callback){
					ok = options.callback.call(node.game);
				}
				if (ok) node.emit(that.event);
			};
		}
		
//		// Emit DONE only if callback is successful
//		this.button.onclick = function() {
//			var ok = true;
//			if (options.exec) ok = options.exec.call(node.game);
//			if (ok) node.emit(that.event);
//		}
	};
	
	EventButton.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.button);
		return root;	
	};
	
	EventButton.prototype.listeners = function () {};
		
	// Done Button

	exports.DoneButton = DoneButton;
	
	DoneButton.prototype.__proto__ = EventButton.prototype;
	DoneButton.prototype.constructor = DoneButton;
	
	DoneButton.id = 'donebutton';
	DoneButton.version = '0.1';
	DoneButton.name = 'Done Button';
	DoneButton.dependencies = {
		EventButton: {}
	};
	
	function DoneButton (options) {
		options.event = 'DONE';
		options.text = options.text || 'Done!';
		EventButton.call(this, options);
	}
	
})(node.window.widgets);
(function (exports, JSUS) {
	
	var Table = node.window.Table;
	
	/**
	* Expose constructor
	*/
	exports.ChernoffFaces = ChernoffFaces;
	exports.ChernoffFaces.FaceVector = FaceVector;
	exports.ChernoffFaces.FacePainter = FacePainter;
	
	
	ChernoffFaces.defaults = {};
	ChernoffFaces.defaults.canvas = {};
	ChernoffFaces.defaults.canvas.width = 100;
	ChernoffFaces.defaults.canvas.heigth = 100;
	
	ChernoffFaces.id = 'ChernoffFaces';
	ChernoffFaces.name = 'Chernoff Faces';
	ChernoffFaces.version = '0.3';
	ChernoffFaces.description = 'Display parametric data in the form of a Chernoff Face.';
	
	ChernoffFaces.dependencies = {
		JSUS: {},
		Table: {},
		Canvas: {},
		'Controls.Slider': {}
	};
	
	function ChernoffFaces (options) {
		this.options = options;
		this.id = options.id;
		this.table = new Table({id: 'cf_table'});
		this.root = options.root || document.createElement('div');
		this.root.id = this.id;
		
		this.sc = node.window.getWidget('Controls.Slider');	// Slider Controls
		this.fp = null;	// Face Painter
		this.canvas = null;
		this.dims = null;	// width and height of the canvas

		this.change = 'CF_CHANGE';
		var that = this;
		this.changeFunc = function () {
			that.draw(that.sc.getAllValues());
		};
		
		this.features = null;
		this.controls = null;
		
		this.init(this.options);
	}
	
	ChernoffFaces.prototype.init = function (options) {
		var that = this;
		this.id = options.id || this.id;
		var PREF = this.id + '_';
		
		this.features = options.features || this.features || FaceVector.random();
		
		this.controls = ('undefined' !== typeof options.controls) ?  options.controls : true;
		
		var idCanvas = (options.idCanvas) ? options.idCanvas : PREF + 'canvas';
		var idButton = (options.idButton) ? options.idButton : PREF + 'button';

		this.dims = {
				width: (options.width) ? options.width : ChernoffFaces.defaults.canvas.width, 
				height:(options.height) ? options.height : ChernoffFaces.defaults.canvas.heigth
		};
		
		this.canvas = node.window.getCanvas(idCanvas, this.dims);
		this.fp = new FacePainter(this.canvas);		
		this.fp.draw(new FaceVector(this.features));
		
		var sc_options = {
			id: 'cf_controls',
			features: JSUS.mergeOnKey(FaceVector.defaults, this.features, 'value'),
			change: this.change,
			fieldset: {id: this.id + '_controls_fieldest', 
						legend: this.controls.legend || 'Controls'
			},
			submit: 'Send'
		};
		
		this.sc = node.window.getWidget('Controls.Slider', sc_options);
		
		// Controls are always there, but may not be visible
		if (this.controls) {
			this.table.add(this.sc);
		}
		
		// Dealing with the onchange event
		if ('undefined' === typeof options.change) {	
			node.on(this.change, this.changeFunc); 
		} else {
			if (options.change) {
				node.on(options.change, this.changeFunc);
			}
			else {
				node.removeListener(this.change, this.changeFunc);
			}
			this.change = options.change;
		}
		
		
		this.table.add(this.canvas);
		this.table.parse();
		this.root.appendChild(this.table.table);
	};
	
	ChernoffFaces.prototype.getRoot = function() {
		return this.root;
	};
	
	ChernoffFaces.prototype.getCanvas = function() {
		return this.canvas;
	};
	
	ChernoffFaces.prototype.append = function (root) {
		root.appendChild(this.root);
		this.table.parse();
		return this.root;
	};
	
	ChernoffFaces.prototype.listeners = function () {};
	
	ChernoffFaces.prototype.draw = function (features) {
		if (!features) return;
		var fv = new FaceVector(features);
		this.fp.redraw(fv);
		// Without merging wrong values are passed as attributes
		this.sc.init({features: JSUS.mergeOnKey(FaceVector.defaults, features, 'value')});
		this.sc.refresh();
	};
	
	ChernoffFaces.prototype.getAllValues = function() {
		//if (this.sc) return this.sc.getAllValues();
		return this.fp.face;
	};
	
	ChernoffFaces.prototype.randomize = function() {
		var fv = FaceVector.random();
		this.fp.redraw(fv);
	
		var sc_options = {
				features: JSUS.mergeOnValue(FaceVector.defaults, fv),
				change: this.change
		};
		this.sc.init(sc_options);
		this.sc.refresh();
	
		return true;
	};
	
	// FacePainter
	// The class that actually draws the faces on the Canvas
	function FacePainter (canvas, settings) {
			
		this.canvas = new node.window.Canvas(canvas);
		
		this.scaleX = canvas.width / ChernoffFaces.defaults.canvas.width;
		this.scaleY = canvas.height / ChernoffFaces.defaults.canvas.heigth;
	}
	
	//Draws a Chernoff face.
	FacePainter.prototype.draw = function (face, x, y) {
		if (!face) return;
		this.face = face;
		this.fit2Canvas(face);
		this.canvas.scale(face.scaleX, face.scaleY);
		
		//console.log('Face Scale ' + face.scaleY + ' ' + face.scaleX );
		
		x = x || this.canvas.centerX;
		y = y || this.canvas.centerY;
		
		this.drawHead(face, x, y);
			
		this.drawEyes(face, x, y);
	
		this.drawPupils(face, x, y);
	
		this.drawEyebrow(face, x, y);
	
		this.drawNose(face, x, y);
		
		this.drawMouth(face, x, y);
		
	};		
		
	FacePainter.prototype.redraw = function (face, x, y) {
		this.canvas.clear();
		this.draw(face,x,y);
	};
	
	FacePainter.prototype.scale = function (x, y) {
		this.canvas.scale(this.scaleX, this.scaleY);
	};
	
	// TODO: Improve. It eats a bit of the margins
	FacePainter.prototype.fit2Canvas = function(face) {
		if (!this.canvas) {
		console.log('No canvas found');
			return;
		}
		
		var ration;
		if (this.canvas.width > this.canvas.height) {
			ratio = this.canvas.width / face.head_radius * face.head_scale_x;
		}
		else {
			ratio = this.canvas.height / face.head_radius * face.head_scale_y;
		}
		
		face.scaleX = ratio / 2;
		face.scaleY = ratio / 2;
	};
	
	FacePainter.prototype.drawHead = function (face, x, y) {
		
		var radius = face.head_radius;
		
		this.canvas.drawOval({
						x: x, 
						y: y,
						radius: radius,
						scale_x: face.head_scale_x,
						scale_y: face.head_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	};
	
	FacePainter.prototype.drawEyes = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
		var spacing = face.eye_spacing;
			
		var radius = face.eye_radius;
		//console.log(face);
		this.canvas.drawOval({
						x: x - spacing,
						y: height,
						radius: radius,
						scale_x: face.eye_scale_x,
						scale_y: face.eye_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
						
		});
		//console.log(face);
		this.canvas.drawOval({
						x: x + spacing,
						y: height,
						radius: radius,
						scale_x: face.eye_scale_x,
						scale_y: face.eye_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	};
	
	FacePainter.prototype.drawPupils = function (face, x, y) {
			
		var radius = face.pupil_radius;
		var spacing = face.eye_spacing;
		var height = FacePainter.computeFaceOffset(face, face.eye_height, y);
		
		this.canvas.drawOval({
						x: x - spacing,
						y: height,
						radius: radius,
						scale_x: face.pupil_scale_x,
						scale_y: face.pupil_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
		
		this.canvas.drawOval({
						x: x + spacing,
						y: height,
						radius: radius,
						scale_x: face.pupil_scale_x,
						scale_y: face.pupil_scale_y,
						color: face.color,
						lineWidth: face.lineWidth
		});
	
	};
	
	FacePainter.prototype.drawEyebrow = function (face, x, y) {
		
		var height = FacePainter.computeEyebrowOffset(face,y);
		var spacing = face.eyebrow_spacing;
		var length = face.eyebrow_length;
		var angle = face.eyebrow_angle;
		
		this.canvas.drawLine({
						x: x - spacing,
						y: height,
						length: length,
						angle: angle,
						color: face.color,
						lineWidth: face.lineWidth
					
						
		});
		
		this.canvas.drawLine({
						x: x + spacing,
						y: height,
						length: 0-length,
						angle: -angle,	
						color: face.color,
						lineWidth: face.lineWidth
		});
		
	};
	
	FacePainter.prototype.drawNose = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.nose_height, y);
		var nastril_r_x = x + face.nose_width / 2;
		var nastril_r_y = height + face.nose_length;
		var nastril_l_x = nastril_r_x - face.nose_width;
		var nastril_l_y = nastril_r_y; 
		
		this.canvas.ctx.lineWidth = face.lineWidth;
		this.canvas.ctx.strokeStyle = face.color;
		
		this.canvas.ctx.save();
		this.canvas.ctx.beginPath();
		this.canvas.ctx.moveTo(x,height);
		this.canvas.ctx.lineTo(nastril_r_x,nastril_r_y);
		this.canvas.ctx.lineTo(nastril_l_x,nastril_l_y);
		//this.canvas.ctx.closePath();
		this.canvas.ctx.stroke();
		this.canvas.ctx.restore();
	
	};
			
	FacePainter.prototype.drawMouth = function (face, x, y) {
		
		var height = FacePainter.computeFaceOffset(face, face.mouth_height, y);
		var startX = x - face.mouth_width / 2;
		var endX = x + face.mouth_width / 2;
		
		var top_y = height - face.mouth_top_y;
		var bottom_y = height + face.mouth_bottom_y;
		
		// Upper Lip
		this.canvas.ctx.moveTo(startX,height);
		this.canvas.ctx.quadraticCurveTo(x, top_y, endX, height);
		this.canvas.ctx.stroke();
		
		//Lower Lip
		this.canvas.ctx.moveTo(startX,height);
		this.canvas.ctx.quadraticCurveTo(x, bottom_y, endX, height);
		this.canvas.ctx.stroke();
	
	};	
	
	
	//TODO Scaling ?
	FacePainter.computeFaceOffset = function (face, offset, y) {
		y = y || 0;
		//var pos = y - face.head_radius * face.scaleY + face.head_radius * face.scaleY * 2 * offset;
		var pos = y - face.head_radius + face.head_radius * 2 * offset;
		//console.log('POS: ' + pos);
		return pos;
	};
	
	FacePainter.computeEyebrowOffset = function (face, y) {
		y = y || 0;
		var eyemindistance = 2;
		return FacePainter.computeFaceOffset(face, face.eye_height, y) - eyemindistance - face.eyebrow_eyedistance;
	};
	
	
	/*!
	* 
	* A description of a Chernoff Face.
	*
	* This class packages the 11-dimensional vector of numbers from 0 through 1 that completely
	* describe a Chernoff face.  
	*
	*/

	
	FaceVector.defaults = {
			// Head
			head_radius: {
				// id can be specified otherwise is taken head_radius
				min: 10,
				max: 100,
				step: 0.01,
				value: 30,
				label: 'Face radius'
			},
			head_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 0.5,
				label: 'Scale head horizontally'
			},
			head_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale head vertically'
			},
			// Eye
			eye_height: {
				min: 0.1,
				max: 0.9,
				step: 0.01,
				value: 0.4,
				label: 'Eye height'
			},
			eye_radius: {
				min: 2,
				max: 30,
				step: 0.01,
				value: 5,
				label: 'Eye radius'
			},
			eye_spacing: {
				min: 0,
				max: 50,
				step: 0.01,
				value: 10,
				label: 'Eye spacing'
			},
			eye_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale eyes horizontally'
			},
			eye_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale eyes vertically'
			},
			// Pupil
			pupil_radius: {
				min: 1,
				max: 9,
				step: 0.01,
				value: 1,  //this.eye_radius;
				label: 'Pupil radius'
			},
			pupil_scale_x: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale pupils horizontally'
			},
			pupil_scale_y: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 1,
				label: 'Scale pupils vertically'
			},
			// Eyebrow
			eyebrow_length: {
				min: 1,
				max: 30,
				step: 0.01,
				value: 10,
				label: 'Eyebrow length'
			},
			eyebrow_eyedistance: {
				min: 0.3,
				max: 10,
				step: 0.01,
				value: 3, // From the top of the eye
				label: 'Eyebrow from eye'
			},
			eyebrow_angle: {
				min: -2,
				max: 2,
				step: 0.01,
				value: -0.5,
				label: 'Eyebrow angle'
			},
			eyebrow_spacing: {
				min: 0,
				max: 20,
				step: 0.01,
				value: 5,
				label: 'Eyebrow spacing'
			},
			// Nose
			nose_height: {
				min: 0.4,
				max: 1,
				step: 0.01,
				value: 0.4,
				label: 'Nose height'
			},
			nose_length: {
				min: 0.2,
				max: 30,
				step: 0.01,
				value: 15,
				label: 'Nose length'
			},
			nose_width: {
				min: 0,
				max: 30,
				step: 0.01,
				value: 10,
				label: 'Nose width'
			},
			// Mouth
			mouth_height: {
				min: 0.2,
				max: 2,
				step: 0.01,
				value: 0.75, 
				label: 'Mouth height'
			},
			mouth_width: {
				min: 2,
				max: 100,
				step: 0.01,
				value: 20,
				label: 'Mouth width'
			},
			mouth_top_y: {
				min: -10,
				max: 30,
				step: 0.01,
				value: -2,
				label: 'Upper lip'
			},
			mouth_bottom_y: {
				min: -10,
				max: 30,
				step: 0.01,
				value: 20,
				label: 'Lower lip'
			}					
	};
	
	//Constructs a random face vector.
	FaceVector.random = function () {
		var out = {};
		for (var key in FaceVector.defaults) {
			if (FaceVector.defaults.hasOwnProperty(key)) {
				if (!JSUS.in_array(key,['color','lineWidth','scaleX','scaleY'])) {
					out[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
				}
			}
		}
	
		out.scaleX = 1;
		out.scaleY = 1;
		
		out.color = 'green';
		out.lineWidth = 1; 
		
		return new FaceVector(out);
	};
	
	function FaceVector (faceVector) {
		faceVector = faceVector || {};

		this.scaleX = faceVector.scaleX || 1;
		this.scaleY = faceVector.scaleY || 1;


		this.color = faceVector.color || 'green';
		this.lineWidth = faceVector.lineWidth || 1;
		
		// Merge on key
		for (var key in FaceVector.defaults) {
			if (FaceVector.defaults.hasOwnProperty(key)){
				if (faceVector.hasOwnProperty(key)){
					this[key] = faceVector[key];
				}
				else {
					this[key] = FaceVector.defaults[key].value;
				}
			}
		}
		
	}

	//Constructs a random face vector.
	FaceVector.prototype.shuffle = function () {
		for (var key in this) {
			if (this.hasOwnProperty(key)) {
				if (FaceVector.defaults.hasOwnProperty(key)) {
					if (key !== 'color') {
						this[key] = FaceVector.defaults[key].min + Math.random() * FaceVector.defaults[key].max;
						
					}
				}
			}
		}
	};
	
	//Computes the Euclidean distance between two FaceVectors.
	FaceVector.prototype.distance = function (face) {
		return FaceVector.distance(this,face);
	};
		
		
	FaceVector.distance = function (face1, face2) {
		var sum = 0.0;
		var diff;
		
		for (var key in face1) {
			if (face1.hasOwnProperty(key)) {
				diff = face1[key] - face2[key];
				sum = sum + diff * diff;
			}
		}
		
		return Math.sqrt(sum);
	};
	
	FaceVector.prototype.toString = function() {
		var out = 'Face: ';
		for (var key in this) {
			if (this.hasOwnProperty(key)) {
				out += key + ' ' + this[key];
			}
		}
		return out;
	};

})(node.window.widgets, node.JSUS);
(function (exports) {

	exports.GameSummary	= GameSummary;
	
	GameSummary.id = 'gamesummary';
	GameSummary.name = 'Game Summary';
	GameSummary.version = '0.3';
	GameSummary.description = 'Show the general configuration options of the game.';
	
	function GameSummary(options) {
		
		this.game = node.game;
		this.id = options.id;
		
		this.fieldset = {
			legend: 'Game Summary'
		};
		this.summaryDiv = null;
	}
	
	// TODO: Write a proper INIT method
	GameSummary.prototype.init = function () {};
	
	GameSummary.prototype.append = function (root) {
		this.root = root;
		this.summaryDiv = node.window.addDiv(root);
		this.writeSummary();
		return root;
	};
	
	GameSummary.prototype.getRoot = function () {
		return this.root;
	};
	
	GameSummary.prototype.writeSummary = function (idState, idSummary) {
		var gName = document.createTextNode('Name: ' + this.game.name);
		var gDescr = document.createTextNode('Descr: ' + this.game.description);
		var gMinP = document.createTextNode('Min Pl.: ' + this.game.minPlayers);
		var gMaxP = document.createTextNode('Max Pl.: ' + this.game.maxPlayers);
		
		this.summaryDiv.appendChild(gName);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gDescr);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMinP);
		this.summaryDiv.appendChild(document.createElement('br'));
		this.summaryDiv.appendChild(gMaxP);
		
		node.window.addDiv(this.root, this.summaryDiv, idSummary);
	};
	
	GameSummary.prototype.listeners = function() {}; 

})(node.window.widgets);
(function (exports) {
	
	exports.MoneyTalks	= MoneyTalks;
	
	JSUS = node.JSUS;
	
	MoneyTalks.id = 'moneytalks';
	MoneyTalks.name = 'Money talks';
	MoneyTalks.version = '0.1.0';
	MoneyTalks.description = 'Display the earnings of a player.';
	
	MoneyTalks.dependencies = {
		JSUS: {},
	};
	
	
	function MoneyTalks (options) {
		this.id = MoneyTalks.id;
		
		this.fieldset = {legend: 'Earnings'};
		
		this.root = null;		// the parent element
		
		this.spanCurrency = document.createElement('span');
		this.spanMoney = document.createElement('span');
		
		this.currency = 'EUR';
		this.money = 0;
		this.precision = 2;
		this.init(options);
	}
	
	
	MoneyTalks.prototype.init = function (options) {
		this.currency = options.currency || this.currency;
		this.money = options.money || this.money;
		this.precision = options.precision || this.precision;
		
		this.spanCurrency.id = options.idCurrency || this.spanCurrency.id || 'moneytalks_currency';
		this.spanMoney.id = options.idMoney || this.spanMoney.id || 'moneytalks_money';
		
		this.spanCurrency.innerHTML = this.currency;
		this.spanMoney.innerHTML = this.money;
	};
	
	MoneyTalks.prototype.getRoot = function () {
		return this.root;
	};
	
	MoneyTalks.prototype.append = function (root, ids) {
		var PREF = this.id + '_';
		root.appendChild(this.spanMoney);
		root.appendChild(this.spanCurrency);
		return root;
	};
		
	MoneyTalks.prototype.listeners = function () {
		var that = this;
		node.on('MONEYTALKS', function(amount) {
			that.update(amount);
		}); 
	};
	
	MoneyTalks.prototype.update = function (amount) {
		if ('number' !== typeof amount) return;
		this.money += amount;
		this.spanMoney.innerHTML = this.money.toFixed(this.precision);
	};
	
})(node.window.widgets);
(function (exports) {

	var GameMsg = node.GameMsg;
	var Table = node.window.Table;
	
	exports.MsgBar	= MsgBar;
		
	MsgBar.id = 'msgbar';
	MsgBar.name = 'Msg Bar';
	MsgBar.version = '0.4';
	MsgBar.description = 'Send a nodeGame message to players';
	
	function MsgBar (options) {
		
		this.id = options.id;
		
		this.recipient = null;
		this.actionSel = null;
		this.targetSel = null;
		
		this.table = new Table();
		
		this.fieldset = {
			legend: 'Send MSG'
		};
		
		this.init();
	}
	
	// TODO: Write a proper INIT method
	MsgBar.prototype.init = function () {
		var that = this;
		var gm = new GameMsg();
		var y = 0;
		for (var i in gm) {
			if (gm.hasOwnProperty(i)) {
				var id = this.id + '_' + i;
				this.table.add(i, 0, y);
				this.table.add(node.window.getTextInput(id), 1, y);
				if (i === 'target') {
					this.targetSel = node.window.getTargetSelector(this.id + '_targets');
					this.table.add(this.targetSel, 2, y);
					
					this.targetSel.onchange = function () {
						node.window.getElementById(that.id + '_target').value = that.targetSel.value; 
					};
				}
				else if (i === 'action') {
					this.actionSel = node.window.getActionSelector(this.id + '_actions');
					this.table.add(this.actionSel, 2, y);
					this.actionSel.onchange = function () {
						node.window.getElementById(that.id + '_action').value = that.actionSel.value; 
					};
				}
				else if (i === 'to') {
					this.recipient = node.window.getRecipientSelector(this.id + 'recipients');
					this.table.add(this.recipient, 2, y);
					this.recipient.onchange = function () {
						node.window.getElementById(that.id + '_to').value = that.recipient.value; 
					};
				}
				y++;
			}
		}
		this.table.parse();
	};
	
	MsgBar.prototype.append = function (root) {
		
		var sendButton = node.window.addButton(root);
		var stubButton = node.window.addButton(root, 'stub', 'Add Stub');
		
		var that = this;
		sendButton.onclick = function() {
			// Should be within the range of valid values
			// but we should add a check
			
			var msg = that.parse();
			node.node.gsc.send(msg);
			//console.log(msg.stringify());
		};
		stubButton.onclick = function() {
			that.addStub();
		};
		
		root.appendChild(this.table.table);
		
		this.root = root;
		return root;
	};
	
	MsgBar.prototype.getRoot = function () {
		return this.root;
	};
	
	MsgBar.prototype.listeners = function () {
		var that = this;	
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient, msg.data);
		
		}); 
	};
	
	MsgBar.prototype.parse = function () {
		var msg = {};
		var that = this;
		var key = null;
		var value = null;
		this.table.forEach( function(e) {
			
				if (e.x === 0) {
					key = e.content;
					msg[key] = ''; 
				}
				else if (e.x === 1) {
					
					value = e.content.value;
					if (key === 'state' || key === 'data') {
						try {
							value = JSON.parse(e.content.value);
						}
						catch (ex) {
							value = e.content.value;
						}
					}
					
					msg[key] = value;
				}
		});
		console.log(msg);
		return new GameMsg(msg);
	};
	
	MsgBar.prototype.addStub = function () {
		node.window.getElementById(this.id + '_from').value = (node.player) ? node.player.id : 'undefined';
		node.window.getElementById(this.id + '_to').value = this.recipient.value;
		node.window.getElementById(this.id + '_forward').value = 0;
		node.window.getElementById(this.id + '_reliable').value = 1;
		node.window.getElementById(this.id + '_priority').value = 0;
		
		if (node.gsc && node.gsc.session) {
			node.window.getElementById(this.id + '_session').value = node.gsc.session;
		}
		
		node.window.getElementById(this.id + '_state').value = JSON.stringify(node.state);
		node.window.getElementById(this.id + '_action').value = this.actionSel.value;
		node.window.getElementById(this.id + '_target').value = this.targetSel.value;
		
	};
	
})(node.window.widgets);
(function (exports) {
	
	exports.VisualTimer	= VisualTimer;
	
	JSUS = node.JSUS;
	
	VisualTimer.id = 'visualtimer';
	VisualTimer.name = 'Visual Timer';
	VisualTimer.version = '0.3.3';
	VisualTimer.description = 'Display a timer for the game. Timer can trigger events. Only for countdown smaller than 1h.';
	
	VisualTimer.dependencies = {
		GameTimer : {},
		JSUS: {}
	};
	
	function VisualTimer (options) {
		this.options = options;
		this.id = options.id;

		this.gameTimer = null;
		
		this.timerDiv = null;	// the DIV in which to display the timer
		this.root = null;		// the parent element
		this.fieldset = {
						legend: 'Time left',
						id: this.id + '_fieldset'
		};
		
		this.init(this.options);
	}
	
	VisualTimer.prototype.init = function (options) {
		options = options || this.options;
		var that = this;
		(function initHooks() {
			if (options.hooks) {
				if (!options.hooks instanceof Array) {
					options.hooks = [options.hooks];
				}
			}
			else {
				options.hooks = [];
			}
			
			options.hooks.push({hook: that.updateDisplay,
								ctx: that
			});
		})();
		
		
		this.gameTimer = (options.gameTimer) || new node.GameTimer();
		
		if (this.gameTimer) {
			this.gameTimer.init(options);
		}
		else {
			node.log('GameTimer object could not be initialized. VisualTimer will not work properly.', 'ERR');
		}
		
		
	};
	
	VisualTimer.prototype.getRoot = function () {
		return this.root;
	};
	
	VisualTimer.prototype.append = function (root) {
		this.root = root;
		this.timerDiv = node.window.addDiv(root, this.id + '_div');
		this.updateDisplay();
		return root;	
	};
	
	VisualTimer.prototype.updateDisplay = function () {
		if (!this.gameTimer.milliseconds || this.gameTimer.milliseconds === 0) {
			this.timerDiv.innerHTML = '00:00';
			return;
		}
		var time = this.gameTimer.milliseconds - this.gameTimer.timePassed;
		time = JSUS.parseMilliseconds(time);
		var minutes = (time[2] < 10) ? '' + '0' + time[2] : time[2];
		var seconds = (time[3] < 10) ? '' + '0' + time[3] : time[3];
		this.timerDiv.innerHTML = minutes + ':' + seconds;
	};
	
	VisualTimer.prototype.start = function() {
		this.updateDisplay();
		this.gameTimer.start();
	};
	
	VisualTimer.prototype.restart = function (options) {
		this.init(options);
		this.start();
	};
	
	VisualTimer.prototype.stop = function (options) {
		this.gameTimer.stop();
	};
	
	VisualTimer.prototype.resume = function (options) {
		this.gameTimer.resume();
	};
		
	VisualTimer.prototype.listeners = function () {
		var that = this;
		node.on('LOADED', function() {
			var timer = node.game.gameLoop.getAllParams(node.game.gameState).timer;
			if (timer) {
				timer = JSUS.clone(timer);
				that.timerDiv.className = '';
				var options = {},
					typeoftimer = typeof timer; 
				switch (typeoftimer) {
				
					case 'number':
						options.milliseconds = timer;
						break;
					case 'object':
						options = timer;
						break;
					case 'function':
						options.milliseconds = timer
						break;
					case 'string':
						options.milliseconds = Number(timer);
						break;
				};
			
				if (!options.milliseconds) return;
			
				if ('function' === typeof options.milliseconds) {
					options.milliseconds = options.milliseconds.call(node.game);
				}
				
				if (!options.timeup) {
					options.timeup = 'DONE';
				}
				
				that.gameTimer.init(options);
				that.start();
			}
		});
		
		node.on('DONE', function() {
			// TODO: This should be enabled again
			that.gameTimer.stop();
			that.timerDiv.className = 'strike';
		});
	};
	
})(node.window.widgets);
(function (exports) {
	
	
	// TODO: Introduce rules for update: other vs self
	
	exports.NextPreviousState =	NextPreviousState;
	
	NextPreviousState.id = 'nextprevious';
	NextPreviousState.name = 'Next,Previous State';
	NextPreviousState.version = '0.3.1';
	NextPreviousState.description = 'Adds two buttons to push forward or rewind the state of the game by one step.';
		
	function NextPreviousState(options) {
		this.game = node.game;
		this.id = options.id || NextPreviousState.id;
		
		this.fieldset = {
			legend: 'Rew-Fwd'
		};
	}
	
	// TODO: Write a proper INIT method
	NextPreviousState.prototype.init = function () {};
	
	NextPreviousState.prototype.getRoot = function () {
		return this.root;
	};
	
	NextPreviousState.prototype.append = function (root) {
		var idRew = this.id + '_button';
		var idFwd = this.id + '_button';
		
		var rew = node.window.addButton(root, idRew, '<<');
		var fwd = node.window.addButton(root, idFwd, '>>');
		
		
		var that = this;
	
		var updateState = function (state) {
			if (state) {
				var stateEvent = node.IN + node.actions.SAY + '.STATE';
				var stateMsg = node.msg.createSTATE(stateEvent, state);
				// Self Update
				node.emit(stateEvent, stateMsg);
				
				// Update Others
				stateEvent = node.OUT + node.actions.SAY + '.STATE';
				node.emit(stateEvent, state, 'ALL');
			}
			else {
				node.log('No next/previous state. Not sent', 'ERR');
			}
		};
		
		fwd.onclick = function() {
			updateState(that.game.next());
		};
			
		rew.onclick = function() {
			updateState(that.game.previous());
		};
		
		this.root = root;
		return root;
	};
	
	NextPreviousState.prototype.listeners = function () {}; 

})(node.window.widgets);
(function (exports) {
	
	exports.Wall = Wall;
	
	var JSUS = node.JSUS;
	
	Wall.id = 'wall';
	Wall.name = 'Wall';
	Wall.version = '0.3';
	Wall.description = 'Intercepts all LOG events and prints them ';
	Wall.description += 'into a DIV element with an ordinal number and a timestamp.';
	
	Wall.dependencies = {
		JSUS: {}
	};
	
	function Wall (options) {
		this.id = options.id || Wall.id;
		this.name = options.name || this.name;
		this.buffer = [];
		this.counter = 0;

		this.wall = node.window.getElement('pre', this.id);
		
		this.fieldset = {
			legend: 'Game Log',
			id: this.id
		};
	}
	
	Wall.prototype.init = function (options) {
		options = options || {};
		this.counter = options.counter || this.counter;
	};
	
	Wall.prototype.append = function (root) {
		return root.appendChild(this.wall);
	};
	
	Wall.prototype.getRoot = function () {
		return this.wall;
	};
	
	Wall.prototype.listeners = function() {
		var that = this;	
		node.on('LOG', function (msg) {
			that.debuffer();
			that.write(msg);
		});
	}; 
	
	Wall.prototype.write = function (text) {
		if (document.readyState !== 'complete') {
			this.buffer.push(s);
		} else {
			var mark = this.counter++ + ') ' + JSUS.getTime() + ' ';
			this.wall.innerHTML = mark + text + "\n" + this.wall.innerHTML;
		}
	};

	Wall.prototype.debuffer = function () {
		if (document.readyState === 'complete' && this.buffer.length > 0) {
			for (var i=0; i < this.buffer.length; i++) {
				this.write(this.buffer[i]);
			}
			this.buffer = [];
		}
	};
	
})(node.window.widgets);
(function (exports) {

	var GameState = node.GameState;
	var PlayerList = node.PlayerList;
	
	/*!
	* GameTable
	* 
	* Show the memory state of the game
	*/
	
	exports.GameTable = GameTable;
	
	GameTable.id = 'gametable';
	GameTable.name = 'Game Table';
	GameTable.version = '0.2';
	
	GameTable.dependencies = {
		JSUS: {}
	};
	
	function GameTable (options) {
		this.options = options;
		this.id = options.id;
		this.name = options.name || GameTable.name;
		
		this.fieldset = { legend: this.name,
							id: this.id + '_fieldset'
		};
		
		this.root = null;
		this.gtbl = null;
		this.plist = null;
		
		this.init(this.options);
	}
	
	GameTable.prototype.init = function (options) {
		
		if (!this.plist) this.plist = new PlayerList();
		
		this.gtbl = new node.window.Table({
											auto_update: true,
											id: options.id || this.id,
											render: options.render
		}, node.game.memory.db);
		
		
		this.gtbl.c('state', GameState.compare);
		
		this.gtbl.setLeft([]);
		
//		if (this.gtbl.length === 0) {
//			this.gtbl.table.appendChild(document.createTextNode('Empty table'));
//		}
		
		this.gtbl.parse(true);
	};
	

	GameTable.prototype.addRenderer = function (func) {
		return this.gtbl.addRenderer(func);
	};
	
	GameTable.prototype.resetRender = function () {
		return this.gtbl.resetRenderer();
	};
	
	GameTable.prototype.removeRenderer = function (func) {
		return this.gtbl.removeRenderer(func);
	};
	
	GameTable.prototype.append = function (root) {
		this.root = root;
		root.appendChild(this.gtbl.table);
		return root;
	};
	
	GameTable.prototype.listeners = function () {
		var that = this;
		
		node.onPLIST(function(msg) {	
			if (!msg.data.length) return;
			
			//var diff = JSUS.arrayDiff(msg.data,that.plist.db);
			var plist = new PlayerList({}, msg.data);
			var diff = plist.diff(that.plist);
			if (diff) {
//				console.log('New Players found');
//				console.log(diff);
				diff.forEach(function(el){that.addPlayer(el);});
			}

			that.gtbl.parse(true);
		});
		
		node.on('in.set.DATA', function (msg) {

			that.addLeft(msg.state, msg.from);
			var x = that.player2x(msg.from);
			var y = that.state2y(node.game.state, msg.text);
			
			that.gtbl.add(msg.data, x, y);
			that.gtbl.parse(true);
		});
	}; 
	
	GameTable.prototype.addPlayer = function (player) {
		this.plist.add(player);
		var header = this.plist.map(function(el){return el.name;});
		this.gtbl.setHeader(header);
	};
	
	GameTable.prototype.addLeft = function (state, player) {
		if (!state) return;
		state = new GameState(state);
		if (!JSUS.in_array({content:state.toString(), type: 'left'}, this.gtbl.left)){
			this.gtbl.add2Left(state.toString());
		}
		// Is it a new display associated to the same state?
		else {
			var y = this.state2y(state);
			var x = this.player2x(player);
			if (this.gtbl.select('y','=',y).select('x','=',x).count() > 1) {
				this.gtbl.add2Left(state.toString());
			}
		}
			
	};
	
	GameTable.prototype.player2x = function (player) {
		if (!player) return false;
		return this.plist.select('id', '=', player).first().count;
	};
	
	GameTable.prototype.x2Player = function (x) {
		if (!x) return false;
		return this.plist.select('count', '=', x).first().count;
	};
	
	GameTable.prototype.state2y = function (state) {
		if (!state) return false;
		return node.game.gameLoop.indexOf(state);
	};
	
	GameTable.prototype.y2State = function (y) {
		if (!y) return false;
		return node.game.gameLoop.jumpTo(new GameState(),y);
	};
	
	

})(node.window.widgets);

(function (exports) {
	
	// TODO: Introduce rules for update: other vs self
	
	exports.StateBar = StateBar;	
	
	StateBar.id = 'statebar';
	StateBar.name = 'State Bar';
	StateBar.version = '0.3.1';
	StateBar.description = 'Provides a simple interface to change the state of the game.';
	
	function StateBar (options) {
		this.id = options.id;
		
		this.actionSel = null;
		this.recipient = null;
		
		this.fieldset = {
			legend: 'Change Game State'
		};
	}
	
	// TODO: Write a proper INIT method
	StateBar.prototype.init = function () {};
	
	StateBar.prototype.getRoot = function () {
		return this.root;
	};
	
	StateBar.prototype.append = function (root) {
		
		var PREF = this.id + '_';
		
		var idButton = PREF + 'sendButton';
		var idStateSel = PREF + 'stateSel';
		var idActionSel = PREF + 'actionSel';
		var idRecipient = PREF + 'recipient'; 
				
		var sendButton = node.window.addButton(root, idButton);
		var stateSel = node.window.addStateSelector(root, idStateSel);
		this.actionSel = node.window.addActionSelector(root, idActionSel);
		this.recipient = node.window.addRecipientSelector(root, idRecipient);
		
		var that = this;
	
		sendButton.onclick = function() {
	
			// Should be within the range of valid values
			// but we should add a check
			var to = that.recipient.value;
			
			//var parseState = /(\d+)(?:\.(\d+))?(?::(\d+))?/;
			//var parseState = /^\b\d+\.\b[\d+]?\b:[\d+)]?$/;
			//var parseState = /^(\d+)$/;
			//var parseState = /(\S+)?/;
			var parseState = /^(\d+)(?:\.(\d+))?(?::(\d+))?$/;
			
			var result = parseState.exec(stateSel.value);
			
			if (result !== null) {
				// Note: not result[0]!
				var state = result[1];
				var step = result[2] || 1;
				var round = result[3] || 1;
				console.log('Action: ' + that.actionSel.value + ' Parsed State: ' + result.join("|"));
				
				state = new node.GameState({
													state: state,
													step: step,
													round: round
				});
				
				var stateEvent;
				
				// Self Update
				if (to === 'ALL') {
					stateEvent = node.IN + node.actions.SAY + '.STATE';
					var stateMsg = node.msg.createSTATE(stateEvent, state);
					node.emit(stateEvent, stateMsg);
				}
				
				// Update Others
				stateEvent = node.OUT + that.actionSel.value + '.STATE';
				node.emit(stateEvent,state,to);
			}
			else {
				console.log('Not valid state. Not sent.');
				node.gsc.sendTXT('E: not valid state. Not sent');
			}
		};
		
		this.root = root;
		return root;
		
	};
	
	StateBar.prototype.listeners = function () {
		var that = this;
		var say = node.actions.SAY + '.';
		var set = node.actions.SET + '.';
		var get = node.actions.GET + '.'; 
		
		node.onPLIST( function(msg) {
			node.window.populateRecipientSelector(that.recipient,msg.data);
		}); 
	}; 
})(node.window.widgets);