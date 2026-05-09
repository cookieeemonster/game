class Enemy {
    constructor(map, player) {
        this.map = map;
        this.player = player;
        this.width = 32;
        this.height = 32;
        this.health = CONFIG.ENEMY_MAX_HEALTH;
        this.speed = CONFIG.ENEMY_SPEED;
        this.damage = CONFIG.ENEMY_DAMAGE;
        this.attackCooldown = 0;
        this.attackRange = 50;
        this.detectionRange = 250;
        
        // 动画系统
        this.animationFrame = 0;
        this.animationSpeed = 0.1;
        this.isMoving = false;
        
        // 随机生成位置
        do {
            this.x = randomInt(this.map.tileSize * 2, this.map.width - this.map.tileSize * 2);
            this.y = randomInt(this.map.tileSize * 2, this.map.height - this.map.tileSize * 2);
        } while (this.map.isColliding(this.getBoundingRect()) || 
                 distance(this.x, this.y, player.x, player.y) < 400);
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
        
        this.isMoving = false;
        
        if (distToPlayer < this.detectionRange) {
            const angle = Math.atan2(this.player.y - this.y, this.player.x - this.x);
            const dx = Math.cos(angle) * this.speed;
            const dy = Math.sin(angle) * this.speed;
            
            const newX = this.x + dx;
            const newY = this.y + dy;
            const testRect = this.getBoundingRect();
            testRect.x = newX - this.width / 2;
            testRect.y = newY - this.height / 2;
            
            if (!this.map.isColliding(testRect)) {
                this.x = newX;
                this.y = newY;
                this.isMoving = true;
            }
            
            if (distToPlayer < this.attackRange && this.attackCooldown <= 0) {
                this.player.takeDamage(this.damage);
                this.attackCooldown = 60;
            }
        }
        
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
        
        // 更新动画
        if (this.isMoving) {
            this.animationFrame += this.animationSpeed;
            if (this.animationFrame >= 4) {
                this.animationFrame = 0;
            }
        } else {
            this.animationFrame = 0;
        }
    }
    
    takeDamage(amount) {
        this.health -= amount;
        return this.health <= 0;
    }
    
    draw(ctx, cameraX, cameraY) {
        const tileX = this.x / this.map.tileSize;
        const tileY = this.y / this.map.tileSize;
        const iso = cartesianToIsometric(tileX, tileY);
        const screenX = iso.x - cameraX + CONFIG.CANVAS_WIDTH / 2;
        const screenY = iso.y - cameraY + CONFIG.CANVAS_HEIGHT / 2;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        
        const frame = Math.floor(this.animationFrame);
        const legOffset = Math.sin(frame * Math.PI / 2) * 2;
        
        // 腿部
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(-6, 0 + legOffset, 5, 12);
        ctx.fillRect(1, 0 - legOffset, 5, 12);
        
        // 身体
        ctx.fillStyle = '#f44336';
        ctx.fillRect(-8, -16, 16, 16);
        
        // 手臂
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(-12, -14, 4, 10);
        ctx.fillRect(8, -14, 4, 10);
        
        // 头部
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(-6, -32, 12, 16);
        
        // 眼睛
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-4, -26, 2, 2);
        ctx.fillRect(2, -26, 2, 2);
        
        // 武器（匕首）
        const angleToPlayer = Math.atan2(this.player.y - this.y, this.player.x - this.x);
        ctx.save();
        ctx.rotate(angleToPlayer);
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(10, -1, 16, 2);
        ctx.fillStyle = '#795548';
        ctx.fillRect(6, -2, 4, 4);
        ctx.restore();
        
        ctx.restore();
        
        // 血条
        const healthPercent = this.health / CONFIG.ENEMY_MAX_HEALTH;
        ctx.fillStyle = '#333';
        ctx.fillRect(screenX - 16, screenY - 45, 32, 4);
        ctx.fillStyle = '#f44336';
        ctx.fillRect(screenX - 16, screenY - 45, 32 * healthPercent, 4);
    }
}
