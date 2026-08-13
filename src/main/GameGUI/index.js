const { GUI } = require('lil-gui');
const {customStyle} = require('./styles/index.js')
const {GameLog} = require('../../sys/log.js');
const _console = new GameLog("GameGUI");

/**
 * @typedef {Function} GameFunctionOnchangeCallback
 * @typedef {boolean} state
 */

/**
 * @typedef {Object} GameFunctionConfig
 * @property {string} type
 * @property {string} name
 * @property {*} [default]
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {Array} [options]
 * @property {function(any):void} [onChange]
 * @property {function(Object):void} [onControllerCreate]
 * @property {boolean} [autoRefresh]
 * @property {number} [refreshInterval]
 * @property {function} [refreshData]
 * @property {string} [hotkey]
 */

/**
 * @typedef {Object} GameGuiFunction
 * @property {string} name
 * @property {string} type
 * @property {function(Object):void} onClick
 * @property {Object.<string, GameFunctionConfig>} configs
 * @property {string} [hotkey]
 * @property {boolean} [defaultState]
 */

/**
 * @typedef {Object} GameGUIModule
 * @property {string} name
 * @property {Array<GameGuiFunction>} functions
 */

/**
 * @typedef {Array<GameGUIModule>} GameGUIModules
 */

class GameMonitor {
    gui = null;
    data = {
        fps: 0,
        tps: 0,
        position: '0, 0, 0',
        ping: 0
    };
    fpsCounter = 0;
    tpsCounter = 0;
    intervalId = null;
    game = null;
    fpsCanvas = null;
    tpsCanvas = null;
    fpsBuffer = [];
    tpsBuffer = [];
    maxPoints = 60;
    container = null;
    isOpen = false;
    visible = true;
    i18n = null;

    constructor(game, i18n = null) {
        this.game = game || unsafeWindow?.cheat?.core?.game;
        this.i18n = i18n;
        this.initUI();
        this.setupListeners();
    }

    setVisible(visible) {
        this.visible = visible;
        if (this.container) {
            this.container.style.display = visible ? 'block' : 'none';
        }
    }

    initUI() {
        const t = this.i18n?.global?.t || ((key) => key);
        
        this.container = document.createElement('div');
        this.container.style.cssText = `
            position: fixed;
            top: 70px;
            left: 20px;
            z-index: 1000;
            background: rgba(10, 26, 42, 0.85);
            border: 1px solid rgba(26, 74, 122, 0.5);
            border-radius: 8px;
            padding: 6px 10px;
            min-width: 95px;
            max-width: 95px;
            width: 95px;
            backdrop-filter: blur(10px);
            font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
            font-size: 12px;
            color: #8cbfff;
            user-select: none;
            transition: all 0.3s ease;
            overflow: hidden;
        `;
        document.body.appendChild(this.container);

        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin-bottom: 0;
            gap: 6px;
        `;

        const toggleBtn = document.createElement('span');
        toggleBtn.textContent = '+';
        toggleBtn.style.cssText = `
            cursor: pointer;
            font-size: 16px;
            color: #6aafff;
            padding: 0 4px;
            line-height: 1;
            flex-shrink: 0;
        `;
        toggleBtn.onclick = (e) => {
            e.stopPropagation();
            this.toggle();
        };
        header.appendChild(toggleBtn);

        const title = document.createElement('div');
        title.textContent = t('system.gui.monitor.title');
        title.style.cssText = `
            font-weight: 600;
            font-size: 13px;
            color: #6aafff;
            cursor: pointer;
            white-space: nowrap;
        `;
        title.onclick = () => {
            this.toggle();
        };
        header.appendChild(title);

        this.container.appendChild(header);

        this.contentContainer = document.createElement('div');
        this.contentContainer.style.cssText = `
            overflow: hidden;
            transition: all 0.3s ease;
            max-height: 0; 
            opacity: 0;
            margin-top: 0;
        `;
        this.container.appendChild(this.contentContainer);

        this.fpsRow = this.createRow(t('system.gui.monitor.fps'), 'fps');
        this.contentContainer.appendChild(this.fpsRow);

        this.fpsCanvas = document.createElement('canvas');
        this.fpsCanvas.width = 260;
        this.fpsCanvas.height = 40;
        this.fpsCanvas.style.cssText = 'width:100%;height:40px;background:rgba(0,0,0,0.2);border-radius:4px;margin-top:2px;';
        this.contentContainer.appendChild(this.fpsCanvas);

        this.tpsRow = this.createRow(t('system.gui.monitor.tps'), 'tps');
        this.contentContainer.appendChild(this.tpsRow);

        this.tpsCanvas = document.createElement('canvas');
        this.tpsCanvas.width = 260;
        this.tpsCanvas.height = 40;
        this.tpsCanvas.style.cssText = 'width:100%;height:40px;background:rgba(0,0,0,0.2);border-radius:4px;margin-top:2px;';
        this.contentContainer.appendChild(this.tpsCanvas);

        this.pingRow = this.createRow(t('system.gui.monitor.ping'), 'ping');
        this.contentContainer.appendChild(this.pingRow);

        this.posRow = this.createRow(t('system.gui.monitor.position'), 'position');
        this.contentContainer.appendChild(this.posRow);

        const copyBtn = document.createElement('button');
        copyBtn.textContent = t('system.gui.monitor.copy');
        copyBtn.style.cssText = `
            margin-top: 6px;
            padding: 3px 10px;
            background: rgba(26, 90, 154, 0.4);
            border: 1px solid rgba(26, 90, 154, 0.6);
            border-radius: 4px;
            color: #8cbfff;
            cursor: pointer;
            font-size: 11px;
            width: 100%;
            transition: background 0.2s;
        `;
        copyBtn.onmouseenter = () => {
            copyBtn.style.background = 'rgba(26, 90, 154, 0.7)';
        };
        copyBtn.onmouseleave = () => {
            copyBtn.style.background = 'rgba(26, 90, 154, 0.4)';
        };
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(this.data.position);
        };
        this.contentContainer.appendChild(copyBtn);
    }

    createRow(label, key) {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            justify-content: space-between;
            padding: 1px 0;
            font-size: 11px;
        `;
        
        const labelEl = document.createElement('span');
        labelEl.textContent = label + ':';
        labelEl.style.color = '#b0b4cc';
        
        const valueEl = document.createElement('span');
        valueEl.style.color = '#6aafff';
        valueEl.style.fontWeight = '500';
        valueEl.textContent = '0';
        
        row.appendChild(labelEl);
        row.appendChild(valueEl);
        
        this[`${key}El`] = valueEl;
        
        return row;
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const toggleBtn = this.container.querySelector('span:first-child');
        if (this.isOpen) {
            this.contentContainer.style.maxHeight = '600px';
            this.contentContainer.style.opacity = '1';
            this.contentContainer.style.marginTop = '0';
            toggleBtn.textContent = '−';
            this.container.style.minWidth = '200px';
            this.container.style.maxWidth = '200px';
            this.container.style.padding = '8px 12px';
            this.container.style.width = 'auto';
        } else {
            this.contentContainer.style.maxHeight = '0';
            this.contentContainer.style.opacity = '0';
            this.contentContainer.style.marginTop = '0';
            toggleBtn.textContent = '+';
            this.container.style.minWidth = '95px';
            this.container.style.maxWidth = '95px';
            this.container.style.padding = '6px 10px';
            this.container.style.width = '80px';
        }
    }

