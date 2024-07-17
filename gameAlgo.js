// Add this function at the top of your gameAlgo.js
function startGame() {
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
  game = setInterval(draw, 300); // Start the game loop
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let gameEnded = false;
let congratulationsLogged = false; // Add this flag

const box = 32;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box }; // Starting point of the snake

let yellowFood;
let redFood;

let score = 0;

let yellowMoveStep = 0;
let redMoveStep = 0;
let yellowDirection = -1; // -1 for left, 1 for right
let redDirection = -1; // -1 for up, 1 for down

let bombs = [];

// Load the apple and bomb images
const yellowAppleImg = new Image();
yellowAppleImg.src = "yellowA.png";
const redAppleImg = new Image();
redAppleImg.src = "RedA.png";
const bombImg = new Image();
bombImg.src = "bomb.png";

let tempScore; // Temporary variable to store score
let scoreUpdated = true; // Flag to check if the score is updated

let path = []; // Path for the snake

function draw() {
  if (gameEnded) return;

  clearCanvas();
  drawBoard();
  drawSnake();
  drawFood();
  drawBombs();
  // over 10 points the food start moving and we calaulate the new path for each move
  if (score >= 10) {
    moveYellowFood();
    moveRedFood();
    path = aStar({ x: snake[0].x, y: snake[0].y, g: 0, f: 0 }, yellowFood, redFood, 2, 3);
  }

  ctx.fillStyle = "green";
  ctx.font = "30px Verdana";
  ctx.fillText(score, 2 * box, 1.6 * box);
  updateSnakePosition();
}

function clearCanvas() {
  ctx.fillStyle = "HoneyDew";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBoard() {
  const rows = canvas.height / box;
  const cols = canvas.width / box;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#A3D04A" : "#A9DA4D";
      ctx.fillRect(col * box, row * box, box, box);
    }
  }
}

function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "green" : "white";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = "green";
    ctx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  if (snake.length > 0) {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(snake[0].x + box / 4, snake[0].y + box / 4, box / 8, 0, Math.PI * 2, true);
    ctx.arc(snake[0].x + (3 * box) / 4, snake[0].y + box / 4, box / 8, 0, Math.PI * 2, true);
    ctx.fill();
  }
}

function drawFood() {
  ctx.drawImage(yellowAppleImg, yellowFood.x, yellowFood.y, box, box);
  ctx.drawImage(redAppleImg, redFood.x, redFood.y, box, box);
}

function drawBombs() {
  for (let bomb of bombs) {
    ctx.drawImage(bombImg, bomb.x, bomb.y, box, box);
  }
}

function updateSnakePosition() {
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (score < 10 && path.length === 0) {
    path = aStar({ x: snakeX, y: snakeY, g: 0, f: 0 }, yellowFood, redFood, 2, 3);
  }

  if (path.length > 0) {
    let nextStep = path.shift();
    snakeX = nextStep.x;
    snakeY = nextStep.y;
  }

  let newHead = { x: snakeX, y: snakeY };

  if (checkGameOver(newHead)) {
    return;
  }

  if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
    yellowFood = generateFood([redFood]);
    score += 2;
    path = []; // Reset path when food is eaten
  } else if (snakeX === redFood.x && snakeY === redFood.y) {
    redFood = generateFood([yellowFood]);
    score += 3;
    path = []; // Reset path when food is eaten
  } else if (collision(newHead, bombs)) { // Snake eats bomb
    snake = snake.slice(0, Math.ceil(snake.length / 2)); // reduce snake's length in half
    score = Math.floor(score / 2); // reduce score in half
    bombs = bombs.filter(bomb => bomb.x !== snakeX || bomb.y !== snakeY); // Remove the bomb that was eaten
  } else {
    snake.pop();
  }

  snake.unshift(newHead);

  addBombsBasedOnScore();
}

function addBombsBasedOnScore() {
  if (Math.floor(score / 5) && scoreUpdated) {
    if (score >= 30) {
      bombs.push(generateBomb());
    }
    bombs.push(generateBomb());
    tempScore = score;
  }
  scoreUpdated = Math.floor(tempScore / 5) != Math.floor(score / 5);
}

function checkGameOver(newHead) {
  if (
    newHead.x < 0 ||
    newHead.x >= 19 * box ||
    newHead.y < 0 ||
    newHead.y >= 19 * box ||
    collision(newHead, snake.slice(1)) ||
    collision(newHead, bombs)
  ) {
    clearInterval(game);
    Swal.fire({
      title: "Game Over",
      html: "<b>You crushed!",
      icon: "error",
      background: "#f9f9f9",
      showCancelButton: true,
      confirmButtonText: "Play Again!",
      cancelButtonText: "cancel",
      customClass: {
        title: 'swal-title',
        htmlContainer: 'swal-html',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        location.reload();
      }
    });

    return true;
  }

  if (score >= 50 && !congratulationsLogged) {
    gameEnded = true;
    congratulationsLogged = true;
    setTimeout(function () {
      clearInterval(game);
      console.log("Congratulations! You reached score 15.");
      setTimeout(function () {
        Swal.fire({
          title: "🎉 Congratulations! 🎉",
          html: "<b>You reached a score of 50!</b><br>Do you want to start a new game?",
          icon: "success",
          background: "#f9f9f9",
          showCancelButton: true,
          confirmButtonText: "Yes, start a new game!",
          cancelButtonText: "No, thanks!",
          customClass: {
            title: 'swal-title',
            htmlContainer: 'swal-html',
            confirmButton: 'swal-confirm',
            cancelButton: 'swal-cancel'
          }
        }).then((result) => {
          if (result.isConfirmed) {
            location.reload();
          }
        });
      }, 100);
    }, 600);
    return true;
  }
  return false;
}

