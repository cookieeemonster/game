class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        this.state = GAME_STATE.PLAYING;
        this.cameraX = 0;
        this.cameraY = 0;
        
        this.map = new Map();
        this.player = new Player(this.map);
        this.enemies = [];
        this.items = [];
        this.ui = new UI(this);
        
        for (let i = 0; i < CONFIG.ENEMY_SPAWN_COUNT; i++) {
            this.enemies.push(new Enemy(this.map, this.player));
        }
        
        for (let i = 0; i < CONFIG.ITEM_SPAWN_COUNT; i++) {
            this.items.push(new Item(this.map));
        }
    }
    
    updateCamera() {
        const tileX = this.player.x / this.map.tileSize;
        const tileY = this.player.y / this.map.tileSize;
        const isoX = (tileX - tileY) * (this.map.tileSize / 2);
        const isoY = (tileX + tileY) * (this.map.tileHeight / 2);
        
        this.cameraX = isoX;
        this.cameraY = isoY;
    }
    
    checkExtraction() {
        if (this.enemies.length === 0) {
            const playerRect = this.player.getBoundingRect();
            for (const point of this.map.extractionPoints) {
                if (rectCollision(playerRect, point)) {
                    this.state = GAME_STATE.WIN;
                    alert('恭喜你成功撤离！游戏胜利！');
                    location.reload();
                }
            }
        }
    }
    
    checkItemPickup() {
        const playerRect = this.player.getBoundingRect();
        this.items = this.items.filter(item => {
            if (rectCollision(playerRect, item.getBoundingRect())) {
                item.pickup(this.player);
                return false;
            }
            return true;
        });
    }
    
    checkPlayerAttack() {
        if (!this.player.weapon.isAttacking) return;
        
        this.enemies.forEach(enemy => {
            if (this.player.weapon.checkHit(this.player.x, this.player.y, enemy)) {
                const isDead = enemy.takeDamage(this.player.weapon.damage);
                if (isDead) {
                    // 敌人死亡掉落
                }
            }
        });
    }
    
    update() {
        if (this.state !== GAME_STATE.PLAYING) return;
        
        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        
        this.checkPlayerAttack();
        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
        
        this.updateCamera();
        this.checkItemPickup();
        this.checkExtraction();
        
        this.map.updatePlayerInBuilding(this.player.x, this.player.y);
        
        if (this.player.health <= 0) {
            this.state = GAME_STATE.LOSE;
            alert('你被敌人击败了！游戏失败！');
            location.reload();
        }
        
        this.ui.update();
    }
    
    // ==============================================
    // 【修复3：桥在人下面 + 修复4：白色浮空块消失】
    // 完美图层顺序：地面 → 物品 → 敌人 → 玩家 → 立体物体 → 屋顶
    // ==============================================
    render() {
        // 1. 清空画布（彻底解决白色浮空块）
        this.ctx.fillStyle = '#2d2d2d';
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // 2. 绘制地面层（包括桥，现在在最下面）
        this.map.drawGround(this.ctx, this.cameraX, this.cameraY);
        
        // 3. 绘制物品
        this.items.forEach(item => item.draw(this.ctx, this.cameraX, this.cameraY));
        
        // 4. 绘制敌人（按Y轴排序）
        this.enemies.sort((a, b) => a.y - b.y);
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.cameraX, this.cameraY));
        
        // 5. 绘制玩家
        this.player.draw(this.ctx, this.cameraX, this.cameraY);
        
        // 6. 绘制立体物体（墙、树、石头、门）
        this.map.drawObjects(this.ctx, this.cameraX, this.cameraY);
        
        // 7. 绘制屋顶
        this.map.drawFlatRoofs(this.ctx, this.cameraX, this.cameraY);
        
        // 8. 绘制撤离点
        this.map.drawExtractionPoints(this.ctx, this.cameraX, this.cameraY);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    start() {
        this.gameLoop();
    }
}
