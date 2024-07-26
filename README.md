# Stay Focused: A Fun Drag-and-Dodge Challenge

Welcome to **Stay Focused**, a thrilling web-based game where your goal is to survive as long as possible by dragging a box to dodge enemies and collect hearts for extra lives. Test your focus and dexterity, share your high scores with friends on X (formerly Twitter), and even customize the game to your liking!

## Table of Contents
- [Getting Started](#getting-started)
- [Gameplay](#gameplay)
- [Project Structure](#project-structure)
- [Code Explanation](#code-explanation)
- [License](#license)

## Getting Started
Simply click [here](https://meow-tsx.github.io/g_focus/) to start the game.

### Prerequisites
You will need a modern web browser to run this game on a Computer or on you Mobile phone. No other software or dependencies are required.


## Gameplay

- Click or touch the game container to start the game.
- Drag the box to avoid enemies and collect hearts.
- Survive as long as you can to achieve a high score.
- Click the "Try Again" button to restart the game after it ends.
- Share your score on social media using the "Share" button.

## Project Structure

The project consists of the following main files:
- `index.html`: The main HTML file that sets up the game container and includes necessary scripts.
- `style.css`: The CSS file that styles the game elements.
- `game.js`: The JavaScript file containing the game logic.

## Code Explanation

### Game Class

The `Game` class manages the overall game logic and user interactions.
#### Constructor

Initializes the game elements, variables, and sets up event listeners.

```js
constructor() {
    // Initialize elements from the DOM
    this.gameContainer = document.getElementById('gameContainer');
    // Other initializations...
    this._setupEventListeners();
}

### Event Listeners
Sets up event listeners for user interactions such as clicking, dragging, and button clicks.
```js
_setupEventListeners = () => {
    this.gameContainer.addEventListener('mousedown', this.touch);
    // Other event listeners...
}
```

### Game Actions
Handles the main game actions such as starting, dragging, dropping, ticking the timer, spawning enemies and hearts, moving shapes, adjusting speed, and checking collisions.
```js
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
```

The `Routine` class manages periodic actions such as spawning enemies, moving shapes, and spawning hearts.

```js
class Routine {
    constructor() {
        this.routines = [];
    }

    add = (_handler, _interval) => {
        this.routines.push(setInterval(_handler, _interval));
    }

    clear = () => {
        this.routines.forEach(clearInterval);
    }
}
```

## Customization
Feel free to customize the game by tweaking the JavaScript, CSS, and HTML files. Experiment with different enemy speeds, shapes, and styles to make the game your own. Share your customized versions with friends and challenge them to beat your high scores!

## License
This project is licensed under the MIT License - see the LICENSE file for details.

