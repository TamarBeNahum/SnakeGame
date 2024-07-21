// Function to start the game
function startGame() {
    document.getElementById('welcomeScreen').style.display = 'none'; // Hide the welcome screen
    document.getElementById('gameWrapper').style.display = 'flex'; // Display the game wrapper
    game = setInterval(draw, 300); // Start the game loop with a 300ms interval

    document.getElementById('scores').style.display = 'flex'; // Show scores when the game starts
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
bombImg.style.width = '70px'
bombImg.style.height = '70px'

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
    drawSnake(aiSnake, "green", 'aiSnake');
    drawSnake(playerSnake, "blue", 'playerSnake');
    drawFood();
    drawBombs();

    // Move food after a certain score
    if (toalScore >= 10) {
        moveYellowFood();
        moveRedFood();
    }

    // Find path for AI snake using A* algorithm
    path = aStar({ x: aiSnake[0].x, y: aiSnake[0].y, g: 0, f: 0 }, yellowFood, redFood, 2, 3);
    document.getElementById("aiScore").innerText = `AI Score: ${aiScore}`;
    document.getElementById("playerScore").innerText = `Player Score: ${playerScore}`;

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
// Function to draw the snake on the canvas
function drawSnake(snake, color, name) {
    for (let i = 0; i < snake.length; i++) {
        if (i === 0) { // Draw head with eyes
            // Gradient for the head
            let gradient = ctx.createRadialGradient(
                snake[i].x + box / 2, snake[i].y + box / 2, box / 6,
                snake[i].x + box / 2, snake[i].y + box / 2, box / 2
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, "dark" + color);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2, 0, Math.PI * 2, true);
            ctx.fill();

            // Draw eyes
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(snake[i].x + box / 3, snake[i].y + box / 3, box / 6, 0, Math.PI * 2, true);
            ctx.arc(snake[i].x + (2 * box) / 3, snake[i].y + box / 3, box / 6, 0, Math.PI * 2, true);
            ctx.fill();

            // Draw pupils
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(snake[i].x + box / 3, snake[i].y + box / 3, box / 12, 0, Math.PI * 2, true);
            ctx.arc(snake[i].x + (2 * box) / 3, snake[i].y + box / 3, box / 12, 0, Math.PI * 2, true);
            ctx.fill();
        } else { // Draw body segments
            // Gradient for the body
            let gradient = ctx.createRadialGradient(
                snake[i].x + box / 2, snake[i].y + box / 2, box / 6,
                snake[i].x + box / 2, snake[i].y + box / 2, box / 2
            );
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, "dark" + color);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2, 0, Math.PI * 2, true);
            ctx.fill();
        }
    }
}


// Function to draw food on the canvas
function drawFood() {
    ctx.drawImage(yellowAppleImg, yellowFood.x, yellowFood.y, box, box); // Draw yellow food
    ctx.drawImage(redAppleImg, redFood.x, redFood.y, box, box); // Draw red food
}

// Function to draw bombs on the canvas
function drawBombs() {
    for (let bomb of bombs) {
        ctx.drawImage(bombImg, bomb.x, bomb.y, box, box); // Draw each bomb
    }
}

// Function to update AI snake's position based on pathfinding
function updateAiSnakePosition() {
    let nextStep = path.shift(); // Get next step in the path
    let snakeX = nextStep.x;
    let snakeY = nextStep.y;

    let newHead = { x: snakeX, y: snakeY };
    if (checkGameOver(newHead, aiSnake, true, false)) {
        return; // Stop if the game is over
    }
    if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
        yellowFood = generateFood([redFood]); // Generate new yellow food
        aiScore += YELLOW_SCORE; // Increase AI score
        toalScore = playerScore + aiScore;
    } else if (snakeX === redFood.x && snakeY === redFood.y) {
        redFood = generateFood([yellowFood]); // Generate new red food
        aiScore += RED_SCORE; // Increase AI score
        toalScore = playerScore + aiScore;
    } else if (collision(newHead, bombs) && aiScore == 0) { // Snake eats bomb and has no score
        checkGameOver(newHead, aiSnake, true, true)
    } else if (collision(newHead, bombs) && aiScore != 0) {
        aiSnake = reduceSnakeLength(aiSnake); // Reduce snake's length in half
        aiScore = Math.floor(aiScore / 2); // Halve the score
        toalScore = playerScore + aiScore;
        bombs = bombs.filter(bomb => bomb.x !== snakeX || bomb.y !== snakeY); // Remove the bomb that was eaten
    } else {
        aiSnake.pop(); // Remove last segment if no food eaten
    }

    aiSnake.unshift(newHead); // Add new head to the snake

    if (collision(newHead, playerSnake)) {
        checkGameOver(newHead, aiSnake, true, false); // Check for collision with player snake
    }

    addBombsBasedOnScore(); // Add bombs based on score
}

