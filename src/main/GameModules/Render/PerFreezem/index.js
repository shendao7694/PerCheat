class GhostController {
    isEnabled = false;
    ghostPos = [0, 0, 0];
    ghostYaw = 0;
    ghostPitch = 0;
    ghostSmoothness = 0.15;
    ghostCurrentPos = [0, 0, 0];
    ghostCurrentYaw = 0;
    ghostCurrentPitch = 0;
    ghostRafId = null;
    keysPressed = {};
    game = core.game;
    state = core.game.state;
    cheat = window.cheat;
    i18n = require('../../../../i18n/index.js');

    onClick = (value) => {
        this.isEnabled = value.state;
        this.game.state.input.keyPauseCount = value.state ? 1 : 0
        if (this.isEnabled) {
            this.createGhost();
        } else {
            this.removeGhost();
        }
    }

    createGhost() {
        var player = this.state.bodies.find(function(b) { return b.id === this.state.secret.id; }.bind(this));
        if (!player) return;
        this.ghostPos = [player.px, player.py + 2, player.pz];
        this.ghostYaw = 0;
        this.ghostPitch = 0;
        this.ghostCurrentPos = [this.ghostPos[0], this.ghostPos[1], this.ghostPos[2]];
        this.ghostCurrentYaw = 0;
        this.ghostCurrentPitch = 0;
        this.state.secret.replica.camera.mode = 1;
        this.state.secret.replica.camera.targetId = 0;
        
        if (this.ghostRafId) {
            cancelAnimationFrame(this.ghostRafId);
        }
        
        const loop = () => {
            if (!this.isEnabled) {
                this.ghostRafId = null;
                return;
            }
            this.updateGhost();
            this.ghostRafId = requestAnimationFrame(loop);
        };
        this.ghostRafId = requestAnimationFrame(loop);

        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
    }

    removeGhost() {
        this.isEnabled = false;
        this.state.secret.replica.camera.mode = 2;
        this.state.secret.replica.camera.targetId = this.state.secret.id;
        
        if (this.ghostRafId) {
            cancelAnimationFrame(this.ghostRafId);
            this.ghostRafId = null;
        }
        this.keysPressed = {};

        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }

    updateGhost() {
        if (!this.isEnabled) return;
        var step = 0.5;
        var angleStep = 0.05;
        if (this.keysPressed['w']) this.moveGhost(0, 0, step);
        if (this.keysPressed['s']) this.moveGhost(0, 0, -step);
        if (this.keysPressed['a']) this.moveGhost(-step, 0, 0);
        if (this.keysPressed['d']) this.moveGhost(step, 0, 0);
        if (this.keysPressed[' ']) this.moveGhost(0, step, 0);
        if (this.keysPressed['Shift']) this.moveGhost(0, -step, 0);
        if (this.keysPressed['ArrowUp']) this.ghostPitch += angleStep;
        if (this.keysPressed['ArrowDown']) this.ghostPitch -= angleStep;
        if (this.keysPressed['ArrowLeft']) this.ghostYaw += angleStep;
        if (this.keysPressed['ArrowRight']) this.ghostYaw -= angleStep;
        this.ghostPitch = Math.max(-1.5, Math.min(1.5, this.ghostPitch));
        var smooth = this.ghostSmoothness;
        this.ghostCurrentPos[0] += (this.ghostPos[0] - this.ghostCurrentPos[0]) * smooth;
        this.ghostCurrentPos[1] += (this.ghostPos[1] - this.ghostCurrentPos[1]) * smooth;
        this.ghostCurrentPos[2] += (this.ghostPos[2] - this.ghostCurrentPos[2]) * smooth;
        var yawDiff = this.ghostYaw - this.ghostCurrentYaw;
        while (yawDiff > Math.PI) yawDiff -= 2 * Math.PI;
        while (yawDiff < -Math.PI) yawDiff += 2 * Math.PI;
        this.ghostCurrentYaw = -this.state.local.pitch;
        var pitchDiff = this.ghostPitch - this.ghostCurrentPitch;
        this.ghostCurrentPitch = -this.state.local.yaw;
        this.ghostCurrentPitch = Math.max(-1.5, Math.min(1.5, this.ghostCurrentPitch));
        this.ghostPitch = this.ghostCurrentPitch;
        this.ghostYaw = this.ghostCurrentYaw;
        var yaw = this.ghostCurrentYaw;
        var pitch = this.ghostCurrentPitch;
        var forward = [-Math.sin(yaw), 0, -Math.cos(yaw)];
        var up = [0, 1, 0];
        var lookDir = [
            forward[0] * Math.cos(pitch) + up[0] * Math.sin(pitch),
            forward[1] * Math.cos(pitch) + up[1] * Math.sin(pitch),
            forward[2] * Math.cos(pitch) + up[2] * Math.sin(pitch)
        ];
        this.state.secret.replica.camera.eye = this.ghostCurrentPos;
        this.state.secret.replica.camera.target = [
            this.ghostCurrentPos[0] + lookDir[0],
            this.ghostCurrentPos[1] + lookDir[1],
            this.ghostCurrentPos[2] + lookDir[2]
        ];
    }
    moveGhost(dx, dy, dz) {
        if (!this.isEnabled) return;
        var yaw = this.ghostYaw;
        var forward = [-Math.sin(yaw), 0, -Math.cos(yaw)];
        var right = [Math.cos(yaw), 0, -Math.sin(yaw)];
        this.ghostPos[0] += right[0] * dx + forward[0] * dz;
        this.ghostPos[1] += dy;
        this.ghostPos[2] += right[2] * dx + forward[2] * dz;
    }

    handleKeyDown = (e) => {
        if (!this.isEnabled) return;
        this.keysPressed[e.key] = true;
        e.preventDefault();
    }

    handleKeyUp = (e) => {
        if (!this.isEnabled) return;
        this.keysPressed[e.key] = false;
        e.preventDefault();
    }

    buildConfig() {
        const t = this.i18n.global.t;
        return [
            {
                type: 'button',
                name: 'render.freezem.configs.LockedSelf',
                onChange: (value) => {
                    this.game.state.input.keyPauseCount = core.game.state.input.keyPauseCount === 0 ? 1 : 0
                }
            },
        ]
    }
}

function main() {
    const ghost = new GhostController();
    const t = ghost.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: ghost.onClick,
            hotkey: "g",
            configs: ghost.buildConfig(),
            name: 'render.freezem.name'
        },
        func: ghost
    };
}

module.exports = { main };