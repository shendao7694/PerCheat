module.exports = {
    none: "None",
    body: {
        name: "Body",
        attribute: {
            name: "Attribute Modify",
            configs: {
                SPECTATOR: "Spectator",
                ALLOW_FLIGHT: "Allow Flight",
                ALLOW_MOVE: "Allow Move",
                ALLOW_ACTION_0: "Allow Action 1",
                ALLOW_ACTION_1: "Allow Action 2",
                ALLOW_JUMP: "Allow Jump",
                ALLOW_DOUBLE_JUMP: "Allow Double Jump",
                ALLOW_CROUCH: "Allow Crouch",
                INVISIBLE: "Invisible",
                INVINCIBLE: "Invincible",
                NO_COLLIDE: "No Collision",
                NO_GRAVITY: "No Gravity",
                FLYING: "Flying",
                SWIMMING: "Swimming"
            }
        },
        ghost: {
            name: "Ghost",
            configs: {}
        },
        speedfly: {
            name: "Speed Fly",
            configs: {
                Speed: "Speed",
                HorizontalSpeed: "Horizontal Speed",
                HorizontalLock: "Horizontal Lock",
                VerticalSpeed: "Vertical Speed",
                VerticalLock: "Vertical Lock",
                FlyMode: "Fly Mode",
                Editor: "Editor",
                Normal: "Normal"
            }
        },
        teleport: {
            name: "Teleport",
            configs: {
                Type: "Type",
                coordinates: "Coordinates",
                target: "Target",
                X: "X",
                Y: "Y",
                Z: "Z",
                Target: "Target Player",
                Refresh: "Refresh",
                ClickTPEnabled: "Click TP",
                ClickTPButton: "Click Button",
                "Left Click": "Left Click",
                "Right Click": "Right Click",
                "Middle Click": "Middle Click",
                RequireCrouch: "Require Crouch",
                StepSize: "Step Size",
                MaxDistance: "Max Distance",
                YOffset: "Y Offset"
            }
        }
    },
    fight: {
        name: "Fight",
        autoclicker: {
            name: "Auto Clicker",
            configs: {
                MinCPS: "Min CPS",
                MaxCPS: "Max CPS",
                ActionType: "Action Type",
                LeftClick: "Left Click",
                RightClick: "Right Click",
                ActiveOnHold: "Active On Hold",
                "ReleaseDelay(ms)": "Release Delay(ms)"
            }
        },
        killaura: {
            name: "Kill Aura",
            configs: {
                Range: "Range",
                PullOffsetY: "Pull Offset Y",
                AutoAttack: "Auto Attack",
                Stack: "Stack",
                AttackButton: "Attack Button",
                AttackCooldown: "Attack Cooldown(ms)",
                TargetType: "Target Type",
                All: "All",
                Player: "Player",
                ID: "ID",
                TargetPlayer: "Target Player",
                None: "None",
                CustomID: "Custom ID",
                RefreshPlayers: "Refresh Players",
                LeftClick: "Left Click",
                RightClick: "Right Click"
            }
        },
        voidpuller: {
            name: "Void Puller",
            configs: {
                Cooldown: "Cooldown(ticks)",
                Relative: "Relative",
                Range: "Range",
                "Move X": "Move X",
                "Move Y": "Move Y",
                "Move Z": "Move Z",
                "Velocity X": "Velocity X",
                "Velocity Y": "Velocity Y",
                "Velocity Z": "Velocity Z",
                TargetType: "Target Type",
                All: "All",
                Player: "Player",
                ID: "ID",
                TargetPlayer: "Target Player",
                None: "None",
                CustomID: "Custom ID",
                RefreshPlayers: "Refresh Players"
            }
        }
    },
    render: {
        name: "Render",
        blockesp: {
            name: "Block ESP",
            configs: {
                BlockType: "Block Type",
                ShowBox: "Show Box",
                ShowTracers: "Show Tracers",
                ShowText: "Show Text",
                ShowMarker: "Show Marker",
                BoxColor: "Box Color",
                TracerColor: "Tracer Color",
                TextColor: "Text Color",
                BoxSize: "Box Size",
                LineWidth: "Line Width",
                TracerWidth: "Tracer Width",
                TextSize: "Text Size",
                TracerOpacity: "Tracer Opacity",
                "TracerStartY(%)": "Tracer Start Y(%)"
            }
        },
        camera: {
            name: "Camera Control",
            configs: {
                FovY: "Fov Y",
                Mode: "Mode",
                Follow: "Follow",
                Fixed: "Fixed",
                Fps: "Fps",
                Relative: "Relative",
                CameraTarget: "Camera Target",
                Self: "Self",
                Refresh: "Refresh"
            }
        },
        entitydisabler: {
            name: "Entity Disabler",
            configs: {}
        },
        entityesp: {
            name: "Entity ESP",
            configs: {
                Entity: "Entity",
                Player: "Player",
                "Show Self": "Show Self",
                PlayerColor: "Player Color",
                EntityColor: "Entity Color",
                SelfColor: "Self Color",
                TracerColor: "Tracer Color",
                TextColor: "Text Color",
                BoxLineWidth: "Box Line Width",
                TracerWidth: "Tracer Width",
                TextSize: "Text Size",
                ShowTracers: "Show Tracers",
                TracerOpacity: "Tracer Opacity",
                "TracerStartY(%)": "Tracer Start Y(%)",
                ShowText: "Show Text",
                ShowID: "Show ID",
                ShowPosition: "Show Position",
                ShowVelocity: "Show Velocity"
            }
        },
        freezem: {
            name: "Freecam",
            configs: {
                LockedSelf: "Lock Self"
            }
        }
    },
    utility: {
        name: "Utility",
        lockself: {
            name: "LockSelf",
            configs: {}
        }
    },
    system: {
        gui: {
            active: "Active",
            inactive: "Inactive",
            title: "Function",
            monitor: {
                title: "Monitor",
                fps: "FPS",
                tps: "TPS",
                ping: "Ping",
                position: "Position",
                copy: "Copy"
            },
            hotkey: {
                title: "Hotkeys",
                enable: "Enable Hotkeys",
                toggleUI: "Toggle UI",
                reset: "Reset All Hotkeys",
                enableHotkeys: "Enable Hotkeys",
                config: "Config of {name}"
            },
            settings: {
                title: "Settings",
                language: "Language",
                reset: "Reset All Settings"
            }
        },
        notice: {
            title: "PerCheatNext",
            msg: "PerCheatNext loading done."
        }
    }
}