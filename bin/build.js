#!/usr/bin/env node

/**
 * # nodegame-client build script
 * 
 */

/**
 * Export build
 */

module.exports.build = build;

var smoosh = require('smoosh'),
    path = require('path'),
    J = require('JSUS').JSUS;

var pkg = require('../package.json'),
    version = pkg.version;

function build(options) {

	if (!options.bare && !options.JSUS && !options.NDDB && !options.shelf && !options.all && !options.cycle) {
		options.standard = true;
	}
	
	var out;
	
	if (options.output) {
		out = options.output;
	} 
	else if (options.addons_only) {
		out = "nodegame-addons";
	} 
	else if (options.es5_only) {
		out = "nodegame-es5";
	} 
	else if (options.window_only) {
		out = "nodegame-window";
	} 
	else if (options.widgets_only) {
		out = "nodegame-widgets";
	} 
	else {
		out = "nodegame-client";
	} 
	
	if (path.extname(out) === '.js') {
		out = path.basename(out, '.js');
	}
	
	console.log('Building nodeGame-client v.' + version + ' with:');

	// Defining variables

	var re = new RegExp('node_modules.+');

	var rootDir = path.resolve(__dirname, '..') + '/';
	var distDir =  rootDir + 'build/';

	// nodegame-client
	var ng_client = [
	 	rootDir + "index.js",
	 // lib
	 	rootDir + "lib/EventEmitter.js",
	 	rootDir + "lib/GameState.js",
	 	rootDir + "lib/PlayerList.js",
	 	rootDir + "lib/GameMsg.js",
	 	rootDir + "lib/GameLoop.js",
	 	rootDir + "lib/GameMsgGenerator.js",
	 	rootDir + "lib/GameSocketClient.js",
	 	rootDir + "lib/GameDB.js",
	 	rootDir + "lib/Game.js", 
	 		 	
	 // nodeGame
	 	rootDir + "nodeGame.js",
	 	
	 // listeners
	 	
	 	rootDir + "listeners/incoming.js",
	 	rootDir + "listeners/outgoing.js",
	 	rootDir + "listeners/internal.js",
	];

	// ng-addons
	var ng_addons = [           
	 	rootDir + "addons/GameTimer.js",
	 	rootDir + "addons/TriggerManager.js",
	 	rootDir + "addons/GameSession.js",
	 	rootDir + "addons/WaitingRoom.js",
	];

	// jsus
	var JSUSdir = J.resolveModuleDir('JSUS');
	
	var ng_jsus = [
		JSUSdir + "jsus.js",
		JSUSdir + "lib/array.js",
		JSUSdir + "lib/dom.js",
		JSUSdir + "lib/eval.js",
		JSUSdir + "lib/obj.js",
		JSUSdir + "lib/random.js",
		JSUSdir + "lib/time.js",
		JSUSdir + "lib/parse.js",
	];

	// nddb
	var NDDBdir = J.resolveModuleDir('NDDB', __dirname);
	var ng_nddb = [
		NDDBdir + "nddb.js",           
	];

	// nodegame-window
	var ngWdir = J.resolveModuleDir('nodegame-window', __dirname);
	
	var ng_window = [
		ngWdir + "build/nodegame-window.js",
	]; 
		
	// nodegame-widgets
	var ngWdgdir = J.resolveModuleDir('nodegame-widgets', __dirname);
	
	var ng_widgets = [
	    ngWdgdir + 'build/nodegame-widgets.js',
	                 
	];
	
	// es5-shim
	
	// es5-shim
	var es5Dir = J.resolveModuleDir('es5-shim',__dirname);
	var ng_es5 = [
	  es5Dir + "es5-shim.js",       
	];

	//shelf.js
	var shelfDir = J.resolveModuleDir('shelf.js', __dirname);
	var ng_shelf = [
	  shelfDir + "/build/shelf.js",
	];
	
	// CREATING build array
	var files = [];

	// 0. ES5-shim
	if (options.es5 || options.es5_only) {
		if (!path.existsSync(es5Dir)) {
			console.log('  - ERR: es5-shim not found!');
		}
		else {
			console.log('  - es5-shim');
			files = files.concat(ng_es5);
		}
		
	}
	
	// 0. Shelf.js
	if (options.shelf || options.all) {
		if (!path.existsSync(shelfDir)) {
			console.log('  - ERR: shelf.js not found!');
		}
		else {
			var shelfjs = shelfDir + 'build/shelf.js';
			// Build custom shelf.js if not existing
			if (!path.existsSync(shelfjs)) {
				var shelfjs_build = shelfDir + 'bin/build.js';
				console.log("\n  - building custom shelf.js")
				var buildShelf = require(shelfjs_build);
				buildShelf.build({cycle: true});
				
				// building shelf.js FS as well
				buildShelf.build({
					lib: ['fs'],
					output: "shelf-fs",
					cycle: true,
				});
			}
			
			console.log('  - shelf.js');
			files = files.concat(ng_shelf);
		}
	}
	
	
	// 1. JSUS
	if (options.JSUS || options.all || options.standard) {
		console.log('  - JSUS');
		files = files.concat(ng_jsus);
	}

	// 2. NDDB
	if (options.NDDB || options.all || options.standard) {
		console.log('  - NDDB');
		files = files.concat(ng_nddb);
	}
	 
	// 3. nodegame-client core: always built
	console.log('  - nodegame-client core');
	files = files.concat(ng_client);

	// 4. nodegame-client addons
	if (options.addons || options.all || options.addons_only || options.standard) {
		console.log('  - nodegame-client addons');
		files = files.concat(ng_addons);
	}

	// 5. nodegame-window
	if (options.window || options.all) {
		if (!path.existsSync(ngWdir)) {
			console.log('  - ERR: nodegame-window not found!');
		}
		else {
			console.log('  - nodegame-window');
			
			// Build custom shelf.js if not existing
			if (!path.existsSync(ngWdir + 'build/nodegame-window.js')) {
				var window_build = ngWdir + 'bin/build.js';
				console.log("\n  - building custom nodegame-window.js")
				var buildWindow = require(window_build);
				buildWindow.build({all: true});
			}
			
			files = files.concat(ng_window);
		}
		
	}

	//5. nodegame-widgets
	if (options.widgets || options.all) {
		if (!path.existsSync(ngWdgdir)) {
			console.log('  - ERR: nodegame-widgets not found!');
		}
		else {
			console.log('  - nodegame-widgets');
			
			// Build custom shelf.js if not existing
			if (!path.existsSync(ngWdgdir + 'build/nodegame-widgets.js')) {
				var widgets_build = ngWdgdir + 'bin/build.js';
				console.log("\n  - building custom nodegame-widgets.js")
				var buildWidgets = require(widgets_build);
				buildWidgets.build({all: true});
			}
			
			files = files.concat(ng_widgets);
		}
	}

	console.log("\n");
	
	// Configurations for file smooshing.
	var config = {
	    // VERSION : "0.0.1",
	    
	    // Use JSHINT to spot code irregularities.
	    JSHINT_OPTS: {
	        boss: true,
	        forin: true,
	        browser: true,
	    },
	    
	    JAVASCRIPT: {
	        DIST_DIR: '/' + distDir,
	    }
	};
	
	config.JAVASCRIPT[out] = files;

	var run_it = function(){
	    // https://github.com/fat/smoosh
		// hand over configurations made above
	    var smooshed = smoosh.config(config);
	    
	    // removes all files from the build folder
	    if (options.clean) {
	    	smooshed.clean();
	    }
	    
	    // builds both uncompressed and compressed files
	    smooshed.build(); 
	        
    	if (options.analyse) {
    		smooshed.run(); // runs jshint on full build
    		smooshed.analyze(); // analyzes everything
    	}

	    console.log('nodeGame-client build created!');
	}

	run_it();
}