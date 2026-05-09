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
