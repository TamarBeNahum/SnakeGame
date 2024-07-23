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
let game;
let gameEnded = false;
let congratulationsLogged = false; // Flag to prevent multiple congratulations
let isCollision = false;

// Add event listener to canvas for stopping/resuming the game on click
canvas.addEventListener("click", toggleGame);

// Function to stop/resume the game
function toggleGame() {
  if (game) {
    clearInterval(game);
    game = null;
    console.log("Game stopped.");
  } else {
    game = setInterval(draw, 300);
    console.log("Game resumed.");
  }
}

// Game constants and variables
const box = 32; // Size of each grid cell
const rows = 22; // Number of rows in the grid
const cols = 22; // Number of columns in the grid
let aiSnake = [{ x: 9 * box, y: 10 * box }]; // AI Snake starting position
let playerSnake = [{ x: 15 * box, y: 10 * box }]; // Player Snake starting position
let yellowFood;
let redFood;
let playerScore = 0;
let aiScore = 0;
let toalScore = 0; // Combined score for bomb generation logic

// Score constants
const YELLOW_SCORE = 2;
const RED_SCORE = 3;
const WIN_SCORE = 50;

// Variables for food movement
let yellowMoveStep = 0;
let redMoveStep = 0;
let yellowDirection = -1; // -1 for left, 1 for right
let redDirection = -1; // -1 for up, 1 for down

// Array to store bombs
let bombs = [];

// Load images for food and bombs
const yellowAppleImg = new Image();
yellowAppleImg.src = "yellowA.png";
const redAppleImg = new Image();
redAppleImg.src = "RedA.png";
const bombImg = new Image();
bombImg.src = "bomb1.png";
bombImg.style.width = "70px";
bombImg.style.height = "70px";

let tempScore; // Temporary variable to store score
let scoreUpdated = true; // Flag to check if the score is updated

let path = []; // Path for the AI snake

// Add event listener for player snake controls
document.addEventListener("keydown", direction);

let d;
// Function to handle player snake direction based on keyboard input
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

// Main draw function called repeatedly to update the game
function draw() {
  if (gameEnded) return; // Stop drawing if the game has ended

  clearCanvas();
  drawBoard();
  drawSnake(aiSnake, "green", "aiSnake");
  drawSnake(playerSnake, "blue", "playerSnake");
  drawFood();
  drawBombs();

  // Move food after a certain score
  if (toalScore >= 10) {
    moveYellowFood();
    moveRedFood();
  }

  // Find path for AI snake using A* algorithm
  path = aStar(
    { x: aiSnake[0].x, y: aiSnake[0].y, g: 0, f: 0 },
    yellowFood,
    redFood,
    2,
    3
  );
  document.getElementById("aiScore").innerText = `AI Score: ${aiScore}`;
  document.getElementById(
    "playerScore"
  ).innerText = `Player Score: ${playerScore}`;

  updateAiSnakePosition();
  updatePlayerSnakePosition();
}

// Function to clear the canvas
function clearCanvas() {
  ctx.fillStyle = "#A3D04A"; // Set the background color
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas
}

// Function to draw the game board
function drawBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#A3D04A" : "#A9DA4D"; // Alternate colors for grid
      ctx.fillRect(col * box, row * box, box, box);
    }
  }
}

