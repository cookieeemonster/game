class Player {
    constructor(map) {
        this.map = map;
        this.width = 24;
        this.height = 32; // 像素小人更高一些
        this.health = CONFIG.PLAYER_MAX_HEALTH;
        this.speed = CONFIG.PLAYER_SPEED;
        
        // 武器系统
        this.weapon = new Sword();
        this.facingDirection = 0; // 角色朝向（弧度）
        
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
        
        // 更新角色朝向
        if (dx !== 0 || dy !== 0) {
            this.facingDirection = Math.atan2(dy, dx);
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
        
        // 处理攻击
        if (this.keys.space) {
            this.weapon.startAttack(this.facingDirection);
        }
        
        // 更新武器状态
        this.weapon.update();
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
    
    // 绘制像素风格玩家
    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        
        // 绘制身体（蓝色上衣）
        ctx.fillStyle = '#2196f3';
        ctx.fillRect(-8, -8, 16, 16);
        
        // 绘制头部（肤色）
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(-6, -16, 12, 10);
        
        // 绘制头发（棕色）
        ctx.fillStyle = '#795548';
        ctx.fillRect(-6, -18, 12, 4);
        
        // 绘制眼睛（黑色）
        ctx.fillStyle = '#000';
        ctx.fillRect(-4, -12, 2, 2);
        ctx.fillRect(2, -12, 2, 2);
        
        // 绘制腿（深蓝色裤子）
        ctx.fillStyle = '#1565c0';
        ctx.fillRect(-6, 8, 5, 8);
        ctx.fillRect(1, 8, 5, 8);
        
        // 绘制武器（在攻击时会被武器类覆盖）
        if (!this.weapon.isAttacking) {
            ctx.rotate(this.facingDirection);
            ctx.fillStyle = '#9e9e9e';
            ctx.fillRect(10, -1, 20, 2);
            ctx.fillStyle = '#795548';
            ctx.fillRect(8, -2, 4, 4);
        }
        
        ctx.restore();
        
        // 绘制武器攻击效果
        this.weapon.draw(ctx, this.x, this.y, cameraX, cameraY);
    }
}
