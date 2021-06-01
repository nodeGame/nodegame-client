/**
 * # nodegame-client build file
 * Copyright(c) 2021 Stefano Balietti
 * MIT Licensed
 *
 * Builds the different components together in one file for the browser
 *
 * nodegame.org
 * ---
 */
(function(exports) {

    // ## Loading libraries

    // ### Dependencies.
    exports.JSUS = require('JSUS').JSUS;
    exports.support = exports.JSUS.compatibility();
    exports.NDDB = require('NDDB').NDDB;

    // Costants.
    exports.constants = require('./lib/modules/variables').constants;
    exports.stepRules = require('./lib/modules/stepRules').stepRules;

    // ErrorManager.
    require('./lib/core/ErrorManager');

    // Events.
    exports.EventEmitterManager =
        require('./lib/core/EventEmitter').EventEmitterManager;
    exports.EventEmitter = require('./lib/core/EventEmitter').EventEmitter;

    // Stager.
    exports.Stager = require('./lib/stager/stager_shared.js').Stager;
    exports.Block = require('./lib/stager/Block').Block;
    exports.Stager = require('./lib/stager/Stager').Stager;

    // Stager modules.

    // Must be required first.
    require('./lib/stager/stager_stages_steps.js');
    require('./lib/stager/stager_setters_getters.js');
    require('./lib/stager/stager_flexible');
    require('./lib/stager/stager_extends.js');
    require('./lib/stager/stager_blocks.js');
    require('./lib/stager/stager_extract_info.js');
    require('./lib/stager/stager_require.js');

    // Core.
    exports.GameStage = require('./lib/core/GameStage').GameStage;
    exports.PlayerList = require('./lib/core/PlayerList').PlayerList;
    exports.Player = require('./lib/core/PlayerList').Player;
    exports.GameMsg = require('./lib/core/GameMsg').GameMsg;
    exports.GamePlot = require('./lib/core/GamePlot').GamePlot;
    exports.GameMsgGenerator =
        require('./lib/core/GameMsgGenerator').GameMsgGenerator;
    exports.PushManager = require('./lib/core/PushManager').PushManager;
    exports.SizeManager = require('./lib/core/SizeManager').SizeManager;

    // Sockets.
    exports.SocketFactory = require('./lib/core/SocketFactory').SocketFactory;
    exports.Socket = require('./lib/core/Socket').Socket;

    require('./lib/sockets/SocketIo.js');
    require('./lib/sockets/SocketDirect.js');

    // Timer.
    exports.Timer = require('./lib/core/Timer').Timer;

    // Matcher.
    exports.Roler = require('./lib/matcher/Roler').Roler;
    exports.Matcher = require('./lib/matcher/Matcher').Matcher;
    exports.MatcherManager =
        require('./lib/matcher/MatcherManager').MatcherManager;
    //exports.GroupManager = require('./lib/matcher/GroupManager').GroupManager;

    // Game.
    exports.GameDB = require('./lib/core/GameDB').GameDB;
    exports.Game = require('./lib/core/Game').Game;

    // Extra (to be tested).
    exports.GameSession = require('./lib/core/Session').GameSession;

    // Addons
    exports.TriggerManager = require('./addons/TriggerManager').TriggerManager;

    // Load main nodegame-client class.
    exports.NodeGameClient =
        require('./lib/core/NodeGameClient').NodeGameClient;

    // Load extensions to the prototype.

    require('./lib/modules/log.js');
    require('./lib/modules/setup.js');
    require('./lib/modules/alias.js');
    require('./lib/modules/events.js');
    require('./lib/modules/connect.js');
    require('./lib/modules/player.js');
    require('./lib/modules/ssgd.js');
    require('./lib/modules/commands.js');
    require('./lib/modules/extra.js');
    require('./lib/modules/getJSON.js');

    require('./lib/modules/variables.js');


    // ### Loading Event listeners.
    require('./listeners/incoming.js');
    require('./listeners/internal.js');
    require('./listeners/setups.js');
    require('./listeners/aliases.js');


    exports.getClient = function() {
        var node;
        node = new exports.NodeGameClient();
        node.constants = exports.constants;
        node.stepRules = exports.stepRules;

        // TODO: find a good way to incorpare all the classes
        // TODO: should they use the new operator?
        node.Stager = exports.Stager;
        node.stepRules = exports.stepRules;

        return node;
    };

    exports.getStager = function(state) {
        return new exports.Stager(state);
    };

})(module.exports);
