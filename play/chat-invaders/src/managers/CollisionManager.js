import { Vector2D } from '../utils/Vector2D.js';

// CollisionManager handles all collision detection
export class CollisionManager {
    constructor() {
        this.collisionCallbacks = {
            bulletEnemy: null
        };
    }

    checkBulletEnemyCollisions(bullets, enemies) {
        const collisions = [];

        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            if (!bullet.active) continue;

            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                if (!enemy.active) continue;

                if (this.checkCollision(bullet, enemy)) {
                    collisions.push({ bullet, enemy, bulletIndex: i, enemyIndex: j });
                    break; // Bullet can only hit one enemy
                }
            }
        }

        return collisions;
    }

    checkCollision(bullet, enemy) {
        const distance = Vector2D.distance(bullet.position, enemy.position);
        const collisionDistance = bullet.getCollisionRadius() + enemy.getCollisionRadius();
        return distance < collisionDistance;
    }

    onBulletEnemyCollision(callback) {
        this.collisionCallbacks.bulletEnemy = callback;
    }
}
