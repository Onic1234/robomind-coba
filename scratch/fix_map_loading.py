import os
import re

html_targets = [
    r"d:\project-26\RoboMind\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\web-games\robo-delivery\index.html",
]

new_img_code = """    const mapBgImg = new Image();
    let mapBgLoaded = false;
    mapBgImg.onload = () => {
      mapBgLoaded = true;
      if (typeof computeCamera === 'function') computeCamera();
    };
    mapBgImg.onerror = () => {
      console.warn('Map background image load error, trying fallbacks...');
      const fallbacks = [
        'maps_robo-delivery2.png',
        '/web-games/robo-delivery/maps_robo-delivery2.png',
        '/robo-delivery/maps_robo-delivery2.png',
        './maps_robo-delivery2.png'
      ];
      for (const src of fallbacks) {
        if (mapBgImg.src.indexOf(src) === -1) {
          mapBgImg.src = src;
          break;
        }
      }
    };
    mapBgImg.src = 'maps_robo-delivery2.png';"""

pattern = re.compile(r"const mapBgImg = new Image\(\);[\s\S]*?mapBgImg\.src\s*=\s*['\"][^'\"]+['\"];?", re.MULTILINE)

for h in html_targets:
    if os.path.exists(h):
        with open(h, "r", encoding="utf-8") as f:
            code = f.read()

        if pattern.search(code):
            code_updated = pattern.sub(new_img_code, code)
            with open(h, "w", encoding="utf-8") as f:
                f.write(code_updated)
            print(f"Cleaned mapBgImg loading in {h}")
        else:
            print(f"Pattern not found in {h}")

print("MAP LOADING FIX COMPLETED!")