// Function to draw the snake on the canvas
function drawSnake(snake, color, name) {
  for (let i = 0; i < snake.length; i++) {
    if (i === 0) {
      // Draw head with eyes
      // Gradient for the head
      let gradient = ctx.createRadialGradient(
        snake[i].x + box / 2,
        snake[i].y + box / 2,
        box / 6,
        snake[i].x + box / 2,
        snake[i].y + box / 2,
        box / 2
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "dark" + color);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        snake[i].x + box / 2,
        snake[i].y + box / 2,
        box / 2,
        0,
        Math.PI * 2,
        true
      );
      ctx.fill();

      // Draw eyes
      ctx.fillStyle = "white";
      ctx.beginPath();
      ctx.arc(
        snake[i].x + box / 3,
        snake[i].y + box / 3,
        box / 6,
        0,
        Math.PI * 2,
        true
      );
      ctx.arc(
        snake[i].x + (2 * box) / 3,
        snake[i].y + box / 3,
        box / 6,
        0,
        Math.PI * 2,
        true
      );
      ctx.fill();

      // Draw pupils
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(
        snake[i].x + box / 3,
        snake[i].y + box / 3,
        box / 12,
        0,
        Math.PI * 2,
        true
      );
      ctx.arc(
        snake[i].x + (2 * box) / 3,
        snake[i].y + box / 3,
        box / 12,
        0,
        Math.PI * 2,
        true
      );
      ctx.fill();
    } else {
      // Draw body segments
      // Gradient for the body
      let gradient = ctx.createRadialGradient(
        snake[i].x + box / 2,
        snake[i].y + box / 2,
        box / 6,
        snake[i].x + box / 2,
        snake[i].y + box / 2,
        box / 2
      );
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "dark" + color);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(
        snake[i].x + box / 2,
        snake[i].y + box / 2,
        box / 2,
        0,
        Math.PI * 2,
        true
      );
      ctx.fill();
    }
  }
}

// Function to draw food on the canvas
function drawFood() {
  // Draw yellow food on the canvas at its specified coordinates
  ctx.drawImage(yellowAppleImg, yellowFood.x, yellowFood.y, box, box);

  // Draw red food on the canvas at its specified coordinates
  ctx.drawImage(redAppleImg, redFood.x, redFood.y, box, box);
}

// Function to draw bombs on the canvas
function drawBombs() {
  // Iterate through each bomb in the bombs array
  for (let bomb of bombs) {
    // Draw each bomb on the canvas at its specified coordinates
    ctx.drawImage(bombImg, bomb.x, bomb.y, box, box);
  }
}

// Function to update AI snake's position based on pathfinding
function updateAiSnakePosition() {
  // Get the next step in the path for the AI snake
  let nextStep = path.shift();
  let snakeX = nextStep.x;
  let snakeY = nextStep.y;

  // Create a new head object with the updated coordinates
  let newHead = { x: snakeX, y: snakeY };

  // If the game is over, stop the game
  if (checkGameOver(newHead, aiSnake, true, false)) {
    return;
  }

  // Check if the AI snake eats yellow food
  if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
    yellowFood = generateFood([redFood]); // Generate new yellow food
    aiScore += YELLOW_SCORE; // Increase AI score
    toalScore = playerScore + aiScore; // Update total score
  }
  // Check if the AI snake eats red food
  else if (snakeX === redFood.x && snakeY === redFood.y) {
    redFood = generateFood([yellowFood]); // Generate new red food
    aiScore += RED_SCORE; // Increase AI score
    toalScore = playerScore + aiScore; // Update total score
  }
  // Check if the AI snake eats a bomb and has no score
  else if (collision(newHead, bombs) && aiScore == 0) {
    checkGameOver(newHead, aiSnake, true, true); // End the game
  }
  // Check if the AI snake eats a bomb but has some score
  else if (collision(newHead, bombs) && aiScore != 0) {
    aiSnake = reduceSnakeLength(aiSnake); // Reduce the snake's length
    aiScore = Math.floor(aiScore / 2); // Halve the AI score
    toalScore = playerScore + aiScore; // Update total score
    bombs = bombs.filter((bomb) => bomb.x !== snakeX || bomb.y !== snakeY); // Remove the bomb that was eaten
  }
  // If no food or bomb is eaten, remove the last segment
  else {
    aiSnake.pop(); // Remove last segment if no food eaten
  }

  // Add new head to the snake
  aiSnake.unshift(newHead);

  // Check for collision with the player snake
  if (collision(newHead, playerSnake)) {
    checkGameOver(newHead, aiSnake, true, false); // End the game if collision occurs
  }

  // Add bombs based on the current score
  addBombsBasedOnScore();
}

