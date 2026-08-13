module.exports = (opacity) => `
    .tp-rotv {
        --tp-base-background-color: rgba(8, 8, 14, ${opacity});
        --tp-base-border-radius: 4px;
        --tp-base-font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
        --tp-base-shadow-color: rgba(0, 0, 0, 0.5);
        --tp-blade-border-radius: 2px;
        --tp-blade-horizontal-padding: 6px;
        --tp-blade-value-width: 160px;
        --tp-button-background-color: rgba(80, 140, 255, 0.18);
        --tp-button-background-color-active: rgba(80, 140, 255, 0.42);
        --tp-button-background-color-focus: rgba(80, 140, 255, 0.32);
        --tp-button-background-color-hover: rgba(80, 140, 255, 0.28);
        --tp-button-foreground-color: #b8d4ff;
        --tp-container-background-color: rgba(255, 255, 255, 0.05);
        --tp-container-background-color-active: rgba(255, 255, 255, 0.12);
        --tp-container-background-color-focus: rgba(80, 140, 255, 0.18);
        --tp-container-background-color-hover: rgba(255, 255, 255, 0.08);
        --tp-container-foreground-color: #d0d4e4;
        --tp-container-horizontal-padding: 4px;
        --tp-container-vertical-padding: 4px;
        --tp-groove-foreground-color: rgba(255, 255, 255, 0.08);
        --tp-input-background-color: rgba(255, 255, 255, 0.05);
        --tp-input-background-color-active: rgba(255, 255, 255, 0.12);
        --tp-input-background-color-focus: rgba(80, 140, 255, 0.22);
        --tp-input-background-color-hover: rgba(255, 255, 255, 0.08);
        --tp-input-foreground-color: #eef0f6;
        --tp-label-foreground-color: #9ca0bc;
        --tp-monitor-background-color: rgba(0, 0, 0, 0.25);
        --tp-monitor-foreground-color: rgba(140, 180, 255, 0.9);
    }
`;