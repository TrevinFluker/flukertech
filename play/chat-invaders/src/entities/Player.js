import { Vector2D } from '../utils/Vector2D.js';
import { PLAYER_SPEED, PLAYER_WIDTH, PLAYER_HEIGHT, GAME_WIDTH } from '../utils/Constants.js';
import { clamp } from '../utils/Utils.js';

export class Player {
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;
        this.speed = PLAYER_SPEED;
        this.alive = true;
    }

    moveLeft() {
        this.position.x -= this.speed;
        this.clampPosition();
    }

    moveRight() {
        this.position.x += this.speed;
        this.clampPosition();
    }

    clampPosition() {
        this.position.x = clamp(this.position.x, 30, GAME_WIDTH - 30);
    }

    getBulletSpawnPosition() {
        return new Vector2D(this.position.x, this.position.y - 20);
    }

    reset(x, y) {
        this.position.set(x, y);
        this.alive = true;
    }

    update() {
        // Player update logic (if needed in future, e.g., animations)
    }
}
