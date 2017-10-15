window.addEventListener("load", game());

  
function game() { 

	var status = 0; // Status if used as a blocker. If it is 0 player cannot click on the board and AI can't play
	var playersnames = ["Player 1","A.I."]; // Names of the left and right players. Player 1 does not change. "A.I" is there by default as AI is enabled by default but is changed to Player 2 if 2 players selected
	var playerscores = ["0","0"]; // Keep the score. gameSettings["currentplayer"] is used as an index to know which one to increase
	var currentgroup = "X"; // Group currently being played. Is used to fill var board, to fill the board cell when clicked by player or selected by AI

	
	var totalremaining = ["1","2","3","4","5","6","7","8","9"]; // To check what is left. "" are kept because the value attribute of each square is a string
	var board = [0,1,2,3,4,5,6,7,8]; // Used by minimax function (Normal AI). At each play the corresponding spot number is replaced by the group of the player
	var playersremaining = [ // This represents all the winning combination for each player (1 set per player). Each time a player plays, the corresponding value attribute value is removed from the arrays for the playing player. If any of them becomes empty, the player owning it wins
	[["1","2","3"],["4","5","6"],["7","8","9"],["1","4","7"],["2","5","8"],["3","6","9"],["1","5","9"],["3","5","7"]],
	[["1","2","3"],["4","5","6"],["7","8","9"],["1","4","7"],["2","5","8"],["3","6","9"],["1","5","9"],["3","5","7"]]
	]; // Each player as sets of array which are a success combination. Each time a player click on a grid value, it is removed everywhere in his group. If one of them is empty, the player wins.
	var fc = 0; //Used by minimax function (Normal AI). Keeps count of function calls (not critical for the actual rsolution of the move)
	var minmax;

	var gameSettings = {
		"numberplayers" : "1 Player",
		"iaenabled" : 1, // 1 if IA enabled otherwise 0
		"ialevel" : "normal", // Used to know which type of AI to use
		"currentplayer" : 0, // 0 is Player 1 (left - it can be AI as well) and 1 is Player 2 (right - it can be AI as well) - Those numbers are used as an index to read the proper element of the player, for example for scoreselectors, bselectors["playersdisplay"], playerscores
		"huPlayer": "X", // Used by minimax function (Normal AI)
		"iaPlayer": "O" // Used by minimax function (Normal AI)
	}

	var pselectors = document.querySelectorAll('[value]'); // IMPORTANT. Each cell of the board. The value attribute is used to retrieve them
	var scoreselectors = [document.querySelector("#p1score"),document.querySelector("#p2score")]; // The score elements to be increased when a player wins. gameSettings["currentplayer"] is used as an idex to select the corresponding element

	var bselectors = { // Contains different element  selection for further use below
		"config" : document.querySelector("body > section:nth-child(1)"), // The config page
		"n1player" : document.querySelector("#n1player"), // Option button in the config page
		"n2players" : document.querySelector("#n2players"), // Idem
		"xselect" : document.querySelector("#xselect"), // Idem
		"oselect" : document.querySelector("#oselect"), // Idem
		"drunk" : document.querySelector("#drunk"), // Idem
		"normal" : document.querySelector("#normal"), // Idem
		"configbutton" : document.querySelector("#configbutton"), // The Start button in the config page
		"mainbutton" : document.querySelector("#mainbutton"), // The big main button below the board
		"playersdisplay" : [document.querySelector("#player1disp"),document.querySelector("#player2disp")], // The name of the players at the left and right of the board. gameSettings["currentplayer"] is used as an idex to select the corresponding element
		"ialevel" : [document.querySelector("body > section:nth-child(1) > div > h3:nth-child(6)"),document.querySelector("body > section:nth-child(1) > div > div:nth-child(7)")] // In the config page, the AI level elements: h3 header and buttons container. When being hidden if 2 players is selected, both have to disappear
	}

	bselectors["n1player"].addEventListener("click", function () { // In the config page, clicking on a option modifies the corresponding variables and highlights the button
		setConfig("numberplayers",this.textContent,"n1player","n2players");
		gameSettings["iaenabled"] = 1;
		playersnames[1] = "A.I."; // As AI plays, its name will be displayed at the right of the board
		bselectors["playersdisplay"][1].textContent = playersnames[1];
		bselectors["ialevel"][0].classList.remove("nodisplay");
		bselectors["ialevel"][1].classList.remove("nodisplay");
	}); 
	bselectors["n2players"].addEventListener("click", function () {
		setConfig("numberplayers",this.textContent,"n2players","n1player");
		gameSettings["iaenabled"] = 0;
		playersnames[1] = "Player 2";
		bselectors["playersdisplay"][1].textContent = playersnames[1];
		bselectors["ialevel"][0].classList.add("nodisplay"); // As 2 players are selected, AI does not play so it level selection section is hidden
		bselectors["ialevel"][1].classList.add("nodisplay"); // Idem
	});
	bselectors["xselect"].addEventListener("click", function () {
		setConfig("currentplayer",0,"xselect","oselect");
		setConfig("huPlayer","X","xselect","oselect");
		setConfig("iaPlayer","O","xselect","oselect");
	});
	bselectors["oselect"].addEventListener("click", function () {
		setConfig("currentplayer",1,"oselect","xselect");
		setConfig("iaPlayer","X","oselect","xselect");
		setConfig("huPlayer","O","oselect","xselect");
	});
	bselectors["drunk"].addEventListener("click", function () {setConfig("ialevel","drunk","drunk","normal")});
	bselectors["normal"].addEventListener("click", function () {setConfig("ialevel","normal","normal","drunk")});

	bselectors["mainbutton"].addEventListener("click", function () { // When the main button is clicked.
		newround(); // Board and players' moves have to be cleared 
		gameSettings["currentplayer"] = 0; // Original options are reset
		currentgroup = "X"; // Original options are reset
		status = 0; // So no action possible on the board
		gameSettings["iaenabled"] = 1;  // Original options are reset
		gameSettings["ialevel"] = "normal";  // Original options are reset
		playersnames[1] = "A.I.";  // Original options are reset
		gameSettings["huPlayer"] = "X";  // Original options are reset
		gameSettings["iaPlayer"] = "O";  // Original options are reset
		for (var k = 0; k < 2 ; k++) { // Scores variables and display are reset
			playerscores[k] = 0;
			scoreselectors[k].textContent = 0;
		}
		classswitcher ("n1player","selected","n2players","selected"); // In line with the original options reset above, classes have to be reomved and added in order to reflect those button highlight changes
		classswitcher ("xselect","selected","oselect","selected"); // In line with the original options reset above, classes have to be reomved and added in order to reflect those button highlight changes
		classswitcher ("normal","selected","drunk","selected"); // In line with the original options reset above, classes have to be reomved and added in order to reflect those button highlight changes
		classswitcher ("config","goin","config","goout"); // The config page is displayed
		bselectors["playersdisplay"][0].classList.remove("pcurrent"); //No player's name should be highlighted (left and right to board)
		bselectors["playersdisplay"][0].classList.remove("pwaiting"); //Idem
		bselectors["playersdisplay"][1].classList.remove("pcurrent"); //Idem
		bselectors["playersdisplay"][1].classList.remove("pwaiting"); //Idem
		bselectors["playersdisplay"][1].textContent = "A.I."; // As reset puts AI back as second player, it's name should be brought back (in case before a 2nd human was playing)
		bselectors["ialevel"][0].classList.remove("nodisplay"); // In case the AI level panel was hidden when 2 players was selected, it is brought back as the orginal options enable AI
		bselectors["ialevel"][1].classList.remove("nodisplay");
		document.querySelector("#announce").classList.remove("announcemove"); // The announcer animation class is removed here otherwise it colludes with the same class is added
	});

	bselectors["configbutton"].addEventListener("click", function () {  // When start button from config page is clicked
		newround();
		classswitcher ("config","goout","config","goin"); // Moves the config page away
		bselectors["mainbutton"].textContent = "Reset!";
		currentplayerswitcher(); // Highlights the player name (it can be AI) to play first
		announcer (" starts!",playersnames[gameSettings["currentplayer"]]); // Shows the banner saying who starts
		if ( (!!gameSettings["iaenabled"]) && (!!gameSettings["currentplayer"]) ){ // If in the config page AI was enabled and if the human chose the "O" group, AI plays first so has to be fired
			iaplay();
		} else {status = 1}
	});

	function setConfig(variable,varValue,on,off,starter) { //On the config screen sets the config variables
		gameSettings[variable] = varValue; // Applies the value
		classswitcher (on,"selected",off,"selected"); // Highlight the selected button
	}

	function newround() { // Resets the board content and the variables used to determine the how the board is used and what players played. This reset is applied when a player wins, there is a draw or when the main button is clicked
		
		for (var i = 0; i < 9; i++) { // Clears the grid
			pselectors[i].textContent = "";
		}
		totalremaining = ["1","2","3","4","5","6","7","8","9"]; // Reseting board (string) used to know what is still free
		board = [0,1,2,3,4,5,6,7,8]; // Reseting the board used by minimax
		playersremaining = [  // Reseting the winning combinations for everybody
			[["1","2","3"],["4","5","6"],["7","8","9"],["1","4","7"],["2","5","8"],["3","6","9"],["1","5","9"],["3","5","7"]],
			[["1","2","3"],["4","5","6"],["7","8","9"],["1","4","7"],["2","5","8"],["3","6","9"],["1","5","9"],["3","5","7"]]
			];

	}

	function classswitcher (itemadd,classadd,itemremove,classremove) { // In the game config page, removes and add class to highlight the option currently being selected
		bselectors[itemadd].classList.add(classadd);
		bselectors[itemremove].classList.remove(classremove);
	}

	function currentplayerswitcher () { // Same as above for current player highlight (on left and right of the board). pcurrent class highlights the name while pwaiting puts it back to normal
		if ( (!!gameSettings["currentplayer"]) && (!!status) ) {
			bselectors["playersdisplay"][0].classList.add("pwaiting");
			bselectors["playersdisplay"][0].classList.remove("pcurrent");
		} else if ( (!!!gameSettings["currentplayer"]) && (!!status) ) {
			bselectors["playersdisplay"][1].classList.add("pwaiting");
			bselectors["playersdisplay"][1].classList.remove("pcurrent");
		}
		bselectors["playersdisplay"][gameSettings["currentplayer"]].classList.add("pcurrent");
		bselectors["playersdisplay"][gameSettings["currentplayer"]].classList.remove("pwaiting");
	}

	function announcer (content,player) { // Animates the middle banner by adding the announcemove class (removal is done at each click - see at the end of the code)
		
		if (content == "It's a draw!") {
			document.querySelector("#announce").textContent = content;
		} else {
			document.querySelector("#announce").textContent = player + content;
		}
		document.querySelector("#announce").classList.add("announcemove");
	}


	function playupdate (selector) { // Updates board after each play, players' variabes and check for win/draw
		totalremaining = totalremaining.filter(val => val != selector); // The played spot is removed from the remaining available spots 
		board[Number(selector)-1] = currentgroup; // The array used by the minimax function (normal AI) is updated. This is about replacing a number (empty position) by "X" or "O" being the current group
		for (var j = 0; j < playersremaining[gameSettings["currentplayer"]].length; j++) {
			if ( playersremaining[gameSettings["currentplayer"]][j].indexOf(selector != -1) ) { //Each time a player click on a grid value, it is removed in each  remaining array in his group
				playersremaining[gameSettings["currentplayer"]][j] = playersremaining[gameSettings["currentplayer"]][j].filter(val => val != selector); //Each time a player click on a grid value, it is removed in each  remaining array in his group
			}
			if (!!!playersremaining[gameSettings["currentplayer"]][j].length) { // If a player wins
				status = 0;
				announcer (" wins!",playersnames[gameSettings["currentplayer"]]);			
				++playerscores[gameSettings["currentplayer"]]; // Score of the winner is increased by 1
				scoreselectors[gameSettings["currentplayer"]].textContent = playerscores[gameSettings["currentplayer"]]; // The increase is displayed
				setTimeout (function () { // seTimeout is used in order to ley the player the time to see the board before disappearing
					newround(); 
				}, 3000);
			}
		}
		if ( (!!!totalremaining.length) && (!!status) ) { // If it is a draw
			announcer("It's a draw!",3);
			setTimeout (function () {// seTimeout is used in order to ley the player the time to see the board before disappearing
				newround();
			}, 3000);
		}
		!!gameSettings["currentplayer"] ? gameSettings["currentplayer"] = 0 : gameSettings["currentplayer"] = 1; // Switch from left player to right player (usefull for identifying who to give the score to)
		currentgroup == "X" ? currentgroup = "O" : currentgroup = "X"; // As we change player, the group should change too to match the new player
		status = 1;
		currentplayerswitcher();
	}


	function iaplay() { // This triggers how the AI should play. Note: AI is triggered from 2 events: 1/ After a human played (clicked) 2/ After clicking on Start if AI should play first
		status = 0;
		if ( (!!gameSettings["iaenabled"]) && (!!gameSettings["currentplayer"]) ) {
			setTimeout(function () { // setTimeout is used in order to simulate an AI thinking
				status = 1;
				var choice = 0; // Will contqin the AI choice in order to be applied to the board 
				if (gameSettings["ialevel"] == "drunk") { // Behavior of drunk AI: picks up a random number between 0 and the tottalremaining length
					choice = Math.trunc(Math.random() * totalremaining.length);	
					pselectors[totalremaining[choice]-1].textContent = currentgroup; // Var choice picks the value attribute so we have to apply -1 in order to search into the array as its index starts at 0
					playupdate (pselectors[totalremaining[choice]-1].getAttribute("value"));
				} else {

					choice = normalia();
					//minimax(board,gameSettings["iaPlayer"]);
					pselectors[choice].textContent = currentgroup; // No need to apply -1 here because the normalia function returns a choice which is an index, not the value attribute
					playupdate (pselectors[choice].getAttribute("value"));
				}
				status = 1;
			}, 4000);
		}

	}

	function normalia () { // The first IA move is hard coded otherwise minimax takes too much time
		// When IA begins
		if (totalremaining.toString() === ["1","2","3","4","5","6","7","8","9"].toString()) {
			return 6; // This is true position - 1 due to the 0 index in array
		} else 
		if ( (totalremaining.toString() === ["1","2","3","4","6","8","9"].toString()) || (totalremaining.toString() === ["1","2","3","4","6","8","9"].toString()) ) {
			return 2; // This is true position - 1 due to the 0 index in array
		} else 
		if (totalremaining.toString() === ["2","3","4","5","6","8","9"].toString()) {
			return 7; // This is true position - 1 due to the 0 index in array
		} else 
		if ( (totalremaining.toString() === ["1","3","4","5","6","8","9"].toString()) || (totalremaining.toString() === ["1","2","3","5","6","8","9"].toString()) || (totalremaining.toString() === ["1","2","3","4","5","6","9"].toString()) ) {
			return 4; // This is true position - 1 due to the 0 index in array
		} else 
		if ( (totalremaining.toString() === ["1","2","4","5","6","8","9"].toString()) || (totalremaining.toString() === ["1","2","3","4","5","8","9"].toString()) ){
			return 0; // This is true position - 1 due to the 0 index in array
		} else 
		if (totalremaining.toString() === ["1","2","3","4","5","6","8"].toString()) {
			return 3; // This is true position - 1 due to the 0 index in array
		} else 

		// When player begins
		if ( (totalremaining.toString() === ["2","3","4","5","6","7","8","9"].toString()) || (totalremaining.toString() === ["1","2","4","5","6","7","8","9"].toString()) || (totalremaining.toString() === ["1","2","3","4","5","6","8","9"].toString()) || (totalremaining.toString() === ["1","2","3","4","5","6","7","8"].toString()) || (totalremaining.toString() === ["1","3","4","5","6","7","8","9"].toString()) || (totalremaining.toString() === ["1","2","3","5","6","7","8","9"].toString()) || (totalremaining.toString() === ["1","2","3","4","5","7","8","9"].toString()) || (totalremaining.toString() === ["1","2","3","4","5","6","7","9"].toString()) ) {
			return 4; // This is true position - 1 due to the 0 index in array
		} else 
		if (totalremaining.toString() === ["1","2","3","4","6","7","8","9"].toString()) {
			return 0; // This is true position - 1 due to the 0 index in array
		} else 


		{ 
			var minmax = minimax(board,gameSettings["iaPlayer"]);		
			return minmax["index"];
		}
	}

// *** The minimax algorithm was developed by Ahmad Abdolsaheb. See https://github.com/ahmadabdolsaheb/minimaxarticle ***
	function minimax (newBoard, player) {  // Behavior of AI when normal

		  //add one to function calls
		  fc++;
		  
		  //available spots
		  var availSpots = emptyIndexies(newBoard);

		  // checks for the terminal states such as win, lose, and tie and returning a value accordingly
		  if (winning(newBoard, gameSettings["huPlayer"])){
		     return {score:-10};
		  }
			else if (winning(newBoard, gameSettings["iaPlayer"])){
		    return {score:10};
			}
		  else if (availSpots.length === 0){
		  	return {score:0};
		  }

		// an array to collect all the objects
		  var moves = [];

		  // loop through available spots
		  for (var i = 0; i < availSpots.length; i++){
		    //create an object for each and store the index of that spot that was stored as a number in the object's index key
		    var move = {};
		  	move.index = newBoard[availSpots[i]];

		    // set the empty spot to the current player
		    newBoard[availSpots[i]] = player;

		    //if collect the score resulted from calling minimax on the opponent of the current player
		    if (player == gameSettings["iaPlayer"]){
		      var result = minimax(newBoard, gameSettings["huPlayer"]);
		      move.score = result.score;
		    }
		    else{
		      var result = minimax(newBoard, gameSettings["iaPlayer"]);
		      move.score = result.score;
		    }

		    //reset the spot to empty
		    newBoard[availSpots[i]] = move.index;

		    // push the object to the array
		    moves.push(move);
		  }

		// if it is the computer's turn loop over the moves and choose the move with the highest score
		  var bestMove;
		  if(player === gameSettings["iaPlayer"]){
		    var bestScore = -10000;
		    for(var i = 0; i < moves.length; i++){
		      if(moves[i].score > bestScore){
		        bestScore = moves[i].score;
		        bestMove = i;
		      }
		    }
		  }else{

		// else loop over the moves and choose the move with the lowest score
		    var bestScore = 10000;
		    for(var i = 0; i < moves.length; i++){
		      if(moves[i].score < bestScore){
		        bestScore = moves[i].score;
		        bestMove = i;
		      }
		    }
		  }

		// return the chosen move (object) from the array to the higher depth
		  return moves[bestMove];
		}

		// returns the available spots on the board
		function emptyIndexies(board){
		  return  board.filter(s => s != "O" && s != "X");
		}

		// winning combinations using the board indexies for instace the first win could be 3 xes in a row
		function winning(board, player){
		 if (
		        (board[0] == player && board[1] == player && board[2] == player) ||
		        (board[3] == player && board[4] == player && board[5] == player) ||
		        (board[6] == player && board[7] == player && board[8] == player) ||
		        (board[0] == player && board[3] == player && board[6] == player) ||
		        (board[1] == player && board[4] == player && board[7] == player) ||
		        (board[2] == player && board[5] == player && board[8] == player) ||
		        (board[0] == player && board[4] == player && board[8] == player) ||
		        (board[2] == player && board[4] == player && board[6] == player)
		        ) {
		        return true;
		    } else {
		        return false;
		    }
		}
		// End of the code used by minimax function (IA Normal)


	for (var i = 0; i < 9; i++) { // This loops enables to listen to all the squares of the board in order to click on it
		pselectors[i].addEventListener("click", function () {
			document.querySelector("#announce").classList.remove("announcemove"); // The announcer animation class is removed here otherwise it colludes with the class Add when fired with other events
			if ( (!!status) && (totalremaining.indexOf(this.getAttribute("value")) != -1) ) { // Only perform an action on the board cell if status is active (1) and if the cell is empty (not already played). It is considered as empty if its value attribute is still in the totalremaining array
				this.textContent = currentgroup; // Display the current group
				playupdate (this.getAttribute("value"));
				if (!!gameSettings["iaenabled"]) { // After a player played, if AI is enabled, it triggers its move
					iaplay();	
				} else {status = 1;}
			}
		}); 
		
	}



















  ;}