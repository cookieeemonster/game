class Enemy {
    constructor(map, player) {
        this.map = map;
        this.player = player;
        this.width = 24;
        this.height = 32;
        this.health = CONFIG.ENEMY_MAX_HEALTH;
        this.speed = CONFIG.ENEMY_SPEED;
        this.damage = CONFIG.ENEMY_DAMAGE;
        this.attackCooldown = 0;
        this.attackRange = 40; // 敌人近战攻击范围
        this.detectionRange = 200;
        
        // 随机生成敌人位置（不在墙上，远离玩家）
        do {
            this.x = randomInt(this.map.tileSize * 2, this.map.width - this.map.tileSize * 2);
            this.y = randomInt(this.map.tileSize * 2, this.map.height - this.map.tileSize * 2);
        } while (this.map.isColliding(this.getBoundingRect()) || 
                 distance(this.x, this.y, player.x, player.y) < 300);
    }
    
    getBoundingRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    update() {
        const distToPlayer = distance(this.x, this.y, this.player.x, this.player.y);
        
        // 如果玩家在检测范围内，追踪玩家
        if (distToPlayer < this.detectionRange) {
            const angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);
            const dx = Math.cos(angle) * this.speed;
            const dy = Math.sin(angle) * this.speed;
            
            // 尝试移动
            const newX = this.x + dx;
            const newY = this.y + dy;
            const testRect = this.getBoundingRect();
            testRect.x = newX - this.width / 2;
            testRect.y = newY - this.height / 2;
            
            if (!this.map.isColliding(testRect)) {
                this.x = newX;
                this.y = newY;
            }
            
            // 如果在攻击范围内，攻击玩家
            if (distToPlayer < this.attackRange && this.attackCooldown <= 0) {
                this.player.takeDamage(this.damage);
                this.attackCooldown = 60; // 1秒攻击一次（60FPS）
            }
        }
        
        // 减少攻击冷却
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
    
    // 绘制像素风格敌人
    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        
        // 绘制身体（红色上衣）
        ctx.fillStyle = '#f44336';
        ctx.fillRect(-8, -8, 16, 16);
        
        // 绘制头部（灰色皮肤）
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(-6, -16, 12, 10);
        
        // 绘制眼睛（红色）
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-4, -12, 2, 2);
        ctx.fillRect(2, -12, 2, 2);
        
        // 绘制腿（深红色裤子）
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(-6, 8, 5, 8);
        ctx.fillRect(1, 8, 5, 8);
        
        // 绘制敌人武器（匕首）
        const angleToPlayer = Math.atan2(this.player.y - this.y, this.player.x - this.x);
        ctx.rotate(angleToPlayer);
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(8, -1, 12, 2);
        ctx.fillStyle = '#795548';
        ctx.fillRect(6, -2, 4, 4);
        
        ctx.restore();
        
        // 绘制敌人血条
        const healthPercent = this.health / CONFIG.ENEMY_MAX_HEALTH;
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX - 12, screenY - 24, 24, 4);
        ctx.fillStyle = '#f44336';
        ctx.fillRect(screenX - 12, screenY - 24, 24 * healthPercent, 4);
    }
}
