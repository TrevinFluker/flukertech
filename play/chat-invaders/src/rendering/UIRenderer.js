export class UIRenderer {
    constructor() {
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
    }

    updateScore(score) {
        this.scoreElement.textContent = score;
    }

    update(score) {
        this.updateScore(score);
    }

    showGameOver() {
        this.gameOverElement.style.display = 'block';
    }

    hideGameOver() {
        this.gameOverElement.style.display = 'none';
    }
}
