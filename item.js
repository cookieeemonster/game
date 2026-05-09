class Item {
    constructor(map, type) {
        this.map = map;
        this.type = type; // 'health' 或 'ammo'
        this.width = 16;
        this.height = 16;
        
        // 随机生成物品位置
        do {
            this.x = randomInt(this.map.tileSize * 2, this.map.width - this.map.tileSize * 2);
            this.y = randomInt(this.map.tileSize * 2, this.map.height - this.map.tileSize * 2);
        } while (this.map.isColliding(this.getBoundingRect()));
    }
    
    getBoundingRect() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
    
    // 玩家拾取物品
    pickup(player) {
        if (this.type === 'health') {
            player.health = Math.min(player.health + 25, CONFIG.PLAYER_MAX_HEALTH);
        } else if (this.type === 'ammo') {
            player.ammo += 15;
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        // 根据类型绘制不同颜色的物品
        if (this.type === 'health') {
            ctx.fillStyle = '#4caf50'; // 绿色医疗包
        } else if (this.type === 'ammo') {
            ctx.fillStyle = '#ff9800'; // 橙色弹药
        }
        
        ctx.fillRect(screenX - this.width / 2, screenY - this.height / 2, this.width, this.height);
    }
}
