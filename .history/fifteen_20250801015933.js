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
  
  // Initialize game state (solved position: tiles 1-15 in positions 0-14, blank in position 15)
  for (let i = 0; i < 15; i++) {
    gameState[i] = i + 1; // Position 0 has tile 1, position 1 has tile 2, etc.
  }
  gameState[15] = 0; // Position 15 is blank (represented by 0)
  blankPosition = 15;
  
  // Create tile elements for tiles 1-15
  for (let i = 1; i <= 15; i++) {
    const tile = document.createElement("div");
    tile.className = "puzzlepiece";
    tile.textContent = i;
    tile.setAttribute("data-number", i);
    
    // Set initial position (tile i goes to position i-1)
    updateTilePosition(tile, i - 1);
    
    // Add event listeners
    tile.addEventListener("click", () => handleTileClick(i));
    tile.addEventListener("mouseenter", () => handleTileHover(tile, i));
    tile.addEventListener("mouseleave", () => handleTileUnhover(tile));
    
    puzzleArea.appendChild(tile);
    tiles[i] = tile;
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
  
  // Set background position to show the correct part of the image
  // Each tile should show the part of the image that corresponds to its NUMBER, not its current position
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
  for (let i = 0; i < 15; i++) {
    gameState[i] = i + 1;
  }
  gameState[15] = 0;
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
