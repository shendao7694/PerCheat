const { GameCore, GameBody, PlayerFlags, BodyFlags } = require('../GameCore/api.js');
const {GameLog} = require('../../sys/log.js');
const _console = new GameLog("PerFlagManager");
const generateUUID = require("../../sys/uuid.js");

/**
 * @typedef {Object} PerFlagModifyId
 * @property {number} id - Body id or player id
 * @property {'body' | 'player'} type - PlayerType
 * @property {Array<number>} flags - Flags
 * @property {string} uuid - Data UUID
 */
class PerFlagManager {
    /** @type {Array<PerFlagModifyId>} */
    modifyIds = [];
    /** @type {boolean} */
    _patched = false;
    /** @type {any} */
    _originalBodyFlagsDescriptor = null;
    /** @type {any} */
    _originalPlayerFlagsDescriptor = null;

    /**
     * Constructor Body Tool
     * @param {GameCore} core 
     */
    constructor(core) {
        this.core = core;
        this._patchFlags();
    }

    /**
     * Disable flag modifications (remove prototype patches)
     */
    disable() {
        if (!this._patched) return;
        
        const bodies = this.core.game.state.bodies;
        const players = this.core.game.state.players;

        if (bodies && bodies.length > 0) {
            for (let i = 0; i < bodies.length; i++) {
                if (bodies[i]) {
                    const bodyProto = Object.getPrototypeOf(bodies[i]);
                    if (bodyProto && this._originalBodyFlagsDescriptor) {
                        Object.defineProperty(bodyProto, "flags", this._originalBodyFlagsDescriptor);
                    }
                    break;
                }
            }
        }

        if (players && players.length > 0) {
            for (let i = 0; i < players.length; i++) {
                if (players[i]) {
                    const playerProto = Object.getPrototypeOf(players[i]);
                    if (playerProto && this._originalPlayerFlagsDescriptor) {
                        Object.defineProperty(playerProto, "flags", this._originalPlayerFlagsDescriptor);
                    }
                    break;
                }
            }
        }

        this._patched = false;
        _console.log("FlagManager disabled, prototype patches removed");
    }

    /**
     * Enable flag modifications (restore prototype patches)
     */
    enable() {
        if (this._patched) return;
        this._patchFlags();
        _console.log("FlagManager enabled, prototype patches restored");
    }
    
    /**
     * Modify A Body or player flag
     * @param {number} id - Body id or player id
     * @param {'body' | 'player'} type - PlayerType 
     * @param {Array<number>} flags - Flags
     * @returns {Object} - { uuid, id, type, flags }
     */
    modifyFlag(id, type, flags) {
        if (!Array.isArray(flags)) flags = [flags];
        let data = { id: id, type: type, flags: flags, uuid: generateUUID() };
        this.modifyIds.push(data);
        return data;
    }

    /**
     * Remove modify by UUID
     * @param {string} uuid - The UUID of the modification to remove
     * @returns {boolean} - Returns true if removed successfully, false if not found
     */
    removeFlag(uuid) {
        if (typeof uuid !== 'string' || uuid.length === 0) {
            return false;
        }
        
        const idx = this.modifyIds.findIndex(e => e.uuid === uuid);
        
        if (idx === -1) {
            return false;
        }
        
        this.modifyIds.splice(idx, 1);
        return true;
    }

    /**
     * Clear all modifies
     */
    clearAll() {
        this.modifyIds = [];
    }

    /**
     * Patch Object.prototype.flags
     */
    _patchFlags() {
        if (this._patched) return;
        this._patched = true;

        const self = this;

        const bodies = this.core.game.state.bodies;
        const players = this.core.game.state.players;

        let firstBody = null;
        let firstPlayer = null;
        if (bodies && typeof bodies.length === 'number' && bodies.length > 0) {
            for (let i = 0; i < bodies.length; i++) {
                if (bodies[i]) {
                    firstBody = bodies[i];
                    break;
                }
            }
        }

        if (players && typeof players.length === 'number' && players.length > 0) {
            for (let i = 0; i < players.length; i++) {
                if (players[i]) {
                    firstPlayer = players[i];
                    break;
                }
            }
        }
        if (firstBody) {
            try {
                const bodyProto = Object.getPrototypeOf(firstBody);
                if (bodyProto) {
                    if (!this._originalBodyFlagsDescriptor) {
                        this._originalBodyFlagsDescriptor = Object.getOwnPropertyDescriptor(bodyProto, "flags");
                    }
                    Object.defineProperty(bodyProto, "flags", {
                        get() {
                            if (!self.modifyIds || !Array.isArray(self.modifyIds)) {
                                return this._flags || 0;
                            }
                            if (this.id === undefined || this.id === null) {
                                return this._flags || 0;
                            }
                            for (let i = 0; i < self.modifyIds.length; i++) {
                                const item = self.modifyIds[i];
                                if (!item) continue;
                                if (item.id !== this.id) continue;
                                if (item.type !== 'body') continue;
                                if (!item.flags || !Array.isArray(item.flags)) continue;

                                let result = 0;
                                for (let j = 0; j < item.flags.length; j++) {
                                    result |= item.flags[j];
                                }
                                return result;
                            }
                            return this._flags || 0;
                        },
                        set(value) {
                            this._flags = value;
                        },
                        configurable: true
                    });
                }
            } catch (e) {
                console.warn('Failed to patch body prototype:', e);
            }
        }
        if (firstPlayer) {
            try {
                const playerProto = Object.getPrototypeOf(firstPlayer);
                if (playerProto) {
                    if (!this._originalPlayerFlagsDescriptor) {
                        this._originalPlayerFlagsDescriptor = Object.getOwnPropertyDescriptor(playerProto, "flags");
                    }
                    Object.defineProperty(playerProto, "flags", {
                        get() {
                            if (!self.modifyIds || !Array.isArray(self.modifyIds)) {
                                return this._flags || 0;
                            }
                            if (this.id === undefined || this.id === null) {
                                return this._flags || 0;
                            }
                            for (let i = 0; i < self.modifyIds.length; i++) {
                                const item = self.modifyIds[i];
                                if (!item) continue;
                                if (item.id !== this.id) continue;
                                if (item.type !== 'player') continue;
                                if (!item.flags || !Array.isArray(item.flags)) continue;

                                let result = 0;
                                for (let j = 0; j < item.flags.length; j++) {
                                    result |= item.flags[j];
                                }
                                return result;
                            }
                            return this._flags || 0;
                        },
                        set(value) {
                            this._flags = value;
                        },
                        configurable: true
                    });
                }
            } catch (e) {
                console.warn('Failed to patch player prototype:', e);
            }
        }
        _console.log("Player Flag Patch Prototype")
    }

    /**
     * Get current flags of a body or player
     * @param {number} id
     * @param {'body' | 'player'} type
     * @returns {number}
     */
    getCurrentFlags(id, type) {
        const obj = type === 'body' 
            ? this.core.game.state.bodies.find(b => b.id === id)
            : this.core.game.state.players.find(p => p.id === id);
        return obj ? obj.flags : 0;
    }
}

module.exports = { PerFlagManager };