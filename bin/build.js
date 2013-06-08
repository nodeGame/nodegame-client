#!/usr/bin/env node

/**
 * # nodegame-client build script
 * 
 */

/**
 * Export build
 */

module.exports.build = build;
module.exports.build_support = build_support;

var smoosh = require('smoosh'),
    path = require('path'),
    J = require('JSUS').JSUS;

var pkg = require('../package.json'),
    version = pkg.version;


var rootDir = path.resolve(__dirname, '..') + '/';
var distDir =  rootDir + 'build/';

// nodegame-client
var ng_client = [
    rootDir + "index.js",
 	
 // modules
    rootDir + "lib/modules/log.js",
    rootDir + "lib/modules/variables.js",

 	
 // lib
    rootDir + "lib/core/ErrorManager.js",
    rootDir + "lib/core/EventEmitter.js",
    rootDir + "lib/core/GameStage.js",
    rootDir + "lib/core/PlayerList.js",
    rootDir + "lib/core/GameMsg.js",
    rootDir + "lib/core/Stager.js",
    rootDir + "lib/core/GameLoop.js",
    rootDir + "lib/core/GameMsgGenerator.js",
 	
    rootDir + "lib/core/SocketFactory.js",
    rootDir + "lib/core/Socket.js",
    
    rootDir + "lib/sockets/SocketIo.js",
    
    rootDir + "lib/core/GameDB.js",
    rootDir + "lib/core/Game.js", 
    rootDir + "lib/core/Session.js",
    
    rootDir + "lib/core/GroupManager.js",
    rootDir + "lib/core/RoleMapper.js",
 		 	
 // nodeGame
    rootDir + "lib/nodegame.js",
 	
 	
// modules
    rootDir + "lib/modules/setup.js",
    rootDir + "lib/modules/alias.js",
    rootDir + "lib/modules/random.js",
    rootDir + "lib/modules/stepper.js",
 	
// listeners
 	
    rootDir + "listeners/incoming.js",
    rootDir + "listeners/internal.js",
];

// ng-addons
var ng_addons = [           
    rootDir + "addons/GameTimer.js",
    rootDir + "addons/TriggerManager.js",
    // 	rootDir + "addons/GameSession.js",
    // 	rootDir + "addons/WaitingRoom.js",
];

// jsus
var JSUSdir = J.resolveModuleDir('JSUS');

var ng_jsus = [
	JSUSdir + "jsus.js",
	JSUSdir + "lib/compatibility.js",
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

function build(options) {

	if (!options.bare && !options.JSUS && !options.NDDB && !options.shelf && !options.all && !options.cycle && !options.only) {
		options.standard = true;
	}
	
	var out = options.output || "nodegame";
		
	console.log('Building nodeGame-client v.' + version + ' with:');

	// CREATING build array
	var files = [];

	// 0. ES5-shim
	if (options.es5) {
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
	if (options.addons || options.all || options.standard) {
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
	
	var conf = {
			text: 'nodeGame-client build created!',
			options: options,
			out: out,
			files: files,
	};
	
	smooshIt(conf);
}


function build_support(options) {
	
	if (options.all) {
		options.only = ['es5', 'shelf', 'jsus', 'nddb', 'addons', 'window', 'widgets'];
	}
	
	var library, out, files;
	for (var i = 0; i < options.only.length; i++) {
		library = options.only[i];
		
		out = (options.output) ? options.output : "nodegame-" + library;
		
		console.log('Building support library: ');


		// CREATING build array
		files = [];

		switch (library) {
		
		
		case 'es5': 
			if (!path.existsSync(es5Dir)) {
				console.log('  - ERR: es5-shim not found!');
			}
			else {
				console.log('  - es5-shim');
				files = files.concat(ng_es5);
			}
			break;
		
		case 'shelf':
		
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
			break;
			
		case 'jsus':
			console.log('  - JSUS');
			files = files.concat(ng_jsus);
			break;
	

	
		case 'nddb':
			
			console.log('  - NDDB');
			files = files.concat(ng_nddb);
			break;
		
		 
		case 'addons':
			
			console.log('  - nodegame-client addons');
			files = files.concat(ng_addons);
			break;
		
		case 'window':
			
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
			break;


		case 'widgets':
			
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
			break;
		}

		console.log("\n");
		

		var conf = {
				text: out + ' build created!',
				options: options,
				out: out,
				files: files,
		};
		
		smooshIt(conf);
	}
	
	console.log('All additional nodeGame libraries created');
}


function smooshIt(conf) {
	if (!conf) {
		console.log('Cannot smoosh empty conf object!');
		return false;
	}
	if (!conf.out) {
		console.log('Output file name missing. Aborting smooshing');
		return false;
	}
	if (!conf.files || !conf.files.length) {
		console.log('No files to smoosh. Aborting.');
		return false;
	}
	
	var text = conf.text || 'Build created!',
		options = conf.options || {},
		files = conf.files,
		out = (path.extname(conf.out) === '.js') ? path.basename(conf.out, '.js') 
												 : conf.out;
		
	
	// Configurations for file smooshing.
	var config = {
	   	    
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
//	    smooshed.build(); 
	    smooshed.build('uncompressed');
	        
    	if (options.analyse) {
    		smooshed.run(); // runs jshint on full build
    		smooshed.analyze(); // analyzes everything
    	}

	    console.log(text);
	    console.log("\n");
	}

	run_it();
};
