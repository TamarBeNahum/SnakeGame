const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 32;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };

let yellowFood = generateFood();
let redFood = generateFood();

let score = 0;

let yellowMoveStep = 0;
let redMoveStep = 0;
let yellowDirection = -1; // -1 for left, 1 for right
let redDirection = -1; // -1 for up, 1 for down

// Load the apple images
const yellowAppleImg = new Image();
yellowAppleImg.src = 'yellowA.png'; // Replace with the actual path to the yellow apple image
const redAppleImg = new Image();
redAppleImg.src = 'RedA.png'; // Replace with the actual path to the red apple image

// Define the A* algorithm
function aStar(start, target) {
    let openList = [];
    let closedList = [];
    openList.push(start);

    while (openList.length > 0) {
        let lowIndex = 0;
        for (let i = 0; i < openList.length; i++) {
            if (openList[i].f < openList[lowIndex].f) {
                lowIndex = i;
            }
        }
        let currentNode = openList[lowIndex];

        if (currentNode.x === target.x && currentNode.y === target.y) {
            let curr = currentNode;
            let path = [];
            while (curr.parent) {
                path.push(curr);
                curr = curr.parent;
            }
            return path.reverse();
        }

        openList.splice(lowIndex, 1);
        closedList.push(currentNode);

        let neighbors = getNeighbors(currentNode);
        for (let neighbor of neighbors) {
            if (inList(closedList, neighbor) || collision(neighbor, snake)) {
                continue;
            }

            let gScore = currentNode.g + 1;
            let gScoreIsBest = false;

            if (!inList(openList, neighbor)) {
                gScoreIsBest = true;
                neighbor.h = heuristic(neighbor, target);
                openList.push(neighbor);
            } else if (gScore < neighbor.g) {
                gScoreIsBest = true;
            }

            if (gScoreIsBest) {
                neighbor.parent = currentNode;
                neighbor.g = gScore;
                neighbor.f = neighbor.g + neighbor.h;
            }
        }
    }
    return [];
}

function getNeighbors(node) {
    let neighbors = [];
    let dirs = [
        { x: -1, y: 0 }, { x: 1, y: 0 },
        { x: 0, y: -1 }, { x: 0, y: 1 }
    ];
    for (let dir of dirs) {
        let neighbor = { x: node.x + dir.x * box, y: node.y + dir.y * box };
        if (neighbor.x >= 0 && neighbor.x < 18 * box && neighbor.y >= 0 && neighbor.y < 18 * box) {
            neighbors.push(neighbor);
        }
    }
    return neighbors;
}

function inList(list, node) {
    for (let item of list) {
        if (item.x === node.x && item.y === node.y) {
            return true;
        }
    }
    return false;
}

function heuristic(node, target) {
    return Math.abs(node.x - target.x) / box + Math.abs(node.y - target.y) / box;
}

