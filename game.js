class Game {
    constructor() {
        // Initialize elements from the DOM
        this.gameContainer = document.getElementById('gameContainer');
        this.draggableBox = document.getElementById('draggableBox');
        this.timerElement = document.getElementById('timer');
        this.livesElement = document.getElementById('lives');
        this.mainScreen = document.getElementById('mainScreen');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.timeSurvived = document.getElementById('timeSurvived');
        this.homeButton = document.getElementById('homeButton');
        this.shareButton = document.getElementById('shareButton');
        this.tryAgainButton = document.getElementById('tryAgainButton');

        // Initialize game variables
        this.lives = 1;
        this.isStarted = false;
        this.isDragging = false;
        this.timer = 0;
        this.shapes = [];
        this.shapeSpeedIncrement = 0.01;
        this.shapeSpeed = 1;
        this.isGameOver = false;

        // Initialize routines for periodic actions
        this.routines = new Routine();

        // Set up event listeners
        this._setupEventListeners();
    }

    _setupEventListeners = () => {
        // Mouse and touch event listeners for starting and controlling the game
        this.gameContainer.addEventListener('mousedown', this.touch);
        this.gameContainer.addEventListener('touchstart', this.touch, { passive: false });

        document.addEventListener('click', this.drag);
        document.addEventListener('mousemove', this.drag);
        document.addEventListener('touchstart', this.drag);
        document.addEventListener('touchmove', this.drag, { passive: false });

        document.addEventListener('mouseup', this.drop);
        document.addEventListener('touchend', this.drop);

        // Event listener for visibility change (when the tab becomes inactive)
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                // Tab is inactive, end the game
                this.gameOver();
            }
        });

        // Event listeners for buttons
        this.shareButton.addEventListener('click', () => {
            const text = `I stayed focused for ${this.timer.toFixed(3)} seconds! How long can you last? Try now to find out!`;
            const url = document.location.href;
            const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            window.open(shareUrl, '_blank');
        });
        this.tryAgainButton.addEventListener('click', this.restart);
        this.homeButton.addEventListener('click', () => {
            this.reset();
            this._showHomeScreen();
        });
    }

    touch = (event) => {
        if (this.isGameOver) return;
        this.isDragging = true;
        event.preventDefault();
        this.start();
    }

    start = () => {
        if (!this.isStarted) {
            this.isStarted = true;
            this._clearScreen();
            this._startRoutines();
            this._closeMainScreen();
        }
    }

    drag = (event) => {
        if (!this.isDragging || this.isGameOver) return;

        event.preventDefault();

        let clientX, clientY;
        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        const containerRect = this.gameContainer.getBoundingClientRect();
        const boxRect = this.draggableBox.getBoundingClientRect();

        // Calculate new position of the draggable box
        let newLeft = clientX - containerRect.left - boxRect.width / 2;
        let newTop = clientY - containerRect.top - boxRect.height / 2;

        // Ensure the box stays within the container bounds
        newLeft = Math.max(0, Math.min(containerRect.width - boxRect.width, newLeft));
        newTop = Math.max(0, Math.min(containerRect.height - boxRect.height, newTop));

        // Update the position of the draggable box
        this.draggableBox.style.left = `${newLeft}px`;
        this.draggableBox.style.top = `${newTop}px`;
    }

    drop = () => {
        this.isDragging = false;
    }

    tick = () => {
        if (!this.mainInterval) {
            this.mainInterval = setInterval(() => {
                this.timer += 0.01;
                this.timerElement.textContent = this.timer.toFixed(2) + 's';
                this.adjustSpeed();
                this.checkCollisions();
            }, 10);
        }
    }

    stopTimer = () => {
        clearInterval(this.mainInterval);
        this.mainInterval = null;
    }

    spawnEnemy = () => {
        if (this.isGameOver) return;
        const enemy = document.createElement('div');
        enemy.classList.add('enemies');
        enemy.style.width = `${Math.random() * 50 + 20}px`;
        enemy.style.height = enemy.style.width;

        // Instantiate shape outside the top edge of the game container
        enemy.style.left = `${Math.random() * this.gameContainer.clientWidth}px`;
        enemy.style.top = `-${enemy.style.height}`;
        enemy.dx = 0;
        enemy.dy = this.shapeSpeed;

        // Add the enemy to the game container and shapes array
        this.gameContainer.appendChild(enemy);
        this.shapes.push({ element: enemy, dx: enemy.dx, dy: enemy.dy, type: 'enemy' });
    }

    spawnHeart = () => {
        if (this.isGameOver) return;
        const extraLive = document.createElement('div');
        extraLive.classList.add('hearts');
        extraLive.style.width = '50px';
        extraLive.style.height = '50px';

        // Instantiate shape outside the top edge of the game container
        extraLive.style.left = `${Math.random() * this.gameContainer.clientWidth}px`;
        extraLive.style.top = `-${extraLive.style.height}`;

        extraLive.dx = 0;
        extraLive.dy = this.shapeSpeed;

        // Add the extra live to the game container and shapes array
        this.gameContainer.appendChild(extraLive);
        this.shapes.push({ element: extraLive, dx: extraLive.dx, dy: extraLive.dy, type: 'powerup' });
    }

    moveShapesDown = () => {
        if (this.isGameOver) return;
        this.shapes.forEach((shape, index) => {
            const rect = shape.element.getBoundingClientRect();
            const containerRect = this.gameContainer.getBoundingClientRect();

            // Move shape down by its dy value
            shape.element.style.left = `${rect.left - containerRect.left}px`;
            shape.element.style.top = `${rect.top + shape.dy - containerRect.top}px`;

            // PERFORMANCE: Remove shape if it moves outside the game container
            if (rect.top > containerRect.bottom) {
                shape.element.remove();
                this.shapes.splice(index, 1);
            }
        });
    }

    adjustSpeed = () => {
        this.shapeSpeed += this.shapeSpeedIncrement;
        // Update speed of all shapes
        this.shapes.forEach(shape => {
            shape.dy = this.shapeSpeed;
        });
    }

    checkCollisions = () => {
        const boxRect = this.draggableBox.getBoundingClientRect();

        this.shapes.forEach(shape => {
            const shapeRect = shape.element.getBoundingClientRect();

            if (this._areCollided(boxRect, shapeRect)) {
                if (shape.element.classList.contains('hearts')) {
                    this._addExtraLive(shape);
                } else {
                    if (this.lives > 1) {
                        this._reduceLive(shape);
                    } else {
                        this.gameOver();
                    }
                }
            }
        });
    }

    _addExtraLive = (heart) => {
        heart.element.remove();
        this.lives++;
        this.livesElement.textContent = this.lives;
    }

    _reduceLive = (enemy) => {
        enemy.element.remove();
        this.lives--;
        this.livesElement.textContent = this.lives;
    }

    _areCollided = (rect1, rect2) => {
        return (
            rect1.left < rect2.right &&
            rect1.right > rect2.left &&
            rect1.top < rect2.bottom &&
            rect1.bottom > rect2.top
        );
    }

    gameOver = () => {
        this._stopRoutines();
        this.isGameOver = true;
        this.timeSurvived.textContent = this.timer.toFixed(3);
        this._displayGameOverScreen();
    }

    reset = () => {
        this._stopRoutines();
        this._clearScreen();
        this._closeGameOverScreen();

        this.isStarted = false;
        this.isDragging = false;
        this.timer = 0;
        this.shapeSpeed = 1;
        this.isGameOver = false;
        this.shapes = [];

        // Reset the position of the draggable box
        this.draggableBox.style.top = '50%';
        this.draggableBox.style.left = '50%';
    }

    restart = () => {
        this.reset();
        this.start();
    }

    _closeMainScreen = () => {
        this.mainScreen.style.display = 'none';
    }

    _showHomeScreen = () => {
        this.mainScreen.style.display = 'flex';
    }

    _displayGameOverScreen = () => {
        this.gameOverScreen.style.display = 'flex';
    }

    _startRoutines = () => {
        this.tick();

        // Add routines for spawning enemies, moving shapes, and spawning hearts
        this.routines.add(this.spawnEnemy, 650);
        this.routines.add(this.moveShapesDown, 50);
        this.routines.add(this.spawnHeart, 7000);
    }

    _stopRoutines = () => {
        this.routines.clear();
        this.stopTimer();
    }

    _closeGameOverScreen = () => {
        this.gameOverScreen.style.display = 'none';
    }

    _clearScreen = () => {
        this.timerElement.textContent = '0.00s';
        this.livesElement.textContent = '1';
        // Remove all enemies and hearts from the game container
        this.gameContainer.querySelectorAll('.enemies, .hearts').forEach(shape => shape.remove());
    }
}

class Routine {
    constructor() {
        this.routines = [];
    }

    add = (_handler, _interval) => {
        // Add a routine to the list and start it
        this.routines.push(
            setInterval(_handler, _interval)
        );
    }

    clear = () => {
        // Clear all routines
        this.routines.forEach(clearInterval);
    }
}

// Instantiate the Game class to start the game
const game = new Game();
