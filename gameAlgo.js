// Function to start the game
function startGame() {
  document.getElementById("welcomeScreen").style.display = "none"; // Hide the welcome screen
  document.getElementById("gameWrapper").style.display = "flex"; // Display the game wrapper
  game = setInterval(draw, 300); // Start the game loop with a 300ms interval
  document.getElementById("scores").style.display = "flex"; // Show scores when the game starts
}

// Set up the canvas and context for drawing
const canvas = document.getElementById("gameCanvas");
canvas.width = 704; // 22 * 32 (cols * box)
canvas.height = 704; // 22 * 32 (rows * box)
const ctx = canvas.getContext("2d");
// Flag to prevent multiple congratulations alerts for winnig the game and collision detection:
let game;
let gameEnded = false;
let congratulationsLogged = false;
let isCollision = false;// 

// Event listener to canvas for stopping/resuming the game on click
canvas.addEventListener("click", toggleGame);

//Function to stop/resume the game
function toggleGame() {
  if (game) {
    clearInterval(game); // Stop the game
    game = null;
    console.log("Game stopped.");
  } else {
    game = setInterval(draw, 300); // Resume the game
    console.log("Game resumed.");
  }
}

// Game constants and variables
const box = 32; // Size of each grid cell
const rows = 22; // Number of rows in the grid
const cols = 22; // Number of columns in the grid
let aiSnake = [{ x: 9 * box, y: 10 * box }]; // AI Snake starting position
let playerSnake = [{ x: 15 * box, y: 10 * box }]; // Player Snake starting position
let yellowFood; let redFood;
let playerScore = 0; let aiScore = 0;
let toalScore = 0; // Combined score of AI and player
let tempScore; // Temporary variable to store score
let scoreUpdated = true; // Flag to check if the score is updated

// Score constants
const YELLOW_SCORE = 2;
const RED_SCORE = 3;
const WIN_SCORE = 50;

// Variables for food movement
let yellowMoveStep = 0;
let redMoveStep = 0;
let yellowDirection = -1; // -1 for left, 1 for right
let redDirection = -1; // -1 for up, 1 for down

let bombs = []; //Array of bombs
let path = []; // Path for the AI snake

// Load images for food and bombs
const yellowAppleImg = new Image();
yellowAppleImg.src = "yellowA.png";
const redAppleImg = new Image();
redAppleImg.src = "RedA.png";
const bombImg = new Image();
bombImg.src = "bomb1.png";

// Event listener for player snake controls
document.addEventListener("keydown", direction);

// Variable to store the direction of the player snake (LEFT, UP, RIGHT, DOWN)
let d;

/**
 * Function to handle player snake direction based on keyboard input.
 * @param {Event} event - The keyboard event.
 */
function direction(event) {
  if (event.keyCode == 37 && d != "RIGHT") {
    d = "LEFT";
  } else if (event.keyCode == 38 && d != "DOWN") {
    d = "UP";
  } else if (event.keyCode == 39 && d != "LEFT") {
    d = "RIGHT";
  } else if (event.keyCode == 40 && d != "UP") {
    d = "DOWN";
  }
}

/**
 * Main draw function called repeatedly to update the game.
 */
function draw() {
  if (gameEnded) return; // Stop drawing if the game has ended

  clearCanvas();
  drawBoard();
  drawSnake(aiSnake, "green");
  drawSnake(playerSnake, "blue");
  drawFood();
  drawBombs();

  // food are starting to move aftere 10 score 
  if (toalScore >= 10) {
    moveYellowFood();
    moveRedFood();
  }

  // Find path for AI snake using A* algorithm
  path = aStar(
    { x: aiSnake[0].x, y: aiSnake[0].y, g: 0, f: 0 },
    yellowFood,
    redFood,
    YELLOW_SCORE,
    RED_SCORE
  );

  // Update scores on the screen
  document.getElementById("aiScore").innerText = `AI Score: ${aiScore}`;
  document.getElementById("playerScore").innerText = `Player Score: ${playerScore}`;

  updateAiSnakePosition();
  updatePlayerSnakePosition();
}

/**
 * Function to clear the canvas - happens every interval
 */
function clearCanvas() {
  ctx.fillStyle = "#A3D04A"; // Set the background color
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas
}

