// 游戏全局配置
const CONFIG = {
    // Canvas设置
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    
    // 玩家设置
    PLAYER_SPEED: 3,
    PLAYER_MAX_HEALTH: 100,
    PLAYER_START_AMMO: 30,
    
    // 敌人设置
    ENEMY_SPEED: 1.5,
    ENEMY_MAX_HEALTH: 50,
    ENEMY_DAMAGE: 10,
    ENEMY_SPAWN_COUNT: 10,
    
    // 地图设置
    MAP_WIDTH: 2560,
    MAP_HEIGHT: 1440,
    TILE_SIZE: 32,
    WALL_DENSITY: 0.3,
    
    // 游戏设置
    GAME_TICK: 16, // 约60FPS
    ITEM_SPAWN_COUNT: 10,
    EXTRACTION_POINT_COUNT: 2
        
    // 武器设置（新增）
    SWORD_DAMAGE: 25,
    SWORD_RANGE: 60,
    SWORD_ATTACK_COOLDOWN: 30 // 0.5秒攻击一次（60FPS）
};

// 游戏状态枚举
const GAME_STATE = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    WIN: 'win',
    LOSE: 'lose'
};
