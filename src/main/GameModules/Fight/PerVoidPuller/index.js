const hookStacks = new Map();

function hookCoreBodyFlags(body, flags, coverExisting = true) {
    let stack = hookStacks.get(body.id);
    if (!stack) {
        stack = [];
        hookStacks.set(body.id, stack);
    }
    if (!coverExisting && stack.length > 0) {
        stack[stack.length - 1].flagModified |= flags;
        return;
    }
    let finalFlags = flags;
    if (!coverExisting) {
        finalFlags |= body.flags;
    }
    const currentDescriptor = Object.getOwnPropertyDescriptor(body, 'flags');
    stack.push({
        flagModified: finalFlags,
        descriptor: currentDescriptor
    });
    Object.defineProperty(body, 'flags', {
        get() {
            const s = hookStacks.get(body.id);
            if (!s || s.length === 0) return 0;
            return s[s.length - 1].flagModified;
        },
        set() {},
        configurable: true,
        enumerable: currentDescriptor?.enumerable ?? true
    });
}

function unhookCoreBodyFlags(body) {
    const stack = hookStacks.get(body.id);
    if (!stack || stack.length === 0) return;
    const poppedLayer = stack.pop();
    if (poppedLayer.descriptor) {
        Object.defineProperty(body, 'flags', poppedLayer.descriptor);
    } else {
        delete body.flags;
    }
    if (stack.length === 0) {
        hookStacks.delete(body.id);
    }
}

const GHOST_FLAGS = 9;
const FLY_FLAGS = 254;
const LOCKED_FLAGS = 1;
const LOCK_MASK = LOCKED_FLAGS | GHOST_FLAGS | FLY_FLAGS; 

class VoidPullerController {
    isEnabled = false;
    game = unsafeWindow.cheat.core.game;
    state = this.game?.state;
    i18n = require('../../../../i18n/index.js');
    
    ticks = 0;
    lockedBodies = new Set();
    
    config = {
        cooldown: 1,
        relative: false,
        movement: { x: 0, y: -32767, z: 0 },
        velocity: { x: 0, y: -32767, z: 32767 },
        range: 1000,
        targetType: 'all',
        targetId: -1
    };

    players = {
        name: [],
        id: []
    };

    constructor() {
        if (!this.game || !this.state) {
            return;
        }
        this.freshPlayer();
    }

    freshPlayer() {
        let datas = { name: [], id: [] };
        try {
            const players = this.game?.state?.replica?.players;
            if (!players) return;
            const selfId = this.game.state.secret?.id;
            for (let i in players) {
                let item = players[i];
                if (item.id === selfId) continue;
                datas.name.push(item.name);
                datas.id.push(item.id);
            }
            this.players = datas;
        } catch(e) {
        }
    }

    lockTarget(target) {
        if (!target || target.id === undefined || target.id === null) return;
        if (this.lockedBodies.has(target.id)) return;
        hookCoreBodyFlags(target, LOCK_MASK, true);
        this.lockedBodies.add(target.id);
    }

    unlockTarget(target) {
        if (!target || !this.lockedBodies.has(target.id)) return;
        unhookCoreBodyFlags(target);
        this.lockedBodies.delete(target.id);
    }

    pullTarget(target) {
        if (!target) return;
        if (this.config.relative) {
            target.px += this.config.movement.x;
            target.py += this.config.movement.y;
            target.pz += this.config.movement.z;
        } else {
            target.px = this.config.movement.x;
            target.py = this.config.movement.y;
            target.pz = this.config.movement.z;
        }
        target.vx = this.config.velocity.x;
        target.vy = this.config.velocity.y;
        target.vz = this.config.velocity.z;
    }

