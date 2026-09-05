import re
import os

bundle_path = os.path.join("dist", "_expo", "static", "js", "web", "entry-6002ec105309333c0dfa6e141428229e.js")

with open(bundle_path, "r", encoding="utf-8") as f:
    content = f.read()

matches = list(re.finditer(r'\.bind\(', content))

print("--- Matches 1 to 40 ---")
for i in range(min(40, len(matches))):
    match = matches[i]
    idx = match.start()
    before = content[max(0, idx - 60):idx]
    after = content[idx:min(len(content), idx + 60)]
    print(f"Match {i+1}: ...{before} <--> {after}...")

print("\n--- Matches 41 to 80 ---")
for i in range(40, min(80, len(matches))):
    match = matches[i]
    idx = match.start()
    before = content[max(0, idx - 60):idx]
    after = content[idx:min(len(content), idx + 60)]
    print(f"Match {i+1}: ...{before} <--> {after}...")
