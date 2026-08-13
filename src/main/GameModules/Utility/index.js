const {readlist} = require('../funcload.js')

/**
 * @typedef {Object} FunctionRegister
 * @property {string} name - Module Name
 * @property {string} src - Module Src
 */
/** @type {Array<FunctionRegister>}*/
let LIST = [
    {
        name: "LockSelf",
        src: require("./PerLockSelf/index.js")
    },
]

async function list() {return await readlist(LIST)};
module.exports = { list }