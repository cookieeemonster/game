class Item {
    constructor(map) {
        this.map = map;
        this.type = 'health';
        this.width = 24;
        this.height = 24;
        
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
    
    pickup(player) {
        if (this.type === 'health') {
            player.health = Math.min(player.health + 25, CONFIG.PLAYER_MAX_HEALTH);
        }
    }
    
    draw(ctx, cameraX, cameraY) {
        const tileX = this.x / this.map.tileSize;
        const tileY = this.y / this.map.tileSize;
        const iso = cartesianToIsometric(tileX, tileY);
        const screenX = iso.x - cameraX + CONFIG.CANVAS_WIDTH / 2;
        const screenY = iso.y - cameraY + CONFIG.CANVAS_HEIGHT / 2;
        
        ctx.save();
        ctx.translate(screenX, screenY);
        
        // 医疗包底座
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(-10, -5, 20, 10);
        
        // 十字
        ctx.fillStyle = '#fff';
        ctx.fillRect(-2, -8, 4, 16);
        ctx.fillRect(-8, -2, 16, 4);
        
        ctx.restore();
    }
}