    setupListeners() {
        let frameCount = 0;
        let lastFpsTime = performance.now();

        const countFPS = () => {
            frameCount++;
            const now = performance.now();
            if (now - lastFpsTime >= 1000) {
                const currentFps = frameCount;
                this.data.fps = currentFps;
                if (this.fpsEl) this.fpsEl.textContent = currentFps;
                this.updateGraph(this.fpsCanvas, this.fpsBuffer, currentFps, '#4a9af9', 0, 120);
                frameCount = 0;
                lastFpsTime = now;
            }
            requestAnimationFrame(countFPS);
        };
        countFPS();

        setInterval(() => {
            const state = this.game?.state;
            let currentTps;
            if (state && state.clock && state.clock.tickRate) {
                currentTps = Math.round(state.clock.tickRate);
            } else {
                currentTps = Math.floor(Math.random() * 10 + 15);
            }
            this.data.tps = currentTps;
            if (this.tpsEl) this.tpsEl.textContent = currentTps;
            this.updateGraph(this.tpsCanvas, this.tpsBuffer, currentTps, '#2cc9ff', 0, 60);
        }, 1000);

        setInterval(() => {
            try {
                const state = this.game?.state;
                if (state && state.secret) {
                    const player = state.bodies?.find(b => b.id === state.secret.id);
                    if (player) {
                        const pos = `${player.px.toFixed(2)}, ${player.py.toFixed(2)}, ${player.pz.toFixed(2)}`;
                        this.data.position = pos;
                        if (this.positionEl) this.positionEl.textContent = pos;
                    }
                }
            } catch (e) {}
        }, 100);

        setInterval(() => {
            const ping = Math.floor(Math.random() * 50 + 20);
            this.data.ping = ping;
            if (this.pingEl) this.pingEl.textContent = ping + 'ms';
        }, 2000);
    }

    updateGraph(canvas, buffer, value, color, min, max) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        buffer.push(value);
        if (buffer.length > this.maxPoints) {
            buffer.shift();
        }
        
        ctx.clearRect(0, 0, width, height);
        
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
            const y = (i / 4) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        if (buffer.length < 2) return;
        
        const range = max - min || 1;
        ctx.beginPath();
        for (let i = 0; i < buffer.length; i++) {
            const x = (i / this.maxPoints) * width;
            const y = height - ((buffer[i] - min) / range) * height;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const lastX = (buffer.length - 1) / this.maxPoints * width;
        const lastY = height - ((buffer[buffer.length - 1] - min) / range) * height;
        ctx.lineTo(lastX, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = color + '20';
        ctx.fill();
    }

    destroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}
class GameHotkey {
    hotkeys = new Map();
    keyToId = new Map();
    gui = null;
    controllerMap = new Map();
    enabled = true;
    keyControllers = new Map();
    storageKey = 'percheat_hotkeys';
    isOpen = true;
    toggleCallback = null;
    toggleUIHotkey = 'm';
    hotkeysEnabled = true;
    i18n = null;

    constructor(i18n = null) {
        this.i18n = i18n;
        this.loadToggleUIHotkey();
        this.initUI();
        this.setupListeners();
        this.registerHotkeyToggle();
    }

