class ESPController {
    isEnabled = false;
    game = unsafeWindow.cheat.core.game;
    ui3d = this.game.state.ui3D;
    i18n = require('../../../../i18n/index.js');
    espType = 0;

    data = {
        entity: true,
        player: true
    };

    config = {
        playerColor: "#00ff8c",
        entityColor: "#ff8800",
        selfColor: "#ffff44",
        lineWidth: 1.5,
        showText: true,
        textColor: "#ffffff",
        textSize: 13,
        showTracers: true,
        tracerColor: "#ffffff",
        tracerWidth: 1,
        tracerOpacity: 0.6,
        tracerStartY: 0.94,
        showSelf: true,
        showId: true,
        showPos: true,
        showVector: true
    };

    canvas = null;
    ctx = null;
    gameCanvas = null;
    gameCanvasRect = null;
    drawList = [];
    textContainer = null;
    textElMap = new Map();

    constructor() {
        this.createCanvas();
        this.createTextContainer();
    }

    createCanvas() {
        if (this.canvas) return;
        this.canvas = document.createElement("canvas");
        this.canvas.style.cssText = [
            "position: fixed",
            "z-index: 999",
            "pointer-events: none",
            "user-select: none"
        ].join(";");
        this.ctx = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
    }

    createTextContainer() {
        if (this.textContainer) return;
        this.textContainer = document.createElement("div");
        this.textContainer.style.cssText = [
            "position: fixed",
            "z-index: 999",
            "pointer-events: none",
            "user-select: none"
        ].join(";");
        document.body.appendChild(this.textContainer);
    }

