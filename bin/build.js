#!/usr/bin/env node

//  # nodegame-client build script


module.exports.build = build;
module.exports.build_support = build_support;

var smoosh = require('smoosh'),
    fs = require('fs'),
    path = require('path'),
    J = require('JSUS').JSUS;

var pkg = require('../package.json'),
    version = pkg.version;

var rootDir = path.resolve(__dirname, '..') + '/';
var distDir =  rootDir + 'build/';


function loadTemplate(name) {
    return fs.readFileSync(
               path.join(__dirname, 'templates', name), 'utf-8');
}
function write(filePath, str, mode) {
    fs.writeFileSync(filePath, str, { mode: mode || 0666 });
}

// Create Version File
var indexFile = loadTemplate('index.browser.js');
indexFile = indexFile.replace('{VERSION}', "'" + version + "'");
write(rootDir + 'index.browser.js', indexFile);

// nodegame-client
var ng_client = [

    // First include.
    rootDir + "index.browser.js",

    // Constants.

    rootDir + "lib/modules/variables.js",
    rootDir + "lib/modules/stepRules.js",


    // Libs.

    rootDir + "lib/core/ErrorManager.js",
    rootDir + "lib/core/EventEmitter.js",
    rootDir + "lib/core/GameStage.js",
    rootDir + "lib/core/PlayerList.js",
    rootDir + "lib/core/GameMsg.js",
    rootDir + "lib/core/GamePlot.js",
    rootDir + "lib/core/GameMsgGenerator.js",
    rootDir + "lib/core/PushManager.js",
    rootDir + "lib/core/SizeManager.js",

    // Stager.

    rootDir + "lib/stager/stager_shared.js",
    rootDir + "lib/stager/Block.js",
    rootDir + "lib/stager/Stager.js",

    // Stager modules.

    rootDir + "lib/stager/stager_stages_steps.js",
    rootDir + "lib/stager/stager_setters_getters.js",
    rootDir + "lib/stager/stager_flexible.js",
    rootDir + "lib/stager/stager_extends.js",
    rootDir + "lib/stager/stager_blocks.js",
    rootDir + "lib/stager/stager_extract_info.js",

    // Sockets.

    rootDir + "lib/core/SocketFactory.js",
    rootDir + "lib/core/Socket.js",
    rootDir + "lib/sockets/SocketIo.js",

    // Matcher.

    // TODO: make it conditional!
    rootDir + "lib/matcher/Roler.js",
    rootDir + "lib/matcher/Matcher.js",
    rootDir + "lib/matcher/MatcherManager.js",
    // rootDir + "lib/matcher/GroupManager.js",

    rootDir + "lib/core/GameDB.js",
    rootDir + "lib/core/Game.js",

    // Not used for now.
    // rootDir + "lib/core/Session.js",


    rootDir + "lib/core/Timer.js",

    // Matcher.

    rootDir + "lib/matcher/Matcher.js",

    // NodeGameClient.

    rootDir + "lib/core/NodeGameClient.js",

    // Extending NodeGameClient prototype.

    rootDir + "lib/modules/log.js",
    rootDir + "lib/modules/setup.js",
    rootDir + "lib/modules/alias.js",
    rootDir + "lib/modules/connect.js",
    rootDir + "lib/modules/player.js",
    rootDir + "lib/modules/events.js",
    rootDir + "lib/modules/ssgd.js",
    rootDir + "lib/modules/commands.js",
    rootDir + "lib/modules/extra.js",
    rootDir + "lib/modules/getJSON.js",

    rootDir + "listeners/incoming.js",
    rootDir + "listeners/internal.js",
    rootDir + "listeners/setups.js",
    rootDir + "listeners/aliases.js",
];

// ng-addons
var ng_addons = [
    rootDir + "addons/TriggerManager.js"
];

// jsus
var JSUSdir = J.resolveModuleDir('JSUS', __dirname);

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
    // To add later.
    // NDDBdir + "lib/browser.js"
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

//shelf.js
var shelfDir = J.resolveModuleDir('shelf.js', __dirname);
var ng_shelf = [
    shelfDir + "/build/shelf-browser.js",
];

function build(options) {

    if (!options.bare && !options.JSUS && !options.NDDB && !options.shelf &&
        !options.all && !options.cycle && !options.only) {
        options.standard = true;
    }

    var out = options.output || "nodegame";

    console.log('Building nodeGame-client v.' + version + ' with:');

    // CREATING build array
    var files = [];

    // -1. IE - shim
    if (options.ie || options.all) {
        console.log('  - old IE support');
        files = files.concat(rootDir + 'ie.support.js');
    }

    // 0. Shelf.js
    if (options.shelf) {
        if (!J.existsSync(shelfDir)) {
            console.log('  - ERR: shelf.js not found!');
        }
        else {
            var shelfjs = shelfDir + 'build/shelf.js';
            // Build custom shelf.js if not existing
            if (!J.existsSync(shelfjs)) {
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


    // 1. J
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

    // 3.B closure
    files.push(rootDir + "closure.browser.js");


    // 5. nodegame-window
    if (options.window || options.all) {
        if (!J.existsSync(ngWdir)) {
            console.log('  - ERR: nodegame-window not found!');
        }
        else {
            console.log('  - nodegame-window');

            // Build custom window if not existing
            if (!J.existsSync(ngWdir + 'build/nodegame-window.js')) {
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
        if (!J.existsSync(ngWdgdir)) {
            console.log('  - ERR: nodegame-widgets not found!');
        }
        else {
            console.log('  - nodegame-widgets');

            // Build custom widgets.js if not existing
            if (!J.existsSync(ngWdgdir + 'build/nodegame-widgets.js')) {
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
        options.only = ['ie', 'shelf', 'jsus', 'nddb', 'addons', 'window',
                        'widgets'];
    }

    var library, out, files, i;
    for (i = 0; i < options.only.length; i++) {
        library = options.only[i];

        out = (options.output) ? options.output : "nodegame-" + library;

        console.log('Building support library: ');


        // CREATING build array
        files = [];

        switch (library) {


        case 'ie':
            console.log('  - old IE support');
            files = files.concat(rootDir + 'ie.support.js');
            break;

        case 'shelf':

            if (!J.existsSync(shelfDir)) {
                console.log('  - ERR: shelf.js not found!');
            }
            else {
                var shelfjs = shelfDir + 'build/shelf.js';
                // Build custom shelf.js if not existing
                if (!J.existsSync(shelfjs)) {
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

            if (!J.existsSync(ngWdir)) {
                console.log('  - ERR: nodegame-window not found!');
            }
            else {
                console.log('  - nodegame-window');

                // Build custom shelf.js if not existing
                if (!J.existsSync(ngWdir + 'build/nodegame-window.js')) {
                    var window_build = ngWdir + 'bin/build.js';
                    console.log("\n  - building custom nodegame-window.js")
                    var buildWindow = require(window_build);
                    buildWindow.build({all: true});
                }

                files = files.concat(ng_window);
            }
            break;


        case 'widgets':

            if (!J.existsSync(ngWdgdir)) {
                console.log('  - ERR: nodegame-widgets not found!');
            }
            else {
                console.log('  - nodegame-widgets');

                // Build custom shelf.js if not existing
                if (!J.existsSync(ngWdgdir + 'build/nodegame-widgets.js')) {
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
        out = (path.extname(conf.out) === '.js') ?
               path.basename(conf.out, '.js') : conf.out;


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
        //          smooshed.build();
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
