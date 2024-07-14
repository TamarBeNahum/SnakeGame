// gameAlgo.js
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 32;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box }; // נקודת ההתחלה של הנחש

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

let tempScore; //משתנה זמני לשמירת הניקוד
let scoreUpdated = true; // דגל הבודק אם הניקוד התעדכן

function draw() {
    ctx.fillStyle = "HoneyDew";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const rows = canvas.height / box;
    const cols = canvas.width / box;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? "#A3D04A" : "#A9DA4D";
            ctx.fillRect(col * box, row * box, box, box);
        }
    }

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "green" : "white";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "green";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    if (snake.length > 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(
            snake[0].x + box / 4,
            snake[0].y + box / 4,
            box / 8,
            0,
            Math.PI * 2,
            true
        );
        ctx.arc(
            snake[0].x + (3 * box) / 4,
            snake[0].y + box / 4,
            box / 8,
            0,
            Math.PI * 2,
            true
        );
        ctx.fill();
    }

    ctx.drawImage(yellowAppleImg, yellowFood.x, yellowFood.y, box, box);
    ctx.drawImage(redAppleImg, redFood.x, redFood.y, box, box);

    for (let bomb of bombs) {
        ctx.drawImage(bombImg, bomb.x, bomb.y, box, box);
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // בחירת היעד הקרוב ביותר
    let yellowDistance = heuristic(snake[0], yellowFood);
    let redDistance = heuristic(snake[0], redFood);
    let target = yellowDistance <= redDistance ? yellowFood : redFood;

    // מציאת המסלול הקצר ביותר ליעד
    let path = aStar({ x: snakeX, y: snakeY, g: 0, f: 0 }, target);

    if (path.length > 0) {
        snakeX = path[0].x;
        snakeY = path[0].y;
    }

    // אכילת התפוחים ועדכון הציון
    if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
        score += 2;
        yellowFood = generateFood();
    } else if (snakeX === redFood.x && snakeY === redFood.y) {
        score += 3;
        redFood = generateFood();
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    // // בדיקת התנגשות עם גבולות המסך, עם הנחש עצמו או עם הפצצות
    // if (
    //   snakeX < 0 ||
    //   snakeX >= 18 * box ||
    //   snakeY < 0 ||
    //   snakeY >= 18 * box ||
    //   collision(newHead, snake) ||
    //   collision(newHead, bombs)
    // ) {
    //   alert("Game Over");
    //   clearInterval(game);
    // }

    snake.unshift(newHead);
    checkGameOver(newHead);

    // הוספת פצצות בהתאם לניקוד
    if (Math.floor(score / 5) && scoreUpdated) {
        if (score >= 30) {
            // הוספת 2 פצצות כאשר הציון מגיע ל-30
            bombs.push(generateBomb());
        }
        bombs.push(generateBomb());
        tempScore = score;
    }
    scoreUpdated = Math.floor(tempScore / 5) != Math.floor(score / 5);

    // // Stop the game when score reaches 50
    // if (score >= 50) {
    //   clearInterval(game);
    //   alert("Congratulations! You reached score 50.");
    // }
    // הזזת התפוחים כאשר הניקוד מגיע ל-10
    if (score >= 10) {
        moveYellowFood();
        moveRedFood();
    }

    ctx.fillStyle = "green";
    ctx.font = "30px Verdana";
    ctx.fillText(score, 2 * box, 1.6 * box);
}

function checkGameOver(newHead) {
    if (
        newHead.x < 0 ||
        newHead.x >= 18 * box ||
        newHead.y < 0 ||
        newHead.y >= 18 * box ||
        collision(newHead, snake.slice(1)) ||
        collision(newHead, bombs)
    ) {
        clearInterval(game);
        alert("Game Over");
    }

    // Stop the game when score reaches 50
    if (score >= 50) {
        setTimeout(function () {
            clearInterval(game);
            alert("Congratulations! You reached score 50.");
            setTimeout(function () {
                location.reload();
            }, 100); // Slight delay to ensure the alert is closed before reloading
        }, 600); // 0.3 seconds delay
    }
}

// Function to move yellow apple
function moveYellowFood() {
    if (yellowMoveStep === 0 || yellowMoveStep === 2) {
        yellowDirection = -yellowDirection;
        yellowMoveStep = 0;
    }
    let newX = yellowFood.x + yellowDirection * box;

    if (newX < 0) newX = 0;
    if (newX >= 18 * box) newX = 18 * box - box;

    if (isOnSnake(newX, yellowFood.y) || isOnBomb(newX, yellowFood.y)) {
        yellowMoveStep++;
        return;
    }

    yellowFood.x = newX;
    yellowMoveStep++;
}

// Function to move red apple
function moveRedFood() {
    if (redMoveStep === 0 || redMoveStep === 2) {
        redDirection = -redDirection;
        redMoveStep = 0;
    }
    let newY = redFood.y + redDirection * box;

    if (newY < 0) newY = 0;
    if (newY >= 18 * box) newY = 18 * box - box;

    if (isOnSnake(redFood.x, newY) || isOnBomb(redFood.x, newY)) {
        redMoveStep++;
        return;
    }

    redFood.y = newY;
    redMoveStep++;
}

// Function to check if food is on the snake
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
        (redFood.x == x && redFood.y == y) ||
        (yellowFood.x == x && yellowFood.y == y)
    );
}

// Function to check if food is on the bombs
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

// Function to generate new food at a random location
function generateFood() {
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * 17 + 1) * box;
        foodY = Math.floor(Math.random() * 15 + 3) * box;
    } while (isOnSnake(foodX, foodY) || isOnBomb(foodX, foodY));
    return { x: foodX, y: foodY };
}

// Function to generate a new bomb at a random location
function generateBomb() {
    let bombX, bombY;
    do {
        bombX = Math.floor(Math.random() * 17 + 1) * box; // check radius 3
        bombY = Math.floor(Math.random() * 15 + 3) * box;
    } while (isOnSnake(bombX, bombY) || isOnBomb(bombX, bombY) || isOnFood(bombX, bombY));
    return { x: bombX, y: bombY };
}

// Function to check if snake head collides with food
function isCollisionWithFood(head) {
    return (
        (head.x === yellowFood.x && head.y === yellowFood.y) ||
        (head.x === redFood.x && head.y === redFood.y)
    );
}

// Create initial food and bombs at the start of the game
yellowFood = generateFood();
redFood = generateFood();
bombs = [generateBomb(), generateBomb()];

let game = setInterval(draw, 300);
