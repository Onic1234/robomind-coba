import json
import subprocess

with open('robo-delivery/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

s_start = content.find('<script>') + len('<script>')
s_end = content.find('</script>')
js_code = content[s_start:s_end]

eval_js = f"""
const vm = require('vm');

let logs = [];
let errors = [];

const mockElement = {{
    getContext: () => ({{
        save: () => {{}}, restore: () => {{}}, translate: () => {{}}, scale: () => {{}},
        rotate: () => {{}}, beginPath: () => {{}}, moveTo: () => {{}}, lineTo: () => {{}},
        stroke: () => {{}}, fill: () => {{}}, drawImage: () => {{}}, arc: () => {{}},
        clearRect: () => {{}}, fillRect: () => {{}}, strokeText: () => {{}}, fillText: () => {{}},
        createLinearGradient: () => ({{ addColorStop: () => {{}} }}),
        ellipse: () => {{}}, roundRect: () => {{}}, setLineDash: () => {{}}, closePath: () => {{}}
    }}),
    style: {{}},
    innerText: '',
    innerHTML: '',
    classList: {{ add: () => {{}}, remove: () => {{}} }},
    addEventListener: () => {{}}
}};

const sandbox = {{
    console: {{
        log: (...a) => console.log("[LOG]", ...a),
        error: (...a) => console.error("[ERR]", ...a),
        warn: (...a) => console.log("[WARN]", ...a)
    }},
    document: {{
        getElementById: () => mockElement,
        createElement: () => mockElement,
        body: mockElement,
        addEventListener: () => {{}}
    }},
    window: {{
        innerWidth: 800,
        innerHeight: 600,
        addEventListener: () => {{}},
        removeEventListener: () => {{}}
    }},
    Image: class {{
        constructor() {{ setTimeout(() => {{ if (this.onload) this.onload(); }}, 5); }}
    }},
    AudioContext: class {{}},
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    requestAnimationFrame: (cb) => {{}},
    process: process
}};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;

const code = {json.dumps(js_code)};

try {{
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    
    // Explicitly test _renderGameInternal
    sandbox._renderGameInternal();
    console.log("RENDER_INTERNAL_PASSED_SUCCESSFULLY");

    // Test gameLoop
    sandbox.gameLoop();
    console.log("GAMELOOP_PASSED_SUCCESSFULLY");
    process.exit(0);
}} catch(e) {{
    console.error("FAIL_DETAIL:", e.message);
    console.error(e.stack);
    process.exit(1);
}}
"""

with open('scratch/debug_render.js', 'w', encoding='utf-8') as f:
    f.write(eval_js)

res = subprocess.run(['node', 'scratch/debug_render.js'], capture_output=True, text=True)
print("STDOUT:", res.stdout)
print("STDERR:", res.stderr)
