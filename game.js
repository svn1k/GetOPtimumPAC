// ===================================================
// PAC-MAN OPTIMUM — Complete Game Engine
// ===================================================
'use strict';

// ============ TILE TYPES ============
const T_DOT   = 0;
const T_WALL  = 1;
const T_EMPTY = 2;
const T_POWER = 3;
const T_GWALL = 4; // ghost house wall
const T_GDOOR = 5; // ghost house door

// ============ DIRECTIONS ============
const DIR_NONE  = -1;
const DIR_UP    = 0;
const DIR_DOWN  = 1;
const DIR_LEFT  = 2;
const DIR_RIGHT = 3;

const DX = [0, 0, -1, 1];
const DY = [-1, 1, 0, 0];
const OPPOSITE_DIR = [1, 0, 3, 2];

// ============ GHOST MODES ============
const GMODE_SCATTER    = 0;
const GMODE_CHASE      = 1;
const GMODE_FRIGHTENED = 2;
const GMODE_EATEN      = 3;
const GMODE_HOUSE      = 4; // in ghost house, waiting to exit

// ============ GAME STATES ============
const GS_MENU      = 0;
const GS_READY     = 1;
const GS_PLAYING   = 2;
const GS_DYING     = 3;
const GS_LEVELWIN  = 4;
const GS_GAMEOVER  = 5;
const GS_WIN       = 6;
const GS_PAUSED    = 7;
const GS_EAT_GHOST = 8;

