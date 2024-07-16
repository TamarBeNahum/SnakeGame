const canvas = document.getElementById("gameCanvas"); // אחזור הקנבס מה-HTML
const ctx = canvas.getContext("2d"); // יצירת הקשר לציור בקנבס
let gameEnded = false; // משתנה לבדיקה אם המשחק הסתיים
let congratulationsLogged = false; // משתנה לבדיקת הדפסה של הודעת "מזל טוב"

const box = 32; // גודל הקופסה
let snake = []; // מערך שמייצג את הנחש
snake[0] = { x: 9 * box, y: 10 * box }; // נקודת ההתחלה של הנחש

let yellowFood; // מיקום של אוכל צהוב
let redFood; // מיקום של אוכל אדום

let score = 0; // ניקוד המשחק

let yellowMoveStep = 0; // שלבים של תזוזת האוכל הצהוב
let redMoveStep = 0; // שלבים של תזוזת האוכל האדום
let yellowDirection = -1; // כיוון תזוזת האוכל הצהוב (-1 שמאלה, 1 ימינה)
let redDirection = -1; // כיוון תזוזת האוכל האדום (-1 למעלה, 1 למטה)

let bombs = []; // מערך שמייצג את הפצצות

// טעינת תמונות האוכל והפצצה
const yellowAppleImg = new Image();
yellowAppleImg.src = "yellowA.png";
const redAppleImg = new Image();
redAppleImg.src = "RedA.png";
const bombImg = new Image();
bombImg.src = "bomb.png";

let tempScore; // משתנה זמני לאחסון ניקוד
let scoreUpdated = true; // משתנה לבדיקת עדכון הניקוד

let path = []; // נתיב לנחש

/**
 * פונקציה זו מציירת את כל האלמנטים במשחק (קנבס, לוח, נחש, אוכל ופצצות).
 */
function draw() {
  if (gameEnded) return; // אם המשחק הסתיים, לא לצייר יותר

  clearCanvas();
  drawBoard();
  drawSnake();
  drawFood();
  drawBombs();

  if (score >= 10) {
    moveYellowFood();
    moveRedFood();
    path = aStar(
      { x: snake[0].x, y: snake[0].y, g: 0, f: 0 },
      yellowFood,
      redFood,
      2,
      3
    ); // עדכון הנתיב בכל תזוזה
  }

  ctx.fillStyle = "green";
  ctx.font = "30px Verdana";
  ctx.fillText(score, 2 * box, 1.6 * box); // ציור הניקוד על הקנבס
  updateSnakePosition();
}
/**
 * פונקציה זו מנקה את הקנבס.
 */
function clearCanvas() {
  ctx.fillStyle = "HoneyDew";
  ctx.fillRect(0, 0, canvas.width, canvas.height); // ניקוי הקנבס
}
/**
 * פונקציה זו מציירת את לוח המשחק עם דוגמא של משבצות.
 */
function drawBoard() {
  const rows = canvas.height / box;
  const cols = canvas.width / box;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? "#A3D04A" : "#A9DA4D";
      ctx.fillRect(col * box, row * box, box, box); // ציור לוח המשחק
    }
  }
}
/**
 * פונקציה זו מציירת את הנחש על הקנבס.
 */
function drawSnake() {
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "green" : "white";
    ctx.fillRect(snake[i].x, snake[i].y, box, box); // ציור הנחש
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
    ctx.fill(); // ציור עיניים לנחש
  }
}
/**
 * פונקציה זו מציירת את האוכל הצהוב והאדום על הקנבס.
 */
function drawFood() {
  ctx.drawImage(yellowAppleImg, yellowFood.x, yellowFood.y, box, box); // ציור אוכל צהוב
  ctx.drawImage(redAppleImg, redFood.x, redFood.y, box, box); // ציור אוכל אדום
}
/**
 * פונקציה זו מציירת את הפצצות על הקנבס.
 */
function drawBombs() {
  for (let bomb of bombs) {
    ctx.drawImage(bombImg, bomb.x, bomb.y, box, box); // ציור פצצות
  }
}
/**
 * פונקציה זו מעדכנת את מיקום הנחש על הקנבס.
 */
function updateSnakePosition() {
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (score < 10 && path.length === 0) {
    path = aStar(
      { x: snakeX, y: snakeY, g: 0, f: 0 },
      yellowFood,
      redFood,
      2,
      3
    ); // חישוב נתיב חדש לנחש
  }

  if (path.length > 0) {
    let nextStep = path.shift();
    snakeX = nextStep.x;
    snakeY = nextStep.y; // תזוזה לפי הנתיב
  }

  let newHead = { x: snakeX, y: snakeY };

  if (checkGameOver(newHead)) {
    return; // בדיקה אם המשחק נגמר
  }

  if (snakeX === yellowFood.x && snakeY === yellowFood.y) {
    yellowFood = generateFood([redFood]);
    score += 2; // עדכון ניקוד והזזת האוכל הצהוב
    path = []; // איפוס הנתיב
  } else if (snakeX === redFood.x && snakeY === redFood.y) {
    redFood = generateFood([yellowFood]);
    score += 3; // עדכון ניקוד והזזת האוכל האדום
    path = []; // איפוס הנתיב
  } else {
    snake.pop(); // הסרת החלק האחרון של הנחש
  }

  snake.unshift(newHead); // הוספת ראש חדש לנחש

  addBombsBasedOnScore(); // הוספת פצצות לפי הניקוד
}

/**
 * פונקציה זו מוסיפה פצצות בהתאם לניקוד הנוכחי.
 */
