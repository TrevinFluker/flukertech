import { Vector2D } from '../utils/Vector2D.js';

export class Particle {
    constructor(x, y, vx, vy, size, color, maxLifetime) {
        this.position = new Vector2D(x, y);
        this.velocity = new Vector2D(vx, vy);
        this.size = size;
        this.color = color;
        this.alpha = 1;
        this.lifetime = 0;
        this.maxLifetime = maxLifetime;
        this.active = true;
    }

    update() {
        this.position.add(this.velocity);
        this.lifetime++;
        this.alpha = 1 - (this.lifetime / this.maxLifetime);
        
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
        }
    }
}
