const {readlist} = require('../funcload.js')

/**
 * @typedef {Object} FunctionRegister
 * @property {string} name - Module Name
 * @property {string} src - Module Src
 */
/** @type {Array<FunctionRegister>}*/
let LIST = [
    {
        name: "AutoClicker",
        src: require("./PerAutoClicker/index.js")
    },
    {
        name: "KillAura",
        src: require("./PerKillAura/index.js")
    },
    {
        name: "VoidPuller",
        src: require("./PerVoidPuller/index.js")
    },
]

async function list() {return await readlist(LIST)};
module.exports = { list }