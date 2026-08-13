const {GameLog} = require('../../sys/log.js');
const _console = new GameLog("CoreApi");
const { GameCore } = require('./api.js');

/** @type {Object} */
const MODEKEYWORD = {
    /** @type {string} */
    'p' : "isAdmin",
    /** @type {string} */
    'e' : 'editContentStorage'
}

/** @type {Object} */
const MODENAME = {
    /** @type {string} */
    'p' : "Play",
    /** @type {string} */
    'e' : 'Edit'
}

let OTHERKEYWORDS = {
    messageTool : "iframeEventBus"
}		

/**
 * @typedef {Object} KeywordResult
 * @property {'isAdmin' | 'editContentStorage' | 'unknown'} key - Keyword
 * @property {'p' | 'e'} mode - Mode
 */

/**
 * @typedef {Object} WaitCoreCallbackResult
 * @property {GameCore} core - Core Object
 * @property {string} mode - Mode
 * @property {string} modename - Mode name
 */

class CoreApi {
    ifcatch = false;
    /**
     * Get Core Keyword
     * @returns {KeywordResult}
     */
    getKeyword() {
        const mode = location.href.split('/')[3],
              keyword = MODEKEYWORD[mode] ?? "isAdmin";
        return {mode: mode, key: keyword};
    }
    /**
     * Wait Core
     * @param {function (WaitCoreCallbackResult) : void} callback - Callback Function
     */
    waitCore(callback) {
        let mode = this.getKeyword().mode;
        let modename = MODENAME[this.getKeyword().mode]
        Object.defineProperty(Object.prototype, this.getKeyword().key, {
            set(v) {
                callback({core: this, mode: mode, modename: modename });
            },
            configurable: true,
        });
    }
    /**
     * Hook Other
     * @param {function (hooks) : void} callback
     */
    hookOther(callback) {
        let result = {};
        const entries = Object.entries(OTHERKEYWORDS);
        const total = entries.length;
        
        entries.forEach(([key, keyword], idx) => {
            Object.defineProperty(Object.prototype, keyword, {
                set(v) {
                    result[key] = this;
                    delete Object.prototype[keyword];
                    this[keyword] = v;
                    
                    if (idx === total - 1) {
                        callback(result);
                    }
                },
                configurable: true,
            });
        });
    }
    /**
     * Set Core
     * @param {function (WaitCoreCallbackResult) : void} callback - Callback Function
     */
    setCore(callback) {
        this.waitCore( ({core, mode, modename}) => {
            if(this.ifcatch) return;
            this.ifcatch = true;
            _console.log(`Core catch (mode:${modename})`);
            unsafeWindow.core = core;
            unsafeWindow.mode = modename;
            callback({core: core, mode: mode, modename: modename});
        })
    }
}

module.exports = { CoreApi: new CoreApi()};