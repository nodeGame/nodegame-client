#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander'),
    smoosh = require('smoosh'),
    os = require('os')
    pkg = require('../package.json'),
    version = pkg.version;

program
  .version(version)
  .usage('[options] <file ...>')
  .option('-J', '--JSUS', 'Build with JSUS')
  .option('-N', '--NDDB', 'Build with NDDB')
  .option('-W', '--window', 'Build with nodeGame-window')
  .option('-Wd', '--widgets', 'Build with nodeGame-widgets')
  .option('-Ad', '--addons', 'Build with addons')
  .option('-s', '--standard', 'Build with JSUS, NDDB, and addons')
  .option('-a, --all', 'Full build of nodeGame-client')
  .option('-d, --doc', 'Build doc')
   .parse(process.argv);


console.log('Building nodeGame-client v.' + version + ' with:');

// Defining variables

var re = new RegExp('node_modules.+');

var rootDir = __dirname + '/../';
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
];

// ng-addons
var ng_addons = [           
 	rootDir + "addons/GameTimer.js",
 	rootDir + "addons/TriggerManager.js",
 	rootDir + "addons/GameSession.js",
//  rootDir + "node_modules/nodegame-client/addons/WaitingRoom.js",
];

// jsus
var ng_jsus = [
	rootDir + "node_modules/JSUS/jsus.js",
	rootDir + "node_modules/JSUS/lib/array.js",
	rootDir + "node_modules/JSUS/lib/dom.js",
	rootDir + "node_modules/JSUS/lib/eval.js",
	rootDir + "node_modules/JSUS/lib/obj.js",
	rootDir + "node_modules/JSUS/lib/random.js",
	rootDir + "node_modules/JSUS/lib/time.js",
	rootDir + "node_modules/JSUS/lib/parse.js",
];

// nddb
var ng_nddb = [
	rootDir + "node_modules/NDDB/nddb.js",           
];

// nodegame-window
var ng_window = [
	rootDir + "node_modules/nodegame-window/GameWindow.js",
	rootDir + "node_modules/nodegame-window/Canvas.js",
	rootDir + "node_modules/nodegame-window/HTMLRenderer.js",
	rootDir + "node_modules/nodegame-window/List.js",
	rootDir + "node_modules/nodegame-window/Table.js",
]; 
	
 // nodegame-widgets
var ng_widgets = [
	rootDir + "node_modules/nodegame-widgets/ChernoffFaces.js",
	rootDir + "node_modules/nodegame-widgets/Controls.js",
	rootDir + "node_modules/nodegame-widgets/DataBar.js",
	rootDir + "node_modules/nodegame-widgets/DynamicTable.js",
	rootDir + "node_modules/nodegame-widgets/EventButton.js",
	rootDir + "node_modules/nodegame-widgets/GameBoard.js",
	rootDir + "node_modules/nodegame-widgets/GameSummary.js",
	rootDir + "node_modules/nodegame-widgets/GameTable.js",
	rootDir + "node_modules/nodegame-widgets/MsgBar.js",
	rootDir + "node_modules/nodegame-widgets/NDDBBrowser.js",
	rootDir + "node_modules/nodegame-widgets/NextPreviousState.js",
	rootDir + "node_modules/nodegame-widgets/ServerInfoDisplay.js",
	rootDir + "node_modules/nodegame-widgets/StateBar.js",
	rootDir + "node_modules/nodegame-widgets/StateDisplay.js",
	rootDir + "node_modules/nodegame-widgets/VisualState.js",
	rootDir + "node_modules/nodegame-widgets/VisualTimer.js",
	rootDir + "node_modules/nodegame-widgets/WaitScreen.js",
	rootDir + "node_modules/nodegame-widgets/Wall.js",
];


// CREATING build array
var files = [];

// 1. JSUS
if (program.JSUS || program.all || program.standard) {
	console.log('  - JSUS');
	files = files.concat(ng_jsus);
}

// 2. NDDB
if (program.NDDB || program.all || program.standard) {
	console.log('  - NDDB');
	files = files.concat(ng_nddb);
}
 
// 3. nodegame-client: always built
files = files.concat(ng_client);

// 4. addons
if (program.addons || program.all || program.standard) {
	console.log('  - addons');
	files = files.concat(ng_addons);
}

// 5. nodegame-window
if (program.window || program.all) {
	console.log('  - window');
	files = files.concat(ng_window);
}

//5. nodegame-widgets
if (program.widgets || program.all) {
	console.log('  - widgets');
	files = files.concat(ng_widgets);
}


console.log(files.length)

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
        
        "nodegame": files
    }
};

var run_it = function(){
    // Smooshing callback chain
    // More information on how it behaves can be found in the smoosh Readme https://github.com/fat/smoosh
    smoosh
        .config(config) // hand over configurations made above
        // .clean() // removes all files out of the nodegame folder
        .run() // runs jshint on full build
        .build() // builds both uncompressed and compressed files
        .analyze(); // analyzes everything

    console.log('nodegame.js created');
}

run_it();