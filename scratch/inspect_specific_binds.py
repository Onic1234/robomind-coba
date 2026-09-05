import os

bundle_path = os.path.join("dist", "_expo", "static", "js", "web", "entry-6002ec105309333c0dfa6e141428229e.js")

with open(bundle_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's inspect match 69 and match 48 and match 66-68
pos_69 = content.find("concatArrays:!0,ignoreUndefined:!0")
if pos_69 != -1:
    print("--- MATCH 69 DETAILS ---")
    print(content[pos_69 - 200:pos_69 + 300])

pos_48 = content.find(".next.bind(n)")
if pos_48 != -1:
    print("\n--- MATCH 48 DETAILS ---")
    print(content[pos_48 - 200:pos_48 + 300])

pos_47 = content.find("Object.assign.bind()")
if pos_47 != -1:
    print("\n--- MATCH 47 DETAILS ---")
    print(content[pos_47 - 200:pos_47 + 300])
