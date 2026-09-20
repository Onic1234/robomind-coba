import os, shutil, base64

real_map_source = r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2\.user_uploaded\media_1788617503669.jpg"

if not os.path.exists(real_map_source):
    print("ERROR: Real map source not found!")
    exit(1)

print(f"Real map source found! Size: {os.path.getsize(real_map_source)} bytes")

# Copy real map image over maps_robo-delivery2.png in all target locations
img_targets = [
    r"d:\project-26\RoboMind\public\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\assets\images\maps_robo-delivery2.png"
]

for t in img_targets:
    os.makedirs(os.path.dirname(t), exist_ok=True)
    shutil.copyfile(real_map_source, t)
    print(f"Replaced {t} with REAL hand-drawn map illustration!")

# Read Base64 of real map image
with open(real_map_source, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode("utf-8")

data_uri = f"data:image/jpeg;base64,{img_b64}"
print(f"New Base64 Data URI length: {len(data_uri)} chars")

# Update all index.html files with new Base64 Data URI
src_html = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_html, "r", encoding="utf-8") as f:
    code = f.read()

# Replace mapBgImg.src = "data:image/...";
start_src = 'mapBgImg.src = "'
end_src = '";'

if start_src in code:
    parts = code.split(start_src)
    rest = parts[1].split(end_src, 1)
    code = parts[0] + start_src + data_uri + end_src + rest[1]
    print("SUCCESS: Replaced Base64 Data URI in public/robo-delivery/index.html!")

with open(src_html, "w", encoding="utf-8") as f:
    f.write(code)

html_targets = [
    r"d:\project-26\RoboMind\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\web-games\robo-delivery\index.html"
]

for t in html_targets:
    os.makedirs(os.path.dirname(t), exist_ok=True)
    shutil.copyfile(src_html, t)
    print(f"Synchronized HTML to {t}")
