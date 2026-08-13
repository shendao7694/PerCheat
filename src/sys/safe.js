const {GameLog} = require('./log.js');
const _console = new GameLog("SafeProtect");

/**
 * @typedef {SafeProtectItem}
 * @property {string} name
 * @property {function (hooks)} doit
 * @property {string} src
 */

class GameSafeProtect {
    /**@type {Array<SafeProtectItem>} */
    protects = [
        {
            name : "JumpToProtect",
            doit : this.protectJumpTo,
            src : "messageTool"
        }
    ]

    constructor(hooks) {
        this.initProtect(hooks);
    }

    initProtect(hooks) {
        for(let i in this.protects) {
            let name = this.protects[i].name;
            let func = this.protects[i].doit;
            let src = this.protects[i].src;
            func(hooks[src]);
            _console.log(`Register safe component "${name}" `);
        }
    }

    protectJumpTo(messageTool) {
        messageTool.jumpTo = function(e) {
            var n = e.url, r = e.isNewTab, a = e.isLoginBack;
            if(n.includes("javascript:")) {
                _console.warn("JumpToProtect: Block javascript jumpTo!")
                return;
            };
            if(!r) {
                let result = window.prompt("[JumpToProtect] You will be redirected to " + n + "\ntype \"ok\" to confirm");
                if(result !== "ok") return;
            }
            messageTool.emitEvent("jumpTo", {
                url: n,
                isNewTab: !!r,
                isLoginBack: !!a
            });
        }
    }
}

module.exports = {GameSafeProtect};