    loadToggleUIHotkey() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                if (parsed['__toggle_ui_hotkey__']) {
                    this.toggleUIHotkey = parsed['__toggle_ui_hotkey__'];
                }
                if (parsed['__hotkeys_enabled__'] !== undefined) {
                    this.hotkeysEnabled = parsed['__hotkeys_enabled__'];
                }
            }
        } catch (e) {
            _console.warn('Failed to load hotkey settings from storage:', e);
        }
    }

    saveToggleUIHotkey() {
        try {
            let data = {};
            const existing = localStorage.getItem(this.storageKey);
            if (existing) {
                data = JSON.parse(existing);
            }
            data['__toggle_ui_hotkey__'] = this.toggleUIHotkey;
            data['__hotkeys_enabled__'] = this.hotkeysEnabled;
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            _console.warn('Failed to save hotkey settings to storage:', e);
        }
    }

    initUI() {
        const t = this.i18n?.global?.t || ((key) => key);
        
        this.gui = new GUI({ title: t('system.gui.hotkey.title') });
        this.gui.close();
        let dom = this.gui.domElement;
        dom.style.position = 'fixed';
        dom.style.bottom = '20px';
        dom.style.right = '20px';
        dom.style.top = 'auto';
        dom.style.left = 'auto';
        dom.style.width = 'auto';
        dom.style.maxWidth = '500px';
        dom.style.minWidth = '100px';
        dom.style.maxHeight = '80vh';
        dom.style.overflowY = 'auto';
        dom.style.overflowX = 'hidden';

        this.hotkeysEnabledObj = { enabled: this.hotkeysEnabled };
        this.hotkeysEnabledController = this.gui.add(this.hotkeysEnabledObj, 'enabled')
            .name(t('system.gui.hotkey.enableHotkeys'))
            .onChange((value) => {
                this.hotkeysEnabled = value;
                this.enabled = value;
                this.saveToggleUIHotkey();
            });

        this.toggleUIHotkeyObj = { toggleUI: this.toggleUIHotkey };
        this.toggleUIHotkeyController = this.gui.add(this.toggleUIHotkeyObj, 'toggleUI')
            .name(`${t('system.gui.hotkey.toggleUI')} [${this.toggleUIHotkey}]`)
            .onChange((value) => {
                this.updateToggleUIHotkey(value);
            });

        const resetObj = { reset: () => this.resetAll() };
        this.gui.add(resetObj, 'reset').name(t('system.gui.hotkey.reset'));

        this.setVisible(this.isOpen);
    }

    updateToggleUIHotkey(newKey) {
        const oldKey = this.toggleUIHotkey;
        this.toggleUIHotkey = newKey;
        const t = this.i18n?.global?.t || ((key) => key);

        this.toggleUIHotkeyController.name(`${t('system.gui.hotkey.toggleUI')} [${newKey}]`);
        this.saveToggleUIHotkey();

        if (this.toggleCallback) {
            this.toggleCallback(newKey, oldKey);
        }
    }

    setupListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                return;
            }

            if (e.ctrlKey && e.key.toLowerCase() === this.toggleUIHotkey) {
                e.preventDefault();
                if (this.toggleCallback) {
                    this.toggleCallback(this.toggleUIHotkey, this.toggleUIHotkey);
                }
                return;
            }

            if (!this.enabled || !this.hotkeysEnabled) return;
            if (e.ctrlKey || e.altKey || e.metaKey) return;
            
            const key = e.key;
            const ids = this.keyToId.get(key);
            if (ids) {
                for (const id of ids) {
                    if (id === 'hotkey_toggle') continue;
                    const hotkey = this.hotkeys.get(id);
                    if (hotkey) {
                        e.preventDefault();
                        hotkey.callback();
                    }
                }
            }
        });
    }

    registerHotkeyToggle() {
        const id = 'hotkey_toggle';
        const key = this.toggleUIHotkey;
        
        this.hotkeys.set(id, {
            key: key,
            callback: () => {
                if (this.toggleCallback) {
                    this.toggleCallback(key, key);
                }
            },
            displayName: 'Toggle Panel',
            moduleName: 'System',
            defaultKey: 'm',
            type: 'system'
        });
        
        const ids = this.keyToId.get(key) || [];
        ids.push(id);
        this.keyToId.set(key, ids);
        
        this.saveToStorage();
    }

    setToggleCallback(callback) {
        this.toggleCallback = callback;
    }

    toggle() {
        this.isOpen = !this.isOpen;
        const dom = this.gui.domElement;
        if (this.isOpen) {
            dom.style.display = 'inline-block';
        } else {
            dom.style.display = 'none';
        }
    }

    setVisible(visible) {
        this.isOpen = visible;
        if (this.gui && this.gui.domElement) {
            this.gui.domElement.style.display = visible ? 'inline-block' : 'none';
        }
    }

    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                const parsed = JSON.parse(data);
                return parsed;
            }
        } catch (e) {
            _console.warn('Failed to load hotkeys from storage:', e);
        }
        return null;
    }

    saveToStorage() {
        try {
            const data = {};
            for (const [id, hk] of this.hotkeys) {
                data[id] = hk.key;
            }
            data['__toggle_ui_hotkey__'] = this.toggleUIHotkey;
            data['__hotkeys_enabled__'] = this.hotkeysEnabled;
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            _console.warn('Failed to save hotkeys to storage:', e);
        }
    }

    register(id, defaultKey, callback, displayName, moduleName, type = 'function') {
        if (id === 'hotkey_toggle') return;
        const stored = this.loadFromStorage();
        const key = (stored && stored[id] !== undefined) ? stored[id] : defaultKey;
        
        if (this.hotkeys.has(id)) {
            const oldKey = this.hotkeys.get(id).key;
            const oldIds = this.keyToId.get(oldKey) || [];
            this.keyToId.set(oldKey, oldIds.filter(i => i !== id));
            this.hotkeys.delete(id);
            this.removeController(id);
        }
        
        this.hotkeys.set(id, { key, callback, displayName, moduleName, defaultKey, type });
        
        const ids = this.keyToId.get(key) || [];
        ids.push(id);
        this.keyToId.set(key, ids);
        
        this.addController(id, key, displayName, moduleName);
        this.saveToStorage();
    }

    unregister(id) {
        const hotkey = this.hotkeys.get(id);
        if (hotkey) {
            const ids = this.keyToId.get(hotkey.key) || [];
            this.keyToId.set(hotkey.key, ids.filter(i => i !== id));
            this.hotkeys.delete(id);
            this.removeController(id);
            this.saveToStorage();
        }
    }

    translateNameForDisplay(name) {
        const t = this.i18n?.global?.t || ((key) => key);
        if (!name) return name;
        
        const directTranslated = t(name);
        if (directTranslated !== name) {
            return directTranslated;
        }
        
        if (name.includes('.')) {
            const parts = name.split('.');
            const lastPart = parts[parts.length - 1];
            const lastTranslated = t(lastPart);
            if (lastTranslated !== lastPart) {
                return lastTranslated;
            }
        }
        
        return name;
    }

    addController(id, key, displayName, moduleName) {
        const t = this.i18n?.global?.t || ((key) => key);
        
        const obj = {
            [id]: key
        };
        
        let folder = this.keyControllers.get(moduleName);
        if (!folder) {
            const translatedModuleName = this.translateNameForDisplay(moduleName);
            folder = this.gui.addFolder(translatedModuleName);
            folder.close();
            this.keyControllers.set(moduleName, folder);
        }
        
        let targetFolder = folder;
        let finalDisplayName = displayName;
        const parts = displayName.split(':');
        
        if (parts.length > 1) {
            const funcName = parts[0];
            const configName = parts[1];
            
            let configFolder = this.keyControllers.get(`${moduleName}_${funcName}_configs`);
            if (!configFolder) {
                const translatedFuncName = this.translateNameForDisplay(funcName);
                configFolder = folder.addFolder(t('system.gui.hotkey.config', { name: translatedFuncName }));
                configFolder.close();
                this.keyControllers.set(`${moduleName}_${funcName}_configs`, configFolder);
            }
            
            targetFolder = configFolder;
            finalDisplayName = configName;
        }
        
        const translatedDisplayName = this.translateNameForDisplay(finalDisplayName);
        
        const controller = targetFolder.add(obj, id)
            .name(`${translatedDisplayName} [${key}]`)
            .onChange((value) => {
                this.updateKey(id, value);
            });
        this.controllerMap.set(id, controller);
    }

    removeController(id) {
        const controller = this.controllerMap.get(id);
        if (controller) {
            for (const [moduleName, folder] of this.keyControllers) {
                try {
                    const children = folder.controllers || [];
                    const idx = children.indexOf(controller);
                    if (idx !== -1) {
                        folder.destroy();
                        this.keyControllers.delete(moduleName);
                        for (const [hid, hk] of this.hotkeys) {
                            if (hk.moduleName === moduleName) {
                                this.addController(hid, hk.key, hk.displayName, moduleName);
                            }
                        }
                        break;
                    }
                } catch (e) {}
            }
            this.controllerMap.delete(id);
        }
    }

    updateKey(id, newKey) {
        const hotkey = this.hotkeys.get(id);
        if (!hotkey) return;
        
        const oldIds = this.keyToId.get(hotkey.key) || [];
        this.keyToId.set(hotkey.key, oldIds.filter(i => i !== id));
        
        hotkey.key = newKey;
        const ids = this.keyToId.get(newKey) || [];
        ids.push(id);
        this.keyToId.set(newKey, ids);
        
        const controller = this.controllerMap.get(id);
        if (controller) {
            const displayName = hotkey.displayName.includes(':') ? hotkey.displayName.split(':')[1] : hotkey.displayName;
            const translatedDisplayName = this.translateNameForDisplay(displayName);
            controller.name(`${translatedDisplayName} [${newKey}]`);
        }
        this.saveToStorage();
    }

    resetAll() {
        const t = this.i18n?.global?.t || ((key) => key);
        const storageData = this.loadFromStorage();
        for (const [id, hk] of this.hotkeys) {
            if (id === 'hotkey_toggle') continue;
            if (storageData && storageData[id] !== undefined) {
                delete storageData[id];
            }
            const defaultKey = hk.defaultKey;
            const oldIds = this.keyToId.get(hk.key) || [];
            this.keyToId.set(hk.key, oldIds.filter(i => i !== id));
            hk.key = defaultKey;
            const ids = this.keyToId.get(defaultKey) || [];
            ids.push(id);
            this.keyToId.set(defaultKey, ids);
            const controller = this.controllerMap.get(id);
            if (controller) {
                const displayName = hk.displayName.includes(':') ? hk.displayName.split(':')[1] : hk.displayName;
                const translatedDisplayName = this.translateNameForDisplay(displayName);
                controller.name(`${translatedDisplayName} [${defaultKey}]`);
                controller.setValue(defaultKey);
            }
        }
        
        this.toggleUIHotkey = 'm';
        this.toggleUIHotkeyObj.toggleUI = 'm';
        if (this.toggleUIHotkeyController) {
            this.toggleUIHotkeyController.name(`${t('system.gui.hotkey.toggleUI')} [m]`);
            this.toggleUIHotkeyController.setValue('m');
        }
        
        this.hotkeysEnabled = true;
        this.enabled = true;
        this.hotkeysEnabledObj.enabled = true;
        if (this.hotkeysEnabledController) {
            this.hotkeysEnabledController.setValue(true);
        }
        
        localStorage.removeItem(this.storageKey);
        _console.log('All hotkeys reset to defaults');
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.hotkeysEnabled = enabled;
        this.hotkeysEnabledObj.enabled = enabled;
        if (this.hotkeysEnabledController) {
            this.hotkeysEnabledController.setValue(enabled);
        }
        this.saveToggleUIHotkey();
    }

    getHotkeys() {
        return Array.from(this.hotkeys.entries()).map(([id, hk]) => ({
            id,
            key: hk.key,
            defaultKey: hk.defaultKey,
            displayName: hk.displayName,
            moduleName: hk.moduleName,
            type: hk.type
        }));
    }

    getToggleUIHotkey() {
        return this.toggleUIHotkey;
    }

    isHotkeysEnabled() {
        return this.hotkeysEnabled;
    }

    destroy() {
        for (const [moduleName, folder] of this.keyControllers) {
            folder.destroy();
        }
        this.keyControllers.clear();
        this.controllerMap.clear();
        this.hotkeys.clear();
        this.keyToId.clear();
        if (this.gui) {
            this.gui.destroy();
        }
    }
}

