import { Vector2D } from '../utils/Vector2D.js';
import { 
    ENEMY_WIDTH, 
    ENEMY_HEIGHT, 
    ENEMY_MIN_SPEED, 
    ENEMY_MAX_SPEED,
    GAME_HEIGHT,
    GAME_WIDTH,
    BOSS_ENEMY_SIZE_MULTIPLIER,
    WEAVING_ENEMY_AMPLITUDE,
    WEAVING_ENEMY_FREQUENCY,
    WEAVING_ENEMY_ROTATION_FACTOR
} from '../utils/Constants.js';
import { randomRange } from '../utils/Utils.js';

export class Enemy {
    constructor(x, y, health, speed, isBoss = false, isWeaving = false) {
        this.position = new Vector2D(x, y);
        this.isBoss = isBoss;
        this.isWeaving = isWeaving;
        this.sizeMultiplier = isBoss ? BOSS_ENEMY_SIZE_MULTIPLIER : 1;
        this.width = ENEMY_WIDTH * this.sizeMultiplier;
        this.height = ENEMY_HEIGHT * this.sizeMultiplier;
        this.speed = speed;
        this.health = health;
        this.maxHealth = health;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.active = true;
        
        // Weaving behavior
        if (isWeaving) {
            this.startX = x;
            this.waveOffset = Math.random() * Math.PI * 2; // Random start in sine wave
            this.previousX = x;
            this.name = '@WEAVER' + Math.floor(Math.random() * 99);
        } else if (isBoss) {
            this.name = '@BOSS' + Math.floor(Math.random() * 99);
        } else {
            this.name = '@TestUser' + Math.floor(Math.random() * 999);
        }
    }

    update() {
        this.position.y += this.speed;
        
        // Weaving behavior
        if (this.isWeaving) {
            const wavePhase = this.position.y * WEAVING_ENEMY_FREQUENCY + this.waveOffset;
            const targetX = this.startX + Math.sin(wavePhase) * WEAVING_ENEMY_AMPLITUDE;
            
            // Clamp to screen bounds
            const clampedX = Math.max(40, Math.min(GAME_WIDTH - 40, targetX));
            
            // Calculate horizontal velocity for rotation
            const deltaX = clampedX - this.previousX;
            this.previousX = clampedX;
            
            // Rotate based on horizontal movement direction
            this.rotation = deltaX * WEAVING_ENEMY_ROTATION_FACTOR;
            
            this.position.x = clampedX;
        } else {
            // Regular enemies stay upright
            this.rotation = 0;
        }
        
        // Deactivate if off screen (bottom)
        if (this.position.y > GAME_HEIGHT + 50) {
            this.active = false;
            return false; // Signals game over
        }
        
        return true; // Still in play
    }

    takeDamage() {
        this.health--;
        return this.health <= 0;
    }

    getCollisionRadius() {
        return 25 * this.sizeMultiplier; // Approximate collision radius scaled by size
    }

    isDestroyed() {
        return this.health <= 0;
    }
}
