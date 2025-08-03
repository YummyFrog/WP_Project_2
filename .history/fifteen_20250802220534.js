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
    return;
  }
  
  // Save current state before solving
  const savedState = [...gameState];
  const savedBlankPos = blankPosition;
  console.log("Saved state before cheat:", savedState);
  
  // Stop the timer during solving animation
  stopTimer();
  
  // Find solution steps and animate them
  solvePuzzleStepByStep(savedState, savedBlankPos);
}

// Step-by-step puzzle solver with animation
function solvePuzzleStepByStep(initialState, initialBlankPos) {
  console.log("Finding solution steps...");
  
  // Use a simple, fast approach instead of complex BFS
  const solutionSteps = findSimpleSolutionSteps();
  
  if (solutionSteps.length === 0) {
    console.log("No moves needed, puzzle might be solved or unsolvable");
    solveInstantly();
    return;
  }
  
  console.log(`Found solution in ${solutionSteps.length} steps`);
  animateSolutionSteps(solutionSteps);
}

// Find solution using a simplified solving algorithm
function findSolutionPath(state, blankPos) {
  const targetState = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
  
  if (arraysEqual(state, targetState)) {
    return [];
  }
  
  // Use BFS to find solution (limited depth to avoid performance issues)
  const queue = [{ state: [...state], blankPos: blankPos, moves: [] }];
  const visited = new Set();
  const maxDepth = 20; // Limit search depth
  
  while (queue.length > 0) {
    const current = queue.shift();
    
    if (current.moves.length > maxDepth) {
      continue;
    }
    
    const stateKey = current.state.join(',') + ',' + current.blankPos;
    if (visited.has(stateKey)) {
      continue;
    }
    visited.add(stateKey);
    
    if (arraysEqual(current.state, targetState)) {
      return current.moves;
    }
    
    // Get possible moves
    const possibleMoves = getPossibleMoves(current.state, current.blankPos);
    
    for (const move of possibleMoves) {
      const newState = [...current.state];
      const newBlankPos = makeMove(newState, current.blankPos, move);
      
      const newMoves = [...current.moves, move];
      queue.push({
        state: newState,
        blankPos: newBlankPos,
        moves: newMoves
      });
    }
  }
  
  // If no solution found within depth limit, use a simpler approach
  return findSimpleSolution(state, blankPos);
}

// Get tiles that can move to the blank space
function getPossibleMoves(state, blankPos) {
  const moves = [];
  const row = Math.floor(blankPos / 4);
  const col = blankPos % 4;
  
  // Check adjacent positions
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
      moves.push(state[newPos]);
    }
  }
  
  return moves.filter(tile => tile !== 0);
}

// Make a move and return new blank position
function makeMove(state, blankPos, tileToMove) {
  const tilePos = state.indexOf(tileToMove);
  state[blankPos] = tileToMove;
  state[tilePos] = 0;
  return tilePos;
}

// Simple fallback solution (moves tiles toward their target positions)
function findSimpleSolution(state, blankPos) {
  const moves = [];
  const workingState = [...state];
  let workingBlankPos = blankPos;
  
  // Simple approach: try to place each tile in correct position
  for (let targetTile = 1; targetTile <= 15; targetTile++) {
    const currentPos = workingState.indexOf(targetTile);
    const targetPos = targetTile - 1;
    
    if (currentPos === targetPos) continue;
    
    // Try to move this tile towards its target (simplified)
    const possibleMoves = getPossibleMoves(workingState, workingBlankPos);
    if (possibleMoves.includes(targetTile)) {
      moves.push(targetTile);
      workingBlankPos = makeMove(workingState, workingBlankPos, targetTile);
    }
  }
  
  return moves.slice(0, 15); // Limit moves to prevent infinite loops
}

// Animate the solution steps
function animateSolutionSteps(steps) {
  console.log("Animating solution steps:", steps);
  
  let stepIndex = 0;
  const animationSpeed = 800; // milliseconds between moves
  
  function animateNextStep() {
    if (stepIndex >= steps.length) {
      // Animation complete
      setTimeout(() => {
        showWinMessage();
        console.log("Animated solve completed");
      }, 500);
      return;
    }
    
    const tileToMove = steps[stepIndex];
    console.log(`Step ${stepIndex + 1}: Moving tile ${tileToMove}`);
    
    // Highlight the tile that's about to move
    if (tiles[tileToMove]) {
      tiles[tileToMove].style.transition = "all 0.3s ease-in-out";
      tiles[tileToMove].style.transform = "scale(1.1)";
      tiles[tileToMove].style.border = "4px solid #FFD700";
    }
    
    setTimeout(() => {
      // Make the actual move
      if (canMoveTile(tileToMove)) {
        moveTile(tileToMove);
        moveCount++;
        updateStats();
        
        // Reset tile styling
        if (tiles[tileToMove]) {
          tiles[tileToMove].style.transform = "scale(1)";
          tiles[tileToMove].style.border = "3px solid white";
        }
      }
      
      stepIndex++;
      setTimeout(animateNextStep, animationSpeed * 0.7);
    }, animationSpeed * 0.3);
  }
  
  animateNextStep();
}

// Helper function to compare arrays
function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

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