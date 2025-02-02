const MOVE_UP_KEY_CODES = ["ArrowUp", "KeyW"];
const MOVE_DOWN_KEYS_CODES = ["ArrowDown", "KeyS"];
const MOVE_LEFT_KEYS_CODES = ["ArrowLeft", "KeyA"];
const MOVE_RIGHT_KEYS_CODES = ["ArrowRight", "KeyD"];
const ALL_MOVE_KEY_CODES = [...MOVE_UP_KEY_CODES, ...MOVE_DOWN_KEYS_CODES, ...MOVE_LEFT_KEYS_CODES, ...MOVE_RIGHT_KEYS_CODES];

export class Player {
    constructor(x, y, context, movementLiminits) {
        this.velocity = 10;
        this.radius = 15;
        this.x = x;
        this.y = y;
        this.context = context;
        this.cursorPosition = {
            x: 0,
            y: 0
        };
        // Запрещаем выход за пределы экрана
        this.movementLiminits = {
            minX: movementLiminits.minX + this.radius,
            maxX: movementLiminits.maxX - this.radius,
            minY: movementLiminits.minY + this.radius,
            maxY: movementLiminits.maxY - this.radius,
        };

        // Обработчик движения мыши
        document.addEventListener("mousemove", (event) => {
            this.cursorPosition.x = event.clientX;
            this.cursorPosition.y = event.clientY;
        });

        // Обработчики нажатия клавиш для движения
        this.keyMap = new Map(); // Храним нажатые клавиши
        document.addEventListener("keydown", (event) => this.keyMap.set(event.code, true));
        document.addEventListener("keyup", (event) => this.keyMap.delete(event.code));

        // Обработчик для покупки оружия (Q) и переключения (E)
        document.addEventListener("keydown", (event) => {
            if (event.code === "KeyQ") {
                this.buyWeapon(); // Покупаем оружие
            } else if (event.code === "KeyE") {
                this.toggleWeapon(); // Переключаем оружие
            }
        });

        // Загрузка изображения игрока
        this.image = new Image();
        this.image.src = "./img/player.png";
        this.imageWidth = 50;
        this.imageHeight = 60;
        this.isMoving = false;
        this.imageTick = 0; // Анимация движения ног

        // Инициализация баланса
        this.money = 0;
        this.updateMoneyDisplay();

        // Инициализация текущего оружия
        this.currentWeapon = "weapon1"; // По умолчанию активно первое оружие
        this.updateWeaponVisibility(); // Обновляем видимость оружия при старте
    }

    // Покупка оружия
    buyWeapon() {
        const weapon2 = document.getElementById("weapon2");
        const cost = parseInt(weapon2.getAttribute("data-cost")); // Стоимость оружия
        const isBought = weapon2.getAttribute("data-bought") === "true"; // Уже куплено?

        if (this.money >= cost && !isBought) {
            this.money -= cost; // Снимаем деньги
            weapon2.setAttribute("data-bought", "true"); // Отмечаем, что оружие куплено
            this.updateMoneyDisplay();
            updateBuyButtonVisibility(); // Обновляем видимость кнопки покупки
        } else if (this.money < cost) {
            alert(`Not enough money! You need ${cost}$ to buy this weapon.`);
        }
    }

    // Переключение оружия
    toggleWeapon() {
        const weapon1 = document.getElementById("weapon1");
        const weapon2 = document.getElementById("weapon2");

        // Переключаем текущее оружие
        if (this.currentWeapon === "weapon1") {
            this.currentWeapon = "weapon2";
        } else {
            this.currentWeapon = "weapon1";
        }

        // Обновляем видимость оружия
        this.updateWeaponVisibility();
    }

    // Метод для обновления видимости оружия
    updateWeaponVisibility() {
        const weapon1 = document.getElementById("weapon1");
        const weapon2 = document.getElementById("weapon2");

        if (this.currentWeapon === "weapon1") {
            weapon1.classList.add("active");
            weapon2.classList.remove("active");
        } else if (this.currentWeapon === "weapon2") {
            weapon1.classList.remove("active");
            weapon2.classList.add("active");
        }
    }

    // Обновление отображения денег
    updateMoneyDisplay() {
        const moneyElement = document.getElementById("moneny");
        moneyElement.textContent = `${this.money}$`;
    }

    // Увеличение денег
    increaseMoney(amount) {
        this.money += amount;
        this.updateMoneyDisplay();
    }

    // Отрисовка спрайта, где персонаж не подвижен
    drawImg() {
        const imageTickLimit = 18; // Каждые 18 кадров меняется анимация ног
        let subX = 0;
        if (!this.isMoving) {
            subX = 0;
            this.imageTick = 0;
        } else {
            // Второй или 3 кадр при движении
            subX = this.imageTick > imageTickLimit ? this.imageWidth * 2 : this.imageWidth;
            this.imageTick++;
        }
        if (this.imageTick > imageTickLimit * 2) {
            this.imageTick = 0;
        }

        // Отрисовка изображения игрока
        this.context.drawImage(
            this.image,
            subX,
            0,
            this.imageWidth,
            this.imageHeight,
            this.x - this.imageWidth / 2, // Располагаем в центре
            this.y - this.imageHeight / 2,
            this.imageWidth,
            this.imageHeight
        );
    }

    // Персонаж смотрит на курсор
    draw() {
        this.context.save();
        let angle = Math.atan2(this.cursorPosition.y - this.y, this.cursorPosition.x - this.x);
        this.context.translate(this.x, this.y);
        this.context.rotate(angle + Math.PI / 2);
        this.context.translate(-this.x, -this.y);
        this.drawImg();
        this.context.restore();
    }

    // Перемещение персонажа
    update() {
        this.draw();
        this.isMoving = this.shouldMove(ALL_MOVE_KEY_CODES);
        this.updatePosition();
        this.checkPositionLimitAndUpdate();
    }

    // Проверяем, не вышел ли персонаж за пределы экрана
    checkPositionLimitAndUpdate() {
        if (this.y < this.movementLiminits.minY) this.y = this.movementLiminits.minY;
        if (this.y > this.movementLiminits.maxY) this.y = this.movementLiminits.maxY;
        if (this.x < this.movementLiminits.minX) this.x = this.movementLiminits.minX;
        if (this.x > this.movementLiminits.maxX) this.x = this.movementLiminits.maxX;
    }

    // Изменяем скорость перемещения
    updatePosition() {
        if (this.shouldMove(MOVE_UP_KEY_CODES)) this.y -= this.velocity;
        if (this.shouldMove(MOVE_DOWN_KEYS_CODES)) this.y += this.velocity;
        if (this.shouldMove(MOVE_LEFT_KEYS_CODES)) this.x -= this.velocity;
        if (this.shouldMove(MOVE_RIGHT_KEYS_CODES)) this.x += this.velocity;
    }

    // Проверка, нужно ли двигаться
    shouldMove(keys) {
        return keys.some((key) => this.keyMap.get(key));
    }
}