/**
 * Function to draw the game board - happens every interval
 */
function drawBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#A3D04A" : "#A9DA4D"; // Alternate colors for grid
      ctx.fillRect(col * box, row * box, box, box);
    }
  }
}

/**
 * Function to draw the snake on the canvas and style the two different players.
 * @param {Array} snake - The snake array representing the segments of the snake.
 * @param {string} color - The color of the snake, green for AI snake and blue for the player snake
 */
function drawSnake(snake, color) {
  for (let i = 0; i < snake.length; i++) {
    if (i === 0) {
      let gradient = ctx.createRadialGradient( // Draw head with eyes
        snake[i].x + box / 2, snake[i].y + box / 2, box / 6,
        snake[i].x + box / 2, snake[i].y + box / 2, box / 2
      );
      // Draw the snakes head
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "dark" + color);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2, 0, Math.PI * 2, true);
      ctx.fill();

      // Draw the snakes eyes
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(snake[i].x + box / 3, snake[i].y + box / 3, box / 6, 0, Math.PI * 2, true);
      ctx.arc(snake[i].x + (2 * box) / 3, snake[i].y + box / 3, box / 6, 0, Math.PI * 2, true);
      ctx.fill();

      // Draw the snakes pupils(eyes)
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(snake[i].x + box / 3, snake[i].y + box / 3, box / 12, 0, Math.PI * 2, true);
      ctx.arc(
        snake[i].x + (2 * box) / 3, snake[i].y + box / 3, box / 12, 0, Math.PI * 2, true);
      ctx.fill();
    } else {
      // Draw the snakes body 
      let gradient = ctx.createRadialGradient(snake[i].x + box / 2, snake[i].y + box / 2, box / 6, snake[i].x + box / 2, snake[i].y + box / 2, box / 2);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "dark" + color);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2, 0, Math.PI * 2, true);
      ctx.fill();
    }
  }
}

/**
 * Function to draw food on the canvas - happens every interval
 */
function drawFood() {
  ctx.drawImage(yellowAppleImg, yellowFood.x, yellowFood.y, box, box); // Draw yellow food
  ctx.drawImage(redAppleImg, redFood.x, redFood.y, box, box); // Draw red food
}

//Function to draw bombs on the canvas.
function drawBombs() {
  for (let bomb of bombs) {
    ctx.drawImage(bombImg, bomb.x, bomb.y, box, box); // Draw each bomb
  }
}

//Function to update AI snake's position based on pathfinding.
function updateAiSnakePosition() {
  let nextStep = path.shift();
  let snakeX = nextStep.x;
  let snakeY = nextStep.y;

  let newHead = { x: snakeX, y: snakeY };

  if (checkGameOver(newHead, aiSnake, true, false)) {
    return;
  }

  // Check if the AI snake eats yellow food
  if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
    yellowFood = generateFood([redFood]); // Generate new yellow food
    aiScore += YELLOW_SCORE;
    toalScore = playerScore + aiScore;
  }
  // Check if the AI snake eats red food
  else if (snakeX === redFood.x && snakeY === redFood.y) {
    redFood = generateFood([yellowFood]); // Generate new red food
    aiScore += RED_SCORE;
    toalScore = playerScore + aiScore;
  }
  // Check if the AI snake eats a bomb and has no score
  else if (collision(newHead, bombs) && aiScore == 0) {
    checkGameOver(newHead, aiSnake, true, true);
  }
  // Check if the AI snake eats a bomb but has some score
  else if (collision(newHead, bombs) && aiScore != 0) {
    aiSnake = reduceSnakeLength(aiSnake);
    aiScore = Math.floor(aiScore / 2);
    toalScore = playerScore + aiScore;
    bombs = bombs.filter((bomb) => bomb.x !== snakeX || bomb.y !== snakeY); // Remove the bomb that was eaten
  }
  // If no food or bomb is eaten, remove the last segment from aiSnake
  else {
    aiSnake.pop();
  }

  aiSnake.unshift(newHead); // Add new head to the snake

  if (collision(newHead, playerSnake)) {
    checkGameOver(newHead, aiSnake, true, false);
  }

  addBombsBasedOnScore();
}

