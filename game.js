// ==================== 遊戲配置 ====================
const DIFFICULTY_CONFIG = {
    easy: {
        speed: 1.0,
        judgmentWindow: 150,
        noteFrequency: 800,
        duration: 30000
    },
    normal: {
        speed: 1.5,
        judgmentWindow: 100,
        noteFrequency: 600,
        duration: 30000
    },
    hard: {
        speed: 2.0,
        judgmentWindow: 50,
        noteFrequency: 400,
        duration: 30000
    }
};

// ==================== 遊戲狀態 ====================
class GameState {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty;
        this.config = DIFFICULTY_CONFIG[difficulty];
        this.status = 'idle'; // idle, playing, paused, finished
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.perfectCount = 0;
        this.goodCount = 0;
        this.missCount = 0;
        this.currentTime = 0;
        this.totalTime = this.config.duration;
        this.notes = [];
        this.nextNoteId = 0;
        this.lastNoteGenerationTime = 0;
    }

    reset(difficulty = 'normal') {
        this.difficulty = difficulty;
        this.config = DIFFICULTY_CONFIG[difficulty];
        this.status = 'idle';
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.perfectCount = 0;
        this.goodCount = 0;
        this.missCount = 0;
        this.currentTime = 0;
        this.notes = [];
        this.nextNoteId = 0;
        this.lastNoteGenerationTime = 0;
    }

    addNote(targetTime) {
        const note = {
            id: this.nextNoteId++,
            targetTime: targetTime,
            x: Math.random() * 0.6 + 0.2, // 0.2 到 0.8 之間
            y: Math.random() * 0.6 + 0.2,
            judged: false,
            judgmentType: null,
            score: 0
        };
        this.notes.push(note);
        return note;
    }

    judgeNote(noteId, currentTime) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note || note.judged) return null;

        const timeDiff = Math.abs(note.targetTime - currentTime);
        note.judged = true;

        if (timeDiff <= this.config.judgmentWindow * 0.5) {
            // Perfect
            note.judgmentType = 'perfect';
            note.score = 100;
            this.score += 100;
            this.combo++;
            this.perfectCount++;
        } else if (timeDiff <= this.config.judgmentWindow) {
            // Good
            note.judgmentType = 'good';
            note.score = 50;
            this.score += 50;
            this.combo++;
            this.goodCount++;
        } else {
            // Miss
            note.judgmentType = 'miss';
            note.score = 0;
            this.combo = 0;
            this.missCount++;
        }

        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }

        return note.judgmentType;
    }

    cleanupNotes(currentTime) {
        // 移除已過期的音符
        this.notes = this.notes.filter(note => {
            if (!note.judged && currentTime - note.targetTime > 500) {
                // 自動判定為 Miss
                this.combo = 0;
                this.missCount++;
                return false;
            }
            return true;
        });
    }

    getAccuracy() {
        const total = this.perfectCount + this.goodCount + this.missCount;
        if (total === 0) return 0;
        return ((this.perfectCount * 100 + this.goodCount * 50) / (total * 100)) * 100;
    }

    getRating() {
        const accuracy = this.getAccuracy();
        if (accuracy >= 95) return 'S';
        if (accuracy >= 85) return 'A';
        if (accuracy >= 75) return 'B';
        if (accuracy >= 60) return 'C';
        return 'D';
    }
}

