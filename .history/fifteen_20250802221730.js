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
  }, 10000); // 10 second timeout
  
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

// Complete AI solver using A* algorithm
function findCompleteSolution(initialState, initialBlankPos) {
  const targetState = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  
  // Check if already solved
  if (arraysEqual(initialState, targetState)) {
    return [];
  }
  
  // A* algorithm implementation
  const openSet = [{
    state: [...initialState],
    blankPos: initialBlankPos,
    moves: [],
    g: 0, // cost from start
    h: calculateManhattanDistance(initialState), // heuristic
    f: 0 // total cost
  }];
  
  const closedSet = new Set();
  const maxIterations = 1000; // Prevent infinite loops
  let iterations = 0;
  
  // Calculate f score
  openSet[0].f = openSet[0].g + openSet[0].h;
  
  while (openSet.length > 0 && iterations < maxIterations) {
    iterations++;
    
    // Find node with lowest f score
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift();
    
    // Create state key for visited tracking
    const stateKey = current.state.join(',') + ',' + current.blankPos;
    if (closedSet.has(stateKey)) {
      continue;
    }
    closedSet.add(stateKey);
    
    // Check if we reached the goal
    if (arraysEqual(current.state, targetState)) {
      console.log(`Solution found in ${iterations} iterations with ${current.moves.length} moves`);
      return current.moves;
    }
    
    // If too many moves, skip this path
    if (current.moves.length > 25) {
      continue;
    }
    
    // Generate all possible moves
    const possibleMoves = getValidMoves(current.state, current.blankPos);
    
    for (const move of possibleMoves) {
      const newState = [...current.state];
      const tilePos = newState.indexOf(move);
      newState[current.blankPos] = move;
      newState[tilePos] = 0;
      const newBlankPos = tilePos;
      
      const newStateKey = newState.join(',') + ',' + newBlankPos;
      if (closedSet.has(newStateKey)) {
        continue;
      }
      
      const newMoves = [...current.moves, move];
      const g = current.g + 1;
      const h = calculateManhattanDistance(newState);
      const f = g + h;
      
      openSet.push({
        state: newState,
        blankPos: newBlankPos,
        moves: newMoves,
        g: g,
        h: h,
        f: f
      });
    }
  }
  
  console.log(`No solution found after ${iterations} iterations, trying simpler approach`);
  return findSimpleIterativeSolution(initialState, initialBlankPos);
}

// Get all valid moves from current state
function getValidMoves(state, blankPos) {
  const moves = [];
  const row = Math.floor(blankPos / 4);
  const col = blankPos % 4;
  
  // Check all four directions
  const directions = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 },  // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 }   // right
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

// Calculate Manhattan distance heuristic
function calculateManhattanDistance(state) {
  let distance = 0;
  for (let i = 0; i < 15; i++) {
    const tile = state[i];
    if (tile !== 0) {
      const targetPos = tile - 1;
      const currentRow = Math.floor(i / 4);
      const currentCol = i % 4;
      const targetRow = Math.floor(targetPos / 4);
      const targetCol = targetPos % 4;
      
      distance += Math.abs(currentRow - targetRow) + Math.abs(currentCol - targetCol);
    }
  }
  return distance;
}

// Helper function to compare arrays
function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

// Fallback simpler solution for complex puzzles
function findSimpleIterativeSolution(initialState, initialBlankPos) {
  const moves = [];
  const workingState = [...initialState];
  let workingBlankPos = initialBlankPos;
  const maxMoves = 20;
  
  console.log("Using fallback iterative solution");
  
  // Try to place tiles 1-15 in order
  for (let targetTile = 1; targetTile <= 15 && moves.length < maxMoves; targetTile++) {
    const currentPos = workingState.indexOf(targetTile);
    const targetPos = targetTile - 1;
    
    if (currentPos === targetPos) continue;
    
    // Try to move this tile closer to target
    for (let attempts = 0; attempts < 5 && moves.length < maxMoves; attempts++) {
      const validMoves = getValidMoves(workingState, workingBlankPos);
      
      // Prefer moving the target tile if possible
      if (validMoves.includes(targetTile)) {
        moves.push(targetTile);
        const tilePos = workingState.indexOf(targetTile);
        workingState[workingBlankPos] = targetTile;
        workingState[tilePos] = 0;
        workingBlankPos = tilePos;
        
        // Check if tile is now in correct position
        if (workingState.indexOf(targetTile) === targetPos) {
          break;
        }
      } else if (validMoves.length > 0) {
        // Move a tile that brings blank closer to target tile
        const bestMove = findBestMoveTowardsTile(workingState, workingBlankPos, targetTile);
        if (bestMove) {
          moves.push(bestMove);
          const tilePos = workingState.indexOf(bestMove);
          workingState[workingBlankPos] = bestMove;
          workingState[tilePos] = 0;
          workingBlankPos = tilePos;
        }
      }
    }
  }
  
  return moves;
}