// ============ MAZE DATA (5 Levels, 21x21 each) ============
// 0=dot, 1=wall, 2=empty, 3=power pellet, 4=ghost house wall, 5=ghost door
const MAZES = [
    [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,1],
[1,0,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
[1,1,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,4,4,4,5,4,4,4,0,1,0,1,1,0,1],
[1,0,0,0,0,1,0,4,2,2,2,2,2,4,0,1,0,0,0,0,1],
[1,1,1,1,0,0,0,4,2,2,2,2,2,4,0,0,0,1,1,1,1],
[1,0,0,0,0,1,0,4,2,2,2,2,2,4,0,1,0,0,0,0,1],
[1,0,1,1,0,1,0,4,4,4,4,4,4,4,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,1,1],
[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,0,1],
[1,3,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ],
[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
[1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
[1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
[1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1],
[1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
[1,0,1,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,4,4,4,5,4,4,4,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0,1],
[1,0,1,0,1,0,0,4,2,2,2,2,2,4,0,0,1,0,1,0,1],
[1,0,0,0,0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,4,4,4,4,4,4,4,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,1,0,1],
[1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
[1,1,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1,1],
[1,0,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,0,1],
[1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
],
[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,3,1],
[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1],
[1,1,0,1,1,1,1,0,1,0,0,0,1,0,1,1,1,1,0,1,1],
[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,1,0,0,1,0,0,1,0,1,0,1,1,0,1],
[1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
[1,0,1,1,0,1,0,4,4,4,5,4,4,4,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0,1],
[1,1,0,1,0,1,0,4,2,2,2,2,2,4,0,1,0,1,0,1,1],
[1,0,0,0,0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,4,4,4,4,4,4,4,0,1,0,1,1,0,1],
[1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
[1,0,1,1,0,1,0,1,0,0,1,0,0,1,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
[1,1,0,1,1,1,1,0,1,0,0,0,1,0,1,1,1,1,0,1,1],
[1,0,0,0,0,0,0,0,1,0,2,0,1,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
[1,3,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,3,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
],
[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
[1,0,1,1,1,0,1,1,0,0,0,0,0,1,1,0,1,1,1,0,1],
[1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
[1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,1,1,0,1,0,1],
[1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,0,0,0,1,0,0,0,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,0,0,1,0,4,4,4,5,4,4,4,0,1,0,0,1,0,1],
[1,0,1,0,0,0,0,4,2,2,2,2,2,4,0,0,0,0,1,0,1],
[1,0,0,0,0,0,0,4,2,2,2,2,2,4,0,0,0,0,0,0,1],
[1,0,1,0,0,0,0,4,2,2,2,2,2,4,0,0,0,0,1,0,1],
[1,0,1,0,0,1,0,4,4,4,4,4,4,4,0,1,0,0,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,0,0,0,1,0,0,0,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
[1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,1,1,0,1,0,1],
[1,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,1],
[1,0,1,1,1,0,1,1,0,0,0,0,0,1,1,0,1,1,1,0,1],
[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
],
[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,3,1],
[1,0,1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1,0,1],
[1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
[1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1],
[1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
[1,1,1,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,1,1,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,0,1,0,0,4,4,4,5,4,4,4,0,0,1,0,1,0,1],
[1,0,0,0,1,0,0,4,2,2,2,2,2,4,0,0,1,0,0,0,1],
[1,0,1,0,0,0,0,4,2,2,2,2,2,4,0,0,0,0,1,0,1],
[1,0,0,0,1,0,0,4,2,2,2,2,2,4,0,0,1,0,0,0,1],
[1,0,1,0,1,0,0,4,4,4,4,4,4,4,0,0,1,0,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,1,1,0,1,0,1,1,0,0,1,0,0,1,1,0,1,0,1,1,1],
[1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
[1,0,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,0,1],
[1,0,1,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,0,1],
[1,0,1,0,1,1,0,1,0,1,1,1,0,1,0,1,1,0,1,0,1],
[1,3,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,3,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
],
[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,3,1],
[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
[1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,0,1,1,1,0,0,1,0,0,1,1,1,0,1,1,0,1],
[1,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,1],
[1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1],
[1,0,0,0,0,1,0,4,4,4,5,4,4,4,0,1,0,0,0,0,1],
[1,1,1,1,0,1,0,4,2,2,2,2,2,4,0,1,0,1,1,1,1],
[1,0,0,0,0,1,0,4,2,2,2,2,2,4,0,1,0,0,0,0,1],
[1,1,1,1,0,1,0,4,2,2,2,2,2,4,0,1,0,1,1,1,1],
[1,0,0,0,0,0,0,4,4,4,4,4,4,4,0,0,0,0,0,0,1],
[1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1],
[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
[1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,0,1,1],
[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
[1,0,1,1,1,1,1,1,1,0,2,0,1,1,1,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
[1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
],
[
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,3,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,3,1],
[1,0,1,1,1,1,0,1,1,0,1,0,1,1,0,1,1,1,1,0,1],
[1,0,0,0,0,0,0,1,1,0,1,0,1,1,0,0,0,0,0,0,1],
[1,0,1,1,0,1,0,0,0,0,0,0,0,0,0,1,0,1,1,0,1],
[1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1],
[1,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1],
[1,1,1,1,1,0,1,1,0,1,0,1,0,1,1,0,1,1,1,1,1],
[1,0,0,0,0,0,1,4,4,4,5,4,4,4,1,0,0,0,0,0,1],
[1,0,1,1,1,0,1,4,2,2,2,2,2,4,1,0,1,1,1,0,1],
[1,0,0,0,0,0,1,4,2,2,2,2,2,4,1,0,0,0,0,0,1],
[1,0,1,1,1,0,1,4,2,2,2,2,2,4,1,0,1,1,1,0,1],
[1,0,0,0,0,0,1,4,4,4,4,4,4,4,1,0,0,0,0,0,1],
[1,1,1,1,1,0,1,1,0,0,0,0,0,1,1,0,1,1,1,1,1],
[1,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1],
[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
[1,0,1,1,1,1,0,1,1,0,2,0,1,1,0,1,1,1,1,0,1],
[1,0,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1],
[1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
]
];

// ============ LEVEL CONFIGS ============
const COLS = 21;
const ROWS = 21;
const PAC_START = { x: 10, y: 17 };
const GHOST_STARTS = [
    { x: 10, y: 7 },  // Blinky
{ x: 10, y: 10 }, // Pinky
{ x: 9, y: 10 },  // Inky
{ x: 11, y: 10 }, // Clyde
];

const GHOST_SCATTER_TARGETS = [
    { x: 19, y: 0 },
{ x: 1, y: 0 },
{ x: 19, y: 20 },
{ x: 1, y: 20 },
];

const GHOST_COLORS = ['#ff4444', '#ffb8ff', '#00ddff', '#ffb852'];

// ============ SOUND MANAGER ============
class SoundManager {
    constructor() {
        this.ctx = null;
        try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { }
    }
    resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
    _beep(freq, dur, type, vol) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = type || 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(vol || 0.08, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(t); o.stop(t + dur);
    }
    dot()   { this._beep(880, 0.04, 'sine', 0.06); }
    power() { this._beep(220, 0.4, 'square', 0.08); }
    eatGhost() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(600, t);
        o.frequency.linearRampToValueAtTime(200, t + 0.3);
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.connect(g); g.connect(this.ctx.destination);
        o.start(t); o.stop(t + 0.3);
    }
    death() {
        if (!this.ctx) return;
        for (let i = 0; i < 8; i++) setTimeout(() => this._beep(500 - i * 50, 0.12, 'sine', 0.06), i * 100);
    }
    levelUp() {
        [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this._beep(f, 0.18, 'sine', 0.1), i * 130));
    }
}

// ============ THE GAME ============
class PacManGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.sound = new SoundManager();

        this.state = GS_MENU;
        this.level = 0;
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('pacOptHighScore') || '0');
        this.lives = 3;

        // Character Setup
        this.selectedSkin = 0;
        this.totalSkins = 8; // 0 = Classic, 1-7 = Custom monsters

        this.pac = null;
        this.ghosts = [];

        this.lastTime = 0;
        this.animTime = 0;

        this.tileSize = 24;
        this._resize();

        this.inputDir = DIR_NONE;
        this._setupInput();
        this._setupUI();

        this._loop = this._loop.bind(this);
        requestAnimationFrame(this._loop);
    }

    _resize() {
        const wrapper = document.getElementById('canvas-wrapper');
        const maxW = Math.min(wrapper.clientWidth - 16, 880);
        const maxH = wrapper.clientHeight - 16;
        const ts = Math.floor(Math.min(maxW / COLS, maxH / ROWS));
        this.tileSize = Math.max(12, Math.min(ts, 42));
        this.canvas.width = COLS * this.tileSize;
        this.canvas.height = ROWS * this.tileSize;
    }

    _setupInput() {
        const bindKey = (key, dir) => {
            if (['ArrowUp','w','W','ArrowDown','s','S','ArrowLeft','a','A','ArrowRight','d','D'].includes(key)) return dir;
            return null;
        };
        window.addEventListener('keydown', (e) => {
            this.sound.resume();
            if (['ArrowUp','w','W'].includes(e.key)) { this.inputDir = DIR_UP; e.preventDefault(); }
            if (['ArrowDown','s','S'].includes(e.key)) { this.inputDir = DIR_DOWN; e.preventDefault(); }
            if (['ArrowLeft','a','A'].includes(e.key)) { this.inputDir = DIR_LEFT; e.preventDefault(); }
            if (['ArrowRight','d','D'].includes(e.key)) { this.inputDir = DIR_RIGHT; e.preventDefault(); }
            if (['Escape','p','P'].includes(e.key)) {
                if (this.state === GS_PLAYING) this._pause();
                else if (this.state === GS_PAUSED) this._resume();
            }
        });

        document.querySelectorAll('.dpad-btn[data-dir]').forEach(btn => {
            const handler = (e) => {
                e.preventDefault();
                this.sound.resume();
                const d = btn.dataset.dir;
                if (d === 'up') this.inputDir = DIR_UP;
                else if (d === 'down') this.inputDir = DIR_DOWN;
                else if (d === 'left') this.inputDir = DIR_LEFT;
                else if (d === 'right') this.inputDir = DIR_RIGHT;
            };
                btn.addEventListener('touchstart', handler, { passive: false });
                btn.addEventListener('mousedown', handler);
        });

        let sx = 0, sy = 0;
        this.canvas.addEventListener('touchstart', (e) => {
            this.sound.resume();
            sx = e.touches[0].clientX;
            sy = e.touches[0].clientY;
        }, { passive: true });
        this.canvas.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - sx;
            const dy = e.changedTouches[0].clientY - sy;
            if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
            if (Math.abs(dx) > Math.abs(dy)) this.inputDir = dx > 0 ? DIR_RIGHT : DIR_LEFT;
            else this.inputDir = dy > 0 ? DIR_DOWN : DIR_UP;
        }, { passive: true });
    }

    _setupUI() {
        this.selectedStartingLevel = 0;
        const updateCarousel = () => {
            const total = MAZES.length;
            document.getElementById('lvl-prev').textContent = (this.selectedStartingLevel - 1 + total) % total + 1;
            document.getElementById('lvl-curr').textContent = this.selectedStartingLevel + 1;
            document.getElementById('lvl-next').textContent = (this.selectedStartingLevel + 1) % total + 1;
        };
        document.getElementById('btn-prev-level').addEventListener('click', () => {
            this.selectedStartingLevel = (this.selectedStartingLevel - 1 + MAZES.length) % MAZES.length;
            updateCarousel();
        });
        document.getElementById('btn-next-level').addEventListener('click', () => {
            this.selectedStartingLevel = (this.selectedStartingLevel + 1) % MAZES.length;
            updateCarousel();
        });
        updateCarousel();

        // Skins UI
        document.getElementById('btn-prev-skin').addEventListener('click', () => {
            this.selectedSkin = (this.selectedSkin - 1 + this.totalSkins) % this.totalSkins;
        });
        document.getElementById('btn-next-skin').addEventListener('click', () => {
            this.selectedSkin = (this.selectedSkin + 1) % this.totalSkins;
        });

        document.getElementById('btn-goto-setup').addEventListener('click', () => {
            this._showGameContainer();
            this._showOverlay('start-screen');
        });
        document.getElementById('btn-back-landing').addEventListener('click', () => this._showLanding());
        document.getElementById('btn-start').addEventListener('click', () => { this.sound.resume(); this._startGame(); });
        document.getElementById('btn-resume').addEventListener('click', () => this._resume());
        document.getElementById('btn-restart').addEventListener('click', () => { this._startGame(); });
        document.getElementById('btn-next').addEventListener('click', () => { this._nextLevel(); });
        document.getElementById('btn-playagain').addEventListener('click', () => { this._startGame(); });
        window.addEventListener('resize', () => this._resize());
    }

    _showOverlay(id) {
        document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden'));
        const el = document.getElementById(id);
        if (el) el.classList.remove('hidden');
    }
    _hideAllOverlays() { document.querySelectorAll('.overlay').forEach(el => el.classList.add('hidden')); }

    _showLanding() {
        document.getElementById('game-container').classList.add('page-hidden');
        document.getElementById('landing-page').classList.remove('page-hidden');
    }

    _showGameContainer() {
        document.getElementById('landing-page').classList.add('page-hidden');
        document.getElementById('game-container').classList.remove('page-hidden');
        this._resize();
    }

    _updateUI() {
        document.getElementById('score-value').textContent = this.score;
        document.getElementById('highscore-value').textContent = this.highScore;
        document.getElementById('level-value').textContent = this.level + 1;
        const lc = document.getElementById('lives-container');
        lc.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const d = document.createElement('div');
            d.className = 'life-icon';
            lc.appendChild(d);
        }
    }

    _startGame() {
        this.level = this.selectedStartingLevel;
        this.score = 0;
        this.lives = 3;
        this._loadLevel();
        this._hideAllOverlays();
        this.state = GS_READY;
        this.stateTimer = 2;
        this._updateUI();
    }

    _loadLevel() {
        this.maze = MAZES[this.level % MAZES.length].map(row => [...row]);
        this.totalDots = 0;
        this.dotsEaten = 0;
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                if (this.maze[r][c] === T_DOT || this.maze[r][c] === T_POWER) this.totalDots++;

                this.pac = { x: PAC_START.x, y: PAC_START.y, dir: DIR_NONE, nextDir: DIR_NONE, progress: 0, speed: 6 + this.level * 0.3 };
        this.ghosts = [];
        for (let i = 0; i < 4; i++) {
            this.ghosts.push({
                type: i, x: GHOST_STARTS[i].x, y: GHOST_STARTS[i].y, dir: DIR_UP, progress: 0, speed: 4.5 + this.level * 0.25,
                mode: i === 0 ? GMODE_SCATTER : GMODE_HOUSE, houseTimer: i * 3, frightenedTimer: 0, color: GHOST_COLORS[i]
            });
        }
        this.ghostMode = GMODE_SCATTER;
        this.modePhase = 0;
        this.modeTimer = 0;
        this.frightenedTimer = 0;
        this.ghostsEatenCombo = 0;
        this.inputDir = DIR_NONE;
        this.flashTimer = 0;
        this.scorePopups = [];
    }

    _nextLevel() { this.level++; this._loadLevel(); this._hideAllOverlays(); this.state = GS_READY; this.stateTimer = 2; this._updateUI(); }
    _pause() { this.state = GS_PAUSED; this._showOverlay('pause-screen'); }
    _resume() { this.state = GS_PLAYING; this._hideAllOverlays(); }
    _die() { this.sound.death(); this.state = GS_DYING; this.deathAnimProgress = 0; this.stateTimer = 1.5; }

    _afterDeath() {
        this.lives--;
        if (this.lives <= 0) {
            this.state = GS_GAMEOVER;
            document.getElementById('final-score').textContent = this.score;
            this._showOverlay('gameover-screen');
            this._saveHighScore();
        } else {
            this.pac.x = PAC_START.x; this.pac.y = PAC_START.y; this.pac.dir = DIR_NONE; this.pac.nextDir = DIR_NONE; this.pac.progress = 0;
            for (let i = 0; i < 4; i++) {
                this.ghosts[i].x = GHOST_STARTS[i].x; this.ghosts[i].y = GHOST_STARTS[i].y;
                this.ghosts[i].dir = DIR_UP; this.ghosts[i].progress = 0;
                this.ghosts[i].mode = i === 0 ? GMODE_SCATTER : GMODE_HOUSE;
                this.ghosts[i].houseTimer = i * 3;
            }
            this.ghostMode = GMODE_SCATTER; this.modePhase = 0; this.modeTimer = 0; this.frightenedTimer = 0;
            this.inputDir = DIR_NONE; this.state = GS_READY; this.stateTimer = 2;
        }
        this._updateUI();
    }

    _levelComplete() { this.sound.levelUp(); this.state = GS_LEVELWIN; this.flashTimer = 0; this.stateTimer = 2.5; }
    _saveHighScore() { if (this.score > this.highScore) { this.highScore = this.score; localStorage.setItem('pacOptHighScore', String(this.highScore)); } }

    _tileAt(x, y) { return (x < 0 || x >= COLS || y < 0 || y >= ROWS) ? T_WALL : this.maze[y][x]; }
    _isWalkable(x, y, isGhost, isEaten) {
        const t = this._tileAt(x, y);
        if (t === T_WALL) return false;
        if (t === T_GWALL) return isEaten;
        if (t === T_GDOOR) return isGhost;
        return true;
    }
    _canMove(x, y, dir, isGhost, isEaten) { return this._isWalkable(x + DX[dir], y + DY[dir], isGhost, isEaten); }

    _ghostTarget(g) {
        if (g.mode === GMODE_SCATTER) return GHOST_SCATTER_TARGETS[g.type];
        if (g.mode === GMODE_EATEN) return { x: 10, y: 9 };
        if (g.mode === GMODE_FRIGHTENED) return null;

        const px = this.pac.x, py = this.pac.y;
        if (g.type === 0) return { x: px, y: py };
        if (g.type === 1) return { x: Math.max(0, Math.min(COLS - 1, px + DX[this.pac.dir] * 4)), y: Math.max(0, Math.min(ROWS - 1, py + DY[this.pac.dir] * 4)) };
        if (g.type === 2) {
            const b = this.ghosts[0], ax = px + DX[this.pac.dir] * 2, ay = py + DY[this.pac.dir] * 2;
            return { x: Math.max(0, Math.min(COLS - 1, ax + (ax - b.x))), y: Math.max(0, Math.min(ROWS - 1, ay + (ay - b.y))) };
        }
        if (g.type === 3) return (Math.abs(px - g.x) + Math.abs(py - g.y) > 8) ? { x: px, y: py } : GHOST_SCATTER_TARGETS[3];
        return { x: px, y: py };
    }

    _ghostChooseDir(g) {
        const target = this._ghostTarget(g), isEaten = g.mode === GMODE_EATEN, isFrightened = g.mode === GMODE_FRIGHTENED;
        const available = [];
        for (let d = 0; d < 4; d++) {
            if (d === OPPOSITE_DIR[g.dir] && g.dir !== DIR_NONE) continue;
            if (this._canMove(g.x, g.y, d, true, isEaten)) available.push(d);
        }
        if (available.length === 0) return this._canMove(g.x, g.y, OPPOSITE_DIR[g.dir], true, isEaten) ? OPPOSITE_DIR[g.dir] : DIR_NONE;
        if (isFrightened) return available[Math.floor(Math.random() * available.length)];
        if (!target) return available[0];

        let bestDir = available[0], bestDist = Infinity;
        for (const d of available) {
            const dist = (g.x + DX[d] - target.x) ** 2 + (g.y + DY[d] - target.y) ** 2;
            if (dist < bestDist) { bestDist = dist; bestDir = d; }
        }
        return bestDir;
    }

    static MODE_SCHEDULE = [[GMODE_SCATTER, 7], [GMODE_CHASE, 20], [GMODE_SCATTER, 7], [GMODE_CHASE, 20], [GMODE_SCATTER, 5], [GMODE_CHASE, 999999]];

    _update(dt) {
        if (this.state === GS_MENU) return;
        this.animTime += dt;

        this.scorePopups = this.scorePopups.filter(p => { p.timer -= dt; p.y -= 30 * dt; return p.timer > 0; });

        if (this.state === GS_READY) { if ((this.stateTimer -= dt) <= 0) this.state = GS_PLAYING; return; }
        if (this.state === GS_DYING) { this.deathAnimProgress += dt / 1.5; if ((this.stateTimer -= dt) <= 0) this._afterDeath(); return; }
        if (this.state === GS_LEVELWIN) {
            this.flashTimer += dt;
            if ((this.stateTimer -= dt) <= 0) {
                if (this.level >= MAZES.length - 1) {
                    this.state = GS_WIN; document.getElementById('win-score').textContent = this.score;
                    this._showOverlay('win-screen'); this._saveHighScore();
                } else {
                    document.getElementById('level-score').textContent = this.score;
                    this._showOverlay('levelcomplete-screen'); this.state = GS_LEVELWIN;
                }
            }
            return;
        }
        if (this.state === GS_EAT_GHOST) { if ((this.stateTimer -= dt) <= 0) this.state = GS_PLAYING; return; }
        if (this.state !== GS_PLAYING) return;

        // Mode updates
        this.modeTimer += dt;
        if (this.frightenedTimer > 0) {
            if ((this.frightenedTimer -= dt) <= 0) {
                this.frightenedTimer = 0; this.ghostsEatenCombo = 0;
                for (const g of this.ghosts) if (g.mode === GMODE_FRIGHTENED) g.mode = this.ghostMode;
            }
        } else {
            const sch = PacManGame.MODE_SCHEDULE;
            if (this.modePhase < sch.length && this.modeTimer >= sch[this.modePhase][1]) {
                this.modeTimer = 0; this.modePhase++;
                if (this.modePhase < sch.length) {
                    this.ghostMode = sch[this.modePhase][0];
                    for (const g of this.ghosts) if (![GMODE_HOUSE, GMODE_EATEN, GMODE_FRIGHTENED].includes(g.mode)) {
                        g.mode = this.ghostMode; g.dir = OPPOSITE_DIR[g.dir];
                    }
                }
            }
        }

        this._updatePacMan(dt);
        for (const g of this.ghosts) this._updateGhost(g, dt);
        this._checkCollisions();
    }

    _updatePacMan(dt) {
        const p = this.pac;
        if (this.inputDir !== DIR_NONE) p.nextDir = this.inputDir;
        if (p.progress === 0 && p.nextDir !== DIR_NONE && this._canMove(p.x, p.y, p.nextDir, false, false)) { p.dir = p.nextDir; p.nextDir = DIR_NONE; }
        if (p.dir === DIR_NONE) return;

        p.progress += p.speed * dt;
        while (p.progress >= 1) {
            p.progress -= 1;
            p.x += DX[p.dir]; p.y += DY[p.dir];

            const t = this.maze[p.y][p.x];
            if (t === T_DOT) { this.maze[p.y][p.x] = T_EMPTY; this.score += 10; this.dotsEaten++; this.sound.dot(); }
            else if (t === T_POWER) { this.maze[p.y][p.x] = T_EMPTY; this.score += 50; this.dotsEaten++; this.sound.power(); this._activateFrightened(); }

            this._updateUI();
            if (this.dotsEaten >= this.totalDots) { this._levelComplete(); return; }
            if (p.nextDir !== DIR_NONE && this._canMove(p.x, p.y, p.nextDir, false, false)) { p.dir = p.nextDir; p.nextDir = DIR_NONE; }
            if (!this._canMove(p.x, p.y, p.dir, false, false)) { p.dir = DIR_NONE; p.progress = 0; break; }
        }
    }

    _activateFrightened() {
        this.frightenedTimer = Math.max(2, 6 - this.level * 0.5);
        this.ghostsEatenCombo = 0;
        for (const g of this.ghosts) if (g.mode !== GMODE_HOUSE && g.mode !== GMODE_EATEN) {
            g.mode = GMODE_FRIGHTENED; g.dir = OPPOSITE_DIR[g.dir]; g.speed = 3;
        }
    }

    _updateGhost(g, dt) {
        if (g.mode === GMODE_HOUSE) {
            if ((g.houseTimer -= dt) <= 0) {
                g.x = 10; g.y = 7; g.progress = 0;
                g.mode = this.frightenedTimer > 0 ? GMODE_FRIGHTENED : this.ghostMode;
                g.dir = DIR_LEFT; g.speed = g.mode === GMODE_FRIGHTENED ? 3 : 4.5 + this.level * 0.25;
            }
            return;
        }
        g.speed = g.mode === GMODE_FRIGHTENED ? 3 : (g.mode === GMODE_EATEN ? 10 : 4.5 + this.level * 0.25);
        g.progress += g.speed * dt;
        while (g.progress >= 1) {
            g.progress -= 1; g.x += DX[g.dir]; g.y += DY[g.dir];
            if (g.mode === GMODE_EATEN && g.x === 10 && g.y === 9) {
                g.x = GHOST_STARTS[g.type].x; g.y = GHOST_STARTS[g.type].y;
                g.mode = GMODE_HOUSE; g.houseTimer = 1; g.progress = 0; return;
            }
            g.dir = this._ghostChooseDir(g);
            if (g.dir === DIR_NONE) { g.progress = 0; break; }
            if (!this._canMove(g.x, g.y, g.dir, true, g.mode === GMODE_EATEN)) {
                g.dir = this._ghostChooseDir(g);
                if (g.dir === DIR_NONE || !this._canMove(g.x, g.y, g.dir, true, g.mode === GMODE_EATEN)) { g.progress = 0; break; }
            }
        }
    }

    _checkCollisions() {
        const p = this.pac;
        for (const g of this.ghosts) {
            if (g.mode === GMODE_HOUSE) continue;
            const px = p.x + (p.dir !== DIR_NONE ? DX[p.dir] * p.progress : 0);
            const py = p.y + (p.dir !== DIR_NONE ? DY[p.dir] * p.progress : 0);
            const gx = g.x + (g.dir !== DIR_NONE ? DX[g.dir] * g.progress : 0);
            const gy = g.y + (g.dir !== DIR_NONE ? DY[g.dir] * g.progress : 0);

            if (Math.sqrt((px - gx) ** 2 + (py - gy) ** 2) < 0.7) {
                if (g.mode === GMODE_FRIGHTENED) {
                    g.mode = GMODE_EATEN; this.ghostsEatenCombo++;
                    const pts = 200 * Math.pow(2, this.ghostsEatenCombo - 1);
                    this.score += pts; this._updateUI(); this._saveHighScore(); this.sound.eatGhost();
                    this.scorePopups.push({ x: gx * this.tileSize, y: gy * this.tileSize, text: String(pts), timer: 1 });
                    this.state = GS_EAT_GHOST; this.stateTimer = 0.4; return;
                } else if (g.mode !== GMODE_EATEN) {
                    this._die(); return;
                }
            }
        }
    }

    _render() {
        const ctx = this.ctx, ts = this.tileSize, w = this.canvas.width, h = this.canvas.height;
        const bgGrad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h));
        bgGrad.addColorStop(0, '#e8e8e8'); bgGrad.addColorStop(0.5, '#c8c8c8'); bgGrad.addColorStop(1, '#989898');
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, w, h);

        if (this.state === GS_MENU) {
            this._renderMenuBg();
            const sCanvas = document.getElementById('skin-preview-canvas');
            if (sCanvas) {
                const sCtx = sCanvas.getContext('2d');
                sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);
                this._renderSkin(sCtx, sCanvas.width/2, sCanvas.height/2, 24, this.selectedSkin, this.animTime, DIR_RIGHT);
            }
            return;
        }

        this._renderMaze(ctx, ts);

        if (this.state === GS_LEVELWIN) {
            if (Math.floor(this.flashTimer * 6) % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(0, 0, w, h); }
            this._renderPacMan(ctx, ts);
            return;
        }

        if (this.state !== GS_GAMEOVER && this.state !== GS_WIN) {
            for (const g of this.ghosts) if (g.mode !== GMODE_HOUSE) this._renderGhost(ctx, ts, g);
            if (this.state === GS_DYING) this._renderDyingPacMan(ctx, ts);
            else this._renderPacMan(ctx, ts);
        }

        for (const p of this.scorePopups) {
            ctx.globalAlpha = Math.min(1, p.timer * 2);
            ctx.fillStyle = '#00ffff'; ctx.font = `bold ${Math.floor(ts * 0.55)}px "Outfit", sans-serif`;
            ctx.textAlign = 'center'; ctx.fillText(p.text, p.x + ts / 2, p.y); ctx.globalAlpha = 1;
        }

        if (this.state === GS_READY) {
            ctx.fillStyle = '#ffd700'; ctx.font = `bold ${Math.floor(ts * 1.2)}px "Outfit", sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(255,215,0,0.5)'; ctx.shadowBlur = 15;
            ctx.fillText('GET READY!', w / 2, h / 2); ctx.shadowBlur = 0;
        }
    }

    _renderMenuBg() {
        const savedMaze = this.maze;
        this.maze = MAZES[this.selectedStartingLevel].map(r => [...r]);
        this._renderMaze(this.ctx, this.tileSize);
        this.maze = savedMaze;
        this.ctx.fillStyle = 'rgba(10,10,15,0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    _renderMaze(ctx, ts) {
        if (!this.maze) return;
        const isW = (c, r) => (c < 0 || c >= COLS || r < 0 || r >= ROWS) || [T_WALL, T_GWALL, T_GDOOR].includes(this.maze[r][c]);

        // Rounded-rect path helper
        const rr = (x, y, w, h, rad) => {
            const rc = Math.max(0, Math.min(rad, w / 2, h / 2));
            ctx.moveTo(x + rc, y);
            ctx.arcTo(x + w, y, x + w, y + h, rc);
            ctx.arcTo(x + w, y + h, x, y + h, rc);
            ctx.arcTo(x, y + h, x, y, rc);
            ctx.arcTo(x, y, x + w, y, rc);
            ctx.closePath();
        };

        // Each wall tile is filled as a rounded block, bridged to its right/bottom
        // neighbor when that neighbor is also a wall. Filling (instead of stroking a
        // thin skeleton) avoids seams on long runs and avoids "bullseye ring" artifacts
        // that a near-zero-length stroked path produces on isolated single wall tiles.
        const drawLayer = (pad, rad, color, withShadow) => {
            ctx.beginPath();
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (this.maze[r][c] !== T_WALL && this.maze[r][c] !== T_GWALL) continue;
                    const x = c * ts, y = r * ts;
                    rr(x + pad, y + pad, ts - pad * 2, ts - pad * 2, rad);
                    if (c + 1 < COLS && isW(c + 1, r)) rr(x + ts / 2, y + pad, ts, ts - pad * 2, 0);
                    if (r + 1 < ROWS && isW(c, r + 1)) rr(x + pad, y + ts / 2, ts - pad * 2, ts, 0);
                }
            }
            if (withShadow) {
                ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
                ctx.shadowOffsetY = ts * 0.1;
                ctx.shadowBlur = ts * 0.12;
            } else {
                ctx.shadowColor = 'transparent';
                ctx.shadowOffsetY = 0;
                ctx.shadowBlur = 0;
            }
            ctx.fillStyle = color;
            ctx.fill();
        };

        drawLayer(ts * 0.08, ts * 0.26, '#282828', true);
        drawLayer(ts * 0.18, ts * 0.18, '#353535', false);
        drawLayer(ts * 0.27, ts * 0.11, '#222', false);
        ctx.shadowColor = 'transparent'; ctx.shadowOffsetY = 0; ctx.shadowBlur = 0;

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const t = this.maze[r][c], x = c * ts, y = r * ts;
                if (t === T_GDOOR) {
                    ctx.fillStyle = '#ff88aa'; ctx.fillRect(x + 1, y + ts / 2 - ts * 0.1, ts - 2, ts * 0.2);
                } else if (t === T_DOT) {
                    ctx.fillStyle = '#333'; ctx.beginPath(); ctx.arc(x + ts / 2, y + ts / 2, ts * 0.15, 0, Math.PI * 2); ctx.fill();
                } else if (t === T_POWER) {
                    const pulse = 0.7 + 0.3 * Math.sin(this.animTime * 5), pelletR = ts * 0.35 * pulse;
                    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(x + ts / 2, y + ts / 2, pelletR, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#ff3333'; ctx.beginPath(); ctx.arc(x + ts / 2, y + ts / 2, pelletR * 0.5, 0, Math.PI * 2); ctx.fill();
                }
            }
        }
    }

    _renderSkin(ctx, x, y, r, skinIndex, animTime, dir) {
        if (skinIndex === 0) {
            // Classic Pac-Man
            const mouth = Math.abs(Math.sin(animTime * 12)) * 0.35;
            let angle = 0;
            if (dir === DIR_DOWN) angle = Math.PI / 2;
            else if (dir === DIR_LEFT) angle = Math.PI;
            else if (dir === DIR_UP) angle = -Math.PI / 2;

            ctx.fillStyle = '#ffe135';
            ctx.shadowColor = 'rgba(255,225,53,0.4)'; ctx.shadowBlur = 8;
            ctx.beginPath(); ctx.arc(x, y, r, angle + mouth, angle + Math.PI * 2 - mouth); ctx.lineTo(x, y); ctx.fill();
            ctx.shadowBlur = 0;
            const eyeX = x + Math.cos(angle - 0.5) * r * 0.45, eyeY = y + Math.sin(angle - 0.5) * r * 0.45;
            ctx.fillStyle = '#1a1a2e'; ctx.beginPath(); ctx.arc(eyeX, eyeY, r * 0.12, 0, Math.PI * 2); ctx.fill();
            return;
        }

        const colors = ['', '#ff2a2a', '#ff7bb4', '#ffb866', '#ff6b6b', '#b3ff66', '#ffea66', '#66ffff'];
        const color = colors[skinIndex];

        ctx.save();
        ctx.translate(x, y);

        // Bounce Animation
        const walkCycle = (animTime * 8) % (Math.PI * 2);
        const bounce = Math.abs(Math.sin(walkCycle)) * r * 0.15;
        ctx.translate(0, -bounce);

        // Legs
        ctx.fillStyle = '#111';
        const legSwing = Math.sin(animTime * 12) * r * 0.2;
        ctx.beginPath(); ctx.ellipse(-r * 0.3, r * 0.5, r * 0.15, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(-r * 0.3 + legSwing, r * 0.8, r * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(r * 0.3, r * 0.5, r * 0.15, r * 0.25, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(r * 0.3 - legSwing, r * 0.8, r * 0.15, 0, Math.PI * 2); ctx.fill();

        // Custom Body shape
        ctx.fillStyle = color;
        ctx.shadowColor = color; ctx.shadowBlur = 8;
        ctx.beginPath();
        if (skinIndex === 1) { // 1: Red Heart (Pixelated style block)
            const s = r * 0.25;
            const grid = [" .XX.XX. ", " XXXXXXX ", " XXXXXXX ", " XXXXXXX ", " .XXXXX. ", " ..XXX.. ", " ...X... "];
            for (let row = 0; row < grid.length; row++)
                for (let col = 0; col < grid[row].length; col++)
                    if (grid[row][col] === 'X') ctx.rect((col - 4) * s, (row - 3.5) * s, s + 0.5, s + 0.5);
        } else if (skinIndex === 2 || skinIndex === 3) { // 2&3: Cloud shape
            ctx.arc(0, -r*0.3, r*0.5, 0, Math.PI*2); ctx.arc(0, r*0.3, r*0.5, 0, Math.PI*2);
            ctx.arc(-r*0.4, 0, r*0.5, 0, Math.PI*2); ctx.arc(r*0.4, 0, r*0.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(0, 0, r*0.6, 0, Math.PI*2);
        } else if (skinIndex === 4 || skinIndex === 5) { // 4&5: Smooth 4-point star
            ctx.moveTo(0, -r * 1.1); ctx.quadraticCurveTo(r*0.3, -r*0.3, r * 1.1, 0);
            ctx.quadraticCurveTo(r*0.3, r*0.3, 0, r * 1.1); ctx.quadraticCurveTo(-r*0.3, r*0.3, -r * 1.1, 0);
            ctx.quadraticCurveTo(-r*0.3, -r*0.3, 0, -r * 1.1);
        } else if (skinIndex === 6 || skinIndex === 7) { // 6&7: Spiky 8-point sun
            for(let i=0; i<16; i++){
                const a = i * Math.PI/8, d = i%2===0 ? r * 1.1 : r*0.5;
                ctx.lineTo(Math.cos(a)*d, Math.sin(a)*d);
            }
        }
        ctx.fill(); ctx.shadowBlur = 0;

        // Arms
        ctx.fillStyle = '#111'; ctx.beginPath();
        ctx.arc(-r * 0.7, r * 0.1, r * 0.12, 0, Math.PI * 2); ctx.arc(r * 0.7, r * 0.1, r * 0.12, 0, Math.PI * 2); ctx.fill();

        // Infinity Glasses (Black Outline)
        ctx.beginPath(); ctx.arc(-r*0.25, -r*0.1, r*0.35, 0, Math.PI*2); ctx.arc(r*0.25, -r*0.1, r*0.35, 0, Math.PI*2); ctx.fill();
        // Infinity Glasses (White Inside)
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-r*0.25, -r*0.1, r*0.2, 0, Math.PI*2); ctx.arc(r*0.25, -r*0.1, r*0.2, 0, Math.PI*2); ctx.fill();

        // Pupils
        ctx.fillStyle = '#000'; ctx.beginPath();
        let px = 0, py = 0;
        if (dir === DIR_LEFT) px = -r*0.08;
        if (dir === DIR_RIGHT) px = r*0.08;
        if (dir === DIR_UP) py = -r*0.08;
        if (dir === DIR_DOWN) py = r*0.08;
        ctx.arc(-r*0.25 + px, -r*0.1 + py, r*0.1, 0, Math.PI*2); ctx.arc(r*0.25 + px, -r*0.1 + py, r*0.1, 0, Math.PI*2); ctx.fill();

        ctx.restore();
    }

    _renderPacMan(ctx, ts) {
        const p = this.pac;
        let px = p.x * ts + ts / 2, py = p.y * ts + ts / 2;
        if (p.dir !== DIR_NONE) { px += DX[p.dir] * p.progress * ts; py += DY[p.dir] * p.progress * ts; }
        this._renderSkin(ctx, px, py, ts * 0.42, this.selectedSkin, this.animTime, p.dir === DIR_NONE ? DIR_RIGHT : p.dir);
    }

    _renderDyingPacMan(ctx, ts) {
        const p = this.pac, px = p.x * ts + ts / 2, py = p.y * ts + ts / 2, r = ts * 0.42;
        const progress = Math.min(1, this.deathAnimProgress);
        if (this.selectedSkin === 0) {
            ctx.fillStyle = '#ffe135'; ctx.shadowColor = 'rgba(255,225,53,0.4)'; ctx.shadowBlur = 8;
            ctx.beginPath();
            const sa = -Math.PI / 2 + progress * Math.PI, ea = -Math.PI / 2 + Math.PI * 2 - progress * Math.PI;
            if (ea > sa) { ctx.arc(px, py, r * (1 - progress * 0.5), sa, ea); ctx.lineTo(px, py); ctx.fill(); }
            ctx.shadowBlur = 0;
        } else {
            ctx.save(); ctx.translate(px, py); ctx.rotate(progress * Math.PI * 4); ctx.globalAlpha = 1 - progress;
            this._renderSkin(ctx, 0, 0, r * (1 - progress), this.selectedSkin, 0, DIR_RIGHT);
            ctx.restore();
        }
    }

    _renderGhost(ctx, ts, g) {
        let gx = g.x * ts + ts / 2, gy = g.y * ts + ts / 2;
        if (g.dir !== DIR_NONE) { gx += DX[g.dir] * g.progress * ts; gy += DY[g.dir] * g.progress * ts; }
        const r = ts * 0.42;

        if (g.mode === GMODE_EATEN) { this._drawGhostEyes(ctx, gx, gy, r, g.dir); return; }

        let bodyColor = g.color;
        if (g.mode === GMODE_FRIGHTENED) bodyColor = (this.frightenedTimer < 2 && Math.floor(this.animTime * 8) % 2 === 0) ? '#ffffff' : '#2222cc';

        ctx.fillStyle = bodyColor; ctx.shadowColor = bodyColor + '44'; ctx.shadowBlur = 6; ctx.beginPath();
        ctx.arc(gx, gy - r * 0.1, r, Math.PI, 0);
        const waveY = gy + r * 0.8, waveAmp = r * 0.2, segW = (r * 2) / 3;
        ctx.lineTo(gx + r, waveY);
        for (let i = 2; i >= 0; i--) {
            const sx = gx - r + i * segW, wave = Math.sin(this.animTime * 8 + i) * waveAmp;
            ctx.lineTo(sx + segW / 2, waveY + waveAmp + wave); ctx.lineTo(sx, waveY);
        }
        ctx.fill(); ctx.shadowBlur = 0;

        if (g.mode !== GMODE_FRIGHTENED) this._drawGhostEyes(ctx, gx, gy, r, g.dir);
        else {
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(gx - r * 0.25, gy - r * 0.15, r * 0.12, 0, Math.PI * 2); ctx.arc(gx + r * 0.25, gy - r * 0.15, r * 0.12, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(gx - r * 0.35, gy + r * 0.25);
            for (let i = 0; i <= 4; i++) ctx.lineTo(gx - r * 0.35 + i * r * 0.175, gy + r * 0.25 + (i % 2 === 0 ? 0 : r * 0.12));
            ctx.stroke();
        }
    }

    _drawGhostEyes(ctx, gx, gy, r, dir) {
        const eyeR = r * 0.2, pupilR = r * 0.1, eyeOff = r * 0.28;
        for (let side = -1; side <= 1; side += 2) {
            const ex = gx + side * eyeOff, ey = gy - r * 0.15;
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(ex, ey, eyeR, eyeR * 1.3, 0, 0, Math.PI * 2); ctx.fill();
            let pdx = 0, pdy = 0;
            if (dir === DIR_UP) pdy = -pupilR * 0.6; else if (dir === DIR_DOWN) pdy = pupilR * 0.6; else if (dir === DIR_LEFT) pdx = -pupilR * 0.6; else if (dir === DIR_RIGHT) pdx = pupilR * 0.6;
            ctx.fillStyle = '#1a1a44'; ctx.beginPath(); ctx.arc(ex + pdx, ey + pdy, pupilR, 0, Math.PI * 2); ctx.fill();
        }
    }

    _loop(timestamp) {
        const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.lastTime = timestamp;
        this._update(dt); this._render();
        requestAnimationFrame(this._loop);
    }
}

window.addEventListener('DOMContentLoaded', () => new PacManGame());
