import glob, re

js_files = glob.glob(r"d:\project-26\RoboMind\dist\_expo\static\js\web\*.js")
js_path = js_files[0]

with open(js_path, "r", encoding="utf-8") as f:
    content = f.read()

# Search for any property access .bind( where the target property might be undefined
# e.g., something.something.bind( or obj[x].bind(
pattern = r"(\w+\.[\w\.]+)\.bind\("
matches = re.findall(pattern, content)

print(f"Total .bind targets: {len(matches)}")
unique = set(matches)
for m in sorted(unique):
    if not m.startswith("Math.") and not m.startswith("Array.") and not m.startswith("Object.") and not m.startswith("Function.") and not m.startswith("e.") and not m.startswith("t.") and not m.startswith("n."):
        print(f"Target: {m}")
