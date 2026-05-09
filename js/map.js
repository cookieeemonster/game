class Map {
    constructor() {
        this.width = CONFIG.MAP_WIDTH;
        this.height = CONFIG.MAP_HEIGHT;
        this.tileSize = CONFIG.TILE_SIZE;
        this.tileHeight = CONFIG.TILE_HEIGHT;
        
        // 地图数据：0=草地, 1=墙, 2=树, 3=石头, 4=水, 5=建筑地板
        this.tiles = [];
        this.walls = [];
        this.buildings = [];
        this.extractionPoints = [];
        this.exploredTiles = new Set();
        
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
                if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
                    this.tiles[y][x] = 1;
                } else {
                    this.tiles[y][x] = 0;
                }
            }
        }
    }
    
    // 生成自然地形
    generateNaturalTerrain() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        // 生成河流
        const riverY = randomInt(Math.floor(rows * 0.3), Math.floor(rows * 0.7));
        for (let x = 2; x < cols - 2; x++) {
            const offset = Math.floor(Math.sin(x * 0.2) * 2);
            for (let dy = -1; dy <= 1; dy++) {
                const y = riverY + offset + dy;
                if (y > 1 && y < rows - 2) {
                    this.tiles[y][x] = 4;
                }
            }
        }
        
        // 生成桥梁
        for (let i = 0; i < 3; i++) {
            const bridgeX = randomInt(Math.floor(cols * 0.2), Math.floor(cols * 0.8));
            for (let dy = -1; dy <= 1; dy++) {
                const y = riverY + Math.floor(Math.sin(bridgeX * 0.2) * 2) + dy;
                if (y > 1 && y < rows - 2) {
                    this.tiles[y][bridgeX] = 0;
                }
            }
        }
        
        // 生成树林
        for (let y = 2; y < rows - 2; y++) {
            for (let x = 2; x < cols - 2; x++) {
                if (this.tiles[y][x] === 0 && Math.random() < 0.06) {
                    this.tiles[y][x] = 2;
                }
            }
        }
        
        // 生成石头
        for (let y = 2; y < rows - 2; y++) {
            for (let x = 2; x < cols - 2; x++) {
                if (this.tiles[y][x] === 0 && Math.random() < 0.02) {
                    this.tiles[y][x] = 3;
                }
            }
        }
    }
    
    // 生成预制建筑
    generateBuildings() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        const buildingCount = 5;
        
        const buildingTemplates = [
            this.createSmallHouseTemplate(),
            this.createWarehouseTemplate(),
            this.createTwoStoryHouseTemplate()
        ];
        
        for (let i = 0; i < buildingCount; i++) {
            const template = buildingTemplates[randomInt(0, buildingTemplates.length - 1)];
            const templateWidth = template[0].length;
            const templateHeight = template.length;
            
            let placed = false;
            let attempts = 0;
            
            while (!placed && attempts < 100) {
                const startX = randomInt(5, cols - templateWidth - 5);
                const startY = randomInt(5, rows - templateHeight - 5);
                
                let canPlace = true;
                for (let y = 0; y < templateHeight; y++) {
                    for (let x = 0; x < templateWidth; x++) {
                        if (this.tiles[startY + y][startX + x] === 4) {
                            canPlace = false;
                            break;
                        }
                    }
                    if (!canPlace) break;
                }
                
                if (canPlace) {
                    this.placeBuilding(template, startX, startY);
                    this.buildings.push({
                        x: startX * this.tileSize,
                        y: startY * this.tileSize,
                        width: templateWidth * this.tileSize,
                        height: templateHeight * this.tileSize,
                        explored: false,
                        template: template
                    });
                    placed = true;
                }
                
                attempts++;
            }
        }
    }
    
    // 小木屋模板
    createSmallHouseTemplate() {
        return [
            [1,1,1,1,1,1],
            [1,5,5,5,5,1],
            [1,5,5,5,5,1],
            [1,5,5,5,5,1],
            [1,5,5,5,5,1],
            [1,1,1,0,1,1]
        ];
    }
    
    // 大仓库模板
    createWarehouseTemplate() {
        return [
            [1,1,1,1,1,1,1,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,1,1,5,5,1],
            [1,5,5,1,1,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,1,1,0,0,1,1,1]
        ];
    }
    
    // 两层楼房模板
    createTwoStoryHouseTemplate() {
        return [
            [1,1,1,1,1,1,1,1],
            [1,5,5,1,1,5,5,1],
            [1,5,5,1,1,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,1,1,5,5,1,1,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,1,1,5,5,1],
            [1,1,1,0,0,1,1,1]
        ];
    }
    
    // 放置建筑
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
    
    // 生成撤离点
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
    
    // 碰撞检测（保持原逻辑不变）
    isColliding(rect) {
        return this.walls.some(wall => rectCollision(rect, wall));
    }
    
    // 更新探索区域
    updateExploredArea(playerX, playerY) {
        const playerTileX = Math.floor(playerX / this.tileSize);
        const playerTileY = Math.floor(playerY / this.tileSize);
        
        for (const building of this.buildings) {
            if (playerX > building.x && playerX < building.x + building.width &&
                playerY > building.y && playerY < building.y + building.height) {
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
    
    // 绘制等轴测地图
    draw(ctx, cameraX, cameraY) {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        // 先绘制所有地面瓦片
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const iso = cartesianToIsometric(x, y);
                const screenX = iso.x - cameraX + CONFIG.CANVAS_WIDTH / 2;
                const screenY = iso.y - cameraY + CONFIG.CANVAS_HEIGHT / 2;
                
                // 只绘制屏幕内的瓦片
                if (screenX + this.tileSize < 0 || screenX - this.tileSize > CONFIG.CANVAS_WIDTH ||
                    screenY + this.tileHeight < 0 || screenY - this.tileHeight > CONFIG.CANVAS_HEIGHT) {
                    continue;
                }
                
                const tile = this.tiles[y][x];
                
                // 绘制地面
                this.drawTile(ctx, screenX, screenY, tile);
            }
        }
    }
    
    // 绘制单个等轴测瓦片
    drawTile(ctx, x, y, tile) {
        ctx.save();
        ctx.translate(x, y);
        
        // 绘制菱形地面
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.tileSize / 2, this.tileHeight / 2);
        ctx.lineTo(0, this.tileHeight);
        ctx.lineTo(-this.tileSize / 2, this.tileHeight / 2);
        ctx.closePath();
        
        switch (tile) {
            case 0: // 草地
                ctx.fillStyle = '#4a7c59';
                ctx.fill();
                ctx.strokeStyle = '#3d6b4a';
                ctx.stroke();
                break;
                
            case 4: // 水
                ctx.fillStyle = '#2196f3';
                ctx.fill();
                ctx.strokeStyle = '#1976d2';
                ctx.stroke();
                // 水波纹
                ctx.strokeStyle = '#64b5f6';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-this.tileSize / 4, this.tileHeight / 4);
                ctx.lineTo(this.tileSize / 4, this.tileHeight / 4);
                ctx.moveTo(-this.tileSize / 4, this.tileHeight * 3 / 4);
                ctx.lineTo(this.tileSize / 4, this.tileHeight * 3 / 4);
                ctx.stroke();
                break;
                
            case 5: // 建筑地板
                ctx.fillStyle = '#d7ccc8';
                ctx.fill();
                ctx.strokeStyle = '#bcaaa4';
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }
    
    // 绘制立体物体（树、石头、建筑）
    drawObjects(ctx, cameraX, cameraY) {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        // 按Y轴顺序绘制，实现遮挡
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const iso = cartesianToIsometric(x, y);
                const screenX = iso.x - cameraX + CONFIG.CANVAS_WIDTH / 2;
                const screenY = iso.y - cameraY + CONFIG.CANVAS_HEIGHT / 2;
                
                if (screenX + this.tileSize < 0 || screenX - this.tileSize > CONFIG.CANVAS_WIDTH ||
                    screenY + this.tileHeight * 3 < 0 || screenY - this.tileHeight * 3 > CONFIG.CANVAS_HEIGHT) {
                    continue;
                }
                
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
                
                if (isUnexploredIndoor) continue;
                
                // 绘制立体物体
                switch (tile) {
                    case 1: // 墙
                        this.drawWall(ctx, screenX, screenY);
                        break;
                        
                    case 2: // 树
                        this.drawTree(ctx, screenX, screenY);
                        break;
                        
                    case 3: // 石头
                        this.drawRock(ctx, screenX, screenY);
                        break;
                }
            }
        }
        
        // 绘制建筑屋顶（在所有物体之后）
        this.drawBuildingRoofs(ctx, cameraX, cameraY);
    }
    
    // 绘制立体墙
    drawWall(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        // 墙的高度
        const wallHeight = 40;
        
        // 左侧面
        ctx.fillStyle = '#6d4c41';
        ctx.beginPath();
        ctx.moveTo(-this.tileSize / 2, this.tileHeight / 2);
        ctx.lineTo(-this.tileSize / 2, this.tileHeight / 2 - wallHeight);
        ctx.lineTo(0, -wallHeight);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        // 右侧面
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.moveTo(this.tileSize / 2, this.tileHeight / 2);
        ctx.lineTo(this.tileSize / 2, this.tileHeight / 2 - wallHeight);
        ctx.lineTo(0, -wallHeight);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        // 顶面
        ctx.fillStyle = '#a1887f';
        ctx.beginPath();
        ctx.moveTo(0, -wallHeight);
        ctx.lineTo(this.tileSize / 2, this.tileHeight / 2 - wallHeight);
        ctx.lineTo(0, this.tileHeight - wallHeight);
        ctx.lineTo(-this.tileSize / 2, this.tileHeight / 2 - wallHeight);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // 绘制立体树
    drawTree(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        // 树干
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-4, -20, 8, 30);
        
        // 树冠（三层）
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(0, -40, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(-8, -30, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(8, -35, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#43a047';
        ctx.beginPath();
        ctx.arc(0, -25, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 绘制立体石头
    drawRock(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        // 石头主体
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-8, -15);
        ctx.lineTo(5, -20);
        ctx.lineTo(15, -10);
        ctx.lineTo(12, 0);
        ctx.closePath();
        ctx.fill();
        
        // 石头阴影
        ctx.fillStyle = '#757575';
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-8, -15);
        ctx.lineTo(0, -10);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // 绘制建筑屋顶
    drawBuildingRoofs(ctx, cameraX, cameraY) {
        for (const building of this.buildings) {
            if (building.explored) continue; // 已探索的建筑不显示屋顶
            
            const startTileX = Math.floor(building.x / this.tileSize);
            const startTileY = Math.floor(building.y / this.tileSize);
            const endTileX = Math.floor((building.x + building.width) / this.tileSize);
            const endTileY = Math.floor((building.y + building.height) / this.tileSize);
            
            // 计算建筑中心的等轴测坐标
            const centerX = (startTileX + endTileX) / 2;
            const centerY = (startTileY + endTileY) / 2;
            const iso = cartesianToIsometric(centerX, centerY);
            const screenX = iso.x - cameraX + CONFIG.CANVAS_WIDTH / 2;
            const screenY = iso.y - cameraY + CONFIG.CANVAS_HEIGHT / 2;
            
            // 建筑尺寸
            const width = (endTileX - startTileX) * this.tileSize / 2;
            const height = (endTileY - startTileY) * this.tileHeight / 2;
            const roofHeight = 60;
            
            ctx.save();
            ctx.translate(screenX, screenY);
            
            // 绘制屋顶
            ctx.fillStyle = '#5d4037';
            ctx.beginPath();
            ctx.moveTo(0, -roofHeight);
            ctx.lineTo(width, height - roofHeight);
            ctx.lineTo(0, height * 2 - roofHeight);
            ctx.lineTo(-width, height - roofHeight);
            ctx.closePath();
            ctx.fill();
            
            // 屋顶边缘
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制门的标记
            ctx.fillStyle = '#795548';
            ctx.fillRect(-10, height - 10, 20, 20);
            
            ctx.restore();
        }
    }
    
    // 绘制撤离点
    drawExtractionPoints(ctx, cameraX, cameraY) {
        ctx.fillStyle = `rgba(76, 175, 80, ${0.5 + Math.sin(Date.now() / 500) * 0.3})`;
        
        this.extractionPoints.forEach(point => {
            const tileX = point.x / this.tileSize;
            const tileY = point.y / this.tileSize;
            const iso = cartesianToIsometric(tileX, tileY);
            const screenX = iso.x - cameraX + CONFIG.CANVAS_WIDTH / 2;
            const screenY = iso.y - cameraY + CONFIG.CANVAS_HEIGHT / 2;
            
            // 绘制菱形撤离点
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - this.tileHeight);
            ctx.lineTo(screenX + this.tileSize, screenY);
            ctx.lineTo(screenX, screenY + this.tileHeight);
            ctx.lineTo(screenX - this.tileSize, screenY);
            ctx.closePath();
            ctx.fill();
            
            // 撤离点文字
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('撤离点', screenX, screenY + 5);
        });
    }
}
