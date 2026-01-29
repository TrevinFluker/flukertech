import { 
    GAME_WIDTH, 
    GAME_HEIGHT,
    COLORS,
    STAR_COUNT,
    STAR_MIN_SPEED,
    STAR_MAX_SPEED,
    USERNAME_FONT_SIZE,
    USERNAME_FONT
} from '../utils/Constants.js';
import { randomRange } from '../utils/Utils.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = GAME_WIDTH;
        this.canvas.height = GAME_HEIGHT;
        
        // Initialize stars
        this.stars = [];
        this.initStars();
    }

    initStars() {
        for (let i = 0; i < STAR_COUNT; i++) {
            this.stars.push({
                x: Math.random() * GAME_WIDTH,
                y: Math.random() * GAME_HEIGHT,
                size: Math.random() * 2,
                speed: randomRange(STAR_MIN_SPEED, STAR_MAX_SPEED),
                brightness: Math.random() * 0.5 + 0.5
            });
        }
    }

    clear() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    updateAndDrawStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > GAME_HEIGHT) {
                star.y = 0;
                star.x = Math.random() * GAME_WIDTH;
            }
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }

    drawPlayer(player) {
        const p = player.position;
        
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        
        // Enhanced glow effect
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = COLORS.PLAYER_PRIMARY;
        
        // Color palette
        const primaryBlue = '#3366ff';
        const lightBlue = '#6699ff';
        const darkBlue = '#1a3d7a';
        const glowCyan = '#00ffff';
        const white = '#ffffff';
        
        // ===== MAIN BODY OUTLINE - Delta Wing Shape =====
        this.ctx.fillStyle = primaryBlue;
        this.ctx.strokeStyle = lightBlue;
        this.ctx.lineWidth = 2.5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, -24);      // Sharp nose tip
        this.ctx.lineTo(-24, 14);     // Left wing outer edge
        this.ctx.lineTo(-10, 20);     // Left engine pod outer
        this.ctx.lineTo(-6, 18);      // Left engine pod inner
        this.ctx.lineTo(0, 16);       // Center rear
        this.ctx.lineTo(6, 18);       // Right engine pod inner
        this.ctx.lineTo(10, 20);      // Right engine pod outer
        this.ctx.lineTo(24, 14);      // Right wing outer edge
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== WING STRAKES (angular detail sections) =====
        this.ctx.fillStyle = darkBlue;
        this.ctx.strokeStyle = primaryBlue;
        this.ctx.lineWidth = 2;
        
        // Left wing strake
        this.ctx.beginPath();
        this.ctx.moveTo(-6, -8);
        this.ctx.lineTo(-20, 10);
        this.ctx.lineTo(-16, 13);
        this.ctx.lineTo(-8, 6);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Right wing strake
        this.ctx.beginPath();
        this.ctx.moveTo(6, -8);
        this.ctx.lineTo(20, 10);
        this.ctx.lineTo(16, 13);
        this.ctx.lineTo(8, 6);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== NOSE SECTION - Distinctive Cockpit Design =====
        this.ctx.fillStyle = lightBlue;
        this.ctx.strokeStyle = glowCyan;
        this.ctx.lineWidth = 2;
        
        // Nose/Cockpit teardrop shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, -24);      // Tip
        this.ctx.quadraticCurveTo(-7, -16, -6, -8);  // Left curve
        this.ctx.lineTo(-5, 0);       // Left side
        this.ctx.quadraticCurveTo(0, 2, 5, 0);       // Bottom curve
        this.ctx.lineTo(6, -8);       // Right side
        this.ctx.quadraticCurveTo(7, -16, 0, -24);   // Right curve back to tip
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== COCKPIT CANOPY (bright center) =====
        this.ctx.fillStyle = 'rgba(180, 220, 255, 0.95)';
        this.ctx.strokeStyle = white;
        this.ctx.lineWidth = 1.5;
        
        this.ctx.beginPath();
        this.ctx.ellipse(0, -8, 3.5, 7, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== FORWARD CANARDS (small wings) =====
        this.ctx.fillStyle = lightBlue;
        this.ctx.strokeStyle = glowCyan;
        this.ctx.lineWidth = 1.5;
        
        // Left canard
        this.ctx.beginPath();
        this.ctx.moveTo(-6, -10);
        this.ctx.lineTo(-11, -8);
        this.ctx.lineTo(-11, -5);
        this.ctx.lineTo(-7, -7);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Right canard
        this.ctx.beginPath();
        this.ctx.moveTo(6, -10);
        this.ctx.lineTo(11, -8);
        this.ctx.lineTo(11, -5);
        this.ctx.lineTo(7, -7);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== ENGINE PODS (rear thrusters) =====
        this.ctx.fillStyle = darkBlue;
        this.ctx.strokeStyle = primaryBlue;
        this.ctx.lineWidth = 2;
        
        // Left engine housing
        this.ctx.beginPath();
        this.ctx.moveTo(-6, 10);
        this.ctx.lineTo(-9, 14);
        this.ctx.lineTo(-8, 19);
        this.ctx.lineTo(-5, 16);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Right engine housing
        this.ctx.beginPath();
        this.ctx.moveTo(6, 10);
        this.ctx.lineTo(9, 14);
        this.ctx.lineTo(8, 19);
        this.ctx.lineTo(5, 16);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== THRUSTER GLOWS =====
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = glowCyan;
        this.ctx.fillStyle = glowCyan;
        
        // Left thruster glow
        this.ctx.beginPath();
        this.ctx.ellipse(-6.5, 18, 2.5, 3.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right thruster glow
        this.ctx.beginPath();
        this.ctx.ellipse(6.5, 18, 2.5, 3.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // ===== DETAILS AND ACCENTS =====
        
        // Nose tip glow
        this.ctx.shadowBlur = 35;
        this.ctx.fillStyle = white;
        this.ctx.beginPath();
        this.ctx.arc(0, -24, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Center line detail
        this.ctx.shadowBlur = 8;
        this.ctx.strokeStyle = glowCyan;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -18);
        this.ctx.lineTo(0, 12);
        this.ctx.stroke();
        
        // Wing leading edge highlights
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
        this.ctx.lineWidth = 1.5;
        this.ctx.shadowBlur = 10;
        
        // Left wing leading edge
        this.ctx.beginPath();
        this.ctx.moveTo(-3, -20);
        this.ctx.lineTo(-22, 13);
        this.ctx.stroke();
        
        // Right wing leading edge
        this.ctx.beginPath();
        this.ctx.moveTo(3, -20);
        this.ctx.lineTo(22, 13);
        this.ctx.stroke();
        
        // Wing strake details
        this.ctx.strokeStyle = 'rgba(100, 150, 255, 0.8)';
        this.ctx.lineWidth = 1;
        this.ctx.shadowBlur = 5;
        
        // Left strake lines
        this.ctx.beginPath();
        this.ctx.moveTo(-8, -4);
        this.ctx.lineTo(-18, 11);
        this.ctx.stroke();
        
        // Right strake lines
        this.ctx.beginPath();
        this.ctx.moveTo(8, -4);
        this.ctx.lineTo(18, 11);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawBullet(bullet) {
        const b = bullet.position;
        
        this.ctx.save();
        
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = COLORS.BULLET;
        
        this.ctx.fillStyle = COLORS.BULLET;
        this.ctx.fillRect(b.x - 2, b.y, 4, 15);
        
        // Extra glow lines
        this.ctx.strokeStyle = '#88ff88';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(b.x - 1, b.y);
        this.ctx.lineTo(b.x - 1, b.y + 15);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(b.x + 1, b.y);
        this.ctx.lineTo(b.x + 1, b.y + 15);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    drawEnemy(enemy) {
        const e = enemy.position;
        
        // Color palette - different for boss, weaving, and regular enemies
        let primaryColor, darkColor, accentColor, glowColor, detailColor;
        
        if (enemy.isBoss) {
            // Boss - black/dark theme
            primaryColor = '#1a1a1a';
            darkColor = '#000000';
            accentColor = '#444444';
            glowColor = '#666666';
            detailColor = '#2a2a2a';
        } else if (enemy.isWeaving) {
            // Weaving enemy - purple theme
            primaryColor = '#9933ff';
            darkColor = '#6600cc';
            accentColor = '#cc66ff';
            glowColor = '#ff00ff';
            detailColor = '#4d0099';
        } else {
            // Regular enemy - red theme
            primaryColor = '#ff3333';
            darkColor = '#cc0000';
            accentColor = '#ff6600';
            glowColor = '#ff9900';
            detailColor = '#333333';
        }
        
        // ===== DRAW SHIP BODY (with scaling for bosses) =====
        this.ctx.save();
        this.ctx.translate(e.x, e.y);
        
        // Rotate for weaving enemies
        if (enemy.isWeaving) {
            this.ctx.rotate(enemy.rotation);
        }
        
        // Scale for boss enemies (only affects ship body)
        if (enemy.isBoss) {
            this.ctx.scale(enemy.sizeMultiplier, enemy.sizeMultiplier);
        }
        
        // ===== MAIN BODY OUTLINE - Aggressive Delta Wing =====
        this.ctx.fillStyle = primaryColor;
        this.ctx.strokeStyle = accentColor;
        this.ctx.lineWidth = 2.5;
        
        // Wider, more aggressive shape (flipped since enemies come down)
        this.ctx.beginPath();
        this.ctx.moveTo(0, 24);       // Pointed rear (facing down)
        this.ctx.lineTo(-26, -12);    // Left wing swept forward
        this.ctx.lineTo(-12, -18);    // Left weapon pod
        this.ctx.lineTo(-7, -16);     // Left inner
        this.ctx.lineTo(0, -14);      // Center front
        this.ctx.lineTo(7, -16);      // Right inner
        this.ctx.lineTo(12, -18);     // Right weapon pod
        this.ctx.lineTo(26, -12);     // Right wing swept forward
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== WING STRAKES - Sharper, more aggressive =====
        this.ctx.fillStyle = darkColor;
        this.ctx.strokeStyle = primaryColor;
        this.ctx.lineWidth = 2;
        
        // Left wing strake
        this.ctx.beginPath();
        this.ctx.moveTo(-7, 8);
        this.ctx.lineTo(-22, -8);
        this.ctx.lineTo(-18, -11);
        this.ctx.lineTo(-9, 4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Right wing strake
        this.ctx.beginPath();
        this.ctx.moveTo(7, 8);
        this.ctx.lineTo(22, -8);
        this.ctx.lineTo(18, -11);
        this.ctx.lineTo(9, 4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== COCKPIT/CENTER SECTION - Evil pointed design =====
        this.ctx.fillStyle = darkColor;
        this.ctx.strokeStyle = accentColor;
        this.ctx.lineWidth = 2;
        
        // Sharp angular cockpit
        this.ctx.beginPath();
        this.ctx.moveTo(0, 20);       // Rear point
        this.ctx.lineTo(-6, 6);       // Left side
        this.ctx.lineTo(-5, -6);      // Left front
        this.ctx.lineTo(0, -10);      // Front point
        this.ctx.lineTo(5, -6);       // Right front
        this.ctx.lineTo(6, 6);        // Right side
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== EVIL COCKPIT WINDOW - Sharp angular =====
        let cockpitColor;
        if (enemy.isBoss) {
            cockpitColor = 'rgba(100, 100, 100, 0.8)';
        } else if (enemy.isWeaving) {
            cockpitColor = 'rgba(200, 100, 255, 0.8)';
        } else {
            cockpitColor = 'rgba(255, 50, 50, 0.8)';
        }
        this.ctx.fillStyle = cockpitColor;
        this.ctx.strokeStyle = detailColor;
        this.ctx.lineWidth = 1.5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 12);
        this.ctx.lineTo(-3, 4);
        this.ctx.lineTo(0, 0);
        this.ctx.lineTo(3, 4);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== FORWARD WEAPON PODS (like fangs) =====
        this.ctx.fillStyle = detailColor;
        this.ctx.strokeStyle = accentColor;
        this.ctx.lineWidth = 1.5;
        
        // Left weapon pod
        this.ctx.beginPath();
        this.ctx.moveTo(-8, -8);
        this.ctx.lineTo(-12, -12);
        this.ctx.lineTo(-11, -16);
        this.ctx.lineTo(-7, -12);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Right weapon pod
        this.ctx.beginPath();
        this.ctx.moveTo(8, -8);
        this.ctx.lineTo(12, -12);
        this.ctx.lineTo(11, -16);
        this.ctx.lineTo(7, -12);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== ENGINE/THRUSTER AT REAR =====
        this.ctx.fillStyle = detailColor;
        this.ctx.strokeStyle = primaryColor;
        this.ctx.lineWidth = 2;
        
        // Center rear thruster housing
        this.ctx.beginPath();
        this.ctx.moveTo(-4, 16);
        this.ctx.lineTo(-6, 22);
        this.ctx.lineTo(0, 24);
        this.ctx.lineTo(6, 22);
        this.ctx.lineTo(4, 16);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // ===== THRUSTER GLOW - Orange/Red =====
        this.ctx.fillStyle = glowColor;
        
        // Main thruster glow
        this.ctx.beginPath();
        this.ctx.ellipse(0, 23, 3, 4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // ===== WEAPON GLOW (menacing) =====
        this.ctx.fillStyle = primaryColor;
        
        // Left weapon glow
        this.ctx.beginPath();
        this.ctx.arc(-10, -16, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Right weapon glow
        this.ctx.beginPath();
        this.ctx.arc(10, -16, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // ===== DETAILS AND ACCENTS =====
        
        // Center line detail
        this.ctx.strokeStyle = accentColor;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 18);
        this.ctx.lineTo(0, -8);
        this.ctx.stroke();
        
        // Wing leading edge highlights
        let wingHighlightColor;
        if (enemy.isBoss) {
            wingHighlightColor = 'rgba(100, 100, 100, 0.7)';
        } else if (enemy.isWeaving) {
            wingHighlightColor = 'rgba(204, 102, 255, 0.7)';
        } else {
            wingHighlightColor = 'rgba(255, 102, 0, 0.7)';
        }
        this.ctx.strokeStyle = wingHighlightColor;
        this.ctx.lineWidth = 1.5;
        
        // Left wing edge
        this.ctx.beginPath();
        this.ctx.moveTo(-3, 20);
        this.ctx.lineTo(-24, -10);
        this.ctx.stroke();
        
        // Right wing edge
        this.ctx.beginPath();
        this.ctx.moveTo(3, 20);
        this.ctx.lineTo(24, -10);
        this.ctx.stroke();
        
        // Sharp accent lines (evil details)
        let accentLineColor;
        if (enemy.isBoss) {
            accentLineColor = 'rgba(80, 80, 80, 0.8)';
        } else if (enemy.isWeaving) {
            accentLineColor = 'rgba(180, 100, 220, 0.8)';
        } else {
            accentLineColor = 'rgba(200, 50, 50, 0.8)';
        }
        this.ctx.strokeStyle = accentLineColor;
        this.ctx.lineWidth = 1;
        
        // Left accent
        this.ctx.beginPath();
        this.ctx.moveTo(-9, 6);
        this.ctx.lineTo(-20, -9);
        this.ctx.stroke();
        
        // Right accent
        this.ctx.beginPath();
        this.ctx.moveTo(9, 6);
        this.ctx.lineTo(20, -9);
        this.ctx.stroke();
        
        this.ctx.restore(); // End ship body drawing (with scale)
        
        // ===== DRAW TEXT & IMAGES (no scaling) =====
        this.ctx.save();
        this.ctx.translate(e.x, e.y);
        // No scaling - text and images stay normal size
        
        // ===== HEALTH NUMBER =====
        this.ctx.fillStyle = COLORS.WHITE;
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.strokeStyle = COLORS.BACKGROUND;
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(enemy.health.toString(), 0, 6);
        this.ctx.fillText(enemy.health.toString(), 0, 6);
        
        // ===== USERNAME TEXT ABOVE SHIP =====
        // Truncate username to 16 characters
        const displayName = enemy.name.length > 16 
            ? enemy.name.substring(0, 16) + '...' 
            : enemy.name;
        
        this.ctx.font = `bold ${USERNAME_FONT_SIZE}px ${USERNAME_FONT}`;
        
        // Username text (centered, no profile image)
        this.ctx.fillStyle = '#ffcc66';
        this.ctx.strokeStyle = COLORS.BACKGROUND;
        this.ctx.lineWidth = 2.5;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.strokeText(displayName, 0, -35);
        this.ctx.fillText(displayName, 0, -35);
        
        this.ctx.restore();
    }

    render(player, bullets, enemies) {
        this.clear();
        this.updateAndDrawStars();
        
        // Draw bullets
        bullets.forEach(bullet => {
            if (bullet.active) {
                this.drawBullet(bullet);
            }
        });
        
        // Draw enemies
        enemies.forEach(enemy => {
            if (enemy.active) {
                this.drawEnemy(enemy);
            }
        });
        
        // Draw player
        if (player.alive) {
            this.drawPlayer(player);
        }
    }
}
