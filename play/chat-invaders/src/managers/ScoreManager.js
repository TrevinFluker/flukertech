import { 
    SCORE_PER_HIT, 
    SCORE_PER_KILL
} from '../utils/Constants.js';

export class ScoreManager {
    constructor() {
        this.score = 0;
        this.enemiesDestroyed = 0;
        this.callbacks = {
            scoreChanged: null
        };
    }

    addHitScore() {
        this.score += SCORE_PER_HIT;
        this.notifyScoreChanged();
    }

    addKillScore(enemyMaxHealth) {
        this.score += SCORE_PER_KILL;
        this.enemiesDestroyed++;
        this.notifyScoreChanged();
    }

    notifyScoreChanged() {
        if (this.callbacks.scoreChanged) {
            this.callbacks.scoreChanged(this.score);
        }
    }

    onScoreChanged(callback) {
        this.callbacks.scoreChanged = callback;
    }

    getScore() {
        return this.score;
    }

    reset() {
        this.score = 0;
        this.enemiesDestroyed = 0;
        this.notifyScoreChanged();
    }
}
