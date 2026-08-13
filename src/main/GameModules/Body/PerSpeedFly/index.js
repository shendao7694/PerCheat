class SpeedFlyController {
    isEnabled = false;
    game = unsafeWindow.cheat.core.game;
    state = this.game.state;
    i18n = require('../../../../i18n/index.js');
    
    config = {
        speed: 2.5,
        xzSpeed: true,
        xzLock: true,
        ySpeed: true,
        yLock: true,
        flyMode: "editor"
    };
    
    targetY = 0;
    targetYReset = true;
    
    keys = {};
    
    constructor() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
        });
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
        });
    }

    getCameraForward(view) {
        return [-view[2], -view[6], -view[10]];
    }
    
    rotatePoint(x, y, angleDegrees) {
        const radians = angleDegrees * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        return {
            x: x * cos - y * sin,
            y: x * sin + y * cos
        };
    }
    
    getHorizontalDirection() {
        const view = this.state.camera.view;
        const forward = this.getCameraForward(view);
        const hLen = Math.sqrt(forward[0] * forward[0] + forward[2] * forward[2]);
        if (hLen < 1e-6) return { x: 0, z: -1 };
        return { x: forward[0] / hLen, z: forward[2] / hLen };
    }

    updateSpeedFly = () => {
        if (!this.isEnabled) return;
        
        const playerId = this.state.secret.id;
        const player = this.state.bodies.find(b => b.id === playerId);
        if (!player) return;
        
        const forward = this.getHorizontalDirection();
        const right = { x: -forward.z, z: forward.x };
        
        let vx = 0, vz = 0, vy = 0;
        
        const w = this.keys['w'] || false;
        const s = this.keys['s'] || false;
        const a = this.keys['a'] || false;
        const d = this.keys['d'] || false;
        const shift = this.keys['shift'] || false;
        const space = this.keys[' '] || false;
        
        const moving = w || s || a || d;
        
        if (w) {
            if (a) {
                const rotated = this.rotatePoint(forward.x * this.config.speed, forward.z * this.config.speed, -45);
                vx = rotated.x;
                vz = rotated.y;
            } else if (d) {
                const rotated = this.rotatePoint(forward.x * this.config.speed, forward.z * this.config.speed, 45);
                vx = rotated.x;
                vz = rotated.y;
            } else {
                vx = forward.x * this.config.speed;
                vz = forward.z * this.config.speed;
            }
        } else if (s) {
            if (a) {
                const rotated = this.rotatePoint(-forward.x * this.config.speed, -forward.z * this.config.speed, -45);
                vx = rotated.x;
                vz = rotated.y;
            } else if (d) {
                const rotated = this.rotatePoint(-forward.x * this.config.speed, -forward.z * this.config.speed, 45);
                vx = rotated.x;
                vz = rotated.y;
            } else {
                vx = -forward.x * this.config.speed;
                vz = -forward.z * this.config.speed;
            }
        } else if (a) {
            vx = -right.x * this.config.speed;
            vz = -right.z * this.config.speed;
        } else if (d) {
            vx = right.x * this.config.speed;
            vz = right.z * this.config.speed;
        }
        
        if (moving && this.config.xzSpeed) {
            player.vx = vx;
            player.vz = vz;
        } else {
            player.vx = 0;
            player.vz = 0;
        }
        
        if (shift) {
            if (this.config.ySpeed) {
                vy = -this.config.speed * 0.5;
            }
            this.targetYReset = true;
        } else if (space) {
            if (this.config.ySpeed) {
                vy = this.config.speed * 0.5;
            }
            this.targetYReset = true;
        } else {
            if (this.config.flyMode === "normal") {
                if (this.config.ySpeed) {
                    const view = this.state.camera.view;
                    const up = [-view[1], -view[5], -view[9]];
                    vy = up[1] * this.config.speed + 0.1;
                }
            } else if (this.config.yLock) {
                if (this.targetYReset) {
                    this.targetY = player.getPosition()[1];
                    this.targetYReset = false;
                }
                vy = this.targetY - player.getPosition()[1];
            } else {
                vy = 0;
            }
            this.targetYReset = true;
        }
        
        if (this.config.ySpeed) {
            player.vy = vy;
        } else {
            player.vy = 0;
        }
        
        player.vx = player.vx || 0;
        player.vy = player.vy || 0;
        player.vz = player.vz || 0;
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
        this.targetYReset = true;
        this.updateSpeedFly();
        this.lastFrameTime = performance.now();
        this._animationLoop();
    }

    _animationLoop() {
        if (!this.isEnabled) return;
        
        this.updateSpeedFly();
        
        this.animationId = requestAnimationFrame(this._animationLoop.bind(this));
    }

    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        this.isEnabled = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        const playerId = this.state.secret.id;
        const player = this.state.bodies.find(b => b.id === playerId);
        if (player) {
            player.vx = 0;
            player.vy = 0;
            player.vz = 0;
        }
    }

    buildConfig() {
        const t = this.i18n.global.t;
        return [
            {
                type: "number",
                name: 'body.speedfly.configs.Speed',
                default: 2.5,
                min: 0.5,
                max: 10,
                step: 0.1,
                onChange: (value) => {
                    this.config.speed = value;
                }
            },
            {
                type: "boolean",
                name: 'body.speedfly.configs.HorizontalSpeed',
                default: true,
                onChange: (value) => {
                    this.config.xzSpeed = value;
                }
            },
            {
                type: "boolean",
                name: 'body.speedfly.configs.HorizontalLock',
                default: true,
                onChange: (value) => {
                    this.config.xzLock = value;
                }
            },
            {
                type: "boolean",
                name: 'body.speedfly.configs.VerticalSpeed',
                default: true,
                onChange: (value) => {
                    this.config.ySpeed = value;
                }
            },
            {
                type: "boolean",
                name: 'body.speedfly.configs.VerticalLock',
                default: true,
                onChange: (value) => {
                    this.config.yLock = value;
                }
            },
            {
                type: "select",
                name: 'body.speedfly.configs.FlyMode',
                default: "editor",
                options: {
                    ['body.speedfly.configs.Editor']: "editor",
                    ['body.speedfly.configs.Normal']: "normal"
                },
                onChange: (value) => {
                    this.config.flyMode = value;
                }
            }
        ];
    }
}

function main() {
    const sfc = new SpeedFlyController();
    const t = sfc.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: sfc.onClick,
            hotkey: "r",
            configs: sfc.buildConfig(),
            name: 'body.speedfly.name'
        },
        func: sfc
    };
}

module.exports = { main };