//Function to update player snake's position based on user input.
function updatePlayerSnakePosition() {
  let snakeX = playerSnake[0].x;
  let snakeY = playerSnake[0].y;

  if (d === "LEFT") snakeX -= box;
  if (d === "UP") snakeY -= box;
  if (d === "RIGHT") snakeX += box;
  if (d === "DOWN") snakeY += box;

  let newHead = { x: snakeX, y: snakeY };


  if (checkGameOver(newHead, playerSnake, false, false)) {
    return;
  }

  // Check if the player snake eats yellow food
  if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
    yellowFood = generateFood([redFood]); // Generate new yellow food
    playerScore += YELLOW_SCORE;
    toalScore = playerScore + aiScore;
  }
  // Check if the player snake eats red food
  else if (snakeX === redFood.x && snakeY === redFood.y) {
    redFood = generateFood([yellowFood]); // Generate new red food
    playerScore += RED_SCORE;
    toalScore = playerScore + aiScore;
  }
  // Check if the player snake eats a bomb and has no score
  else if (collision(newHead, bombs) && playerScore == 0) {
    checkGameOver(newHead, playerSnake, false, true);
  }
  // Check if the player snake eats a bomb but has some score
  else if (collision(newHead, bombs) && playerScore != 0) {
    playerSnake = reduceSnakeLength(playerSnake);
    playerScore = Math.floor(playerScore / 2);
    if (playerScore == 0) {
      playerSnake = playerSnake.slice(0, 0); // Reset the snake if score is zero
    }
    toalScore = playerScore + aiScore;
    bombs = bombs.filter((bomb) => bomb.x !== snakeX || bomb.y !== snakeY); // Remove the bomb that was eaten
  }
  // If no food or bomb is eaten, remove the last segment of playerSnake
  else {
    playerSnake.pop();
  }

  playerSnake.unshift(newHead); // Add new head to the snake


  if (collision(newHead, aiSnake)) {
    checkGameOver(newHead, playerSnake, false, false);
  }

  addBombsBasedOnScore();
}

/**
 * Function to reduce the length of a snake by half - happens when the players ate bomb.
 * @param {Array} snake - The snake array representing the segments of the snake.
 * @returns {Array} The updated snake array with reduced length.
 */
function reduceSnakeLength(snake) {
  let newLength = Math.floor(snake.length / 2);
  newLength = newLength > 0 ? newLength : 1;
  return snake.slice(0, newLength);
}

//Function to add bombs based on the current score.
function addBombsBasedOnScore() {

  if (Math.floor(toalScore / 5) && scoreUpdated) {
    if (toalScore >= 30) {
      bombs.push(generateBomb());
    }
    bombs.push(generateBomb());
    tempScore = toalScore;
  }

  // Check if the score has updated to the next multiple of 5 
  // Update scoreUpdated to true if the total score has moved to the next multiple of 5
  scoreUpdated = Math.floor(tempScore / 5) != Math.floor(toalScore / 5);

}

/**
 * Function to check if the game is over.
 * @param {Object} newHead - The new head object with properties x and y.
 * @param {Array} snake - The snake array representing the segments of the snake.
 * @param {boolean} isAiSnake - A boolean indicating if the snake is the AI snake.
 * @param {boolean} isDiedFromBomb - A boolean indicating if the snake died from a bomb.
 * @returns {boolean} True if the game is over, false otherwise.
 */
