/**
 * @typedef {Object} Vector3
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef {Object} Quaternion
 * @property {number} w
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef {Object} SkinData
 * @property {string} hips
 * @property {string} torso
 * @property {string} neck
 * @property {string} head
 * @property {string} leftShoulder
 * @property {string} leftUpperArm
 * @property {string} leftLowerArm
 * @property {string} leftHand
 * @property {string} rightShoulder
 * @property {string} rightUpperArm
 * @property {string} rightLowerArm
 * @property {string} rightHand
 * @property {string} leftUpperLeg
 * @property {string} leftLowerLeg
 * @property {string} leftFoot
 * @property {string} rightUpperLeg
 * @property {string} rightLowerLeg
 * @property {string} rightFoot
 */

/**
 * @readonly
 * @enum {number}
 */
const BodyFlags = {
    /** 客户端对该刚体有位置权威 */
    LOCKED: 1,
    /** 参与碰撞检测 */
    COLLIDES: 2,
    /** 受重力影响 */
    GRAVITY: 4,
    /** 是玩家刚体 */
    PLAYER: 8,
    /** 固定不动 (地面/墙壁) */
    FIXED: 16,
    /** 远程玩家 (由其他客户端控制) */
    REMOTE: 32,
    /** 由动画驱动 (非物理模拟) */
    ANIMATED: 64,
    /** 无碰撞 (穿墙) */
    NO_COLLIDE: 128,
    /** 无重力 (漂浮) */
    NO_GRAVITY: 256,
    /** 无敌 (不受伤) */
    INVINCIBLE: 512,
    /** 半透明幽灵 */
    GHOST: 1024
};

/**
 * @readonly
 * @enum {number}
 */
const PlayerFlags = {
    /** 观战模式 */
    SPECTATOR: 1,
    /** 允许飞行 */
    ALLOW_FLIGHT: 2,
    /** 允许移动 */
    ALLOW_MOVE: 4,
    /** 允许左键动作 (ACTION_0) */
    ALLOW_ACTION_0: 8,
    /** 允许右键动作 (ACTION_1) */
    ALLOW_ACTION_1: 16,
    /** 允许跳跃 */
    ALLOW_JUMP: 32,
    /** 允许二段跳 */
    ALLOW_DOUBLE_JUMP: 64,
    /** 允许蹲下 */
    ALLOW_CROUCH: 128,
    /** 隐身 (不显示) */
    INVISIBLE: 256,
    /** 无敌 (不受伤) */
    INVINCIBLE: 512,
    /** 无碰撞 (穿墙) */
    NO_COLLIDE: 1024,
    /** 无重力 */
    NO_GRAVITY: 2048,
    /** 飞行模式 (实际飞行) */
    FLYING: 4096,
    /** 游泳模式 */
    SWIMMING: 8192
};

class GameVector3 {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(x, y, z) {
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        /** @type {number} */
        this.z = z;
    }
}

class GameQuaternion {
    /**
     * @param {number} w
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    constructor(w, x, y, z) {
        /** @type {number} */
        this.w = w;
        /** @type {number} */
        this.x = x;
        /** @type {number} */
        this.y = y;
        /** @type {number} */
        this.z = z;
    }
}

class GameBody {
    constructor() {
        /** @type {number} */
        this.id = 0;
        /** @type {BodyFlags} */
        this.flags = 0;
        /** @type {number} */
        this.group = 0;
        /** @type {number} */
        this.mass = 0;
        /** @type {number} */
        this.friction = 0;
        /** @type {number} */
        this.restitution = 0;
        /** @type {number} */
        this.rx = 0;
        /** @type {number} */
        this.ry = 0;
        /** @type {number} */
        this.rz = 0;
        /** @type {number} */
        this.px = 0;
        /** @type {number} */
        this.py = 0;
        /** @type {number} */
        this.pz = 0;
        /** @type {number} */
        this.vx = 0;
        /** @type {number} */
        this.vy = 0;
        /** @type {number} */
        this.vz = 0;
        /** @type {number} */
        this.qx = 0;
        /** @type {number} */
        this.qy = 0;
        /** @type {number} */
        this.qz = 0;
        /** @type {number} */
        this.qw = 1;
        /** @type {number} */
        this.hsx = 0;
        /** @type {number} */
        this.hsy = 0;
        /** @type {number} */
        this.hsz = 0;
        /** @type {number} */
        this.ax = 0;
        /** @type {number} */
        this.ay = 0;
        /** @type {number} */
        this.az = 0;
    }

