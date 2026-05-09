class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        this.state = GAME_STATE.PLAYING;
        this.cameraX = 0;
        this.cameraY = 0;
        
        // 初始化游戏对象
        this.map = new Map();
        this.player = new Player(this.map);
        this.enemies = [];
        this.items = [];
        this.ui = new UI(this);
        
        // 生成敌人
        for (let i = 0; i < CONFIG.ENEMY_SPAWN_COUNT; i++) {
            this.enemies.push(new Enemy(this.map, this.player));
        }
        
        // 生成物品
        for (let i = 0; i < CONFIG.ITEM_SPAWN_COUNT; i++) {
            const type = Math.random() < 0.5 ? 'health' : 'ammo';
            this.items.push(new Item(this.map, type));
        }
    }
    
    // 更新相机位置（跟随玩家）
    updateCamera() {
        this.cameraX = this.player.x - CONFIG.CANVAS_WIDTH / 2;
        this.cameraY = this.player.y - CONFIG.CANVAS_HEIGHT / 2;
        
        // 限制相机在地图内
        this.cameraX = clamp(this.cameraX, 0, this.map.width - CONFIG.CANVAS_WIDTH);
        this.cameraY = clamp(this.cameraY, 0, this.map.height - CONFIG.CANVAS_HEIGHT);
    }
    
    // 检测玩家与撤离点的碰撞
    checkExtraction() {
        if (this.enemies.length === 0) { // 只有清除所有敌人才能撤离
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
    
    // 检测玩家与物品的碰撞
    checkItemPickup() {
        const playerRect = this.player.getBoundingRect();
        this.items = this.items.filter(item => {
            if (rectCollision(playerRect, item.getBoundingRect())) {
                item.pickup(this.player);
                return false; // 移除已拾取的物品
            }
            return true;
        });
    }
    
    // 更新游戏状态
    update() {
        if (this.state !== GAME_STATE.PLAYING) return;
        
        this.player.update();
        this.enemies.forEach(enemy => enemy.update());
        
        // 移除死亡的敌人
        this.enemies = this.enemies.filter(enemy => enemy.health > 0);
        
        this.updateCamera();
        this.checkItemPickup();
        this.checkExtraction();
        
        // 检查玩家是否死亡
        if (this.player.health <= 0) {
            this.state = GAME_STATE.LOSE;
            alert('你被敌人击败了！游戏失败！');
            location.reload();
        }
        
        this.ui.update();
    }
    
    // 渲染游戏画面
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // 绘制地图
        this.map.draw(this.ctx, this.cameraX, this.cameraY);
        
        // 绘制物品
        this.items.forEach(item => item.draw(this.ctx, this.cameraX, this.cameraY));
        
        // 绘制敌人
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.cameraX, this.cameraY));
        
        // 绘制玩家
        this.player.draw(this.ctx, this.cameraX, this.cameraY);
    }
    
    // 游戏主循环
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // 启动游戏
    start() {
        this.gameLoop();
    }
}
