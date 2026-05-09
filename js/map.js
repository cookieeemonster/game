class Map {
    constructor() {
        this.width = CONFIG.MAP_WIDTH;
        this.height = CONFIG.MAP_HEIGHT;
        this.tileSize = CONFIG.TILE_SIZE; // 64
        this.tileHeight = CONFIG.TILE_HEIGHT; // 32
        
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
    
    initializeEmptyMap() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        for (let y = 0; y < rows; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < cols; x++) {
                this.tiles[y][x] = (x === 0 || x === cols-1 || y === 0 || y === rows-1) ? 1 : 0;
            }
        }
    }
    
    generateNaturalTerrain() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        const riverY = randomInt(Math.floor(rows*0.3), Math.floor(rows*0.7));

        // 河流
        for (let x = 2; x < cols-2; x++) {
            const offset = Math.floor(Math.sin(x * 0.2) * 2);
            for (let dy = -1; dy <= 1; dy++) {
                const y = riverY + offset + dy;
                if (y > 1 && y < rows-2) this.tiles[y][x] = 4;
            }
        }

        // 桥梁
        for (let i = 0; i < 3; i++) {
            const bridgeX = randomInt(Math.floor(cols*0.2), Math.floor(cols*0.8));
            for (let dy = -1; dy <= 1; dy++) {
                const y = riverY + Math.floor(Math.sin(bridgeX*0.2)*2) + dy;
                if (y > 1 && y < rows-2) this.tiles[y][bridgeX] = 7;
            }
        }

        // 树 & 石头
        for (let y = 2; y < rows-2; y++) {
            for (let x = 2; x < cols-2; x++) {
                if (this.tiles[y][x] === 0 && Math.random() < 0.06) this.tiles[y][x] = 2;
                if (this.tiles[y][x] === 0 && Math.random() < 0.02) this.tiles[y][x] = 3;
            }
        }
    }
    
    generateBuildings() {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        const templates = [
            this.createSmallHouseTemplate(),
            this.createWarehouseTemplate(),
            this.createTwoStoryHouseTemplate()
        ];

        for (let i = 0; i < 5; i++) {
            const t = templates[randomInt(0, templates.length-1)];
            const w = t[0].length, h = t.length;
            let placed = false, attempts = 0;

            while (!placed && attempts < 100) {
                const sx = randomInt(5, cols - w -5);
                const sy = randomInt(5, rows - h -5);
                let ok = true;
                for (let y=0;y<h;y++)for(let x=0;x<w;x++){if(this.tiles[sy+y][sx+x]===4)ok=false;}
                if(ok){
                    this.placeBuilding(t,sx,sy);
                    this.buildings.push({
                        startTileX:sx, startTileY:sy,
                        endTileX:sx+w, endTileY:sy+h,
                        entered:false
                    });
                    placed=true;
                }
                attempts++;
            }
        }
    }
    
    createSmallHouseTemplate(){return[[1,1,1,1,1,1],[1,5,5,5,5,1],[1,5,5,5,5,1],[1,5,5,5,5,1],[1,5,5,5,5,1],[1,1,1,6,1,1]];}
    createWarehouseTemplate(){return[[1,1,1,1,1,1,1,1],[1,5,5,5,5,5,5,1],[1,5,5,5,5,5,5,1],[1,5,5,1,1,5,5,1],[1,5,5,1,1,5,5,1],[1,5,5,5,5,5,5,1],[1,5,5,5,5,5,5,1],[1,1,1,6,6,1,1,1]];}
    createTwoStoryHouseTemplate(){return[[1,1,1,1,1,1,1,1],[1,5,5,1,1,5,5,1],[1,5,5,1,1,5,5,1],[1,5,5,5,5,5,5,1],[1,5,5,5,5,5,5,1],[1,1,1,5,5,1,1,1],[1,5,5,5,5,5,5,1],[1,5,5,5,5,5,5,1],[1,5,5,1,1,5,5,1],[1,1,1,6,6,1,1,1]];}
    placeBuilding(t,sx,sy){for(let y=0;y<t.length;y++)for(let x=0;x<t[0].length;x++)this.tiles[sy+y][sx+x]=t[y][x];}
    
    // ==============================================
    // 【修复5：碰撞箱与实物完全对齐】
    // ==============================================
    buildCollisionList() {
        this.walls = [];
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const tile = this.tiles[y][x];
                if (tile === 1 || tile === 2 || tile === 3 || tile === 4) {
                    // 碰撞箱与瓦片位置完全对齐
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
    
    isColliding(rect) {
        return this.walls.some(wall => rectCollision(rect, wall));
    }
    
    updatePlayerInBuilding(playerX, playerY) {
        for (const building of this.buildings) {
            building.entered = (
                playerX > building.startTileX * this.tileSize && 
                playerX < building.endTileX * this.tileSize &&
                playerY > building.startTileY * this.tileSize && 
                playerY < building.endTileY * this.tileSize
            );
        }
    }
    
    getScreenXY(tileX, tileY, cameraX, cameraY) {
        const isoX = (tileX - tileY) * (this.tileSize / 2);
        const isoY = (tileX + tileY) * (this.tileHeight / 2);
        return {
            x: isoX - cameraX + CONFIG.CANVAS_WIDTH / 2,
            y: isoY - cameraY + CONFIG.CANVAS_HEIGHT / 2
        };
    }
    
    // 绘制地面层（包括桥）
    drawGround(ctx, cameraX, cameraY) {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const screen = this.getScreenXY(x, y, cameraX, cameraY);
                
                if (screen.x + this.tileSize < 0 || screen.x - this.tileSize > CONFIG.CANVAS_WIDTH ||
                    screen.y + this.tileHeight < 0 || screen.y - this.tileHeight > CONFIG.CANVAS_HEIGHT) {
                    continue;
                }
                
                const tile = this.tiles[y][x];
                this.drawTile(ctx, screen.x, screen.y, tile);
            }
        }
    }
    
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
                
            case 7: // 桥（现在在地面层绘制，在人下面）
                ctx.fillStyle = '#8B4513';
                ctx.fill();
                ctx.strokeStyle = '#5D2906';
                ctx.stroke();
                // 木板纹理
                ctx.strokeStyle = '#3a1a03';
                ctx.lineWidth = 1;
                for (let i = -8; i <= 8; i += 4) {
                    ctx.beginPath();
                    ctx.moveTo(-this.tileSize/2 + i, 0);
                    ctx.lineTo(this.tileSize/2 + i, 0);
                    ctx.stroke();
                }
                break;
        }
        
        ctx.restore();
    }
    
    // 绘制立体物体层（墙、树、石头、门）
    drawObjects(ctx, cameraX, cameraY) {
        const cols = Math.floor(this.width / this.tileSize);
        const rows = Math.floor(this.height / this.tileSize);
        
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const screen = this.getScreenXY(x, y, cameraX, cameraY);
                
                if (screen.x + this.tileSize < 0 || screen.x - this.tileSize > CONFIG.CANVAS_WIDTH ||
                    screen.y + this.tileHeight * 3 < 0 || screen.y - this.tileHeight * 3 > CONFIG.CANVAS_HEIGHT) {
                    continue;
                }
                
                const tile = this.tiles[y][x];
                
                // 检查是否在已进入的建筑内
                let buildingAlpha = 1;
                for (const building of this.buildings) {
                    if (x >= building.startTileX && x < building.endTileX &&
                        y >= building.startTileY && y < building.endTileY) {
                        buildingAlpha = building.entered ? 0.4 : 1;
                        break;
                    }
                }
                
                switch (tile) {
                    case 1: // 墙（完整立方体，无黑色遮挡）
                        this.drawFullCubeWall(ctx, screen.x, screen.y, buildingAlpha);
                        break;
                        
                    case 2: // 树
                        this.drawTree(ctx, screen.x, screen.y);
                        break;
                        
                    case 3: // 石头（完全落地）
                        this.drawRock(ctx, screen.x, screen.y);
                        break;
                        
                    case 6: // 门
                        this.drawDoor(ctx, screen.x, screen.y, buildingAlpha);
                        break;
                }
            }
        }
    }
    
    // ==============================================
    // 【修复2：墙壁无黑色遮挡】
    // ==============================================
    drawFullCubeWall(ctx, x, y, alpha = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.globalAlpha = alpha;
    
    const wallHeight = 42;
    const W = this.tileSize / 2;
    const H = this.tileHeight / 2;
    
    // 1. 先绘制后面（被挡住的面，防止底部漏黑）
    ctx.fillStyle = '#5d4037';
    ctx.beginPath();
    ctx.moveTo(-W, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, -wallHeight);
    ctx.lineTo(-W, -wallHeight);
    ctx.closePath();
    ctx.fill();
    
    // 2. 绘制右前侧面（亮面）
    ctx.fillStyle = '#8d6e63';
    ctx.beginPath();
    ctx.moveTo(W, 0);
    ctx.lineTo(W, -wallHeight);
    ctx.lineTo(0, -wallHeight - H);
    ctx.lineTo(0, -H);
    ctx.closePath();
    ctx.fill();
    
    // 3. 绘制左前侧面（暗面）
    ctx.fillStyle = '#6d4c41';
    ctx.beginPath();
    ctx.moveTo(-W, 0);
    ctx.lineTo(-W, -wallHeight);
    ctx.lineTo(0, -wallHeight - H);
    ctx.lineTo(0, -H);
    ctx.closePath();
    ctx.fill();
    
    // 4. 绘制顶面
    ctx.fillStyle = '#a1887f';
    ctx.beginPath();
    ctx.moveTo(0, -wallHeight - H);
    ctx.lineTo(W, -wallHeight);
    ctx.lineTo(0, -wallHeight + H);
    ctx.lineTo(-W, -wallHeight);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}
    
    drawDoor(ctx, x, y, alpha = 1) {
        ctx.save();
        ctx.translate(x, y);
        ctx.globalAlpha = alpha;
        
        const doorHeight = 48;
        ctx.fillStyle = '#795548';
        ctx.fillRect(-10, -doorHeight, 20, doorHeight);
        ctx.fillStyle = '#ffc107';
        ctx.beginPath();
        ctx.arc(5, -doorHeight / 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawTree(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(-4, -32, 8, 32);
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(0, -55, 22, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawRock(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        
        ctx.fillStyle = '#9e9e9e';
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(-10, -18);
        ctx.lineTo(4, -24);
        ctx.lineTo(16, -14);
        ctx.lineTo(14, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#757575';
        ctx.beginPath();
        ctx.moveTo(-14, 0);
        ctx.lineTo(-10, -18);
        ctx.lineTo(0, -12);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // ==============================================
    // 【修复1：进入前屋顶完全不透明】
    // ==============================================
    drawFlatRoofs(ctx, cameraX, cameraY) {
        for (const building of this.buildings) {
            // 进入前完全不透明(alpha=1)，进入后半透明(alpha=0.3)
            const alpha = building.entered ? 0.3 : 1;
            
            const x1 = building.startTileX;
            const y1 = building.startTileY;
            const x2 = building.endTileX - 1;
            const y2 = building.endTileY - 1;
            
            const p1 = this.getScreenXY(x1, y1, cameraX, cameraY);
            const p2 = this.getScreenXY(x2, y1, cameraX, cameraY);
            const p3 = this.getScreenXY(x2, y2, cameraX, cameraY);
            const p4 = this.getScreenXY(x1, y2, cameraX, cameraY);
            
            ctx.save();
            ctx.globalAlpha = alpha;
            
            ctx.fillStyle = '#5d4037';
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y - 42);
            ctx.lineTo(p2.x, p2.y - 42);
            ctx.lineTo(p3.x, p3.y - 42);
            ctx.lineTo(p4.x, p4.y - 42);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = '#3e2723';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    drawExtractionPoints(ctx, cameraX, cameraY) {
        ctx.fillStyle = `rgba(76, 175, 80, ${0.5 + Math.sin(Date.now() / 500) * 0.3})`;
        
        this.extractionPoints.forEach(point => {
            const tileX = point.x / this.tileSize;
            const tileY = point.y / this.tileSize;
            
            const screen = this.getScreenXY(tileX, tileY, cameraX, cameraY);
            
            ctx.beginPath();
            ctx.moveTo(screen.x, screen.y - this.tileHeight);
            ctx.lineTo(screen.x + this.tileSize, screen.y);
            ctx.lineTo(screen.x, screen.y + this.tileHeight);
            ctx.lineTo(screen.x - this.tileSize, screen.y);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('撤离点', screen.x, screen.y + 5);
        });
    }
}