// Function to update player snake's position based on user input
function updatePlayerSnakePosition() {
  // Get the current head position of the player snake
  let snakeX = playerSnake[0].x;
  let snakeY = playerSnake[0].y;

  // Update the head position based on the direction 'd'
  if (d === "LEFT") snakeX -= box;
  if (d === "UP") snakeY -= box;
  if (d === "RIGHT") snakeX += box;
  if (d === "DOWN") snakeY += box;

  // Create a new head object with the updated coordinates
  let newHead = { x: snakeX, y: snakeY };

  // If the game is over, stop the game
  if (checkGameOver(newHead, playerSnake, false, false)) {
    return;
  }

  // Check if the player snake eats yellow food
  if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
    yellowFood = generateFood([redFood]); // Generate new yellow food
    playerScore += YELLOW_SCORE; // Increase player score
    toalScore = playerScore + aiScore; // Update total score
  }
  // Check if the player snake eats red food
  else if (snakeX === redFood.x && snakeY === redFood.y) {
    redFood = generateFood([yellowFood]); // Generate new red food
    playerScore += RED_SCORE; // Increase player score
    toalScore = playerScore + aiScore; // Update total score
  }
  // Check if the player snake eats a bomb and has no score
  else if (collision(newHead, bombs) && playerScore == 0) {
    checkGameOver(newHead, playerSnake, false, true); // End the game
  }
  // Check if the player snake eats a bomb but has some score
  else if (collision(newHead, bombs) && playerScore != 0) {
    playerSnake = reduceSnakeLength(playerSnake); // Reduce the snake's length
    playerScore = Math.floor(playerScore / 2); // Halve the player score
    // If after penalization the player has 0 points, reset the snake
    if (playerScore == 0) {
      playerSnake = playerSnake.slice(0, 0);
    }
    toalScore = playerScore + aiScore; // Update total score
    bombs = bombs.filter((bomb) => bomb.x !== snakeX || bomb.y !== snakeY); // Remove the bomb that was eaten
  }
  // If no food or bomb is eaten, remove the last segment
  else {
    playerSnake.pop(); // Remove last segment if no food eaten
  }

  // Add new head to the snake
  playerSnake.unshift(newHead);

  // Check for collision with the AI snake
  if (collision(newHead, aiSnake)) {
    checkGameOver(newHead, playerSnake, false, false); // End the game if collision occurs
  }

  // Add bombs based on the current score
  addBombsBasedOnScore();
}

// Function to reduce the length of a snake by half
function reduceSnakeLength(snake) {
  // Parameters:
  // snake - An array representing the segments of the snake

  // Calculate the new length of the snake by halving its current length
  let newLength = Math.floor(snake.length / 2);
  // Ensure the new length is not less than 1 (a snake must have at least one segment)
  newLength = newLength > 0 ? newLength : 1;
  // Return a new array containing the first 'newLength' segments of the original snake
  return snake.slice(0, newLength);
}

// Function to add bombs based on the current score
function addBombsBasedOnScore() {
  // Check if the total score is a multiple of 5 and if the score has been updated
  if (Math.floor(toalScore / 5) && scoreUpdated) {
    // Add additional bomb when the total score is 30 or more
    if (toalScore >= 30) {
      bombs.push(generateBomb()); // Generate and add a new bomb
    }
    bombs.push(generateBomb()); // Generate and add a new bomb
    tempScore = toalScore; // Update temporary score to current total score
  }

  // Check if the score has updated to the next multiple of 5
  scoreUpdated = Math.floor(tempScore / 5) != Math.floor(toalScore / 5);
  // Update scoreUpdated to true if the total score has moved to the next multiple of 5
}

