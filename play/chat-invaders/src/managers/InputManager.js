// InputManager handles all keyboard input
export class InputManager {
    constructor() {
        this.keys = {};
        this.callbacks = {
            shoot: null,
            restart: null
        };
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    handleKeyDown(e) {
        this.keys[e.key] = true;
        
        // Shoot
        if ((e.key === ' ' || e.key === 'ArrowUp') && this.callbacks.shoot) {
            e.preventDefault();
            this.callbacks.shoot();
        }
        
        // Restart
        if (e.key === 'r' && this.callbacks.restart) {
            this.callbacks.restart();
        }
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
    }

    isKeyPressed(key) {
        return this.keys[key] === true;
    }

    isLeftPressed() {
        return this.isKeyPressed('ArrowLeft');
    }

    isRightPressed() {
        return this.isKeyPressed('ArrowRight');
    }

    onShoot(callback) {
        this.callbacks.shoot = callback;
    }

    onRestart(callback) {
        this.callbacks.restart = callback;
    }

    reset() {
        this.keys = {};
    }
}
