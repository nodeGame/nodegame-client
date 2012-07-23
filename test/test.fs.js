var util = require('util'),
	fs = require('fs'),
	path = require('path'),
	should = require('should'),
	csv = require('ya-csv'),
	J = require('JSUS').JSUS;


var node = module.exports.node = require('./../index.js');

node.verbosity = 10;
node.game = new node.Game();

var PlayerList = node.PlayerList;
var Player = node.Player;

var test_player = null,
	player = new Player ({
		id: 1,
		sid: 1,
		count: 1,
		name: 'Ste',
		state: {round: 1},
		ip:	'1.2.3.4',
	}),
	player2 = new Player ({
		id: 2,
		sid: 2,
		count: 2,
		name: 'Ste2',
		state: {round: 1},
		ip:	'1.2.3.5',
	}),
	player3 = new Player ({
		id: 3,
		sid: 3,
		count: 3,
		name: 'Ste3',
		state: {round: 1},
		ip:	'1.2.3.6',
	}),
	player4 = new Player ({
		id: 4,
		sid: 4,
		count: 4,
		name: 'Ste4',
		state: {round: 1},
		ip:	'1.2.3.7',
	});
	
var items = [
	 {
		 painter: "Jesus",
		 title: "Tea in the desert",
		 year: 0,
	 },
     {
         painter: "Dali",
         title: "Portrait of Paul Eluard",
         year: 1929,
         portrait: true
     },
     {
         painter: "Dali",
         title: "Barcelonese Mannequin",
         year: 1927
     },
     {
         painter: "Monet",
         title: "Water Lilies",
         year: 1906
     },
     {
         painter: "Monet",
         title: "Wheatstacks (End of Summer)",
         year: 1891
     },
     {
         painter: "Manet",
         title: "Olympia",
         year: 1863
     },          
];


// Check if pl2 == pl1
function samePlayer(pl1, pl2) {
	pl2.should.exist;
	pl2.name.should.equal(pl1.name);
	pl2.id.should.equal(pl1.id);
};

var deleteIfExist = function(file) {
	file = file || filename;
	if (path.existsSync(file)) {
		var stats = fs.lstatSync(file);
		if (stats.isDirectory()) {
			fs.rmdir(file, function (err) {
				if (err) throw err;  
			});
		}
		else {
			fs.unlink(file, function (err) {
				if (err) throw err;  
			});
		}
		
	}
};

var checkCsvFile = function (check) {
	check = check || {};
	var file = check.filename || filename;
	path.existsSync(file).should.be.true;
	
	var reader = csv.createCsvFileReader(filename, {
	    'separator': ',',
	    'quote': '"',
	    'escape': '"',       
	    'comment': ''
	});
	
	var read = [];
	reader.addListener('data', function(data) {
	    read.push(data);
	});
	reader.addListener('end', function(data) {
		if (check.headers) {
			read[0].should.be.eql(check.headers);
		}
		
	    if (check.csv_length) {
	    	read.length.should.be.eql(check.csv_length);
	    }
	    
	    if (check.items) {
	    	for (var i = 0; i < check.items.length; i++) {
	    		if (!J.isArray(check.items[i])) {
	    			check.items[i] = J.obj2Array(check.items[i]);	    		
	    		}
	    		stringifyValues(check.items[i]);
	    		read[(check.headers) ? i+1 : i].should.be.eql(check.items[i]);
	    	}
	    }
	    
	});
};

var stringifyValues = function (o) {
	for (var i in o) {
		if (o.hasOwnProperty(i)) {
			o[i] = '' + o[i];
		}
	}
};

var createDirIfNotExists = function (dir) {
	if (!path.existsSync(dir)) {
		fs.mkdir(dir, 0777, function(err) {
			if (err) console.log(err);
			return (err) ? false : true;
		})
	}
};

var filename, headers, csv_length, item;

describe('FS operations', function() {
	
	describe('#node.game.pl.dump()', function() {
		before(function() {
			filename = './pl.csv';
			deleteIfExist();
			node.game.pl.add(player);
			node.game.pl.dump(filename);
		});
		after(function() {
			deleteIfExist();
		});
		it('should dump the list of players with headers', function() {
			checkCsvFile({
				csv_length: 2,
				headers: J.keys(node.game.pl.first()),
				items: [player],
			});
		});
		
	});
	
	describe('#node.memory.dump()', function() {
		before(function() {
			filename = './memory.csv';
			deleteIfExist();
			node.game.memory.import(items);
		});
		afterEach(function() {
			deleteIfExist();
		});
		it('should dump the memory without headers', function() {
			node.memory.dump(filename);
			checkCsvFile({
				csv_length: items.length,
				items: items,
			});
		});
		it('should dump the memory with headers defined by user', function() {
			var headers = ['painter', 'title', 'year', 'portrait'];
			node.memory.dump(filename, {headers: headers});
			checkCsvFile({
				csv_length: items.length + 1,
				headers: headers,
				items: items,
			});
		});
		it('should dump the memory with headers (guessed)', function() {
			node.memory.dump(filename, {writeHeaders: true});
			checkCsvFile({
				csv_length: items.length + 1,
				headers: ['0', '1', '2'],
				items: items,
			});
		});
		
	});
	
	describe('#node.memory.dumpAllIndexes()', function() {
		before(function() {
			createDirIfNotExists('./tmp');
			node.game.memory.h('painter', function(p){
				return p.painter;
			});
			node.game.memory.import(items);
			node.memory.dumpAllIndexes('./tmp');
		});
		after(function() {
			deleteIfExist('./tmp');
		});
		it('should create csv files for index \'painter\'', function() {
//			for (var i=0; i< items.length) {
//				var item = items[i];
//				checkCsvFile({
//					csv_length: items.length,
//					filename: 
//					items: node.game.memory.select('painter',first(),
//		
//				})
//			}
			
		});
		
	});
});
