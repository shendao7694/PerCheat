const { BLOCKS } = require("./blocks.js")

class BlockTrackController {
    isEnabled = false;
    game = unsafeWindow.cheat.core.game;
    state = this.game.state;
    voxel = this.state.voxel;
    blockIndex = BLOCKS;
    ui3D = this.state.ui3D;
    i18n = require('../../../../i18n/index.js');
    targetBlocks = ['barrier'];
    timer = null;
    markers = [];
    running = false;

    config = {
        boxColor: "#FF0000",
        boxSize: 0.5,
        lineWidth: 2,
        showTracers: false,
        tracerColor: "#FF0000",
        tracerWidth: 1,
        tracerOpacity: 0.5,
        tracerStartY: 0.94,
        showText: false,
        textColor: "#ffffff",
        textSize: 12,
        showBox: true,
        showMarker: false
    };

    canvas = null;
    ctx = null;
    gameCanvas = null;
    gameCanvasRect = null;
    drawList = [];
    textContainer = null;
    textElMap = new Map();

    constructor() {
        if (!this.state) return;
        this.createCanvas();
        this.createTextContainer();
    }

    createCanvas() {
        if (this.canvas) return;
        this.canvas = document.createElement("canvas");
        this.canvas.style.cssText = [
            "position: fixed",
            "z-index: 9999",
            "pointer-events: none",
            "user-select: none",
            "top: 0",
            "left: 0"
        ].join(";");
        this.ctx = this.canvas.getContext("2d");
        document.body.appendChild(this.canvas);
    }

    createTextContainer() {
        if (this.textContainer) return;
        this.textContainer = document.createElement("div");
        this.textContainer.style.cssText = [
            "position: fixed",
            "z-index: 9999",
            "pointer-events: none",
            "user-select: none",
            "top: 0",
            "left: 0"
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

    computeBoxCorners(px, py, pz, size) {
        return [
            [px - size, py - size, pz - size],
            [px + size, py - size, pz - size],
            [px + size, py + size, pz - size],
            [px - size, py + size, pz - size],
            [px - size, py - size, pz + size],
            [px + size, py - size, pz + size],
            [px + size, py + size, pz + size],
            [px - size, py + size, pz + size]
        ];
    }

    getBlockId(name) {
        return this.blockIndex?.id?.[name] || 0;
    }

    getTargetIds() {
        const ids = [];
        for (const name of this.targetBlocks) {
            const id = this.getBlockId(name);
            if (id > 0) ids.push(id);
        }
        return ids;
    }

    getPlayerPos() {
        try {
            const bodies = this.state.bodies;
            const secretId = this.state.secret?.id;
            if (bodies && secretId !== undefined) {
                const player = bodies.find(b => b.id === secretId);
                if (player) return [player.px, player.py, player.pz];
            }
        } catch(e) {}
        return [0, 0, 0];
    }

    scanAndMark = () => {
        if (!this.isEnabled) return;
        
        const targetIds = this.getTargetIds();
        if (targetIds.length === 0) return;

        const shape = this.voxel.shape;
        if (!shape || shape.length < 3) return;

        const playerPos = this.getPlayerPos();
        const maxDist = 50;
        const range = 40;

        for (let i = this.markers.length - 1; i >= 0; i--) {
            const idx = this.ui3D.elements.indexOf(this.markers[i]);
            if (idx > -1) this.ui3D.elements.splice(idx, 1);
        }
        this.markers = [];

        const needCanvas = this.config.showBox || this.config.showTracers || this.config.showText;
        
        if (needCanvas) {
            const state = this.game.state;
            if (!state?.camera) return;
            this.gameCanvas = state.dom.canvas;
            this.syncCanvasLayout();
            const rect = this.gameCanvasRect;
            if (!rect) return;
            this.ctx.clearRect(0, 0, rect.width, rect.height);
        }
        
        this.drawList = [];

        const startX = Math.floor(playerPos[0] - range);
        const endX = Math.ceil(playerPos[0] + range);
        const startY = Math.floor(playerPos[1] - range);
        const endY = Math.ceil(playerPos[1] + range);
        const startZ = Math.floor(playerPos[2] - range);
        const endZ = Math.ceil(playerPos[2] + range);
        
        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                for (let z = startZ; z < endZ; z++) {
                    try {
                        const voxelId = this.voxel.getVoxel(x, y, z);
                        const blockId = voxelId & 0x3FFF;
                        if (targetIds.includes(blockId)) {
                            const pos = [x + 0.5, y + 0.5, z + 0.5];
                            const dx = pos[0] - playerPos[0];
                            const dy = pos[1] - playerPos[1];
                            const dz = pos[2] - playerPos[2];
                            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
                            
                            if (dist <= maxDist) {
                                if (this.config.showMarker) {
                                    const scale = (4 / (dist + 1)) * 4;
                                    const marker = {
                                        type: 'text',
                                        data: {
                                            text: '⬛',
                                            position: pos,
                                            scale: scale,
                                            fill: this.config.boxColor,
                                            font: 'bold 30px Arial',
                                            perspective: false,
                                            zIndex: 9999
                                        }
                                    };
                                    this.ui3D.elements.push(marker);
                                    this.markers.push(marker);
                                }

                                if (needCanvas) {
                                    const state = this.game.state;
                                    const viewProjection = state.camera.viewProjection;
                                    const rect = this.gameCanvasRect;
                                    const viewport = [rect.width, rect.height];
                                    
                                    const corners3d = this.computeBoxCorners(pos[0], pos[1], pos[2], this.config.boxSize);
                                    let allVisible = true;
                                    const screenCorners = [];
                                    for (let c = 0; c < 8; c++) {
                                        const proj = this.projectToScreen(corners3d[c], viewProjection, viewport);
                                        if (proj.w <= 0) { allVisible = false; break; }
                                        screenCorners.push({ x: proj.x, y: proj.y });
                                    }
                                    if (!allVisible) continue;

                                    const centerProj = this.projectToScreen(pos, viewProjection, viewport);
                                    let screenX = 0, screenY = 0;
                                    if (centerProj.w > 0) {
                                        screenX = centerProj.x;
                                        screenY = centerProj.y;
                                    }

                                    const blockName = Object.keys(this.blockIndex.id).find(key => this.blockIndex.id[key] === blockId) || `Block ${blockId}`;
                                    const text = `${blockName}\n${pos[0].toFixed(1)}, ${pos[1].toFixed(1)}, ${pos[2].toFixed(1)}\n${dist.toFixed(1)}m`;

                                    const topCenter = this.projectToScreen([pos[0], pos[1] + this.config.boxSize + 0.3, pos[2]], viewProjection, viewport);
                                    let screenTopX = 0, screenTopY = 0;
                                    if (topCenter.w > 0) {
                                        screenTopX = topCenter.x;
                                        screenTopY = topCenter.y;
                                    }

                                    this.drawList.push({
                                        corners: screenCorners.map(c => [c.x, c.y]),
                                        color: this.config.boxColor,
                                        text: text,
                                        screenTopX: screenTopX,
                                        screenTopY: screenTopY,
                                        screenX: screenX,
                                        screenY: screenY,
                                        blockName: blockName,
                                        pos: pos,
                                        dist: dist
                                    });
                                }
                            }
                        }
                    } catch(e) {}
                }
            }
        }

        if (needCanvas) {
            this.renderBoxes();
            this.renderTracers();
            this.renderTextLabels();
        }
    }

