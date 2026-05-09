// 生成指定范围内的随机整数
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成指定范围内的随机浮点数
function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

// 计算两点之间的距离
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// 矩形碰撞检测
function rectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 限制数值在指定范围内
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// 笛卡尔坐标转等轴测屏幕坐标
function cartesianToIsometric(x, y) {
    return {
        x: (x - y) * (CONFIG.TILE_SIZE / 2),
        y: (x + y) * (CONFIG.TILE_HEIGHT / 2)
    };
}

// 等轴测屏幕坐标转笛卡尔坐标
function isometricToCartesian(screenX, screenY) {
    return {
        x: (screenX / (CONFIG.TILE_SIZE / 2) + screenY / (CONFIG.TILE_HEIGHT / 2)) / 2,
        y: (screenY / (CONFIG.TILE_HEIGHT / 2) - screenX / (CONFIG.TILE_SIZE / 2)) / 2
    };
}

// 计算两个点之间的曼哈顿距离（等轴测中更准确）
function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

// 根据角度获取方向枚举
function angleToDirection(angle) {
    // 将角度转换为0-2π
    angle = (angle + Math.PI * 2) % (Math.PI * 2);
    // 每个方向45度
    const step = Math.PI / 4;
    return Math.floor((angle + step / 2) / step) % 8;
}
