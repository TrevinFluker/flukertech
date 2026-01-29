import { COLORS } from '../utils/Constants.js';

export class EffectsRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    drawExplosion(explosion) {
        const e = explosion;
        
        this.ctx.save();
        this.ctx.globalAlpha = e.alpha;
        
        if (e.isDisintegration) {
            // Multi-ring disintegration
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = COLORS.EXPLOSION_LARGE;
            
            this.ctx.strokeStyle = COLORS.EXPLOSION_LARGE;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(e.position.x, e.position.y, e.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = COLORS.WHITE;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(e.position.x, e.position.y, e.radius * 0.7, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.strokeStyle = COLORS.EXPLOSION_SMALL;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(e.position.x, e.position.y, e.radius * 0.4, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // White flash at center
            if (e.lifetime < 5) {
                this.ctx.fillStyle = COLORS.WHITE;
                this.ctx.shadowBlur = 30;
                this.ctx.beginPath();
                this.ctx.arc(e.position.x, e.position.y, 20 * (1 - e.lifetime / 5), 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else {
            // Simple explosion ring
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = COLORS.EXPLOSION_SMALL;
            this.ctx.strokeStyle = COLORS.EXPLOSION_SMALL;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(e.position.x, e.position.y, e.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }

    drawParticle(particle) {
        const p = particle;
        
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowColor = p.color;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.position.x, p.position.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    renderEffects(explosions, particles) {
        // Draw particles
        particles.forEach(particle => {
            if (particle.active) {
                this.drawParticle(particle);
            }
        });
        
        // Draw explosions
        explosions.forEach(explosion => {
            if (explosion.active) {
                this.drawExplosion(explosion);
            }
        });
    }
}
