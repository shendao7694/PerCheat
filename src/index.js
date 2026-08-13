const {CoreApi} = require("./main/GameCore/index.js");
const {GameLog} = require('./sys/log.js');
const {PerBody} = require('./main/GameFront/body.js');
const {PerFlagManager} = require('./main/GameFront/flag.js');
const {GameModuleManager} = require('./main/GameModules/index.js');
const {GameSafeProtect} = require('./sys/safe.js');
const _console = new GameLog("MainIndex");
const i18n = require('./i18n/index.js')

class Main{
    gui = {};
    modules = {};
    hotkey = {};
    monitor = {};
    hooks = {};
    core = {};
    mode = {};
    front = {};
    modulemanager = {};
    constructor(){
        const getDomain = u => { const h = u.startsWith('http') ? new URL(u).hostname : u; const p = h.split('.'); return p.length <= 2 ? h : p.slice(-2).join('.'); };
        if(getDomain(window.location.hostname) != "dao3.fun") _console.warn("Attempt to run in a non Box3 environment")
        if(getDomain(window.location.hostname) == "dao3.fun" && (!window.location.href.includes("https://view.dao3.fun/"))) return;
        CoreApi.hookOther((value) => {
            setTimeout(() => {this.initHookOther(value);}, 1000);
        })
        CoreApi.setCore(({core, mode}) => {
            setTimeout(() => {core.game.onReady.handlers.push(() => {this.initMainHandler({core: core, mode: mode})});}, 1000);
        });
    }
    initHookOther( value ) {
        this.hooks = value;
        this.safe = new GameSafeProtect(value);
    }
    initMainHandler( {core , mode} ){
        unsafeWindow.cheat = this;
        GM_notification({
            title: i18n.global.t("system.notice.title"),
            text: i18n.global.t("system.notice.msg"),
            image: "https://anic.cc.cd/public/icon.png",
            timeout: 5000,
        });
        this.core = core;
        this.mode = mode;
        this.front = {
            body: new PerBody(this.core),
            flagmanager: new PerFlagManager(this.core),
        };
        this.modulemanager = new GameModuleManager();
        this.modulemanager.initModules();
    }
}

const main = new Main();