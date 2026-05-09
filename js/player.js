class Player {
    constructor(map) {
        this.map = map;
        this.width = 32;
        this.height = 32;
        this.health = CONFIG.PLAYER_MAX_HEALTH;
        this.speed = CONFIG.PLAYER_SPEED;
        
        // 武器系统
        this.weapon = new Sword();
        this.direction = DIRECTION.DOWN; // 初始朝向下方
        this.facingAngle = Math.PI / 2; // 初始角度向下
        
        // 动画系统
        this.animationFrame = 0;
        this.animationSpeed = 0.15;
        this.isMoving = false;
        this.isAttacking = false;
        
        // 随机生成初始位置
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
        
        // 更新移动状态和朝向
        this.isMoving = dx !== 0 || dy !== 0;
        if (this.isMoving) {
            this.facingAngle = Math.atan2(dy, dx);
            this.direction = angleToDirection(this.facingAngle);
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
        if (this.keys.space && !this.isAttacking) {
            this.isAttacking = true;
            this.weapon.startAttack(this.facingAngle);
            this.animationFrame = 0;
        }
        
        // 更新武器状态
        this.weapon.update();
        
        // 更新动画
        if (this.isMoving || this.isAttacking) {
            this.animationFrame += this.animationSpeed;
            if (this.animationFrame >= 4) {
                this.animationFrame = 0;
                if (this.isAttacking) {
                    this.isAttacking = false;
                }
            }
        } else {
            this.animationFrame = 0;
        }
    }
    
    // 玩家受伤
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            return true;
        }
        return false;
    }
    
    // 绘制等轴测角色
    draw(ctx, cameraX, cameraY) {
        // 转换为等轴测坐标
        const tileX = this.x / this.map.tileSize;
        const tileY = this.y / this.map.tileSize;
        const iso = cartesianToIsometric(tileX, tileY);
        const screenX = iso.x - cameraX + CONFIG.CANVAS_WIDTH / 2;
        const screenY = iso.y - cameraY + CONFIG.CANVAS_HEIGHT / 2;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        
        // 根据方向调整角色绘制
        const frame = Math.floor(this.animationFrame);
        
        // 绘制身体
        this.drawBody(ctx, frame);
        
        // 绘制头部
        this.drawHead(ctx);
        
        // 绘制武器
        if (this.weapon.isAttacking) {
            this.weapon.draw(ctx, 0, 0, 0, 0); // 武器自己处理坐标
        } else {
            this.drawWeapon(ctx);
        }
        
        ctx.restore();
    }
    
    // 绘制角色身体
    drawBody(ctx, frame) {
        // 腿部动画
        const legOffset = Math.sin(frame * Math.PI / 2) * 3;
        
        // 左腿
        ctx.fillStyle = '#1565c0';
        ctx.fillRect(-6, 0 + legOffset, 5, 12);
        
        // 右腿
        ctx.fillStyle = '#0d47a1';
        ctx.fillRect(1, 0 - legOffset, 5, 12);
        
        // 身体
        ctx.fillStyle = '#2196f3';
        ctx.fillRect(-8, -16, 16, 16);
        
        // 手臂动画
        const armOffset = Math.sin(frame * Math.PI / 2) * 2;
        
        // 左臂
        ctx.fillStyle = '#1976d2';
        ctx.fillRect(-12, -14 + armOffset, 4, 10);
        
        // 右臂
        ctx.fillStyle = '#1976d2';
        ctx.fillRect(8, -14 - armOffset, 4, 10);
    }
    
    // 绘制角色头部
    drawHead(ctx) {
        // 头部
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(-6, -32, 12, 16);
        
        // 头发
        ctx.fillStyle = '#795548';
        ctx.fillRect(-6, -34, 12, 6);
        
        // 眼睛
        ctx.fillStyle = '#000';
        ctx.fillRect(-4, -26, 2, 2);
        ctx.fillRect(2, -26, 2, 2);
    }
    
    // 绘制武器
    drawWeapon(ctx) {
        ctx.save();
        ctx.rotate(this.facingAngle);
        
        // 剑柄
        ctx.fillStyle = '#795548';
        ctx.fillRect(8, -2, 6, 4);
        
        // 剑身
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(14, -1, 24, 2);
        
        ctx.restore();
    }
}
