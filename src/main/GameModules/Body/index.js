const {readlist} = require('../funcload.js')

/**
 * @typedef {Object} FunctionRegister
 * @property {string} name - Module Name
 * @property {string} src - Module Src
 */

/** @type {Array<FunctionRegister>}*/
let LIST = [
    {
        name: "AttributeModify",
        src: require("./PerAttribute/index.js")
    },
    {
        name: "Teleport",
        src: require("./PerTeleport/index.js")
    },
    {
        name: "SpeedFly",
        src: require("./PerSpeedFly/index.js")
    },
    {
        name: "Ghost",
        src: require("./PerGhost/index.js")
    },
]

async function list() {return await readlist(LIST)};
module.exports = { list }