// Function to check if the game is over
function checkGameOver(newHead, snake, isAiSnake, isDiedFromBomb) {
  // Parameters:
  // newHead - An object representing the new head of the snake with properties x and y
  // snake - An array representing the segments of the snake
  // isAiSnake - A boolean indicating whether the snake is the AI snake
  // isDiedFromBomb - A boolean indicating whether the snake died from a bomb

  // If a collision has already been detected, return true
  if (isCollision) return true;

  // Check for various conditions that indicate the game is over
  if (
    newHead.x < 0 || // Check if the new head is out of the left boundary
    newHead.x >= cols * box || // Check if the new head is out of the right boundary
    newHead.y < 0 || // Check if the new head is out of the top boundary
    newHead.y >= rows * box || // Check if the new head is out of the bottom boundary
    isDiedFromBomb || // Check if the snake died from a bomb
    collision(newHead, snake.slice(1)) || // Check if the new head collided with the snake's own body
    collision(newHead, isAiSnake ? playerSnake : aiSnake) // Check if the new head collided with the other snake
  ) {
    // Set the collision flag to true
    isCollision = true;

    // Display a game over message after a short delay
    setTimeout(() => {
      let message = collision(newHead, isAiSnake ? playerSnake : aiSnake)
        ? "!התנגשות התרחשה " // Display a collision message in Hebrew
        : `${isAiSnake ? "AI" : "Player"} lost...${
            isAiSnake ? "Player" : "AI"
          } Wins!`; // Display a win/loss message

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
          location.reload(); // Reload the page to start a new game if the player confirms
        }
      });
    }, 100);

    return true; // Return true indicating the game is over
  }

  // Check if either player has reached the winning score
  if (
    (aiScore >= WIN_SCORE || playerScore >= WIN_SCORE) &&
    !congratulationsLogged
  ) {
    // Set the collision flag to true
    isCollision = true;
    congratulationsLogged = true; // Prevent multiple congratulations messages

    document.getElementById("aiScore").innerText = `AI Score: ${aiScore}`;
    document.getElementById(
      "playerScore"
    ).innerText = `Player Score: ${playerScore}`;
    clearCanvas();
    drawBoard();
    drawSnake(aiSnake, "green", "aiSnake");
    drawSnake(playerSnake, "blue", "playerSnake");
    drawFood();
    drawBombs();

    // Show the congratulations message after a slight delay to ensure rendering
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
            location.reload(); // Reload the page to start a new game if the player confirms
          }
        });
      }, 100);
    }, 600);

    return true; // Return true indicating the game is over
  }

  return false; // Return false indicating the game is not over
}

// Function to move yellow food
function moveYellowFood() {
  // Check if it's time to change direction
  if (yellowMoveStep === 0 || yellowMoveStep === 2) {
    yellowDirection = -yellowDirection; // Change direction
    yellowMoveStep = 0;
  }

  // Calculate new x-coordinate for the yellow food
  let newX = yellowFood.x + yellowDirection * box;

  // Ensure the new x-coordinate is within the grid boundaries
  if (newX < 0) newX = 0;
  if (newX >= (cols - 1) * box) newX = (cols - 1) * box;

  // Check if the new position is valid (not on a snake, bomb, or red food)
  if (
    isOnSnake(newX, yellowFood.y) || // Check if the new position is on any snake
    isOnBomb(newX, yellowFood.y) || // Check if the new position is on any bomb
    (newX === redFood.x && yellowFood.y === redFood.y) // Check if the new position is the same as red food
  ) {
    yellowMoveStep++; // Increment move step to attempt next move
    return; // Exit the function if the new position is not valid
  }

  // Update the x-coordinate of the yellow food
  yellowFood.x = newX;
  // Increment move step for the next move
  yellowMoveStep++;
}

