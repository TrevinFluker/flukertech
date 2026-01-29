import { Vector2D } from '../utils/Vector2D.js';
import { 
    SMALL_EXPLOSION_RADIUS, 
    LARGE_EXPLOSION_RADIUS,
    SMALL_EXPLOSION_LIFETIME,
    LARGE_EXPLOSION_LIFETIME 
} from '../utils/Constants.js';

export class Explosion {
    constructor(x, y, isDisintegration = false) {
        this.position = new Vector2D(x, y);
        this.radius = 5;
        this.maxRadius = isDisintegration ? LARGE_EXPLOSION_RADIUS : SMALL_EXPLOSION_RADIUS;
        this.alpha = 1;
        this.isDisintegration = isDisintegration;
        this.lifetime = 0;
        this.maxLifetime = isDisintegration ? LARGE_EXPLOSION_LIFETIME : SMALL_EXPLOSION_LIFETIME;
        this.active = true;
    }

    update() {
        this.lifetime++;
        const progress = this.lifetime / this.maxLifetime;
        this.radius = this.maxRadius * progress;
        this.alpha = 1 - progress;
        
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
        }
    }
}
