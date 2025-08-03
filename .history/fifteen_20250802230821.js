// 15-Puzzle Game Implementation
// Grid is 4x4 with positions 0-15, where 15 is the blank space

let gameState = [];
let blankPosition = 15;
let tiles = [];
let timerInterval = null;
let timeElapsed = 0;
let moveCount = 0;
let gameStarted = false;
let currentTheme = 'background1'; // default theme
let isSolving = false; // Track if cheat solving is in progress

// Theme mapping for puzzle pieces and backgrounds
const themeImages = {
  'animals': {
    puzzleBg: 'animals.jpg',
    pageBg: 'animalsbg.png'
  },
  'nature': {
    puzzleBg: 'nature.jpg',
    pageBg: 'naturebg.png'
  },
  'space': {
    puzzleBg: 'space.jpg',
    pageBg: 'spacebg.png'
  },
  'ocean': {
    puzzleBg: 'ocean.jpg',
    pageBg: 'oceanbg.png'
  },
  'desert': {
    puzzleBg: 'desert.jpg',
    pageBg: 'desertbg.png'
  },
  'cityscape': {
    puzzleBg: 'cityscape.jpg',
    pageBg: 'cityscapebg.png'
  },
  'marvel': {
    puzzleBg: 'marvel.jpg',
    pageBg: 'marvelbg.png'
  },
  'retro': {
    puzzleBg: 'retrogame.png',
    pageBg: 'retrogamebg.png'
  }
};

