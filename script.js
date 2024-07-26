const gameContainer = document.getElementById('gameContainer');
const draggableBox = document.getElementById('draggableBox');
const timerElement = document.getElementById('timer');
const speedElement = document.getElementById('speed');
let isDragging = false;
let timer = 0;
let interval;
let shapeInterval;
let shapes = [];
const shapeSpeedIncrement = 0.001;
let shapeSpeed = 1;

draggableBox.addEventListener('mousedown', startDragging);
draggableBox.addEventListener('touchstart', startDragging, { passive: false });

document.addEventListener('mousemove', drag);
document.addEventListener('touchmove', drag, { passive: false });

document.addEventListener('mouseup', stopDragging);
document.addEventListener('touchend', stopDragging);

function startDragging(event) {
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
    if (!isDragging) return;

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
        }, 10);
    }
}

function stopTimer() {
    clearInterval(interval);
    interval = null;
}

function addRandomShape() {
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
