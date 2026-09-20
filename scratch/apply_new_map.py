import os
import shutil
import base64
import re
from PIL import Image

src_jpg = r"C:\Users\Acer\.gemini\antigravity-ide\brain\2ca8608e-2bca-48b5-ba55-0da34bae6ffa\robo_delivery_map_v3_1789907922626.jpg"

if not os.path.exists(src_jpg):
    print("Source image not found:", src_jpg)
    exit(1)

img = Image.open(src_jpg)
img_resized = img.resize((1024, 1024), Image.Resampling.LANCZOS)

temp_png = r"d:\project-26\RoboMind\scratch\temp_map.png"
img_resized.save(temp_png, "PNG", optimize=True)

targets_img = [
    r"d:\project-26\RoboMind\public\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\dist\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\dist\web-games\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\assets\images\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\public\maps_robo-delivery2.png",
]

for t in targets_img:
    os.makedirs(os.path.dirname(t), exist_ok=True)
    shutil.copy2(temp_png, t)
    print(f"Updated image asset: {t}")

with open(temp_png, "rb") as f:
    b64_str = base64.b64encode(f.read()).decode("utf-8")

data_uri = f"data:image/png;base64,{b64_str}"
print(f"Base64 URI size: {len(data_uri)} bytes")

html_targets = [
    r"d:\project-26\RoboMind\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\web-games\robo-delivery\index.html",
]

pattern = re.compile(r"mapBgImg\.src\s*=\s*['\"][^'\"]+['\"];?")

for h in html_targets:
    if os.path.exists(h):
        with open(h, "r", encoding="utf-8") as f:
            code = f.read()

        code_updated = pattern.sub(f"mapBgImg.src = '{data_uri}';", code)

        with open(h, "w", encoding="utf-8") as f:
            f.write(code_updated)
        print(f"Updated Base64 map in {h}")

print("ALL MAP ASSETS AND HTML FILES UPDATED SUCCESSFULLY!")
