class PerTeleportContoller {
    game = unsafeWindow.cheat.core.game;
    i18n = require('../../../../i18n/index.js');

    data = {
        type : "Coordinates",
        x : 0,
        y : 0,
        z : 0,
        targetId : 0,
    }

    players = {
        name : [],
        id : [],
    };

    keyPress = {
        "Shift" : false
    };

    clickTpConfig = {
        button: 2,
        enabled: false,
        isCrouch: true,
        stepSize: 0.05,
        maxDistance: 1000,
        offsetY: 1.6
    }

    teleportInterval = null;

    constructor() {
        this.freshPlayer();
        
        document.addEventListener('keydown', (event) => {
            this.keyPress[event.key] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            this.keyPress[event.key] = false;
        });
        
        document.addEventListener('mousedown', (e) => {
            if (this.clickTpConfig.enabled && 
                e.button === this.clickTpConfig.button && 
                (this.clickTpConfig.isCrouch ? (this.keyPress["Shift"]) : true)) {
                this.clickTeleport();
            }
        });
    }

    freshPlayer() {
        let datas = {
            name : [],
            id : [],
        };
        try {
            const players = this.game?.state?.replica?.players;
            if (!players) return;
            for(let i in players) {
                let item = players[i];
                let name = item.name;
                let id = item.id;
                datas.name.push(name);
                datas.id.push(id);
            }
            this.players = datas;
        } catch(e) {}
    }

    getCameraForward(view) {
        return [-view[2], -view[6], -view[10]];
    }

    normalize(x, y, z) {
        const len = Math.sqrt(x * x + y * y + z * z);
        if (len < 1e-8) return [0, 0, -1];
        return [x / len, y / len, z / len];
    }

    voxelRayMarch(origin, direction, stepSize = 0.05, maxSteps = 2000) {
        const game = this.game;
        if (!game) return null;
        
        const voxel = game.voxel;
        const shape = game.state?.voxel?.shape;
        if (!voxel || !shape) return null;
        
        const [sx, sy, sz] = shape;
        let cx = origin[0];
        let cy = origin[1];
        let cz = origin[2];
        
        for (let i = 0; i < maxSteps; i++) {
            cx += direction[0] * stepSize;
            cy += direction[1] * stepSize;
            cz += direction[2] * stepSize;
            
            if (cx < 0 || cx >= sx || cy < 0 || cy >= sy || cz < 0 || cz >= sz) return null;
            
            const block = voxel.getVoxel(Math.floor(cx), Math.floor(cy), Math.floor(cz));
            if (block !== 0) {
                return [cx, cy, cz];
            }
        }
        
        return null;
    }

    clickTeleport() {
        const state = this.game?.state;
        if (!state?.camera) return;
        
        const eye = [
            state.camera.eye[0],
            state.camera.eye[1],
            state.camera.eye[2]
        ];
        
        const forward = this.normalize(...this.getCameraForward(state.camera.view));
        
        const hitPoint = this.voxelRayMarch(
            eye,
            forward,
            this.clickTpConfig.stepSize,
            Math.ceil(this.clickTpConfig.maxDistance / this.clickTpConfig.stepSize)
        );
        
        if (!hitPoint) return;
        
        const targetX = hitPoint[0];
        const targetY = hitPoint[1] + this.clickTpConfig.offsetY;
        const targetZ = hitPoint[2];
        
        this.teleportToPos(targetX, targetY, targetZ);
    }

    teleportToTarget(targetId) {
        const body = this.game.state.bodies.find(function(b) { return b.id === targetId; });
        if (body) {
            this.teleportToPos(body.px, body.py, body.pz);
        }
    }

    teleportToPos(x, y, z) {
        if (x === undefined || y === undefined || z === undefined) {
            return false;
        }
        
        var nx = Number(x);
        var ny = Number(y);
        var nz = Number(z);
        
        if (isNaN(nx) || isNaN(ny) || isNaN(nz)) {
            return false;
        }
        
        if (!isFinite(nx) || !isFinite(ny) || !isFinite(nz)) {
            return false;
        }
        
        if(!this.game) {
            return false;
        }
        
        const state = this.game.state;
        if (!state) {
            return false;
        }
        
        var playerId = state.secret.id;
        var body = state.bodies.find(function(b) { return b.id === playerId; });
        var renderBox = state.renderBoxes.find(function(r) { return r.id === playerId; });
        
        if(!body) return false;
        
        if (state.net && state.net.states) {
            for (var i = 0; i < state.net.states.length; i++) {
                var stateItem = state.net.states[i];
                if (stateItem && stateItem.bodies) {
                    var targetBody = stateItem.bodies.find(function(b) { return b.id === playerId; });
                    if (targetBody) {
                        targetBody.px = x;
                        targetBody.py = y;
                        targetBody.pz = z;
                        targetBody.vx = 0;
                        targetBody.vy = 0;
                        targetBody.vz = 0;
                    }
                }
            }
        }
        
        var playerInput = state.playerInputs.find(function(p) { return p.id === playerId; });
        if (playerInput) {
            playerInput.state |= 64;
        }
        
        body.px = x;
        body.py = y;
        body.pz = z;
        body.vx = body.vy = body.vz = 0;
        
        if (renderBox) {
            renderBox.px = x;
            renderBox.py = y;
            renderBox.pz = z;
            renderBox.anchorX = x;
            renderBox.anchorY = y;
            renderBox.anchorZ = z;
        }
        
        if (state.camera) {
            state.camera.eye[0] = x;
            state.camera.eye[1] = y;
            state.camera.eye[2] = z;
        }
        
        if (this.game.net && this.game.net._protocol) {
            this.game.net._protocol.server.message.input({
                tick: state.clock.tick,
                input: {
                    inputState: playerInput ? playerInput.state : 0,
                    inputAngle: playerInput ? playerInput.angle : 0,
                    inputPitch: playerInput ? playerInput.pitch : 0,
                    inputCameraAngle: playerInput ? playerInput.cameraAngle : 0,
                    bodies: [{
                        id: playerId,
                        px: x, py: y, pz: z,
                        vx: 0, vy: 0, vz: 0
                    }]
                },
                pauseCounter: 0,
                events: []
            }, true);
        }
        
        if (this.teleportInterval) {
            clearInterval(this.teleportInterval);
            this.teleportInterval = null;
        }
        
        var count = 0;
        this.teleportInterval = setInterval(() => {
            body.px = x;
            body.py = y;
            body.pz = z;
            body.vx = body.vy = body.vz = 0;
            
            if (state.net && state.net.states) {
                for (var i = 0; i < state.net.states.length; i++) {
                    var stateItem = state.net.states[i];
                    if (stateItem && stateItem.bodies) {
                        var targetBody = stateItem.bodies.find(function(b) { return b.id === playerId; });
                        if (targetBody) {
                            targetBody.px = x;
                            targetBody.py = y;
                            targetBody.pz = z;
                        }
                    }
                }
            }
            
            count++;
            if (count >= 6) {
                clearInterval(this.teleportInterval);
                this.teleportInterval = null;
            }
        }, 50);
        
        return true;
    };

