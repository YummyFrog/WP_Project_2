// 15-Puzzle Game Implementation
// Grid is 4x4 with positions 0-15, where 15 is the blank space

let gameState = [];
let blankPosition = 15;
let tiles = [];
let timerInterval = null;
let timeElapsed = 0;
let moveCount = 0;

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
  document.getElementById("shufflebutton").addEventListener("click", () => {
    shufflePuzzle();
    resetStats();
    startTimer();
  });

  document.getElementById("cheatbutton").addEventListener("click", () => {
    solvePuzzle();
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
  for (let i = 0; i < 15; i++) {
    gameState[i] = i + 1;
  }
  gameState[15] = 0;
  blankPosition = 15;

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

  for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
    const position = getPosition(tileNumber);
    updateTilePosition(tiles[tileNumber], position);
    tiles[tileNumber].classList.remove("movablepiece");
  }
}

function startTimer() {
  stopTimer();
  timeElapsed = 0;
  updateStats(); // Update display immediately
  timerInterval = setInterval(() => {
    timeElapsed++;
    updateStats();
  }, 1000);
  console.log("Timer started"); // Debug log
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
  if (checkIfSolved()) {
    showWinMessage();
    return;
  }
  
  // Stop the timer
  stopTimer();
  
  // Create the solved state and animate tiles moving to correct positions
  const solvedState = [];
  for (let i = 0; i < 15; i++) {
    solvedState[i] = i + 1;
  }
  solvedState[15] = 0;
  
  // Animate tiles moving to their correct positions
  let animationStep = 0;
  const maxSteps = 15;
  
  const animateToSolution = () => {
    if (animationStep >= maxSteps) {
      // Ensure final state is correct
      for (let i = 0; i < 16; i++) {
        gameState[i] = solvedState[i];
      }
      blankPosition = 15;
      
      // Update all tile positions to final positions
      for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
        updateTilePosition(tiles[tileNumber], tileNumber - 1);
        tiles[tileNumber].classList.remove("movablepiece");
      }
      
      showWinMessage();
      return;
    }
    
    // For each step, move tiles closer to their final positions
    let moved = false;
    for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
      const currentPos = getPosition(tileNumber);
      const targetPos = tileNumber - 1;
      
      if (currentPos !== targetPos && canMoveTile(tileNumber)) {
        // Move tile toward its target if possible
        const currentRow = Math.floor(currentPos / 4);
        const currentCol = currentPos % 4;
        const targetRow = Math.floor(targetPos / 4);
        const targetCol = targetPos % 4;
        
        // Check if this move gets us closer to target
        const blankRow = Math.floor(blankPosition / 4);
        const blankCol = blankPosition % 4;
        
        // Move tile if blank is in the direction of the target
        if ((targetRow > currentRow && blankRow > currentRow) ||
            (targetRow < currentRow && blankRow < currentRow) ||
            (targetCol > currentCol && blankCol > currentCol) ||
            (targetCol < currentCol && blankCol < currentCol)) {
          
          moveTile(tileNumber);
          moveCount++;
          updateStats();
          moved = true;
          break;
        }
      }
    }
    
    // If no progress, make any valid move to unstick
    if (!moved) {
      for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
        if (canMoveTile(tileNumber)) {
          moveTile(tileNumber);
          moveCount++;
          updateStats();
          break;
        }
      }
    }
    
    animationStep++;
    setTimeout(animateToSolution, 200);
  };
  
  animateToSolution();
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
