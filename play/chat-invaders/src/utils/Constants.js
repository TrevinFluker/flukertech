// Game constants
export const GAME_WIDTH = 500;  // 25% bigger (400 * 1.25)
export const GAME_HEIGHT = 750;  // 25% bigger (600 * 1.25)

// Player constants
export const PLAYER_SPEED = 5;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 40;
export const PLAYER_COLOR = '#00ccff';
export const PLAYER_GLOW = '#00ccff';

// Bullet constants
export const BULLET_SPEED = 8;
export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 15;
export const BULLET_COLOR = '#00ff00';
export const BULLET_COOLDOWN = 200; // ms
export const BULLET_SPREAD = 8; // Distance between bullets in multi-shot

// Weapon types
export const WEAPON_TYPES = {
    SINGLE: 'single',
    DOUBLE: 'double',
    TRIPLE: 'triple'
};

// Enemy constants
export const ENEMY_MIN_SPEED = 0.6;
export const ENEMY_MAX_SPEED = 1.0;
export const ENEMY_WIDTH = 50;
export const ENEMY_HEIGHT = 50;
export const ENEMY_COLOR = '#ff3333';
export const ENEMY_FILL = 'rgba(204, 0, 0, 0.4)';
export const ENEMY_MIN_HEALTH = 1;
export const ENEMY_MAX_HEALTH = 4;
export const ENEMY_MAX_COUNT = 8;

// Boss Enemy constants
export const BOSS_ENEMY_SIZE_MULTIPLIER = 2;
export const BOSS_ENEMY_SPEED_MULTIPLIER = 0.75;
export const BOSS_ENEMY_MIN_HEALTH = 20;
export const BOSS_ENEMY_DEFAULT_HEALTH = 30;

// Weaving Enemy constants
export const WEAVING_ENEMY_AMPLITUDE = 80; // How far left/right it moves
export const WEAVING_ENEMY_FREQUENCY = 0.015; // How fast it weaves
export const WEAVING_ENEMY_ROTATION_FACTOR = 0.3; // How much it tilts when turning

// Spawn constants
export const INITIAL_SPAWN_INTERVAL = 1500; // ms

// Explosion constants
export const SMALL_EXPLOSION_RADIUS = 35;
export const LARGE_EXPLOSION_RADIUS = 60;
export const SMALL_EXPLOSION_LIFETIME = 20;
export const LARGE_EXPLOSION_LIFETIME = 40;
export const SMALL_PARTICLE_COUNT = 15;
export const LARGE_PARTICLE_COUNT = 30;
export const PARTICLE_MAX_LIFETIME = 50;

// Scoring constants
export const SCORE_PER_HIT = 10;
export const SCORE_PER_KILL = 50;

// Star constants
export const STAR_COUNT = 150;
export const STAR_MIN_SPEED = 0.1;
export const STAR_MAX_SPEED = 0.4;

// Username display constants (for TikTok integration)
export const USERNAME_FONT_SIZE = 16;
export const USERNAME_FONT = 'Arial';

// Colors
export const COLORS = {
    BACKGROUND: '#000000',
    PLAYER_PRIMARY: '#00ccff',
    PLAYER_SECONDARY: '#00ffff',
    BULLET: '#00ff00',
    ENEMY_PRIMARY: '#ff3333',
    ENEMY_SECONDARY: '#ff6600',
    EXPLOSION_SMALL: '#ffff00',
    EXPLOSION_LARGE: '#00ff00',
    PARTICLE_SMALL: '#ff6600',
    PARTICLE_LARGE: '#00ff00',
    TEXT_SCORE: '#00ff00',
    TEXT_GAMEOVER: '#ff0000',
    WHITE: '#ffffff'
};
