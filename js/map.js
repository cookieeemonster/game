class Map {
    constructor() {
        this.width = CONFIG.MAP_WIDTH;
        this.height = CONFIG.MAP_HEIGHT;
        this.tileSize = CONFIG.TILE_SIZE;
        this.walls = [];
        this.extractionPoints = [];
        
        this.generateMap();
        this.generateExtractionPoints();
    }
    
    // 随机生成地图墙壁
    generateMap() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                // 边缘必须是墙
                if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                    this.walls.push({
                        x: x * this.tileSize,
                        y: y * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize
                    });
                } 
                // 随机生成内部墙壁
                else if (Math.random() < CONFIG.WALL_DENSITY) {
                    this.walls.push({
                        x: x * this.tileSize,
                        y: y * this.tileSize,
                        width: this.tileSize,
                        height: this.tileSize
                    });
                }
            }
        }
    }
    
    // 生成撤离点
    generateExtractionPoints() {
        for (let i = 0; i < CONFIG.EXTRACTION_POINT_COUNT; i++) {
            let x, y;
            do {
                x = randomInt(this.tileSize * 2, this.width - this.tileSize * 2);
                y = randomInt(this.tileSize * 2, this.height - this.tileSize * 2);
            } while (this.isColliding({x, y, width: this.tileSize, height: this.tileSize}));
            
            this.extractionPoints.push({x, y, width: this.tileSize * 2, height: this.tileSize * 2});
        }
    }
    
    // 检测是否与墙壁碰撞
    isColliding(rect) {
        return this.walls.some(wall => rectCollision(rect, wall));
    }
    
    // 绘制地图
    draw(ctx, cameraX, cameraY) {
        // 绘制地面
        ctx.fillStyle = '#3d3d3d';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // 绘制墙壁
        ctx.fillStyle = '#555';
        this.walls.forEach(wall => {
            const screenX = wall.x - cameraX;
            const screenY = wall.y - cameraY;
            
            // 只绘制在屏幕内的墙壁
            if (screenX + wall.width > 0 && screenX < CONFIG.CANVAS_WIDTH &&
                screenY + wall.height > 0 && screenY < CONFIG.CANVAS_HEIGHT) {
                ctx.fillRect(screenX, screenY, wall.width, wall.height);
            }
        });
        
        // 绘制撤离点（绿色闪烁效果）
        ctx.fillStyle = `rgba(76, 175, 80, ${0.5 + Math.sin(Date.now() / 500) * 0.3})`;
        this.extractionPoints.forEach(point => {
            const screenX = point.x - cameraX;
            const screenY = point.y - cameraY;
            ctx.fillRect(screenX, screenY, point.width, point.height);
        });
    }
}