// ==================== 遊戲引擎 ====================
class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameState = new GameState();
        this.startTime = 0;
        this.pauseTime = 0;
        this.pausedDuration = 0;
        this.animationFrameId = null;
        this.lastJudgmentTime = 0;
        this.lastJudgmentType = null;

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    startGame(difficulty) {
        this.gameState.reset(difficulty);
        this.gameState.status = 'playing';
        this.startTime = Date.now();
        this.pausedDuration = 0;
        this.gameLoop();
    }

    pauseGame() {
        if (this.gameState.status === 'playing') {
            this.gameState.status = 'paused';
            this.pauseTime = Date.now();
        }
    }

    resumeGame() {
        if (this.gameState.status === 'paused') {
            this.pausedDuration += Date.now() - this.pauseTime;
            this.gameState.status = 'playing';
            this.gameLoop();
        }
    }

    endGame() {
        this.gameState.status = 'finished';
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    gameLoop() {
        if (this.gameState.status !== 'playing') return;

        const now = Date.now();
        const elapsed = now - this.startTime - this.pausedDuration;
        this.gameState.currentTime = Math.min(elapsed, this.gameState.totalTime);

        // 生成音符
        if (this.gameState.currentTime - this.gameState.lastNoteGenerationTime >= this.gameState.config.noteFrequency) {
            this.gameState.addNote(this.gameState.currentTime + 2000);
            this.gameState.lastNoteGenerationTime = this.gameState.currentTime;
        }

        // 清理過期音符
        this.gameState.cleanupNotes(this.gameState.currentTime);

        // 繪製遊戲
        this.draw();

        // 檢查遊戲是否結束
        if (this.gameState.currentTime >= this.gameState.totalTime) {
            this.endGame();
            this.updateUI();
            return;
        }

        this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
    }

    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // 清空畫布
        ctx.fillStyle = 'rgba(15, 52, 96, 0.1)';
        ctx.fillRect(0, 0, w, h);

        // 繪製判定圈
        this.drawJudgmentCircle();

        // 繪製音符
        this.drawNotes();

        // 繪製判定反饋
        this.drawJudgmentFeedback();
    }

    drawJudgmentCircle() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) * 0.15;

        // 外圓
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        // 內圓（半透明）
        ctx.fillStyle = 'rgba(124, 58, 237, 0.1)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 判定窗口指示
        const windowRadius = radius + 30;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, windowRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawNotes() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) * 0.15;

        this.gameState.notes.forEach(note => {
            if (note.judged) return;

            const timeDiff = note.targetTime - this.gameState.currentTime;
            if (timeDiff < -500) return; // 已過期

            // 計算音符位置
            const distance = Math.max(0, timeDiff / 2000) * (Math.min(w, h) * 0.3);
            const angle = (note.x + note.y) * Math.PI * 2;
            const noteX = centerX + Math.cos(angle) * (radius + distance);
            const noteY = centerY + Math.sin(angle) * (radius + distance);

            // 繪製音符
            const noteSize = 20;
            ctx.fillStyle = timeDiff < 0 ? 'rgba(255, 255, 255, 0.5)' : '#ffffff';
            ctx.beginPath();
            ctx.arc(noteX, noteY, noteSize, 0, Math.PI * 2);
            ctx.fill();

            // 音符邊框
            ctx.strokeStyle = '#7c3aed';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 音符內部圖案
            ctx.fillStyle = '#7c3aed';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('♪', noteX, noteY);
        });
    }

    drawJudgmentFeedback() {
        if (Date.now() - this.lastJudgmentTime > 300) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;

        const elapsed = Date.now() - this.lastJudgmentTime;
        const progress = elapsed / 300;
        const alpha = 1 - progress;

        let color, text;
        if (this.lastJudgmentType === 'perfect') {
            color = 'rgba(34, 197, 94, ' + alpha + ')';
            text = 'PERFECT!';
        } else if (this.lastJudgmentType === 'good') {
            color = 'rgba(59, 130, 246, ' + alpha + ')';
            text = 'GOOD!';
        } else {
            color = 'rgba(239, 68, 68, ' + alpha + ')';
            text = 'MISS';
        }

        ctx.fillStyle = color;
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, centerX, centerY - 60);
    }

    handleNoteClick(x, y) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const centerX = w / 2;
        const centerY = h / 2;

        // 檢查點擊是否在判定圈內
        const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const radius = Math.min(w, h) * 0.15;

        if (dist > radius + 50) return;

        // 找到最近的未判定音符
        let closestNote = null;
        let closestDist = Infinity;

        this.gameState.notes.forEach(note => {
            if (note.judged) return;

            const timeDiff = Math.abs(note.targetTime - this.gameState.currentTime);
            if (timeDiff < closestDist) {
                closestDist = timeDiff;
                closestNote = note;
            }
        });

        if (closestNote && closestDist <= this.gameState.config.judgmentWindow + 100) {
            const judgmentType = this.gameState.judgeNote(closestNote.id, this.gameState.currentTime);
            this.lastJudgmentType = judgmentType;
            this.lastJudgmentTime = Date.now();
            this.updateUI();
        }
    }

    updateUI() {
        document.getElementById('scoreDisplay').textContent = this.gameState.score;
        document.getElementById('comboDisplay').textContent = this.gameState.combo;
        document.getElementById('progressFill').style.width = 
            (this.gameState.currentTime / this.gameState.totalTime * 100) + '%';
    }
}

