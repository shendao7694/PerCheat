const {GameLog} = require('../../sys/log.js');
const _console = new GameLog("GameFunctionBootManager");

async function readlist(LIST) {
    let config = [];
    let funcs = {};
    for (let i in LIST) {
        let item = LIST[i];
        let data = item.src.main();
        let func = data.func;
        let _config = {
            name : item.name,
            ...(data.datas)
        }
        funcs[item.name] = func;
        config.push(_config);
        _console.log(`Load function "${item.name}"`);
    }
    return {config: config ,funcs : funcs};
}

module.exports  = { readlist }