class Game {
    constructor() {
        this.gameContainer = document.getElementById('gameContainer');
        this.draggableBox = document.getElementById('draggableBox');
        this.timerElement = document.getElementById('timer');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        this.timeSurvived = document.getElementById('timeSurvived');
        this.shareButton = document.getElementById('shareButton');
        this.resetButton = document.getElementById('resetButton');

        this.isStarted = false;
        this.isDragging = false;
        this.timer = 0;
        this.mainInterval;
        this.moveInterval;
        this.addingShapeInterval;
        this.shapes = [];
        this.shapeSpeedIncrement = 0.01;
        this.shapeSpeed = 1;
        this.isGameOver = false;

        this._setupEventListeners()

    }

    _setupEventListeners = () => {
        this.gameContainer.addEventListener('mousedown', this.touch);
        this.gameContainer.addEventListener('touchstart', this.touch, { passive: false });

        document.addEventListener('mousemove', this.drag);
        document.addEventListener('touchmove', this.drag, { passive: false });

        document.addEventListener('mouseup', this.drop);
        document.addEventListener('touchend', this.drop);

        this.shareButton.addEventListener('click', () => {
            const text = `I stayed focused for ${this.timer.toFixed(3)} seconds! How long can you last? Try now to find out!`;
            const url = document.location.href;
            const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
            window.open(shareUrl, '_blank');
        });
        this.resetButton.addEventListener('click', this.restart);

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                // Tab is inactive, end the game
                this.gameOver()
            }
        });
    }

    touch = (event) => {
        if (this.isGameOver) return;
        this.isDragging = true;
        event.preventDefault();
        if (!this.isStarted) {
            this.start();
            this.isStarted = true;
        }
    }

    start = () => {
        this.startTimer();
        // Initialize shape generation and movement
        this.addingShapeInterval = setInterval(this.spawnEnemy, 650); // Add a shape every 2 seconds
        this.moveInterval = setInterval(this.moveEnemy, 50); // Move shapes every 50ms
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

        let newLeft = clientX - containerRect.left - boxRect.width / 2;
        let newTop = clientY - containerRect.top - boxRect.height / 2;

        newLeft = Math.max(0, Math.min(containerRect.width - boxRect.width, newLeft));
        newTop = Math.max(0, Math.min(containerRect.height - boxRect.height, newTop));

        this.draggableBox.style.left = `${newLeft}px`;
        this.draggableBox.style.top = `${newTop}px`;
    }

    drop = () => {
        this.isDragging = false;
    }

    startTimer = () => {
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
        const shape = document.createElement('div');
        shape.classList.add('enemies');
        shape.style.width = `${Math.random() * 50 + 20}px`;
        shape.style.height = shape.style.width;

        // Instantiate shape outside the top edge of the game container
        shape.style.left = `${Math.random() * this.gameContainer.clientWidth}px`;
        shape.style.top = `-${shape.style.height}`;
        shape.dx = 0;
        shape.dy = this.shapeSpeed;

        this.gameContainer.appendChild(shape);
        this.shapes.push({ element: shape, dx: shape.dx, dy: shape.dy });
        console.log(this.shapes.length);

        if (!this.moveInterval) {
            this.moveInterval = setInterval(this.moveEnemy, 50);
        }
    }

    moveEnemy = () => {
        if (this.isGameOver) return;
        this.shapes.forEach((shape, index) => {
            const rect = shape.element.getBoundingClientRect();
            const containerRect = this.gameContainer.getBoundingClientRect();

            shape.element.style.left = `${rect.left - containerRect.left}px`;
            shape.element.style.top = `${rect.top + shape.dy - containerRect.top}px`;

            // Remove shape if it moves outside the game container
            if (rect.top > containerRect.bottom) {
                shape.element.remove();
                this.shapes.splice(index, 1);
            }
        });
    }

    adjustSpeed = () => {
        this.shapeSpeed += this.shapeSpeedIncrement;
        this.shapes.forEach(shape => {
            shape.dy = this.shapeSpeed;
        });
    }

    checkCollisions = () => {
        const boxRect = this.draggableBox.getBoundingClientRect();

        this.shapes.forEach(shape => {
            const shapeRect = shape.element.getBoundingClientRect();

            if (
                boxRect.left < shapeRect.right &&
                boxRect.right > shapeRect.left &&
                boxRect.top < shapeRect.bottom &&
                boxRect.bottom > shapeRect.top
            ) {
                this.gameOver();
            }
        });
    }

    gameOver = () => {
        this.isGameOver = true;
        this.stopTimer();
        clearInterval(this.moveInterval);
        clearInterval(this.addingShapeInterval);
        this.moveInterval = null;
        this.addingShapeInterval = null;
        this.timeSurvived.textContent = this.timer.toFixed(3);
        this.gameOverScreen.style.display = 'flex';
    }

    restart = () => {
        this.isDragging = false;
        this.timer = 0;
        this.shapeSpeed = 1;
        this.isGameOver = false;
        this.shapes = [];
        this.gameContainer.querySelectorAll('.enemies').forEach(shape => {
            shape.remove()
        })

        this.gameOverScreen.style.display = 'none';
        this.draggableBox.style.top = '50%';
        this.draggableBox.style.left = '50%';
        this.start()
    }
}

const game = new Game()