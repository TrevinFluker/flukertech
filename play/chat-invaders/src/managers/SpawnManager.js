import { Enemy } from '../entities/Enemy.js';
import { 
    ENEMY_MIN_SPEED, 
    ENEMY_MAX_SPEED,
    ENEMY_MIN_HEALTH,
    ENEMY_MAX_HEALTH,
    ENEMY_MAX_COUNT,
    INITIAL_SPAWN_INTERVAL,
    GAME_WIDTH,
    BOSS_ENEMY_SPEED_MULTIPLIER,
    BOSS_ENEMY_DEFAULT_HEALTH,
    BOSS_ENEMY_MIN_HEALTH
} from '../utils/Constants.js';
import { randomInt, randomRange } from '../utils/Utils.js';

export class SpawnManager {
    constructor() {
        this.spawnTimer = 0;
        this.spawnInterval = INITIAL_SPAWN_INTERVAL;
    }

    update(deltaTime, enemies) {
        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= this.spawnInterval && enemies.length < ENEMY_MAX_COUNT) {
            this.spawnTimer = 0;
            return this.createEnemy();
        }
        
        return null;
    }

    createEnemy() {
        const x = randomRange(40, GAME_WIDTH - 80) + 40;
        const y = -60;
        const health = randomInt(ENEMY_MIN_HEALTH, ENEMY_MAX_HEALTH);
        const speed = randomRange(ENEMY_MIN_SPEED, ENEMY_MAX_SPEED);
        
        return new Enemy(x, y, health, speed, false, false);
    }

    createBossEnemy(health = BOSS_ENEMY_DEFAULT_HEALTH) {
        // Ensure minimum health
        const bossHealth = Math.max(health, BOSS_ENEMY_MIN_HEALTH);
        const x = GAME_WIDTH / 2; // Spawn in center
        const y = -80;
        const baseSpeed = randomRange(ENEMY_MIN_SPEED, ENEMY_MAX_SPEED);
        const speed = baseSpeed * BOSS_ENEMY_SPEED_MULTIPLIER;
        
        return new Enemy(x, y, bossHealth, speed, true, false);
    }

    createWeavingEnemy(health = ENEMY_MAX_HEALTH) {
        const x = GAME_WIDTH / 2; // Start in center
        const y = -60;
        const speed = randomRange(ENEMY_MIN_SPEED, ENEMY_MAX_SPEED);
        
        return new Enemy(x, y, health, speed, false, true);
    }

    reset() {
        this.spawnTimer = 0;
        this.spawnInterval = INITIAL_SPAWN_INTERVAL;
    }
}
