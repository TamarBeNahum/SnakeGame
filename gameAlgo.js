function startGame() {
  document.getElementById('welcomeScreen').style.display = 'none';
  document.getElementById('gameWrapper').style.display = 'flex';
  game = setInterval(draw, 300); // Start the game loop

  // Show scores when the game starts
  document.getElementById('scores').style.display = 'flex';
}

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let gameEnded = false;
let congratulationsLogged = false; // Add this flag

const box = 32;
const rows = 22; // Increased number of rows
const cols = 22; // Increased number of columns

let aiSnake = [{ x: 9 * box, y: 10 * box }]; // AI Snake starting point
let playerSnake = [{ x: 15 * box, y: 10 * box }]; // Player Snake starting point

let yellowFood;
let redFood;

let playerScore = 0;
let aiScore = 0;
let score = 0; // Combined score - for the addBombsBasedOnScore

// Constants for the scores
const YELLOW_SCORE = 2;
const RED_SCORE = 3;
const WIN_SCORE = 50;

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

let path = []; // Path for the AI snake

// Add event listener for player snake controls
document.addEventListener("keydown", direction);

let d;
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

function draw() {
  if (gameEnded) return;

  clearCanvas();
  drawBoard();
  drawSnake(aiSnake, "green");
  drawSnake(playerSnake, "blue");
  drawFood();
  drawBombs();

  if (score >= 10) {
    moveYellowFood();
    moveRedFood();

  }
  path = aStar({ x: aiSnake[0].x, y: aiSnake[0].y, g: 0, f: 0 }, yellowFood, redFood, 2, 3);
  document.getElementById("aiScore").innerText = `AI Score: ${aiScore}`;
  document.getElementById("playerScore").innerText = `Player Score: ${playerScore}`;

  updateAiSnakePosition();
  updatePlayerSnakePosition();
}

function clearCanvas() {
  ctx.fillStyle = "HoneyDew";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBoard() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#A3D04A" : "#A9DA4D";
      ctx.fillRect(col * box, row * box, box, box);
    }
  }
}

function drawSnake(snake, color) {
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? color : "white";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
    ctx.strokeStyle = color;
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

function updateAiSnakePosition() {

  let nextStep = path.shift();
  let snakeX = nextStep.x;
  let snakeY = nextStep.y;


  let newHead = { x: snakeX, y: snakeY };
  if (checkGameOver(newHead, aiSnake, true, false)) {
    return;
  }
  if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
    yellowFood = generateFood([redFood]);
    aiScore += YELLOW_SCORE;
    score = playerScore + aiScore;
  } else if (snakeX === redFood.x && snakeY === redFood.y) {
    redFood = generateFood([yellowFood]);
    aiScore += RED_SCORE;
    score = playerScore + aiScore;
  } else if (collision(newHead, bombs) && aiScore == 0) { // Snake eats bomb
    checkGameOver(newHead, aiSnake, true, true)
  } else if (collision(newHead, bombs) && aiScore != 0) {
    aiSnake = reduceSnakeLength(aiSnake); // reduce snake's length in half // reduce snake's length in half
    aiScore = Math.floor(aiScore / 2);
    score = playerScore + aiScore; // reduce score in half
    bombs = bombs.filter(bomb => bomb.x !== snakeX || bomb.y !== snakeY); // Remove the bomb that was eaten
  } else {
    aiSnake.pop();
  }

  aiSnake.unshift(newHead);

  if (collision(newHead, playerSnake)) {
    checkGameOver(newHead, aiSnake, true, false);
  }

  addBombsBasedOnScore();
}

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

  if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
    yellowFood = generateFood([redFood]);
    playerScore += YELLOW_SCORE;
    score = playerScore + aiScore;
  } else if (snakeX === redFood.x && snakeY === redFood.y) {
    redFood = generateFood([yellowFood]);
    playerScore += RED_SCORE;
    score = playerScore + aiScore;
  } else if (collision(newHead, bombs) && playerScore == 0) { // Snake eats bomb
    checkGameOver(newHead, playerSnake, false, true)
  } else if (collision(newHead, bombs) && playerScore != 0) {
    playerSnake = reduceSnakeLength(playerSnake); // reduce snake's length in half
    playerScore = Math.floor(playerScore / 2);
    if(playerScore == 0){
      playerSnake = playerSnake.slice(0, 0);
    }
    score = playerScore + aiScore; // reduce score in half
    bombs = bombs.filter(bomb => bomb.x !== snakeX || bomb.y !== snakeY); // Remove the bomb that was eaten
  } else {
    playerSnake.pop();
  }

  playerSnake.unshift(newHead);

  if (collision(newHead, aiSnake)) {
    checkGameOver(newHead, playerSnake, false, false);
  }

  addBombsBasedOnScore();
}

