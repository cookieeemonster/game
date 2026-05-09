class Sword {
    constructor() {
        this.name = '铁剑';
        this.damage = CONFIG.SWORD_DAMAGE;
        this.range = CONFIG.SWORD_RANGE;
        this.attackCooldown = CONFIG.SWORD_ATTACK_COOLDOWN;
        this.currentCooldown = 0;
        this.isAttacking = false;
        this.attackAnimationFrame = 0;
        this.attackDirection = 0;
    }
    
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
    
    update() {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
        
        if (this.isAttacking) {
            this.attackAnimationFrame++;
            if (this.attackAnimationFrame > 15) {
                this.isAttacking = false;
            }
        }
    }
    
    checkHit(playerX, playerY, enemy) {
        if (!this.isAttacking || this.attackAnimationFrame < 5 || this.attackAnimationFrame > 10) {
            return false;
        }
        
        const dist = distance(playerX, playerY, enemy.x, enemy.y);
        if (dist > this.range) {
            return false;
        }
        
        const angleToEnemy = Math.atan2(enemy.y - playerY, enemy.x - playerX);
        let angleDiff = Math.abs(angleToEnemy - this.attackDirection);
        if (angleDiff > Math.PI) {
            angleDiff = 2 * Math.PI - angleDiff;
        }
        
        return angleDiff < Math.PI / 2;
    }
    
    draw(ctx, playerX, playerY, cameraX, cameraY) {
        if (!this.isAttacking) return;
        
        const progress = this.attackAnimationFrame / 15;
        const swingAngle = this.attackDirection - Math.PI / 4 + progress * Math.PI / 2;
        
        ctx.save();
        ctx.rotate(swingAngle);
        
        // 剑刃
        const gradient = ctx.createLinearGradient(0, 0, this.range, 0);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(1, 'rgba(200, 200, 200, 0.4)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(10, -4);
        ctx.lineTo(this.range, -1);
        ctx.lineTo(this.range, 1);
        ctx.lineTo(10, 4);
        ctx.closePath();
        ctx.fill();
        
        // 攻击光效
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 - progress * 0.6})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.range * progress, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
        
        ctx.restore();
    }
}