    onClick = (value) => {
        let type = value[0];
        let x = value[1];
        let y = value[2];
        let z = value[3];
        let target = value[4];
        let targetIdx = this.players.name.findIndex(n => n === target);
        let targetId = this.players.id[targetIdx] ?? 0;
        
        if (type === "body.teleport.configs.coordinates") {
            this.teleportToPos(x, y, z);
        } else if (type === "body.teleport.configs.target") {
            this.teleportToTarget(targetId);
        }
    }

    buildConfig() {
        const t = this.i18n.global.t;
        const shape = this.game?.state?.voxel?.shape || [100, 100, 100];
        
        return [
            {
                type: "select",
                name: 'body.teleport.configs.Type',
                default: "body.teleport.configs.coordinates",
                options: [
                    'body.teleport.configs.coordinates',
                    'body.teleport.configs.target'
                ]
            },
            {
                type: "number",
                name: 'body.teleport.configs.X',
                min: -999999,
                max: 999999,
                default: 0
            },
            {
                type: "number",
                name: 'body.teleport.configs.Y',
                min: -999999,
                max: 999999,
                default: 0
            },
            {
                type: "number",
                name: 'body.teleport.configs.Z',
                min: -999999,
                max: 999999,
                default: 0
            },
            {
                type: "select",
                name: 'body.teleport.configs.Target',
                default: this.players.name[0] ?? '',
                options: this.players.name,
                autoRefresh: true,
                refreshInterval: 500,
                refreshData: () => {
                    return this.players.name;  
                }
            },
            {
                type: "button",
                name: 'body.teleport.configs.Refresh',
                onChange: () => {
                    this.freshPlayer(); 
                }
            },
            {
                type: "boolean",
                name: 'body.teleport.configs.ClickTPEnabled',
                default: false,
                onChange: (value) => {
                    this.clickTpConfig.enabled = value;
                }
            },
            {
                type: "select",
                name: 'body.teleport.configs.ClickTPButton',
                default: 'body.teleport.configs.Right Click',
                options: [
                    'body.teleport.configs.Left Click',
                    'body.teleport.configs.Right Click',
                    'body.teleport.configs.Middle Click'
                ],
                onChange: (value) => {
                    console.log(value);
                    const buttonMap = {
                        ['body.teleport.configs.Left Click']: 0,
                        ['body.teleport.configs.Right Click']: 2,
                        ['body.teleport.configs.Middle Click']: 1
                    };
                    this.clickTpConfig.button = buttonMap[value];
                }
            },
            {
                type: "boolean",
                name: 'body.teleport.configs.RequireCrouch',
                default: true,
                onChange: (value) => {
                    this.clickTpConfig.isCrouch = value;
                }
            },
            {
                type: "number",
                name: 'body.teleport.configs.StepSize',
                default: 0.05,
                min: 0.01,
                max: 0.5,
                step: 0.01,
                onChange: (value) => {
                    this.clickTpConfig.stepSize = value;
                }
            },
            {
                type: "number",
                name: 'body.teleport.configs.MaxDistance',
                default: 1000,
                min: 10,
                max: 2000,
                step: 10,
                onChange: (value) => {
                    this.clickTpConfig.maxDistance = value;
                }
            },
            {
                type: "number",
                name: 'body.teleport.configs.YOffset',
                default: 1.6,
                min: 0,
                max: 5,
                step: 0.1,
                onChange: (value) => {
                    this.clickTpConfig.offsetY = value;
                }
            }
        ];
    }
}

function main() {
    const ptc = new PerTeleportContoller();
    const t = ptc.i18n.global.t;
    return {
        datas: {
            type: "click",
            onClick: ptc.onClick,
            hotkey: "",
            configs: ptc.buildConfig(),
            name: 'body.teleport.name'
        },
        func: ptc
    };
}

module.exports = { main };