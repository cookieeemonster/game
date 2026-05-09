class UI {
    constructor(game) {
        this.game = game;
        this.uiLayer = document.getElementById('ui-layer');
    }
    
    update() {
        // 清空UI层
        this.uiLayer.innerHTML = '';
        
        // 绘制玩家血条
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        const healthFill = document.createElement('div');
        healthFill.className = 'health-fill';
        healthFill.style.width = `${(this.game.player.health / CONFIG.PLAYER_MAX_HEALTH) * 100}%`;
        healthBar.appendChild(healthFill);
        this.uiLayer.appendChild(healthBar);
        
        // 绘制武器信息
        const weaponText = document.createElement('div');
        weaponText.style.position = 'absolute';
        weaponText.style.top = '50px';
        weaponText.style.left = '20px';
        weaponText.style.fontSize = '20px';
        weaponText.textContent = `武器: ${this.game.player.weapon.name}`;
        this.uiLayer.appendChild(weaponText);
        
        // 绘制敌人数量
        const enemyText = document.createElement('div');
        enemyText.style.position = 'absolute';
        enemyText.style.top = '20px';
        enemyText.style.right = '20px';
        enemyText.style.fontSize = '20px';
        enemyText.textContent = `敌人: ${this.game.enemies.length}`;
        this.uiLayer.appendChild(enemyText);
        
        // 绘制撤离提示
        if (this.game.enemies.length === 0) {
            const extractText = document.createElement('div');
            extractText.style.position = 'absolute';
            extractText.style.top = '50%';
            extractText.style.left = '50%';
            extractText.style.transform = 'translate(-50%, -50%)';
            extractText.style.fontSize = '32px';
            extractText.style.color = '#4caf50';
            extractText.textContent = '所有敌人已清除！前往绿色撤离点！';
            this.uiLayer.appendChild(extractText);
        }
    }
}
