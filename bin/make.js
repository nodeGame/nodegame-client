#!/usr/bin/env node

/**
 * # nodegame-client make script 
 */

if (!process.argv || !process.argv.length) {
    console.log('No input argument. Aborting');
    return;
}

var pathToMake = process.argv[1];

/**
 * Module dependencies.
 */

var program = require('commander'),
smoosh = require('smoosh'),
fs = require('fs'),
os = require('os')
util = require('util'),
exec = require('child_process').exec,
path = require('path'),
J = require('JSUS').JSUS;

var pkg = require('../package.json'),
version = pkg.version;

var build = require('./build.js').build,
build_support = require('./build.js').build_support;


var rootDir = path.resolve(__dirname, '..') + '/';
var buildDir = rootDir + 'build/';

function list(val) {
    return val.split(',');
}

function copyDirTo(subDir, targetDir) {
    
    var stats, inputDir;
    
    
    // INPUT DIR
    if (!subDir) {
	console.log('You must specify a subdirectory of the nodegame-client ' +
                    'root folder, or use * to select all');
	return;
    }
    
    if (subDir === '.') {
	inputDir = rootDir;
    }
    else {
	inputDir = rootDir + subDir;
    }
    
    inputDir = path.resolve(inputDir);

    if (!J.existsSync(inputDir)) {
	console.log(inputDir + ' does not exists');
	return false;
    }
    
    stats = fs.lstatSync(inputDir);
    if (!stats.isDirectory()) {
	console.log(inputDir + ' is not a directory');
	return false;
    }
    inputDir = inputDir + '/';
    
    // TARGET DIR
    if (!targetDir) {
	console.log('You must specify a target directory');
	return;
    }
    
    targetDir = path.resolve(targetDir);

    if (!J.existsSync(targetDir)) {
	console.log(targetDir + ' does not exists');
	return false;
    }
    
    stats = fs.lstatSync(targetDir);
    if (!stats.isDirectory()) {
	console.log(targetDir + ' is not a directory');
	return false;
    }
    
    targetDir = targetDir + '/';

    console.log('Syncinc ' + subDir + ' directory of nodegame-client v.' +
                version + ' with ' + targetDir);
    
    J.copyDirSyncRecursive(inputDir, targetDir);	
}


program
    .version(version);

program  
    .command('clean')
    .description('Removes all files from build folder')
    .action(function(){
	J.cleanDir(buildDir);
    });

program  
    .command('build-support [options]')
    .description('Creates a separate builds of nodegame-client support libraries')
    .option('-l, --lib <items>', 'choose libraries to build', list)
    .option('-a, --all', 'all support libraries')
    .option('-C, --clean', 'clean build directory')
    .option('-A, --analyse', 'analyse build')
    .option('-o, --output <file>', 'output file (without .js)')
    .action(function(env, options){
	build_support(options);
    });

program  
    .command('build [options]')
    .description('Creates a nodegame-client custom build')
    .option('-B, --bare', 'bare naked nodegame-client (no dependencies, no addons)')
    .option('-J, --JSUS', 'with JSUS')
    .option('-N, --NDDB', 'with NDDB')
    .option('-W, --window', 'with nodegame-window')
    .option('-w, --widgets', 'with nodegame-widgets')
    .option('-d, --addons', 'with nodegame-client addons')
    .option('-s, --shelf', 'with Shelf.js')
    .option('-e, --es5', 'with support for old browsers')
    .option('-a, --all', 'full build of nodeGame-client')
    .option('-C, --clean', 'clean build directory')
    .option('-A, --analyse', 'analyse build')
    .option('-o, --output <file>', 'output file (without .js)')
    .option('-y, --sync <path>', 'syncs the build directory with the specified path')
    .action(function(env, options){
	build(options);
	
	if (options.sync) {
	    copyDirTo('build/', options.sync);
	}
    });

program  
    .command('multibuild [options]')
    .description('Creates pre-defined nodeGame builds')
    .option('-y, --sync <path>', 'syncs the build directory with the specified path')
    .action(function(env, options){
	console.log('Multi-build for nodegame-client v.' + version);
	
	build({
	    all: true,
	    output: "nodegame-full",
	});
	build({
	    bare: true,
	    output: "nodegame-bare",
	});

	build({
	    output: "nodegame",
	});
	
        //		build_support({
        //			all: true,
        //		});
	
	if (options.sync) {
	    copyDirTo('build/', options.sync);
	}
    });

program  
    .command('sync <subdir>, <path>')
    .description('Sync the specified subdirectory of the nodegame-client ' +
                 'root tree with another target directory. If \'.\' is used ' +
                 'the whole tree will be synced.')
    .action(function(subdir, path) {
	copyDirTo(subdir, path);
    });


program
    .command('doc')
    .description('Builds documentation files')
    .action(function(){
	console.log('Building documentation for nodegame-client v.' + version);
	// http://nodejs.org/api.html#_child_processes
	try {
	    var dockerDir = J.resolveModuleDir('docker');
	}
	catch(e) {
	    console.log('module Docker not found. Cannot build doc. ' + 
                        'Do \'npm install docker\' to install it.');
	    return false;
	}

	var command = dockerDir + 'docker -i ' + rootDir + 
            ' index.js index.browser.js closure.browser.js lib/ listeners/ ' +
            'addons/ examples/ -o ' + rootDir + 'docs/';

	var child = exec(command, function(error, stdout, stderr) {
	    util.print(stdout);
	    util.print(stderr);
	    if (error !== null) {
		console.log('build error: ' + error);
	    }
	});
    });

//Parsing options
program.parse(process.argv);