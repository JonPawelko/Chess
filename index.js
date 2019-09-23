// Put your JavaScript in this file.
'use strict';   // Enable "strict mode".  Note: This *must* be the first statement in the script.
                // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

const PIECE_TYPE_PAWN = 1;
const PIECE_TYPE_ROOK = 2;
const PIECE_TYPE_KNIGHT = 3;
const PIECE_TYPE_BISHOP = 4;
const PIECE_TYPE_QUEEN = 5;
const PIECE_TYPE_KING = 6;

const SQUARE_SIZE = 100;  // pixel size of individual squares
const BOARD_SIZE = 8;  // number of rows and columns of squares

// square statuses - either blank, p1 or p2
const NO_PLAYER = 0;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

// Starting row of each players pawns.  Need this to differentiate first move vs. later move
const PLAYER_1_PAWN_ROW = 1;
const PLAYER_2_PAWN_ROW = 6;

// phase within a single turn - 2 steps, select the piece, then select the square.
const PHASE_NOT_STARTED = 0;
const PHASE_PIECE_SELECTED = 1;

// game status
const STATUS_NOT_STARTED = 0;
const STATUS_IN_PROGRESS = 1;
const STATUS_COMPLETED = 2;

const CHECK = 1;      // general check - piece can get to a king - see later function
const CHECK_ON_ME = 2;
const CHECK_ON_OPPONENT = 3;
const CHECK_MATE = 4;
const NO_CHECK = 5;

const PAWN_MESSAGE_START = "Choose a lost piece to return to the game.\n\n";

// new global variables
var turn = PLAYER_1;
var turnPhase = PHASE_NOT_STARTED;
// var gameStatus = STATUS_NOT_STARTED;

// Each move is 2 steps, this var stores the square number for each square chosen
var firstSquareChosen;
var secondSquareChosen;

// create a global variable representing the board and message
var board = document.getElementById("board");  // only 1 board, use ID
var message = document.getElementById("message");  // only 1 message, use ID

// create the array of pieces for each player
var player1Pieces = new Array;
var player2Pieces = new Array;

// create the array of lost pieces for each player
var player1LostPieces = new Array;
var player2LostPieces = new Array;

var currentPieceArrayIndex;      // returns index into array of pieces to denote which piece was clicked on
var currentPieceType;      // returns index into array of pieces to denote which piece was clicked on

createBoard();
drawBoard();

// ------  End start up code -----  Begin functions ------------------

// ----------------------------------------------------------------------
// --- Click event on a board, but the actual event is on a square

board.addEventListener('click', function(e)
{
  // e is the event, e.target is the square that was clicked on
  console.log("Contents of the square is " + e.target.innerHTML);
  console.log("The square you clicked on is " + e.target.id);

  // alert("The square you clicked on is " + e.target.id);

  // firstSquareChosen = Number(e.target.id);
  var isEmpty;    // boolean, true if square is empty

  if (turnPhase == PHASE_NOT_STARTED)   // first click of new turn
  {
      message.innerHTML = "";

      // store the square id into the global var
      firstSquareChosen = Number(e.target.id);

      // determine which player owns the piece selected
      var playerPiece = whosePieceIsThis(e.target.id);

      console.log("Player turn is " + turn + ".  First square chosen is " + firstSquareChosen);

      if (playerPiece == turn)  // valid selection if I clicked on my piece
      {
          e.target.style.backgroundColor  = "yellow";

          turnPhase = PHASE_PIECE_SELECTED;

          // store array index into my array for later use
          currentPieceArrayIndex = whichPieceInSquare(firstSquareChosen);
      }
      // if you click on any other square besides your own piece, function returns, nothing happens

  } // end turnphase = PHASE_NOT_STARTED
  else if (turnPhase == PHASE_PIECE_SELECTED)   // second click of turn, attempting to move piece
  {
    // store the square id into the global var
    secondSquareChosen = Number(e.target.id);

    if ((firstSquareChosen == secondSquareChosen) || (whosePieceIsThis(secondSquareChosen) == turn)) // can't select yourself twice or land on a square you already have
    {
        turnPhase = PHASE_NOT_STARTED;
        console.log("First and second square the same or landed on my own square I own, illegal move");
    }
    else
    {
        var legalMove = processMove();
        console.log("After ProcessMove, legal move = " + legalMove);

        // move code below to processMove

        if (legalMove == true)
        {
            turn = (turn == PLAYER_1) ? PLAYER_2 : PLAYER_1;
        }

        turnPhase = PHASE_NOT_STARTED;

    }   // end else, first and second squares are not the same

    drawBoard();
    // message.innerHTML = "";

  }

});

// ------------------------------------------------------

