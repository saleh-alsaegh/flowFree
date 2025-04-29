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
const nextLevelButton = document.getElementById('nextLevelButton');
const backButton = document.getElementById('backButton');
const themeToggle = document.getElementById('themeToggle');

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

const levels = [
  {
    dots: [
      { x: 0, y: 1, color: 'blue' },
      { x: 1, y: 2, color: 'blue' },
      { x: 1, y: 1, color: 'yellow' },
      { x: 2, y: 3, color: 'yellow' },
      { x: 0, y: 2, color: 'orange' },
      { x: 3, y: 5, color: 'orange' },
      { x: 6, y: 1, color: 'green' },
      { x: 5, y: 5, color: 'green' },
      { x: 5, y: 1, color: 'cyan' },
      { x: 5, y: 4, color: 'cyan' },
      { x: 6, y: 2, color: 'red' },
      { x: 0, y: 6, color: 'red' }
      
    ],
    isBoss: false
  },
  {
    dots: [
      { x: 6, y: 1, color: 'blue' },
      { x: 5, y: 5, color: 'blue' },
      { x: 1, y: 5, color: 'yellow' },
      { x: 4, y: 6, color: 'yellow' },
      { x: 2, y: 1, color: 'orange' },
      { x: 0, y: 1, color: 'orange' },
      { x: 6, y: 2, color: 'green' },
      { x: 1, y: 4, color: 'green' },
      { x: 0, y: 0, color: 'cyan' },
      { x: 3, y: 1, color: 'cyan' },
      { x: 6, y: 0, color: 'red' },
      { x: 4, y: 1, color: 'red' }
    ],
    isBoss: false
  },

  {
    dots: [
      { x: 0, y: 0, color: 'blue' },
      { x: 2, y: 3, color: 'blue' },
      { x: 0, y: 1, color: 'yellow' },
      { x: 0, y: 3, color: 'yellow' },
      { x: 4, y: 0, color: 'orange' },
      { x: 6, y: 6, color: 'orange' },
      { x: 3, y: 0, color: 'green' },
      { x: 3, y: 3, color: 'green' },
      { x: 2, y: 0, color: 'cyan' },
      { x: 3, y: 2, color: 'cyan' },
      { x: 6, y: 0, color: 'red' },
      { x: 1, y: 5, color: 'red' }
    ],
    isBoss: false
  },
  
  {
    dots: [
      { x: 1, y: 4, color: 'blue' },
      { x: 2, y: 6, color: 'blue' },
      { x: 4, y: 0, color: 'yellow' },
      { x: 1, y: 6, color: 'yellow' },
      { x: 5, y: 0, color: 'orange' },
      { x: 1, y: 2, color: 'orange' },
      { x: 3, y: 1, color: 'green' },
      { x: 4, y: 4, color: 'green' },
      { x: 5, y: 1, color: 'cyan' },
      { x: 4, y: 5, color: 'cyan' },
      { x: 3, y: 3, color: 'red' },
      { x: 1, y: 1, color: 'red' }
    ],
    isBoss: false
  },
  {
    dots: [
      { x: 2, y: 2, color: 'blue' },
      { x: 4, y: 4, color: 'blue' },
      { x: 0, y: 0, color: 'yellow' },
      { x: 2, y: 5, color: 'yellow' },
      { x: 1, y: 2, color: 'orange' },
      { x: 2, y: 4, color: 'orange' },
      { x: 0, y: 5, color: 'green' },
      { x: 6, y: 0, color: 'green' },
      { x: 1, y: 3, color: 'red' },
      { x: 3, y: 2, color: 'red' }
    ],
    isBoss: false
  },
  {
    dots: [
      { x: 6, y: 0, color: 'blue' },
      { x: 0, y: 6, color: 'blue' },
      { x: 0, y: 1, color: 'yellow' },
      { x: 4, y: 0, color: 'yellow' },
      { x: 6, y: 1, color: 'orange' },
      { x: 6, y: 6, color: 'orange' },
      { x: 4, y: 2, color: 'green' },
      { x: 1, y: 5, color: 'green' },
      { x: 4, y: 1, color: 'red' },
      { x: 0, y: 3, color: 'red' },
      { x: 2, y: 2, color: 'purple' },
      { x: 0, y: 5, color: 'purple' },
      { x: 5, y: 4, color: 'cyan' },
      { x: 4, y: 6, color: 'cyan' }
    ],
    isBoss: false
  },
  {
    dots: [
      { x: 1, y: 4, color: 'blue' },
      { x: 4, y: 4, color: 'blue' },
      { x: 0, y: 1, color: 'yellow' },
      { x: 1, y: 5, color: 'yellow' },
      { x: 3, y: 2, color: 'orange' },
      { x: 6, y: 6, color: 'orange' },
      { x: 1, y: 1, color: 'green' },
      { x: 5, y: 4, color: 'green' },
      { x: 1, y: 3, color: 'red' },
      { x: 4, y: 2, color: 'red' }
      
    ],
    isBoss: true
  }
  
];

let currentLevel = 0;
let currentPath = [];
let isDrawing = false;
let currentColor = null;
let grid = [];

const gameState = {
  moves: 0,
  time: 0,
  score: 0,
  undosRemaining: 14,
  timerInterval: null,
  completedLevels: JSON.parse(localStorage.getItem('completedLevels')) || {},
  bestScores: JSON.parse(localStorage.getItem('bestScores')) || {}
};