// Function to apply selected theme
function applySelectedTheme() {
  const selectedTheme = localStorage.getItem('selectedTheme');
  if (selectedTheme && themeImages[selectedTheme]) {
    const themeData = themeImages[selectedTheme];
    currentTheme = themeData.puzzleBg;
    
    console.log('Applied theme:', selectedTheme);
    console.log('- Puzzle Background:', themeData.puzzleBg);
    console.log('- Page Background:', themeData.pageBg);
    
    // Update CSS for puzzle pieces and page background
    const style = document.createElement('style');
    style.textContent = `
      body {
        background-image: url("${themeData.pageBg}") !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        background-attachment: fixed !important;
        min-height: 100vh !important;
      }
      .puzzlepiece {
        background-image: url("${themeData.puzzleBg}") !important;
      }
    `;
    document.head.appendChild(style);
  } else {
    currentTheme = 'background1.jpg';
    console.log('Using default theme:', currentTheme);
    
    // Apply default styling
    const style = document.createElement('style');
    style.textContent = `
      body {
        background: #f0f0f0 !important;
      }
      .puzzlepiece {
        background-image: url("${currentTheme}") !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Debug function to check if elements exist
function debugElements() {
  const shuffleButton = document.getElementById('shufflebutton');
  const cheatButton = document.getElementById('cheatbutton');
  const puzzleArea = document.getElementById('puzzlearea');
  const timeElement = document.getElementById('time');
  const movesElement = document.getElementById('moves');
  const winMessage = document.getElementById('win-message');
  
  console.log('=== ELEMENT DEBUG INFO ===');
  console.log('Shuffle Button:', shuffleButton ? 'FOUND' : 'NOT FOUND');
  console.log('Cheat Button:', cheatButton ? 'FOUND' : 'NOT FOUND');
  console.log('Puzzle Area:', puzzleArea ? 'FOUND' : 'NOT FOUND');
  console.log('Time Element:', timeElement ? 'FOUND' : 'NOT FOUND');
  console.log('Moves Element:', movesElement ? 'FOUND' : 'NOT FOUND');
  console.log('Win Message:', winMessage ? 'FOUND' : 'NOT FOUND');
  console.log('========================');
  
  if (shuffleButton) {
    console.log('Shuffle Button Properties:', {
      tagName: shuffleButton.tagName,
      id: shuffleButton.id,
      className: shuffleButton.className,
      onclick: shuffleButton.onclick ? 'defined' : 'not defined'
    });
  }
  
  if (cheatButton) {
    console.log('Cheat Button Properties:', {
      tagName: cheatButton.tagName,
      id: cheatButton.id,
      className: cheatButton.className,
      onclick: cheatButton.onclick ? 'defined' : 'not defined'
    });
  }
  
  return {
    shuffleButton,
    cheatButton,
    puzzleArea,
    timeElement,
    movesElement,
    winMessage
  };
}

window.onload = function () {
  console.log('Window loaded, starting initialization...');
  
  // Debug elements first
  const elements = debugElements();
  
  if (!elements.puzzleArea) {
    console.error('CRITICAL: puzzlearea element not found!');
    return;
  }
  
  if (!elements.shuffleButton) {
    console.error('CRITICAL: shufflebutton element not found!');
    return;
  }
  
  if (!elements.cheatButton) {
    console.error('CRITICAL: cheatbutton element not found!');
    return;
  }
  
  // Apply selected theme
  applySelectedTheme();
  
  initializePuzzle();
  setupEventListeners();
  console.log('Initialization complete');
};

function initializePuzzle() {
  console.log('Initializing puzzle...');
  const puzzleArea = document.getElementById("puzzlearea");
  
  if (!puzzleArea) {
    console.error('Cannot initialize puzzle: puzzlearea not found');
    return;
  }

  // Initialize game state
  for (let i = 0; i < 15; i++) {
    gameState[i] = i + 1;
  }
  gameState[15] = 0; // blank space
  blankPosition = 15;
  
  console.log('Initial game state:', gameState);

  // Create tile elements
  for (let i = 1; i <= 15; i++) {
    const tile = document.createElement("div");
    tile.className = "puzzlepiece";
    tile.textContent = i;
    tile.setAttribute("data-number", i);

    updateTilePosition(tile, i - 1);

    tile.addEventListener("click", () => handleTileClick(i));
    tile.addEventListener("mouseenter", () => handleTileHover(tile, i));
    tile.addEventListener("mouseleave", () => handleTileUnhover(tile));

    puzzleArea.appendChild(tile);
    tiles[i] = tile;
  }
  
  console.log('Puzzle tiles created:', tiles.length - 1, 'tiles');
}

function setupEventListeners() {
  console.log('Setting up event listeners...');
  
  const shuffleButton = document.getElementById("shufflebutton");
  const cheatButton = document.getElementById("cheatbutton");
  
  if (shuffleButton) {
    shuffleButton.addEventListener("click", function() {
      console.log("=== SHUFFLE BUTTON CLICKED ===");
      shufflePuzzle();
      resetStats();
      startTimer();
      gameStarted = true;
      console.log("Game started, timer should be running");
      console.log("=============================");
    });
    console.log('Shuffle button listener attached');
  } else {
    console.error('FAILED: Could not attach listener to shuffle button');
  }

  if (cheatButton) {
    cheatButton.addEventListener("click", function() {
      console.log("=== CHEAT BUTTON CLICKED ===");
      if (!gameStarted) {
        alert("Please shuffle the puzzle first!");
        console.log("Cheat blocked: game not started");
        return;
      }
      
      if (isSolving) {
        alert("Puzzle is already being solved! Please wait...");
        console.log("Cheat blocked: already solving");
        return;
      }
      
      if (checkIfSolved()) {
        alert("Puzzle is already solved!");
        return;
      }
      
      // Update button text and disable during solving
      cheatButton.textContent = "Solving...";
      cheatButton.disabled = true;
      isSolving = true;
      
      cheatSolve();
      console.log("===========================");
    });
    console.log('Cheat button listener attached');
  } else {
    console.error('FAILED: Could not attach listener to cheat button');
  }
}

function updateTilePosition(tile, position) {
  const row = Math.floor(position / 4);
  const col = position % 4;
  tile.style.left = (col * 100) + "px";
  tile.style.top = (row * 100) + "px";

  const tileNumber = parseInt(tile.getAttribute("data-number"));
  const tileRow = Math.floor((tileNumber - 1) / 4);
  const tileCol = (tileNumber - 1) % 4;
  tile.style.backgroundPosition = `-${tileCol * 100}px -${tileRow * 100}px`;
}

function getPosition(tileNumber) {
  return gameState.indexOf(tileNumber);
}

function isAdjacent(pos1, pos2) {
  const row1 = Math.floor(pos1 / 4);
  const col1 = pos1 % 4;
  const row2 = Math.floor(pos2 / 4);
  const col2 = pos2 % 4;

  return (row1 === row2 && Math.abs(col1 - col2) === 1) ||
         (col1 === col2 && Math.abs(row1 - row2) === 1);
}

function canMoveTile(tileNumber) {
  const tilePos = getPosition(tileNumber);
  return isAdjacent(tilePos, blankPosition);
}

function handleTileClick(tileNumber) {
  if (!gameStarted) {
    alert("Please shuffle the puzzle first!");
    return;
  }
  
  if (canMoveTile(tileNumber)) {
    console.log('Moving tile:', tileNumber);
    moveTile(tileNumber);
    moveCount++;
    updateStats();
    if (checkIfSolved()) {
      showWinMessage();
      stopTimer();
    }
  }
}

function moveTile(tileNumber) {
  const tilePos = getPosition(tileNumber);
  gameState[blankPosition] = tileNumber;
  gameState[tilePos] = 0;
  blankPosition = tilePos;
  updateTilePosition(tiles[tileNumber], gameState.indexOf(tileNumber));
}

function handleTileHover(tile, tileNumber) {
  if (gameStarted && canMoveTile(tileNumber)) {
    tile.classList.add("movablepiece");
  }
}

function handleTileUnhover(tile) {
  tile.classList.remove("movablepiece");
}

function shufflePuzzle() {
  console.log("Starting shuffle...");
  
  // Reset to solved state first
  for (let i = 0; i < 15; i++) {
    gameState[i] = i + 1;
  }
  gameState[15] = 0;
  blankPosition = 15;

  // Perform random valid moves to shuffle
  for (let i = 0; i < 1000; i++) {
    const movableTiles = [];
    for (let tile = 1; tile <= 15; tile++) {
      if (canMoveTile(tile)) {
        movableTiles.push(tile);
      }
    }
    if (movableTiles.length > 0) {
      const randomTile = movableTiles[Math.floor(Math.random() * movableTiles.length)];
      moveTile(randomTile);
    }
  }

  // Update visual positions of all tiles
  for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
    const position = getPosition(tileNumber);
    updateTilePosition(tiles[tileNumber], position);
    tiles[tileNumber].classList.remove("movablepiece");
  }
  
  console.log("Shuffle completed");
  console.log("New game state:", gameState);
}

function startTimer() {
  console.log("=== STARTING TIMER ===");
  
  // Check if time element exists
  const timeElement = document.getElementById('time');
  if (!timeElement) {
    console.error('CRITICAL: time element not found - timer will not work!');
    return;
  }
  
  stopTimer(); // Clear any existing timer
  timeElapsed = 0;
  updateStats();
  
  timerInterval = setInterval(function() {
    timeElapsed++;
    updateStats();
    console.log("Timer tick:", timeElapsed + " seconds");
  }, 1000);
  
  console.log("Timer started successfully, interval ID:", timerInterval);
  console.log("=====================");
}

function stopTimer() {
  if (timerInterval) {
    console.log("Stopping timer, interval ID:", timerInterval);
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetStats() {
  console.log("Resetting stats...");
  timeElapsed = 0;
  moveCount = 0;
  updateStats();
  
  const winMessage = document.getElementById("win-message");
  if (winMessage) {
    winMessage.textContent = "";
    winMessage.classList.remove("show");
  }
  
  // Reset cheat button when starting new game
  resetCheatButton();
  
  console.log("Stats reset complete");
}

function updateStats() {
  const timeElement = document.getElementById("time");
  const movesElement = document.getElementById("moves");
  
  if (timeElement) {
    timeElement.textContent = timeElapsed;
  } else {
    console.error('Cannot update time: time element not found');
  }
  
  if (movesElement) {
    movesElement.textContent = moveCount;
  } else {
    console.error('Cannot update moves: moves element not found');
  }
}

function showWinMessage() {
  const winMessage = document.getElementById("win-message");
  if (winMessage) {
    winMessage.textContent = "🎉 Puzzle Solved! Great job!";
    winMessage.classList.add("show");
  }
  
  // Reset cheat button state
  resetCheatButton();
  
  saveGameStats(moveCount, timeElapsed);
}

function resetCheatButton() {
  const cheatButton = document.getElementById("cheatbutton");
  if (cheatButton) {
    cheatButton.textContent = "Cheat";
    cheatButton.disabled = false;
  }
  isSolving = false;
}

function checkIfSolved() {
  for (let i = 0; i < 15; i++) {
    if (gameState[i] !== i + 1) return false;
  }
  return gameState[15] === 0;
}

function cheatSolve() {
  console.log("=== CHEAT SOLVE STARTED ===");
  
  if (checkIfSolved()) {
    alert("Puzzle is already solved!");
    resetCheatButton();
    return;
  }
  
  // Save current state before solving
  const savedState = [...gameState];
  const savedBlankPos = blankPosition;
  console.log("Saved state before cheat:", savedState);
  
  // Stop the timer during solving animation
  stopTimer();
  
  // Safety timeout to reset button if something goes wrong
  setTimeout(() => {
    if (isSolving) {
      console.log("Safety timeout triggered, resetting cheat button");
      resetCheatButton();
      if (!checkIfSolved()) {
        solveInstantly(); // Fallback to instant solve
      }
    }
  }, 60000); // 60 second timeout for complete solutions
  
  // Find solution steps and animate them
  solvePuzzleStepByStep(savedState, savedBlankPos);
}

// Step-by-step puzzle solver with animation
function solvePuzzleStepByStep(initialState, initialBlankPos) {
  console.log("Finding complete solution path...");
  
  // Show "Calculating..." on button
  const cheatButton = document.getElementById("cheatbutton");
  if (cheatButton) {
    cheatButton.textContent = "Calculating...";
  }
  
  // Use timeout to prevent UI blocking during calculation
  setTimeout(() => {
    const solutionSteps = findCompleteSolution(initialState, initialBlankPos);
    
    if (solutionSteps.length === 0) {
      console.log("Puzzle is already solved or no solution found");
      if (checkIfSolved()) {
        resetCheatButton();
        alert("Puzzle is already solved!");
      } else {
        console.log("No solution found, falling back to instant solve");
        solveInstantly();
      }
      return;
    }
    
    console.log(`Found complete solution in ${solutionSteps.length} steps:`, solutionSteps);
    animateSolutionSteps(solutionSteps);
  }, 100);
}

// A* optimal solver integrated from working implementation
function findCompleteSolution(initialState, initialBlankPos) {
  const targetState = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  
  // Check if already solved
  if (arraysEqual(initialState, targetState)) {
    return [];
  }
  
  console.log("Starting A* optimal solver...");
  console.log("Initial state:", initialState);
  
  // Convert state format for A* algorithm
  const aStarBoard = convertGameStateForAStar(initialState);
  const solution = aStarSearch(aStarBoard);
  
  if (solution && solution.length > 0) {
    console.log("A* found solution with", solution.length, "moves");
    return solution;
  } else {
    console.log("A* could not find solution, using fallback");
    // Fallback to a simpler approach if A* fails
    return findSimpleFallbackSolution(initialState, initialBlankPos);
  }
}

// Simple fallback if A* fails
function findSimpleFallbackSolution(initialState, initialBlankPos) {
  const moves = [];
  const maxMoves = 30;
  
  // Try to make some progress toward solution
  for (let i = 0; i < maxMoves; i++) {
    const validMoves = getValidMoves(initialState, initialBlankPos);
    if (validMoves.length === 0) break;
    
    // Pick a random valid move as fallback
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    moves.push(randomMove);
    
    if (moves.length >= 15) break; // Don't make too many moves
  }
  
  console.log("Fallback solution:", moves.length, "moves");
  return moves;
}

// A* Algorithm Implementation (from working solver)
function aStarSearch(startBoard) {
  const goalState = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  
  if (boardsEqual(startBoard, goalState)) {
    return [];
  }

  // Priority queue implementation using array
  const openSet = [{
    board: startBoard,
    g: 0,
    h: manhattanDistance(startBoard) + linearConflict(startBoard),
    f: 0,
    path: []
  }];
  
  openSet[0].f = openSet[0].g + openSet[0].h;
  
  const closedSet = new Set();
  const maxIterations = 100000; // Prevent infinite loops
  let iterations = 0;

  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Get node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    
    const boardKey = current.board.join(',');
    if (closedSet.has(boardKey)) {
      continue;
    }
    closedSet.add(boardKey);
    
    // Check if goal reached
    if (boardsEqual(current.board, goalState)) {
      console.log(`A* Solution found! Moves: ${current.path.length}, Iterations: ${iterations}`);
      // Convert path format to match existing system
      return current.path.map(move => move.tile);
    }
    
    // Generate neighbors
    const neighbors = getNeighbors(current.board);
    
    for (const neighbor of neighbors) {
      const neighborKey = neighbor.board.join(',');
      if (closedSet.has(neighborKey)) {
        continue;
      }
      
      const g = current.g + 1;
      const h = manhattanDistance(neighbor.board) + linearConflict(neighbor.board);
      const f = g + h;
      
      // Check if this path to neighbor is better
      const existingIndex = openSet.findIndex(node => 
        boardsEqual(node.board, neighbor.board)
      );
      
      if (existingIndex === -1 || g < openSet[existingIndex].g) {
        const newNode = {
          board: neighbor.board,
          g: g,
          h: h,
          f: f,
          path: [...current.path, neighbor.move]
        };
        
        if (existingIndex === -1) {
          openSet.push(newNode);
        } else {
          openSet[existingIndex] = newNode;
        }
      }
    }
    
    // Limit open set size to prevent memory issues
    if (openSet.length > 5000) {
      openSet.sort((a, b) => a.f - b.f);
      openSet.splice(2000); // Keep only best 2000 nodes
    }
  }
  
  console.log(`A* search completed. Iterations: ${iterations}. No solution found.`);
  return null; // No solution found
}

// Convert game state format to A* format and handle result
function convertGameStateForAStar(gameState) {
  // Convert from current format [1,2,3...15,0] to A* format [1,2,3...15,0]
  // The game state is already in the right format, just need to handle empty tile
  return gameState.map(tile => tile === 0 ? 0 : tile);
}

// Manhattan Distance Heuristic
function manhattanDistance(board) {
  let distance = 0;
  const size = 4;
  const emptyTile = 0;
  
  for (let i = 0; i < 16; i++) {
    if (board[i] !== emptyTile) {
      const currentRow = Math.floor(i / size);
      const currentCol = i % size;
      const targetPos = board[i] - 1; // Convert to 0-based indexing
      const targetRow = Math.floor(targetPos / size);
      const targetCol = targetPos % size;
      distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    }
  }
  return distance;
}

// Linear Conflict Heuristic (enhances Manhattan distance)
function linearConflict(board) {
  let conflicts = 0;
  const size = 4;
  const emptyTile = 0;
  
  // Row conflicts
  for (let row = 0; row < size; row++) {
    const rowTiles = [];
    for (let col = 0; col < size; col++) {
      const pos = row * size + col;
      const tile = board[pos];
      if (tile !== emptyTile) {
        const targetRow = Math.floor((tile - 1) / size);
        if (targetRow === row) {
          rowTiles.push({ tile, col });
        }
      }
    }
    
    // Count conflicts in this row
    for (let i = 0; i < rowTiles.length - 1; i++) {
      for (let j = i + 1; j < rowTiles.length; j++) {
        const tile1 = rowTiles[i];
        const tile2 = rowTiles[j];
        const targetCol1 = (tile1.tile - 1) % size;
        const targetCol2 = (tile2.tile - 1) % size;
        
        if ((tile1.col < tile2.col && targetCol1 > targetCol2) ||
            (tile1.col > tile2.col && targetCol1 < targetCol2)) {
          conflicts++;
        }
      }
    }
  }
  
  // Column conflicts
  for (let col = 0; col < size; col++) {
    const colTiles = [];
    for (let row = 0; row < size; row++) {
      const pos = row * size + col;
      const tile = board[pos];
      if (tile !== emptyTile) {
        const targetCol = (tile - 1) % size;
        if (targetCol === col) {
          colTiles.push({ tile, row });
        }
      }
    }
    
    // Count conflicts in this column
    for (let i = 0; i < colTiles.length - 1; i++) {
      for (let j = i + 1; j < colTiles.length; j++) {
        const tile1 = colTiles[i];
        const tile2 = colTiles[j];
        const targetRow1 = Math.floor((tile1.tile - 1) / size);
        const targetRow2 = Math.floor((tile2.tile - 1) / size);
        
        if ((tile1.row < tile2.row && targetRow1 > targetRow2) ||
            (tile1.row > tile2.row && targetRow1 < targetRow2)) {
          conflicts++;
        }
      }
    }
  }
  
  return conflicts * 2;
}

// Generate all possible neighbor states
function getNeighbors(board) {
  const neighbors = [];
  const emptyPos = board.indexOf(0);
  const size = 4;
  const emptyRow = Math.floor(emptyPos / size);
  const emptyCol = emptyPos % size;
  
  const directions = [
    {row: -1, col: 0, name: 'up'},
    {row: 1, col: 0, name: 'down'},
    {row: 0, col: -1, name: 'left'},
    {row: 0, col: 1, name: 'right'}
  ];
  
  for (const dir of directions) {
    const newRow = emptyRow + dir.row;
    const newCol = emptyCol + dir.col;
    
    if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
      const newPos = newRow * size + newCol;
      const newBoard = [...board];
      [newBoard[emptyPos], newBoard[newPos]] = [newBoard[newPos], newBoard[emptyPos]];
      
      neighbors.push({
        board: newBoard,
        move: {tile: board[newPos], from: newPos, to: emptyPos}
      });
    }
  }
  
  return neighbors;
}

// Helper function to compare boards
function boardsEqual(board1, board2) {
  return board1.every((tile, index) => tile === board2[index]);
}

// Get valid moves for existing system compatibility
function getValidMoves(state, blankPos) {
  const moves = [];
  const row = Math.floor(blankPos / 4);
  const col = blankPos % 4;
  
  const directions = [
    { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 }
  ];
  
  for (const dir of directions) {
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    
    if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
      const newPos = newRow * 4 + newCol;
      const tile = state[newPos];
      if (tile !== 0) {
        moves.push(tile);
      }
    }
  }
  
  return moves;
}

// Helper function to compare arrays (use boardsEqual for consistency)
function arraysEqual(a, b) {
  return boardsEqual(a, b);
}

// Human-like systematic solver provides complete step-by-step solution

// Animate the solution steps
function animateSolutionSteps(steps) {
  console.log("Animating solution steps:", steps);
  
  // If no steps found, just solve instantly
  if (steps.length === 0) {
    console.log("No animation steps, solving instantly");
    solveInstantly();
    return;
  }
  
  let stepIndex = 0;
  const animationSpeed = 800; // Balanced speed to show all steps clearly
  
  function animateNextStep() {
    if (stepIndex >= steps.length) {
      // Animation complete - if not fully solved, solve the rest instantly
      setTimeout(() => {
        const cheatButton = document.getElementById("cheatbutton");
        if (!checkIfSolved()) {
          console.log("Animation complete but not fully solved, finishing instantly");
          if (cheatButton) {
            cheatButton.textContent = "Completing...";
          }
          solveInstantly();
        } else {
          showWinMessage();
          console.log("Animated solve completed");
        }
      }, 300);
      return;
    }
    
    const tileToMove = steps[stepIndex];
    console.log(`Step ${stepIndex + 1}: Moving tile ${tileToMove}`);
    
    // Show progress
    const cheatButton = document.getElementById("cheatbutton");
    if (cheatButton) {
      cheatButton.textContent = `Step ${stepIndex + 1}/${steps.length}: Moving ${tileToMove}`;
    }
    
    // Check if the move is still valid
    if (!canMoveTile(tileToMove)) {
      console.log(`Tile ${tileToMove} can no longer move, skipping`);
      stepIndex++;
      setTimeout(animateNextStep, 100);
      return;
    }
    
    // Highlight the tile that's about to move
    if (tiles[tileToMove]) {
      tiles[tileToMove].style.transition = "all 0.3s ease-in-out";
      tiles[tileToMove].style.transform = "scale(1.15)";
      tiles[tileToMove].style.border = "4px solid #FFD700";
      tiles[tileToMove].style.boxShadow = "0 0 15px #FFD700";
    }
    
    setTimeout(() => {
      // Make the actual move
      moveTile(tileToMove);
      moveCount++;
      updateStats();
      
              // Reset tile styling
        if (tiles[tileToMove]) {
          tiles[tileToMove].style.transform = "scale(1)";
          tiles[tileToMove].style.border = "3px solid white";
          tiles[tileToMove].style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.3)";
        }
      
      stepIndex++;
      setTimeout(animateNextStep, animationSpeed * 0.3);
    }, animationSpeed * 0.4);
  }
  
  animateNextStep();
}

// Human-like systematic solver provides complete step-by-step solution

// Keep the instant solve as fallback
function solveInstantly() {
  console.log("Solving puzzle instantly...");
  
  // Set all tiles to their correct positions
  for (let i = 0; i < 15; i++) {
    gameState[i] = i + 1;
  }
  gameState[15] = 0;
  blankPosition = 15;
  
  console.log("New solved state:", [...gameState]);
  
  // Animate all tiles to correct positions
  for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
    const tile = tiles[tileNumber];
    if (tile) {
      tile.style.transition = "all 0.3s ease-in-out";
      updateTilePosition(tile, tileNumber - 1);
      tile.classList.remove("movablepiece");
    }
  }
  
  // Remove transitions after animation and show win message
  setTimeout(() => {
    for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
      if (tiles[tileNumber]) {
        tiles[tileNumber].style.transition = "";
      }
    }
    showWinMessage();
    console.log("Instant solve completed");
  }, 300);
}

function saveGameStats(moves, timeElapsed) {
  fetch("save_game.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `moves=${moves}&time=${timeElapsed}`
  }).then(res => {
    if (res.ok) {
      console.log("✅ Game stats saved to server.");
    } else {
      console.error("❌ Failed to save game stats.");
    }
  }).catch(err => {
    console.error("❌ Error saving game stats:", err);
  });
}