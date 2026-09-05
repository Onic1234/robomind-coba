import os, re

app_dir = r"d:\project-26\RoboMind\app"

print("--- SCANNING FOR UNGUARDED SUPABASE & BROWSER APIS ---")

def scan_file(filepath):
    rel = os.path.relpath(filepath, app_dir)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Check Supabase client initialization
    if "createClient(" in content:
        lines = content.splitlines()
        for idx, line in enumerate(lines):
            if "createClient(" in line:
                print(f"[{rel}:{idx+1}] Supabase createClient: {line.strip()}")

    # Check FONTS or COLORS references that might be undefined
    if "FONTS." in content:
        lines = content.splitlines()
        for idx, line in enumerate(lines):
            if "FONTS." in line and ("h1" in line or "h2" in line or "h3" in line or "heading" in line or "title" in line):
                print(f"[{rel}:{idx+1}] FONTS usage: {line.strip()}")

for root, dirs, files in os.walk(app_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            scan_file(os.path.join(root, file))