// Find best move to bring blank space closer to target tile
function findBestMoveTowardsTile(state, blankPos, targetTile) {
  const tilePos = state.indexOf(targetTile);
  const validMoves = getValidMoves(state, blankPos);
  
  let bestMove = null;
  let bestDistance = Infinity;
  
  for (const move of validMoves) {
    const movePos = state.indexOf(move);
    // Calculate distance from this tile's position to target tile
    const distance = Math.abs(Math.floor(movePos / 4) - Math.floor(tilePos / 4)) + 
                    Math.abs(movePos % 4 - tilePos % 4);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMove = move;
    }
  }
  
  return bestMove;
}

// Find a path to move a specific tile toward its target position
function findPathForTile(state, blankPos, targetTile, targetPos) {
  const moves = [];
  const maxAttempts = 8; // Limit attempts per tile
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const currentPos = state.indexOf(targetTile);
    
    if (currentPos === targetPos) {
      break; // Tile reached target
    }
    
    // Check if target tile can move directly
    if (isAdjacent(currentPos, blankPos)) {
      moves.push(targetTile);
      // Simulate this move
      state[blankPos] = targetTile;
      state[currentPos] = 0;
      blankPos = currentPos;
      continue;
    }
    
    // Move blank space closer to target tile
    const pathToTile = moveBlankTowardsTile(state, blankPos, targetTile);
    if (pathToTile.length > 0) {
      const moveToMake = pathToTile[0];
      moves.push(moveToMake);
      
      // Simulate this move
      const movePos = state.indexOf(moveToMake);
      state[blankPos] = moveToMake;
      state[movePos] = 0;
      blankPos = movePos;
    } else {
      // If we can't find a path, try a random valid move
      const possibleMoves = getAdjacentTiles(state, blankPos);
      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[0];
        moves.push(randomMove);
        
        // Simulate this move
        const movePos = state.indexOf(randomMove);
        state[blankPos] = randomMove;
        state[movePos] = 0;
        blankPos = movePos;
      } else {
        break; // No moves available
      }
    }
  }
  
  return moves;
}

// Move blank space towards a target tile
function moveBlankTowardsTile(state, blankPos, targetTile) {
  const tilePos = state.indexOf(targetTile);
  const blankRow = Math.floor(blankPos / 4);
  const blankCol = blankPos % 4;
  const tileRow = Math.floor(tilePos / 4);
  const tileCol = tilePos % 4;
  
  // Get tiles adjacent to blank space
  const adjacentTiles = getAdjacentTiles(state, blankPos);
  
  // Find the best tile to move (one that moves blank closer to target)
  let bestMove = null;
  let bestDistance = Infinity;
  
  for (const tile of adjacentTiles) {
    const tileCurrentPos = state.indexOf(tile);
    // Calculate distance if we move this tile to blank position
    const newBlankRow = Math.floor(tileCurrentPos / 4);
    const newBlankCol = tileCurrentPos % 4;
    
    const distance = Math.abs(newBlankRow - tileRow) + Math.abs(newBlankCol - tileCol);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMove = tile;
    }
  }
  
  return bestMove ? [bestMove] : [];
}

// Get tiles adjacent to blank space that can move
function getAdjacentTiles(state, blankPos) {
  const adjacentTiles = [];
  const row = Math.floor(blankPos / 4);
  const col = blankPos % 4;
  
  // Check all four directions
  const directions = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 },  // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 }   // right
  ];
  
  for (const dir of directions) {
    const newRow = row + dir.dr;
    const newCol = col + dir.dc;
    
    if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
      const newPos = newRow * 4 + newCol;
      const tile = state[newPos];
      if (tile !== 0) {
        adjacentTiles.push(tile);
      }
    }
  }
  
  return adjacentTiles;
}

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
  const animationSpeed = 1000; // Slower animation so users can follow the logic
  
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
    
    // Show which tile is being moved
    const cheatButton = document.getElementById("cheatbutton");
    if (cheatButton) {
      cheatButton.textContent = `Moving tile ${tileToMove}...`;
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

// Removed complex BFS algorithm - using simpler approach now

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