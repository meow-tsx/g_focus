const gameContainer = document.getElementById('gameContainer');
const draggableBox = document.getElementById('draggableBox');
const timerElement = document.getElementById('timer');
const speedElement = document.getElementById('speed');
const gameOverScreen = document.getElementById('gameOverScreen');
const timeSurvived = document.getElementById('timeSurvived');
const shareButton = document.getElementById('shareButton');
const resetButton = document.getElementById('resetButton');

let isDragging = false;
let timer = 0;
let interval;
let shapeInterval;
let shapes = [];
const shapeSpeedIncrement = 0.01;
let shapeSpeed = 1;
let gameOver = false;

draggableBox.addEventListener('mousedown', startDragging);
draggableBox.addEventListener('touchstart', startDragging, { passive: false });

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });

document.addEventListener('mouseup', stopDragging);
document.addEventListener('touchend', stopDragging);

shareButton.addEventListener('click', () => {
    const text = `I survived ${timer.toFixed(2)} seconds in this focus test! Can you beat my score?`;
    const url = document.location.href;
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
});

resetButton.addEventListener('click', resetGame);

function startDragging(event) {
    if (gameOver) return;
    isDragging = true;
    event.preventDefault();
    startGame();
}

function startGame() {
    startTimer();
    // Initialize shape generation and movement
    addRandomShape()
    setInterval(addRandomShape, 2000); // Add a shape every 2 seconds
    setInterval(moveShapes, 50); // Move shapes every 50ms
}

function drag(event) {
    if (!isDragging || gameOver) return;

    event.preventDefault();

    let clientX, clientY;
    if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const containerRect = gameContainer.getBoundingClientRect();
    const boxRect = draggableBox.getBoundingClientRect();

    let newLeft = clientX - containerRect.left - boxRect.width / 2;
    let newTop = clientY - containerRect.top - boxRect.height / 2;

    newLeft = Math.max(0, Math.min(containerRect.width - boxRect.width, newLeft));
    newTop = Math.max(0, Math.min(containerRect.height - boxRect.height, newTop));

    draggableBox.style.left = `${newLeft}px`;
    draggableBox.style.top = `${newTop}px`;
}

function stopDragging() {
    isDragging = false;
}

function startTimer() {
    if (!interval) {
        interval = setInterval(() => {
            timer += 0.01;
            timerElement.textContent = timer.toFixed(2) + 's';
            increaseShapeSpeed();
            checkCollisions();
        }, 10);
    }
}

function stopTimer() {
    clearInterval(interval);
    interval = null;
}

function addRandomShape() {
    if (gameOver) return;
    const shape = document.createElement('div');
    shape.classList.add('movingShape');
    shape.style.width = `${Math.random() * 50 + 20}px`;
    shape.style.height = shape.style.width;

    // Instantiate shape outside the top edge of the game container
    shape.style.left = `${Math.random() * gameContainer.clientWidth}px`;
    shape.style.top = `-${shape.style.height}`;
    shape.dx = 0;
    shape.dy = shapeSpeed;

    gameContainer.appendChild(shape);
    shapes.push({ element: shape, dx: shape.dx, dy: shape.dy });

    if (!shapeInterval) {
        shapeInterval = setInterval(moveShapes, 50);
    }
}

function moveShapes() {
    if (gameOver) return;
    shapes.forEach((shape, index) => {
        const rect = shape.element.getBoundingClientRect();
        const containerRect = gameContainer.getBoundingClientRect();

        shape.element.style.left = `${rect.left - containerRect.left}px`;
        shape.element.style.top = `${rect.top + shape.dy - containerRect.top}px`;

        // Remove shape if it moves outside the game container
        if (rect.top > containerRect.bottom) {
            shape.element.remove();
            shapes.splice(index, 1);
        }
    });
}

function increaseShapeSpeed() {
    shapeSpeed += shapeSpeedIncrement;
    shapes.forEach(shape => {
        shape.dy = shapeSpeed;
    });
    speedElement.textContent = shapeSpeed.toFixed(2);
}

function checkCollisions() {
    const boxRect = draggableBox.getBoundingClientRect();

    shapes.forEach(shape => {
        const shapeRect = shape.element.getBoundingClientRect();

        if (
            boxRect.left < shapeRect.right &&
            boxRect.right > shapeRect.left &&
            boxRect.top < shapeRect.bottom &&
            boxRect.bottom > shapeRect.top
        ) {
            endGame();
        }
    });
}

function endGame() {
    gameOver = true;
    stopTimer();
    clearInterval(shapeInterval);
    shapeInterval = null;
    timeSurvived.textContent = timer.toFixed(2);
    gameOverScreen.style.display = 'flex';
}

function resetGame() {
    isDragging = false;
    timer = 0;
    interval;
    shapeInterval;
    shapeSpeed = 1;
    gameOver = false;

    shapes.forEach((shape, index) => {
        // Remove shapes
        shape.element.remove();
    });
    shapes = [];
    gameOverScreen.style.display = 'none';
    draggableBox.style.top = '50%';
    draggableBox.style.left = '50%';
    startGame()
}