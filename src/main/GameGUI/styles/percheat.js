const customStyle = `
.lil-gui {
  --background-color: #0a1628 !important;
  --text-color: #b0d0f0 !important;
  --title-background-color: #0c1f3c !important;
  --title-text-color: #80ccff !important;
  --widget-color: #0c1f3c !important;
  --hover-color: #16345a !important;
  --focus-color: #1e5a8a !important;
  --number-color: #60ccff !important;
  --string-color: #80ddff !important;
  --widget-border-radius: 4px !important;
}

.lil-gui.lil-root {
  border-radius: 8px !important;
  overflow: hidden !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), inset 0 0 80px rgba(60, 160, 255, 0.02) !important;
  border: 1px solid rgba(60, 160, 255, 0.06) !important;
}

.lil-gui .lil-root > .lil-title {
  background: linear-gradient(180deg, #0c1f3c, #0a1628) !important;
  color: #80ccff !important;
  border-radius: 8px 8px 0 0 !important;
  text-shadow: 0 0 30px rgba(60, 160, 255, 0.15) !important;
  border-bottom: 1px solid rgba(60, 160, 255, 0.06) !important;
}

.lil-gui .lil-root > .lil-children {
  background: #0a1628 !important;
}

.lil-gui .lil-controller {
  border-radius: 4px !important;
  margin: 4px 0 !important;
}

.lil-gui .lil-controller .lil-widget {
  border-radius: 4px !important;
}

.lil-gui .lil-controller.lil-number .lil-fill {
  border-right-color: #60ccff !important;
}

.lil-gui input[type="text"],
.lil-gui input[type="number"] {
  background: #0c1f3c !important;
  color: #b0d0f0 !important;
  border-radius: 4px !important;
  border: 1px solid rgba(60, 160, 255, 0.08) !important;
  transition: all 0.15s ease !important;
}

.lil-gui input[type="text"]:focus,
.lil-gui input[type="number"]:focus {
  background: #102a4a !important;
  border-color: rgba(60, 160, 255, 0.2) !important;
  box-shadow: 0 0 20px rgba(60, 160, 255, 0.04) !important;
}

.lil-gui input[type="text"]::-webkit-input-placeholder,
.lil-gui input[type="number"]::-webkit-input-placeholder {
  color: #3a6a8a !important;
}

.lil-gui .lil-slider {
  background: #0c1f3c !important;
  border-radius: 4px !important;
  background-image: linear-gradient(90deg, #0c1f3c, #102a4a) !important;
}

.lil-gui .lil-slider:hover {
  background: #102a4a !important;
  background-image: linear-gradient(90deg, #102a4a, #16345a) !important;
}

.lil-gui .lil-slider.lil-active {
  background: #16345a !important;
  background-image: linear-gradient(90deg, #16345a, #1e5a8a) !important;
}

.lil-gui .lil-slider .lil-fill {
  background: linear-gradient(90deg, #40aaff, #60ccff) !important;
  box-shadow: 0 0 20px rgba(60, 160, 255, 0.15) !important;
}

.lil-gui .lil-controller.lil-option .lil-display {
  background: #0c1f3c !important;
  border-radius: 4px !important;
  border: 1px solid rgba(60, 160, 255, 0.06) !important;
}

.lil-gui .lil-controller.lil-option .lil-display:hover {
  border-color: rgba(60, 160, 255, 0.12) !important;
}

.lil-gui .lil-controller.lil-option .lil-display:after {
  color: #60ccff !important;
}

.lil-gui .lil-controller button {
  background: linear-gradient(180deg, #1a4a7a, #0f3060) !important;
  color: #ffffff !important;
  border-radius: 4px !important;
  border: 1px solid rgba(60, 160, 255, 0.06) !important;
  transition: all 0.15s ease !important;
}

.lil-gui .lil-controller button:hover {
  background: linear-gradient(180deg, #225a8a, #1a4a7a) !important;
  border-color: rgba(60, 160, 255, 0.12) !important;
  box-shadow: 0 0 30px rgba(60, 160, 255, 0.04) !important;
}

.lil-gui .lil-controller button:active {
  background: linear-gradient(180deg, #0a2040, #0f3060) !important;
}

.lil-gui input[type="checkbox"] {
  background: #0c1f3c !important;
  border: 1px solid rgba(60, 160, 255, 0.12) !important;
  border-radius: 3px !important;
  transition: all 0.15s ease !important;
}

.lil-gui input[type="checkbox"]:checked {
  background: linear-gradient(180deg, #1a5a9a, #104a8a) !important;
  border-color: rgba(60, 160, 255, 0.2) !important;
}

.lil-gui input[type="checkbox"]:checked:before {
  color: #60ccff !important;
}

.lil-gui select {
  background: #0c1f3c !important;
  color: #b0d0f0 !important;
  border-radius: 4px !important;
  border: 1px solid rgba(60, 160, 255, 0.06) !important;
  transition: all 0.15s ease !important;
}

.lil-gui select:hover {
  border-color: rgba(60, 160, 255, 0.12) !important;
}

.lil-gui .lil-controller.lil-disabled {
  opacity: 0.35 !important;
}

.lil-gui .lil-title:before {
  color: #60ccff !important;
}

.lil-gui .lil-root > .lil-children::-webkit-scrollbar {
  background: #0a1628 !important;
  width: 3px !important;
}

.lil-gui .lil-root > .lil-children::-webkit-scrollbar-thumb {
  background: #1a4a7a !important;
  border-radius: 3px !important;
}

.lil-gui .lil-root > .lil-children::-webkit-scrollbar-thumb:hover {
  background: #2a6aaa !important;
}

.lil-gui .lil-gui .lil-gui > .lil-children {
  border-left: 1px solid rgba(60, 160, 255, 0.04) !important;
  margin-left: 12px !important;
  padding-left: 12px !important;
}

.lil-gui .lil-gui {
  margin: 0 !important;
}

.lil-gui .lil-gui .lil-gui {
  margin-left: 12px !important;
}

.lil-gui .lil-gui .lil-gui .lil-title {
  border-radius: 4px 4px 0 0 !important;
  background: #0c1f3c !important;
  color: #80ccff !important;
}

.lil-gui .lil-controller.lil-color .lil-display {
  border-radius: 4px !important;
}

.lil-gui .lil-controller.lil-color input[type="color"] {
  border-radius: 4px !important;
}

.lil-gui + .lil-controller {
  border-top-color: rgba(60, 160, 255, 0.04) !important;
}

.lil-gui .lil-children:empty:before {
  color: #3a6a8a !important;
}

.lil-gui .lil-controller .lil-name {
  color: #90bce0 !important;
}
`;

module.exports = { customStyle };