function checkGameOver(newHead, snake, isAiSnake, isDiedFromBomb) {
  if (isCollision) return true;

  if (
    newHead.x < 0 ||
    newHead.x >= cols * box ||
    newHead.y < 0 ||
    newHead.y >= rows * box ||
    isDiedFromBomb ||
    collision(newHead, snake.slice(1)) ||
    collision(newHead, isAiSnake ? playerSnake : aiSnake)
  ) {
    isCollision = true;

    setTimeout(() => {
      let message = collision(newHead, isAiSnake ? playerSnake : aiSnake)
        ? "!התנגשות התרחשה "
        : `${isAiSnake ? "AI" : "Player"} lost...${isAiSnake ? "Player" : "AI"
        } Wins!`;

      Swal.fire({
        title: message,
        icon: "warning",
        background: "#f9f9f9",
        showCancelButton: false,
        confirmButtonText: "Start Again",
        customClass: {
          title: "swal-title",
          htmlContainer: "swal-html",
          confirmButton: "swal-confirm",
          cancelButton: "swal-cancel",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          location.reload(); // Reload the page
        }
      });
    }, 100);

    return true;
  }

  if (
    (aiScore >= WIN_SCORE || playerScore >= WIN_SCORE) &&
    !congratulationsLogged
  ) {
    isCollision = true;
    congratulationsLogged = true;

    document.getElementById("aiScore").innerText = `AI Score: ${aiScore}`;
    document.getElementById("playerScore").innerText = `Player Score: ${playerScore}`;
    clearCanvas();
    drawBoard();
    drawSnake(aiSnake, "green");
    drawSnake(playerSnake, "blue");
    drawFood();
    drawBombs();

    setTimeout(function () {
      let winner = aiScore >= WIN_SCORE ? "AI" : "Player";
      console.log(`Congratulations! ${winner} reached score ${WIN_SCORE}.`);
      setTimeout(function () {
        Swal.fire({
          title: `🎉 Congratulations ${winner}! 🎉`,
          html: `<b>${winner} reached a score of ${WIN_SCORE}!</b><br>Do you want to start a new game?`,
          icon: "success",
          background: "#f9f9f9",
          showCancelButton: false,
          confirmButtonText: "Start a new game",
          customClass: {
            title: "swal-title",
            htmlContainer: "swal-html",
            confirmButton: "swal-confirm",
            cancelButton: "swal-cancel",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            location.reload(); // Reload the page
          }
        });
      }, 100);
    }, 600);

    return true;
  }

  return false;
}

/**
 * Function to move yellow food.
 * The yellow food moves left and right within the game board.
 */
function moveYellowFood() {
  if (yellowMoveStep === 0 || yellowMoveStep === 2) {
    yellowDirection = -yellowDirection; // Change direction
    yellowMoveStep = 0;
  }

  let newX = yellowFood.x + yellowDirection * box;

  if (newX < 0) newX = 0;
  if (newX >= (cols - 1) * box) newX = (cols - 1) * box;

  if (
    isOnSnake(newX, yellowFood.y) ||
    isOnBomb(newX, yellowFood.y) ||
    (newX === redFood.x && yellowFood.y === redFood.y)
  ) {
    yellowMoveStep++;
    return;
  }

  yellowFood.x = newX;
  yellowMoveStep++;
}

/**
 * Function to move red food.
 * The red food moves up and down within the game board.
 */
function moveRedFood() {
  if (redMoveStep === 0 || redMoveStep === 2) {
    redDirection = -redDirection; // Change direction
    redMoveStep = 0;
  }

  let newY = redFood.y + redDirection * box;

  if (newY < 0) newY = 0;
  if (newY >= (rows - 1) * box) newY = (rows - 1) * box;

  if (
    isOnSnake(redFood.x, newY) ||
    isOnBomb(redFood.x, newY) ||
    (redFood.x === yellowFood.x && newY === yellowFood.y)
  ) {
    redMoveStep++;
    return;
  }

  redFood.y = newY;
  redMoveStep++;
}

/**
 * Function to check if a position is on a snake.
 * @param {number} x - The x-coordinate of the position to check.
 * @param {number} y - The y-coordinate of the position to check.
 * @returns {boolean} True if the position is on a snake, false otherwise.
 */
function isOnSnake(x, y) {
  for (let i = 0; i < aiSnake.length; i++) {
    if (aiSnake[i].x === x && aiSnake[i].y === y) {
      return true;
    }
  }

  for (let i = 0; i < playerSnake.length; i++) {
    if (playerSnake[i].x === x && playerSnake[i].y === y) {
      return true;
    }
  }

  return false;
}

/**
 * Function to check for a collision between the head of the snake and any segment of an array.
 * @param {Object} head - The head object with properties x and y.
 * @param {Array} array - The array representing the segments of the snake, other snakes, or bombs.
 * @returns {boolean} True if there is a collision, false otherwise.
 */
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

/**
 * Function to check if a position is on food.
 * @param {number} x - The x-coordinate of the position to check.
 * @param {number} y - The y-coordinate of the position to check.
 * @returns {boolean} True if the position is on food, false otherwise.
 */
function isOnFood(x, y) {
  return (
    (redFood.x === x && redFood.y === y) ||
    (yellowFood.x === x && yellowFood.y === y)
  );
}

