import { Game } from './Game.js';
import { WEAPON_TYPES, BOSS_ENEMY_DEFAULT_HEALTH } from './utils/Constants.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);
    game.start();
    
    // Resume audio on first interaction (browser requirement)
    document.addEventListener('click', () => {
        game.soundManager.resume();
    }, { once: true });
    
    // Sound control handlers
    const shootSoundSelect = document.getElementById('shootSound');
    const hitSoundSelect = document.getElementById('hitSound');
    const explosionSoundSelect = document.getElementById('explosionSound');
    
    shootSoundSelect.addEventListener('change', (e) => {
        game.soundManager.setShootSound(e.target.value);
    });
    
    hitSoundSelect.addEventListener('change', (e) => {
        game.soundManager.setHitSound(e.target.value);
    });
    
    explosionSoundSelect.addEventListener('change', (e) => {
        game.soundManager.setExplosionSound(e.target.value);
    });
    
    // Weapon button handlers
    const weaponButtons = {
        singleShot: document.getElementById('singleShot'),
        doubleShot: document.getElementById('doubleShot'),
        tripleShot: document.getElementById('tripleShot')
    };
    
    // Function to update active button
    function setActiveWeapon(activeBtn) {
        Object.values(weaponButtons).forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
    
    weaponButtons.singleShot.addEventListener('click', () => {
        game.setWeaponType(WEAPON_TYPES.SINGLE);
        setActiveWeapon(weaponButtons.singleShot);
    });
    
    weaponButtons.doubleShot.addEventListener('click', () => {
        game.setWeaponType(WEAPON_TYPES.DOUBLE);
        setActiveWeapon(weaponButtons.doubleShot);
    });
    
    weaponButtons.tripleShot.addEventListener('click', () => {
        game.setWeaponType(WEAPON_TYPES.TRIPLE);
        setActiveWeapon(weaponButtons.tripleShot);
    });
    
    // Enemy button handlers
    const spawnBossBtn = document.getElementById('spawnBoss');
    const spawnWeaverBtn = document.getElementById('spawnWeaver');
    
    spawnBossBtn.addEventListener('click', () => {
        game.spawnBossEnemy(BOSS_ENEMY_DEFAULT_HEALTH);
    });
    
    spawnWeaverBtn.addEventListener('click', () => {
        game.spawnWeavingEnemy(4); // Default 4 HP
    });
    
    // Expose game globally for testing/custom spawning
    window.game = game;
    // Example: window.game.spawnBossEnemy(50) for a 50 HP boss
    // Example: window.game.spawnWeavingEnemy(10) for a 10 HP weaver
});