function processMove()
{
    // current code
    currentPieceType = whichPieceIsThis();

    var isEmpty1;
    var isEmpty2;

    // console.log("Process Move called, piece is " + pieceType);

    switch (currentPieceType)
    {
      case PIECE_TYPE_PAWN:

          console.log("processMove called, piece is pawn");

          if (turn == PLAYER_1)
          {
              // check if valid move, one scenario at a time

              // scenario 1 - first move for pawn, 2 spaces ----------------
              var pawnRow = Math.trunc(firstSquareChosen / BOARD_SIZE);
              if ((pawnRow == PLAYER_1_PAWN_ROW) && (secondSquareChosen == (firstSquareChosen + (2*BOARD_SIZE))))
              {
                  // check if the square 1 forward is empty
                  isEmpty1 = isSquareEmpty(firstSquareChosen + BOARD_SIZE);

                  if (isEmpty1)  // Can't jump over occupied space
                  {
                      isEmpty2 = isSquareEmpty(firstSquareChosen + (2*BOARD_SIZE));

                      if (isEmpty2)  // if its true, legal move, but check for check or checkmate before moving to that square
                      {

                          var check = isCheckOrCheckMate();

                          if (check == CHECK_ON_ME)
                          {
                              console.log("CHECK on me found, illegal move, reject");
                              message.innerHTML = "Check on my own king.  Illegal move.";
                              return false;
                          }
                          else if (check == CHECK_ON_OPPONENT)
                          {
                              console.log("CHECK on opponent found, allow move, but show message");
                              message.innerHTML = "Check on opponent.";
                          }
                          else if (check == CHECK_MATE)
                          {
                              console.log("CHECK Mate found");
                              message.innerHTML = "Check mate.";
                          }

                          // currentPieceArrayIndex = whichPieceInSquare(firstSquareChosen);
                          player1Pieces[currentPieceArrayIndex].square = firstSquareChosen + (2*BOARD_SIZE);
                          return true;
                      }
                  }
                }

              // Scenario 2 - Any move forward, 1 space --------------------
              if (secondSquareChosen == (firstSquareChosen + BOARD_SIZE))
              {
                  // check if the square 1 forward is empty
                  isEmpty1 = isSquareEmpty(firstSquareChosen + BOARD_SIZE);

                  if (isEmpty1)   // valid move, but check for check and check mate first
                  {

                      var check = isCheckOrCheckMate();

                      if (check == CHECK_ON_ME)
                      {
                          console.log("CHECK on me found, illegal move, reject");
                          message.innerHTML = "Check on my own king.  Illegal move.";
                          return false;
                      }
                      else if (check == CHECK_ON_OPPONENT)
                      {
                          console.log("CHECK on opponent found, allow move, but show message");
                          message.innerHTML = "Check on opponent.";
                      }
                      else if (check == CHECK_MATE)
                      {
                          console.log("CHECK Mate found");
                          message.innerHTML = "Check mate.";
                      }

                      // handle pawn in first row scenario here
                      if (Math.trunc((firstSquareChosen + BOARD_SIZE)/ BOARD_SIZE) == (BOARD_SIZE - 1))
                      {
                        // handle

                        var pawnMessage = PAWN_MESSAGE_START;   // continue here zzzz
                        var i;

                        for (i=0; i<player1LostPieces.length;i++)
                        {
                          // build string \n
                          pawnMessage = pawnMessage + String(i+1) + " - " + player1LostPieces[i].symbol + "\n";
                        }

                        // var validAnswer = false

                        player1Pieces[currentPieceArrayIndex].square = firstSquareChosen + BOARD_SIZE;  // zzz left off here

                        var validAnswer = false;

                        while (validAnswer == false)
                        {
                            var answer = Number(prompt(pawnMessage));

                            if ((answer < 1) || (answer > player1LostPieces.length) || isNaN(answer))
                            {
                                // invalid answer
                                message.innerHTML = "Invalid Answer";
                            }
                            else // valid
                            {
                              var tempPiece = player1Pieces[currentPieceArrayIndex];
                              player1Pieces[currentPieceArrayIndex] = player1LostPieces[answer-1];
                              player1Pieces[currentPieceArrayIndex].square = tempPiece.square;
                              player1LostPieces[answer-1] = tempPiece;
                              validAnswer = true;
                            }
                        }

                        // replace the piece selected - zzz
                        // alert (answer);

                      }
                      else
                      {
                          // currentPieceArrayIndex = whichPieceInSquare(firstSquareChosen);
                          player1Pieces[currentPieceArrayIndex].square = firstSquareChosen + BOARD_SIZE;
                      }

                      return true;

                  }
                  else
                    return false; // square not empty, invalid move
                }

              // Scenario 3 - Legal diagonal move to capture piece
              if ((secondSquareChosen == (firstSquareChosen + BOARD_SIZE + 1)) || (secondSquareChosen == (firstSquareChosen + BOARD_SIZE - 1)))
              {

                  // Check if there's a piece in the second square

                  var whosePiece = whosePieceIsThis(secondSquareChosen);

                  if (whosePiece == PLAYER_2)
                  {
                      // capture piece, but check for check and check mate first

                      var check = isCheckOrCheckMate();

                      if (check == CHECK_ON_ME)
                      {
                          console.log("CHECK on me found, illegal move, reject");
                          message.innerHTML = "Check on my own king.  Illegal move.";
                          return false;
                      }
                      else if (check == CHECK_ON_OPPONENT)
                      {
                          console.log("CHECK on opponent found, allow move, but show message");
                          message.innerHTML = "Check on opponent.";
                      }
                      else if (check == CHECK_MATE)
                      {
                          console.log("CHECK Mate found");
                          message.innerHTML = "Check mate.";
                      }

                      console.log("Capture scenario");
                      capturePiece();

                      // handle pawn in first row scenario here

                      if (Math.trunc(secondSquareChosen/ BOARD_SIZE) == (BOARD_SIZE - 1))
                      {

                          var pawnMessage = PAWN_MESSAGE_START;   // continue here zzzz
                          var i;

                          for (i=0; i<player1LostPieces.length;i++)
                          {
                            // build string \n
                            pawnMessage = pawnMessage + String(i+1) + " - " + player1LostPieces[i].symbol + "\n";
                          }

                          // update square
                          player1Pieces[currentPieceArrayIndex].square = secondSquareChosen;

                          var validAnswer = false;

                          while (validAnswer == false)
                          {
                              var answer = Number(prompt(pawnMessage));

                              if ((answer < 1) || (answer > player1LostPieces.length) || isNaN(answer))
                              {
                                  // invalid answer
                                  message.innerHTML = "Invalid Answer";
                              }
                              else // valid
                              {

                                  var answer = Number(prompt(pawnMessage));

                                  var tempPiece = player1Pieces[currentPieceArrayIndex];
                                  player1Pieces[currentPieceArrayIndex] = player1LostPieces[answer-1];
                                  player1Pieces[currentPieceArrayIndex].square = tempPiece.square;
                                  player1LostPieces[answer-1] = tempPiece;
                                  validAnswer = true;
                              }

                          }
                          // replace the piece selected - zzz
                          // alert (answer);

                      }
                      else {

                        // update square
                        player1Pieces[currentPieceArrayIndex].square = secondSquareChosen;

                      }

                      return true;

                  }
                  else  //  only can move diagonal on a capture
                    return false;

                }

              return false;

          } // end if player 1 turn -------------------------

          else  // player 2 turn ----------------------------
          {
              // scenario 1 - first move for pawn, 2 spaces ----------------
              var pawnRow = Math.trunc(firstSquareChosen / BOARD_SIZE);
              if ((pawnRow == PLAYER_2_PAWN_ROW) && (secondSquareChosen == (firstSquareChosen - (2*BOARD_SIZE))))
              {
                  // check if the square 1 forward is empty
                  isEmpty1 = isSquareEmpty(firstSquareChosen - BOARD_SIZE);

                  if (isEmpty1)  // Can't jump over occupied space
                  {
                      isEmpty2 = isSquareEmpty(firstSquareChosen - (2*BOARD_SIZE));

                      if (isEmpty2)  // if its true "move" to that square, check for check or check mate first
                      {
                          var check = isCheckOrCheckMate();

                          if (check == CHECK_ON_ME)
                          {
                              console.log("CHECK on me found, illegal move, reject");
                              message.innerHTML = "Check on my own king.  Illegal move.";
                              return false;
                          }
                          else if (check == CHECK_ON_OPPONENT)
                          {
                              console.log("CHECK on opponent found, allow move, but show message");
                              message.innerHTML = "Check on opponent.";
                          }
                          else if (check == CHECK_MATE)
                          {
                              console.log("CHECK Mate found");
                              message.innerHTML = "Check mate.";
                          }

                          player2Pieces[currentPieceArrayIndex].square = firstSquareChosen - (2*BOARD_SIZE);
                          return true;

                      }
                  }
                }

              // Scenario 2 - Any move forward, 1 space --------------------
              if (secondSquareChosen == (firstSquareChosen - BOARD_SIZE))
              {
                  // check if the square 1 forward is empty
                  isEmpty1 = isSquareEmpty(firstSquareChosen - BOARD_SIZE);

                  if (isEmpty1)   // valid move, check first for check mate
                  {

                      var check = isCheckOrCheckMate();

                      if (check == CHECK_ON_ME)
                      {
                          console.log("CHECK on me found, illegal move, reject");
                          message.innerHTML = "Check on my own king.  Illegal move.";
                          return false;
                      }
                      else if (check == CHECK_ON_OPPONENT)
                      {
                          console.log("CHECK on opponent found, allow move, but show message");
                          message.innerHTML = "Check on opponent.";
                      }
                      else if (check == CHECK_MATE)
                      {
                          console.log("CHECK Mate found");
                          message.innerHTML = "Check mate.";
                      }

                      // handle pawn in first row scenario here
                      if (secondSquareChosen < BOARD_SIZE)
                      {
                          // handle

                            var pawnMessage = PAWN_MESSAGE_START;   // continue here zzzz
                            var i;

                            for (i=0; i<player2LostPieces.length;i++)
                            {
                              // build string \n
                              pawnMessage = pawnMessage + String(i+1) + " - " + player2LostPieces[i].symbol + "\n";
                            }

                            // var validAnswer = false

                            player2Pieces[currentPieceArrayIndex].square = secondSquareChosen;  // zzz left off here

                            var validAnswer = false;

                            while (validAnswer == false)
                            {
                                var answer = Number(prompt(pawnMessage));

                                if ((answer < 1) || (answer > player2LostPieces.length) || isNaN(answer))
                                {
                                    // invalid answer
                                    message.innerHTML = "Invalid Answer";
                                }
                                else // valid
                                {

                                    var answer = Number(prompt(pawnMessage));

                                    var tempPiece = player2Pieces[currentPieceArrayIndex];
                                    player2Pieces[currentPieceArrayIndex] = player2LostPieces[answer-1];
                                    player2Pieces[currentPieceArrayIndex].square = tempPiece.square;
                                    player2LostPieces[answer-1] = tempPiece;
                                    validAnswer = true;
                                }
                            }

                        }
                      else
                      {
                          player2Pieces[currentPieceArrayIndex].square = firstSquareChosen - BOARD_SIZE;

                      }

                      return true;

                  } // end if isEmpty
                  else
                    return false; // square not empty, invalid move
                }

              console.log("Got here, firstSquareChosen = " + firstSquareChosen + "  - Second square chosen = " + secondSquareChosen);

              // Scenario 3 - Legal diagonal move to capture piece
              if ((secondSquareChosen == (firstSquareChosen - (BOARD_SIZE - 1))) || (secondSquareChosen == (firstSquareChosen - (BOARD_SIZE + 1))))
              {
                  console.log("Player 2 diag");

                  // Check if there's a piece in the second square

                  var whosePiece = whosePieceIsThis(secondSquareChosen);

                  if (whosePiece == PLAYER_1)
                  {
                      // capture piece, check for checks first

                      var check = isCheckOrCheckMate();

                      if (check == CHECK_ON_ME)
                      {
                          console.log("CHECK on me found, illegal move, reject");
                          message.innerHTML = "Check on my own king.  Illegal move.";
                          return false;
                      }
                      else if (check == CHECK_ON_OPPONENT)
                      {
                          console.log("CHECK on opponent found, allow move, but show message");
                          message.innerHTML = "Check on opponent.";
                      }
                      else if (check == CHECK_MATE)
                      {
                          console.log("CHECK Mate found");
                          message.innerHTML = "Check mate.";
                      }

                      console.log("Capture scenario");
                      capturePiece();

                      // handle pawn in first row scenario here
                      if (secondSquareChosen < BOARD_SIZE)
                      {
                          // handle

                            var pawnMessage = PAWN_MESSAGE_START;   // continue here zzzz
                            var i;

                            for (i=0; i<player2LostPieces.length;i++)
                            {
                              // build string \n
                              pawnMessage = pawnMessage + String(i+1) + " - " + player2LostPieces[i].symbol + "\n";
                            }

                            // var validAnswer = false

                            player2Pieces[currentPieceArrayIndex].square = secondSquareChosen;  // zzz left off here

                            var validAnswer = false;

                            while (validAnswer == false)
                            {
                                var answer = Number(prompt(pawnMessage));

                                if ((answer < 1) || (answer > player2LostPieces.length) || isNaN(answer))
                                {
                                    // invalid answer
                                    message.innerHTML = "Invalid Answer";
                                }
                                else // valid
                                {
                                    var answer = Number(prompt(pawnMessage));

                                    var tempPiece = player2Pieces[currentPieceArrayIndex];
                                    player2Pieces[currentPieceArrayIndex] = player2LostPieces[answer-1];
                                    player2Pieces[currentPieceArrayIndex].square = tempPiece.square;
                                    player2LostPieces[answer-1] = tempPiece;
                                    validAnswer = true;
                                }
                              }

                        }
                      else
                      {
                          player2Pieces[currentPieceArrayIndex].square = secondSquareChosen;
                      }

                      return true;

                  }
                  else  //  only can move diagonal on a capture
                    return false;

              }

              return false;

          }   // end else, player 2 turn

        break;

      case PIECE_TYPE_ROOK: // ------------------------------------------------------


          var firstSquareRow = Math.trunc(firstSquareChosen / BOARD_SIZE);
          var secondSquareRow = Math.trunc(secondSquareChosen / BOARD_SIZE);

          console.log("processMove called, piece is a rook");

          // doesn't matter if player 1 or 2.  Rooks can go in any of the 4 directions.
          // Simple math to check if a valid rook move.  Horizontal or vertical only.  No diag.

          if ( (((firstSquareChosen - secondSquareChosen) % BOARD_SIZE) != 0) &&
               (firstSquareRow != secondSquareRow))
          {
            console.log("Illegal rook move");
            return false;
          }

          // check if valid move, no pieces between first and second square chosen

          var i = 0;  // while loop counter
          var legal = true;
          var numChecksNeeded;
          var currSquare = firstSquareChosen;

          // Scenario 1 - Check vertical column -------------------------------------
          if (((firstSquareChosen - secondSquareChosen) % BOARD_SIZE) == 0)
          {
              // calculate # of cells to check in between first and second square
              numChecksNeeded = Math.abs(((firstSquareChosen - secondSquareChosen) / BOARD_SIZE)) - 1;

              // loop until all cells are checked or you find a non-blank square in the way.
              while ((i < numChecksNeeded) && (legal == true))
              {
                  // either traverse up or down the board
                  if (firstSquareChosen < secondSquareChosen)
                    currSquare += BOARD_SIZE;
                  else
                    currSquare -= BOARD_SIZE;

                  // if square is empty, increment i and keep checking.
                  if (isSquareEmpty(currSquare) == true)
                    i++;
                  else  // cell is not empty, illegal move
                    legal = false;
              }

              if (legal == false) return false;

              // legal move so far if you got here, check for checks
              // now check if piece in second square

              var check = isCheckOrCheckMate();

              if (check == CHECK_ON_ME)
              {
                  console.log("CHECK on me found, illegal move, reject");
                  message.innerHTML = "Check on my own king.  Illegal move.";
                  return false;
              }
              else if (check == CHECK_ON_OPPONENT)
              {
                  console.log("CHECK on opponent found, allow move, but show message");
                  message.innerHTML = "Check on opponent.";
              }
              else if (check == CHECK_MATE)
              {
                  console.log("CHECK Mate found");
                  message.innerHTML = "Check mate.";
              }

              console.log("Legal rook move");

              checkForCapture();    // zzz - split up checkForCapture into 2 functions... check and capture - Scenario is I kill a guy, nullifying a check

              return true;

          }
          else  // If not same column, must be Same row ----------------------------
          {
            numChecksNeeded = Math.abs((firstSquareChosen - secondSquareChosen)) - 1;

            while ((i < numChecksNeeded) && (legal == true))
            {
                if (firstSquareChosen < secondSquareChosen)
                  currSquare += 1;
                else
                  currSquare -= 1;

                if (isSquareEmpty(currSquare) == true)
                  i++;
                else
                  legal = false;
            }

            if (legal == false) return false;

            // if legal move, updated pieces array, check for checks first

            var check = isCheckOrCheckMate();

            if (check == CHECK_ON_ME)
            {
                console.log("CHECK on me found, illegal move, reject");
                message.innerHTML = "Check on my own king.  Illegal move.";
                return false;
            }
            else if (check == CHECK_ON_OPPONENT)
            {
                console.log("CHECK on opponent found, allow move, but show message");
                message.innerHTML = "Check on opponent.";
            }
            else if (check == CHECK_MATE)
            {
                console.log("CHECK Mate found");
                message.innerHTML = "Check mate.";
            }

            console.log("Legal rook move");

            checkForCapture();

            return true;

          }

        break;

      case PIECE_TYPE_KNIGHT:   // ---------------------------------------------

          console.log("Knight move called");
          // move checks don't depend on the player, any knight can move in any direction

          // first square and second square offset must be 2 rows and 1 column or 2 columns and 1 row

          var firstSquareRow = Math.trunc(firstSquareChosen / BOARD_SIZE);
          var secondSquareRow = Math.trunc(secondSquareChosen / BOARD_SIZE);
          var firstSquareCol = Math.trunc(firstSquareChosen % BOARD_SIZE);
          var secondSquareCol = Math.trunc(secondSquareChosen % BOARD_SIZE);

          var rowOffset = Math.abs(firstSquareRow - secondSquareRow);
          var colOffset = Math.abs(firstSquareCol - secondSquareCol);

          // valid move
          if (((rowOffset == 2) && (colOffset == 1)) || ((rowOffset == 1) && (colOffset == 2)))
          {
              var check = isCheckOrCheckMate();

              if (check == CHECK_ON_ME)
              {
                  console.log("CHECK on me found, illegal move, reject");
                  message.innerHTML = "Check on my own king.  Illegal move.";
                  return false;
              }
              else if (check == CHECK_ON_OPPONENT)
              {
                  console.log("CHECK on opponent found, allow move, but show message");
                  message.innerHTML = "Check on opponent.";
              }
              else if (check == CHECK_MATE)
              {
                  console.log("CHECK Mate found");
                  message.innerHTML = "Check mate.";
              }

              checkForCapture();
              return true;
          }
          else
          {
            // invalid move
            return false;
          }

        break;

      case PIECE_TYPE_BISHOP:  // ---------------------------------------------------------------

        // what's a legal move?

        console.log("Bishop process move called");

        var firstSquareRow = Math.trunc(firstSquareChosen / BOARD_SIZE);
        var secondSquareRow = Math.trunc(secondSquareChosen / BOARD_SIZE);
        var firstSquareCol = Math.trunc(firstSquareChosen % BOARD_SIZE);
        var secondSquareCol = Math.trunc(secondSquareChosen % BOARD_SIZE);

        var rowOffset = Math.abs(firstSquareRow - secondSquareRow);
        var colOffset = Math.abs(firstSquareCol - secondSquareCol);

        if (rowOffset != colOffset)
        {
          console.log("Illegal bishop move");
          return false;
        }

        var i = 0;
        var legal = true;   // assume true, return false if nec
        var currSquare = firstSquareChosen;

        // calculate # of cells to check in between first and second square
        numChecksNeeded = Math.abs(firstSquareRow - secondSquareRow) - 1;


        console.log("Num checks needed  = " + numChecksNeeded);

        // loop until all cells are checked or you find a non-blank square in the way.
        while (i < numChecksNeeded)
        {
            if (firstSquareChosen < secondSquareChosen) // must go down
            {
                console.log("Must go down");

                if (firstSquareCol < secondSquareCol) // must go right
                {
                    console.log("Must go right");
                    currSquare += BOARD_SIZE + 1;
                }
                else   // must go right
                {
                    console.log("Must go left");
                    currSquare += BOARD_SIZE - 1;
                }

                // if square is empty, increment i and keep checking.
                if (isSquareEmpty(currSquare) == true)
                  i++;
                else  // cell is not empty, illegal move
                  return false;

            }
            else  // must go up
            {
                if (firstSquareCol < secondSquareCol) // must go left
                {
                    console.log("Must go left");
                    currSquare -= BOARD_SIZE - 1;
                }
                else   // must go right
                {
                    console.log("Must go right");
                    currSquare -= BOARD_SIZE + 1;
                }

                // if square is empty, increment i and keep checking.
                if (isSquareEmpty(currSquare) == true)
                  i++;
                else  // cell is not empty, illegal move
                  return false;

              }

        } // end while loop

        // if legal move, updated pieces array, check for checks

        var check = isCheckOrCheckMate();

        if (check == CHECK_ON_ME)
        {
            console.log("CHECK on me found, illegal move, reject");
            message.innerHTML = "Check on my own king.  Illegal move.";
            return false;
        }
        else if (check == CHECK_ON_OPPONENT)
        {
            console.log("CHECK on opponent found, allow move, but show message");
            message.innerHTML = "Check on opponent.";
        }
        else if (check == CHECK_MATE)
        {
            console.log("CHECK Mate found");
            message.innerHTML = "Check mate.";
        }

        console.log("Legal bishop move");

        checkForCapture();

        return true;

        break;

      case PIECE_TYPE_QUEEN:

        console.log("Queen move called");
        // move checks don't depend on the player, any queen can move in any direction

        // Figure out which move scenario

        var firstSquareRow = Math.trunc(firstSquareChosen / BOARD_SIZE);
        var secondSquareRow = Math.trunc(secondSquareChosen / BOARD_SIZE);
        var firstSquareCol = Math.trunc(firstSquareChosen % BOARD_SIZE);
        var secondSquareCol = Math.trunc(secondSquareChosen % BOARD_SIZE);

        var rowOffset = Math.abs(firstSquareRow - secondSquareRow);
        var colOffset = Math.abs(firstSquareCol - secondSquareCol);

        var i = 0;
        var legal = true;   // assume true, return false if nec
        var currSquare = firstSquareChosen;

        // scenario 1 - same row  -------------------------------------------------------
        if (firstSquareRow == secondSquareRow)
        {
            var numChecksNeeded = Math.abs((firstSquareChosen - secondSquareChosen)) - 1;

            while (i < numChecksNeeded)
            {
                if (firstSquareChosen < secondSquareChosen)
                  currSquare += 1;
                else
                  currSquare -= 1;

                if (isSquareEmpty(currSquare) == true)
                  i++;
                else
                  return false;
            }
        }
        else if (firstSquareCol == secondSquareCol)   // scenario 2 - same col -----------
              {

                  // calculate # of cells to check in between first and second square
                  var numChecksNeeded = Math.abs(((firstSquareChosen - secondSquareChosen) / BOARD_SIZE)) - 1;

                  // loop until all cells are checked or you find a non-blank square in the way.
                  while (i < numChecksNeeded)
                  {
                      // either traverse up or down the board
                      if (firstSquareChosen < secondSquareChosen)
                        currSquare += BOARD_SIZE;
                      else
                        currSquare -= BOARD_SIZE;

                      // if square is empty, increment i and keep checking.
                      if (isSquareEmpty(currSquare) == true)
                        i++;
                      else  // cell is not empty, illegal move
                        return false;
                  }  // end same col if

              }
              else if (rowOffset == colOffset)  // scenario 3 - diagonal ----------------
              {

                // calculate # of cells to check in between first and second square
                numChecksNeeded = Math.abs(firstSquareRow - secondSquareRow) - 1;

                console.log("Num checks needed  = " + numChecksNeeded);

                // loop until all cells are checked or you find a non-blank square in the way.
                while (i < numChecksNeeded)
                {
                    if (firstSquareChosen < secondSquareChosen) // must go down
                    {
                        console.log("Must go down");

                        if (firstSquareCol < secondSquareCol) // must go right
                        {
                            console.log("Must go right");
                            currSquare += BOARD_SIZE + 1;
                        }
                        else   // must go right
                        {
                            console.log("Must go left");
                            currSquare += BOARD_SIZE - 1;
                        }

                        // if square is empty, increment i and keep checking.
                        if (isSquareEmpty(currSquare) == true)
                          i++;
                        else  // cell is not empty, illegal move
                          return false;

                    }
                    else  // must go up
                    {
                        if (firstSquareCol < secondSquareCol) // must go left
                        {
                            console.log("Must go left");
                            currSquare -= BOARD_SIZE - 1;
                        }
                        else   // must go right
                        {
                            console.log("Must go right");
                            currSquare -= BOARD_SIZE + 1;
                        }

                        // if square is empty, increment i and keep checking.
                        if (isSquareEmpty(currSquare) == true)
                          i++;
                        else  // cell is not empty, illegal move
                          return false;

                      }

                } // end while loop

              } // end if diag
              else return false;

        // if legal move, updated pieces array, heck for checks

        var check = isCheckOrCheckMate();

        if (check == CHECK_ON_ME)
        {
            console.log("CHECK on me found, illegal move, reject");
            message.innerHTML = "Check on my own king.  Illegal move.";
            return false;
        }
        else if (check == CHECK_ON_OPPONENT)
        {
            console.log("CHECK on opponent found, allow move, but show message");
            message.innerHTML = "Check on opponent.";
        }
        else if (check == CHECK_MATE)
        {
            console.log("CHECK Mate found");
            message.innerHTML = "Check mate.";
        }

        console.log("Legal Queen move");

        checkForCapture();

        return true;

        break;

      case PIECE_TYPE_KING:

          // must be an adjacent square

          var firstSquareRow = Math.trunc(firstSquareChosen / BOARD_SIZE);
          var secondSquareRow = Math.trunc(secondSquareChosen / BOARD_SIZE);
          var firstSquareCol = Math.trunc(firstSquareChosen % BOARD_SIZE);
          var secondSquareCol = Math.trunc(secondSquareChosen % BOARD_SIZE);

          var rowOffset = Math.abs(firstSquareRow - secondSquareRow);
          var colOffset = Math.abs(firstSquareCol - secondSquareCol);

          if (((rowOffset == 0) && (colOffset == 1)) || ((rowOffset == 1) && (colOffset == 0)) || ((rowOffset == 1) && (colOffset == 1)))
          {
              console.log("Good king move so far");
          }
          else
          {
            console.log("Illegal King Move");
            return false;
          }

          var check = isCheckOrCheckMate();

          if (check == CHECK_ON_ME)
          {
              console.log("CHECK on me found, illegal move, reject");
              message.innerHTML = "Check on my own king.  Illegal move.";
              return false;
          }
          else if (check == CHECK_ON_OPPONENT)
          {
              console.log("CHECK on opponent found, allow move, but show message");
              message.innerHTML = "Check on opponent.";
          }
          else if (check == CHECK_MATE)
          {
              console.log("CHECK Mate found");
              message.innerHTML = "Check mate.";
          }

          checkForCapture();

          return true;

        break;

      default:

    }

}

