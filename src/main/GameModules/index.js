const {GameLog} = require('../../sys/log.js');
const {GameGUI} = require('../GameGUI/index.js');
const _console = new GameLog("GameModules");
const i18n = require('../../i18n/index.js')
/**
 * @typedef {Object} ModuleRegister
 * @property {string} name - Module Name
 * @property {Object} src - Module Src Object
 */
/** @type {Array<ModuleRegister>}*/
const MODULES = [
    {
        name : "body.name",
        oname : "body",
        src : require("./Body/index.js")
    },
    {
        name : "fight.name",
        oname : "fight",
        src : require("./Fight/index.js")
    },
    {
        name : "render.name",
        oname : "render",
        src : require("./Render/index.js")
    },
    {
        name : "utility.name",
        oname : "utility",
        src : require("./Utility/index.js")
    },
]
class GameModuleManager {
    gui = {};
    modules = {};
    t = i18n.global.t;

    async initModules() {
        let config = [];
        let funcs = {};
        for (let i in MODULES) {
            let item = MODULES[i];
            let data = await item.src.list();
            let func = data.funcs;
            let _config = {
                name : item.name,
                data : data,
                func : funcs,
                functions : data.config
            }
            funcs[item.oname] = func;
            _console.log(`Load module \"${item.oname}\" done.`);
            config.push(_config);
        }
        this.modules = funcs;
        this.config = config;
        this.gui = new GameGUI(config, unsafeWindow.cheat.core.game, i18n, this);
        unsafeWindow.cheat.gui = this.gui;
        unsafeWindow.cheat.modules = this.modules;
        unsafeWindow.cheat.hotkey = this.gui.hotkeyManager;
        unsafeWindow.cheat.monitor = this.gui.monitor;
    }

    rebuildModules() {
        this.gui.rebuildGUI();
        //setTimeout(()=>{location.reload();},1000);
    }
}

module.exports = {
    GameModuleManager
}