    renderBoxes() {
        if (!this.config.showBox || !this.canvas || !this.ctx) return;
        if (this.drawList.length === 0) return;
        
        const edges = [
            [0,1],[1,2],[2,3],[3,0],
            [4,5],[5,6],[6,7],[7,4],
            [0,4],[1,5],[2,6],[3,7]
        ];
        
        this.ctx.save();
        for (const entry of this.drawList) {
            this.ctx.strokeStyle = entry.color;
            this.ctx.lineWidth = this.config.lineWidth;
            this.ctx.globalAlpha = 1;
            this.ctx.beginPath();
            for (const [a, b] of edges) {
                this.ctx.moveTo(entry.corners[a][0], entry.corners[a][1]);
                this.ctx.lineTo(entry.corners[b][0], entry.corners[b][1]);
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }
        this.ctx.restore();
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
            if (entry.screenX === 0 && entry.screenY === 0) continue;
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(entry.screenX, entry.screenY);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    renderTextLabels() {
        if (!this.config.showText || !this.textContainer) return;
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
            el.style.color = this.config.textColor;
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

    onClick = (value) => {
        this.isEnabled = value.state;
        if (this.isEnabled) {
            this.start();
        } else {
            this.stop();
        }
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.isEnabled = true;
        this.canvas.style.opacity = "1";
        this.textContainer.style.opacity = "1";
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.scanAndMark();
        
        this.lastFrameTime = performance.now();
        this._animationLoop();
    }

    _animationLoop() {
        if (!this.running) return;
        
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        
        if (delta >= 25) {
            this.scanAndMark();
            this.lastFrameTime = now;
        }
        
        this.animationId = requestAnimationFrame(this._animationLoop.bind(this));
    }

    stop() {
        if (!this.running) return;
        this.running = false;
        this.isEnabled = false;
        this.canvas.style.opacity = "0";
        this.textContainer.style.opacity = "0";
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        for (let i = this.markers.length - 1; i >= 0; i--) {
            const idx = this.ui3D.elements.indexOf(this.markers[i]);
            if (idx > -1) this.ui3D.elements.splice(idx, 1);
        }
        this.markers = [];
        this.drawList = [];
        if (this.ctx) {
            const rect = this.gameCanvasRect;
            if (rect) this.ctx.clearRect(0, 0, rect.width, rect.height);
        }
        for (const [, el] of this.textElMap) el.remove();
        this.textElMap.clear();
    }

    setTarget(blocks) {
        if (typeof blocks === 'string') blocks = [blocks];
        this.targetBlocks = blocks;
        if (this.running) {
            for (let i = this.markers.length - 1; i >= 0; i--) {
                const idx = this.ui3D.elements.indexOf(this.markers[i]);
                if (idx > -1) this.ui3D.elements.splice(idx, 1);
            }
            this.markers = [];
            this.scanAndMark();
        }
    }

    getBlocks() {
        return Object.keys(this.blockIndex.id || {});
    }

    buildConfig() {
        const t = this.i18n.global.t;
        const blocks = this.getBlocks();
        return [
            {
                type: "select",
                name:  'render.blockesp.configs.BlockType',
                default: "barrier",
                options: blocks,
                onChange: (value) => {
                    this.setTarget(value);
                }
            },
            {
                type: "boolean",
                name:  'render.blockesp.configs.ShowBox',
                default: true,
                onChange: (value) => {
                    this.config.showBox = value;
                }
            },
            {
                type: "boolean",
                name:  'render.blockesp.configs.ShowTracers',
                default: false,
                onChange: (value) => {
                    this.config.showTracers = value;
                }
            },
            {
                type: "boolean",
                name:  'render.blockesp.configs.ShowText',
                default: false,
                onChange: (value) => {
                    this.config.showText = value;
                }
            },
            {
                type: "boolean",
                name: 'render.blockesp.configs.ShowMarker',
                default: false,
                onChange: (value) => {
                    this.config.showMarker = value;
                }
            },
            {
                type: "color",
                name: 'render.blockesp.configs.BoxColor',
                default: "#FF0000",
                onChange: (value) => {
                    this.config.boxColor = value;
                }
            },
            {
                type: "color",
                name: 'render.blockesp.configs.TracerColor',
                default: "#FF0000",
                onChange: (value) => {
                    this.config.tracerColor = value;
                }
            },
            {
                type: "color",
                name: 'render.blockesp.configs.TextColor',
                default: "#ffffff",
                onChange: (value) => {
                    this.config.textColor = value;
                }
            },
            {
                type: "number",
                name: 'render.blockesp.configs.BoxSize',
                default: 0.5,
                min: 0.2,
                max: 1.5,
                step: 0.1,
                onChange: (value) => {
                    this.config.boxSize = value;
                }
            },
            {
                type: "number",
                name: 'render.blockesp.configs.LineWidth',
                default: 2,
                min: 0.5,
                max: 5,
                step: 0.1,
                onChange: (value) => {
                    this.config.lineWidth = value;
                }
            },
            {
                type: "number",
                name: 'render.blockesp.configs.TracerWidth',
                default: 1,
                min: 0.5,
                max: 5,
                step: 0.1,
                onChange: (value) => {
                    this.config.tracerWidth = value;
                }
            },
            {
                type: "number",
                name: 'render.blockesp.configs.TextSize',
                default: 12,
                min: 8,
                max: 24,
                step: 1,
                onChange: (value) => {
                    this.config.textSize = value;
                }
            },
            {
                type: "number",
                name: 'render.blockesp.configs.TracerOpacity',
                default: 0.5,
                min: 0,
                max: 1,
                step: 0.05,
                onChange: (value) => {
                    this.config.tracerOpacity = value;
                }
            },
            {
                type: "number",
                name: 'render.blockesp.configs.TracerStartY(%)',
                default: 0.94,
                min: 0.5,
                max: 1,
                step: 0.01,
                onChange: (value) => {
                    this.config.tracerStartY = value;
                }
            }
        ];
    }
}

function main() {
    const btc = new BlockTrackController();
    const t = btc.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: btc.onClick,
            hotkey: "",
            configs: btc.buildConfig(),
            name: 'render.blockesp.name'
        },
        func: btc
    };
}

module.exports = { main };