    syncCanvasLayout() {
        const gameCanvas = this.gameCanvas;
        if (!gameCanvas || !this.canvas || !this.textContainer) return;
        const rect = gameCanvas.getBoundingClientRect();
        const prev = this.gameCanvasRect;
        if (prev && prev.left === rect.left && prev.top === rect.top && 
            prev.width === rect.width && prev.height === rect.height) {
            return;
        }
        this.gameCanvasRect = { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
        
        const c = this.canvas.style;
        c.left = rect.left + "px";
        c.top = rect.top + "px";
        c.width = rect.width + "px";
        c.height = rect.height + "px";
        
        const tc = this.textContainer.style;
        tc.left = rect.left + "px";
        tc.top = rect.top + "px";
        tc.width = rect.width + "px";
        tc.height = rect.height + "px";

        const dpr = window.devicePixelRatio || 1;
        const pw = Math.round(rect.width * dpr);
        const ph = Math.round(rect.height * dpr);
        if (this.canvas.width !== pw || this.canvas.height !== ph) {
            this.canvas.width = pw;
            this.canvas.height = ph;
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
    }

    projectToScreen(pos, viewProjection, viewport) {
        const m = viewProjection;
        const w = m[3] * pos[0] + m[7] * pos[1] + m[11] * pos[2] + m[15];
        const x = m[0] * pos[0] + m[4] * pos[1] + m[8] * pos[2] + m[12];
        const y = m[1] * pos[0] + m[5] * pos[1] + m[9] * pos[2] + m[13];
        if (w <= 0) return { x: 0, y: 0, w: 0 };
        return {
            x: (x / w + 1) / 2 * viewport[0],
            y: (1 - y / w) / 2 * viewport[1],
            w: w
        };
    }

    computeBoxCorners(px, py, pz, rx, ry, rz) {
        return [
            [px - rx, py - ry, pz - rz],
            [px + rx, py - ry, pz - rz],
            [px + rx, py + ry, pz - rz],
            [px - rx, py + ry, pz - rz],
            [px - rx, py - ry, pz + rz],
            [px + rx, py - ry, pz + rz],
            [px + rx, py + ry, pz + rz],
            [px - rx, py + ry, pz + rz]
        ];
    }

    updateESP = () => {
        if (!this.isEnabled) return;
        
        const state = this.game.state;
        if (!state?.bodies || !state?.camera) return;
        
        this.gameCanvas = state.dom.canvas;
        this.syncCanvasLayout();
        const rect = this.gameCanvasRect;
        if (!rect) return;

        const viewProjection = state.camera.viewProjection;
        const viewport = [rect.width, rect.height];
        
        const cameraTargetId = state.secret?.replica?.camera?.targetId;
        if (cameraTargetId == null) return;
        
        const selfBody = state.bodies.find(b => b.id === cameraTargetId);
        const selfPx = selfBody?.px ?? 0;
        const selfPy = selfBody?.py ?? 0;
        const selfPz = selfBody?.pz ?? 0;
        
        const playerIndex = state.playerIndex;
        const playerIdSet = new Set();
        if (playerIndex) {
            for (const key of Object.keys(playerIndex)) playerIdSet.add(Number(key));
        }
        
        const replicaPlayers = state.replica?.players ?? [];
        const espType = this.espType;
        this.drawList = [];
        
        for (const body of state.bodies) {
            const isSelf = body.id === cameraTargetId;
            const isPlayer = playerIdSet.has(body.id);
            
            if (isSelf) {
                if (!this.config.showSelf) continue;
            } else {
                if (isPlayer) {
                    if (espType !== 1 && espType !== 0) continue;
                } else {
                    if (espType !== 2 && espType !== 0) continue;
                }
            }
            
            const px = body.px, py = body.py, pz = body.pz;
            const rx = body.rx, ry = body.ry, rz = body.rz;
            
            const corners3d = this.computeBoxCorners(px, py, pz, rx, ry, rz);
            let allVisible = true;
            const screenCorners = [];
            for (let c = 0; c < 8; c++) {
                const proj = this.projectToScreen(corners3d[c], viewProjection, viewport);
                if (proj.w <= 0) { allVisible = false; break; }
                screenCorners.push({ x: proj.x, y: proj.y });
            }
            if (!allVisible) continue;
            
            let color;
            if (isSelf) {
                color = this.config.selfColor;
            } else if (isPlayer) {
                color = this.config.playerColor;
            } else {
                color = this.config.entityColor;
            }
            
            const playerInfo = replicaPlayers.find(p => p.id === body.id);
            const name = isSelf ? "You" : (playerInfo?.name ?? `Entity#${body.id}`);
            const dist = Math.sqrt((px - selfPx)**2 + (py - selfPy)**2 + (pz - selfPz)**2);
            
            let textLines = [name];
            if (this.config.showId) textLines.push(`ID: ${body.id}`);
            if (this.config.showPos) textLines.push(`Pos: ${px.toFixed(1)}, ${py.toFixed(1)}, ${pz.toFixed(1)}`);
            if (this.config.showVector) textLines.push(`Vel: ${body.vx.toFixed(1)}, ${body.vy.toFixed(1)}, ${body.vz.toFixed(1)}`);
            textLines.push(`${dist.toFixed(1)}m`);
            
            const text = textLines.join('\n');
            
            const topCenter = this.projectToScreen([px, py + ry, pz], viewProjection, viewport);
            let screenTopX = 0, screenTopY = 0;
            if (topCenter.w > 0) {
                screenTopX = topCenter.x;
                screenTopY = topCenter.y;
            }
            
            const centerProj = this.projectToScreen([px, py, pz], viewProjection, viewport);
            let screenX = 0, screenY = 0;
            if (centerProj.w > 0) {
                screenX = centerProj.x;
                screenY = centerProj.y;
            }
            
            this.drawList.push({
                corners: screenCorners.map(c => [c.x, c.y]),
                color: color,
                text: text,
                screenTopX: screenTopX,
                screenTopY: screenTopY,
                screenX: screenX,
                screenY: screenY,
                isSelf: isSelf
            });
        }
        
        this.renderBoxes();
        this.renderTracers();
        this.renderTextLabels();
    }

    renderBoxes() {
        if (!this.canvas || !this.ctx) return;
        const rect = this.gameCanvasRect;
        if (!rect) return;
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        const edges = [
            [0,1],[1,2],[2,3],[3,0],
            [4,5],[5,6],[6,7],[7,4],
            [0,4],[1,5],[2,6],[3,7]
        ];
        
        for (const entry of this.drawList) {
            this.ctx.strokeStyle = entry.color;
            this.ctx.lineWidth = this.config.lineWidth;
            this.ctx.globalAlpha = 1;
            this.ctx.beginPath();
            for (const [a, b] of edges) {
                this.ctx.moveTo(entry.corners[a][0], entry.corners[a][1]);
                this.ctx.lineTo(entry.corners[b][0], entry.corners[b][1]);
            }
            this.ctx.stroke();
        }
    }

    renderTracers() {
        if (!this.config.showTracers || !this.canvas || !this.ctx) return;
        if (this.drawList.length === 0) return;
        const rect = this.gameCanvasRect;
        if (!rect) return;
        
        const startX = rect.width / 2;
        const startY = rect.height * this.config.tracerStartY;
        
        this.ctx.save();
        this.ctx.globalAlpha = this.config.tracerOpacity;
        this.ctx.strokeStyle = this.config.tracerColor;
        this.ctx.lineWidth = this.config.tracerWidth;
        for (const entry of this.drawList) {
            if (entry.isSelf) continue;
            if (entry.screenX === 0 && entry.screenY === 0) continue;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(entry.screenX, entry.screenY);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    renderTextLabels() {
        if (!this.textContainer || !this.config.showText) return;
        const seen = new Set();
        for (let i = 0; i < this.drawList.length; i++) {
            const entry = this.drawList[i];
            const key = i;
            seen.add(key);
            let el = this.textElMap.get(key);
            if (!el) {
                el = document.createElement("div");
                el.style.cssText = [
                    "position: absolute",
                    "transform: translate(-50%, -100%)",
                    "white-space: pre-line",
                    "text-align: center",
                    "font-family: 'Consolas', 'Courier New', monospace",
                    "font-weight: 600",
                    "line-height: 1.3",
                    "text-shadow: 0 0 6px rgba(0,0,0,0.85), 0 0 3px rgba(0,0,0,0.95)",
                    "pointer-events: none",
                    "user-select: none"
                ].join(";");
                this.textContainer.appendChild(el);
                this.textElMap.set(key, el);
            }
            el.textContent = entry.text;
            el.style.color = entry.color;
            el.style.fontSize = this.config.textSize + "px";
            el.style.left = entry.screenTopX + "px";
            el.style.top = entry.screenTopY + "px";
            el.style.display = "";
        }
        for (const [key, el] of this.textElMap) {
            if (!seen.has(key)) {
                el.remove();
                this.textElMap.delete(key);
            }
        }
    }

    setType(type) {
        this.espType = type;
        return this;
    }

    onClick = (value) => {
        this.isEnabled = value.state;
        if (this.isEnabled) {
            this.start();
        } else {
            this.stop();
        }
    }

    start() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.isEnabled = true;
        this.canvas.style.opacity = "1";
        this.textContainer.style.opacity = "1";
        
        this.updateESP();
        
        this.lastFrameTime = performance.now();
        this._animationLoop();
    }

    _animationLoop() {
        if (!this.isEnabled) return;
        
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        
        if (delta >= 25) {
            this.updateESP();
            this.lastFrameTime = now;
        }
        
        this.animationId = requestAnimationFrame(this._animationLoop.bind(this));
    }

    stop() {
        this.isEnabled = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.canvas.style.opacity = "0";
        this.textContainer.style.opacity = "0";
        this.drawList = [];
        if (this.ctx) {
            const rect = this.gameCanvasRect;
            if (rect) this.ctx.clearRect(0, 0, rect.width, rect.height);
        }
        for (const [, el] of this.textElMap) el.remove();
        this.textElMap.clear();
    }

    updateType() {
        if (this.data.entity && this.data.player) {
            this.setType(0);
        } else if (this.data.player) {
            this.setType(1);
        } else if (this.data.entity) {
            this.setType(2);
        } else {
            this.setType(-1);
        }
    }

    buildConfig() {
        const t = this.i18n.global.t;
        return [
            {
                type: 'boolean',
                name:  'render.entityesp.configs.Entity',
                default: true,
                onChange: (value) => {
                    this.data.entity = value;
                    this.updateType();
                }
            },
            {
                type: 'boolean',
                name:  'render.entityesp.configs.Player',
                default: true,
                onChange: (value) => {
                    this.data.player = value;
                    this.updateType();
                }
            },
            {
                type: 'boolean',
                name:  'render.entityesp.configs.Show Self',
                default: true,
                onChange: (value) => {
                    this.config.showSelf = value;
                }
            },
            {
                type: 'color',
                name:  'render.entityesp.configs.PlayerColor',
                default: "#00ff8c",
                onChange: (value) => {
                    this.config.playerColor = value;
                }
            },
            {
                type: 'color',
                name:  'render.entityesp.configs.EntityColor',
                default: "#ff8800",
                onChange: (value) => {
                    this.config.entityColor = value;
                }
            },
            {
                type: 'color',
                name:  'render.entityesp.configs.SelfColor',
                default: "#ffff44",
                onChange: (value) => {
                    this.config.selfColor = value;
                }
            },
            {
                type: 'color',
                name:  'render.entityesp.configs.TracerColor',
                default: "#ffffff",
                onChange: (value) => {
                    this.config.tracerColor = value;
                }
            },
            {
                type: 'color',
                name:  'render.entityesp.configs.TextColor',
                default: "#ffffff",
                onChange: (value) => {
                    this.config.textColor = value;
                }
            },
            {
                type: 'number',
                name:  'render.entityesp.configs.BoxLineWidth',
                default: 1.5,
                min: 0.5,
                max: 5,
                step: 0.1,
                onChange: (value) => {
                    this.config.lineWidth = value;
                }
            },
            {
                type: 'number',
                name:  'render.entityesp.configs.TracerWidth',
                default: 1,
                min: 0.5,
                max: 5,
                step: 0.1,
                onChange: (value) => {
                    this.config.tracerWidth = value;
                }
            },
            {
                type: 'number',
                name:  'render.entityesp.configs.TextSize',
                default: 13,
                min: 8,
                max: 24,
                step: 1,
                onChange: (value) => {
                    this.config.textSize = value;
                }
            },
            {
                type: 'boolean',
                name:  'render.entityesp.configs.ShowTracers',
                default: true,
                onChange: (value) => {
                    this.config.showTracers = value;
                }
            },
            {
                type: 'number',
                name:  'render.entityesp.configs.TracerOpacity',
                default: 0.6,
                min: 0,
                max: 1,
                step: 0.05,
                onChange: (value) => {
                    this.config.tracerOpacity = value;
                }
            },
            {
                type: 'number',
                name:  'render.entityesp.configs.TracerStartY(%)',
                default: 0.94,
                min: 0.5,
                max: 1,
                step: 0.01,
                onChange: (value) => {
                    this.config.tracerStartY = value;
                }
            },
            {
                type: 'boolean',
                name:  'render.entityesp.configs.ShowText',
                default: true,
                onChange: (value) => {
                    this.config.showText = value;
                }
            },
            {
                type: 'boolean',
                name:  'render.entityesp.configs.ShowID',
                default: true,
                onChange: (value) => {
                    this.config.showId = value;
                }
            },
            {
                type: 'boolean',
                name:  'render.entityesp.configs.ShowPosition',
                default: true,
                onChange: (value) => {
                    this.config.showPos = value;
                }
            },
            {
                type: 'boolean',
                name:  'render.entityesp.configs.ShowVelocity',
                default: true,
                onChange: (value) => {
                    this.config.showVector = value;
                }
            }
        ];
    }
}

function main() {
    const esp = new ESPController();
    const t = esp.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: esp.onClick,
            hotkey: "m",
            configs: esp.buildConfig(),
            name: 'render.entityesp.name'
        },
        func: esp
    };
}

module.exports = { main };