import { Player } from './entities/Player.js';
import { Bullet } from './entities/Bullet.js';
import { Explosion } from './entities/Explosion.js';
import { Particle } from './entities/Particle.js';
import { InputManager } from './managers/InputManager.js';
import { CollisionManager } from './managers/CollisionManager.js';
import { SpawnManager } from './managers/SpawnManager.js';
import { ScoreManager } from './managers/ScoreManager.js';
import { SoundManager } from './managers/SoundManager.js';
import { Renderer } from './rendering/Renderer.js';
import { EffectsRenderer } from './rendering/EffectsRenderer.js';
import { UIRenderer } from './rendering/UIRenderer.js';
import { 
    GAME_WIDTH, 
    GAME_HEIGHT,
    BULLET_COOLDOWN,
    BULLET_SPREAD,
    SMALL_PARTICLE_COUNT,
    LARGE_PARTICLE_COUNT,
    PARTICLE_MAX_LIFETIME,
    COLORS,
    WEAPON_TYPES
} from './utils/Constants.js';

export class Game {
    constructor(canvas) {
        // Initialize rendering
        this.renderer = new Renderer(canvas);
        this.effectsRenderer = new EffectsRenderer(this.renderer.ctx);
        this.uiRenderer = new UIRenderer();
        
        // Initialize managers
        this.inputManager = new InputManager();
        this.collisionManager = new CollisionManager();
        this.spawnManager = new SpawnManager();
        this.scoreManager = new ScoreManager();
        this.soundManager = new SoundManager();
        
        // Game entities
        this.player = new Player(GAME_WIDTH / 2, GAME_HEIGHT - 60);
        this.bullets = [];
        this.enemies = [];
        this.explosions = [];
        this.particles = [];
        
        // Game state
        this.gameOver = false;
        this.lastShot = 0;
        this.lastTime = performance.now();
        this.weaponType = WEAPON_TYPES.SINGLE;
        
        // Setup callbacks
        this.setupCallbacks();
        
        // Initial enemy spawn
        this.spawnInitialEnemies();
    }

    setupCallbacks() {
        // Input callbacks
        this.inputManager.onShoot(() => this.shoot());
        this.inputManager.onRestart(() => {
            if (this.gameOver) {
                this.restart();
            }
        });
        
        // Score callbacks
        this.scoreManager.onScoreChanged((score) => {
            this.uiRenderer.update(score);
        });
    }

    spawnInitialEnemies() {
        setTimeout(() => this.addEnemy(this.spawnManager.createEnemy()), 500);
        setTimeout(() => this.addEnemy(this.spawnManager.createEnemy()), 1500);
        setTimeout(() => this.addEnemy(this.spawnManager.createEnemy()), 2500);
    }

    shoot() {
        const now = performance.now();
        if (now - this.lastShot > BULLET_COOLDOWN && !this.gameOver) {
            const bulletPos = this.player.getBulletSpawnPosition();
            
            switch (this.weaponType) {
                case WEAPON_TYPES.SINGLE:
                    this.bullets.push(new Bullet(bulletPos.x, bulletPos.y));
                    break;
                    
                case WEAPON_TYPES.DOUBLE:
                    this.bullets.push(new Bullet(bulletPos.x - BULLET_SPREAD / 2, bulletPos.y));
                    this.bullets.push(new Bullet(bulletPos.x + BULLET_SPREAD / 2, bulletPos.y));
                    break;
                    
                case WEAPON_TYPES.TRIPLE:
                    this.bullets.push(new Bullet(bulletPos.x - BULLET_SPREAD, bulletPos.y));
                    this.bullets.push(new Bullet(bulletPos.x, bulletPos.y));
                    this.bullets.push(new Bullet(bulletPos.x + BULLET_SPREAD, bulletPos.y));
                    break;
            }
            
            this.soundManager.playShoot();
            this.lastShot = now;
        }
    }
    
    setWeaponType(weaponType) {
        this.weaponType = weaponType;
    }

