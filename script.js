const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

const BLOCK_SIZE = 30;
const BOARD_WIDTH = Math.floor(canvas.width / BLOCK_SIZE);
const BOARD_HEIGHT = Math.floor(canvas.height / BLOCK_SIZE);

let board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
let currentTetromino;
let score = 0;
let timer;
let isPaused = false;

const colors = {
    0: 'transparent',
    1: 'cyan',
    2: 'magenta',
    3: 'yellow',
    4: 'green',
    5: 'red',
    6: 'blue',
    7: 'orange',
};

const tetrominoShapes = [
    { shape: [[1, 1, 1, 1]], color: 1 }, // I
    { shape: [[0, 1, 0], [1, 1, 1]], color: 2 }, // T
    { shape: [[1, 1], [1, 1]], color: 3 }, // O
    { shape: [[0, 1, 1], [1, 1, 0]], color: 4 }, // S
    { shape: [[1, 1, 0], [0, 1, 1]], color: 5 }, // Z
    { shape: [[1, 1, 1], [1, 0, 0]], color: 6 }, // L
    { shape: [[1, 1, 1], [0, 0, 1]], color: 7 }, // J
];

document.getElementById('startButton').onclick = startGame;
document.getElementById('pauseButton').onclick = togglePause;
document.getElementById('restartButton').onclick = restartGame;

// Управляющие кнопки
document.getElementById('leftButton').onclick = () => {
    if (!isPaused) moveTetromino(-1);
};
document.getElementById('rightButton').onclick = () => {
    if (!isPaused) moveTetromino(1);
};
document.getElementById('rotateButton').onclick = () => {
    if (!isPaused) rotateTetromino();
};

function startGame() {
    resetGame();
    spawnTetromino();
    timer = setInterval(dropTetromino, 1000);
    toggleButtonVisibility('start', false);
    toggleButtonVisibility('pause', true);
}

function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
        clearInterval(timer);
    } else {
        timer = setInterval(dropTetromino, 1000);
    }
    document.getElementById('pauseButton').innerText = isPaused ? 'Resume' : 'Pause';
}

function restartGame() {
    resetGame();
    spawnTetromino();
}

function resetGame() {
    board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
    score = 0;
    isPaused = false;
    clearInterval(timer);
    draw();
    toggleButtonVisibility('pause', false);
    toggleButtonVisibility('restart', false);
    updateScore();
}

function toggleButtonVisibility(buttonId, visible = false) {
    const button = document.getElementById(buttonId + 'Button');
    button.style.display = visible ? 'block' : 'none';
}

function spawnTetromino() {
    currentTetromino = getRandomTetromino();
    if (!canPlaceTetromino(currentTetromino, 0, 0)) {
        alert("Game Over!");
        resetGame();
    }
}

function dropTetromino() {
    if (canPlaceTetromino(currentTetromino, 1, 0)) {
        currentTetromino.y++;
    } else {
        placeTetromino(currentTetromino);
        clearLines();
        spawnTetromino();
    }
    draw();
}

function moveTetromino(direction) {
    if (canPlaceTetromino(currentTetromino, 0, direction)) {
        currentTetromino.x += direction;
    }
    draw();
}

function rotateTetromino() {
    const originalShape = currentTetromino.shape;
    currentTetromino.shape = rotate(currentTetromino.shape);
    if (!canPlaceTetromino(currentTetromino, 0, 0)) {
        currentTetromino.shape = originalShape;
    }
    draw();
}

function canPlaceTetromino(tetromino, offsetY, offsetX) {
    for (let row = 0; row < tetromino.shape.length; row++) {
        for (let col = 0; col < tetromino.shape[row].length; col++) {
            if (tetromino.shape[row][col] !== 0) {
                const newRow = row + tetromino.y + offsetY;
                const newCol = col + tetromino.x + offsetX;

                if (newCol < 0 || newCol >= BOARD_WIDTH || newRow >= BOARD_HEIGHT) {
                    return false; // Выход за пределы
                }
                if (newRow >= 0 && board[newRow][newCol] !== 0) {
                    return false; // Столкновение
                }
            }
        }
    }
    return true;
}

function placeTetromino(tetromino) {
    for (let row = 0; row < tetromino.shape.length; row++) {
        for (let col = 0; col < tetromino.shape[row].length; col++) {
            if (tetromino.shape[row][col] !== 0) {
                board[row + tetromino.y][col + tetromino.x] = tetromino.color;
            }
        }
    }
}

function clearLines() {
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            score += 10;
        }
    }
    updateScore();
}

function updateScore() {
    document.getElementById('scoreValue').innerText = score;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    board.forEach((row, y) => {
        row.forEach((value, x) => {
            context.fillStyle = colors[value];
            context.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            context.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
        });
    });

    if (currentTetromino) {
        currentTetromino.shape.forEach((row, r) => {
            row.forEach((value, c) => {
                if (value !== 0) {
                    context.fillStyle = colors[currentTetromino.color];
                    context.fillRect((c + currentTetromino.x) * BLOCK_SIZE, (r + currentTetromino.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    context.strokeRect((c + currentTetromino.x) * BLOCK_SIZE, (r + currentTetromino.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                }
            });
        });
    }
}

function getRandomTetromino() {
    const randomIndex = Math.floor(Math.random() * tetrominoShapes.length);
    const tetromino = JSON.parse(JSON.stringify(tetrominoShapes[randomIndex])); // Копируем объект
    tetromino.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(tetromino.shape[0].length / 2);
    tetromino.y = 0;
    return tetromino;
}

function rotate(shape) {
    return shape[0].map((_, index) => shape.map(row => row[index]).reverse());
}

// Управление с клавиатуры
document.addEventListener('keydown', (e) => {
    if (!isPaused) {
        switch (e.key) {
            case 'ArrowLeft':
                moveTetromino(-1);
                break;
            case 'ArrowRight':
                moveTetromino(1);
                break;
            case 'ArrowDown':
                dropTetromino();
                break;
            case 'ArrowUp':
                rotateTetromino();
                break;
        }
    }
});
