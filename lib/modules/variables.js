/**
 * # Variables
 *
 * Copyright(c) 2013 Stefano Balietti
 * MIT Licensed
 *
 * `nodeGame` variables and constants module
 * ---
 */
(function(node) {

    "use strict";

    // ## Constants

    var k = node.constants = {};

    // ### version
    k.version = '1.0.0-beta';

    /**
     * ### node.constants.verbosity_levels
     *
     * ALWAYS, ERR, WARN, INFO, DEBUG
     */
    k.verbosity_levels = {
        ALWAYS: -(Number.MIN_VALUE + 1),
        ERR: -1,
        WARN: 0,
        INFO: 1,
        SILLY: 10,
        DEBUG: 100,
        NEVER: Number.MIN_VALUE - 1
    };

    // TODO: do we need these defaults ?

    /**
     *  ### node.constants.verbosity
     *
     *  The minimum level for a log entry to be displayed as output
     *
     *  Defaults, only errors are displayed.
     *
     */
    k.verbosity = k.verbosity_levels.WARN;

    /**
     * ### node.constants.remoteVerbosity
     *
     *  The minimum level for a log entry to be reported to the server
     *
     *  Defaults, only errors are displayed.
     */
    k.remoteVerbosity = k.verbosity_levels.WARN;

    /**
     * ### node.constants.actions
     *
     * Collection of available nodeGame actions
     *
     * The action adds an initial semantic meaning to the
     * message. It specify the nature of requests
     * "Why the message was sent?"
     *
     * Semantics:
     *
     * - SET: Store / changes the value of a property in the receiver of the msg
     * - GET: Asks the value value of a property to the receiver of the msg
     * - SAY: Announces a change of state or property in the sender of the msg
     */
    k.action = {};

    k.action.SET = 'set';
    k.action.GET = 'get';
    k.action.SAY = 'say';

    /**
     * ### node.constants.target
     *
     * Collection of available nodeGame targets
     *
     * The target adds an additional level of semantic
     * for the message, and specifies the nature of the
     * information carried in the message.
     *
     * It answers the question: "What is the content of the message?"
     */
    k.target = {};

    // #### target.DATA
    // Generic identifier for any type of data
    k.target.DATA = 'DATA';

    // #### target.HI
    // A client is connecting for the first time
    k.target.HI = 'HI';

    // #### target.PCONNECT
    // A new client just connected to the player endpoint
    k.target.PCONNECT = 'PCONNECT';

    // #### target.PDISCONNECT
    // A client that just disconnected from the player endpoint
    k.target.PDISCONNECT = 'PDISCONNECT';

    // #### target.PRECONNECT
    // A previously disconnected client just re-connected to the player endpoint
    k.target.PRECONNECT = 'PRECONNECT';

    // #### target.MCONNECT
    // A client that just connected to the admin (monitor) endpoint
    k.target.MCONNECT = 'MCONNECT';

    // #### target.MDISCONNECT
    // A client just disconnected from the admin (monitor) endpoint
    k.target.MDISCONNECT = 'MDISCONNECT';

    // #### target.MRECONNECT
    // A previously disconnected client just re-connected to the admin endpoint
    k.target.MRECONNECT = 'MRECONNECT';

    // #### target.PLIST
    // The list of clients connected to the player endpoint was updated
    k.target.PLIST = 'PLIST';

    // #### target.MLIST
    // The list of clients connected to the admin (monitor) endpoint was updated
    k.target.MLIST = 'MLIST';

    // #### target.PLAYER_UPDATE
    // A client updates his Player object
    k.target.PLAYER_UPDATE = 'PLAYER_UPDATE';

    // #### target.STAGE
    // A client notifies his own stage
    k.target.STAGE = 'STAGE';

    // #### target.STAGE_LEVEL
    // A client notifies his own stage level
    k.target.STAGE_LEVEL = 'STAGE_LEVEL';

    // #### target.REDIRECT
    // Redirects a client to a new uri
    k.target.REDIRECT = 'REDIRECT';

    // #### target.SETUP
    // Asks a client update its configuration
    k.target.SETUP = 'SETUP';

    // #### target.GAMECOMMAND
    // Ask a client to start/pause/stop/resume the game
    k.target.GAMECOMMAND = 'GAMECOMMAND';

    // #### target.JOIN
    // Asks a client to join another channel/subchannel/room
    k.target.JOIN = 'JOIN';

    // #### target.LOG
    // A log entry
    k.target.LOG = 'LOG';

    //#### not used targets (for future development)

    k.target.TXT  = 'TXT';    // Text msg

    // Still to implement
    k.target.BYE  = 'BYE';    // Force disconnects
    k.target.ACK  = 'ACK';    // A reliable msg was received correctly

    k.target.WARN = 'WARN';   // To do.
    k.target.ERR  = 'ERR';    // To do.


    // ### node.constants.gamecommands
    k.gamecommands = {
        start: 'start',
        pause: 'pause',
        resume: 'resume',
        stop: 'stop',
        restart: 'restart',
        step: 'step',
        goto_stage: 'goto_stage'
    };

    /**
     * ### Direction
     *
     * Distiguishes between incoming and outgoing messages
     *
     * - node.constants.IN
     * - node.constants.OUT
     */
    k.IN  = 'in.';
    k.OUT = 'out.';

    /**
     * ### node.constants.stateLevels
     *
     * Levels associated with the states of the Game
     */
    k.stateLevels = {
        UNINITIALIZED:  0,  // creating the game object
        STARTING:       1,  // constructor executed
        INITIALIZING:   2,  // calling game's init
        INITIALIZED:    5,  // init executed
        STAGE_INIT:    10,  // calling stage's init
        STEP_INIT:     20,  // calling step's init
        PLAYING_STEP:  30,  // executing step
        FINISHING:     40,  // calling game's gameover
        GAMEOVER:     100,  // game complete
        RUNTIME_ERROR: -1
    };

    /**
     * ### node.constants.stageLevels
     *
     * Levels associated with the states of the stages of the Game
     */
    k.stageLevels = {
        UNINITIALIZED:       0,  // Constructor called.
        INITIALIZING:        1,  // Executing init.
        INITIALIZED:         5,  // Init executed.
        EXECUTING_CALLBACK:  30, // Executing the stage callback.
        CALLBACK_EXECUTED:   40, // Stage callback executed.
        LOADED:              45, // Both GameWindow loaded and cb executed.
        PLAYING:             50, // Player playing.
        PAUSING:             55,  // to be removed
        PAUSED:              60,  // to be removed
        RESUMING:            65,
        RESUMED:             70,
        DONE:                100 // Player completed the stage
    };

    /**
     * ### node.constants.stageLevels
     *
     * Levels associated with the states of the stages of the Game
     */
    k.windowLevels = {
        UNINITIALIZED:  0, // GameWindow constructor called
        INITIALIZING:   1, // Executing init.
        INITIALIZED:    5, // Init executed.
        LOADING:       30, // Loading a new Frame.
        LOADED:        40, // Frame Loaded.
        LOCKING:       50, // The screen is about to be locked. 
        LOCKED:        60, // The screen is locked.
        UNLOCKING:     65  // The screen is about to be unlocked.
    };

    /**
     * ### node.constants.UNDEFINED_PLAYER
     *
     * Undefined player ID
     */
    k.UNDEFINED_PLAYER = -1;


     /**
     * ### node.constants.verbosity_levels
     *
     * The level of updates that the server receives about the state of a game
     *
     * - ALL: all stateLevel, stageLevel, and gameStage updates
     * - MOST: all stageLevel and gameStage updates
     * - REGULAR: only stageLevel PLAYING and DONE, and all gameStage updates
     * - MODERATE: only gameStage updates (might not work for multiplayer games)
     * - NONE: no updates. The same as observer.
     */
    k.publish_levels = {
        ALL: 4,
        MOST: 3,
        REGULAR: 2,
        FEW: 1,
        NONE: 0
    };

})('undefined' != typeof node ? node : module.exports);
