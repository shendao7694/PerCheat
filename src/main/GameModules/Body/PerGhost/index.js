class GhostController {
    isEnabled = false;
    game = unsafeWindow.cheat.core.game;
    state = this.game.state;
    i18n = require('../../../../i18n/index.js');
    
    static hookStacks = new Map();
    static GHOST_FLAGS = 9;
    

    static hookCoreBodyFlags(body, flags, coverExisting = true) {
        const stack = GhostController.hookStacks.get(body.id);
        if (!stack) {
            const newStack = [];
            GhostController.hookStacks.set(body.id, newStack);
        }
        const currentStack = GhostController.hookStacks.get(body.id);
        
        if (!coverExisting && currentStack.length > 0) {
            currentStack[currentStack.length - 1].flagModified |= flags;
            return;
        }
        
        let finalFlags = flags;
        if (!coverExisting) {
            finalFlags |= body.flags;
        }
        
        const currentDescriptor = Object.getOwnPropertyDescriptor(body, "flags");
        currentStack.push({
            flagModified: finalFlags,
            descriptor: currentDescriptor
        });
        
        Object.defineProperty(body, "flags", {
            get: function() {
                const s = GhostController.hookStacks.get(this.id);
                if (!s || s.length === 0) return 0;
                return s[s.length - 1].flagModified;
            },
            set: function(_v) {},
            configurable: true,
            enumerable: currentDescriptor?.enumerable ?? true
        });
    }

    static unhookCoreBodyFlags(body) {
        const stack = GhostController.hookStacks.get(body.id);
        if (!stack || stack.length === 0) return;
        
        const poppedLayer = stack.pop();
        if (poppedLayer.descriptor) {
            Object.defineProperty(body, "flags", poppedLayer.descriptor);
        } else {
            delete body.flags;
        }
        
        if (stack.length === 0) {
            GhostController.hookStacks.delete(body.id);
        }
    }

    toggleGhost(enabled) {
        const playerId = this.state.secret.id;
        const body = this.state.bodies.find(b => b.id === playerId);
        if (!body) return false;
        
        if (enabled) {
            GhostController.hookCoreBodyFlags(body, GhostController.GHOST_FLAGS);
            return true;
        } else {
            GhostController.unhookCoreBodyFlags(body);
            return false;
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
        this.isEnabled = true;
        this.toggleGhost(true);
    }

    stop() {
        this.isEnabled = false;
        this.toggleGhost(false);
    }

    buildConfig() {
        return [];
    }
}

function main() {
    const gc = new GhostController();
    const t = gc.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: gc.onClick,
            hotkey: "r",
            configs: gc.buildConfig(),
            name: 'body.ghost.name'
        },
        func: gc
    };
}

module.exports = { main };