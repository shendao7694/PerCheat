class CameraController {
    players = {
        name : [],
        id : [],
    };
    i18n = require('../../../../i18n/index.js');
    
    configs = {
        target: core.game.state.secret.id,
        mode: 0,
        fovY: 0.25,
    }

    constructor() {
        this.freshPlayer();
    }

    onClick = (value) => {
        core.game.state.secret.replica.camera.fovY = this.configs.fovY;
        core.game.state.secret.replica.camera.targetId = this.configs.target;
        core.game.state.secret.replica.camera.mode = this.configs.mode;
    }

    freshPlayer() {
        let datas = {
            name : [],
            id : [],
        };
        try {
            const players = core.game?.state?.replica?.players;
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

    buildConfig() {
        const t = this.i18n.global.t;
        return [
            {
                type: 'number',
                name:  'render.camera.configs.FovY',
                default: 0.25,
                min: 0,
                max: 1,
                step: 0.01,
                onChange: (value) => {
                    this.configs.fovY = value;
                }
            },
            {
                type: "select",
                name:  'render.camera.configs.Mode',
                default:  'render.camera.configs.Follow',
                options: [ 'render.camera.configs.Follow',  'render.camera.configs.Fixed',  'render.camera.configs.Fps',  'render.camera.configs.Relative'],
                onChange: (value) => {
                    const modeMap = {
                        [ 'render.camera.configs.Follow']: 0,
                        [ 'render.camera.configs.Fixed']: 1,
                        [ 'render.camera.configs.Fps']: 2,
                        [ 'render.camera.configs.Relative']: 3
                    };
                    this.configs.mode = modeMap[value];
                }
            },
            {
                type: "select",
                name:  'render.camera.configs.CameraTarget',
                default:  'render.camera.configs.Self',
                options: [ 'render.camera.configs.Self', ...this.players.name],
                autoRefresh: true,
                refreshInterval: 500,
                refreshData: () => {
                    return [ 'render.camera.configs.Self', ...this.players.name];  
                },
                onChange: (value) => {
                    if(value ===  'render.camera.configs.Self') {
                        this.configs.target = core.game.state.secret.id;
                        return;
                    }
                    this.configs.target = core.game.state.replica.players.find(e => e.name === value).id;
                }
            },
            {
                type: "button",
                name:  'render.camera.configs.Refresh',
                onChange: () => {
                    this.freshPlayer(); 
                }
            },
        ]
    }
}

function main() {
    const cc = new CameraController();
    const t = cc.i18n.global.t;
    return {
        datas: {
            type: "click",
            onClick: cc.onClick,
            hotkey: "",
            configs: cc.buildConfig(),
            name:  'render.camera.name'
        },
        func: cc
    };
}

module.exports = { main };