const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
let currentTheme = localStorage.getItem('theme');
if (!currentTheme) {
  if (prefersDarkScheme.matches) {
    currentTheme = 'dark';
  } else {
    currentTheme = 'light';
  }
}

const applyTheme = () => {
  if (currentTheme === 'dark') {
    document.body.classList.remove('light-theme');
    themeToggle.textContent = '☀️ Light Mode';
  } else {
    document.body.classList.add('light-theme');
    themeToggle.textContent = '🌙 Dark Mode';
  }
  localStorage.setItem('theme', currentTheme);
};

themeToggle.addEventListener('click', () => {
  if (currentTheme === 'dark') {
    currentTheme = 'light';
  } else {
    currentTheme = 'dark';
  }
  applyTheme();
});

applyTheme();

const initLevelSelection = () => {
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
};

const startGame = () => {
  resetGameState();
  levelSelection.style.display = 'none';
  gameScreen.style.display = 'flex';
  levelDisplay.textContent = `Level ${currentLevel + 1}`;
  if (levels[currentLevel].isBoss) {
    levelDisplay.textContent += ' (Boss)';
  }
  initGameBoard();
  loadLevel(currentLevel);
  gameState.timerInterval = setInterval(() => {
    gameState.time++;
    updateTimerDisplay();
  }, 1000);
};

const resetGameState = () => {
  gameState.moves = 0;
  gameState.time = 0;
  gameState.undosRemaining = 14;
  updateMovesDisplay();
  updateTimerDisplay();
  updateUndoDisplay();
  updateScoreDisplay();
};

const initGameBoard = () => {
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
};

const loadLevel = (levelIndex) => {
  resetGrid();
  levels[levelIndex].dots.forEach(dot => {
    const { x, y, color } = dot;
    const dotDiv = document.createElement('div');
    dotDiv.classList.add('dot');
    dotDiv.style.backgroundColor = colors[color];
    grid[y][x].cell.appendChild(dotDiv);
    grid[y][x].color = color;
  });
};

const resetGrid = () => {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      const cellData = grid[y][x];
      if (cellData) {
        cellData.color = null;
        cellData.cell.innerHTML = '';
        cellData.cell.classList.remove('path');
        cellData.cell.style.backgroundColor = '';
      }
    }
  }
  currentPath = [];
};

const handleMouseDown = (e) => {
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
};

const handleMouseUp = () => {
  if (!isDrawing) return;
  isDrawing = false;
  currentColor = null;
  checkWin();
};

const handleMouseMove = (e) => {
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
};
const getDotPairs=(level)=> {
  const colorMap = {};
  for (const dot of level.dots) {
    if (!colorMap[dot.color]) colorMap[dot.color] = [];
    colorMap[dot.color].push({ x: dot.x, y: dot.y });
  }
  return colorMap; // { red: [{x,y}, {x,y}], ... }
}
const isConnected=(start, end, color)=> {
  const visited = new Set();
  const queue = [start];
  const key = (x, y) => `${x},${y}`;

  while (queue.length > 0) {
    const { x, y } = queue.shift();
    if (x === end.x && y === end.y) return true;

    [[0,1],[1,0],[0,-1],[-1,0]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
        const neighbor = grid[ny][nx];
        const k = key(nx, ny);
        if (neighbor.color === color && !visited.has(k)) {
          visited.add(k);
          queue.push({ x: nx, y: ny });
        }
      }
    });
  }

  return false;
}


const checkWin = () => {
  for (let y = 0; y < boardSize; y++) {
    for (let x = 0; x < boardSize; x++) {
      if (!grid[y][x].color) return false;
    }
  }

  const dotPairs = getDotPairs(levels[currentLevel]);

  for (const color in dotPairs) {
    const [start, end] = dotPairs[color];
    if (!isConnected(start, end, color)) return false;
  }

  clearInterval(gameState.timerInterval);
  const stars = calculateScore();
  celebrateWin(stars);
  return true;
};


const calculateScore = () => {
  let score = 10;
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
};

const celebrateWin = (stars) => {
  confetti({
    particleCount: 150,
    spread: 70,
    origin: { y: 0.6 }
  });
setTimeout(() => {
  const winScreen = document.createElement('div');
  winScreen.id = 'winScreen';
  winScreen.style.display = 'none';
  winScreen.innerHTML = `
    <h1>🎉 You completed the level! 🎉</h1>
    <button onclick="nextLevel()">Next Level</button>
    <button onclick="backToLevels()">Back to Levels</button>
  `;
  document.body.appendChild(winScreen);
}, 500);
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

const updateTimerDisplay = () => {
  timerDisplay.textContent = formatTime(gameState.time);
};

const updateMovesDisplay = () => {
  movesDisplay.textContent = `Moves: ${gameState.moves}`;
};

const updateUndoDisplay = () => {
  undoCountDisplay.textContent = gameState.undosRemaining;
};

const updateScoreDisplay = () => {
  scoreDisplay.textContent = `Score: ${gameState.score}`;
};

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

nextLevelButton.addEventListener('click', () => {
  if (currentLevel < levels.length - 1) {
    currentLevel++;
    startGame();
  } else {
    const winSound = new Audio('win.mp3');
    winSound.play();

    alert('🏆 You finished all levels!');
    backToLevelSelection();
  }
});

const backToLevelSelection = () => {
  clearInterval(gameState.timerInterval);
  gameScreen.style.display = 'none';
  levelSelection.style.display = 'flex';
  initLevelSelection();
};

backButton.addEventListener('click', backToLevelSelection);

initLevelSelection();
