// 15-Puzzle Game Implementation
// Grid is 4x4 with positions 0-15, where 15 is the blank space

let gameState = [];
let blankPosition = 15;
let tiles = [];

window.onload = function () {
  initializePuzzle();
  setupEventListeners();
};

function initializePuzzle() {
  const puzzleArea = document.getElementById("puzzlearea");
  
  // Initialize game state (solved position)
  for (let i = 0; i < 16; i++) {
    gameState[i] = i;
  }
  
  // Create tile elements for positions 0-14 (position 15 is blank)
  for (let i = 0; i < 15; i++) {
    const tile = document.createElement("div");
    tile.className = "puzzlepiece";
    tile.textContent = i + 1;
    tile.setAttribute("data-number", i + 1);
    
    // Set initial position
    updateTilePosition(tile, i);
    
    // Add event listeners
    tile.addEventListener("click", () => handleTileClick(i + 1));
    tile.addEventListener("mouseenter", () => handleTileHover(tile, i + 1));
    tile.addEventListener("mouseleave", () => handleTileUnhover(tile));
    
    puzzleArea.appendChild(tile);
    tiles[i + 1] = tile;
  }
}

function setupEventListeners() {
  const shuffleButton = document.getElementById("shufflebutton");
  shuffleButton.addEventListener("click", shufflePuzzle);
}

function updateTilePosition(tile, position) {
  const row = Math.floor(position / 4);
  const col = position % 4;
  
  tile.style.left = (col * 100) + "px";
  tile.style.top = (row * 100) + "px";
  tile.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
}

function getPosition(tileNumber) {
  return gameState.indexOf(tileNumber);
}

function isAdjacent(pos1, pos2) {
  const row1 = Math.floor(pos1 / 4);
  const col1 = pos1 % 4;
  const row2 = Math.floor(pos2 / 4);
  const col2 = pos2 % 4;
  
  // Adjacent if same row and columns differ by 1, or same column and rows differ by 1
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
  }
}

function moveTile(tileNumber) {
  const tilePos = getPosition(tileNumber);
  
  // Swap tile with blank space
  gameState[blankPosition] = tileNumber;
  gameState[tilePos] = 0;
  
  // Update positions
  blankPosition = tilePos;
  
  // Update visual position
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
  // Generate solvable random state by making random valid moves from solved state
  // Reset to solved state first
  for (let i = 0; i < 16; i++) {
    gameState[i] = i;
  }
  blankPosition = 15;
  
  // Make 500 random valid moves to ensure good shuffling
  for (let i = 0; i < 500; i++) {
    const movableTiles = [];
    
    // Find all tiles that can move
    for (let tile = 1; tile <= 15; tile++) {
      if (canMoveTile(tile)) {
        movableTiles.push(tile);
      }
    }
    
    // Pick a random movable tile and move it
    if (movableTiles.length > 0) {
      const randomTile = movableTiles[Math.floor(Math.random() * movableTiles.length)];
      moveTile(randomTile);
    }
  }
  
  // Update all tile positions visually
  for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
    const position = getPosition(tileNumber);
    updateTilePosition(tiles[tileNumber], position);
  }
  
  // Remove any hover effects that might be lingering
  for (let tileNumber = 1; tileNumber <= 15; tileNumber++) {
    tiles[tileNumber].classList.remove("movablepiece");
  }
}
