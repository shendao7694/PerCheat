class LockSelf {
    i18n = require('../../../../i18n/index.js');
    t = this.i18n.global.t;
    interval = null;
    core = unsafeWindow.cheat.core;
    pos = {x: 0,y: 0,z: 0};
    isactive = false;

    onClick = (value) => {
        this.isactive = value.state;
        if(this.isactive) {
            this.start();
        }else {
            this.stop();
        }
    }

    getSelf() {
        return this.core.game.state.bodies.find(e => e.id === this.core.game.state.secret.id);
    }

    start() {
        if(this.interval != null) {return 'already start'}

        this.pos = {
            x: this.getSelf().px,
            y: this.getSelf().py,
            z: this.getSelf().pz,
        }

        this.interval = setInterval(() => {
            let self = this.getSelf();
            self.px = this.pos.x;
            self.py = this.pos.y;
            self.pz = this.pos.z;
            self.vx = 0;
            self.vy = 0;
            self.vz = 0;
        },5)
    }

    stop() {
        if(this.interval == null) {return 'already stop'}
        clearInterval(this.interval);
        this.interval = null;
    }

    buildConfig() {
        const t = this.i18n.global.t;
        return [];
    }
}

function main() {
    const ls = new LockSelf();
    const t = ls.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: ls.onClick,
            hotkey: "",
            configs: ls.buildConfig(),
            name: 'utility.lockself.name'
        },
        func: ls
    };
}

module.exports = { main };