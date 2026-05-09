class Item {
    constructor(map) {
        this.map = map;
        this.type = 'health'; // 只保留医疗包
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
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        const screenX = this.x - cameraX;
        const screenY = this.y - cameraY;
        
        // 绘制医疗包（十字形状）
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(screenX - 8, screenY - 2, 16, 4);
        ctx.fillRect(screenX - 2, screenY - 8, 4, 16);
    }
}
