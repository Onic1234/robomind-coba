const fs = require("fs");
let html = fs.readFileSync("robo-delivery/index.html", "utf-8");

global.window = global;
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.innerWidth = 800;
global.innerHeight = 600;
global.document = {
  getElementById: (id) => ({
    getContext: () => ({
      save: () => {}, restore: () => {}, fillRect: () => {}, drawImage: () => {},
      beginPath: () => {}, arc: () => {}, fill: () => {}, stroke: () => {},
      moveTo: () => {}, lineTo: () => {}, setLineDash: () => {}, createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }), font: '', textAlign: '', textBaseline: '', fillText: () => {},
      classList: { add: () => {}, remove: () => {} }, style: {}, roundRect: () => {}
    }),
    width: 800, height: 600, addEventListener: () => {}, classList: { add: () => {}, remove: () => {} }, style: {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
    innerText: ''
  }),
  querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {}
};
global.Image = class { constructor() { this.width = 1024; this.height = 1024; } };
global.requestAnimationFrame = (fn) => {};

// Insert global state declarations at start of script
const globals = `
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let scaleFactor = 1.0;
    let hoveredNodeId = null;
    let isGameRunning = false;
    let timerInterval = null;
    let currentLevelIndex = 0;
    let currentLevelData = null;

    const robotState = {
      currentNodeId: 0,
      prevNodeId: 0,
      targetNodeId: null,
      isMoving: false,
      moveProgress: 0,
      carryingFood: null,
      bumpAnim: 0,
      x: 0,
      y: 0,
      z: 0
    };
`;

html = html.replace('<script>', '<script>\n' + globals);

const scriptMatch = html.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
if (scriptMatch) {
  try {
    eval(scriptMatch[1]);
    console.log("SUCCESS! Script executed completely without ANY runtime error!");
  } catch(e) {
    console.error("ERROR:", e.message, e.stack);
  }
}
