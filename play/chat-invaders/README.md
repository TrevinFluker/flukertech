# Neon Space Invaders

A modern Space Invaders-style arcade game with neon aesthetic and glowing effects.

## Features

- **Player Ship**: Blue glowing fighter jet controlled with keyboard
- **Enemy Ships**: Red angular ships with health indicators (1-4 hits to destroy)
- **Laser Bullets**: Green glowing projectiles
- **Explosion Effects**: 
  - Yellow rings for hits
  - Green disintegration with particles for destroyed enemies
- **Starfield Background**: Animated parallax stars
- **Score & Leveling System**: Progressive difficulty
- **Neon Glow Effects**: All elements have atmospheric glow

## Controls

- **Arrow Keys** or **A/D**: Move left/right
- **Spacebar** or **Up Arrow**: Shoot
- **R**: Restart (after game over)

## Project Structure

```
space-invaders-game/
├── index.html              # Main HTML file
├── styles.css              # Stylesheet
├── src/
│   ├── main.js            # Entry point
│   ├── Game.js            # Main game controller
│   ├── entities/          # Game object classes
│   │   ├── Player.js      # Player ship
│   │   ├── Enemy.js       # Enemy ship
│   │   ├── Bullet.js      # Bullet projectile
│   │   ├── Particle.js    # Particle effect
│   │   └── Explosion.js   # Explosion animation
│   ├── managers/          # Game systems
│   │   ├── InputManager.js       # Keyboard input
│   │   ├── CollisionManager.js   # Collision detection
│   │   ├── SpawnManager.js       # Enemy spawning
│   │   └── ScoreManager.js       # Score & levels
│   ├── rendering/         # Rendering systems
│   │   ├── Renderer.js           # Main canvas renderer
│   │   ├── EffectsRenderer.js    # Effects rendering
│   │   └── UIRenderer.js         # HUD rendering
│   └── utils/             # Utilities
│       ├── Constants.js          # Game constants
│       ├── Vector2D.js           # Vector math
│       └── Utils.js              # Helper functions
└── assets/                # (Future: images, sounds)
```

## Architecture

### Core Classes

- **Game**: Main game loop and orchestration
- **Player**: Player ship logic and movement
- **Enemy**: Enemy behavior and health management
- **Bullet**: Projectile physics
- **Explosion**: Explosion lifecycle
- **Particle**: Individual particle behavior

### Manager Systems

- **InputManager**: Handles all keyboard input
- **CollisionManager**: Detects bullet-enemy collisions
- **SpawnManager**: Controls enemy wave spawning
- **ScoreManager**: Tracks score and level progression

### Rendering

- **Renderer**: Main canvas drawing (player, enemies, bullets, stars)
- **EffectsRenderer**: Explosions and particle effects
- **UIRenderer**: HUD and UI elements

### Utilities

- **Constants**: All game configuration values
- **Vector2D**: 2D position/velocity math
- **Utils**: Helper functions (clamp, random, lerp, etc.)

## Running the Game

### Option 1: Local Server (Recommended)

Due to ES6 module imports, you need to run a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Option 2: Live Server (VS Code)

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## Customization

All game parameters can be easily modified in `src/utils/Constants.js`:

```javascript
// Player speed
export const PLAYER_SPEED = 5;

// Enemy health range
export const ENEMY_MIN_HEALTH = 1;
export const ENEMY_MAX_HEALTH = 4;

// Spawn rate
export const INITIAL_SPAWN_INTERVAL = 1500;

// Colors
export const COLORS = {
    PLAYER_PRIMARY: '#00ccff',
    BULLET: '#00ff00',
    ENEMY_PRIMARY: '#ff3333',
    // ...
};
```

## Future Enhancements

Potential additions to the codebase:

- **AudioManager**: Sound effects and music
- **PowerUps**: Shield, rapid fire, multi-shot
- **Boss Enemies**: Special enemy types
- **Persistent High Scores**: Local storage
- **Mobile Controls**: Touch/swipe support
- **Difficulty Settings**: Easy/Normal/Hard modes
- **Weapon Upgrades**: Different bullet types

## License

Free to use and modify.
