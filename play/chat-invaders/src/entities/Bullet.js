import { Vector2D } from '../utils/Vector2D.js';
import { BULLET_SPEED, BULLET_WIDTH, BULLET_HEIGHT } from '../utils/Constants.js';

export class Bullet {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.width = BULLET_WIDTH;
        this.height = BULLET_HEIGHT;
        this.speed = BULLET_SPEED;
        this.active = true;
    }

    update() {
        this.position.y -= this.speed;
        
        // Deactivate if off screen
        if (this.position.y < -20) {
            this.active = false;
        }
    }

    getCollisionRadius() {
        return Math.max(this.width, this.height) / 2;
    }

    deactivate() {
        this.active = false;
    }
}
