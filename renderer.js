const milestoneSound = new Audio('sounds/coin.mp3'); // Sonido de puntos
const foundsound = new Audio('sounds/fondo.mp3');    // Música de fondo
foundsound.loop = true;
foundsound.volume = 0.5;
const gameoversound = new Audio('sounds/gameover.mp3'); // Música game over

const playerImg = new Image();
playerImg.src = 'images/cars/carGREEN.png';

playerImg.style.transform = 'scale(8.5)';

const obstacleImg = new Image();
obstacleImg.src = 'images/cars/carRED.png';

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const laneCount = 3;
const laneWidth = canvas.width / laneCount;

const playerWidth = 80;
const playerHeight = 130;

const lanesX = [];
for (let i = 0; i < laneCount; i++) {
  lanesX.push(i * laneWidth + (laneWidth - playerWidth) / 2);
}

let playerLane = 1;
const playerY = canvas.height - playerHeight - 20;

let score = 0;
let gameOver = false;

const obstacles = [];
const obstacleWidth = 80;
const obstacleHeight = 130;
let obstacleSpeed = 5;
let obstacleSpawnInterval = 1500;

window.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.code === 'ArrowLeft' && playerLane > 0) playerLane--;
  else if (e.code === 'ArrowRight' && playerLane < laneCount - 1) playerLane++;
});

function drawPlayer() {
  ctx.drawImage(playerImg, lanesX[playerLane], playerY, playerWidth, playerHeight);
}

function drawObstacles() {
  for (const obs of obstacles) {
    ctx.drawImage(obstacleImg, obs.x, obs.y, obstacleWidth, obstacleHeight);
  }
}

let lastMilestone = 0;

function updateObstacles(deltaTime) {
  for (const obs of obstacles) {
    obs.y += obstacleSpeed * (deltaTime / 16);
  }

  while (obstacles.length && obstacles[0].y > canvas.height) {
    obstacles.shift();
    score++;
    obstacleSpeed += 0.1;

    if (score % 10 === 0 && score !== lastMilestone) {
      milestoneSound.play();
      lastMilestone = score;
    }
  }
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * laneCount);
  const x = lanesX[lane];
  obstacles.push({ x, y: -obstacleHeight });
}

function checkCollision(r1, r2) {
  return !(
    r1.x > r2.x + r2.width ||
    r1.x + r1.width < r2.x ||
    r1.y > r2.y + r2.height ||
    r1.y + r1.height < r2.y
  );
}

function checkCollisions() {
  const playerRect = {
    x: lanesX[playerLane],
    y: playerY,
    width: playerWidth,
    height: playerHeight
  };
  for (const obs of obstacles) {
    const obsRect = {
      x: obs.x,
      y: obs.y,
      width: obstacleWidth,
      height: obstacleHeight
    };
    if (checkCollision(playerRect, obsRect)) {
      gameOver = true;
      foundsound.pause();
      foundsound.currentTime = 0;
      gameoversound.currentTime = 0;
      gameoversound.play();
    }
  }
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`Puntaje: ${score}`, 10, 30);
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '32px Arial';
  ctx.fillText(`Puntaje final: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
  ctx.font = '24px Arial';
  ctx.fillText('Presiona R para reiniciar', canvas.width / 2, canvas.height / 2 + 70);
}

let lastTime = 0;
let spawnTimer = 0;

function resetGame() {
  playerLane = 1;
  score = 0;
  obstacles.length = 0;
  obstacleSpeed = 4;
  gameOver = false;
  spawnTimer = 0;

  foundsound.play();
  gameoversound.pause();
  gameoversound.currentTime = 0;
}

// Iniciar juego sólo cuando imagen esté lista
playerImg.onload = () => {
  gameLoop();
}

// Sonido de fondo arranca en el primer input del usuario (por políticas navegador)
window.addEventListener('keydown', () => {
  if (foundsound.paused) {
    foundsound.play();
  }
}, { once: true });

function gameLoop(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  // Fondo negro
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!gameOver) {
    spawnTimer += deltaTime;
    if (spawnTimer > obstacleSpawnInterval) {
      spawnObstacle();
      spawnTimer = 0;
    }

    updateObstacles(deltaTime);
    checkCollisions();

    drawPlayer();
    drawObstacles();
    drawScore();

    requestAnimationFrame(gameLoop);
  } else {
    drawGameOver();
  }
}

window.addEventListener('keydown', e => {
  if (gameOver && e.key.toLowerCase() === 'r') {
    resetGame();
    gameLoop();
  }
});