// ------------------------------------------------------------------

function isCheckOrCheckMate()
{
    // Check every piece on the board to see if it can attach the opponent's king

    var checkStatus = NO_CHECK;
    var i = 0;

    var firstArrayToCheck = (turn == PLAYER_1) ? player1Pieces : player2Pieces;
    var secondArrayToCheck = (turn == PLAYER_1) ? player2Pieces : player1Pieces;

    var myKing = findKing(firstArrayToCheck);

    // check second pieces array first.  If I moved out of the way and gave my opponent a view to my King, need to reject the move, unless I'm capturing the piece that has access to my king
    for (i=0; i<secondArrayToCheck.length; i++)
    {
        switch (secondArrayToCheck[i].type)
        {
            // not possible scenarios - these pieces can't go "into check" by me moving out of the way
            case PIECE_TYPE_PAWN: case PIECE_TYPE_KNIGHT: case PIECE_TYPE_KING:
            case PIECE_TYPE_ROOK: case PIECE_TYPE_QUEEN: case PIECE_TYPE_BISHOP:

            console.log("----- Calling canPieceGetKing - Can my opponent get my king?");

            if (secondArrayToCheck[i].square != secondSquareChosen)
            {

                // check if this current piece can get to the king
                var returnCheck = canPieceGetKing(secondArrayToCheck, i, firstArrayToCheck, myKing);

                if (returnCheck == CHECK)
                  return CHECK_ON_ME;
            }

                break;

            default:

              console.log("Error scenario - bad piece type");

        }

    }

    var hisKing = findKing(secondArrayToCheck);

    i = 0;
    while ((i < firstArrayToCheck.length) && (checkStatus == NO_CHECK))
    {
        // check if current piece can get to the opponent's king
        console.log("----- Calling canPieceGetKing - Can I get my opponent's king?");
        var returnCheck = canPieceGetKing(firstArrayToCheck, i, secondArrayToCheck, hisKing);

        if (returnCheck == CHECK)
        {
          console.log("Check found");
          checkStatus = CHECK_ON_OPPONENT;
        }
        else
        {
            i++;
        }
    }

    return checkStatus;


    // // check fror checkmate if nec - working on this below
    // if (checkStatus == CHECK)
    // {
    //     var checkMateTemp = checkForCheckMate();
    //
    //     if (checkMateTemp == CHECK_MATE)
    //       return checkMateTemp;
    //     else
    //       return checkStatus;
    //
    // }
    // else
    //   return NO_CHECK;

}



