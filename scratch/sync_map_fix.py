import os
import base64

img_path = r"d:\project-26\RoboMind\public\robo-delivery\maps_robo-delivery2.png"

if not os.path.exists(img_path):
    img_path = r"d:\project-26\RoboMind\robo-delivery\maps_robo-delivery2.png"

with open(img_path, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode("utf-8")

data_uri = f"data:image/png;base64,{img_b64}"
print(f"Base64 Data URI length: {len(data_uri)} chars")

src_file = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_file, "r", encoding="utf-8") as f:
    content = f.read()

# Replace mapBgImg.src = 'maps_robo-delivery2.png'; with Base64 Data URI
old_src = "mapBgImg.src = 'maps_robo-delivery2.png';"
new_src = f"mapBgImg.src = '{data_uri}';"

if old_src in content:
    content = content.replace(old_src, new_src)
    print("Replaced old_src with Base64 Data URI!")
elif "mapBgImg.src = 'data:image/png;base64," in content:
    print("Base64 Data URI is already present in public/robo-delivery/index.html")

with open(src_file, "w", encoding="utf-8") as f:
    f.write(content)

targets = [
    r"d:\project-26\RoboMind\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html"
]

for t in targets:
    with open(t, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Successfully synchronized {src_file} -> {t}")