    getTargets() {
        const state = this.state;
        if (!state?.bodies || !state?.secret) {
            return [];
        }
        
        const selfId = state.secret.id;
        const selfBody = state.bodies.find(b => b && b.id === selfId);
        if (!selfBody) {
            return [];
        }
        
        const selfPos = [selfBody.px, selfBody.py, selfBody.pz];
        const targets = [];
        const playerIds = this.players.id;
        
        for (const body of state.bodies) {
            if (!body || body.id === selfId) continue;
            if (body.id === undefined || body.id === null) continue;
            
            if (this.config.targetType === 'player') {
                if (!playerIds.includes(body.id)) continue;
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
        if (targets.length > 0) {
            
        }
        return targets;
    }

    update = () => {
        if (!this.isEnabled) return;
        
        this.ticks++;
        if (this.ticks < this.config.cooldown) return;
        this.ticks = 0;

        const targets = this.getTargets();
        for (const target of targets) {
            this.lockTarget(target);
            this.pullTarget(target);
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
        if (this.timer) clearInterval(this.timer);
        this.isEnabled = true;
        this.ticks = 0;
        this.timer = setInterval(this.update, 50);
    }

    stop() {
        this.isEnabled = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        const state = this.state;
        if (state?.bodies) {
            for (const body of state.bodies) {
                if (body && this.lockedBodies.has(body.id)) {
                    unhookCoreBodyFlags(body);
                    this.lockedBodies.delete(body.id);
                }
            }
        }
        this.lockedBodies.clear();
    }
    buildConfig() {
        const t = this.i18n.global.t;
        this.freshPlayer();
        const playerOptions = [t('fight.voidpuller.configs.None')];
        for (let i = 0; i < this.players.name.length; i++) {
            playerOptions.push(this.players.name[i]);
        }
        
        return [
            {
                type: "number",
                name: 'fight.voidpuller.configs.Cooldown',
                default: 1,
                min: 1,
                max: 20,
                step: 1,
                onChange: (v) => { this.config.cooldown = v; }
            },
            {
                type: "boolean",
                name: 'fight.voidpuller.configs.Relative',
                default: false,
                onChange: (v) => { this.config.relative = v; }
            },
            {
                type: "number",
                name: 'fight.voidpuller.configs.Range',
                default: 1000,
                min: 10,
                max: 2000,
                step: 10,
                onChange: (v) => { this.config.range = v; }
            },
            {
                type: "number",
                name: 'fight.voidpuller.configs.Move X',
                default: 0,
                min: -99999,
                max: 99999,
                step: 1,
                onChange: (v) => { this.config.movement.x = v; }
            },
            {
                type: "number",
                name: 'fight.voidpuller.configs.Move Y',
                default: -32767,
                min: -99999,
                max: 99999,
                step: 1,
                onChange: (v) => { this.config.movement.y = v; }
            },
            {
                type: "number",
                name: 'fight.voidpuller.configs.Move Z',
                default: 0,
                min: -99999,
                max: 99999,
                step: 1,
                onChange: (v) => { this.config.movement.z = v; }
            },
            {
                type: "number",
                name: t('fight.voidpuller.configs.Velocity X'),
                default: 0,
                min: -99999,
                max: 99999,
                step: 1,
                onChange: (v) => { this.config.velocity.x = v; }
            },
            {
                type: "number",
                name: 'fight.voidpuller.configs.Velocity Y',
                default: -32767,
                min: -99999,
                max: 99999,
                step: 1,
                onChange: (v) => { this.config.velocity.y = v; }
            },
            {
                type: "number",
                name: 'fight.voidpuller.configs.Velocity Z',
                default: 32767,
                min: -99999,
                max: 99999,
                step: 1,
                onChange: (v) => { this.config.velocity.z = v; }
            },
            {
                type: "select",
                name: 'fight.voidpuller.configs.TargetType',
                default: 'fight.voidpuller.configs.All',
                options: ['fight.voidpuller.configs.All', 'fight.voidpuller.configs.Player', 'fight.voidpuller.configs.ID'],
                onChange: (v) => {
                    if (v === 'fight.voidpuller.configs.All') this.config.targetType = "all";
                    else if (v === 'fight.voidpuller.configs.Player') this.config.targetType = "player";
                    else if (v === 'fight.voidpuller.configs.ID') this.config.targetType = "id";
                }
            },
            {
                type: "select",
                name: 'fight.voidpuller.configs.TargetPlayer',
                default: 'fight.voidpuller.configs.None',
                options: playerOptions,
                autoRefresh: true,
                refreshInterval: 500,
                refreshData: () => {
                    const opts = ['fight.voidpuller.configs.None'];
                    for (let i = 0; i < this.players.name.length; i++) {
                        opts.push(this.players.name[i]);
                    }
                    return opts;
                },
                onChange: (v) => {
                    if (v === 'fight.voidpuller.configs.None') {
                        this.config.targetId = -1;
                        return;
                    }
                    const idx = this.players.name.indexOf(v);
                    this.config.targetId = this.players.id[idx] || -1;
                }
            },
            {
                type: "number",
                name: 'fight.voidpuller.configs.CustomID',
                default: -1,
                min: -1,
                max: 99999,
                step: 1,
                onChange: (v) => { this.config.targetId = v; }
            },
            {
                type: "button",
                name: 'fight.voidpuller.configs.RefreshPlayers',
                onChange: () => { this.freshPlayer(); }
            }
        ];
    }
}

function main() {
    const vp = new VoidPullerController();
    const t = vp.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: vp.onClick,
            hotkey: "",
            configs: vp.buildConfig(),
            name: 'fight.voidpuller.name'
        },
        func: vp
    };
}

module.exports = { main };