import os, re

app_dir = r"d:\project-26\RoboMind\app"

def check_file(filepath):
    rel = os.path.relpath(filepath, app_dir)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    has_export_default = bool(re.search(r"export\s+default\s+", content))
    print(f"File: {rel} | Has export default: {has_export_default}")
    
    if not has_export_default:
        print(f"  --> WARNING: {rel} HAS NO EXPORT DEFAULT!")

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts") or file.endswith(".js"):
            check_file(os.path.join(root, file))
