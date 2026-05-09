// 游戏全局配置
const CONFIG = {
    // Canvas设置
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    
    // 玩家设置
    PLAYER_SPEED: 3,
    PLAYER_MAX_HEALTH: 100,
    
    // 敌人设置
    ENEMY_SPEED: 1.5,
    ENEMY_MAX_HEALTH: 50,
    ENEMY_DAMAGE: 10,
    ENEMY_SPAWN_COUNT: 10,
    
    // 地图设置
    MAP_WIDTH: 3200,
    MAP_HEIGHT: 2400,
    TILE_SIZE: 64, // 等轴测瓦片尺寸（比之前大）
    TILE_HEIGHT: 32, // 等轴测瓦片高度
    
    // 游戏设置
    GAME_TICK: 16,
    ITEM_SPAWN_COUNT: 10,
    EXTRACTION_POINT_COUNT: 2,
    
    // 武器设置
    SWORD_DAMAGE: 25,
    SWORD_RANGE: 80,
    SWORD_ATTACK_COOLDOWN: 30
};

// 游戏状态枚举
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WIN: 'win',
    LOSE: 'lose'
};

// 方向枚举（8个方向）
const DIRECTION = {
    DOWN: 0,
    DOWN_RIGHT: 1,
    RIGHT: 2,
    UP_RIGHT: 3,
    UP: 4,
    UP_LEFT: 5,
    LEFT: 6,
    DOWN_LEFT: 7
};
