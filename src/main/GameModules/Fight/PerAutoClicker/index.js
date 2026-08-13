class AutoClickerController {
    isEnabled = false;
    game = unsafeWindow.cheat.core.game;
    state = this.game.state;
    i18n = require('../../../../i18n/index.js');
    
    holding = false;
    clickTimer = null;
    
    config = {
        minCPS: 9,
        maxCPS: 14,
        actionType: 0,
        activeOnHold: true,
        releaseDelay: 15
    };

    constructor() {
        window.addEventListener("pointerdown", (e) => {
            if (e.button === 0) this.holding = true;
        });
        window.addEventListener("pointerup", (e) => {
            if (e.button === 0) this.holding = false;
        });
    }

    doClick = () => {
        if (!this.isEnabled) {
            this.clickTimer = null;
            return;
        }
        
        const input = this.state?.input;
        if (!input) {
            this.clickTimer = setTimeout(this.doClick, 50);
            return;
        }
        
        const shouldClick = this.holding && this.config.activeOnHold || !this.config.activeOnHold;
        const actionKey = this.config.actionType === 0 ? 6 : 7;
        const delay = 1000 / (this.config.minCPS + Math.random() * (this.config.maxCPS - this.config.minCPS));
        
        if (shouldClick) {
            input.keyState[actionKey] = 1;
            const releaseDelay = this.config.releaseDelay + Math.random() * 10;
            setTimeout(() => {
                if (input && input.keyState) {
                    input.keyState[actionKey] = 0;
                }
            }, releaseDelay);
        }
        
        this.clickTimer = setTimeout(this.doClick, delay);
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
        if (this.clickTimer) {
            clearTimeout(this.clickTimer);
            this.clickTimer = null;
        }
        this.isEnabled = true;
        this.doClick();
    }

    stop() {
        this.isEnabled = false;
        if (this.clickTimer) {
            clearTimeout(this.clickTimer);
            this.clickTimer = null;
        }
        const input = this.state?.input;
        if (input) {
            const actionKey = this.config.actionType === 0 ? 6 : 7;
            input.keyState[actionKey] = 0;
        }
    }

    buildConfig() {
        const t = this.i18n.global.t;
        return [
            {
                type: "number",
                name: 'fight.autoclicker.configs.MinCPS',
                default: 9,
                min: 1,
                max: 30,
                step: 0.5,
                onChange: (v) => { this.config.minCPS = v; }
            },
            {
                type: "number",
                name: 'fight.autoclicker.configs.MaxCPS',
                default: 14,
                min: 1,
                max: 30,
                step: 0.5,
                onChange: (v) => { this.config.maxCPS = v; }
            },
            {
                type: "select",
                name: 'fight.autoclicker.configs.ActionType',
                default: 'fight.autoclicker.configs.LeftClick',
                options: ['fight.autoclicker.configs.LeftClick', 'fight.autoclicker.configs.RightClick'],
                onChange: (v) => { this.config.actionType = v === 'fight.autoclicker.configs.LeftClick' ? 0 : 1; }
            },
            {
                type: "boolean",
                name: 'fight.autoclicker.configs.ActiveOnHold',
                default: true,
                onChange: (v) => { this.config.activeOnHold = v; }
            },
            {
                type: "number",
                name: 'fight.autoclicker.configs.ReleaseDelay(ms)',
                default: 15,
                min: 5,
                max: 100,
                step: 5,
                onChange: (v) => { this.config.releaseDelay = v; }
            }
        ];
    }
}

function main() {
    const ac = new AutoClickerController();
    const t = ac.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: ac.onClick,
            hotkey: "",
            configs: ac.buildConfig(),
            name: 'fight.autoclicker.name'
        },
        func: ac
    };
}

module.exports = { main };