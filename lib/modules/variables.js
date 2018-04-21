/**
 * # Variables
 * Copyright(c) 2017 Stefano Balietti <ste@nodegame.org>
 * MIT Licensed
 *
 * `nodeGame` variables and constants module
 */
(function(node) {

    "use strict";

    // ## Constants

    var k;
    k = node.constants = {};

    /**
     * ### node.constants.nodename
     *
     * Default nodename if none is specified
     *
     * @see node.setup.nodename
     */
    k.nodename = 'ng';

    /**
     * ### node.constants.verbosity_levels
     *
     * ALWAYS, ERR, WARN, INFO, DEBUG
     */
    k.verbosity_levels = {
        ALWAYS: -Number.MAX_VALUE,
        error: -1,
        warn: 0,
        info: 1,
        silly: 10,
        debug: 100,
        NEVER: Number.MAX_VALUE
    };

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

    // #### target.REDIRECT
    // Redirects a client to a new uri
    k.target.REDIRECT = 'REDIRECT';

    // #### target.LANG
    // Requests language information
    k.target.LANG = 'LANG';

    // #### target.SETUP
    // Asks a client update its configuration
    k.target.SETUP = 'SETUP';

    // #### target.GAMECOMMAND
    // Ask a client to start/pause/stop/resume the game
    k.target.GAMECOMMAND = 'GAMECOMMAND';

    // #### target.SERVERCOMMAND
    // Ask a server to execute a command
    k.target.SERVERCOMMAND = 'SERVERCOMMAND';

    // #### target.ALERT
    // Displays an alert message in the receiving client (if in the browser)
    k.target.ALERT = 'ALERT';

    // #### target.LOG
    // A generic log message used to send info to the server
    // @see NodeGameClient.remoteVerbosity
    k.target.LOG = 'LOG';

    // #### target.BYE
    // Force disconnection upon reception.
    k.target.BYE  = 'BYE';

    //#### not used targets (for future development)


    k.target.JOIN = 'JOIN';   // Asks a client to join another channel

    k.target.TXT  = 'TXT';    // Text msg

    k.target.ACK  = 'ACK';    // A reliable msg was received correctly

    k.target.WARN = 'WARN';   // To do.
    k.target.ERR  = 'ERR';    // To do.

    // Old targets.

    // #### target.STAGE
    // A client notifies his own stage
    // k.target.STAGE = 'STAGE';

    // #### target.STAGE_LEVEL
    // A client notifies his own stage level
    // k.target.STAGE_LEVEL = 'STAGE_LEVEL';


    // ### node.constants.gamecommands
    k.gamecommands = {
        start: 'start',
        pause: 'pause',
        resume: 'resume',
        stop: 'stop',
        restart: 'restart',
        step: 'step',
        push_step: 'push_step',
        goto_step: 'goto_step',
        clear_buffer: 'clear_buffer',
        erase_buffer: 'erase_buffer'
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
     * Levels associated with the states of the nodeGame engine.
     */
    k.stateLevels = {
        UNINITIALIZED:  0,  // creating the game object
        STARTING:       1,  // constructor executed
        INITIALIZING:   2,  // calling game's init
        INITIALIZED:    5,  // init executed
        STAGE_INIT:    10,  // calling stage's init
        STEP_INIT:     20,  // calling step's init
        PLAYING_STEP:  30,  // executing step
        STAGE_EXIT:    50,  // calling stage's cleanup
        STEP_EXIT:     60,  // calling step's clenaup
        FINISHING:     70,  // calling game's gameover
        GAMEOVER:     100,  // game complete
        RUNTIME_ERROR: -1
    };

    /**
     * ### node.constants.stageLevels
     *
     * Levels associated with the states of the stages of a game.
     */
    k.stageLevels = {

        UNINITIALIZED:       0,  // Constructor called.

        INITIALIZING:        1,  // Executing init.

        INITIALIZED:         5,  // Init executed.

        LOADING_FRAME:       20, // A frame is being loaded (only in browser).

        FRAME_LOADED:        25, // The frame has been loaded (only in browser).

        EXECUTING_CALLBACK:  30, // Executing the stage callback.

        CALLBACK_EXECUTED:   40, // Stage callback executed.

        LOADED:              45, // Both GameWindow loaded and cb executed.

        PLAYING:             50, // Player playing.

        PAUSING:             55, // TODO: to be removed?

        PAUSED:              60, // TODO: to be removed?

        RESUMING:            65, // TODO: to be removed?

        RESUMED:             70, // TODO: to be removed?

        DONE_CALLED:         80, // Done is called,
                                 // will be asynchronously evaluated.

        GETTING_DONE:        90, // Done is being called,
                                 // and the step rule evaluated.

        DONE:               100, // Player completed the stage

        EXITING:            110, // Cleanup function being called (if found)
    };

    /**
     * ### node.constants.windowLevels
     *
     * Levels associated with the loading of the GameWindow object.
     *
     * @see GameWindow
     * @see GameWindow.state
     */
    k.windowLevels = {
        UNINITIALIZED:  0, // GameWindow constructor called
        INITIALIZING:   1, // Executing init.
        INITIALIZED:    5, // Init executed.
        LOADING:       30, // Loading a new Frame.
        LOADED:        40  // Frame Loaded.
    };

    /**
     * ### node.constants.screenState
     *
     * Levels describing whether the user can interact with the screen.
     *
     * @see GameWindow.screenState
     * @see GameWindow.lockFrame
     */
    k.screenLevels = {
        ACTIVE:        1,  // User can interact with screen (if LOADED)
        UNLOCKING:     -1,  // The screen is about to be unlocked.
        LOCKING:       -2, // The screen is about to be locked.
        LOCKED:        -3  // The screen is locked.
    };

    /**
     * ### node.constants.UNDEFINED_PLAYER
     *
     * Undefined player ID
     */
    k.UNDEFINED_PLAYER = -1;

    /**
     * ### node.constants.UNAUTH_PLAYER
     *
     * Unauthorized player ID
     *
     * This string is returned by the server if authentication fails.
     */
    k.UNAUTH_PLAYER = 'unautorized_player';


     /**
     * ### node.constants.publishLevels
     *
     * The level of updates that the server receives about the state of a game
     *
     * - ALL: all stateLevel, stageLevel, and gameStage updates
     * - MOST: all stageLevel and gameStage updates
     * - REGULAR: only stageLevel PLAYING and DONE, and all gameStage updates
     * - FEW: only gameStage updates (might not work for multiplayer games)
     * - NONE: no updates. The same as observer.
     */
    k.publishLevels = {
        ALL: 4,
        MOST: 3,
        REGULAR: 2,
        FEW: 1,
        NONE: 0
    };

})('undefined' != typeof node ? node : module.exports);
