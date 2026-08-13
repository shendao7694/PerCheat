module.exports = {
    none: "空",
    body: {
        name: "自身",
        attribute: {
            name: "属性修改",
            configs: {
                SPECTATOR: "观战模式",
                ALLOW_FLIGHT: "允许飞行",
                ALLOW_MOVE: "允许移动",
                ALLOW_ACTION_0: "允许动作1",
                ALLOW_ACTION_1: "允许动作2",
                ALLOW_JUMP: "允许跳跃",
                ALLOW_DOUBLE_JUMP: "允许二段跳",
                ALLOW_CROUCH: "允许蹲伏",
                INVISIBLE: "隐身",
                INVINCIBLE: "无敌",
                NO_COLLIDE: "无碰撞",
                NO_GRAVITY: "无重力",
                FLYING: "飞行中",
                SWIMMING: "游泳中"
            }
        },
        ghost: {
            name: "幽灵模式",
            configs: {}
        },
        speedfly: {
            name: "向量飞行",
            configs: {
                Speed: "速度",
                HorizontalSpeed: "水平速度",
                HorizontalLock: "水平锁定",
                VerticalSpeed: "垂直速度",
                VerticalLock: "垂直锁定",
                FlyMode: "飞行模式",
                Editor: "编辑器模式",
                Normal: "普通模式"
            }
        },
        teleport: {
            name: "实体传送",
            configs: {
                Type: "类型",
                coordinates: "坐标",
                target: "目标",
                X: "X坐标",
                Y: "Y坐标",
                Z: "Z坐标",
                Target: "目标玩家",
                Refresh: "刷新",
                ClickTPEnabled: "点击传送",
                ClickTPButton: "点击按钮",
                "Left Click": "左键",
                "Right Click": "右键",
                "Middle Click": "中键",
                RequireCrouch: "需要蹲伏",
                StepSize: "步长",
                MaxDistance: "最大距离",
                YOffset: "Y轴偏移"
            }
        }
    },
    fight: {
        name: "战斗",
        autoclicker: {
            name: "自动连点",
            configs: {
                MinCPS: "最小 CPS",
                MaxCPS: "最大 CPS",
                ActionType: "点击类型",
                LeftClick: "左键",
                RightClick: "右键",
                ActiveOnHold: "按住时激活",
                "ReleaseDelay(ms)": "释放延迟(毫秒)"
            }
        },
        killaura: {
            name: "杀戮光环",
            configs: {
                Range: "范围",
                PullOffsetY: "拉扯偏移 Y",
                AutoAttack: "自动攻击",
                Stack: "堆叠次数",
                AttackButton: "攻击按钮",
                AttackCooldown: "攻击冷却(毫秒)",
                TargetType: "目标类型",
                All: "全部",
                Player: "玩家",
                ID: "指定ID",
                TargetPlayer: "目标玩家",
                None: "无",
                CustomID: "自定义ID",
                RefreshPlayers: "刷新玩家",
                LeftClick: "左键",
                RightClick: "右键"
            }
        },
        voidpuller: {
            name: "虚空钩锁",
            configs: {
                Cooldown: "冷却(ticks)",
                Relative: "相对位置",
                Range: "范围",
                "Move X": "移动 X",
                "Move Y": "移动 Y",
                "Move Z": "移动 Z",
                "Velocity X": "速度 X",
                "Velocity Y": "速度 Y",
                "Velocity Z": "速度 Z",
                TargetType: "目标类型",
                All: "全部",
                Player: "玩家",
                ID: "指定ID",
                TargetPlayer: "目标玩家",
                None: "无",
                CustomID: "自定义ID",
                RefreshPlayers: "刷新玩家"
            }
        }
    },
    render: {
        name: "渲染",
        blockesp: {
            name: "方块追踪",
            configs: {
                BlockType: "方块类型",
                ShowBox: "显示边框",
                ShowTracers: "显示射线",
                ShowText: "显示文本",
                ShowMarker: "显示标记",
                BoxColor: "边框颜色",
                TracerColor: "射线颜色",
                TextColor: "文本颜色",
                BoxSize: "边框大小",
                LineWidth: "线宽",
                TracerWidth: "射线宽度",
                TextSize: "文本大小",
                TracerOpacity: "射线透明度",
                "TracerStartY(%)": "射线起始高度(百分比)"
            }
        },
        camera: {
            name: "相机修改",
            configs: {
                FovY: "垂直视野",
                Mode: "模式",
                Follow: "跟随",
                Fixed: "固定",
                Fps: "第一人称",
                Relative: "相对",
                CameraTarget: "相机目标",
                Self: "自己",
                Refresh: "刷新"
            }
        },
        entitydisabler: {
            name: "禁用实体",
            configs: {}
        },
        entityesp: {
            name: "实体追踪",
            configs: {
                Entity: "实体",
                Player: "玩家",
                "Show Self": "显示自己",
                PlayerColor: "玩家颜色",
                EntityColor: "实体颜色",
                SelfColor: "自己颜色",
                TracerColor: "射线颜色",
                TextColor: "文本颜色",
                BoxLineWidth: "边框线宽",
                TracerWidth: "射线宽度",
                TextSize: "文本大小",
                ShowTracers: "显示射线",
                TracerOpacity: "射线透明度",
                "TracerStartY(%)": "射线起始高度(百分比)",
                ShowText: "显示文本",
                ShowID: "显示ID",
                ShowPosition: "显示位置",
                ShowVelocity: "显示速度"
            }
        },
        freezem: {
            name: "自由视角",
            configs: {
                LockedSelf: "锁定自身"
            }
        }
    },
    utility: {
        name: "实用",
        lockself: {
            name: "锁定自身",
            configs: {}
        }
    },
    system: {
        gui: {
            active: "激活",
            inactive: "未激活",
            title: "功能",
            monitor: {
                title: "监控",
                fps: "帧率",
                tps: "刻率",
                ping: "延迟",
                position: "位置",
                copy: "复制"
            },
            hotkey: {
                title: "快捷键",
                enable: "启用快捷键",
                toggleUI: "切换界面",
                reset: "重置所有快捷键",
                enableHotkeys: "启用快捷键",
                config: "{name}的配置"
            },
            settings: {
                title: "设置",
                language: "语言",
                reset: "重置所有设置"
            }
        },
        notice: {
            title: "PerCheatNext",
            msg: "PerCheatNext 加载完毕"
        }
    }
}