function reduceSnakeLength(snake) {
  let newLength = Math.floor(snake.length / 2) ;
  newLength = newLength > 0 ? newLength : 0; // Ensure the length doesn't drop below 1
  return snake.slice(0, newLength);
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

function checkGameOver(newHead, snake, isAiSnake, isDiedFromBomb) {
  if (
    newHead.x < 0 ||
    newHead.x >= cols * box ||
    newHead.y < 0 ||
    newHead.y >= rows * box ||
    isDiedFromBomb ||
    collision(newHead, snake.slice(1)) ||
    collision(newHead, isAiSnake ? playerSnake : aiSnake)
  ) {
    clearInterval(game);
    let message = collision(newHead, isAiSnake ? playerSnake : aiSnake) ? "התנגשות התרחשה!" : `${isAiSnake ? "AI" : "Player"} lost...${isAiSnake ? "Player" : "AI"} Wins!`;

    Swal.fire({
      title: message,
      icon: "warning",
      background: "#f9f9f9",
      showCancelButton: false,
      confirmButtonText: "Start Again",
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

  if ((aiScore >= WIN_SCORE || playerScore >= WIN_SCORE) && !congratulationsLogged) {
    gameEnded = true;
    congratulationsLogged = true;
    setTimeout(function () {
      clearInterval(game);
      let winner = aiScore >= 50 ? "AI" : "Player";
      console.log(`Congratulations! ${winner} reached score 50.`);
      setTimeout(function () {
        Swal.fire({
          title: `🎉 Congratulations ${winner}! 🎉`,
          html: `<b>${winner} reached a score of 50!</b><br>Do you want to start a new game?`,
          icon: "success",
          background: "#f9f9f9",
          showCancelButton: false,
          confirmButtonText: "start a new game",
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
  if (newX >= (cols - 1) * box) newX = (cols - 1) * box;

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
  if (newY >= (rows - 1) * box) newY = (rows - 1) * box;

  if (isOnSnake(redFood.x, newY) || isOnBomb(redFood.x, newY) || (redFood.x === yellowFood.x && newY === yellowFood.y)) {
    redMoveStep++;
    return;
  }

  redFood.y = newY;
  redMoveStep++;
}

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
    existingFoods.some(food => food.x === foodX && food.y === foodY) // check the apples will not generate from the same spot
  );
  return { x: foodX, y: foodY };
}

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

function isNearSnake(x, y) {
  if (score >= 10) {
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

function isNearFood(x, y) {
  if (score >= 10) {
    let distanceToYellowFood = euclideanDistance(x, y, yellowFood.x, yellowFood.y) <= 3 * box;
    let distanceToRedFood = euclideanDistance(x, y, redFood.x, redFood.y) <= 3 * box;
    return distanceToYellowFood || distanceToRedFood;
  }
  else {
    return false;
  }
}

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

yellowFood = generateFood([]);
redFood = generateFood([yellowFood]);
bombs = [generateBomb(), generateBomb()];