// Function to update player snake's position based on user input
function updatePlayerSnakePosition() {
    let snakeX = playerSnake[0].x;
    let snakeY = playerSnake[0].y;

    if (d === "LEFT") snakeX -= box;
    if (d === "UP") snakeY -= box;
    if (d === "RIGHT") snakeX += box;
    if (d === "DOWN") snakeY += box;

    let newHead = { x: snakeX, y: snakeY };

    // If the game is over, stop the game
    if (checkGameOver(newHead, playerSnake, false, false)) {
        return;
    }


    if (snakeX === yellowFood.x && snakeY === yellowFood.y) { // Snake eats yellow food
        yellowFood = generateFood([redFood]);
        playerScore += YELLOW_SCORE;
        toalScore = playerScore + aiScore;
    } else if (snakeX === redFood.x && snakeY === redFood.y) { // Snake eats red food
        redFood = generateFood([yellowFood]);
        playerScore += RED_SCORE;
        toalScore = playerScore + aiScore;
    } else if (collision(newHead, bombs) && playerScore == 0) { // Snake eats bomb and has no score
        checkGameOver(newHead, playerSnake, false, true)
    } else if (collision(newHead, bombs) && playerScore != 0) {// Snake eats bomb but has some score
        playerSnake = reduceSnakeLength(playerSnake);
        playerScore = Math.floor(playerScore / 2);
        //if after penalizes the player remains with 0 points
        if (playerScore == 0) {
            playerSnake = playerSnake.slice(0, 0);
        }
        toalScore = playerScore + aiScore;
        bombs = bombs.filter(bomb => bomb.x !== snakeX || bomb.y !== snakeY); // Remove the bomb that was eaten
    } else {
        playerSnake.pop(); // Remove last segment if no food eaten
    }

    playerSnake.unshift(newHead); // Add new head to the snake

    if (collision(newHead, aiSnake)) {
        checkGameOver(newHead, playerSnake, false, false); // Check for collision with AI snake
    }

    addBombsBasedOnScore(); // Add bombs based on score
}

// Function to reduce the length of a snake by half
function reduceSnakeLength(snake) {
    let newLength = Math.floor(snake.length / 2); // Calculate new length
    newLength = newLength > 0 ? newLength : 0; // Ensure the length doesn't drop below 1
    return snake.slice(0, newLength); // Return the shortened snake
}

// Function to add bombs based on the current score
function addBombsBasedOnScore() {
    if (Math.floor(toalScore / 5) && scoreUpdated) { // Add bomb every 5 points
        if (toalScore >= 30) {
            bombs.push(generateBomb());
        }
        bombs.push(generateBomb());
        tempScore = toalScore; // Update temporary score
    }
    scoreUpdated = Math.floor(tempScore / 5) != Math.floor(toalScore / 5); // Check if score updated
}

// Function to check if the game is over
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
        }, 100);

        return true;
    }

    if ((aiScore >= WIN_SCORE || playerScore >= WIN_SCORE) && !congratulationsLogged) {
        isCollision = true;
        congratulationsLogged = true;

        document.getElementById("aiScore").innerText = `AI Score: ${aiScore}`;
        document.getElementById("playerScore").innerText = `Player Score: ${playerScore}`;
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

// Function to move yellow food
function moveYellowFood() {
    if (yellowMoveStep === 0 || yellowMoveStep === 2) {
        yellowDirection = -yellowDirection; // Change direction
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

// Function to move red food
function moveRedFood() {
    if (redMoveStep === 0 || redMoveStep === 2) {
        redDirection = -redDirection; // Change direction
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

// Function to check if a position is on a snake
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

//Function to check for a collision between the head of the snake and any segment of an array (snake's own body, other snakes, or bombs)
function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

// Function to check if a position is on food
function isOnFood(x, y) {
    return (
        (redFood.x === x && redFood.y === y) ||
        (yellowFood.x === x && yellowFood.y === y)
    );
}

// Function to check if a position is on a bomb
function isOnBomb(x, y) {
    for (let i = 0; i < bombs.length; i++) {
        if (bombs[i].x === x && bombs[i].y === y) {
            return true;
        }
    }
    return false;
}

// Function to generate new food position
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
        existingFoods.some(food => food.x === foodX && food.y === foodY) // Avoid same spot
    );
    return { x: foodX, y: foodY };
}

// Function to generate new bomb position
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

// Function to check if a position is near a snake
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

// Function to check if a position is near food
function isNearFood(x, y) {
    if (toalScore >= 10) {
        let distanceToYellowFood = euclideanDistance(x, y, yellowFood.x, yellowFood.y) <= 3 * box;
        let distanceToRedFood = euclideanDistance(x, y, redFood.x, redFood.y) <= 3 * box;
        return distanceToYellowFood || distanceToRedFood;
    }
    else {
        return false;
    }
}

// Function to check if a position is near a bomb
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

// Function to calculate Euclidean distance between two points
function euclideanDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

// Initial food and bomb generation
yellowFood = generateFood([]);
redFood = generateFood([yellowFood]);
bombs = [generateBomb(), generateBomb()];
