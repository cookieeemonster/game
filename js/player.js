class Player {
    constructor(map) {
        this.map = map;
        this.width = 24;
        this.height = 24;
        this.health = CONFIG.PLAYER_MAX_HEALTH;
        this.ammo = CONFIG.PLAYER_START_AMMO;
        this.speed = CONFIG.PLAYER_SPEED;
        
        // 随机生成玩家初始位置（不在墙上）
        do {
            this.x = randomInt(this.map.tileSize * 2, this.map.width - this.map.tileSize * 2);
            this.y = randomInt(this.map.tileSize * 2, this.map.height - this.map.tileSize * 2);
        } while (this.map.isColliding(this.getBoundingRect()));
        
        // 输入状态
        this.keys = {
            w: false, a: false, s: false, d: false,
            space: false
        };
        
        this.setupInputListeners();
    }
    
    // 获取碰撞矩形
    getBoundingRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    // 设置键盘输入监听
    setupInputListeners() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) {
                this.keys[key] = true;
            }
            if (e.code === 'Space') {
                this.keys.space = true;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if (this.keys.hasOwnProperty(key)) {
                this.keys[key] = false;
            }
            if (e.code === 'Space') {
                this.keys.space = false;
            }
        });
    }
    
    // 更新玩家状态
    update() {
        let dx = 0;
        let dy = 0;
        
        if (this.keys.w) dy -= this.speed;
        if (this.keys.s) dy += this.speed;
        if (this.keys.a) dx -= this.speed;
        if (this.keys.d) dx += this.speed;
        
        // 对角线移动速度归一化
        if (dx !== 0 && dy !== 0) {
            const factor = 1 / Math.sqrt(2);
            dx *= factor;
            dy *= factor;
        }
        
        // 尝试移动X轴
        const newX = this.x + dx;
        const testRectX = this.getBoundingRect();
        testRectX.x = newX - this.width / 2;
        if (!this.map.isColliding(testRectX)) {
            this.x = newX;
        }
        
        // 尝试移动Y轴
        const newY = this.y + dy;
        const testRectY = this.getBoundingRect();
        testRectY.y = newY - this.height / 2;
        if (!this.map.isColliding(testRectY)) {
            this.y = newY;
        }
        
        // 限制玩家在地图内
        this.x = clamp(this.x, this.width / 2, this.map.width - this.width / 2);
        this.y = clamp(this.y, this.height / 2, this.map.height - this.height / 2);
    }
    
    // 玩家受伤
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            return true; // 玩家死亡
        }
        return false;
    }
    
    // 绘制玩家
    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        // 绘制玩家（蓝色方块）
        ctx.fillStyle = '#2196f3';
        ctx.fillRect(screenX - this.width / 2, screenY - this.height / 2, this.width, this.height);
        
        // 绘制玩家边框
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(screenX - this.width / 2, screenY - this.height / 2, this.width, this.height);
    }
}
