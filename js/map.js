class Map {
    constructor() {
        this.width = CONFIG.MAP_WIDTH;
        this.height = CONFIG.MAP_HEIGHT;
        this.tileSize = CONFIG.TILE_SIZE;       // 64
        this.tileHeight = CONFIG.TILE_HEIGHT;   // 32
        
        // 地图数据：0=草地, 1=墙, 2=树, 3=石头, 4=水, 5=建筑地板, 6=门, 7=桥
        this.tiles = [];
        this.walls = [];
        this.buildings = [];
        this.extractionPoints = [];
        
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
        
        // 生成桥梁（使用新的桥 tile 类型）
        for (let i = 0; i < 3; i++) {
            const bridgeX = randomInt(Math.floor(cols * 0.2), Math.floor(cols * 0.8));
            const centerY = riverY + Math.floor(Math.sin(bridgeX * 0.2) * 2);
            for (let dy = -1; dy <= 1; dy++) {
                const y = centerY + dy;
                if (y > 1 && y < rows - 2 && this.tiles[y][bridgeX] === 4) {
                    this.tiles[y][bridgeX] = 7;   // 桥
                }
            }
        }
        
        // 生成树林（跳过水、桥）
        for (let y = 2; y < rows - 2; y++) {
            for (let x = 2; x < cols - 2; x++) {
                if (this.tiles[y][x] === 0 && Math.random() < 0.06) {
                    this.tiles[y][x] = 2;
                }
            }
        }
        
        // 生成石头（跳过水、桥）
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
                        if (this.tiles[startY + y][startX + x] === 4 ||
                            this.tiles[startY + y][startX + x] === 7) {
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
                        startTileX: startX,
                        startTileY: startY,
                        endTileX: startX + templateWidth,
                        endTileY: startY + templateHeight,
                        entered: false,
                        template: template
                    });
                    placed = true;
                }
                
                attempts++;
            }
        }
    }
    
    // 小木屋模板（6x6）
    createSmallHouseTemplate() {
        return [
            [1,1,1,1,1,1],
            [1,5,5,5,5,1],
            [1,5,5,5,5,1],
            [1,5,5,5,5,1],
            [1,5,5,5,5,1],
            [1,1,1,6,1,1]
        ];
    }
    
    // 大仓库模板（8x8）
    createWarehouseTemplate() {
        return [
            [1,1,1,1,1,1,1,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,1,1,5,5,1],
            [1,5,5,1,1,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,5,5,5,5,5,5,1],
            [1,1,1,6,6,1,1,1]
        ];
    }
    
    // 两层楼房模板（8x10）
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
            [1,1,1,6,6,1,1,1]
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
    
    // 构建碰撞体列表（桥7不算障碍，墙、树、石头、水阻挡）
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
    
    // 碰撞检测
    isColliding(rect) {
        return this.walls.some(wall => rectCollision(rect, wall));
    }
    
    // 检测玩家是否在建筑内
    updatePlayerInBuilding(playerX, playerY) {
        for (const building of this.buildings) {
            building.entered = (
                playerX > building.x && playerX < building.x + building.width &&
                playerY > building.y && playerY < building.y + building.height
            );
        }
    }
    
    // 绘制等轴测地图地面
    draw(ctx, cameraX, cameraY) {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const isoX = (x - y) * (this.tileSize / 2);
                const isoY = (x + y) * (this.tileHeight / 2);
                
                const screenX = isoX - cameraX + CONFIG.CANVAS_WIDTH / 2;
                const screenY = isoY - cameraY + CONFIG.CANVAS_HEIGHT / 2;
                
                // 视口裁剪
                if (screenX + this.tileSize < 0 || screenX - this.tileSize > CONFIG.CANVAS_WIDTH ||
                    screenY + this.tileHeight < 0 || screenY - this.tileHeight > CONFIG.CANVAS_HEIGHT) {
                    continue;
                }
                
                const tile = this.tiles[y][x];
                this.drawTile(ctx, screenX, screenY, tile);
            }
        }
    }
    
    // 绘制单个等轴测瓦片地面
    drawTile(ctx, x, y, tile) {
        ctx.save();
        ctx.translate(x, y);
        
        ctx.beginPath();
        ctx.moveTo(0, -this.tileHeight / 2);
        ctx.lineTo(this.tileSize / 2, 0);
        ctx.lineTo(0, this.tileHeight / 2);
        ctx.lineTo(-this.tileSize / 2, 0);
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
                ctx.moveTo(-this.tileSize / 4, -this.tileHeight / 4);
                ctx.lineTo(this.tileSize / 4, -this.tileHeight / 4);
                ctx.moveTo(-this.tileSize / 4, this.tileHeight / 4);
                ctx.lineTo(this.tileSize / 4, this.tileHeight / 4);
                ctx.stroke();
                break;
                
            case 5: // 建筑地板
                ctx.fillStyle = '#d7ccc8';
                ctx.fill();
                ctx.strokeStyle = '#bcaaa4';
                ctx.stroke();
                break;
                
            case 6: // 门
                ctx.fillStyle = '#d7ccc8';
                ctx.fill();
                ctx.strokeStyle = '#bcaaa4';
                ctx.stroke();
                break;
                
            case 7: // 桥面（木板质感）
                ctx.fillStyle = '#8d6e63';
                ctx.fill();
                ctx.strokeStyle = '#5d4037';
                ctx.lineWidth = 2;
                ctx.stroke();
                // 木板纹路
                ctx.strokeStyle = '#a1887f';
                ctx.lineWidth = 1;
                for (let i = -1; i <= 1; i++) {
                    ctx.beginPath();
                    ctx.moveTo(-this.tileSize / 4 + i * 8, -this.tileHeight / 4);
                    ctx.lineTo(this.tileSize / 4 + i * 8, this.tileHeight / 4);
                    ctx.stroke();
                }
                break;
        }
        
        ctx.restore();
    }
    
    // 绘制所有立体物体（树、石头、建筑等）
    drawObjects(ctx, cameraX, cameraY) {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const isoX = (x - y) * (this.tileSize / 2);
                const isoY = (x + y) * (this.tileHeight / 2);
                
                const screenX = isoX - cameraX + CONFIG.CANVAS_WIDTH / 2;
                const screenY = isoY - cameraY + CONFIG.CANVAS_HEIGHT / 2;
                
                if (screenX + this.tileSize < 0 || screenX - this.tileSize > CONFIG.CANVAS_WIDTH ||
                    screenY + this.tileHeight * 3 < 0 || screenY - this.tileHeight * 3 > CONFIG.CANVAS_HEIGHT) {
                    continue;
                }
                
                const tile = this.tiles[y][x];
                
                let buildingAlpha = 1;
                for (const building of this.buildings) {
                    if (x >= building.startTileX && x < building.endTileX &&
                        y >= building.startTileY && y < building.endTileY) {
                        buildingAlpha = building.entered ? 0.5 : 1;
                        break;
                    }
                }
                
                switch (tile) {
                    case 1: // 墙
                        this.drawWall(ctx, screenX, screenY, buildingAlpha);
                        break;
                    case 2: // 树
                        this.drawTree(ctx, screenX, screenY);
                        break;
                    case 3: // 石头
                        this.drawRock(ctx, screenX, screenY);
                        break;
                    case 6: // 门
                        this.drawDoor(ctx, screenX, screenY, buildingAlpha);
                        break;
                    case 7: // 桥立体结构
                        this.drawBridge(ctx, screenX, screenY);
                        break;
                }
            }
        }
        
        // 最后绘制屋顶（平顶）
        this.drawBuildingRoofs(ctx, cameraX, cameraY);
    }
    
    // 绘制立体墙（增加轮廓线让三个面更清晰）
    drawWall(ctx, x, y, alpha = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = alpha;
        
        const wallHeight = 40;
        
        // 左侧面
        ctx.fillStyle = '#6d4c41';
        ctx.beginPath();
        ctx.moveTo(-this.tileSize / 2, 0);
        ctx.lineTo(-this.tileSize / 2, -wallHeight);
        ctx.lineTo(0, -wallHeight - this.tileHeight / 2);
        ctx.lineTo(0, -this.tileHeight / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#4e342e';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // 右侧面
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath();
        ctx.moveTo(this.tileSize / 2, 0);
        ctx.lineTo(this.tileSize / 2, -wallHeight);
        ctx.lineTo(0, -wallHeight - this.tileHeight / 2);
        ctx.lineTo(0, -this.tileHeight / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#5d4037';
        ctx.stroke();
        
        // 顶面
        ctx.fillStyle = '#a1887f';
        ctx.beginPath();
        ctx.moveTo(0, -wallHeight - this.tileHeight / 2);
        ctx.lineTo(this.tileSize / 2, -wallHeight);
        ctx.lineTo(0, -wallHeight + this.tileHeight / 2);
        ctx.lineTo(-this.tileSize / 2, -wallHeight);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#8d6e63';
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 绘制门（与原版基本一致）
    drawDoor(ctx, x, y, alpha = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = alpha;
        
        const doorHeight = 50;
        
        // 门框
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-12, -doorHeight, 24, doorHeight);
        
        // 门板
        ctx.fillStyle = '#795548';
        ctx.fillRect(-10, -doorHeight + 2, 20, doorHeight - 2);
        
        // 门把手
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.arc(6, -doorHeight / 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 绘制立体树
    drawTree(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        // 树干
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-4, -30, 8, 30);
        
        // 树冠
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(0, -50, 20, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(-8, -40, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(8, -45, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#43a047';
        ctx.beginPath();
        ctx.arc(0, -35, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    // 绘制立体石头（底部与地面齐平）
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
    
    // 绘制桥的立体结构（桥面厚度 + 栏杆）
    drawBridge(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        const bridgeThickness = 8;
        
        // 桥面侧面（左侧下方可见）
        ctx.fillStyle = '#5d4037';
        ctx.beginPath();
        ctx.moveTo(-this.tileSize / 2, 0);
        ctx.lineTo(-this.tileSize / 2, -bridgeThickness);
        ctx.lineTo(0, -bridgeThickness - this.tileHeight / 2);
        ctx.lineTo(0, -this.tileHeight / 2);
        ctx.closePath();
        ctx.fill();
        
        // 桥面侧面（右侧下方可见）
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.moveTo(this.tileSize / 2, 0);
        ctx.lineTo(this.tileSize / 2, -bridgeThickness);
        ctx.lineTo(0, -bridgeThickness - this.tileHeight / 2);
        ctx.lineTo(0, -this.tileHeight / 2);
        ctx.closePath();
        ctx.fill();
        
        const railHeight = 18;
        
        // 栏杆柱子（三个点：左角、右角、顶部中心）
        const corners = [
            { dx: -this.tileSize / 2, dy: 0 },
            { dx: this.tileSize / 2, dy: 0 },
            { dx: 0, dy: -this.tileHeight / 2 },
        ];
        
        corners.forEach(c => {
            ctx.fillStyle = '#4e342e';
            ctx.fillRect(c.dx - 2, c.dy - bridgeThickness - railHeight, 4, railHeight);
        });
        
        // 横向栏杆
        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;
        ctx.beginPath();
        corners.forEach((c, i) => {
            const railY = c.dy - bridgeThickness - railHeight + 2;
            if (i === 0) ctx.moveTo(c.dx, railY);
            else ctx.lineTo(c.dx, railY);
        });
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 绘制建筑平顶（替代原来的尖顶）
    drawBuildingRoofs(ctx, cameraX, cameraY) {
        for (const building of this.buildings) {
            const alpha = building.entered ? 0.3 : 1;
            
            const x1 = building.startTileX;
            const y1 = building.startTileY;
            const x2 = building.endTileX - 1;
            const y2 = building.startTileY;
            const x3 = building.endTileX - 1;
            const y3 = building.endTileY - 1;
            const x4 = building.startTileX;
            const y4 = building.endTileY - 1;
            
            const getScreenPos = (tx, ty) => {
                const isoX = (tx - ty) * (this.tileSize / 2);
                const isoY = (tx + ty) * (this.tileHeight / 2);
                return {
                    x: isoX - cameraX + CONFIG.CANVAS_WIDTH / 2,
                    y: isoY - cameraY + CONFIG.CANVAS_HEIGHT / 2
                };
            };
            
            const p1 = getScreenPos(x1, y1);
            const p2 = getScreenPos(x2, y2);
            const p3 = getScreenPos(x3, y3);
            const p4 = getScreenPos(x4, y4);
            
            const roofHeightOffset = 40; // 与墙壁高度一致
            
            // 四个平屋顶角
            const r1 = { x: p1.x, y: p1.y - roofHeightOffset };
            const r2 = { x: p2.x, y: p2.y - roofHeightOffset };
            const r3 = { x: p3.x, y: p3.y - roofHeightOffset };
            const r4 = { x: p4.x, y: p4.y - roofHeightOffset };
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            // 平顶主体
            ctx.fillStyle = '#5d4037';
            ctx.beginPath();
            ctx.moveTo(r1.x, r1.y);
            ctx.lineTo(r2.x, r2.y);
            ctx.lineTo(r3.x, r3.y);
            ctx.lineTo(r4.x, r4.y);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 烟囱
            ctx.fillStyle = '#795548';
            const chimneyX = r1.x + (r2.x - r1.x) * 0.3;
            const chimneyY = r1.y - 15;
            ctx.fillRect(chimneyX - 5, chimneyY, 10, 20);
            ctx.strokeStyle = '#4e342e';
            ctx.lineWidth = 1;
            ctx.strokeRect(chimneyX - 5, chimneyY, 10, 20);
            
            ctx.restore();
        }
    }
    
    // 绘制撤离点
    drawExtractionPoints(ctx, cameraX, cameraY) {
        ctx.fillStyle = `rgba(76, 175, 80, ${0.5 + Math.sin(Date.now() / 500) * 0.3})`;
        
        this.extractionPoints.forEach(point => {
            const tileX = point.x / this.tileSize;
            const tileY = point.y / this.tileSize;
            
            const isoX = (tileX - tileY) * (this.tileSize / 2);
            const isoY = (tileX + tileY) * (this.tileHeight / 2);
            
            const screenX = isoX - cameraX + CONFIG.CANVAS_WIDTH / 2;
            const screenY = isoY - cameraY + CONFIG.CANVAS_HEIGHT / 2;
            
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - this.tileHeight);
            ctx.lineTo(screenX + this.tileSize, screenY);
            ctx.lineTo(screenX, screenY + this.tileHeight);
            ctx.lineTo(screenX - this.tileSize, screenY);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('撤离点', screenX, screenY + 5);
        });
    }
}