// --------------------------------------------------------------------

function checkForCheckMate()
{

    // establish opponent king location

    // handle case where my king can't move anywhere

    // handle case where opponent can save check mate by moving one of their other pieces "in the way" or by capturing my piece


}


// --------------------------------------------------------------------
//
function canPieceGetKing(array1, array1Index, array2, kingLocation)
{
    // console.log("canPieceGetKing called - piece is " + array1[array1Index].type);

    // check if this piece is the one I moved.  If yes, don't use my .square value from the array, use my new square where I'm trying to go to
    var firstSquareTemp;

    if (array1[array1Index].square == firstSquareChosen)
    {
      firstSquareTemp = secondSquareChosen;
    }
    else
    {
      firstSquareTemp = array1[array1Index].square;
    }

    var kingTemp;

    // check if I moved my king into a check situation
    if (array2[kingLocation].square == firstSquareChosen)
    {
      console.log("This is from a moved king.")
      kingTemp = secondSquareChosen;
    }
    else
    {
      kingTemp = array2[kingLocation].square;
    }

    switch (array1[array1Index].type)
    {

          case PIECE_TYPE_PAWN:

            console.log("canPieceGetKing called, piece is a pawn.  firstSquare is " + array1[array1Index].square + " king square is " + kingTemp);

            if (turn == PLAYER_1)
            {
                if (((firstSquareTemp + BOARD_SIZE + 1) == kingTemp) || ((firstSquareTemp + BOARD_SIZE - 1) == kingTemp))
                {
                  console.log("Found a check");
                  return CHECK;
                }
            }
            else
            {
                  if ((firstSquareTemp == (kingTemp + BOARD_SIZE + 1)) || (firstSquareTemp == (kingTemp + BOARD_SIZE - 1)))
                  {
                    console.log("Found a check");
                    return CHECK;
                  }
            }

            break;

          case PIECE_TYPE_ROOK: // ------------------------------------------------------

              var firstSquareRow = Math.trunc(firstSquareTemp / BOARD_SIZE);;
              var secondSquareRow = secondSquareRow = Math.trunc(kingTemp / BOARD_SIZE);

              console.log("canPieceGetKing called, piece is a rook.  firstSquareRow is " + firstSquareRow + " secondSquareRow is " + secondSquareRow);

              // doesn't matter if player 1 or 2.  Rooks can go in any of the 4 directions.
              // Simple math to check if a valid rook move.  Horizontal or vertical only.  No diag.

              if ( (((firstSquareTemp - kingTemp) % BOARD_SIZE) != 0) &&
                   (firstSquareRow != secondSquareRow))
              {
                console.log("Rook - no check");
                return NO_CHECK;
              }

              console.log("Passed first check with rook successfully");
              // check if valid check, no pieces between first and second square chosen

              var i = 0;  // while loop counter
              var legal = true;
              var numChecksNeeded;
              var currSquare = firstSquareTemp;

              // Scenario 1 - Check vertical column -------------------------------------
              if (((firstSquareTemp - kingTemp) % BOARD_SIZE) == 0)
              {
                  // calculate # of cells to check in between first and second square
                  numChecksNeeded = Math.abs(((firstSquareTemp - kingTemp) / BOARD_SIZE)) - 1;

                  // loop until all cells are checked or you find a non-blank square in the way.
                  while ((i < numChecksNeeded) && (legal == true))
                  {
                      // either traverse up or down the board
                      if (firstSquareTemp < kingTemp)
                        currSquare += BOARD_SIZE;
                      else
                        currSquare -= BOARD_SIZE;

                      // conditions to check:
                      // if square is empty, keep checking
                      // Or if the square is where I am moving from...
                      // And... the square I'm moving too isn't the current square, then keep checking

                      if (((isSquareEmpty(currSquare) == true) || (firstSquareChosen == currSquare)) && (secondSquareChosen != currSquare))
                        i++;
                      else  // cell is not empty, illegal move
                        legal = false;
                  }

              }
              else  // If not same column, must be Same row ----------------------------
              {
                numChecksNeeded = Math.abs((firstSquareTemp - kingTemp)) - 1;

                while ((i < numChecksNeeded) && (legal == true))
                {
                    if (firstSquareTemp < kingTemp)
                      currSquare += 1;
                    else
                      currSquare -= 1;

                    if (((isSquareEmpty(currSquare) == true) || (firstSquareChosen == currSquare)) && (secondSquareChosen != currSquare))
                      i++;
                    else
                      legal = false;
                }

              }

              console.log("Checking got this far - legal is " + legal);

              if (legal == false)
                return NO_CHECK;
              else
              {
                console.log("Check found");
                return CHECK;
              }

            break;


          case PIECE_TYPE_KNIGHT:   // ---------------------------------------------

              console.log("Knight canPieceGetKing called");
              // move checks don't depend on the player, any knight can move in any direction

              var firstSquareRow = Math.trunc(firstSquareTemp / BOARD_SIZE);
              var secondSquareRow = Math.trunc(kingTemp / BOARD_SIZE);
              var firstSquareCol = Math.trunc(firstSquareTemp % BOARD_SIZE);
              var secondSquareCol = Math.trunc(kingTemp % BOARD_SIZE);

              var rowOffset = Math.abs(firstSquareRow - secondSquareRow);
              var colOffset = Math.abs(firstSquareCol - secondSquareCol);

              // first square and second square offset must be 2 rows and 1 column or 2 columns and 1 row
              if (((rowOffset == 2) && (colOffset == 1)) || ((rowOffset == 1) && (colOffset == 2)))
              {
                  return CHECK;
              }
              else
              {
                  return NO_CHECK;
              }

            break;


          case PIECE_TYPE_BISHOP:  // ---------------------------------------------------------------

            console.log("Bishop canPieceGetKing called");

            var firstSquareRow = Math.trunc(firstSquareTemp / BOARD_SIZE);
            var secondSquareRow = Math.trunc(kingTemp / BOARD_SIZE);
            var firstSquareCol = Math.trunc(firstSquareTemp % BOARD_SIZE);
            var secondSquareCol = Math.trunc(kingTemp % BOARD_SIZE);

            var rowOffset = Math.abs(firstSquareRow - secondSquareRow);
            var colOffset = Math.abs(firstSquareCol - secondSquareCol);

            if (rowOffset != colOffset)
            {
              console.log("Illegal bishop move");
              return NO_CHECK;
            }

            var i = 0;
            var legal = true;   // assume true, return false if nec
            var currSquare = firstSquareTemp;

            // calculate # of cells to check in between first and second square
            numChecksNeeded = Math.abs(firstSquareRow - secondSquareRow) - 1;

            console.log("Num checks needed  = " + numChecksNeeded);

            // loop until all cells are checked or you find a non-blank square in the way.
            while (i < numChecksNeeded)
            {
                if (firstSquareTemp < kingTemp) // must go down
                {
                    console.log("Must go down");

                    if (firstSquareCol < secondSquareCol) // must go right
                    {
                        console.log("Must go right");
                        currSquare += BOARD_SIZE + 1;
                    }
                    else   // must go right
                    {
                        console.log("Must go left");
                        currSquare += BOARD_SIZE - 1;
                    }


                    // conditions to check:
                    // if square is empty, keep checking
                    // Or if the square is where I am moving from...
                    // And... the square I'm moving too isn't the current square, then keep checking

                    if (((isSquareEmpty(currSquare) == true) || (firstSquareChosen == currSquare)) && (secondSquareChosen != currSquare))
                      i++;
                    else  // cell is not empty, illegal move
                      return NO_CHECK;

                }
                else  // must go up
                {
                    if (firstSquareCol < secondSquareCol) // must go left
                    {
                        console.log("Must go left");
                        currSquare -= BOARD_SIZE - 1;
                    }
                    else   // must go right
                    {
                        console.log("Must go right");
                        currSquare -= BOARD_SIZE + 1;
                    }

                    if (((isSquareEmpty(currSquare) == true) || (firstSquareChosen == currSquare)) && (secondSquareChosen != currSquare))
                      i++;
                    else  // cell is not empty, illegal move
                      return NO_CHECK;

                  }

            } // end while loop

            if (legal == true) return CHECK;

            break;


          case PIECE_TYPE_QUEEN:

            // console.log("Queen canPieceGetKing called");
            // move checks don't depend on the player, any queen can move in any direction

            // Figure out which move scenario

            var firstSquareRow = Math.trunc(firstSquareTemp / BOARD_SIZE);
            var secondSquareRow = Math.trunc(kingTemp / BOARD_SIZE);
            var firstSquareCol = Math.trunc(firstSquareTemp % BOARD_SIZE);
            var secondSquareCol = Math.trunc(kingTemp % BOARD_SIZE);

            var rowOffset = Math.abs(firstSquareRow - secondSquareRow);
            var colOffset = Math.abs(firstSquareCol - secondSquareCol);


            console.log("canPieceGetKing called, piece is a queen.  firstSquareRow is " + firstSquareRow + " secondSquareRow is " + secondSquareRow + " rowoffset is " + rowOffset + " col offset is " + colOffset);

            var i = 0;
            var legal = true;   // assume true, return false if nec
            var currSquare = firstSquareTemp;

            // scenario 1 - same row  -------------------------------------------------------
            if (firstSquareRow == secondSquareRow)
            {
                var numChecksNeeded = Math.abs((firstSquareTemp - kingTemp)) - 1;

                while (i < numChecksNeeded)
                {
                    if (firstSquareTemp < kingTemp)
                      currSquare += 1;
                    else
                      currSquare -= 1;

                      // conditions to check:
                      // if square is empty, keep checking
                      // Or if the square is where I am moving from...
                      // And... the square I'm moving too isn't the current square, then keep checking

                      if (((isSquareEmpty(currSquare) == true) || (firstSquareChosen == currSquare)) && (secondSquareChosen != currSquare))
                        i++;
                    else
                      return NO_CHECK;
                }
            }
            else if (firstSquareCol == secondSquareCol)   // scenario 2 - same col -----------
                  {

                      // calculate # of cells to check in between first and second square
                      var numChecksNeeded = Math.abs(((firstSquareTemp - kingTemp) / BOARD_SIZE)) - 1;

                      // loop until all cells are checked or you find a non-blank square in the way.
                      while (i < numChecksNeeded)
                      {
                          // either traverse up or down the board
                          if (firstSquareTemp < kingTemp)
                            currSquare += BOARD_SIZE;
                          else
                            currSquare -= BOARD_SIZE;

                          // if square is empty, increment i and keep checking.
                          // conditions to check:
                          // if square is empty, keep checking
                          // Or if the square is where I am moving from...
                          // And... the square I'm moving too isn't the current square, then keep checking

                          if (((isSquareEmpty(currSquare) == true) || (firstSquareChosen == currSquare)) && (secondSquareChosen != currSquare))
                                i++;
                          else  // cell is not empty, illegal move
                            return NO_CHECK;
                      }  // end same col if

                  }
                  else if (rowOffset == colOffset)  // scenario 3 - diagonal ----------------
                  {

                    console.log("Diag queen");

                    // calculate # of cells to check in between first and second square
                    numChecksNeeded = Math.abs(firstSquareRow - secondSquareRow) - 1;

                    console.log("Num checks needed  = " + numChecksNeeded);

                    // loop until all cells are checked or you find a non-blank square in the way.
                    while (i < numChecksNeeded)
                    {
                        if (firstSquareTemp < kingTemp) // must go down
                        {
                            console.log("Must go down");

                            if (firstSquareCol < secondSquareCol) // must go right
                            {
                                console.log("Must go right");
                                currSquare += BOARD_SIZE + 1;
                            }
                            else   // must go right
                            {
                                console.log("Must go left");
                                currSquare += BOARD_SIZE - 1;
                            }

                            // conditions to check:
                            // if square is empty, keep checking
                            // Or if the square is where I am moving from...
                            // And... the square I'm moving too isn't the current square, then keep checking

                            if (((isSquareEmpty(currSquare) == true) || (firstSquareChosen == currSquare)) && (secondSquareChosen != currSquare))
                                i++;
                            else  // cell is not empty, illegal move
                              return NO_CHECK;

                        }
                        else  // must go up
                        {
                            if (firstSquareCol < secondSquareCol) // must go left
                            {
                                console.log("Must go left");
                                currSquare -= BOARD_SIZE - 1;
                            }
                            else   // must go right
                            {
                                console.log("Must go right");
                                currSquare -= BOARD_SIZE + 1;
                            }

                            // conditions to check:
                            // if square is empty, keep checking
                            // Or if the square is where I am moving from...
                            // And... the square I'm moving too isn't the current square, then keep checking

                            if (((isSquareEmpty(currSquare) == true) || (firstSquareChosen == currSquare)) && (secondSquareChosen != currSquare))
                              i++;
                            else  // cell is not empty, illegal move
                              return NO_CHECK;

                          }

                    } // end while loop

                  } // end if diag
                  else return NO_CHECK; // can't get from queen to king

            return CHECK;

            break;

          case PIECE_TYPE_KING:

              // must be an adjacent square
              var firstSquareRow = Math.trunc(firstSquareTemp / BOARD_SIZE);
              var secondSquareRow = Math.trunc(kingTemp / BOARD_SIZE);
              var firstSquareCol = Math.trunc(firstSquareTemp % BOARD_SIZE);
              var secondSquareCol = Math.trunc(kingTemp % BOARD_SIZE);

              var rowOffset = Math.abs(firstSquareRow - secondSquareRow);
              var colOffset = Math.abs(firstSquareCol - secondSquareCol);

              if (((rowOffset == 0) && (colOffset == 1)) || ((rowOffset == 1) && (colOffset == 0)) || ((rowOffset == 1) && (colOffset == 1)))
              {
                  return CHECK;
              }
              else
              {
                return NO_CHECK;
              }

            break;

          default:

            console.log("Missing piece default");

    } // end switch


}     // end function canPieceGetKing

