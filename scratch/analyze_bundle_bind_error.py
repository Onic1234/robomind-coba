import os, re, glob

js_files = glob.glob(r"d:\project-26\RoboMind\dist\_expo\static\js\web\*.js")
if not js_files:
    print("No js files found in dist!")
else:
    js_path = js_files[0]
    print(f"Analyzing {js_path}...")
    with open(js_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Search for .bind(
    bind_matches = [m.start() for m in re.finditer(r"\.bind\(", content)]
    print(f"Found {len(bind_matches)} occurrences of .bind(")
    
    for idx, pos in enumerate(bind_matches[:20]):
        snippet = content[max(0, pos-100):min(len(content), pos+100)]
        print(f"\n--- Match {idx+1} ---")
        print(snippet)
