(function (node) {
	
	module.exports = node;
	
    /**
	 * Expose JSU
	 * 
	 * @api public
	 */

    node.JSUS = require('JSUS').JSUS;
	
	/**
	 * Expose NDDB
	 * 
	 * @api public
	 */
  	
    node.NDDB = require('NDDB').NDDB;
	
	/**
	 * Expose Socket.io-client
	 * 
	 * @api public
	 */

    node.io = require('socket.io-client');
	
	/**
	 * Expose EventEmitter
	 * 
	 * @api public
	 */

    node.EventEmitter = require('./lib/EventEmitter').EventEmitter;
    
    /**
	 * Expose GameState.
	 * 
	 * @api public
	 */

    node.GameState = require('./lib/GameState').GameState;

    /**
	 * Expose PlayerList.
	 * 
	 * @api public
	 */

    node.PlayerList = require('./lib/PlayerList').PlayerList;
    
    /**
	 * Expose Player.
	 * 
	 * @api public
	 */

    node.Player = require('./lib/PlayerList').Player;

    
    /**
	 * Expose GameMsg
	 * 
	 * @api public
	 */

     node.GameMsg = require('./lib/GameMsg').GameMsg;

    /**
	 * Expose GameLoop
	 * 
	 * @api public
	 */

    node.GameLoop = require('./lib/GameLoop').GameLoop;

    
    /**
	 * Expose GameMsgGenerator
	 * 
	 * @api public
	 */

    node.GameMsgGenerator = require('./lib/GameMsgGenerator').GameMsgGenerator;
    
    /**
	 * Expose GameSocketClient
	 * 
	 * @api public
	 */

    node.GameSocketClient = require('./lib/GameSocketClient').GameSocketClient;

    
    /**
	 * Expose GameDB
	 * 
	 * @api public
	 */

    node.GameDB = require('./lib/GameDB').GameDB;
    
    /**
	 * Expose GameBit
	 * 
	 * @api public
	 */

    node.GameBit = require('./lib/GameDB').GameBit;
    
    /**
	 * Expose Game
	 * 
	 * @api public
	 */

    node.Game = require('./lib/Game').Game;
    
    
    // ADDONS
    
    // TODO: add a method to scan the addons directory. Based on
	// configuration
    node.GameTimer = require('./addons/GameTimer').GameTimer;
    
    /**
	 * Expose TriggerManager
	 * 
	 * @api public
	 */
    node.TriggerManager = require('./addons/TriggerManager').TriggerManager;
    
    
    /**
	 * Expose GameSession
	 * 
	 * @api public
	 */
    require('./addons/GameSession').GameSession;
    
    
    
    /**
	 * Enable file system operations
	 */

    node.csv = {};
    node.fs = {};
    
    var fs = require('fs');
    var path = require('path');
    var csv = require('ya-csv');
    
    
    /**
	 * Takes an obj and write it down to a csv file;
	 */
    node.fs.writeCsv = function (path, obj) {
    	var writer = csv.createCsvStreamWriter(fs.createWriteStream( path, {'flags': 'a'}));
    	var i;
        for (i=0;i<obj.length;i++) {
    		writer.writeRecord(obj[i]);
    	}
    };
    
    node.memory.dump = function (path) {
		node.fs.writeCsv(path, node.game.memory.split().fetchValues());
    };
	
	
})('undefined' != typeof node ? node : module.parent.exports);
