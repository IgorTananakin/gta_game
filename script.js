import { Player } from "./player.js";
import { Projectile } from "./projectile.js";
import { Enemy } from "./enemy.js";
import { distanceBetweenTwoPoints } from "./utilities.js";

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;

const wastedElement = document.querySelector(".wasted");
const scoreElement = document.querySelector("#score");
const moneyElement = document.querySelector("#moneny");
const buyWeaspon = document.querySelector("#buy");
const span = document.querySelector("span");

let player;
let projectiles = [];//массив снарядов
let enemies = [];//массив ботов
let particles = [];//массив для взрыва
let animationId;
let score = 0;
let spawnIntervalId;
let countIntervalId;//количество появлений ботов
let countmoney = 0;

startGame();

// Добавим функцию для обновления видимости кнопки покупки
function updateBuyButtonVisibility() {
    const weapon2 = document.getElementById("weapon2");
    const isBought = weapon2.getAttribute("data-bought") === "true";
    const buyWeaspon = document.getElementById("buy");

    if (isBought) {
        buyWeaspon.style.display = "none"; // Скрываем кнопку покупки
    } else {
        buyWeaspon.style.display = "inline"; // Показываем кнопку покупки
    }
}

function startGame() {
    init();
    animate();
    spawnEnemies();//боты
    updateBuyButtonVisibility(); // Обновляем видимость кнопки покупки
}


function init () {
    const movementLiminits = {
        minX: 0,
        maxX: canvas.width,
        minY: 0,
        maxY: canvas.height,
    
    };
    player = new Player(canvas.width/2, canvas.height/2, context, movementLiminits);
    addEventListener("click", createProjectile);//стрельба
}

function createProjectile (event) {
    // Воспроизведение звука выстрела
    const shootSound = document.getElementById('shootSound1');
    console.log(shootSound)
    shootSound.currentTime = 0; // Перемотка звука на начало (если он уже играл)
    shootSound.play();

    projectiles.push(
        new Projectile(
            player.x,//кординаты выстрела
            player.y,
            event.clientX,//цель
            event.clientY,
            context
        )
    )
}

function spawnEnemies() {
    let countOfSpawnEnemies = 1;

    countIntervalId = setInterval(() => countOfSpawnEnemies++, 30000)
    spawnIntervalId = setInterval(() => spawnCountEnemies(countOfSpawnEnemies), 1000);
    spawnCountEnemies(countOfSpawnEnemies);
}

function spawnCountEnemies(count) {
    for (let i =0; i< count; i++) {
        enemies.push(new Enemy(canvas.width, canvas.height, context, player));
    }
}

function animate() {
    animationId = requestAnimationFrame(animate);//запланировать отрисовку на следующем кадре

    particles = particles.filter(particle => particle.alpha > 0);
    context.clearRect(0, 0, canvas.width, canvas.height);//чистим фон при повороте мыши

    projectiles = projectiles.filter(projectileInsideWindow);//удаляем снаряд за пределами экрана
    enemies.forEach(enemy => checkHittingEnemy(enemy));
    enemies = enemies.filter(enemy => enemy.health > 0);
    const isGameOver = enemies.some(checkHittingPlayer);//хотя бы один коснулся
    if (isGameOver) {
        wastedElement.style.display = 'block';
        clearInterval(countIntervalId);
        clearInterval(spawnIntervalId);//после окончания игры не появляются боты
        cancelAnimationFrame(animationId);
    }

    particles.forEach(particle=> particle.update());//отсивка всех частиц для взрыва
    projectiles.forEach(projectile => projectile.update());//по всем снарядам и вызваем update
    player.update();
    enemies.forEach(enemy => enemy.update());
}

function projectileInsideWindow(projectile) {
    return projectile.x + projectile.radius > 0 && projectile.x - projectile.radius < canvas.width
    && projectile.y + projectile.radius > 0 &&
    projectile.y - projectile.radius < canvas.height
}
function checkHittingPlayer(enemy) {
    const distance = distanceBetweenTwoPoints(player.x, player.y, enemy.x, enemy.y);
    return distance - enemy.radius - player.radius < 0;
}

function checkHittingEnemy(enemy) {
    projectiles.some((projectile, index) => {
        const distance = distanceBetweenTwoPoints(projectile.x, projectile.y, enemy.x, enemy.y);
        if (distance - enemy.radius - projectile.radius > 0) return false;

        removeProjectileByIndex(index);
        enemy.health--;

        if (enemy.health < 1) {
            increaseScore();
            increaseMoney();
            enemy.createExplosion(particles);
        }
        return true;
    }) 
}

function removeProjectileByIndex(index) {
    projectiles.splice(index, 1);
}

function increaseScore(){
    score += 250;
    scoreElement.innerHTML = score
}

function increaseMoney() {
    countmoney += 25;
    player.increaseMoney(25); // Увеличиваем баланс игрока
    moneyElement.innerHTML = `${countmoney}$`;
    if (countmoney >= 100) {
        buyWeaspon.style.color = "red"; // Подсветка кнопки покупки
    }
}

function checkBuyWeaspon(countmoney) {
    if (countmoney > 100) return true;
}