import json
import subprocess

with open('robo-delivery/index.html', 'r', encoding='utf-8') as f:
    content = f.read()

s_start = content.find('<script>') + len('<script>')
s_end = content.find('</script>')
js_code = content[s_start:s_end]

eval_js = f"""
const vm = require('vm');
const mockElement = {{
    getContext: () => ({{
        save: () => {{}}, restore: () => {{}}, translate: () => {{}}, scale: () => {{}},
        rotate: () => {{}}, beginPath: () => {{}}, moveTo: () => {{}}, lineTo: () => {{}},
        stroke: () => {{}}, fill: () => {{}}, drawImage: () => {{}}, arc: () => {{}},
        clearRect: () => {{}}, fillRect: () => {{}}, strokeText: () => {{}}, fillText: () => {{}}
    }}),
    style: {{}},
    addEventListener: () => {{}}
}};

const sandbox = {{
    console: console,
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
        constructor() {{ setTimeout(() => {{ if (this.onload) this.onload(); }}, 10); }}
    }},
    AudioContext: class {{}},
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    requestAnimationFrame: (cb) => setTimeout(cb, 16)
}};
sandbox.window.window = sandbox.window;
sandbox.window.document = sandbox.document;

const code = {json.dumps(js_code)};

try {{
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox);
    console.log("SUCCESS_EVAL: No syntax or initialization errors found!");
}} catch(e) {{
    console.error("FAIL_EVAL:", e.message);
    console.error(e.stack);
}}
"""

with open('scratch/run_eval.js', 'w', encoding='utf-8') as f:
    f.write(eval_js)

res = subprocess.run(['node', 'scratch/run_eval.js'], capture_output=True, text=True)
print('STDOUT:', res.stdout)
print('STDERR:', res.stderr)