// Function to move red food
function moveRedFood() {
  // Check if it's time to change direction
  if (redMoveStep === 0 || redMoveStep === 2) {
    redDirection = -redDirection; // Change direction
    redMoveStep = 0;
  }

  // Calculate new y-coordinate for the red food
  let newY = redFood.y + redDirection * box;

  // Ensure the new y-coordinate is within the grid boundaries
  if (newY < 0) newY = 0;
  if (newY >= (rows - 1) * box) newY = (rows - 1) * box;

  // Check if the new position is valid (not on a snake, bomb, or yellow food)
  if (
    isOnSnake(redFood.x, newY) || // Check if the new position is on any snake
    isOnBomb(redFood.x, newY) || // Check if the new position is on any bomb
    (redFood.x === yellowFood.x && newY === yellowFood.y) // Check if the new position is the same as yellow food
  ) {
    redMoveStep++; // Increment move step to attempt next move
    return; // Exit the function if the new position is not valid
  }

  // Update the y-coordinate of the red food
  redFood.y = newY;
  // Increment move step for the next move
  redMoveStep++;
}

// Function to check if a position is on a snake
function isOnSnake(x, y) {
  // Parameters:
  // x - The x-coordinate of the position to check
  // y - The y-coordinate of the position to check

  // Check if the position is on the AI snake
  for (let i = 0; i < aiSnake.length; i++) {
    if (aiSnake[i].x === x && aiSnake[i].y === y) {
      return true; // Position is on the AI snake
    }
  }

  // Check if the position is on the player snake
  for (let i = 0; i < playerSnake.length; i++) {
    if (playerSnake[i].x === x && playerSnake[i].y === y) {
      return true; // Position is on the player snake
    }
  }

  return false; // Position is not on any snake
}

// Function to check for a collision between the head of the snake and any segment of an array (snake's own body, other snakes, or bombs)
function collision(head, array) {
  // Parameters:
  // head - An object representing the head of the snake, with properties x and y
  // array - An array of objects representing the segments of the snake, other snakes, or bombs, each with properties x and y

  // Iterate through each element in the array
  for (let i = 0; i < array.length; i++) {
    // Check if the head's position matches the current element's position
    if (head.x === array[i].x && head.y === array[i].y) {
      return true; // Collision detected
    }
  }
  return false; // No collision detected
}

// Function to check if a position is on food
function isOnFood(x, y) {
  // Parameters:
  // x - The x-coordinate of the position to check
  // y - The y-coordinate of the position to check

  return (
    (redFood.x === x && redFood.y === y) || // Check if the position matches the red food's position
    (yellowFood.x === x && yellowFood.y === y) // Check if the position matches the yellow food's position
  );
}

// Function to check if a position is on a bomb
function isOnBomb(x, y) {
  // Parameters:
  // x - The x-coordinate of the position to check
  // y - The y-coordinate of the position to check

  // Iterate through all the bombs
  for (let i = 0; i < bombs.length; i++) {
    // Check if the current bomb's position matches the given coordinates
    if (bombs[i].x === x && bombs[i].y === y) {
      return true; // Position is on a bomb
    }
  }
  return false; // Position is not on a bomb
}

// Function to generate new food position
function generateFood(existingFoods = []) {
  // Parameters:
  // existingFoods - An array of existing food positions to avoid placing new food on the same spot

  let foodX, foodY;
  do {
    // Generate random x and y coordinates for the new food
    foodX = Math.floor(Math.random() * (cols - 1)) * box;
    foodY = Math.floor(Math.random() * (rows - 1)) * box;
  } while (
    // Ensure the new food position is not on a snake, bomb, or too close to other entities
    isOnSnake(foodX, foodY) ||
    isOnBomb(foodX, foodY) ||
    isNearBomb(foodX, foodY) ||
    isNearSnake(foodX, foodY) ||
    isNearFood(foodX, foodY) ||
    // Check if the new food position matches any of the existing food positions
    existingFoods.some((food) => food.x === foodX && food.y === foodY) // Avoid same spot
  );

  // Return the new food position as an object
  return { x: foodX, y: foodY };
}

