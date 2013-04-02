(function(node, channel) {
	
	
	var client = channel.require('./client'); // path needs to be resolved at exec time;
	
	var game = node.game;
	
	// The fundamental unit of play is a game step. Minimally it must have an identificator, and a valida callback function

	var creation = {
			id: 'creation',
			cb: function() {}
	};

	// Optional, but important properties are 'descr', 'init', 'done', and 'onfail', that can added in the game step definition

	var creation = {
			id: 'creation',
			cb: function() {},
			descr: 'A verbose description of what is going on here', // Optional
			init: function() {}, // Optional. Can do things like setting the timer, updating step variables like the timer, etc.
			done: function() {}, // Optional. Ultimate check before declaring a step DONE. Must return TRUE if everything is OK. 
			onfail: function(code, err) {} // Optional. Handle exceptions locally
	};


	// In order to be executed a game step must be embedded in a game stage object. A very minimal game stage object is just a wrap
	// for the game step itself. However, it can specify other properties too, e.g. the number of times the step will be repeated.

	// A game stage can also group together more steps, and define the conditions to pass from one step to the other (always inside
	// the same stage). This is useful for example if you don't need to sync the players with each other (e.g. in a step-by-step tutorial)

	var stage = {
	 	id: 'game',
	 	repeat: 6,
	 	steps: [ 'creation', 'evaluation', 'dissemination' ], // step ids in sequential order
	 	onstepdone: 'WAIT', 
		onstepdone: 'GOTONEXT', // executes the next step of the stage automatically after a successfull DONE, 
		onstepdone: 'GOTONEXT_SYNC', // executes the next step of the stage automatically if all the players have a successfull DONE
	 	onstepdone: function(stepid, stepname) { // a custom function can be execute to determine the condition for updating
	 		if (stepid < 3) {
	 			node.game.step();
	 		}
	 		else if (stepname === 'XX') {
	 			node.game.step();
	 		}
	 		else if (CONDITION) {
	 			node.game.step();
	 		}
	 	},
	 	init: function() {
	 		// init the whole stage
	 	},
	 	onexit: function() {
	 		// something to do when this stage is done
	 	},
	 	onfail: function(code, err) {
	 		// handle an error (if this was not already handled by the step itself)
	 	}
	};


	// An object in the game manages all steps and stages

	game.plot.addSteps([
	                    	{ id: 'instructions',
	                    	  cb: showInstructions,
	                    	  descr: "Here I tell what happens verbosely. I am optional.",
	                    	  done: onDONEfunction, // optional
	                    	  init: initFunc } 
	                	 ,	{ id: 'quiz',
	                	 	  cb: makeQuiz,
	                	 	  done: checkQuiz }
	                	 ,	{ id: 'offer',
	                	 	  cb: makeOffer }
	                	 , 	{ id: 'respond',
	                	 	  cb: respond }
	                	 , 	{ id: 'questionnaire',
	                	 	  cb: showQuestionnaire 
	]);

	game.plot.addStage(stage);

	// The client can have all the stages locally, or can receive each stage separately from the server according to how the game develops

	game.plot.addStage(stage);
	game.plot.start();
	game.plot.clear(true);

	game.plot.addStage(stage);

	// Chaining together different game stages gives the game plot.

	// The logic must always have the game plot already defined before starting the game
	 
	game.plot.start()
			.next('tutorial')
			.next('game')
			.next('questionnaire')
			.gameover();

	// Equivalent to
	 
	game.setPlot(['tutorial', 'game', 'questionnaire']);




	
	game.name = 'xxx';
	game.description = 'xxx';
	game.version = '0.0.1';
	game.observer = true; // false
	
	game.onstepdone = 'WAIT'; //'GOTONEXT', 'GOTONEXT_SYNC', custom_function
	game.init = function(); // optional
	game.gameover = function(); // optional
	
	// All optional - defaults already defined
	game.waiting = function(); 	// what to do when the game is in the state 'Waiting for other players to continue';
	game.pause = function(); 	// what to do when the game is paused
	game.resuming = function(); // what to do when a game is resuming
	
	return game;
	
})(node);

