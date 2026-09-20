
const vm = require('vm');

const mockElement = {
    getContext: () => ({
        save: () => {}, restore: () => {}, translate: () => {}, scale: () => {},
        rotate: () => {}, beginPath: () => {}, moveTo: () => {}, lineTo: () => {},
        stroke: () => {}, fill: () => {}, drawImage: () => {}, arc: () => {},
        clearRect: () => {}, fillRect: () => {}, strokeText: () => {}, fillText: () => {}
    }),
    style: {},
    addEventListener: () => {}
};

const sandbox = {
    console: console,
    document: {
        getElementById: () => mockElement,
        createElement: () => mockElement,
        body: mockElement,
        addEventListener: () => {}
    },
    window: {
        innerWidth: 800,
        innerHeight: 600,
        addEventListener: () => {},
        removeEventListener: () => {}
    },
    Image: class {
        constructor() { setTimeout(() => { if (this.onload) this.onload(); }, 10); }
    },
    AudioContext: class {},
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    requestAnimationFrame: (cb) => setTimeout(cb, 16)
};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;

try {
    vm.createContext(sandbox);
    vm.runInContext(`" + js_code.replace('`', '\`').replace('$', '\$') + "`, sandbox);
    console.log("SUCCESS_EVAL");
} catch(e) {
    console.error("FAIL_EVAL:", e);
}
