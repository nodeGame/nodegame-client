/**
 * # nodeGame 
 * 
 * Social Experiments in the Browser
 * 
 * Copyright(c) 2012 Stefano Balietti
 * MIT Licensed 
 * 
 * nodeGame is a free, open source, event-driven javascript framework for on line, 
 * multiplayer games in the browser.
 * 
 */

(function () {
    
    // ## Loading libraries

    // ### Dependencies
    module.exports.JSUS = require('JSUS').JSUS;
    module.exports.support = module.exports.JSUS.compatibility();
    module.exports.NDDB = require('NDDB').NDDB;

    // Costants
    module.exports.constants = require('./lib/modules/variables');
    module.exports.stepRules = require('./lib/modules/stepRules');

    // Events
    module.exports.ErrorManager = require('./lib/core/ErrorManager').ErrorManager;
    module.exports.EventEmitterManager = require('./lib/core/EventEmitter').EventEmitterManager;
    module.exports.EventEmitter = require('./lib/core/EventEmitter').EventEmitter;

    // Core
    module.exports.GameStage = require('./lib/core/GameStage').GameStage;
    module.exports.PlayerList = require('./lib/core/PlayerList').PlayerList;
    module.exports.Player = require('./lib/core/PlayerList').Player;
    module.exports.GameMsg = require('./lib/core/GameMsg').GameMsg;
    module.exports.Stager = require('./lib/core/Stager').Stager;
    module.exports.GamePlot = require('./lib/core/GamePlot').GamePlot;
    module.exports.GameMsgGenerator = require('./lib/core/GameMsgGenerator').GameMsgGenerator;
    
    // Sockets
    module.exports.SocketFactory = require('./lib/core/SocketFactory').SocketFactory;
    module.exports.Socket = require('./lib/core/Socket').Socket;

    require('./lib/sockets/SocketIo.js');
    require('./lib/sockets/SocketDirect.js');

    // Game
    module.exports.GameDB = require('./lib/core/GameDB').GameDB;
    module.exports.GameBit = require('./lib/core/GameDB').GameBit;
    module.exports.Game = require('./lib/core/Game').Game;
    
    // Extra (to be tested)
    module.exports.GroupManager = require('./lib/core/GroupManager').GroupManager;
    module.exports.RoleMapper = require('./lib/core/RoleMapper').RoleMapper;
    module.exports.GameSession = require('./lib/core/Session').GameSession;

    // Addons
    module.exports.GameTimer = require('./addons/GameTimer').GameTimer;
    module.exports.TriggerManager = require('./addons/TriggerManager').TriggerManager;

    // FS
    module.exports.NodeGameFS = require('./lib/core/NodeGameFS').NodeGameFS;


    // Load main nodegame-client class    
    module.exports.NodeGameClient = require('./lib/core/NodeGameClient').NodeGameClient;
    
    // Load extensions to the prototype
    
    require('./lib/modules/log.js');
    require('./lib/modules/setup.js');
    require('./lib/modules/alias.js');
    require('./lib/modules/events.js');
    require('./lib/modules/connect.js');
    require('./lib/modules/player.js');
    require('./lib/modules/ssgd.js');
    require('./lib/modules/commands.js');
    require('./lib/modules/extra.js');
    
    require('./lib/modules/variables.js');
 
    
    // ### Loading Event listeners
    require('./listeners/incoming.js');
    require('./listeners/internal.js');
    
})();
