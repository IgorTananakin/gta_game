const MOVE_UP_KEY_CODES = ["ArrowUp", "KeyW"];
const MOVE_DOWN_KEYS_CODES = ["ArrowDown", "KeyS"];
const MOVE_LEFT_KEYS_CODES = ["ArrowLeft", "KeyA"];
const MOVE_RIGHT_KEYS_CODES = ["ArrowRight", "KeyD"];
const ALL_MOVE_KEY_CODES = [...MOVE_UP_KEY_CODES, ...MOVE_DOWN_KEYS_CODES, ...MOVE_LEFT_KEYS_CODES, ...MOVE_RIGHT_KEYS_CODES];

export class Player{
    constructor(x,y,context, movementLiminits){
        this.velocity = 3;
        this.radius = 15;
        this.x = x;
        this.y = y;
        this.context = context;
        this.cursorPosition = {
            x: 0,
            y: 0
        };
        //запрещаем выход за пределы экрана
        this.movementLiminits = {
            minX: movementLiminits.minX + this.radius,
            maxX: movementLiminits.maxX - this.radius,
            minY: movementLiminits.minY + this.radius,
            maxY: movementLiminits.maxY - this.radius,
        }

        document.addEventListener("mousemove", event => {
            this.cursorPosition.x = event.clientX;
            this.cursorPosition.y = event.clientY;
        });

        this.keyMap = new Map();//храним нажатые клавиши
        document.addEventListener("keydown", event => this.keyMap.set(event.code,true));
        document.addEventListener("keyup", event => this.keyMap.delete(event.code));

        this.image = new Image();
        this.image.src = "./img/player.png";
        this.imageWidth = 50;
        this.imageHeight = 60;
        this.isMoving = false;
        this.imageTick = 0;//анимация движения ног
    }

    //отрисовка спрайта где персонаж не подвижен
    drawImg() {
        const imageTickLimit = 18;//каждые 18 кадров меняется анимация ног
        let subX = 0;
        if (!this.isMoving) {
            subX = 0;
            this.imageTick = 0;
        } else {
            //второй или 3 кадр при движении
            subX = this.imageTick > imageTickLimit ? this.imageWidth * 2 : this.imageWidth;
            this.imageTick++;
        }
        if (this.imageTick > imageTickLimit * 2) {
            this.imageTick = 0;
        }

        // console.log("dsfd")
        this.context.drawImage(
            this.image,
            subX,
            0,
            this.imageWidth,
            this.imageHeight,
            this.x - this.imageWidth/2,//расположем в центре
            this.y - this.imageHeight/2,
            this.imageWidth,
            this.imageHeight
        );

    }

    //персонаж смотрит на курсор
    draw() {
        this.context.save();
        let angle = Math.atan2(this.cursorPosition.y - this.y, this.cursorPosition.x - this.x);
        this.context.translate(this.x, this.y);
        this.context.rotate(angle + Math.PI/2);
        this.context.translate(-this.x, -this.y);
        this.drawImg();
        this.context.restore();
    }

    //пермещение персонажа
    update() {
        this.draw();
        this.isMoving = this.shouldMove(ALL_MOVE_KEY_CODES);
        this.updatePosition();
        this.checkPositionLimitAndUpdate();
    }

    //проверяем не вышел ли персонаж за пределы экрана
    checkPositionLimitAndUpdate() {
        if (this.y < this.movementLiminits.minY) this.y = this.movementLiminits.minY;
        if (this.y > this.movementLiminits.maxY) this.y = this.movementLiminits.maxY;
        if (this.x < this.movementLiminits.minX) this.x = this.movementLiminits.minX;
        if (this.x > this.movementLiminits.maxX) this.x = this.movementLiminits.maxX;
    }

    //изменяем скорость перемещения
    updatePosition() {
        if (this.shouldMove(MOVE_UP_KEY_CODES)) this.y -= this.velocity;
        if (this.shouldMove(MOVE_DOWN_KEYS_CODES)) this.y += this.velocity;
        if (this.shouldMove(MOVE_LEFT_KEYS_CODES)) this.x -= this.velocity;
        if (this.shouldMove(MOVE_RIGHT_KEYS_CODES)) this.x += this.velocity;
      }

    shouldMove(keys) {
        return keys.some(key => this.keyMap.get(key));
    }
}