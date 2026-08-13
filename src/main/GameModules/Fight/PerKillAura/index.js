class KillAuraController {
    isEnabled = false;
    game = unsafeWindow.cheat.core.game;
    state = this.game.state;
    i18n = require('../../../../i18n/index.js');
    
    holding = false;
    attackCooldownActive = false;
    
    config = {
        range: 1000,
        pullOffsetY: 0.5,
        autoAttack: true,
        stack: 1,
        attackButton: 1,
        attackCooldown: 100,
        targetId: -1,
        targetType: 'all'
    };

    players = {
        name: [],
        id: []
    };

    constructor() {
        this.freshPlayer();
        
        window.addEventListener("pointerdown", (e) => {
            if (e.button === 0) this.holding = true;
        });
        window.addEventListener("pointerup", (e) => {
            if (e.button === 0) this.holding = false;
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

    getTargets() {
        const state = this.state;
        if (!state?.bodies || !state?.secret) return [];
        
        const selfId = state.secret.id;
        const selfBody = state.bodies.find(b => b.id === selfId);
        if (!selfBody) return [];
        
        const selfPos = [selfBody.px, selfBody.py, selfBody.pz];
        const targets = [];
        
        for (const body of state.bodies) {
            if (!body || body.id === selfId) continue;
            
            if (this.config.targetType === 'player') {
                const isPlayer = this.players.id.includes(body.id);
                if (!isPlayer) continue;
            } else if (this.config.targetType === 'id') {
                if (body.id !== this.config.targetId) continue;
            }
            
            const dx = body.px - selfPos[0];
            const dy = body.py - selfPos[1];
            const dz = body.pz - selfPos[2];
            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            if (dist > this.config.range) continue;
            
            targets.push(body);
        }
        return targets;
    }

    pullTarget(target) {
        const selfBody = this.state.bodies.find(b => b.id === this.state.secret.id);
        if (!selfBody) return;
        const selfPos = [selfBody.px, selfBody.py, selfBody.pz];
        target.px = selfPos[0];
        target.py = selfPos[1] + this.config.pullOffsetY;
        target.pz = selfPos[2];
        target.vx = 0;
        target.vy = 0;
        target.vz = 0;
    }

    attackTargets(targets) {
        if (this.attackCooldownActive || targets.length === 0) return;
        const state = this.state;
        if (!state) return;
        
        const selfBody = state.bodies.find(b => b.id === state.secret.id);
        if (!selfBody) return;
        const selfPos = [selfBody.px, selfBody.py, selfBody.pz];
        const tick = state.clock?.tick || 0;
        
        const view = state.camera?.view || [1,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1];
        const fx = -view[2], fy = -view[6], fz = -view[10];
        const len = Math.sqrt(fx*fx + fy*fy + fz*fz);
        const dir = len < 1e-6 ? [0,0,-1] : [fx/len, fy/len, fz/len];
        
        const events = [];
        for (const target of targets) {
            for (let i = 0; i < this.config.stack; i++) {
                events.push({
                    buttonState: this.config.attackButton,
                    prevButtonState: 0,
                    position: [...selfPos],
                    rayHitEntity: target.id,
                    rayDirection: [...dir],
                    rayHitNormal: [0,1,0],
                    rayHitVoxelX: 0,
                    rayHitVoxelY: 0,
                    rayHitVoxelZ: 0,
                    rayOrigin: [...selfPos],
                    rayTime: 0,
                    tick: tick
                });
            }
        }
        events.push({
            buttonState: 0,
            prevButtonState: 0,
            position: [...selfPos],
            rayHitEntity: 0,
            rayDirection: [...dir],
            rayHitNormal: [0,1,0],
            rayHitVoxelX: 0,
            rayHitVoxelY: 0,
            rayHitVoxelZ: 0,
            rayOrigin: [...selfPos],
            rayTime: 0,
            tick: tick
        });
        
        try {
            this.game.net._protocol.server.message.input({
                pauseCount: 0,
                tick: tick,
                events: events,
                input: {
                    bodies: state.bodies || [],
                    inputAngle: 0,
                    inputCameraAngle: 0,
                    inputPitch: 0,
                    inputState: 1
                }
            });
        } catch(e) {
            const input = state.input;
            if (input) {
                input.keyState[this.config.attackButton] = 1;
                setTimeout(() => { input.keyState[this.config.attackButton] = 0; }, 50);
            }
        }
        
        this.attackCooldownActive = true;
        setTimeout(() => { this.attackCooldownActive = false; }, this.config.attackCooldown);
    }

    update = () => {
        if (!this.isEnabled || !this.holding) return;
        const targets = this.getTargets();
        if (targets.length === 0) return;
        for (const target of targets) {
            this.pullTarget(target);
        }
        if (this.config.autoAttack) {
            this.attackTargets(targets);
        }
    }

    onClick = (value) => {
        this.isEnabled = value.state;
        if (this.isEnabled) {
            if (this.timer) clearInterval(this.timer);
            this.timer = setInterval(this.update, 50);
        } else {
            if (this.timer) { clearInterval(this.timer); this.timer = null; }
        }
    }

    buildConfig() {
        const t = this.i18n.global.t;
        this.freshPlayer();
        const playerOptions = [t('fight.killaura.configs.None')];
        for (let i = 0; i < this.players.name.length; i++) {
            playerOptions.push(this.players.name[i]);
        }
        
        return [
            { 
                type: "number", 
                name: 'fight.killaura.configs.Range', 
                default: 1000, 
                min: 10, 
                max: 2000, 
                step: 10, 
                onChange: (v) => { 
                    this.config.range = v; 
                } 
            },
            { 
                type: "number", 
                name: 'fight.killaura.configs.PullOffsetY', 
                default: 0.5, 
                min: 0, 
                max: 3, 
                step: 0.1, 
                onChange: (v) => { 
                    this.config.pullOffsetY = v; 
                } 
            },
            { 
                type: "boolean", 
                name: 'fight.killaura.configs.AutoAttack', 
                default: true, 
                onChange: (v) => { 
                    this.config.autoAttack = v; 
                } 
            },
            { 
                type: "number", 
                name: 'fight.killaura.configs.Stack', 
                default: 1, 
                min: 1, 
                max: 100, 
                step: 1, 
                onChange: (v) => { 
                    this.config.stack = v; 
                } 
            },
            { 
                type: "select", 
                name: 'fight.killaura.configs.AttackButton', 
                default: 'fight.killaura.configs.LeftClick', 
                options: ['fight.killaura.configs.LeftClick', 'fight.killaura.configs.RightClick'], 
                onChange: (v) => { 
                    this.config.attackButton = v === 'fight.killaura.configs.LeftClick' ? 1 : 2; 
                } 
            },
            { 
                type: "number", 
                name: 'fight.killaura.configs.AttackCooldown', 
                default: 100, 
                min: 0, 
                max: 2000, 
                step: 10, 
                onChange: (v) => { 
                    this.config.attackCooldown = v; 
                } 
            },
            { 
                type: "select", 
                name: 'fight.killaura.configs.TargetType', 
                default: 'fight.killaura.configs.All', 
                options: ['fight.killaura.configs.All', 'fight.killaura.configs.Player', 'fight.killaura.configs.ID'], 
                onChange: (v) => {
                    if (v === 'fight.killaura.configs.All') this.config.targetType = "all";
                    else if (v === 'fight.killaura.configs.Player') this.config.targetType = "player";
                    else if (v === 'fight.killaura.configs.ID') this.config.targetType = "id";
                } 
            },
            { 
                type: "select", 
                name: 'fight.killaura.configs.TargetPlayer', 
                default: 'fight.killaura.configs.None', 
                options: playerOptions, 
                autoRefresh: true,
                refreshInterval: 500,
                refreshData: () => {
                    const opts = ['fight.killaura.configs.None'];
                    for (let i = 0; i < this.players.name.length; i++) {
                        opts.push(this.players.name[i]);
                    }
                    return opts;  
                },
                onChange: (v) => {
                    if (v === 'fight.killaura.configs.None') { 
                        this.config.targetId = -1; 
                        return; 
                    }
                    const idx = this.players.name.indexOf(v);
                    this.config.targetId = this.players.id[idx] || -1;
                } 
            },
            { 
                type: "number", 
                name: 'fight.killaura.configs.CustomID', 
                default: -1, 
                min: -1, 
                max: 99999, 
                step: 1, 
                onChange: (v) => { 
                    this.config.targetId = v; 
                } 
            },
            { 
                type: "button", 
                name: 'fight.killaura.configs.RefreshPlayers', 
                onChange: () => { 
                    this.freshPlayer(); 
                } 
            }
        ];
    }
}

function main() {
    const ka = new KillAuraController();
    const t = ka.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: ka.onClick,
            hotkey: "",
            configs: ka.buildConfig(),
            name: 'fight.killaura.name'
        },
        func: ka
    };
}

module.exports = { main };