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

// Human-like AI solver that solves the puzzle systematically
function findCompleteSolution(initialState, initialBlankPos) {
  const targetState = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  
  // Check if already solved
  if (arraysEqual(initialState, targetState)) {
    return [];
  }
  
  console.log("Starting human-like systematic solver...");
  return solveSystematically(initialState, initialBlankPos);
}

// Systematic solver that places each tile in order like a human would
function solveSystematically(initialState, initialBlankPos) {
  const moves = [];
  const state = [...initialState];
  let blankPos = initialBlankPos;
  
  console.log("Initial puzzle state:", state);
  
  // Solve each position systematically (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)
  for (let targetPosition = 0; targetPosition < 15; targetPosition++) {
    const targetTile = targetPosition + 1;
    
    console.log(`\n=== Working on placing tile ${targetTile} in position ${targetPosition} ===`);
    
    // Keep working on this tile until it's in the correct position
    let attempts = 0;
    const maxAttemptsPerTile = 200; // High limit but prevents infinite loops
    
    while (state[targetPosition] !== targetTile && attempts < maxAttemptsPerTile) {
      attempts++;
      
      const currentTilePos = state.indexOf(targetTile);
      console.log(`Attempt ${attempts}: Tile ${targetTile} is currently at position ${currentTilePos}, target is ${targetPosition}`);
      
      // Find the best move to make progress toward placing this tile
      const bestMove = findBestMoveForTile(state, blankPos, targetTile, targetPosition);
      
      if (bestMove) {
        moves.push(bestMove);
        
        // Execute the move
        const movePos = state.indexOf(bestMove);
        state[blankPos] = bestMove;
        state[movePos] = 0;
        blankPos = movePos;
        
        console.log(`  Made move: ${bestMove}, new state:`, [...state]);
        console.log(`  Blank is now at position: ${blankPos}`);
      } else {
        console.log(`  No valid move found, trying alternative approach...`);
        // Try any valid move to break potential deadlock
        const validMoves = getValidMoves(state, blankPos);
        if (validMoves.length > 0) {
          const randomMove = validMoves[0];
          moves.push(randomMove);
          
          const movePos = state.indexOf(randomMove);
          state[blankPos] = randomMove;
          state[movePos] = 0;
          blankPos = movePos;
          
          console.log(`  Made fallback move: ${randomMove}`);
        } else {
          console.log(`  ERROR: No valid moves available!`);
          break;
        }
      }
      
      // Check if we've solved the whole puzzle early
      if (arraysEqual(state, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])) {
        console.log("Puzzle completely solved!");
        break;
      }
    }
    
    if (state[targetPosition] === targetTile) {
      console.log(`✓ Successfully placed tile ${targetTile} in position ${targetPosition}`);
    } else {
      console.log(`⚠ Could not place tile ${targetTile} in position ${targetPosition} after ${attempts} attempts`);
    }
    
    // If we've solved the whole puzzle, stop
    if (arraysEqual(state, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])) {
      console.log("Puzzle completely solved during systematic placement!");
      break;
    }
  }
  
  // Final check - if not completely solved, try to finish it
  if (!arraysEqual(state, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])) {
    console.log("Puzzle not completely solved, adding finishing moves...");
    const finishingMoves = finishPuzzle(state, blankPos);
    moves.push(...finishingMoves);
  }
  
  console.log(`\nSolution complete! Total moves: ${moves.length}`);
  console.log("Final move sequence:", moves);
  
  return moves;
}

// Find the best move to help place a specific tile in its target position
function findBestMoveForTile(state, blankPos, targetTile, targetPosition) {
  const currentTilePos = state.indexOf(targetTile);
  
  // If tile is already in correct position, skip
  if (currentTilePos === targetPosition) {
    return null;
  }
  
  // If the target tile is adjacent to blank space, move it directly
  if (isAdjacent(currentTilePos, blankPos)) {
    return targetTile;
  }
  
  // Move blank space toward the target tile
  return getBestMoveTowardTarget(state, blankPos, currentTilePos);
}

// Get the best move to bring blank space closer to target position
function getBestMoveTowardTarget(state, blankPos, targetPos) {
  const validMoves = getValidMoves(state, blankPos);
  
  if (validMoves.length === 0) {
    return null;
  }
  
  let bestMove = null;
  let bestDistance = Infinity;
  
  for (const move of validMoves) {
    const moveCurrentPos = state.indexOf(move);
    
    // Calculate how close this move would bring the blank to target
    const distance = calculateDistance(moveCurrentPos, targetPos);
    
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMove = move;
    }
  }
  
  return bestMove;
}

// Calculate Manhattan distance between two positions
function calculateDistance(pos1, pos2) {
  const row1 = Math.floor(pos1 / 4);
  const col1 = pos1 % 4;
  const row2 = Math.floor(pos2 / 4);
  const col2 = pos2 % 4;
  
  return Math.abs(row1 - row2) + Math.abs(col1 - col2);
}

// Try to finish solving the puzzle if close to completion
function finishPuzzle(state, blankPos) {
  const moves = [];
  const workingState = [...state];
  let workingBlankPos = blankPos;
  
  console.log("Attempting to finish puzzle...");
  
  // Try up to 100 more moves to complete the puzzle
  for (let i = 0; i < 100; i++) {
    if (arraysEqual(workingState, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0])) {
      console.log("Puzzle finished!");
      break;
    }
    
    // Find any tile that's out of place and can be moved
    let bestMove = null;
    let bestImprovement = -1;
    
    const validMoves = getValidMoves(workingState, workingBlankPos);
    
    for (const move of validMoves) {
      const currentPos = workingState.indexOf(move);
      const targetPos = move - 1;
      
      // Calculate how much this move improves the puzzle
      const currentDistance = calculateDistance(currentPos, targetPos);
      
      // Simulate the move
      const newPos = workingBlankPos;
      const newDistance = calculateDistance(newPos, targetPos);
      
      const improvement = currentDistance - newDistance;
      
      if (improvement > bestImprovement) {
        bestImprovement = improvement;
        bestMove = move;
      }
    }
    
    if (bestMove) {
      moves.push(bestMove);
      const movePos = workingState.indexOf(bestMove);
      workingState[workingBlankPos] = bestMove;
      workingState[movePos] = 0;
      workingBlankPos = movePos;
    } else {
      // If no improving move, try any valid move
      if (validMoves.length > 0) {
        const randomMove = validMoves[0];
        moves.push(randomMove);
        const movePos = workingState.indexOf(randomMove);
        workingState[workingBlankPos] = randomMove;
        workingState[movePos] = 0;
        workingBlankPos = movePos;
      } else {
        break;
      }
    }
  }
  
  return moves;
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

// Helper function to compare arrays
function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
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