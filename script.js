// Game Configuration
const boardSize = 7;
const gameBoard = document.getElementById('gameBoard');
const levelSelection = document.getElementById('levelSelection');
const gameScreen = document.getElementById('gameScreen');
const levelButtons = document.getElementById('levelButtons');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('levelDisplay');
const undoCountDisplay = document.getElementById('undoCount');
const restartButton = document.getElementById('restartButton');
const undoButton = document.getElementById('undoButton');
const hintButton = document.getElementById('hintButton');
const nextLevelButton = document.getElementById('nextLevelButton');
const backButton = document.getElementById('backButton');
const themeToggle = document.getElementById('themeToggle');

// Color Definitions
const colors = {
  red: "#FF5252",
  blue: "#4285F4",
  green: "#0F9D58",
  yellow: "#FFB900",
  purple: "#9C27B0",
  orange: "#FF6D00",
  pink: "#FF4081",
  cyan: "#00BCD4",
  lime: "#CDDC39",
  teal: "#009688"
};

// Game Levels
const levels = [
  { // Level 1
    dots: [
      { x: 0, y: 0, color: 'red' },
      { x: 6, y: 1, color: 'red' },
      { x: 1, y: 2, color: 'blue' },
      { x: 5, y: 2, color: 'blue' },
      { x: 0, y: 3, color: 'green' },
      { x: 6, y: 3, color: 'green' }
    ],
    isBoss: false
  },
  { // Level 2
    dots: [
      { x: 1, y: 1, color: 'red' },
      { x: 5, y: 5, color: 'red' },
      { x: 0, y: 6, color: 'blue' },
      { x: 6, y: 0, color: 'blue' },
      { x: 2, y: 2, color: 'green' },
      { x: 4, y: 4, color: 'green' }
    ],
    isBoss: false
  },
  { // Level 3 (Boss Level)
    dots: [
      { x: 0, y: 0, color: 'red' },
      { x: 6, y: 6, color: 'red' },
      { x: 1, y: 1, color: 'blue' },
      { x: 5, y: 5, color: 'blue' },
      { x: 2, y: 2, color: 'green' },
      { x: 4, y: 4, color: 'green' },
      { x: 3, y: 0, color: 'yellow' },
      { x: 3, y: 6, color: 'yellow' }
    ],
    isBoss: true
  }
];

// Game State
let currentLevel = 0;
let currentPath = [];
let isDrawing = false;
let currentColor = null;
let grid = [];

const gameState = {
  moves: 0,
  time: 0,
  score: 0,
  undosRemaining: 3,
  timerInterval: null,
  completedLevels: JSON.parse(localStorage.getItem('completedLevels')) || {},
  bestScores: JSON.parse(localStorage.getItem('bestScores')) || {}
};

// Theme Management
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
let currentTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');

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

// Initialize Level Selection
function initLevelSelection() {
  levelButtons.innerHTML = '';
  levels.forEach((level, index) => {
    const button = document.createElement('button');
    button.textContent = `Level ${index + 1}`;
    
    if (level.isBoss) {
      button.classList.add('boss-level');
    }
    
    if (gameState.completedLevels[index]) {
      const starsDiv = document.createElement('div');
      starsDiv.className = 'stars';
      starsDiv.innerHTML = `
        <div class="star">★</div>
        <div class="star">${gameState.completedLevels[index] >= 2 ? '★' : '☆'}</div>
        <div class="star">${gameState.completedLevels[index] >= 3 ? '★' : '☆'}</div>
      `;
      button.appendChild(starsDiv);
    }
    
    button.addEventListener('click', () => {
      currentLevel = index;
      startGame();
    });
    levelButtons.appendChild(button);
  });
}

// Game Initialization
function startGame() {
  resetGameState();
  levelSelection.style.display = 'none';
  gameScreen.style.display = 'flex';
  levelDisplay.textContent = `Level ${currentLevel + 1}${levels[currentLevel].isBoss ? ' (Boss)' : ''}`;
  initGameBoard();
  loadLevel(currentLevel);
  
  gameState.timerInterval = setInterval(() => {
    gameState.time++;
    updateTimerDisplay();
  }, 1000);
}

function resetGameState() {
  gameState.moves = 0;
  gameState.time = 0;
  gameState.undosRemaining = 3;
  updateMovesDisplay();
  updateTimerDisplay();
  updateUndoDisplay();
  updateScoreDisplay();
}

function initGameBoard() {
  gameBoard.innerHTML = '';
  grid = [];
  
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

  gameBoard.addEventListener('mousedown', handleMouseDown);
  gameBoard.addEventListener('mouseup', handleMouseUp);
  gameBoard.addEventListener('mousemove', handleMouseMove);
}

// Game Functions
function loadLevel(levelIndex) {
  resetGrid();
  levels[levelIndex].dots.forEach(dot => {
    const { x, y, color } = dot;
    const dotDiv = document.createElement('div');
    dotDiv.classList.add('dot');
    dotDiv.style.backgroundColor = colors[color];
    grid[y][x].cell.appendChild(dotDiv);
    grid[y][x].color = color;
  });
}

