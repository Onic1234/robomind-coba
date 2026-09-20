import os, base64, shutil

img_path = r"d:\project-26\RoboMind\public\robo-delivery\maps_robo-delivery2.png"
if not os.path.exists(img_path):
    img_path = r"d:\project-26\RoboMind\robo-delivery\maps_robo-delivery2.png"

with open(img_path, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode("utf-8")

data_uri = f"data:image/png;base64,{img_b64}"
print(f"Base64 Data URI length: {len(data_uri)} chars")

src_file = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_file, "r", encoding="utf-8") as f:
    code = f.read()

loader_code = f"""
    /* ==========================================================================
       MAP BACKGROUND IMAGE (maps_robo-delivery2.png Base64 Instant Guaranteed)
       ========================================================================== */
    const mapBgImg = new Image();
    let mapBgLoaded = false;
    mapBgImg.onload = () => {{
      mapBgLoaded = true;
      if (typeof computeCamera === 'function') computeCamera();
    }};
    mapBgImg.src = "{data_uri}";
"""

target_marker = "/* ==========================================================================\n       CANVAS CORE ENGINE & RENDERER"

if target_marker in code and "const mapBgImg" not in code:
    code = code.replace(target_marker, loader_code + "\n    " + target_marker)
    print("SUCCESS: Inserted mapBgImg loader before Canvas Core Engine!")

with open(src_file, "w", encoding="utf-8") as f:
    f.write(code)

targets = [
    r"d:\project-26\RoboMind\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\web-games\robo-delivery\index.html"
]

for t in targets:
    os.makedirs(os.path.dirname(t), exist_ok=True)
    shutil.copyfile(src_file, t)
    print(f"Synchronized to {t}")