// --------------------------------------------------------------------

function findKing(whichArrayToCheck)
{
    var i=0;

    while (i<whichArrayToCheck.length)
    {
      if (whichArrayToCheck[i].type == PIECE_TYPE_KING)
      {
        console.log("Other player king found at " + i);
        return i;
      }
      else
      {
          i++;
      }
    }

    console.log("Error condition - No king found");

}

// --------------------------------------------------------------------

function checkForCapture()
{
      console.log("In function checkForCapture");

      var whosePiece1 = whosePieceIsThis(firstSquareChosen);
      var whosePiece2 = whosePieceIsThis(secondSquareChosen);

      if (whosePiece2 == NO_PLAYER)
      {
          // simply move piece to second square chosen

          if (turn == PLAYER_1)
          {
              player1Pieces[currentPieceArrayIndex].square = secondSquareChosen;
              // turn = PLAYER_2;
          }
          else
          {
              player2Pieces[currentPieceArrayIndex].square = secondSquareChosen;
              // turn = PLAYER_1;
          }

      }
      else   // tried to land on a player's piece
      {
          if (turn == PLAYER_1)
          {
              if (whosePiece2 == PLAYER_2) // capture
              {
                  capturePiece();
                  player1Pieces[currentPieceArrayIndex].square = secondSquareChosen;
                  // turn = PLAYER_2;
                  // return true;
                  // delete player 2 piece
              }
              // else return false;
          } // end if player 1 turn
          else   // player 2 turn
          {
              if (whosePiece2 == PLAYER_1) // capture
              {
                  capturePiece();
                  player2Pieces[currentPieceArrayIndex].square = secondSquareChosen;
                  // turn = PLAYER_1;
                  // return true;
                  // delete player 1 piece
              }
              // else return false;

          }

      }  // end else landed on player piece
}