function resetGrid() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cellData = grid[y][x];
      if (cellData) {
        cellData.color = null;
        cellData.cell.innerHTML = '';
        cellData.cell.classList.remove('path', 'hint');
        cellData.cell.style.backgroundColor = '';
      }
    }
  }
  currentPath = [];
}

// Input Handling
function handleMouseDown(e) {
  const cell = e.target.closest('.cell');
  if (!cell) return;

  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);
  const clickedColor = grid[y][x].color;
  
  if (clickedColor) {
    isDrawing = true;
    currentColor = clickedColor;
    currentPath = [{ x, y }];
    gameState.moves++;
    updateMovesDisplay();
  }
}

function handleMouseUp() {
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

  if (currentPath.length > 0) {
    const lastCell = currentPath[currentPath.length - 1];
    if (lastCell.x === x && lastCell.y === y) return;

    const dx = Math.abs(x - lastCell.x);
    const dy = Math.abs(y - lastCell.y);
    if (dx + dy !== 1) return;

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
  }

  if (cellData.color && cellData.color !== currentColor) return;

  if (!cellData.color || cellData.color === currentColor) {
    cellData.cell.classList.add('path');
    cellData.cell.style.backgroundColor = colors[currentColor];
    cellData.color = currentColor;
    currentPath.push({ x, y });
    gameState.moves++;
    updateMovesDisplay();
  }
}

// Game Logic
function checkWin() {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (!grid[y][x].color) {
        return false;
      }
    }
  }
  
  clearInterval(gameState.timerInterval);
  const stars = calculateScore();
  celebrateWin(stars);
  return true;
}

function calculateScore() {
  let score = 1000;
  const timeBonus = Math.max(0, 500 - Math.floor(gameState.time / 2));
  const moveBonus = Math.max(0, 500 - (gameState.moves * 5));
  score += timeBonus + moveBonus;
  
  if (levels[currentLevel].isBoss) {
    score *= 1.5;
  }
  
  gameState.score += Math.floor(score);
  updateScoreDisplay();
  
  const stars = Math.min(3, 1 + Math.floor(score / 500));
  
  if (!gameState.completedLevels[currentLevel] || stars > gameState.completedLevels[currentLevel]) {
    gameState.completedLevels[currentLevel] = stars;
    localStorage.setItem('completedLevels', JSON.stringify(gameState.completedLevels));
  }
  
  if (!gameState.bestScores[currentLevel] || score > gameState.bestScores[currentLevel].score) {
    gameState.bestScores[currentLevel] = {
      score: Math.floor(score),
      time: gameState.time,
      moves: gameState.moves
    };
    localStorage.setItem('bestScores', JSON.stringify(gameState.bestScores));
  }
  
  return stars;
}

function celebrateWin(stars) {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });

  setTimeout(() => {
    alert(`🎉 Level Complete! 🎉\n\nStars: ${'★'.repeat(stars)}${'☆'.repeat(3-stars)}\nTime: ${formatTime(gameState.time)}\nMoves: ${gameState.moves}\nScore: +${Math.floor(gameState.score)}`);
  }, 500);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// UI Updates
function updateTimerDisplay() {
  timerDisplay.textContent = formatTime(gameState.time);
}

function updateMovesDisplay() {
  movesDisplay.textContent = `Moves: ${gameState.moves}`;
}

function updateUndoDisplay() {
  undoCountDisplay.textContent = gameState.undosRemaining;
}

function updateScoreDisplay() {
  scoreDisplay.textContent = `Score: ${gameState.score}`;
}

// Button Handlers
undoButton.addEventListener('click', () => {
  if (currentPath.length > 0 && gameState.undosRemaining > 0) {
    const lastCell = currentPath.pop();
    grid[lastCell.y][lastCell.x].cell.classList.remove('path');
    grid[lastCell.y][lastCell.x].cell.style.backgroundColor = '';
    grid[lastCell.y][lastCell.x].color = null;
    gameState.undosRemaining--;
    updateUndoDisplay();
  }
});

restartButton.addEventListener('click', () => {
  clearInterval(gameState.timerInterval);
  loadLevel(currentLevel);
  resetGameState();
});

hintButton.addEventListener('click', () => {
  const emptyCells = [];
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (!grid[y][x].color) {
        emptyCells.push({x, y});
      }
    }
  }
  
  if (emptyCells.length > 0) {
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[randomCell.y][randomCell.x].cell.classList.add('hint');
    setTimeout(() => {
      grid[randomCell.y][randomCell.x].cell.classList.remove('hint');
    }, 1000);
  }
});

nextLevelButton.addEventListener('click', () => {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    startGame();
  } else {
    alert('🏆 You finished all levels!');
    backToLevelSelection();
  }
});

backButton.addEventListener('click', backToLevelSelection);

function backToLevelSelection() {
  clearInterval(gameState.timerInterval);
  gameScreen.style.display = 'none';
  levelSelection.style.display = 'flex';
  initLevelSelection();
}

// Initialize Game
initLevelSelection();