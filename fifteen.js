window.onload = function () {
  const puzzleArea = document.getElementById("puzzlearea");

  for (let i = 0; i < 15; i++) {
    const tile = document.createElement("div");
    tile.className = "puzzlepiece";
    tile.textContent = i + 1;

    const row = Math.floor(i / 4);
    const col = i % 4;

    tile.style.left = (col * 100) + "px";
    tile.style.top = (row * 100) + "px";

    tile.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;

    puzzleArea.appendChild(tile);
  }
};