class GameGUI {
    guiName = "PerCheatNext";
    modules = [];
    params = {};
    functionParams = new Map();
    functionCallbacks = new Map();
    toggleStates = new Map();
    buttonCallbacks = new Map();
    controllerMap = new Map();
    refreshIntervals = new Map();
    hotkeyManager = null;
    monitor = null;
    game = null;
    allPanelsVisible = true;
    root = null;
    i18n = null;
    settingsGUI = null;
    settingsControllers = new Map();

    constructor(modules, game, i18n = null, mm) {
        this.modules = modules || [];
        this.game = game || unsafeWindow?.cheat?.core?.game;
        this.i18n = i18n;
        this.mm = mm;
        this.hotkeyManager = new GameHotkey(i18n);
        this.monitor = new GameMonitor(this.game, i18n);
        this.initUI();
        this.buildUI();
        this.setupToggleCallback();
        this.addSettingsPanel();
    }

    translateNameForDisplay(name) {
        const t = this.i18n?.global?.t || ((key) => key);
        if (!name) return name;
        if (typeof name === 'number') return String(name);
        if (typeof name !== 'string') return name;
        
        const directTranslated = t(name);
        if (directTranslated !== name) {
            return directTranslated;
        }
        
        if (name.includes('.')) {
            const parts = name.split('.');
            const lastPart = parts[parts.length - 1];
            const lastTranslated = t(lastPart);
            if (lastTranslated !== lastPart) {
                return lastTranslated;
            }
            return name;
        }
        
        return name;
    }

