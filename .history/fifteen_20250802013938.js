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
  document.getElementById("shufflebutton").addEventListener("click", function() {
    console.log("Shuffle clicked");
    shufflePuzzle();
    resetStats();
    startTimer();
    gameStarted = true;
  });

  document.getElementById("cheatbutton").addEventListener("click", function() {
    console.log("Cheat clicked");
    if (gameStarted) {
      cheatSolve();
    } else {
      alert("Please shuffle the puzzle first!");
    }
  });
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
  updateStats();
  
  timerInterval = setInterval(function() {
    timeElapsed++;
    updateStats();
  }, 1000);
  console.log("Timer started");
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function resetStats() {
  timeElapsed = 0;
  moveCount = 0;
  updateStats();
  document.getElementById("win-message").textContent = "";
}

function updateStats() {
  document.getElementById("time").textContent = timeElapsed;
  document.getElementById("moves").textContent = moveCount;
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

function cheatSolve() {
  console.log("Cheat solve started");
  
  if (checkIfSolved()) {
    showWinMessage();
    return;
  }
  
  // Stop the timer
  stopTimer();
  
  // Set the solved state directly
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
  
  // Show win message
  showWinMessage();
  console.log("Cheat solve completed");
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
