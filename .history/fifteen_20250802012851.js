// 15-Puzzle Game Implementation
// Grid is 4x4 with positions 0-15, where 15 is the blank space

let gameState = [];
let blankPosition = 15;
let tiles = [];
let timerInterval = null;
let timeElapsed = 0;
let moveCount = 0;
let gameStarted = false;

window.onload = function () {
  initializePuzzle();
  setupEventListeners();
};

function initializePuzzle() {
  const puzzleArea = document.getElementById("puzzlearea");

  for (let i = 0; i < 15; i++) {
    gameState[i] = i + 1;
  }
  gameState[15] = 0;
  blankPosition = 15;

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
}

function setupEventListeners() {
  const shuffleButton = document.getElementById("shufflebutton");
  const cheatButton = document.getElementById("cheatbutton");
  
  if (shuffleButton) {
    shuffleButton.addEventListener("click", () => {
      console.log("Shuffle button clicked"); // Debug log
      shufflePuzzle();
      resetStats();
      startTimer();
      gameStarted = true;
    });
    console.log("Shuffle button listener attached");
  } else {
    console.error("Shuffle button not found!");
  }

  if (cheatButton) {
    cheatButton.addEventListener("click", () => {
      console.log("Cheat button clicked"); // Debug log
      if (gameStarted) {
        solvePuzzle();
      } else {
        alert("Please shuffle the puzzle first!");
      }
    });
    console.log("Cheat button listener attached");
  } else {
    console.error("Cheat button not found!");
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
  if (canMoveTile(tileNumber)) {
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
  if (canMoveTile(tileNumber)) {
    tile.classList.add("movablepiece");
  }
}

function handleTileUnhover(tile) {
  tile.classList.remove("movablepiece");
}

function shufflePuzzle() {
  console.log("Shuffling puzzle..."); // Debug log
  
  // Reset to solved state first
  for (let i = 0; i < 15; i++) {
    gameState[i] = i + 1;
  }
  gameState[15] = 0;
  blankPosition = 15;

  // Perform random moves to shuffle
  for (let i = 0; i < 500; i++) {
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
  
  console.log("Puzzle shuffled"); // Debug log
}

function startTimer() {
  stopTimer();
  timeElapsed = 0;
  updateStats(); // Update display immediately
  timerInterval = setInterval(() => {
    timeElapsed++;
    updateStats();
    console.log("Timer tick:", timeElapsed); // Debug log
  }, 1000);
  console.log("Timer started, interval ID:", timerInterval); // Debug log
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    console.log("Timer stopped"); // Debug log
  }
}

function resetStats() {
  timeElapsed = 0;
  moveCount = 0;
  updateStats();
  document.getElementById("win-message").textContent = "";
  // Don't reset gameStarted here since shuffle button sets it to true
  console.log("Stats reset"); // Debug log
}

function updateStats() {
  const timeElement = document.getElementById("time");
  const movesElement = document.getElementById("moves");
  
  if (timeElement) {
    timeElement.textContent = timeElapsed;
  }
  if (movesElement) {
    movesElement.textContent = moveCount;
  }
}

function showWinMessage() {
  document.getElementById("win-message").textContent = "🎉 Puzzle Solved! Great job!";
  saveGameStats(moveCount, timeElapsed); // Save to MySQL
}

function checkIfSolved() {
  for (let i = 0; i < 15; i++) {
    if (gameState[i] !== i + 1) return false;
  }
  return gameState[15] === 0;
}

function solvePuzzle() {
  console.log("Starting solve puzzle"); // Debug log
  
  if (checkIfSolved()) {
    console.log("Puzzle already solved");
    showWinMessage();
    return;
  }
  
  // Stop the timer
  stopTimer();
  
  // Simple approach: just set the solved state directly with animation
  const moves = [];
  const originalGameState = [...gameState];
  
  // Find all tiles that are not in correct position
  for (let i = 0; i < 15; i++) {
    if (gameState[i] !== i + 1) {
      const wrongTile = gameState[i];
      const correctPos = wrongTile - 1;
      if (isAdjacent(i, blankPosition)) {
        moves.push(wrongTile);
      }
    }
  }
  
  console.log("Found moves to make:", moves);
  
  // If we can't find good moves, just solve it directly
  if (moves.length === 0) {
    console.log("No smart moves found, solving directly");
    solveDirectly();
    return;
  }
  
  // Animate the moves
  let moveIndex = 0;
  const animateMoves = () => {
    if (moveIndex >= moves.length || checkIfSolved()) {
      console.log("Animation complete or puzzle solved");
      solveDirectly(); // Ensure it's completely solved
      return;
    }
    
    const tileToMove = moves[moveIndex];
    if (canMoveTile(tileToMove)) {
      console.log("Moving tile:", tileToMove);
      moveTile(tileToMove);
      moveCount++;
      updateStats();
    }
    
    moveIndex++;
    
    if (checkIfSolved()) {
      showWinMessage();
      return;
    }
    
    setTimeout(animateMoves, 300);
  };
  
  animateMoves();
}

function solveDirectly() {
  console.log("Solving puzzle directly");
  
  // Set the correct game state
  for (let i = 0; i < 15; i++) {
    gameState[i] = i + 1;
  }
  gameState[15] = 0;
  blankPosition = 15;
  
  // Update all tile positions visually
  for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
    updateTilePosition(tiles[tileNumber], tileNumber - 1);
    tiles[tileNumber].classList.remove("movablepiece");
  }
  
  console.log("Puzzle solved directly");
  showWinMessage();
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
