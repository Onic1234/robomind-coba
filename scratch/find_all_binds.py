import re
import os

bundle_path = os.path.join("dist", "_expo", "static", "js", "web", "entry-6002ec105309333c0dfa6e141428229e.js")

with open(bundle_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's search for __d( or module definitions
# In metro minified bundles, modules are registered via __d or similar function calls.
# Let's find all occurrences of .bind in the whole file and show what module or code surrounds them!

matches = list(re.finditer(r'\.bind\(', content))
print(f"Total .bind( occurrences: {len(matches)}")

for i, match in enumerate(matches):
    idx = match.start()
    # extract surrounding 100 chars before and 100 after
    before = content[max(0, idx - 80):idx]
    after = content[idx:min(len(content), idx + 80)]
    print(f"\n--- Match {i+1} at index {idx} ---")
    print(f"Before: {before}")
    print(f"After:  {after}")
