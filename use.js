cheat.front.flagmanager.modifyFlag(cheat.front.body.getSelf().id,"player",[
    /* flag */
])

cheat.front.flagmanager.modifyFlag(cheat.front.body.getSelf().id,"player",[
    _api.PlayerFlags.ALLOW_ACTION_0,_api.PlayerFlags.ALLOW_ACTION_0,_api.PlayerFlags.ALLOW_CROUCH,_api.PlayerFlags.ALLOW_DOUBLE_JUMP,_api.PlayerFlags.ALLOW_JUMP,_api.PlayerFlags.ALLOW_MOVE,_api.PlayerFlags.ALLOW_FLIGHT,
])

cheat.front.flagmanager.modifyFlag(cheat.front.body.getSelf().id,"player",[
    _api.PlayerFlags.ALLOW_ACTION_0,_api.PlayerFlags.ALLOW_ACTION_0,_api.PlayerFlags.ALLOW_CROUCH,_api.PlayerFlags.ALLOW_DOUBLE_JUMP,_api.PlayerFlags.ALLOW_JUMP,_api.PlayerFlags.ALLOW_MOVE,_api.PlayerFlags.SPECTATOR,
])

cheat.hooks.messageTool.messageTool.events.handlers.setUIConfig[0]({
  menu: false,
  lowFrameRate: true,
  showStore: false,
  settings: false
}) //settingsUI