// ----------------------------------------

function capturePiece()
{
    console.log("Capture piece called");

    var pieceIndex = whichPieceInSquare(secondSquareChosen);

    if (turn == PLAYER_1)
    {
        player2LostPieces.push(player2Pieces[pieceIndex]);
        player2Pieces.splice(pieceIndex,1);
    }
    else // player 2 turn
    {
        player1LostPieces.push(player1Pieces[pieceIndex]);
        player1Pieces.splice(pieceIndex,1);
    }

}   // end function capture piece

// ----------------------------------------
function getSquareStatus(squareNum)
{

    var i;

    for (i=0;i<player1Pieces.length;i++)
    {
      if (player1Pieces[i].square == squareNum)
        return [PLAYER_1,i];
    }

    for (i=0;i<player2Pieces.length;i++)
    {
      if (player2Pieces[i].square == squareNum)
        return [PLAYER_2,i];
    }

    return [NO_PLAYER,0];

}


// ----------------------------------------

function whichPieceIsThis()
{
    var whichArray = (turn == PLAYER_1) ? player1Pieces : player2Pieces;

    return whichArray[currentPieceArrayIndex].type;

}

// ---------------------------------------

function isSquareEmpty(squareNum)
{
    var i;

    for (i=0;i<player1Pieces.length;i++)
    {
      if (player1Pieces[i].square == squareNum)
        return false;
    }

    for (i=0;i<player2Pieces.length;i++)
    {
      if (player2Pieces[i].square == squareNum)
        return false;
    }

    return true;
}


