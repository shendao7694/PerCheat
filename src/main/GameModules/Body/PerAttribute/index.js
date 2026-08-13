const { PlayerFlags } = require('../../../GameCore/api.js')

class PerBodyAttributeContraller {
    isEnabled = false;
    datas = [];
    currentUUID = "";
    cheat = unsafeWindow.cheat;
    i18n = require('../../../../i18n/index.js');
    flaginit = {
        SPECTATOR: false,
        ALLOW_FLIGHT: false,
        ALLOW_MOVE: true,
        ALLOW_ACTION_0: true,
        ALLOW_ACTION_1: true,
        ALLOW_JUMP: true,
        ALLOW_DOUBLE_JUMP: true,
        ALLOW_CROUCH: true,
        INVISIBLE: false,
        INVINCIBLE: false,
        NO_COLLIDE: false,
        NO_GRAVITY: false,
        FLYING: false,
        SWIMMING: false
    };
    onClick = (value) => {
        this.isEnabled = value.state
        if(value.state) {
            this.cheat.front.flagmanager.enable();
        }else if(!value.state) {
            this.cheat.front.flagmanager.disable();
        }
        this.updateAttribute();
    }

    updateAttribute() {
        this.currentUUID != "" ? this.cheat.front.flagmanager.removeFlag(this.currentUUID) : 0;
        if(!this.isEnabled) return;
        let flags = [];
        for(let i in this.datas){
            let item = this.datas[i];
            if(item.enabled) {
                flags.push(item.flag);
            }
        }
        this.currentUUID = this.cheat.front.flagmanager.modifyFlag(this.cheat.front.body.getSelf().id,'player',flags).uuid;
    }

    buildAttribute() {
        let configs = [];
        const t = this.i18n.global.t;
        for(let i in PlayerFlags) {
            let item = PlayerFlags[i];
            let enabled = this.flaginit[i];
            let data = {
                enabled : enabled,
                flag : item,
            }
            let config = {
                type: 'boolean',
                name: `body.attribute.configs.${i}`,
                hotkey: i.includes("SPE") ? "" : "",
                default: enabled,
                onChange: (value) => {
                    data.enabled = value;
                    this.updateAttribute();
                }
            }
            this.datas.push(data);
            configs.push(config);
        }
        return configs;
    }
}

function main() {
    const pbac = new PerBodyAttributeContraller();
    const t = pbac.i18n.global.t;
    return {
        datas : {
            type: "toggle",
            onClick: pbac.onClick,
            hotkey: "",
            defaultState: true,
            configs: pbac.buildAttribute(),
            name: 'body.attribute.name'
        },
        func : pbac
    }
}

module.exports = { main }