const { GameCore, GameBody, GameSecret} = require('../GameCore/api.js');

class PerBody{
    /**
     * Constructor Body Tool
     * @param {GameCore} core 
     */
    constructor(core){
        this.core = core;
    };
    /**
     * Get Slef Body
     * @returns {GameBody}
     */
    getSelf() {
        return this.core.game.state.bodies.find(e => e.id === this.core.game.state.secret.id);
    };
    /**
     * Get Self Secret
     * @returns {GameSecret}
     */
    getSelfSecret() {
        return this.core.game.state.secret;
    };
    /**
     * Get Bodies
     * @returns {Array<GameBody>}
     */
    getBodies() {
        return this.core.game.state.bodies;
    };
}

module.exports = { PerBody };