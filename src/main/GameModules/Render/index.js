const {readlist} = require('../funcload.js')

/**
 * @typedef {Object} FunctionRegister
 * @property {string} name - Module Name
 * @property {string} src - Module Src
 */
/** @type {Array<FunctionRegister>}*/
let LIST = [
    {
        name: "EntityEsp",
        src: require("./PerEntityEsp/index.js")
    },
    {
        name: "Freezem",
        src: require("./PerFreezem/index.js")
    },
    {
        name: "CameraModify",
        src: require("./PerCamera/index.js")
    },
    {
        name: "BlockEsp",
        src: require("./PerBlockEsp/index.js")
    },
    {
        name: "EntityDisabler",
        src: require("./PerEntityDisabler/index.js")
    },
]

async function list() {return await readlist(LIST)};
module.exports = { list }