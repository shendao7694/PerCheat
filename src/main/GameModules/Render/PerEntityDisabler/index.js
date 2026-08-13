class EntityDisabler {
    enabled = false;
    game = unsafeWindow.cheat?.core?.game;
    i18n = require('../../../../i18n/index.js');
    _origReplica = null;
    _origRenderBoxesDesc = null;
    _origRenderBoxes = null;

    toggle = () => {
        this.enabled = !this.enabled;
        if (this.enabled) this.start();
        else this.stop();
    };

    getSelfId() {
        return this.game?.state?.secret?.id;
    }

    start() {
        const state = this.game?.state;
        if (!state) return;
        const selfId = this.getSelfId();
        if (selfId === undefined) return;

        const self = this;
        const replica = state.replica;
        if (!replica) return;

        this._origReplica = replica;

        const proxy = new Proxy(replica, {
            get(target, prop) {
                const id = self.getSelfId();
                if (id === undefined) return target[prop];
                if (prop === 'players' && Array.isArray(target.players)) {
                    return target.players.filter(item => item?.id == id);
                }
                if (prop === 'models' && Array.isArray(target.models)) {
                    return target.models.filter(item => item?.id == id);
                }
                return target[prop];
            }
        });

        state.replica = proxy;

        const desc = Object.getOwnPropertyDescriptor(state, 'renderBoxes');
        if (desc) {
            this._origRenderBoxesDesc = desc;
            let internal = state.renderBoxes || [];
            this._origRenderBoxes = internal;

            Object.defineProperty(state, 'renderBoxes', {
                get() {
                    const id = self.getSelfId();
                    if (Array.isArray(internal) && id !== undefined) {
                        return internal.filter(item => item?.id == id);
                    }
                    return internal;
                },
                set(value) {
                    const id = self.getSelfId();
                    if (Array.isArray(value) && id !== undefined) {
                        internal = value.filter(item => item?.id == id);
                    } else {
                        internal = value;
                    }
                },
                configurable: true,
                enumerable: desc.enumerable,
            });
        }

        const arr = state.renderBoxes;
        if (arr && Array.isArray(arr)) {
            for (let i = arr.length - 1; i >= 0; i--) {
                if (arr[i]?.id != selfId) {
                    try { arr.splice(i, 1); } catch(e) {}
                }
            }
        }
    }

    stop() {
        const state = this.game?.state;
        if (!state) return;

        if (this._origReplica) {
            state.replica = this._origReplica;
            this._origReplica = null;
        }

        if (this._origRenderBoxesDesc) {
            Object.defineProperty(state, 'renderBoxes', this._origRenderBoxesDesc);
            this._origRenderBoxesDesc = null;
        }
        if (this._origRenderBoxes) {
            state.renderBoxes = this._origRenderBoxes;
            this._origRenderBoxes = null;
        }
    }
}

function main() {
    const d = new EntityDisabler();
    const t = d.i18n.global.t;
    return {
        datas: {
            type: "toggle",
            onClick: d.toggle,
            hotkey: "",
            configs: [],
            name: 'render.entitydisabler.name'
        },
        func: d
    };
}
module.exports = { main };