#!/usr/bin/env node

/**
 * # nodegame-client make script
 * 
 */

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

module.exports.program = program;

var build = require('./build.js').build;


var rootDir = path.resolve(__dirname, '..') + '/';
var buildDir = rootDir + 'build/';

program
  .version(version);

program  
	.command('clean')
	.description('Removes all files from build folder')
	.action(function(){
		cleanDir(buildDir);
});

program  
	.command('build [options]')
	.description('Creates a nodegame-client custom build')
	.option('-B, --bare', 'bare naked nodegame-client (no dependencies)')
	.option('-J, --JSUS', 'with JSUS')
	.option('-N, --NDDB', 'with NDDB')
	.option('-W, --window', 'with nodeGame-window')
	.option('-w, --widgets', 'with nodeGame-widgets')
	.option('-d, --addons', 'with nodeGame-client addons')
	.option('-s, --shelf', 'with Shelf.js')
	.option('-e, --es5', 'with support for old browsers')
	.option('-a, --all', 'full build of nodeGame-client')
	.option('-C, --clean', 'clean build directory')
	.option('-A, --analyse', 'analyse build')
	.option('-o, --output <file>', 'output file (without .js)')
	.action(function(env, options){
		build(options);
});
		
program  
	.command('multibuild')
	.description('Creates pre-defined nodeGame builds')
	.action(function(){
		console.log('Multi-build for nodegame-client v.' + version);
		build({
			all: true,
			output: "nodegame-client-full",
		});
		build({
			bare: true,
			output: "nodegame-client-bare",
		});
		build({
			output: "nodegame-client",
		});
		
});

program
	.command('doc')
	.description('Builds documentation files')
	.action(function(){
		console.log('Building documentation for nodegame-client v.' + version);
		// http://nodejs.org/api.html#_child_processes
		var dockerDir = J.resolveModuleDir('docker');
		var command = dockerDir + 'docker -i ' + rootDir + ' index.js init.node.js nodeGame.js lib/ addons/ -o ' + rootDir + 'docs/';
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