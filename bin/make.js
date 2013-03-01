#!/usr/bin/env node

/**
 * # nodegame-client make script
 * 
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

function copyBuildDirTo(targetDir) {
	
	if (!targetDir) {
		console.log('You must specify a target directory for the \'copyto\' command');
		return;
	}
	
	targetDir = path.resolve(targetDir);

	if (!fs.existsSync(targetDir)) {
		console.log(targetDir + ' does not exists');
		return false;
	}
	
	var stats = fs.lstatSync(targetDir);
	if (!stats.isDirectory()) {
		console.log(targetDir + ' is not a directory');
		return false;
	}
	
	targetDir = targetDir + '/';
	
	console.log('Copying build directory of nodegame-client v.' + version + ' to ' + targetDir);
	
	var result = J.copyFromDir(buildDir, targetDir);
	
	if (result) {
		console.log('Done');
		return true;
	} 
	else {
		console.log('An error has occurred');
		return false;
	}
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
	.option('-t, --copyto <path>', 'copies the build to the specified path')
	.action(function(env, options){
		build(options);
		
		if (options.copyto) {
			copyBuildDirTo(options.copyto);
		}
});
		
program  
	.command('multibuild [options]')
	.description('Creates pre-defined nodeGame builds')
	.option('-t, --copyto <path>', 'copies the build to the specified path')
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
		
		if (options.copyto) {
			copyBuildDirTo(options.copyto);
		}
});

program  
	.command('copyto <path>')
	.description('Copies all the content of the build directory into the specified target directory')
	.action(function(path) {
		copyBuildDirTo(path);
});


program
	.command('doc')
	.description('Builds documentation files')
	.action(function(){
		console.log('Building documentation for nodegame-client v.' + version);
		// http://nodejs.org/api.html#_child_processes
		try{
			var dockerDir = J.resolveModuleDir('docker');
		}
		catch(e) {
			console.log('module Docker not found. Cannot build doc. Do \'npm install docker\' to fix it.');
			return false;
		}
		var command = dockerDir + 'docker -i ' + rootDir + ' index.js init.node.js lib/ modules/ listeners/ addons/ examples/ -o ' + rootDir + 'docs/';
		var child = exec(command, function (error, stdout, stderr) {
			util.print(stdout);
			util.print(stderr);
			if (error !== null) {
				console.log('build error: ' + error);
			}
		});
});

//Parsing options
program.parse(process.argv);