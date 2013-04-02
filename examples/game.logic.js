(function(node, channel) {
	
	var client = channel.require('./client'); // path needs to be resolved at exec time;
	
	var game = node.game;
	
	game.plot.addSteps([
                    	{ id: 'tutorial',
                    	  cb: function() {
                    		  
                    		  var stage = {
                				 	id: 'game',
                				 	repeat: 1,
                				 	steps: [ 'instructions', 'quiz'], // step ids in sequential order 
                					onstepdone: 'GOTONEXT', // executes the next step of the stage automatically after a successfull DONE, 
                					
                				 	init: function() {
                				 		node.game.timer.set(20000);
                				 	},
                				 	onexit: function() {
                				 		// something to do when this stage is done
                				 	},
                    		  }; 
                    		  
                    		  node.remoteSetup('stage', client.instructions);
                    		  node.remoteCommand('step');
                    	  } }
                	 ,	{ id: 'bidder',
                	 	  cb: function() {
                	 		node.remoteSetup('stage', client.bidder);
                	 		node.remoteCommand('step');
                	 	  } }
                	 , 	{ id: 'respondent',
                	 	  cb: function() {
                	 		node.remoteSetup('stage', client.respondent);
                	 		node.remoteCommand('step');
                	 	  } }
                	 , 	{ id: 'questionnaire',
                	 	  cb: function() {
                	 		node.remoteSetup('stage', client.questionnaire);
                	 		node.remoteCommand('step');
                	 	  } }   	 	  
]);
	
	
	// ALL PLAYERS FINISHED THE TUTORIAL
	game.plot.ondone('tutorial', function() {
		
	});
		
	
	var gameStage = {
			id: 'game',
			init: function() {
				// something
				return true;
			},
			cb: function() {
	
			// random pairing
			var pairs = node.pl.getRandomGroupsByN(2);
			// Setting up each client
			pairs.each(function()) {
				node.remoteSetup('globals', client.globals, CLIENT_A);
				node.remoteSetup('stage', client.respondent, CLIENT_A);
				
				node.remoteSetup('globals', client.globals, CLIENT_B);
				node.remoteSetup('stage', client.bidder, CLIENT_B);
				
				node.remoteCommand('step', CLIENT_B);
				node.remoteCommand('step', CLIENT_A);
			}
	};
	
	

	var tutorialStage = {
			 	id: 'tutorial',
				cb: function() {
					var stage;
					
					stage = {
							id: 'tutorial',
						 	steps: [ 'instructions', 'quiz'], // step ids in sequential order 
							onstepdone: 'GOTONEXT', // executes the next step of the stage automatically after a successfull DONE, 
					};
				
					node.game.pl.each(function(CLIENT) {
						node.remoteSetup('stage', stage, CLIENT);
						node.remoteCommand('step', CLIENT_A);
					}
	};


	var questionnaireStage = {
		 	id: 'questionnaire',
		 	steps: [ 'instructions', 'quiz'], // step ids in sequential order 
			onstepdone: 'GOTONEXT', // executes the next step of the stage automatically after a successfull DONE, 
			cb: function() {
				node.game.pl.each(function(CLIENT) {
					node.remoteSetup('stage', stage, CLIENT);
					node.remoteCommand('step', CLIENT_A);
				}
};
	
	game.plot.addStage(tutorialStage);
	game.plot.addStage(gameStage);
	
	
	game.plot.start()
			.next('tutorial')
			.next('game')
			.next('questionnaire')
			.gameover();



	game.session = 'AAA';
	
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

