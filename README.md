# Snake Game with Moving Foods
Welcome to the Snake Game! This game is a classic snake game with a twist - two types of fruits with different scores that move after a certain score is reached, and obstacles (bombs).
The game features both an AI-controlled snake and a player-controlled snake, each trying to score points by eating different types of food while avoiding bombs. The winner is the first to get 50 points.

## Files
- *index.html*: The main HTML file that contains the structure of the game.
- *styles.css*: The CSS file that contains the styles for the game.
- *Astar.js*: The JavaScript file implementing the A* algorithm for the AI snake movement.
- *gameAlgo.js*: The main game logic and functionality for the Snake game.
- *bomb1.png*: The image file for the bomb.
- *RedA.png*: The image file for the red apple.
- *yellowA.png*: The image file for the yellow apple.

## Features
- Player and AI-controlled snakes
- Moving fruits (red and yellow apples) with different point values
- Bombs that reduce snake length and score if eaten (end the game if the score is zero)
- Dynamic score display
- Game over conditions and restart option
- Smooth animations and responsive controls

## Installation
1. Clone the repository:
    git clone https://github.com/TamarBeNahum/SnakeGame.git
2. Navigate to the project directory:
    cd snake-game
3. Run the `index.html` file in your preferred browser to start the game. No additional installation is required.

### Starting the Game
1. Run `index.html` in your web browser.
     If you are using Visual Studio Code, click the 'Go Live' button at the bottom right corner while `index.html` is open. 
2. Click the "Start Game" button on the welcome screen.
3. Use the arrow keys to control the player snake.
4. Compete against the AI snake to collect food and avoid bombs until you reach 50 points.

## Game Rules
1. **Controls**: 
    - **Arrow Keys**: Control the direction of the player snake.
    - **Mouse Click on Canvas**: Pause or resume the game.
2. **Food**:
   - **Red Apple**: Increases score by 2 points.
   - **Yellow Apple**:  Increases score by 3 points.
   - Food starts moving when the total score reaches 10.
3. **Bombs**: Reduce snake length and halve the score if eaten and end the game if the score is zero.
4. **Collisions**:
   - Colliding with your own snake: Ends the game.
   - Colliding with the competing snake: Ends the game.
   - Colliding with the board boundaries: Ends the game.
5. **Winning**: Reach 50 points first by eating food and avoiding bombs.

## -- Code Overview --

### Astar.js
    This file implements the A* algorithm used by the AI snake to find the shortest path to one of the food items.
    The AI evaluates the grid to avoid obstacles like the player snake and bombs.

### gameAlgo.js
    This file contains the core game logic, including:
    - Initializing the game elements (snake, food, bombs).
    - Handling user input for controlling the player snake.
    - Updating the game state, including moving the snakes and generating new food and bombs.
    - Checking for collisions and game over conditions.
    
### Links
1. The presentation in Canva - https://www.canva.com/design/DAGLNwPNld0/59hMY5capyqALI7jxYhpGA/edit
2. The presentation video in YouTube - https://www.youtube.com/watch?v=Tw625Ftu9DI&t=9s
3. The game video in YouTube - https://www.youtube.com/watch?v=L0AygPqDT1I&t=103s