/**
 * Function to check if a position is on a bomb.
 * @param {number} x - The x-coordinate of the position to check.
 * @param {number} y - The y-coordinate of the position to check.
 * @returns {boolean} True if the position is on a bomb, false otherwise.
 */
function isOnBomb(x, y) {
  for (let i = 0; i < bombs.length; i++) {
    if (bombs[i].x === x && bombs[i].y === y) {
      return true;
    }
  }
  return false;
}

/**
 * Function to generate new food position.
 * @param {Array} existingFoods - An array of existing food positions to avoid placing new food on the same spot.
 * @returns {Object} The new food position as an object with properties x and y.
 */
function generateFood(existingFoods = []) {
  let foodX, foodY;
  do {
    foodX = Math.floor(Math.random() * (cols - 1)) * box;
    foodY = Math.floor(Math.random() * (rows - 1)) * box;
  } while (
    isOnSnake(foodX, foodY) ||
    isOnBomb(foodX, foodY) ||
    isNearBomb(foodX, foodY) ||
    isNearSnake(foodX, foodY) ||
    isNearFood(foodX, foodY) ||
    existingFoods.some((food) => food.x === foodX && food.y === foodY) // Avoid placing on the same spot as existing food
  );

  return { x: foodX, y: foodY };
}

/**
 * Function to generate new bomb position.
 * @returns {Object} The new bomb position as an object with properties x and y.
 */
function generateBomb() {
  let bombX, bombY;

  do {
    bombX = Math.floor(Math.random() * (cols - 1)) * box;
    bombY = Math.floor(Math.random() * (rows - 1)) * box;
  } while (
    isOnSnake(bombX, bombY) ||
    isOnBomb(bombX, bombY) ||
    (bombX === yellowFood.x && bombY === yellowFood.y) ||
    (bombX === redFood.x && bombY === redFood.y)
  );

  return { x: bombX, y: bombY };
}

/**
 * Function to check if a position is near a snake.
 * @param {number} x - The x-coordinate of the position to check.
 * @param {number} y - The y-coordinate of the position to check.
 * @returns {boolean} True if the position is near a snake, false otherwise.
 */
function isNearSnake(x, y) {
  if (toalScore >= 10) {
    for (let i = 0; i < aiSnake.length; i++) {
      if (euclideanDistance(x, y, aiSnake[i].x, aiSnake[i].y) <= 3 * box) {
        return true;
      }
    }
    for (let i = 0; i < playerSnake.length; i++) {
      if (euclideanDistance(x, y, playerSnake[i].x, playerSnake[i].y) <= 3 * box) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Function to check if a position is near food.
 * @param {number} x - The x-coordinate of the position to check.
 * @param {number} y - The y-coordinate of the position to check.
 * @returns {boolean} True if the position is near food, false otherwise.
 */
function isNearFood(x, y) {
  if (toalScore >= 10) {
    let distanceToYellowFood =
      euclideanDistance(x, y, yellowFood.x, yellowFood.y) <= 3 * box;
    let distanceToRedFood =
      euclideanDistance(x, y, redFood.x, redFood.y) <= 3 * box;
    return distanceToYellowFood || distanceToRedFood;
  } else {
    return false;
  }
}

/**
 * Function to check if a position is near a bomb.
 * @param {number} x - The x-coordinate of the position to check.
 * @param {number} y - The y-coordinate of the position to check.
 * @returns {boolean} True if the position is near a bomb, false otherwise.
 */
function isNearBomb(x, y) {
  if (toalScore >= 10) {
    for (let i = 0; i < bombs.length; i++) {
      if (euclideanDistance(x, y, bombs[i].x, bombs[i].y) <= 3 * box) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Function to calculate Euclidean distance between two points.
 * @param {number} x1 - The x-coordinate of the first point.
 * @param {number} y1 - The y-coordinate of the first point.
 * @param {number} x2 - The x-coordinate of the second point.
 * @param {number} y2 - The y-coordinate of the second point.
 * @returns {number} The Euclidean distance between the two points.
 */
function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// Initial food and bomb generation
yellowFood = generateFood([]);
redFood = generateFood([yellowFood]);
bombs = [generateBomb(), generateBomb()];