// ==================== UI 控制 ====================
class UIController {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.selectedDifficulty = 'normal';

        this.setupEventListeners();
    }

    setupEventListeners() {
        // 難度選擇
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedDifficulty = e.target.dataset.difficulty;
            });
        });

        // 開始遊戲
        document.getElementById('startBtn').addEventListener('click', () => {
            this.showGameScreen();
            this.gameEngine.startGame(this.selectedDifficulty);
        });

        // 暫停/繼續
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (this.gameEngine.gameState.status === 'playing') {
                this.gameEngine.pauseGame();
                this.showPauseMenu();
            }
        });

        // 暫停菜單按鈕
        document.getElementById('resumeBtn').addEventListener('click', () => {
            this.hidePauseMenu();
            this.gameEngine.resumeGame();
        });

        document.getElementById('quitBtn').addEventListener('click', () => {
            this.gameEngine.endGame();
            this.showMenuScreen();
        });

        // 結算屏幕按鈕
        document.getElementById('retryBtn').addEventListener('click', () => {
            this.showGameScreen();
            this.gameEngine.startGame(this.selectedDifficulty);
        });

        document.getElementById('menuBtn').addEventListener('click', () => {
            this.showMenuScreen();
        });

        // Canvas 點擊事件
        const canvas = document.getElementById('gameCanvas');
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.gameEngine.handleNoteClick(x, y);
        });

        // 遊戲結束檢查
        setInterval(() => {
            if (this.gameEngine.gameState.status === 'finished') {
                this.showResultsScreen();
            }
        }, 100);
    }

    showMenuScreen() {
        document.getElementById('menuScreen').classList.remove('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('resultsScreen').classList.add('hidden');
    }

    showGameScreen() {
        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.remove('hidden');
        document.getElementById('resultsScreen').classList.add('hidden');
        this.hidePauseMenu();
    }

    showResultsScreen() {
        const state = this.gameEngine.gameState;
        document.getElementById('finalScore').textContent = state.score;
        document.getElementById('ratingDisplay').textContent = state.getRating();
        document.getElementById('perfectCount').textContent = state.perfectCount;
        document.getElementById('goodCount').textContent = state.goodCount;
        document.getElementById('missCount').textContent = state.missCount;
        document.getElementById('maxComboDisplay').textContent = state.maxCombo;

        document.getElementById('menuScreen').classList.add('hidden');
        document.getElementById('gameScreen').classList.add('hidden');
        document.getElementById('resultsScreen').classList.remove('hidden');
    }

    showPauseMenu() {
        document.getElementById('pauseMenu').classList.remove('hidden');
    }

    hidePauseMenu() {
        document.getElementById('pauseMenu').classList.add('hidden');
    }
}

// ==================== 初始化 ====================
window.addEventListener('DOMContentLoaded', () => {
    const gameEngine = new GameEngine('gameCanvas');
    const uiController = new UIController(gameEngine);
});
