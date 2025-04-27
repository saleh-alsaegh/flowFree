const boardSize = 7; // Changed from 5 to 7
const gameBoard = document.getElementById('gameBoard');
const levelSelection = document.getElementById('levelSelection');
const gameScreen = document.getElementById('gameScreen');
const levelButtons = document.getElementById('levelButtons');

const colors = {
  red: "red",
  blue: "blue",
  green: "green",
  yellow: "yellow",
  purple: "purple",
  orange: "orange",
  pink: "pink",
  black: "black",
  white: "white",
  gray: "gray",
  brown: "brown",
  cyan: "cyan",
  magenta: "magenta",
  lime: "lime",
  teal: "teal",
  navy: "navy",
  maroon: "maroon",
  olive: "olive",
  silver: "silver",
  gold: "gold",
  coral: "coral",
  turquoise: "turquoise",
  indigo: "indigo",
  violet: "violet",
  lavender: "lavender",
  peach: "peach",
  mint: "mint",
};

const grid = [];
const levels = [
  [
    { x: 0, y: 0, color: 'red' },
    { x: 6, y: 1, color: 'red' },
    { x: 1, y: 2, color: 'blue' },
    { x: 6, y: 2, color: 'blue' },
    { x: 0, y: 2, color: 'green' },
    { x: 5, y: 1, color: 'green' },
    { x: 3, y: 3, color: 'yellow' },
    { x: 0, y: 6, color: 'yellow' },
    { x: 2, y: 6, color: 'orange' },
    { x: 6, y: 5, color: 'orange' },
    { x: 1, y: 4, color: 'purple' },
    { x: 5, y: 4, color: 'purple' },
  ],
  [
    { x: 1, y: 1, color: 'red' },
    { x: 5, y: 5, color: 'red' },
    { x: 0, y: 6, color: 'blue' },
    { x: 6, y: 0, color: 'blue' },
    { x: 2, y: 1, color: 'green' },
    { x: 5, y: 0, color: 'green' },
    { x: 3, y: 0, color: 'yellow' },
    { x: 3, y: 6, color: 'yellow' },
  ],
  [
    { x: 0, y: 0, color: 'red' },
    { x: 6, y: 6, color: 'blue' },
    { x: 1, y: 2, color: 'green' },
    { x: 5, y: 4, color: 'green' },
    { x: 3, y: 2, color: 'yellow' },
    { x: 3, y: 4, color: 'yellow' },
    { x: 2, y: 3, color: 'purple' },
    { x: 4, y: 3, color: 'purple' },
  ],
];

let currentLevel = 0;
let currentPath = [];
let isDrawing = false;
let currentColor = null;

const restartButton = document.getElementById('restartButton');
const undoButton = document.getElementById('undoButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const backButton = document.getElementById('backButton');

// Theme Toggle Functionality
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

let currentTheme = localStorage.getItem('theme') || 
                  (prefersDarkScheme.matches ? 'dark' : 'light');

function applyTheme() {
  if (currentTheme === 'dark') {
    document.body.classList.remove('light-theme');
    themeToggle.textContent = '☀️ Light Mode';
  } else {
    document.body.classList.add('light-theme');
    themeToggle.textContent = '🌙 Dark Mode';
  }
  localStorage.setItem('theme', currentTheme);
}

themeToggle.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme();
});

applyTheme();

// Initialize level selection buttons
function initLevelSelection() {
  levelButtons.innerHTML = '';
  levels.forEach((level, index) => {
    const button = document.createElement('button');
    button.textContent = `Level ${index + 1}`;
    button.addEventListener('click', () => {
      currentLevel = index;
      startGame();
    });
    levelButtons.appendChild(button);
  });
}

function startGame() {
  levelSelection.style.display = 'none';
  gameScreen.style.display = 'flex';
  initGameBoard();
  loadLevel(currentLevel);
}

