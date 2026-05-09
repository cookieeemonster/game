// 基础剑类武器
class Sword {
    constructor() {
        this.name = '铁剑';
        this.damage = CONFIG.SWORD_DAMAGE;
        this.range = CONFIG.SWORD_RANGE;
        this.attackCooldown = CONFIG.SWORD_ATTACK_COOLDOWN;
        this.currentCooldown = 0;
        this.isAttacking = false;
        this.attackAnimationFrame = 0;
        this.attackDirection = 0; // 攻击方向（弧度）
    }
    
    // 开始攻击
    startAttack(direction) {
        if (this.currentCooldown <= 0) {
            this.isAttacking = true;
            this.attackDirection = direction;
            this.attackAnimationFrame = 0;
            this.currentCooldown = this.attackCooldown;
            return true;
        }
        return false;
    }
    
    // 更新攻击状态
    update() {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
        
        if (this.isAttacking) {
            this.attackAnimationFrame++;
            // 攻击动画持续15帧
            if (this.attackAnimationFrame > 15) {
                this.isAttacking = false;
            }
        }
    }
    
    // 检测攻击是否命中敌人
    checkHit(playerX, playerY, enemy) {
        if (!this.isAttacking || this.attackAnimationFrame < 5 || this.attackAnimationFrame > 10) {
            return false;
        }
        
        const dist = distance(playerX, playerY, enemy.x, enemy.y);
        if (dist > this.range) {
            return false;
        }
        
        // 计算敌人是否在攻击扇形范围内
        const angleToEnemy = Math.atan2(enemy.y - playerY, enemy.x - playerX);
        let angleDiff = Math.abs(angleToEnemy - this.attackDirection);
        if (angleDiff > Math.PI) {
            angleDiff = 2 * Math.PI - angleDiff;
        }
        
        // 攻击扇形角度为90度
        return angleDiff < Math.PI / 2;
    }
    
    // 绘制武器攻击效果
    draw(ctx, playerX, playerY, cameraX, cameraY) {
        if (!this.isAttacking) return;
        
        const screenX = playerX - cameraX;
        const screenY = playerY - cameraY;
        
        // 计算攻击动画进度
        const progress = this.attackAnimationFrame / 15;
        const swingAngle = this.attackDirection - Math.PI / 4 + progress * Math.PI / 2;
        
        // 绘制剑刃
        ctx.save();
        ctx.translate(screenX, screenY);
        ctx.rotate(swingAngle);
        
        // 剑刃颜色渐变
        const gradient = ctx.createLinearGradient(0, 0, this.range, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0.3)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(10, -3);
        ctx.lineTo(this.range, -1);
        ctx.lineTo(this.range, 1);
        ctx.lineTo(10, 3);
        ctx.closePath();
        ctx.fill();
        
        // 绘制攻击光效
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 - progress * 0.5})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, this.range * progress, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        
        ctx.restore();
    }
}