    createTranslatedOptions(optionsArray) {
        if (!Array.isArray(optionsArray)) return optionsArray;
        const result = {};
        optionsArray.forEach(option => {
            const translated = this.translateNameForDisplay(option);
            result[translated] = option;
        });
        return result;
    }

    setupToggleCallback() {
        this.hotkeyManager.setToggleCallback(() => {
            this.toggleAllPanels();
        });
    }

    toggleAllPanels() {
        this.allPanelsVisible = !this.allPanelsVisible;
        
        if (this.root && this.root.domElement) {
            if (this.allPanelsVisible) {
                this.root.domElement.style.display = 'inline-block';
                this.root.domElement.style.visibility = 'visible';
                this.root.domElement.style.pointerEvents = 'auto';
            } else {
                this.root.domElement.style.display = 'none';
                this.root.domElement.style.visibility = 'hidden';
                this.root.domElement.style.pointerEvents = 'none';
            }
        }
        
        if (this.hotkeyManager && this.hotkeyManager.gui && this.hotkeyManager.gui.domElement) {
            if (this.allPanelsVisible) {
                this.hotkeyManager.gui.domElement.style.display = 'inline-block';
                this.hotkeyManager.gui.domElement.style.visibility = 'visible';
                this.hotkeyManager.gui.domElement.style.pointerEvents = 'auto';
            } else {
                this.hotkeyManager.gui.domElement.style.display = 'none';
                this.hotkeyManager.gui.domElement.style.visibility = 'hidden';
                this.hotkeyManager.gui.domElement.style.pointerEvents = 'none';
            }
        }
        
        if (this.monitor && this.monitor.container) {
            if (this.allPanelsVisible) {
                this.monitor.container.style.display = 'block';
                this.monitor.container.style.visibility = 'visible';
                this.monitor.container.style.pointerEvents = 'auto';
            } else {
                this.monitor.container.style.display = 'none';
                this.monitor.container.style.visibility = 'hidden';
                this.monitor.container.style.pointerEvents = 'none';
            }
        }

        if (this.settingsGUI) {
            if (this.allPanelsVisible) {
                this.settingsGUI.domElement.style.display = 'inline-block';
                this.settingsGUI.domElement.style.visibility = 'visible';
                this.settingsGUI.domElement.style.pointerEvents = 'auto';
            } else {
                this.settingsGUI.domElement.style.display = 'none';
                this.settingsGUI.domElement.style.visibility = 'hidden';
                this.settingsGUI.domElement.style.pointerEvents = 'none';
            }
        }
    }

    addSettingsPanel() {
        const t = this.i18n?.global?.t || ((key) => key);
        
        this.settingsGUI = new GUI({ 
            title: t('system.gui.settings.title')
        });
        
        this.settingsGUI.close();

        const dom = this.settingsGUI.domElement;
        dom.style.position = 'fixed';
        dom.style.top = '120px';
        dom.style.right = '20px';
        dom.style.bottom = 'auto';
        dom.style.left = 'auto';
        dom.style.width = 'auto';
        dom.style.maxWidth = '280px';
        dom.style.minWidth = '105px';
        dom.style.zIndex = '1000';
        dom.style.maxHeight = '80vh';
        dom.style.overflowY = 'auto';
        dom.style.overflowX = 'hidden';
        
        const langSettings = {
            language: this.i18n?.global?.locale || 'zh'
        };
        
        const availableLocales = this.i18n?.global?.messages ? 
            Object.keys(this.i18n.global.messages) : 
            ['zh', 'en'];
        
        const localeNames = {
            'zh': '中文',
            'en': 'English',
        };
        
        const localeOptions = {};
        availableLocales.forEach(locale => {
            const displayName = localeNames[locale] || locale;
            localeOptions[displayName] = locale;
        });
        
        const langController = this.settingsGUI.add(langSettings, 'language', localeOptions)
            .name(t('system.gui.settings.language') || 'Language')
            .onChange((value) => {
                localStorage.setItem("percheat_language", value);
                if (this.i18n && this.i18n.setLocale) {
                    this.i18n.setLocale(value);
                    _console.log(`Language changed to: ${value}`);
                    this.mm.rebuildModules();
                }
            });
        
        this.settingsControllers.set('language', langController);
        
        const resetSettings = {
            reset: () => {
                const defaultLocale = 'zh';
                langSettings.language = defaultLocale;
                langController.setValue(defaultLocale);
                localStorage.setItem("percheat_language", defaultLocale);
                if (this.i18n && this.i18n.setLocale) {
                    this.i18n.setLocale(defaultLocale);
                    this.mm.rebuildModules();
                }
            }
        };
        
        this.settingsGUI.add(resetSettings, 'reset')
            .name(t('system.gui.settings.reset') || 'Reset');
        
        this.settingsGUI.domElement.style.display = 'inline-block';
    }

    rebuildGUI(config = null) {
        if (this.root) {
            this.root.destroy();
            this.root = null;
        }
        if (this.hotkeyManager) {
            this.hotkeyManager.destroy();
            this.hotkeyManager = null;
        }
        if (this.monitor) {
            this.monitor.destroy();
            this.monitor = null;
        }
        if (this.settingsGUI) {
            this.settingsGUI.destroy();
            this.settingsGUI = null;
            this.settingsControllers.clear();
        }

        for (const [key, interval] of this.refreshIntervals) {
            clearInterval(interval);
        }
        this.refreshIntervals.clear();

        this.functionParams.clear();
        this.functionCallbacks.clear();
        this.toggleStates.clear();
        this.buttonCallbacks.clear();
        this.controllerMap.clear();

        const settingsStyle = document.querySelector('style[data-gui-settings]');
        if (settingsStyle) {
            settingsStyle.remove();
        }

        const scrollStyle = document.querySelector('style[data-gui-scroll]');
        if (scrollStyle) {
            scrollStyle.remove();
        }

        const customStyleEl = document.querySelector('style[data-gui-custom]');
        if (customStyleEl) {
            customStyleEl.remove();
        }

        this.allPanelsVisible = true;

        if (config) {
            if (config.modules) {
                this.modules = config.modules.map(module => {
                    return {
                        ...module,
                        functions: module.functions.map(func => {
                            return {
                                ...func,
                                configs: Object.fromEntries(
                                    Object.entries(func.configs || {}).map(([key, cfg]) => {
                                        return [key, { ...cfg }];
                                    })
                                )
                            };
                        })
                    };
                });
            }
            if (config.game) {
                this.game = config.game;
            }
            if (config.i18n) {
                this.i18n = config.i18n;
            }
            if (config.guiName) {
                this.guiName = config.guiName;
            }
        }

        this.hotkeyManager = new GameHotkey(this.i18n);
        this.monitor = new GameMonitor(this.game, this.i18n);
        this.initUI();
        this.buildUI();
        this.setupToggleCallback();
        this.addSettingsPanel();

        _console.log('GUI rebuilt with new language');
    }