function moveYellowFood() {
  if (yellowMoveStep === 0 || yellowMoveStep === 2) {
    yellowDirection = -yellowDirection;
    yellowMoveStep = 0;
  }
  let newX = yellowFood.x + yellowDirection * box;

  if (newX < 0) newX = 0;
  if (newX >= 18 * box) newX = 18 * box - box;

  if (isOnSnake(newX, yellowFood.y) || isOnBomb(newX, yellowFood.y) || (newX === redFood.x && yellowFood.y === redFood.y)) {
    yellowMoveStep++;
    return;
  }

  yellowFood.x = newX;
  yellowMoveStep++;
}

function moveRedFood() {
  if (redMoveStep === 0 || redMoveStep === 2) {
    redDirection = -redDirection;
    redMoveStep = 0;
  }
  let newY = redFood.y + redDirection * box;

  if (newY < 0) newY = 0;
  if (newY >= 18 * box) newY = 18 * box - box;

  if (isOnSnake(redFood.x, newY) || isOnBomb(redFood.x, newY) || (redFood.x === yellowFood.x && newY === yellowFood.y)) {
    redMoveStep++;
    return;
  }

  redFood.y = newY;
  redMoveStep++;
}

function isOnSnake(x, y) {
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === x && snake[i].y === y) {
      return true;
    }
  }
  return false;
}

function isOnFood(x, y) {
  return (
    (redFood.x === x && redFood.y === y) ||
    (yellowFood.x === x && yellowFood.y === y)
  );
}

function isOnBomb(x, y) {
  for (let i = 0; i < bombs.length; i++) {
    if (bombs[i].x === x && bombs[i].y === y) {
      return true;
    }
  }
  return false;
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}
// existingFoods[] handeling food coordinates, ensuring the apples are not at the same position as any existing food items are pass in the array
function generateFood(existingFoods = []) {
  let foodX, foodY;
  do {
    foodX = Math.floor(Math.random() * 17 + 1) * box;
    foodY = Math.floor(Math.random() * 15 + 3) * box;
  } while (
    isOnSnake(foodX, foodY) ||
    isOnBomb(foodX, foodY) ||
    isNearBomb(foodX, foodY) ||
    isNearSnake(foodX, foodY) ||
    isNearFood(foodX, foodY) ||
    existingFoods.some(food => food.x === foodX && food.y === foodY) // check the apples will not generate from the same spot
  );
  return { x: foodX, y: foodY };
}

function generateBomb() {
  let bombX, bombY;
  do {
    bombX = Math.floor(Math.random() * 17 + 1) * box;
    bombY = Math.floor(Math.random() * 15 + 3) * box;
  } while (
    isOnSnake(bombX, bombY) ||
    isOnBomb(bombX, bombY) ||
    (bombX === yellowFood.x && bombY === yellowFood.y) ||
    (bombX === redFood.x && bombY === redFood.y)
  );
  return { x: bombX, y: bombY };
}
//Checks whether less than radius 3 is found (after the fruits start moving)
function isNearSnake(x, y) {
  if (score >= 10) {
    for (let i = 0; i < snake.length; i++) {
      if (euclideanDistance(x, y, snake[i].x, snake[i].y) <= 3 * box) {
        return true;
      }
    }
  }
  return false;
}
//Checks whether less than radius 3 is found (after the fruits start moving)
function isNearFood(x, y) {
  if (score >= 10) {
    let distanceToYellowFood = euclideanDistance(x, y, yellowFood.x, yellowFood.y) <= 3 * box;
    let distanceToRedFood = euclideanDistance(x, y, redFood.x, redFood.y) <= 3 * box;
    return distanceToYellowFood || distanceToRedFood;
  }
  else{
    return false;
  }
}
//Checks whether less than radius 3 is found (after the fruits start moving)
function isNearBomb(x, y) {
  if (score >= 10) {
    for (let i = 0; i < bombs.length; i++) {
      if (euclideanDistance(x, y, bombs[i].x, bombs[i].y) <= 3 * box) {
        return true;
      }
    }
  }
  return false;
}

function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function isCollisionWithFood(head) {
  return (
    (head.x === yellowFood.x && head.y === yellowFood.y) ||
    (head.x === redFood.x && head.y === redFood.y)
  );
}

yellowFood = generateFood([]);
redFood = generateFood([yellowFood]); //passing [yellowFood] to ensure it doesn't overlap with yellowFood
bombs = [generateBomb(), generateBomb()];

// let game = setInterval(draw, 300);
