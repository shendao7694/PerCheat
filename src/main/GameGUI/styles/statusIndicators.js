module.exports = `
    .tp-btnv_b.dape-status-enabled::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #4cff7c;
        box-shadow: 0 0 6px #4cff7c, 0 0 12px rgba(76,255,124,0.3);
        margin-right: 5px;
        vertical-align: middle;
        animation: dape-status-pulse-green 2s ease-in-out infinite;
    }
    .tp-btnv_b.dape-status-disabled::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        margin-right: 5px;
        vertical-align: middle;
    }
    .tp-btnv_b.dape-status-locked::before {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #ff4c4c;
        box-shadow: 0 0 6px #ff4c4c, 0 0 12px rgba(255,76,76,0.3);
        margin-right: 5px;
        vertical-align: middle;
        animation: dape-status-pulse-red 1.5s ease-in-out infinite;
    }
`;