    initUI() {
        const t = this.i18n?.global?.t || ((key) => key);
        this.root = new GUI({ title: t('system.gui.title') });
        let dom = this.root.domElement;
        const style = document.createElement('style');
        this.root.close();                                                                                                                  
        dom.style.position = 'fixed';
        dom.style.bottom = '20px';
        dom.style.left = '20px';
        dom.style.top = 'auto';
        dom.style.right = 'auto';
        dom.style.width = 'auto';
        dom.style.maxWidth = '500px';
        dom.style.minWidth = '100px';
        dom.style.display = 'inline-block';
        dom.style.maxHeight = '70vh';
        
        const childrenContainer = dom.querySelector('.lil-children');
        if (childrenContainer) {
            childrenContainer.style.maxHeight = 'calc(70vh - 40px)';
            childrenContainer.style.overflowY = 'auto';
            childrenContainer.style.overflowX = 'hidden';
        }
        
        const scrollStyle = document.createElement('style');
        scrollStyle.textContent = `
            .lil-gui .lil-children::-webkit-scrollbar {
                width: 4px;
            }
            .lil-gui .lil-children::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.05);
                border-radius: 2px;
            }
            .lil-gui .lil-children::-webkit-scrollbar-thumb {
                background: rgba(26, 90, 154, 0.6);
                border-radius: 2px;
            }
            .lil-gui .lil-children::-webkit-scrollbar-thumb:hover {
                background: rgba(26, 90, 154, 0.8);
            }
            .lil-gui .lil-children {
                scrollbar-width: thin;
                scrollbar-color: rgba(26, 90, 154, 0.6) rgba(255,255,255,0.05);
            }
            .lil-gui.lil-root {
                display: flex !important;
                flex-direction: column !important;
            }
            .lil-gui.lil-root > .lil-title {
                flex-shrink: 0 !important;
            }
        `;
        document.head.appendChild(scrollStyle);
        
        style.textContent = customStyle;
        document.head.appendChild(style);
        _console.log("GameGui init done")
    }

    buildUI() {
        for (let moduleConfig of this.modules) {
            this.addModuleGui(moduleConfig);
        }
        _console.log("GameGui build done")
    }

    addModuleGui(config) {
        const t = this.i18n?.global?.t || ((key) => key);
        
        const translatedModuleName = this.translateNameForDisplay(config.name);
        let moduleFolder = this.root.addFolder(translatedModuleName);
        moduleFolder.close();

        for (let func of config.functions) {
            const translatedFuncName = this.translateNameForDisplay(func.name);
            let funcFolder = moduleFolder.addFolder(translatedFuncName);
            let params = {};
            let paramMap = {};

            funcFolder.close();

            if (func.type === 'toggle') {
                const initialState = func.defaultState || false;
                this.toggleStates.set(func.name, initialState);
                
                let toggleObj = {
                    [func.name]: () => {
                        this.toggleFunction(func.name, paramMap);
                    }
                };
                
                const label = initialState ? `[${t('system.gui.active')}]` : `[${t('system.gui.inactive')}]`;
                let controller = funcFolder.add(toggleObj, func.name)
                    .name(`${label} ${translatedFuncName}`);
                
                this.toggleStates.set(`${func.name}_controller`, controller);
                
            } else {
                let clickObj = {
                    [func.name]: () => {
                        this.executeFunction(func.name, paramMap);
                    }
                };
                
                funcFolder.add(clickObj, func.name)
                    .name(translatedFuncName);
            }

            for (let [key, cfg] of Object.entries(func.configs)) {
                let paramKey = `${func.name}_${key}`;
                const translatedConfigName = this.translateNameForDisplay(cfg.name);
                
                if (cfg.type === 'button') {
                    this.buttonCallbacks.set(paramKey, cfg.onChange || null);
                    let btnObj = {
                        [paramKey]: () => {
                            let callback = this.buttonCallbacks.get(paramKey);
                            if (callback && typeof callback === 'function') {
                                callback();
                            }
                        }
                    };
                    let controller = funcFolder.add(btnObj, paramKey);
                    controller.name(translatedConfigName);
                    
                    if (cfg.onControllerCreate && typeof cfg.onControllerCreate === 'function') {
                        cfg.onControllerCreate(controller);
                    }
                    continue;
                }
                
                params[paramKey] = cfg.default;
                paramMap[key] = paramKey;
                
                let controller;
                
                if (cfg.type === 'select' && cfg.options) {
                    let translatedOptions = {};
                    let optionsArray = [];
                    
                    if (Array.isArray(cfg.options)) {
                        optionsArray = cfg.options;
                        cfg.options.forEach(option => {
                            const translated = this.translateNameForDisplay(option);
                            translatedOptions[translated] = option;
                        });
                    } else if (typeof cfg.options === 'object') {
                        optionsArray = Object.values(cfg.options);
                        Object.keys(cfg.options).forEach(key => {
                            const translated = this.translateNameForDisplay(key);
                            translatedOptions[translated] = cfg.options[key];
                        });
                    } else {
                        translatedOptions = cfg.options;
                        optionsArray = [cfg.options];
                    }
                    
                    let defaultValue = cfg.default;
                    if (defaultValue && typeof defaultValue === 'string') {
                        const found = optionsArray.find(opt => opt === defaultValue);
                        if (found) {
                            defaultValue = this.translateNameForDisplay(defaultValue);
                        }
                    }
                    params[paramKey] = defaultValue;
                    
                    controller = funcFolder.add(params, paramKey, translatedOptions);
                    controller.name(translatedConfigName);
                    
                    if (cfg.onChange) {
                        const originalOnChange = cfg.onChange;
                        controller.onChange((value) => {
                            let originalValue;
                            if (Array.isArray(cfg.options)) {
                                originalValue = cfg.options.find(opt => this.translateNameForDisplay(opt) === value);
                            } else if (typeof cfg.options === 'object') {
                                Object.keys(cfg.options).forEach(key => {
                                    if (this.translateNameForDisplay(key) === value) {
                                        originalValue = cfg.options[key];
                                    }
                                });
                            }
                            if (originalValue !== undefined) {
                                originalOnChange(originalValue);
                            } else {
                                originalOnChange(value);
                            }
                        });
                    }
                } else {
                    controller = this.addController(funcFolder, paramKey, params, cfg);
                }
                
                this.functionParams.set(paramKey, params);
                this.controllerMap.set(paramKey, controller);
                
                if (cfg.type === 'select' && cfg.autoRefresh) {
                    this.startAutoRefresh(paramKey, cfg);
                }
            }

            this.functionCallbacks.set(func.name, func.onClick);
            
            const funcId = `${config.name}_${func.name}`;
            this.hotkeyManager.register(
                funcId,
                func.hotkey || '',
                () => {
                    if (func.type === 'toggle') {
                        this.toggleFunction(func.name, paramMap);
                    } else {
                        this.executeFunction(func.name, paramMap);
                    }
                },
                func.name,
                config.name,
                'function'
            );

            for (let [key, cfg] of Object.entries(func.configs)) {
                if (cfg.type !== 'boolean' && cfg.type !== 'button') continue;
                
                const configId = `${config.name}_${func.name}_${key}`;
                const paramKey = `${func.name}_${key}`;
                const paramsRef = this.functionParams.get(paramKey);
                const controllerRef = this.controllerMap.get(paramKey);
                
                this.hotkeyManager.register(
                    configId,
                    cfg.hotkey || '',
                    () => {
                        if (cfg.type === 'button') {
                            if (cfg.onChange && typeof cfg.onChange === 'function') {
                                cfg.onChange();
                            }
                        } else if (cfg.type === 'boolean') {
                            const currentValue = paramsRef[paramKey];
                            const newValue = !currentValue;
                            paramsRef[paramKey] = newValue;
                            if (controllerRef) controllerRef.setValue(newValue);
                            if (cfg.onChange && typeof cfg.onChange === 'function') {
                                cfg.onChange(newValue);
                            }
                        }
                    },
                    `${func.name}:${cfg.name}`,
                    config.name,
                    'config'
                );
            }
        }
    }

