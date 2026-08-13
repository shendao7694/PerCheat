module.exports = (_opacity, scale) => `
    .tp-rotv {
        backdrop-filter: blur(20px) saturate(1.4) brightness(1.02);
        -webkit-backdrop-filter: blur(20px) saturate(1.4) brightness(1.02);
        border: 1px solid transparent;
        border-image: linear-gradient(135deg, rgba(80,140,255,0.4), rgba(160,80,255,0.35), rgba(80,200,255,0.25)) 1;
        box-shadow:
            0 8px 32px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            inset 0 -1px 0 rgba(0, 0, 0, 0.15);
        transform: scale(${scale});
        transform-origin: bottom left;
    }
    .tp-rotv {
        max-height: 90vh;
        display: flex;
        flex-direction: column;
    }
`;