import re
import os

bundle_path = os.path.join("dist", "_expo", "static", "js", "web", "entry-6002ec105309333c0dfa6e141428229e.js")

if not os.path.exists(bundle_path):
    # Find any entry-*.js file in dist
    dist_js_dir = os.path.join("dist", "_expo", "static", "js", "web")
    for f in os.listdir(dist_js_dir):
        if f.startswith("entry-") and f.endswith(".js"):
            bundle_path = os.path.join(dist_js_dir, f)
            break

print(f"Reading bundle: {bundle_path}")
with open(bundle_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find all occurrences of .bind(
bind_matches = []
for match in re.finditer(r'([a-zA-Z0-9_\.\[\]\(\)]+)\.bind\(([^)]*)\)', content):
    start = max(0, match.start() - 50)
    end = min(len(content), match.end() + 50)
    snippet = content[start:end].replace('\n', ' ')
    bind_matches.append((match.group(1), match.group(2), snippet, match.start()))

print(f"Total .bind() calls found: {len(bind_matches)}")
print("\n--- SAMPLE BIND CALLS ---")
for target, args, snippet, pos in bind_matches[:30]:
    print(f"Pos {pos}: {target}.bind({args}) | Snippet: ...{snippet}...")

# Filter potential dangerous ones:
# 1) obj.method.bind() without first arg or where obj might be undefined
# 2) undefined.bind or null.bind
# 3) Reflect.get.bind() without args or with empty args
# 4) variable.bind(...) where variable is property lookup like a.b.c.bind
print("\n--- POTENTIALLY RISKY BIND CALLS ---")
risky_count = 0
for target, args, snippet, pos in bind_matches:
    # Check if target contains optional chaining or property access that could be undefined
    if "Reflect.get.bind()" in snippet or "bind()" in snippet or target.startswith("undefined") or target.startswith("null"):
        print(f"RISKY Pos {pos}: {target}.bind({args}) | Snippet: ...{snippet}...")
        risky_count += 1
    elif "bind(null)" in snippet or "bind(this)" in snippet or "bind(void 0)" in snippet:
        # Check if the target expression could be undefined
        pass

print(f"Total risky bind calls found: {risky_count}")