function addBombsBasedOnScore() {
  if (Math.floor(score / 5) && scoreUpdated) {
    if (score >= 30) {
      // הוספת 2 פצצות כאשר מגיעים ל-30
      bombs.push(generateBomb());
    }
    bombs.push(generateBomb());
    tempScore = score;
  }
  scoreUpdated = Math.floor(tempScore / 5) != Math.floor(score / 5); // עדכון משתנה בדיקה לניקוד
}
/**
 * פונקציה זו בודקת אם המשחק נגמר.
 */
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
    Swal.fire({
      title: "Game Over",
      html: "<b>You crushed!",
      icon: "error",
      background: "#f9f9f9",
      showCancelButton: true,
      confirmButtonText: "Play Again!",
      cancelButtonText: "cancel",
      customClass: {
        title: "swal-title",
        htmlContainer: "swal-html",
        confirmButton: "swal-confirm",
        cancelButton: "swal-cancel",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        location.reload(); // אתחול המשחק במקרה של אישור
      }
    });

    return true; // סיום המשחק
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
            title: "swal-title",
            htmlContainer: "swal-html",
            confirmButton: "swal-confirm",
            cancelButton: "swal-cancel",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            location.reload(); // אתחול המשחק במקרה של אישור
          }
        });
      }, 100);
    }, 600);
    return true; // סיום המשחק
  }
  return false; // המשחק לא נגמר
}
/**
 * פונקציה זו מזיזה את האוכל הצהוב על הקנבס.
 */
function moveYellowFood() {
  if (yellowMoveStep === 0 || yellowMoveStep === 2) {
    yellowDirection = -yellowDirection;
    yellowMoveStep = 0;
  }
  let newX = yellowFood.x + yellowDirection * box;

  if (newX < 0) newX = 0;
  if (newX >= 18 * box) newX = 18 * box - box;

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
 * פונקציה זו מזיזה את האוכל האדום על הקנבס.
 */
function moveRedFood() {
  if (redMoveStep === 0 || redMoveStep === 2) {
    redDirection = -redDirection;
    redMoveStep = 0;
  }
  let newY = redFood.y + redDirection * box;

  if (newY < 0) newY = 0;
  if (newY >= 18 * box) newY = 18 * box - box;

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
 * פונקציה זו בודקת אם נקודה מסוימת נמצאת על הנחש.
 */
function isOnSnake(x, y) {
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === x && snake[i].y === y) {
      return true;
    }
  }
  return false;
}
/**
 * פונקציה זו בודקת אם נקודה מסוימת נמצאת על האוכל.
 */
function isOnFood(x, y) {
  return (
    (redFood.x === x && redFood.y === y) ||
    (yellowFood.x === x && yellowFood.y === y)
  );
}
/**
 * פונקציה זו בודקת אם נקודה מסוימת נמצאת על פצצה.
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
 * פונקציה זו בודקת התנגשות בין ראש הנחש לבין מערך כלשהו (חלקי הנחש או פצצות).
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
 * פונקציה זו יוצרת מיקום אקראי לאוכל על הקנבס, מוודאת שהוא לא על הנחש, על פצצה או קרוב אליהם.
 */
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
    existingFoods.some((food) => food.x === foodX && food.y === foodY) // בדיקה שהאוכל לא יופיע באותו מקום כמו אוכל קיים
  );
  return { x: foodX, y: foodY };
}
/**
 * פונקציה זו יוצרת מיקום אקראי לפצצה על הקנבס, מוודאת שהיא לא על הנחש, על פצצה אחרת או קרוב אליהם.
 */
function generateBomb() {
  let bombX, bombY;
  do {
    bombX = Math.floor(Math.random() * 17 + 1) * box;
    bombY = Math.floor(Math.random() * 15 + 3) * box;
  } while (
    isOnSnake(bombX, bombY) ||
    isOnBomb(bombX, bombY) ||
    isNearFood(bombX, bombY) ||
    isNearSnake(bombX, bombY) ||
    (bombX === yellowFood.x && bombY === yellowFood.y) ||
    (bombX === redFood.x && bombY === redFood.y)
  );
  return { x: bombX, y: bombY };
}
/**
 * פונקציה זו בודקת אם נקודה מסוימת קרובה לנחש.
 */
function isNearSnake(x, y) {
  for (let i = 0; i < snake.length; i++) {
    if (euclideanDistance(x, y, snake[i].x, snake[i].y) <= box) {
      return true;
    }
  }
  return false;
}
/**
 * פונקציה זו בודקת אם נקודה מסוימת קרובה לאוכל.
 */
function isNearFood(x, y) {
  const distanceToYellowFood =
    euclideanDistance(x, y, yellowFood.x, yellowFood.y) <= box;
  const distanceToRedFood =
    euclideanDistance(x, y, redFood.x, redFood.y) <= box;
  return distanceToYellowFood || distanceToRedFood;
}
/**
 * פונקציה זו בודקת אם נקודה מסוימת קרובה לפצצה.
 */
function isNearBomb(x, y) {
  for (let i = 0; i < bombs.length; i++) {
    if (euclideanDistance(x, y, bombs[i].x, bombs[i].y) <= box) {
      return true;
    }
  }
  return false;
}
/**
 * פונקציה זו מחשבת את המרחק האוקלידי בין שתי נקודות.
 */
function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}
/**
 * פונקציה זו בודקת אם ראש הנחש מתנגש באוכל.
 */
function isCollisionWithFood(head) {
  return (
    (head.x === yellowFood.x && head.y === yellowFood.y) ||
    (head.x === redFood.x && head.y === redFood.y)
  );
}

// הפעלת המשחק
yellowFood = generateFood([]);
redFood = generateFood([yellowFood]); // העברת [yellowFood] כדי להבטיח שלא יכפיל את המיקום של yellowFood
bombs = [generateBomb(), generateBomb()];

let game = setInterval(draw, 300); // קריאה לפונקציית draw כל 300 מילישניות