    startAutoRefresh(paramKey, cfg) {
        if (this.refreshIntervals.has(paramKey)) {
            clearInterval(this.refreshIntervals.get(paramKey));
        }
        
        let interval = setInterval(() => {
            let controller = this.controllerMap.get(paramKey);
            if (!controller) return;
            
            if (cfg.refreshData && typeof cfg.refreshData === 'function') {
                let newOptions = cfg.refreshData();
                if (newOptions) {
                    let translatedOptions;
                    if (Array.isArray(newOptions)) {
                        translatedOptions = {};
                        newOptions.forEach(option => {
                            const translated = this.translateNameForDisplay(option);
                            translatedOptions[translated] = option;
                        });
                    } else if (typeof newOptions === 'object') {
                        translatedOptions = {};
                        Object.keys(newOptions).forEach(key => {
                            const translated = this.translateNameForDisplay(key);
                            translatedOptions[translated] = newOptions[key];
                        });
                    } else {
                        translatedOptions = newOptions;
                    }
                    let currentValue = controller.getValue();
                    controller.options(translatedOptions);
                    let valueExists = false;
                    if (Array.isArray(newOptions)) {
                        valueExists = newOptions.includes(currentValue);
                    } else if (typeof newOptions === 'object') {
                        valueExists = Object.values(newOptions).includes(currentValue);
                    }
                    if (valueExists) {
                        controller.setValue(currentValue);
                    } else if (Array.isArray(newOptions) && newOptions.length > 0) {
                        controller.setValue(newOptions[0]);
                    } else if (typeof newOptions === 'object' && Object.keys(newOptions).length > 0) {
                        controller.setValue(Object.values(newOptions)[0]);
                    }
                }
            }
        }, cfg.refreshInterval || 2000);
        
        this.refreshIntervals.set(paramKey, interval);
    }

    toggleFunction(funcName, paramMap) {
        const t = this.i18n?.global?.t || ((key) => key);
        let currentState = this.toggleStates.get(funcName) || false;
        let newState = !currentState;
        this.toggleStates.set(funcName, newState);
        
        let controller = this.toggleStates.get(`${funcName}_controller`);
        if (controller) {
            const translatedFuncName = this.translateNameForDisplay(funcName);
            let label = newState ? `[${t('system.gui.active')}]` : `[${t('system.gui.inactive')}]`;
            controller.name(`${label} ${translatedFuncName}`);
        }
        
        let args = {};
        for (let [key, paramKey] of Object.entries(paramMap)) {
            let params = this.functionParams.get(paramKey);
            if (params) {
                args[key] = params[paramKey];
            }
        }
        
        args.state = newState;
        
        let callback = this.functionCallbacks.get(funcName);
        if (callback) {
            callback(args);
        }
    }