// ---------------------------------------

function whichPieceInSquare(squareNum)
{
    var i;

    for (i=0;i<player1Pieces.length;i++)
    {
      if (player1Pieces[i].square == squareNum)
        return i;
    }

    for (i=0;i<player2Pieces.length;i++)
    {
      if (player2Pieces[i].square == squareNum)
        return i;
    }

}

// ---------------------------------------

function whosePieceIsThis(squareNum)
{
    var i;

    for(i=0;i<player1Pieces.length;i++)
    {
      if (player1Pieces[i].square == squareNum)
        return PLAYER_1;
    }

    for(i=0;i<player2Pieces.length;i++)
    {
      if (player2Pieces[i].square == squareNum)
        return PLAYER_2;
    }

    return NO_PLAYER;

}

// ---------------------------------------
// Called just once at beginning of first game

function createBoard()
{
    var i;

    // get the board
    var myBoard = document.getElementById("board");
    myBoard.innerHTML = "";

    //  set the width and height styles to the number of pixels
    myBoard.style.width = (BOARD_SIZE*SQUARE_SIZE) + "px";
    myBoard.style.height = (BOARD_SIZE*SQUARE_SIZE) + "px";

    // Create the squares
    for (i=0;i<BOARD_SIZE*BOARD_SIZE;i++)
    {
      myBoard.innerHTML = myBoard.innerHTML + '<div class="square" id="' + i + '"></div>';
    }

    // alert(myBoard.innerHTML);

    loadStandardBoard();

    // loadTestBoard1(); // rook test - my king

    // loadTestBoard2();  // rook test - my king

    // loadTestBoard3();   // rook test - opp king

    // loadTestBoard4();

    // loadTestBoard5();

    //loadTestBoard6();

    // loadTestBoard7();

    // loadTestBoard8();  // pawns in final row testing
}

// --------------------------------------------------------------

// vertical rook check
function loadTestBoard1()
{

  // push the pieces onto each players arrays
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:8, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:9, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:10, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:11, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:12, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:13, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:14, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:15, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_ROOK, square:19, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_ROOK, square:7, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:1, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:6, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:2, symbol: "B"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:5, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_KING, square:3, symbol: "K"});
  // player1Pieces.push({type: PIECE_TYPE_QUEEN, square:4, symbol: "Q"});

  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:48, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:49, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:50, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:52, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:53, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:54, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:55, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_ROOK, square:56, symbol: "R"});
  player2Pieces.push({type: PIECE_TYPE_ROOK, square:59, symbol: "R"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:57, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:62, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:58, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:61, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});
  // player2Pieces.push({type: PIECE_TYPE_QUEEN, square:60, symbol: "Q"});

} // test board 1


//  ------------ horizontal rook check,

function loadTestBoard2()
{

  // push the pieces onto each players arrays
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:8, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:9, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:10, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:11, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:12, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:13, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:14, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:15, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_ROOK, square:27, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_ROOK, square:7, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:1, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:6, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:2, symbol: "B"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:5, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_KING, square:25, symbol: "K"});
  // player1Pieces.push({type: PIECE_TYPE_QUEEN, square:4, symbol: "Q"});

  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:48, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:49, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:50, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:52, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:53, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:54, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:55, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_ROOK, square:56, symbol: "R"});
  player2Pieces.push({type: PIECE_TYPE_ROOK, square:29, symbol: "R"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:57, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:62, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:58, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:61, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});
  // player2Pieces.push({type: PIECE_TYPE_QUEEN, square:60, symbol: "Q"});

} // test board 2

// ---------------------------------------------------------------------

function loadTestBoard3()
{

  // push the pieces onto each players arrays
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:8, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:9, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:10, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:11, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:12, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:13, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:14, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:15, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_ROOK, square:24, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_ROOK, square:7, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:1, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:6, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:2, symbol: "B"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:5, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_KING, square:3, symbol: "K"});
  // player1Pieces.push({type: PIECE_TYPE_QUEEN, square:4, symbol: "Q"});

  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:48, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:49, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:50, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:52, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:53, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:54, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:55, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_ROOK, square:56, symbol: "R"});
  player2Pieces.push({type: PIECE_TYPE_ROOK, square:29, symbol: "R"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:57, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:62, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:58, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:61, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});
  // player2Pieces.push({type: PIECE_TYPE_QUEEN, square:60, symbol: "Q"});
  player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});

} // test board 3

// -------------------------------------------------------------

function loadTestBoard4()
{

  // push the pieces onto each players arrays
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:8, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:9, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:10, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:11, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:12, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:13, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:14, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:15, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_ROOK, square:24, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_ROOK, square:7, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:1, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:6, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:2, symbol: "B"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:5, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_KING, square:3, symbol: "K"});
  // player1Pieces.push({type: PIECE_TYPE_QUEEN, square:4, symbol: "Q"});

  player2Pieces.push({type: PIECE_TYPE_PAWN, square:18, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:49, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:50, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:52, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:53, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:54, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:55, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_ROOK, square:56, symbol: "R"});
  player2Pieces.push({type: PIECE_TYPE_ROOK, square:29, symbol: "R"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:57, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:62, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:58, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:61, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});
  // player2Pieces.push({type: PIECE_TYPE_QUEEN, square:60, symbol: "Q"});
  player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});

} // test board 4


