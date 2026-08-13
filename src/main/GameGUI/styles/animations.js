module.exports = `
    @keyframes dape-glow {
        0%, 100% {
            text-shadow: 0 0 3px rgba(80,140,255,0.2), 0 0 8px rgba(80,140,255,0.08);
        }
        50% {
            text-shadow: 0 0 6px rgba(80,140,255,0.45), 0 0 16px rgba(160,80,255,0.2), 0 0 24px rgba(80,140,255,0.08);
        }
    }
    @keyframes dape-border-pulse {
        0%, 100% {
            border-image: linear-gradient(135deg, rgba(80,140,255,0.4), rgba(160,80,255,0.35), rgba(80,200,255,0.25)) 1;
        }
        50% {
            border-image: linear-gradient(135deg, rgba(100,160,255,0.55), rgba(180,100,255,0.45), rgba(100,220,255,0.35)) 1;
        }
    }
    @keyframes dape-status-pulse-green {
        0%, 100% { box-shadow: 0 0 4px #4cff7c, 0 0 8px rgba(76,255,124,0.2); }
        50% { box-shadow: 0 0 8px #4cff7c, 0 0 16px rgba(76,255,124,0.4); }
    }
    @keyframes dape-status-pulse-red {
        0%, 100% { box-shadow: 0 0 4px #ff4c4c, 0 0 8px rgba(255,76,76,0.2); }
        50% { box-shadow: 0 0 8px #ff4c4c, 0 0 16px rgba(255,76,76,0.4); }
    }
    .tp-rotv {
        animation: dape-border-pulse 4s ease-in-out infinite;
    }
    .tp-rotv_b {
        font-weight: 600;
        letter-spacing: 0.4px;
        animation: dape-glow 3s ease-in-out infinite;
        background: linear-gradient(135deg, rgba(80,140,255,0.08), rgba(160,80,255,0.04));
        border-radius: 4px 4px 0 0;
    }
    .tp-rotv_b:hover {
        background: linear-gradient(135deg, rgba(80,140,255,0.14), rgba(160,80,255,0.08));
    }
    .tp-rotv_b {
        overflow-y: auto;
        flex: 1;
        min-height: 0;
        scrollbar-width: thin;
        scrollbar-color: rgba(255,255,255,0.15) transparent;
    }
`;