    spawnBossEnemy(health) {
        const boss = this.spawnManager.createBossEnemy(health);
        this.addEnemy(boss);
    }

    spawnWeavingEnemy(health) {
        const weaver = this.spawnManager.createWeavingEnemy(health);
        this.addEnemy(weaver);
    }

    addEnemy(enemy) {
        if (enemy) {
            this.enemies.push(enemy);
        }
    }

    createExplosion(x, y, isDisintegration = false) {
        this.explosions.push(new Explosion(x, y, isDisintegration));
        
        // Create particles
        const particleCount = isDisintegration ? LARGE_PARTICLE_COUNT : SMALL_PARTICLE_COUNT;
        const color = isDisintegration ? COLORS.PARTICLE_LARGE : COLORS.PARTICLE_SMALL;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
            const speed = Math.random() * 3 + 2;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = Math.random() * 3 + 2;
            const lifetime = isDisintegration ? PARTICLE_MAX_LIFETIME : PARTICLE_MAX_LIFETIME * 0.6;
            
            this.particles.push(new Particle(x, y, vx, vy, size, color, lifetime));
        }
    }

    handleCollisions() {
        const collisions = this.collisionManager.checkBulletEnemyCollisions(this.bullets, this.enemies);
        
        collisions.forEach(({ bullet, enemy }) => {
            bullet.deactivate();
            const destroyed = enemy.takeDamage();
            
            if (destroyed) {
                // Enemy destroyed - disintegration effect
                this.createExplosion(enemy.position.x, enemy.position.y, true);
                enemy.active = false;
                this.scoreManager.addKillScore(enemy.maxHealth);
                this.soundManager.playExplosion();
            } else {
                // Just hit - small explosion
                this.createExplosion(enemy.position.x, enemy.position.y, false);
                this.scoreManager.addHitScore();
                this.soundManager.playHit();
            }
        });
    }

    update(deltaTime) {
        if (this.gameOver) return;
        
        // Update player movement
        if (this.inputManager.isLeftPressed()) {
            this.player.moveLeft();
        }
        if (this.inputManager.isRightPressed()) {
            this.player.moveRight();
        }
        
        // Update bullets
        this.bullets.forEach(bullet => bullet.update());
        this.bullets = this.bullets.filter(b => b.active);
        
        // Update enemies
        this.enemies.forEach(enemy => {
            const inBounds = enemy.update();
            if (!inBounds) {
                this.endGame();
            }
        });
        this.enemies = this.enemies.filter(e => e.active);
        
        // Update explosions
        this.explosions.forEach(exp => exp.update());
        this.explosions = this.explosions.filter(e => e.active);
        
        // Update particles
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.active);
        
        // Check collisions
        this.handleCollisions();
        
        // Spawn new enemies
        const newEnemy = this.spawnManager.update(deltaTime, this.enemies);
        if (newEnemy) {
            this.addEnemy(newEnemy);
        }
    }

    render() {
        // Render main game objects
        this.renderer.render(this.player, this.bullets, this.enemies);
        
        // Render effects on top
        this.effectsRenderer.renderEffects(this.explosions, this.particles);
    }

    gameLoop(currentTime) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    endGame() {
        this.gameOver = true;
        this.player.alive = false;
        this.uiRenderer.showGameOver();
        this.soundManager.playGameOver();
    }

    restart() {
        this.gameOver = false;
        
        // Reset player
        this.player.reset(GAME_WIDTH / 2, GAME_HEIGHT - 60);
        
        // Clear all entities
        this.bullets = [];
        this.enemies = [];
        this.explosions = [];
        this.particles = [];
        
        // Reset managers
        this.scoreManager.reset();
        this.spawnManager.reset();
        this.inputManager.reset();
        
        // Hide game over screen
        this.uiRenderer.hideGameOver();
        
        // Spawn initial enemies
        this.spawnInitialEnemies();
    }

    start() {
        // Resume audio context on user interaction
        this.soundManager.resume();
        this.lastTime = performance.now();
        this.gameLoop(this.lastTime);
    }
}