    /**
     * @returns {[number, number, number]}
     */
    getPosition() {
        return [this.px, this.py, this.pz];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setPosition(x, y, z) {
        this.px = x;
        this.py = y;
        this.pz = z;
    }

    /**
     * @returns {[number, number, number]}
     */
    getVelocity() {
        return [this.vx, this.vy, this.vz];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setVelocity(x, y, z) {
        this.vx = x;
        this.vy = y;
        this.vz = z;
    }

    /**
     * @returns {[number, number, number]}
     */
    getBounds() {
        return [this.rx, this.ry, this.rz];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setBounds(x, y, z) {
        this.rx = x;
        this.ry = y;
        this.rz = z;
    }

    /**
     * @returns {[number, number, number, number]}
     */
    getQuaternion() {
        return [this.qx, this.qy, this.qz, this.qw];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} w
     */
    setQuaternion(x, y, z, w) {
        this.qx = x;
        this.qy = y;
        this.qz = z;
        this.qw = w;
    }

    /**
     * @returns {[number, number, number]}
     */
    getAngularVelocity() {
        return [this.ax, this.ay, this.az];
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setAngularVelocity(x, y, z) {
        this.ax = x;
        this.ay = y;
        this.az = z;
    }

    /**
     * @param {BodyFlags} flag
     * @returns {boolean}
     */
    hasFlag(flag) {
        return !!(this.flags & flag);
    }

    /**
     * @param {BodyFlags} flag
     */
    addFlag(flag) {
        this.flags |= flag;
    }

    /**
     * @param {BodyFlags} flag
     */
    removeFlag(flag) {
        this.flags &= ~flag;
    }

    /**
     * @param {BodyFlags} flag
     */
    toggleFlag(flag) {
        this.flags ^= flag;
    }
}

class GamePlayer {
    constructor() {
        /** @type {number} */
        this.id = 0;
        /** @type {string} */
        this.name = '';
        /** @type {string} */
        this.userId = '';
        /** @type {PlayerFlags} */
        this.flags = 0;
        /** @type {number} */
        this.scale = 1;
        /** @type {[number, number, number]} */
        this.color = [1, 1, 1];
        /** @type {number} */
        this.metalness = 0;
        /** @type {number} */
        this.emissive = 0;
        /** @type {number} */
        this.shininess = 0;
        /** @type {boolean} */
        this.invisible = false;
        /** @type {boolean} */
        this.showName = true;
        /** @type {boolean} */
        this.showIndicator = false;
        /** @type {boolean} */
        this.dead = false;
        /** @type {SkinData} */
        this.avatarSkin = {
            hips: '',
            torso: '',
            neck: '',
            head: '',
            leftShoulder: '',
            leftUpperArm: '',
            leftLowerArm: '',
            leftHand: '',
            rightShoulder: '',
            rightUpperArm: '',
            rightLowerArm: '',
            rightHand: '',
            leftUpperLeg: '',
            leftLowerLeg: '',
            leftFoot: '',
            rightUpperLeg: '',
            rightLowerLeg: '',
            rightFoot: ''
        };
        /** @type {Object.<string, boolean>} */
        this.skinInvisible = {
            hips: false,
            torso: false,
            neck: false,
            head: false,
            leftShoulder: false,
            leftUpperArm: false,
            leftLowerArm: false,
            leftHand: false,
            rightShoulder: false,
            rightUpperArm: false,
            rightLowerArm: false,
            rightHand: false,
            leftUpperLeg: false,
            leftLowerLeg: false,
            leftFoot: false,
            rightUpperLeg: false,
            rightLowerLeg: false,
            rightFoot: false
        };
    }

    /**
     * @param {PlayerFlags} flag
     * @returns {boolean}
     */
    hasFlag(flag) {
        return !!(this.flags & flag);
    }

    /**
     * @param {PlayerFlags} flag
     */
    addFlag(flag) {
        this.flags |= flag;
    }

    /**
     * @param {PlayerFlags} flag
     */
    removeFlag(flag) {
        this.flags &= ~flag;
    }

    /**
     * @param {PlayerFlags} flag
     */
    toggleFlag(flag) {
        this.flags ^= flag;
    }
}

class GameCamera {
    constructor() {
        /** @type {[number, number, number]} */
        this.eye = [0, 0, 0];
        /** @type {[number, number, number]} */
        this.targetLook = [0, 0, 1];
        /** @type {[number, number, number, number]} */
        this.rotation = [0, 0, 0, 1];
        /** @type {number} */
        this.fovY = 0.785;
        /** @type {[number, number]} */
        this.viewport = [1920, 1080];
        /** @type {number} */
        this.zNear = 0.25;
        /** @type {number} */
        this.zFar = 512;
        /** @type {number} */
        this.fpsID = 0;
        /** @type {boolean} */
        this.freezeFovY = false;
        /** @type {number} */
        this.currentExposure = 0.01;
        /** @type {number} */
        this.targetExposure = 0.01;
        /** @type {boolean} */
        this.underwater = false;
    }
}

class GameReplicaCamera {
    constructor() {
        /** @type {number} */
        this.mode = 2;
        /** @type {number} */
        this.targetId = 0;
        /** @type {[number, number, number]} */
        this.eye = [0, 0, 0];
        /** @type {[number, number, number]} */
        this.target = [0, 0, 1];
        /** @type {[number, number, number]} */
        this.up = [0, 1, 0];
        /** @type {number} */
        this.fovY = 0.785;
        /** @type {number} */
        this.distance = 8.5;
        /** @type {number} */
        this.freezedAxis = 0;
    }
}

class GameSecret {
    constructor() {
        /** @type {number} */
        this.id = 0;
        /** @type {string} */
        this.userId = '';
        /** @type {string} */
        this.userName = '';
        /** @type {string} */
        this.userAvatar = '';
        /** @type {boolean} */
        this.netPaused = false;
        /** @type {SkinData} */
        this.avatarSkin = {
            hips: '',
            torso: '',
            neck: '',
            head: '',
            leftShoulder: '',
            leftUpperArm: '',
            leftLowerArm: '',
            leftHand: '',
            rightShoulder: '',
            rightUpperArm: '',
            rightLowerArm: '',
            rightHand: '',
            leftUpperLeg: '',
            leftLowerLeg: '',
            leftFoot: '',
            rightUpperLeg: '',
            rightLowerLeg: '',
            rightFoot: ''
        };
        /** @type {{ camera: GameReplicaCamera }} */
        this.replica = {
            camera: new GameReplicaCamera()
        };
    }
}

class GameBlockIndex {
    constructor() {
        /** @type {Object.<string, number>} */
        this.id = {};
    }
}

class GameVoxel {
    constructor() {
        /** @type {[number, number, number]} */
        this.shape = [128, 128, 128];
        /** @type {Uint16Array} */
        this.data = null;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {number}
     */
    getVoxel(x, y, z) {
        return 0;
    }

    /**
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @param {number} value
     */
    setVoxel(x, y, z, value) {
        return;
    }
}

class GameUI3D {
    constructor() {
        /** @type {Array<Object>} */
        this.elements = [];
        /** @type {number} */
        this.idCounter = 0;
        /** @type {Array<Object>} */
        this.prevEventStack = [];
    }
}

class GameOverlays {
    constructor() {
        /** @type {CanvasRenderingContext2D} */
        this.context = null;
        /** @type {Array<Object>} */
        this.overlays = [];
    }
}

class GameState {
    constructor() {
        /** @type {GameSecret} */
        this.secret = new GameSecret();
        /** @type {Array<GameBody>} */
        this.bodies = [];
        /** @type {Array<GamePlayer>} */
        this.players = [];
        /** @type {Array<Object>} */
        this.playerInputs = [];
        /** @type {GameCamera} */
        this.camera = new GameCamera();
        /** @type {GameVoxel} */
        this.voxel = new GameVoxel();
        /** @type {GameBlockIndex} */
        this.blockIndex = new GameBlockIndex();
        /** @type {GameUI3D} */
        this.ui3D = new GameUI3D();
        /** @type {GameOverlays} */
        this.overlays = new GameOverlays();
        /** @type {Array<Object>} */
        this.renderBoxes = [];
        /** @type {boolean} */
        this.ready = false;
        /** @type {boolean} */
        this.loadFinished = false;
        /** @type {boolean} */
        this.idle = false;
        /** @type {number} */
        this.frameCount = 0;
        /** @type {{ tick: number, clock: number, deltaTick: number, deltaClock: number, ping: number }} */
        this.clock = {
            tick: 0,
            clock: 0,
            deltaTick: 0,
            deltaClock: 0,
            ping: 0
        };
    }

    /**
     * @returns {GamePlayer|undefined}
     */
    getPlayer() {
        return this.players.find(p => p.id === this.secret.id);
    }

    /**
     * @returns {GameBody|undefined}
     */
    getBody() {
        return this.bodies.find(b => b.id === this.secret.id);
    }

    /**
     * @param {number} id
     * @returns {GamePlayer|undefined}
     */
    getPlayerById(id) {
        return this.players.find(p => p.id === id);
    }

    /**
     * @param {number} id
     * @returns {GameBody|undefined}
     */
    getBodyById(id) {
        return this.bodies.find(b => b.id === id);
    }
}

class GameOnReady {
    constructor() {
        /**
         * @type {Array<Function>}
         */
        this.handlers = [];
    }
}

class GameGame {
    constructor() {
        /** @type {GameState} */
        this.state = new GameState();
        this.onReady = new GameOnReady();
    }
}

class GameCore {
    constructor() {
        /** @type {GameGame} */
        this.game = new GameGame();
    }
}

const Api = {
    GameCore,
    GameGame,
    GameState,
    GameSecret,
    GameBody,
    GamePlayer,
    GameCamera,
    GameReplicaCamera,
    GameVoxel,
    GameBlockIndex,
    GameUI3D,
    GameOverlays,
    GameVector3,
    GameQuaternion,
    BodyFlags,
    PlayerFlags
};

unsafeWindow._api = Api;
module.exports = Api;