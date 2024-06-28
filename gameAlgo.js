const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 32;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };

let blueFood = generateFood();
let redFood = generateFood();

let score = 0;

let blueMoveStep = 0;
let redMoveStep = 0;
let blueDirection = -1; // -1 for left, 1 for right
let redDirection = -1; // -1 for up, 1 for down

// Load the apple images
const greenAppleImg = new Image();
greenAppleImg.src = 'GreenA.png'; // Replace with the actual path to the green apple image
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

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "green" : "white";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
        ctx.strokeStyle = "red";
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.drawImage(greenAppleImg, blueFood.x, blueFood.y, box, box);
    ctx.drawImage(redAppleImg, redFood.x, redFood.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    let blueDistance = heuristic(snake[0], blueFood);
    let redDistance = heuristic(snake[0], redFood);
    let target = blueDistance <= redDistance ? blueFood : redFood;

    let path = aStar({ x: snakeX, y: snakeY, g: 0, f: 0 }, target);

    if (path.length > 0) {
        snakeX = path[0].x;
        snakeY = path[0].y;
    }

    if (snakeX === blueFood.x && snakeY === blueFood.y) {
        score += 3;
        blueFood = generateFood();
    } else if (snakeX === redFood.x && snakeY === redFood.y) {
        score += 1;
        redFood = generateFood();
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if (
        snakeX < 0 || snakeX >= 18 * box ||
        snakeY < 0 || snakeY >= 18 * box
    ) {
        clearInterval(game);
        alert("Game Over");
    } else if (collision(newHead, snake)) {
        alert("Game Over_collision");
    }

    snake.unshift(newHead);

    // Move foods if the snake's length is 10 or more
    if (score >= 5) {
        moveBlueFood();
        moveRedFood();
    }

    ctx.fillStyle = "green";
    ctx.font = "45px Verdana";
    ctx.fillText(score, 2 * box, 1.6 * box);
    
    // Draw the title
    ctx.fillStyle = "green";
    ctx.font = "30px Verdana";
    ctx.fillText("Snake Game", canvas.width / 2 - 100, 30);
}

function moveBlueFood() {
    if (blueMoveStep === 0 || blueMoveStep === 3) {
        blueDirection = -blueDirection;
        blueMoveStep = 0;
    }
    blueFood.x += blueDirection * box;
    blueMoveStep++;
    if (blueFood.x < 0) blueFood.x = 0;
    if (blueFood.x >= 18 * box) blueFood.x = (18 * box) - box;
}

function moveRedFood() {
    if (redMoveStep === 0 || redMoveStep === 3) {
        redDirection = -redDirection;
        redMoveStep = 0;
    }
    redFood.y += redDirection * box;
    redMoveStep++;
    if (redFood.y < 0) redFood.y = 0;
    if (redFood.y >= 18 * box) redFood.y = (18 * box) - box;
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x === array[i].x && head.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function generateFood() {
    let foodX, foodY;
    do {
        foodX = Math.floor(Math.random() * 17 + 1) * box;
        foodY = Math.floor(Math.random() * 15 + 3) * box;
    } while (isFoodOnSnake(foodX, foodY));
    return { x: foodX, y: foodY };
}

function isFoodOnSnake(foodX, foodY) {
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === foodX && snake[i].y === foodY) {
            return true;
        }
    }
    return false;
}

function isCollisionWithFood(head) {
    return (head.x === blueFood.x && head.y === blueFood.y) || (head.x === redFood.x && head.y === redFood.y);
}

let game = setInterval(draw, 200);