// Function to generate new bomb position
function generateBomb() {
  // Local variables to store the generated bomb coordinates
  let bombX, bombY;

  // Loop until a valid bomb position is found
  do {
    // Generate random x and y coordinates for the new bomb
    bombX = Math.floor(Math.random() * (cols - 1)) * box;
    bombY = Math.floor(Math.random() * (rows - 1)) * box;
  } while (
    // Ensure the new bomb position is not on a snake, another bomb, or food
    isOnSnake(bombX, bombY) || // Check if the bomb position is on a snake
    isOnBomb(bombX, bombY) || // Check if the bomb position is on another bomb
    (bombX === yellowFood.x && bombY === yellowFood.y) || // Check if the bomb position is on the yellow food
    (bombX === redFood.x && bombY === redFood.y) // Check if the bomb position is on the red food
  );

  // Return the new bomb position as an object
  return { x: bombX, y: bombY };
}

// Function to check if a position is near a snake
function isNearSnake(x, y) {
  // Parameters:
  // x - The x-coordinate of the position to check
  // y - The y-coordinate of the position to check

  // Check if the total score is 10 or more
  if (toalScore >= 10) {
    // Check if the position is near any segment of the AI snake
    for (let i = 0; i < aiSnake.length; i++) {
      // Calculate the Euclidean distance between the position and the current segment of the AI snake
      if (euclideanDistance(x, y, aiSnake[i].x, aiSnake[i].y) <= 3 * box) {
        return true; // Position is near the AI snake
      }
    }
    // Check if the position is near any segment of the player snake
    for (let i = 0; i < playerSnake.length; i++) {
      // Calculate the Euclidean distance between the position and the current segment of the player snake
      if (
        euclideanDistance(x, y, playerSnake[i].x, playerSnake[i].y) <=
        3 * box
      ) {
        return true; // Position is near the player snake
      }
    }
  }
  return false; // Position is not near any snake
}

// Function to check if a position is near food
function isNearFood(x, y) {
  // Parameters:
  // x - The x-coordinate of the position to check
  // y - The y-coordinate of the position to check

  // Check if the total score is 10 or more
  if (toalScore >= 10) {
    // Calculate the Euclidean distance between the position and the yellow food
    let distanceToYellowFood =
      euclideanDistance(x, y, yellowFood.x, yellowFood.y) <= 3 * box;
    // Calculate the Euclidean distance between the position and the red food
    let distanceToRedFood =
      euclideanDistance(x, y, redFood.x, redFood.y) <= 3 * box;
    // Return true if the position is near either the yellow food or the red food
    return distanceToYellowFood || distanceToRedFood;
  } else {
    // Return false if the total score is less than 10
    return false;
  }
}

// Function to check if a position is near a bomb
function isNearBomb(x, y) {
  // Parameters:
  // x - The x-coordinate of the position to check
  // y - The y-coordinate of the position to check

  // Check if the total score is 10 or more
  if (toalScore >= 10) {
    // Iterate through all the bombs
    for (let i = 0; i < bombs.length; i++) {
      // Calculate the Euclidean distance between the position and the current bomb
      if (euclideanDistance(x, y, bombs[i].x, bombs[i].y) <= 3 * box) {
        return true; // Position is near a bomb
      }
    }
  }
  return false; // Position is not near any bomb
}

// Function to calculate Euclidean distance between two points
function euclideanDistance(x1, y1, x2, y2) {
  // Parameters:
  // x1 - The x-coordinate of the first point
  // y1 - The y-coordinate of the first point
  // x2 - The x-coordinate of the second point
  // y2 - The y-coordinate of the second point

  // Calculate the Euclidean distance using the distance formula
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// Initial food and bomb generation
yellowFood = generateFood([]);
redFood = generateFood([yellowFood]);
bombs = [generateBomb(), generateBomb()];