function backToLevelSelection() {
  gameScreen.style.display = 'none';
  levelSelection.style.display = 'flex';
}

// Build the grid
function initGameBoard() {
  gameBoard.innerHTML = '';
  grid.length = 0;
  
  for (let y = 0; y < boardSize; y++) {
    grid[y] = [];
    for (let x = 0; x < boardSize; x++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.x = x;
      cell.dataset.y = y;
      gameBoard.appendChild(cell);
      grid[y][x] = { cell, color: null };
    }
  }

  // Attach event listeners
  gameBoard.addEventListener('mousedown', handleMouseDown);
  gameBoard.addEventListener('mouseup', handleMouseUp);
  gameBoard.addEventListener('mousemove', handleMouseMove);
}

function handleMouseDown(e) {
  const cell = e.target.closest('.cell');
  if (!cell) return;

  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);
  const clickedColor = grid[y][x].color;
  if (clickedColor) {
    isDrawing = true;
    currentColor = clickedColor;
    currentPath = [{ x, y }]; // Start new path
  }
}

function handleMouseUp(e) {
  if (!isDrawing) return;
  isDrawing = false;
  currentColor = null;
  checkWin();
}

function handleMouseMove(e) {
  if (!isDrawing) return;

  const cell = e.target.closest('.cell');
  if (!cell) return;

  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);
  const cellData = grid[y][x];

  // Prevent diagonal movement
  if (currentPath.length > 0) {
    const lastCell = currentPath[currentPath.length - 1];
    const dx = Math.abs(x - lastCell.x);
    const dy = Math.abs(y - lastCell.y);
    if (dx + dy !== 1) return; // Only allow adjacent cells
  }

  // Check if we're going back to previous cell
  if (currentPath.length > 1) {
    const prevCell = currentPath[currentPath.length - 2];
    if (prevCell.x === x && prevCell.y === y) {
      const removed = currentPath.pop();
      grid[removed.y][removed.x].cell.classList.remove('path');
      grid[removed.y][removed.x].cell.style.backgroundColor = '';
      grid[removed.y][removed.x].color = null;
      return;
    }
  }

  if (cellData.color && cellData.color !== currentColor) return;

  if (!cellData.color || cellData.color === currentColor) {
    cellData.cell.classList.add('path');
    cellData.cell.style.backgroundColor = colors[currentColor];
    cellData.color = currentColor;
    currentPath.push({ x, y });
  }
}

function loadLevel(levelIndex) {
  resetGrid();
  levels[levelIndex].forEach(dot => {
    const { x, y, color } = dot;
    const dotDiv = document.createElement('div');
    dotDiv.classList.add('dot');
    dotDiv.style.backgroundColor = colors[color];
    grid[y][x].cell.appendChild(dotDiv);
    grid[y][x].color = color;
  });
}

function checkWin() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (!grid[y][x].color) {
        return false;
      }
    }
  }
  alert('🎉 You Win!');
  return true;
}

// Button functionality
undoButton.addEventListener('click', () => {
  if (currentPath.length > 0) {
    const lastCell = currentPath.pop();
    grid[lastCell.y][lastCell.x].cell.classList.remove('path');
    grid[lastCell.y][lastCell.x].cell.style.backgroundColor = '';
    grid[lastCell.y][lastCell.x].color = null;
  }
});

restartButton.addEventListener('click', () => {
  loadLevel(currentLevel);
});

nextLevelButton.addEventListener('click', () => {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    loadLevel(currentLevel);
  } else {
    alert('🏆 You finished all levels!');
    backToLevelSelection();
  }
});

backButton.addEventListener('click', backToLevelSelection);

function resetGrid() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cellData = grid[y][x];
      cellData.color = null;
      cellData.cell.innerHTML = '';
      cellData.cell.classList.remove('path', 'hint');
      cellData.cell.style.backgroundColor = '';
    }
  }
  currentPath = [];
}

// Initialize the game
initLevelSelection();