// -------------------------------------------------------------

function loadTestBoard5()
{

  // push the pieces onto each players arrays
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:8, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:9, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:10, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:11, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:12, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:13, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:14, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:15, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_ROOK, square:24, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_ROOK, square:7, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:1, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:6, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:2, symbol: "B"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:5, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_KING, square:3, symbol: "K"});
  // player1Pieces.push({type: PIECE_TYPE_QUEEN, square:4, symbol: "Q"});

  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:18, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:49, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:50, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:52, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:53, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:54, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:55, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_ROOK, square:56, symbol: "R"});
  player2Pieces.push({type: PIECE_TYPE_ROOK, square:29, symbol: "R"});
  player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:56, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:62, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:58, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:61, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});
  // player2Pieces.push({type: PIECE_TYPE_QUEEN, square:60, symbol: "Q"});
  player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});

} // test board 5

// ---------------------------------------------------------------------
function loadTestBoard6()
{

  // push the pieces onto each players arrays
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:8, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:9, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:10, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:11, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:12, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:13, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:14, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:15, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_ROOK, square:24, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_ROOK, square:7, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:1, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:6, symbol: "H"});
   player1Pieces.push({type: PIECE_TYPE_BISHOP, square:2, symbol: "B"});
   player1Pieces.push({type: PIECE_TYPE_BISHOP, square:5, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_KING, square:3, symbol: "K"});
  // player1Pieces.push({type: PIECE_TYPE_QUEEN, square:4, symbol: "Q"});

  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:18, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:49, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:50, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:52, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:53, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:54, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:55, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_ROOK, square:56, symbol: "R"});
  // player2Pieces.push({type: PIECE_TYPE_ROOK, square:29, symbol: "R"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:56, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:62, symbol: "H"});
   player2Pieces.push({type: PIECE_TYPE_BISHOP, square:58, symbol: "B"});
   player2Pieces.push({type: PIECE_TYPE_BISHOP, square:61, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});
  // player2Pieces.push({type: PIECE_TYPE_QUEEN, square:60, symbol: "Q"});
  player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});

} // test board 6

// ---------------------------------------------------------------------
function loadTestBoard7()
{

  // push the pieces onto each players arrays
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:8, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:9, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:10, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:11, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:12, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:13, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:14, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:15, symbol: "P"});
   player1Pieces.push({type: PIECE_TYPE_ROOK, square:24, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_ROOK, square:7, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:1, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:6, symbol: "H"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:2, symbol: "B"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:5, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_KING, square:3, symbol: "K"});
   player1Pieces.push({type: PIECE_TYPE_QUEEN, square:4, symbol: "Q"});

  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:18, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:49, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:50, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:52, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:53, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:54, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:55, symbol: "P"});
   player2Pieces.push({type: PIECE_TYPE_ROOK, square:56, symbol: "R"});
  // player2Pieces.push({type: PIECE_TYPE_ROOK, square:29, symbol: "R"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:56, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:62, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:58, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:61, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});
   player2Pieces.push({type: PIECE_TYPE_QUEEN, square:60, symbol: "Q"});
  player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});

} // test board 7


// ---------------------------------------------------------------------
function loadTestBoard8()
{

  // push the pieces onto each players arrays
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:47, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:7, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:10, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:11, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:12, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:13, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:14, symbol: "P"});
  // player1Pieces.push({type: PIECE_TYPE_PAWN, square:15, symbol: "P"});
   player1Pieces.push({type: PIECE_TYPE_ROOK, square:24, symbol: "R"});
  // player1Pieces.push({type: PIECE_TYPE_ROOK, square:7, symbol: "R"});
  player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:1, symbol: "H"});
  player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:6, symbol: "H"});
  player1Pieces.push({type: PIECE_TYPE_BISHOP, square:2, symbol: "B"});
  // player1Pieces.push({type: PIECE_TYPE_BISHOP, square:5, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_KING, square:3, symbol: "K"});
   player1Pieces.push({type: PIECE_TYPE_QUEEN, square:4, symbol: "Q"});

   player2Pieces.push({type: PIECE_TYPE_PAWN, square:31, symbol: "P"});
  player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:50, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:52, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:53, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:54, symbol: "P"});
  // player2Pieces.push({type: PIECE_TYPE_PAWN, square:55, symbol: "P"});
   player2Pieces.push({type: PIECE_TYPE_ROOK, square:56, symbol: "R"});
  player2Pieces.push({type: PIECE_TYPE_ROOK, square:29, symbol: "R"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:56, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:62, symbol: "H"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:58, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_BISHOP, square:61, symbol: "B"});
  // player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});
   player2Pieces.push({type: PIECE_TYPE_QUEEN, square:60, symbol: "Q"});
  player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});

} // test board 8



// --------------------------------------------------------------

function loadStandardBoard()
{

  // push the pieces onto each players arrays
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:8, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:9, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:10, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:11, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:12, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:13, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:14, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_PAWN, square:15, symbol: "P"});
  player1Pieces.push({type: PIECE_TYPE_ROOK, square:0, symbol: "R"});
  player1Pieces.push({type: PIECE_TYPE_ROOK, square:7, symbol: "R"});
  player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:1, symbol: "H"});
  player1Pieces.push({type: PIECE_TYPE_KNIGHT, square:6, symbol: "H"});
  player1Pieces.push({type: PIECE_TYPE_BISHOP, square:2, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_BISHOP, square:5, symbol: "B"});
  player1Pieces.push({type: PIECE_TYPE_KING, square:3, symbol: "K"});
  player1Pieces.push({type: PIECE_TYPE_QUEEN, square:4, symbol: "Q"});

  player2Pieces.push({type: PIECE_TYPE_PAWN, square:48, symbol: "P"});
  player2Pieces.push({type: PIECE_TYPE_PAWN, square:49, symbol: "P"});
  player2Pieces.push({type: PIECE_TYPE_PAWN, square:50, symbol: "P"});
  player2Pieces.push({type: PIECE_TYPE_PAWN, square:51, symbol: "P"});
  player2Pieces.push({type: PIECE_TYPE_PAWN, square:52, symbol: "P"});
  player2Pieces.push({type: PIECE_TYPE_PAWN, square:53, symbol: "P"});
  player2Pieces.push({type: PIECE_TYPE_PAWN, square:54, symbol: "P"});
  player2Pieces.push({type: PIECE_TYPE_PAWN, square:55, symbol: "P"});
  player2Pieces.push({type: PIECE_TYPE_ROOK, square:56, symbol: "R"});
  player2Pieces.push({type: PIECE_TYPE_ROOK, square:63, symbol: "R"});
  player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:57, symbol: "H"});
  player2Pieces.push({type: PIECE_TYPE_KNIGHT, square:62, symbol: "H"});
  player2Pieces.push({type: PIECE_TYPE_BISHOP, square:58, symbol: "B"});
  player2Pieces.push({type: PIECE_TYPE_BISHOP, square:61, symbol: "B"});
  player2Pieces.push({type: PIECE_TYPE_KING, square:59, symbol: "K"});
  player2Pieces.push({type: PIECE_TYPE_QUEEN, square:60, symbol: "Q"});

}


// ----------------------------------------
// Called any time the data changes

function drawBoard()
{
    console.log("Draw board called");

    // get the array of squares from the HTML page
    var squares = document.querySelectorAll('.square');
    var i;  // for loop counter

    // Blank out all squares
    for (i=0;i<BOARD_SIZE*BOARD_SIZE;i++)
    {
      squares[i].style.backgroundColor = "red";
      squares[i].innerHTML = "";
    }

    // populate the board with player 1's pieces
    for (i=0; i<player1Pieces.length;i++)
    {
        squares[player1Pieces[i].square].style.color = "black";
        squares[player1Pieces[i].square].innerHTML = player1Pieces[i].symbol;
    }

    // populate the board with player 2's pieces
    for (i=0; i<player2Pieces.length;i++)
    {
        squares[player2Pieces[i].square].style.color = "green";
        squares[player2Pieces[i].square].innerHTML = player2Pieces[i].symbol;
    }

}
