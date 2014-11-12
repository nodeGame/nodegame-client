//var util = require('util'),
//	fs = require('fs'),
//	path = require('path'),
//	should = require('should'),
//	csv = require('ya-csv'),
//	J = require('JSUS').JSUS;
//
//
//var node = module.exports.node = require('./../index.js');
//
//node.verbosity = 10;
//node.game = new node.Game();
//
//var PlayerList = node.PlayerList;
//var Player = node.Player;
//
//var test_player = null,
//	player = new Player ({
//		id: 1,
//		sid: 1,
//		count: 1,
//		name: 'Ste',
//		state: {round: 1},
//		ip:	'1.2.3.4',
//	}),
//	player2 = new Player ({
//		id: 2,
//		sid: 2,
//		count: 2,
//		name: 'Ste2',
//		state: {round: 1},
//		ip:	'1.2.3.5',
//	}),
//	player3 = new Player ({
//		id: 3,
//		sid: 3,
//		count: 3,
//		name: 'Ste3',
//		state: {round: 1},
//		ip:	'1.2.3.6',
//	}),
//	player4 = new Player ({
//		id: 4,
//		sid: 4,
//		count: 4,
//		name: 'Ste4',
//		state: {round: 1},
//		ip:	'1.2.3.7',
//	});
//
//var items = [
//	 {
//		 painter: "Jesus",
//		 title: "Tea in the desert",
//		 year: 0,
//	 },
//     {
//         painter: "Dali",
//         title: "Portrait of Paul Eluard",
//         year: 1929,
//         portrait: true
//     },
//     {
//         painter: "Dali",
//         title: "Barcelonese Mannequin",
//         year: 1927
//     },
//     {
//         painter: "Monet",
//         title: "Water Lilies",
//         year: 1906
//     },
//     {
//         painter: "Monet",
//         title: "Wheatstacks (End of Summer)",
//         year: 1891
//     },
//     {
//         painter: "Manet",
//         title: "Olympia",
//         year: 1863
//     },
//];
//
//var painters_list = ['Jesus', 'Dali', 'Monet', 'Manet'];
//
//
//// Check if pl2 == pl1
//function samePlayer(pl1, pl2) {
//	pl2.should.exist;
//	pl2.name.should.equal(pl1.name);
//	pl2.id.should.equal(pl1.id);
//};
//
////var deleteIfExists = function(file) {
////	file = file || filename;
////	if (J.existsSync(file)) {
////		var stats = fs.lstatSync(file);
////		if (stats.isDirectory()) {
////			fs.rmdirSync(file);
////		}
////		else {
////			fs.unlinkSync(file);
////		}
////
////	}
////};
//
//var deleteTestDir = function(dir, format) {
//	if (dir[dir.length] !== '/') dir = dir + '/';
//	fs.readdir(dir, function(err, files) {
//	    files.filter(function(file) { return file.substr(-(format.length + 1)) == '.' + format; })
//	         .forEach(function(file) { J.deleteIfExists(dir + file) });
//	    J.deleteIfExists(dir)
//	});
//
//}
//
//var checkCsvFile = function (check) {
//	check = check || {};
//	var file = check.filename || filename;
//
//	it('file should be found', function(){
//		J.existsSync(file).should.be.true;
//	});
//
//	var reader = csv.createCsvFileReader(file, {
//	    'separator': ',',
//	    'quote': '"',
//	    'escape': '"',
//	    'comment': ''
//	});
//
//	var read = [];
//	reader.addListener('data', function(data) {
////		console.log(data)
////		console.log('-')
//	    read.push(data);
//	});
//	reader.addListener('end', function(data) {
//		if (check.headers) {
//			read[0].should.be.eql(check.headers);
//		}
//
//	    if (check.csv_length) {
////	    	if (check.csv_length !== read.length) {
////		    	console.log(read)
////		    	console.log('--------')
////	    	}
//
//	    	read.length.should.be.eql(check.csv_length);
//	    }
//
//	    if (check.items) {
//	    	for (var i = 0; i < check.items.length; i++) {
//	    		if (!J.isArray(check.items[i])) {
//	    			check.items[i] = J.obj2Array(check.items[i]);
//	    		}
//	    		stringifyValues(check.items[i]);
//	    		read[(check.headers) ? i+1 : i].should.be.eql(check.items[i]);
//	    	}
//	    }
//
//	});
//};
//
//var checkJSONFile = function (check) {
//	check = check || {};
//	var file = check.filename || filename;
//
//	it('file should be found', function(){
//		J.existsSync(file).should.be.true;
//	});
//
//	var db = new NDDB();
//
//	db.load(file);
//
//
//	if (check.nitems) {
//	   db.length.should.be.eql(check.nitems);
//	}
//
//	if (check.items) {
//		for (var i = 0; i < check.items.length; i++) {
//			db.exists(check.items[i]).should.be.true;
//	    }
//	}
//};
//
//var stringifyValues = function (o) {
//	for (var i in o) {
//		if (o.hasOwnProperty(i)) {
//			o[i] = '' + o[i];
//		}
//	}
//};
//
//var createDirIfNotExists = function (dir) {
//	if (!J.existsSync(dir)) {
//		fs.mkdir(dir, 0777, function(err) {
//			if (err) console.log(err);
//			return (err) ? false : true;
//		})
//	}
//};
//
//var filename, headers, csv_length, item;
//
//// STRESS TEST
//for (var i=0; i<1; i++){
//
//describe('FS operations', function() {
//
//	describe('#node.game.pl.save()', function() {
//		before(function() {
//			filename = './pl.nddb';
//			J.deleteIfExists(filename);
//			node.game.pl.add(player);
//			node.game.pl.save(filename);
//		});
//		after(function() {
//			J.deleteIfExists(filename);
//		});
//
//		it('should return a player object', function() {
//			J.existsSync(filename).should.be.true;
//		});
//
//// We are not generating .csv files now
////		it('should dump the list of players with headers', function() {
////			checkCsvFile({
////				csv_length: 2,
////				headers: J.keys(node.game.pl.first()),
////				items: [player],
////			});
////		});
//
//	});
//
//	describe('#node.game.memory.toCsv()', function() {
//		before(function() {
//			filename = './memory.csv';
//			J.deleteIfExists(filename);
//			node.game.memory.importDB(items);
//		});
//		after(function() {
//			J.deleteIfExists('./withoutheaders.csv');
//			J.deleteIfExists('./withheaders.csv');
//			J.deleteIfExists('./withheadersguessed.csv');
//		});
//		it('should save the memory to a csv file without headers', function() {
//			var myFilename = 'withoutheaders.csv';
//			node.game.memory.toCsv(myFilename);
//			checkCsvFile({
//				csv_length: items.length,
//				items: items,
//				filename: myFilename
//			});
//		});
//		it('should dump the memory with headers defined by user', function() {
//			var headers = ['painter', 'title', 'year', 'portrait'];
//			var myFilename = 'withheaders.csv';
//			node.game.memory.toCsv(myFilename, {headers: headers});
//			checkCsvFile({
//				csv_length: items.length + 1,
//				headers: headers,
//				items: items,
//				filename: myFilename
//			});
//		});
//		it('should dump the memory with headers (guessed)', function() {
//			var myFilename = 'withheadersguessed.csv';
//			node.game.memory.toCsv(myFilename, {writeHeaders: true});
//			checkCsvFile({
//				csv_length: items.length + 1,
//				headers: ['0', '1', '2'],
//				items: items,
//				filename: myFilename
//			});
//		});
//
//	});
//
//	describe('#node.game.memory.saveAllIndexesToCsv()', function() {
//		before(function() {
//			createDirIfNotExists('./tmp_csv');
//			node.game.memory.h('painter', function(p){
//				return p.painter;
//			});
//			node.game.memory.importDB(items);
//			node.game.memory.saveAllIndexesToCsv('./tmp_csv');
//		});
//		after(function() {
//			deleteTestDir('./tmp_csv/', 'csv');
//		});
//
//		it('should create csv files for index \'painter\'', function() {
//			var painters = node.game.memory.painter;
//
//			J.size(painters).should.be.eql(painters_list.length);
//
//			for (var i=0; i< painters.length; i++) {
//				var p = painters[i].first();
//				checkCsvFile({
//					csv_length: painters[i].length,
//					filename: p.painter + '.csv',
//					items: painters[i].fetch()
//
//				})
//			}
//
//		});
//	});
//
//	describe('#node.game.memory.saveAllIndexes()', function() {
//		before(function() {
//			createDirIfNotExists('./tmp_json');
//			node.game.memory.h('painter', function(p){
//				return p.painter;
//			});
//			node.game.memory.importDB(items);
//			node.game.memory.saveAllIndexes('./tmp_json');
//		});
//		after(function() {
//			deleteTestDir('./tmp_json/', 'nddb');
//		});
//
//		it('should create csv files for index \'painter\'', function() {
//			var painters = node.game.memory.painter;
//
//			J.size(painters).should.be.eql(painters_list.length);
//
//			for (var i=0; i< painters.length; i++) {
//				var p = painters[i].first();
//				checkJSONFile({
//					nitems: painters[i].length,
//					filename: p.painter + '.nddb',
//					items: painters[i].fetch()
//
//				})
//			}
//
//		});
//	});
//
//
//});
//
//// END STRESS TEST
//}
