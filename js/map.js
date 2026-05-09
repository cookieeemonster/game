class Map {
    constructor() {
        this.width = CONFIG.MAP_WIDTH;
        this.height = CONFIG.MAP_HEIGHT;
        this.tileSize = CONFIG.TILE_SIZE;
        
        // 地图数据：0=空地, 1=墙, 2=树, 3=石头, 4=水, 5=建筑地板
        this.tiles = [];
        this.walls = []; // 所有碰撞体（墙、树、石头、水）
        this.buildings = []; // 所有建筑
        this.extractionPoints = [];
        this.exploredTiles = new Set(); // 已探索的室内区域
        
        this.initializeEmptyMap();
        this.generateNaturalTerrain();
        this.generateBuildings();
        this.generateExtractionPoints();
        this.buildCollisionList();
    }
    
    // 初始化空地图
    initializeEmptyMap() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        for (let y = 0; y < rows; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < cols; x++) {
                // 边缘是墙
                if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                    this.tiles[y][x] = 1;
                } else {
                    this.tiles[y][x] = 0;
                }
            }
        }
    }
    
    // 生成自然地形（树木、石头、河流）
    generateNaturalTerrain() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        // 生成河流（横向）
        const riverY = randomInt(Math.floor(rows * 0.3), Math.floor(rows * 0.7));
        for (let x = 2; x < cols - 2; x++) {
            // 河流有轻微弯曲
            const offset = Math.floor(Math.sin(x * 0.2) * 2);
            for (let dy = -1; dy <= 1; dy++) {
                const y = riverY + offset + dy;
                if (y > 1 && y < rows - 2) {
                    this.tiles[y][x] = 4; // 水
                }
            }
        }
        
        // 生成桥梁（3座）
        for (let i = 0; i < 3; i++) {
            const bridgeX = randomInt(Math.floor(cols * 0.2), Math.floor(cols * 0.8));
            for (let dy = -1; dy <= 1; dy++) {
                const y = riverY + Math.floor(Math.sin(bridgeX * 0.2) * 2) + dy;
                if (y > 1 && y < rows - 2) {
                    this.tiles[y][bridgeX] = 0; // 桥是空地
                }
            }
        }
        
        // 生成树林（低密度）
        for (let y = 2; y < rows - 2; y++) {
            for (let x = 2; x < cols - 2; x++) {
                if (this.tiles[y][x] === 0 && Math.random() < 0.08) {
                    this.tiles[y][x] = 2; // 树
                }
            }
        }
        
        // 生成石头堆（更低密度）
        for (let y = 2; y < rows - 2; y++) {
            for (let x = 2; x < cols - 2; x++) {
                if (this.tiles[y][x] === 0 && Math.random() < 0.03) {
                    this.tiles[y][x] = 3; // 石头
                }
            }
        }
    }
    
    // 生成预制建筑
    generateBuildings() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        const buildingCount = 6; // 生成6个建筑
        
        // 建筑模板
        const buildingTemplates = [
            this.createSmallHouseTemplate(),
            this.createWarehouseTemplate(),
            this.createTwoStoryHouseTemplate()
        ];
        
        for (let i = 0; i < buildingCount; i++) {
            // 随机选择建筑模板
            const template = buildingTemplates[randomInt(0, buildingTemplates.length - 1)];
            const templateWidth = template[0].length;
            const templateHeight = template.length;
            
            // 寻找合适的放置位置
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const startX = randomInt(5, cols - templateWidth - 5);
                const startY = randomInt(5, rows - templateHeight - 5);
                
                // 检查位置是否可用（不能在水上，不能与其他建筑重叠）
                let canPlace = true;
                for (let y = 0; y < templateHeight; y++) {
                    for (let x = 0; x < templateWidth; x++) {
                        if (this.tiles[startY + y][startX + x] === 4) { // 不能在水上
                            canPlace = false;
                            break;
                        }
                    }
                    if (!canPlace) break;
                }
                
                if (canPlace) {
                    // 放置建筑
                    this.placeBuilding(template, startX, startY);
                    this.buildings.push({
                        x: startX * this.tileSize,
                        y: startY * this.tileSize,
                        width: templateWidth * this.tileSize,
                        height: templateHeight * this.tileSize,
                        explored: false
                    });
                    placed = true;
                }
                
                attempts++;
            }
        }
    }
    
    // 小木屋模板（8x8）
    createSmallHouseTemplate() {
        return [
            [1,1,1,1,1,1,1,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,1,1,5,5,1],
            [1,5,5,1,1,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,1,1,0,0,1,1,1] // 底部有2格宽的门
        ];
    }
    
    // 大仓库模板（12x10）
    createWarehouseTemplate() {
        return [
            [1,1,1,1,1,1,1,1,1,1,1,1],
            [1,5,5,5,5,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,5,5,5,5,1],
            [1,5,5,1,1,1,1,1,1,5,5,1],
            [1,5,5,1,5,5,5,5,1,5,5,1],
            [1,5,5,1,5,5,5,5,1,5,5,1],
            [1,5,5,1,1,0,0,1,1,5,5,1],
            [1,5,5,5,5,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,5,5,5,5,1],
            [1,1,1,1,1,1,1,1,1,1,1,1]
        ];
    }
    
    // 两层楼房模板（10x12）
    createTwoStoryHouseTemplate() {
        return [
            [1,1,1,1,1,1,1,1,1,1],
            [1,5,5,5,1,1,5,5,5,1],
            [1,5,5,5,1,1,5,5,5,1],
            [1,5,5,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,5,5,1],
            [1,1,1,1,5,5,1,1,1,1],
            [1,1,1,1,5,5,1,1,1,1],
            [1,5,5,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,5,5,1],
            [1,5,5,5,1,1,5,5,5,1],
            [1,5,5,5,1,1,5,5,5,1],
            [1,1,1,0,0,1,1,1,1,1] // 底部2格宽的门
        ];
    }
    
    // 放置建筑到地图
    placeBuilding(template, startX, startY) {
        const templateHeight = template.length;
        const templateWidth = template[0].length;
        
        for (let y = 0; y < templateHeight; y++) {
            for (let x = 0; x < templateWidth; x++) {
                this.tiles[startY + y][startX + x] = template[y][x];
            }
        }
    }
    
    // 构建碰撞体列表
    buildCollisionList() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        this.walls = [];
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tile = this.tiles[y][x];
                // 墙、树、石头、水都是碰撞体
                if (tile === 1 || tile === 2 || tile === 3 || tile === 4) {
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
    
    // 生成撤离点（只在室外）
    generateExtractionPoints() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        for (let i = 0; i < CONFIG.EXTRACTION_POINT_COUNT; i++) {
            let x, y;
            let valid = false;
            let attempts = 0;
            
            while (!valid && attempts < 100) {
                const tileX = randomInt(5, cols - 5);
                const tileY = randomInt(5, rows - 5);
                
                // 撤离点必须在空地上，不能在建筑内
                if (this.tiles[tileY][tileX] === 0) {
                    x = tileX * this.tileSize;
                    y = tileY * this.tileSize;
                    valid = true;
                }
                
                attempts++;
            }
            
            if (valid) {
                this.extractionPoints.push({
                    x, y, 
                    width: this.tileSize * 2, 
                    height: this.tileSize * 2
                });
            }
        }
    }
    
    // 检测是否与碰撞体碰撞
    isColliding(rect) {
        return this.walls.some(wall => rectCollision(rect, wall));
    }
    
    // 更新已探索区域（玩家进入建筑时调用）
    updateExploredArea(playerX, playerY) {
        const playerTileX = Math.floor(playerX / this.tileSize);
        const playerTileY = Math.floor(playerY / this.tileSize);
        
        // 检查玩家是否在建筑内
        for (const building of this.buildings) {
            if (playerX > building.x && playerX < building.x + building.width &&
                playerY > building.y && playerY < building.y + building.height) {
                // 标记整个建筑为已探索
                const startTileX = Math.floor(building.x / this.tileSize);
                const startTileY = Math.floor(building.y / this.tileSize);
                const endTileX = Math.floor((building.x + building.width) / this.tileSize);
                const endTileY = Math.floor((building.y + building.height) / this.tileSize);
                
                for (let y = startTileY; y < endTileY; y++) {
                    for (let x = startTileX; x < endTileX; x++) {
                        this.exploredTiles.add(`${x},${y}`);
                    }
                }
                building.explored = true;
            }
        }
    }
    
    // 绘制地图
    draw(ctx, cameraX, cameraY) {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        // 计算可见区域
        const startTileX = Math.max(0, Math.floor(cameraX / this.tileSize) - 1);
        const endTileX = Math.min(cols, Math.floor((cameraX + CONFIG.CANVAS_WIDTH) / this.tileSize) + 1);
        const startTileY = Math.max(0, Math.floor(cameraY / this.tileSize) - 1);
        const endTileY = Math.min(rows, Math.floor((cameraY + CONFIG.CANVAS_HEIGHT) / this.tileSize) + 1);
        
        // 绘制地面
        ctx.fillStyle = '#4a7c59'; // 草地绿色
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // 绘制瓦片
        for (let y = startTileY; y < endTileY; y++) {
            for (let x = startTileX; x < endTileX; x++) {
                const screenX = x * this.tileSize - cameraX;
                const screenY = y * this.tileSize - cameraY;
                const tile = this.tiles[y][x];
                
                // 检查是否是未探索的室内区域
                let isUnexploredIndoor = false;
                for (const building of this.buildings) {
                    const buildingStartX = Math.floor(building.x / this.tileSize);
                    const buildingStartY = Math.floor(building.y / this.tileSize);
                    const buildingEndX = Math.floor((building.x + building.width) / this.tileSize);
                    const buildingEndY = Math.floor((building.y + building.height) / this.tileSize);
                    
                    if (x >= buildingStartX && x < buildingEndX &&
                        y >= buildingStartY && y < buildingEndY &&
                        !building.explored) {
                        isUnexploredIndoor = true;
                        break;
                    }
                }
                
                if (isUnexploredIndoor) {
                    // 未探索的室内显示为黑色
                    ctx.fillStyle = '#000';
                    ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                    continue;
                }
                
                // 根据瓦片类型绘制
                switch (tile) {
                    case 1: // 墙
                        ctx.fillStyle = '#795548';
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                        ctx.strokeStyle = '#5d4037';
                        ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
                        break;
                        
                    case 2: // 树
                        ctx.fillStyle = '#2e7d32';
                        ctx.beginPath();
                        ctx.arc(screenX + this.tileSize/2, screenY + this.tileSize/2, this.tileSize/2 - 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = '#1b5e20';
                        ctx.beginPath();
                        ctx.arc(screenX + this.tileSize/2, screenY + this.tileSize/2 - 4, this.tileSize/3, 0, Math.PI * 2);
                        ctx.fill();
                        break;
                        
                    case 3: // 石头
                        ctx.fillStyle = '#9e9e9e';
                        ctx.fillRect(screenX + 4, screenY + 4, this.tileSize - 8, this.tileSize - 8);
                        ctx.fillStyle = '#757575';
                        ctx.fillRect(screenX + 6, screenY + 6, this.tileSize - 12, this.tileSize - 12);
                        break;
                        
                    case 4: // 水
                        ctx.fillStyle = '#2196f3';
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                        // 水波纹效果
                        ctx.strokeStyle = '#64b5f6';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(screenX, screenY + this.tileSize/3);
                        ctx.lineTo(screenX + this.tileSize, screenY + this.tileSize/3);
                        ctx.moveTo(screenX, screenY + this.tileSize*2/3);
                        ctx.lineTo(screenX + this.tileSize, screenY + this.tileSize*2/3);
                        ctx.stroke();
                        break;
                        
                    case 5: // 建筑地板
                        ctx.fillStyle = '#d7ccc8';
                        ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                        ctx.strokeStyle = '#bcaaa4';
                        ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
                        break;
                }
            }
        }
        
        // 绘制撤离点（绿色闪烁效果）
        ctx.fillStyle = `rgba(76, 175, 80, ${0.5 + Math.sin(Date.now() / 500) * 0.3})`;
        this.extractionPoints.forEach(point => {
            const screenX = point.x - cameraX;
            const screenY = point.y - cameraY;
            ctx.fillRect(screenX, screenY, point.width, point.height);
            
            // 撤离点文字
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('撤离点', screenX + point.width/2, screenY + point.height/2 + 5);
        });
    }
}