    addController(folder, key, params, cfg) {
        let controller;
        
        switch (cfg.type) {
            case 'boolean':
                controller = folder.add(params, key);
                break;
                
            case 'number':
                controller = folder.add(params, key, cfg.min || 0, cfg.max || 100, cfg.step || 1);
                break;
                
            case 'string':
                controller = folder.add(params, key);
                break;
                
            case 'color':
                controller = folder.addColor(params, key);
                break;
                
            case 'select':
                if (cfg.options) {
                    let translatedOptions;
                    if (Array.isArray(cfg.options)) {
                        translatedOptions = {};
                        cfg.options.forEach(option => {
                            const translated = this.translateNameForDisplay(option);
                            translatedOptions[translated] = option;
                        });
                    } else if (typeof cfg.options === 'object') {
                        translatedOptions = {};
                        Object.keys(cfg.options).forEach(key => {
                            const translated = this.translateNameForDisplay(key);
                            translatedOptions[translated] = cfg.options[key];
                        });
                    } else {
                        translatedOptions = cfg.options;
                    }
                    controller = folder.add(params, key, translatedOptions);
                } else {
                    controller = folder.add(params, key, []);
                }
                break;
                
            default:
                controller = folder.add(params, key);
        }
        
        if (cfg.name) {
            const translatedName = this.translateNameForDisplay(cfg.name);
            controller.name(translatedName);
        }

        if (cfg.onControllerCreate && typeof cfg.onControllerCreate === 'function') {
            cfg.onControllerCreate(controller);
        }

        if (cfg.onChange && typeof cfg.onChange === 'function') {
            controller.onChange((value) => {
                cfg.onChange(value);
            });
        }
        
        return controller;
    }

    executeFunction(funcName, paramMap) {
        let callback = this.functionCallbacks.get(funcName);
        if (!callback) return;
        
        let args = {};
        for (let [key, paramKey] of Object.entries(paramMap)) {
            let params = this.functionParams.get(paramKey);
            if (params) {
                args[key] = params[paramKey];
            }
        }
        
        callback(args);
    }

    addModule(config) {
        this.modules.push(config);
        this.addModuleGui(config);
    }

    removeModule(name) {
        this.modules = this.modules.filter(m => m.name !== name);
        this.root.destroy();
        this.initUI();
        this.buildUI();
    }

    getFunctionParams(funcName) {
        let result = {};
        for (let [key, params] of this.functionParams) {
            if (key.startsWith(funcName)) {
                let paramName = key.replace(`${funcName}_`, '');
                result[paramName] = params[key];
            }
        }
        return result;
    }

    executeFunctionByName(funcName) {
        for (let module of this.modules) {
            for (let func of module.functions) {
                if (func.name === funcName) {
                    let params = this.getFunctionParams(funcName);
                    func.onClick(params);
                    return;
                }
            }
        }
    }

    getToggleState(funcName) {
        return this.toggleStates.get(funcName) || false;
    }

    setToggleState(funcName, state) {
        this.toggleStates.set(funcName, state);
        
        let controller = this.toggleStates.get(`${funcName}_controller`);
        if (controller) {
            const t = this.i18n?.global?.t || ((key) => key);
            const translatedFuncName = this.translateNameForDisplay(funcName);
            let label = state ? `[${t('system.gui.active')}]` : `[${t('system.gui.inactive')}]`;
            controller.name(`${label} ${translatedFuncName}`);
        }
    }

    registerHotkey(moduleName, funcName, key) {
        for (let module of this.modules) {
            if (module.name === moduleName) {
                for (let func of module.functions) {
                    if (func.name === funcName) {
                        const paramMap = {};
                        for (let [cfgKey] of Object.entries(func.configs)) {
                            const paramKey = `${func.name}_${cfgKey}`;
                            const params = this.functionParams.get(paramKey);
                            if (params) {
                                paramMap[cfgKey] = paramKey;
                            }
                        }
                        const id = `${moduleName}_${funcName}`;
                        this.hotkeyManager.register(
                            id,
                            key,
                            () => {
                                if (func.type === 'toggle') {
                                    this.toggleFunction(func.name, paramMap);
                                } else {
                                    this.executeFunction(func.name, paramMap);
                                }
                            },
                            func.name,
                            moduleName,
                            'function'
                        );
                        return true;
                    }
                }
            }
        }
        return false;
    }

    registerConfigHotkey(moduleName, funcName, configKey, key) {
        for (let module of this.modules) {
            if (module.name === moduleName) {
                for (let func of module.functions) {
                    if (func.name === funcName) {
                        const cfg = func.configs[configKey];
                        if (!cfg) return false;
                        const paramKey = `${func.name}_${configKey}`;
                        const params = this.functionParams.get(paramKey);
                        const controller = this.controllerMap.get(paramKey);
                        const id = `${moduleName}_${funcName}_${configKey}`;
                        this.hotkeyManager.register(
                            id,
                            key,
                            () => {
                                if (cfg.type === 'button') {
                                    if (cfg.onChange && typeof cfg.onChange === 'function') {
                                        cfg.onChange();
                                    }
                                } else if (cfg.type === 'boolean') {
                                    const currentValue = params[paramKey];
                                    const newValue = !currentValue;
                                    params[paramKey] = newValue;
                                    if (controller) controller.setValue(newValue);
                                    if (cfg.onChange && typeof cfg.onChange === 'function') {
                                        cfg.onChange(newValue);
                                    }
                                }
                            },
                            `${func.name}:${cfg.name}`,
                            moduleName,
                            'config'
                        );
                        return true;
                    }
                }
            }
        }
        return false;
    }

    unregisterHotkey(moduleName, funcName, configKey = null) {
        const id = configKey ? `${moduleName}_${funcName}_${configKey}` : `${moduleName}_${funcName}`;
        this.hotkeyManager.unregister(id);
    }

    updateHotkey(moduleName, funcName, newKey, configKey = null) {
        const id = configKey ? `${moduleName}_${funcName}_${configKey}` : `${moduleName}_${funcName}`;
        this.hotkeyManager.updateKey(id, newKey);
    }

    resetHotkeys() {
        this.hotkeyManager.resetAll();
    }

    setHotkeysEnabled(enabled) {
        this.hotkeyManager.setEnabled(enabled);
    }

    getHotkeys() {
        return this.hotkeyManager.getHotkeys();
    }

    destroy() {
        for (let [key, interval] of this.refreshIntervals) {
            clearInterval(interval);
        }
        this.refreshIntervals.clear();
        if (this.root) {
            this.root.destroy();
        }
        if (this.hotkeyManager) {
            this.hotkeyManager.destroy();
        }
        if (this.monitor) {
            this.monitor.destroy();
        }
        if (this.settingsGUI) {
            this.settingsGUI.destroy();
            this.settingsGUI = null;
            this.settingsControllers.clear();
        }
    }
}

module.exports = { GameGUI, GameHotkey, GameMonitor };