function draw() {
    ctx.fillStyle = "HoneyDew";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const rows = canvas.height / box;
    const cols = canvas.width / box;

    // Draw checkered background
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

    // Add eyes to the snake's head
    if (snake.length > 0) {
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(snake[0].x + box / 4, snake[0].y + box / 4, box / 8, 0, Math.PI * 2, true);
        ctx.arc(snake[0].x + 3 * box / 4, snake[0].y + box / 4, box / 8, 0, Math.PI * 2, true);
        ctx.fill();
    }

    ctx.drawImage(yellowAppleImg, yellowFood.x, yellowFood.y, box, box);
    ctx.drawImage(redAppleImg, redFood.x, redFood.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    let blueDistance = heuristic(snake[0], yellowFood);
    let redDistance = heuristic(snake[0], redFood);
    let target = blueDistance <= redDistance ? yellowFood : redFood;

    let path = aStar({ x: snakeX, y: snakeY, g: 0, f: 0 }, target);

    if (path.length > 0) {
        snakeX = path[0].x;
        snakeY = path[0].y;
    }


    if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
        score += 3;
        yellowFood = generateFood();
    } else if (snakeX === redFood.x && snakeY === redFood.y) {
        score += 1;
        redFood = generateFood();
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if (
        snakeX < 0 || snakeX >= 18 * box ||
        snakeY < 0 || snakeY >= 18 * box ||
        collision(newHead, snake)
    ) {
        clearInterval(game);
        alert("Game Over");
    }
    else if (collision(newHead, snake)) {
        alert("Game Over_collision");
        clearInterval(game);
    }

    snake.unshift(newHead);

    // Stop the game when score reaches 40
    if (score >= 15) {
        setTimeout(function () {
            clearInterval(game);
            alert("Congratulations! You reached score 40.");
        }, 600); // 0.3 seconds delay
    }

    // Move foods if the snake's length is 10 or more
    if (score >= 10) {
        moveYellowFood();
        moveRedFood();
    }

    ctx.fillStyle = "green";
    ctx.font = "30px Verdana";
    ctx.fillText(score, 2 * box, 1.6 * box);


}

// function moveYellowFood() {
//     if (yellowMoveStep === 0 || yellowMoveStep === 2) {
//         yellowDirection = -yellowDirection;
//         yellowMoveStep = 0;
//     }
//     yellowFood.x += yellowDirection * box;
//     yellowMoveStep++;
//     if (yellowFood.x < 0) yellowFood.x = 0;
//     if (yellowFood.x >= 18 * box) yellowFood.x = (18 * box) - box;
// }

function moveYellowFood() {
    if (yellowMoveStep === 0 || yellowMoveStep === 2) {
        yellowDirection = -yellowDirection;
        yellowMoveStep = 0;
    }
    let newX = yellowFood.x + yellowDirection * box;

    // Ensure food stays within bounds
    if (newX < 0) newX = 0;
    if (newX >= 18 * box) newX = (18 * box) - box;

    // Check if new position collides with the snake
    if (isFoodOnSnake(newX, yellowFood.y)) {
        yellowMoveStep++;
        return; // Stay in the current position if it collides
    }

    yellowFood.x = newX;
    yellowMoveStep++;
}


// function moveRedFood() {
//     if (redMoveStep === 0 || redMoveStep === 2) {
//         redDirection = -redDirection;
//         redMoveStep = 0;
//     }
//     redFood.y += redDirection * box;
//     redMoveStep++;
//     if (redFood.y < 0) redFood.y = 0;
//     if (redFood.y >= 18 * box) redFood.y = (18 * box) - box;
// }

function moveRedFood() {
    if (redMoveStep === 0 || redMoveStep === 2) {
        redDirection = -redDirection;
        redMoveStep = 0;
    }
    let newY = redFood.y + redDirection * box;

    // Ensure food stays within bounds
    if (newY < 0) newY = 0;
    if (newY >= 18 * box) newY = (18 * box) - box;

    // Check if new position collides with the snake
    if (isFoodOnSnake(redFood.x, newY)) {
        redMoveStep++;
        return; // Stay in the current position if it collides
    }

    redFood.y = newY;
    redMoveStep++;
}

// Checks if the given coordinates areon the snake's body - 
// ensure that the food isn't collide with the snake
function isFoodOnSnake(foodX, foodY) {
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === foodX && snake[i].y === foodY) {
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

// ensure that the new food's position is not to on the snake's body
function generateFood() {
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * 17 + 1) * box;
        foodY = Math.floor(Math.random() * 15 + 3) * box;
    } while (isFoodOnSnake(foodX, foodY));
    return { x: foodX, y: foodY };
}

// function isFoodOnSnake(foodX, foodY) {
//     for (let i = 0; i < snake.length; i++) {
//         if (snake[i].x === foodX && snake[i].y === foodY) {
//             return true;
//         }
//     }
//     return false;
// }

function isCollisionWithFood(head) {
    return (head.x === yellowFood.x && head.y === yellowFood.y) || (head.x === redFood.x && head.y === redFood.y);
}

let game = setInterval(draw, 300);
