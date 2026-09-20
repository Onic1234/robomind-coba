import os, shutil

src_img = r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2\.user_uploaded\media_1788617894779.png"

dest_paths = [
    r"d:\project-26\RoboMind\public\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\public\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\assets\images\maps_robo-delivery2.png",
    r"d:\project-26\RoboMind\robo-delivery\maps_robo-delivery2.png",
]

for dest in dest_paths:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy(src_img, dest)
    print(f"Copied to {dest}")

html_targets = [
    r"d:\project-26\RoboMind\public\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
    r"d:\project-26\RoboMind\robo-delivery\index.html"
]

new_image_loader = """    /* ==========================================================================
       MAP BACKGROUND IMAGE (maps_robo-delivery2.png with Auto Fallbacks)
       ========================================================================== */
    const mapBgImg = new Image();
    let mapBgLoaded = false;
    let mapBgSrcs = [
      'maps_robo-delivery2.png',
      '/web-games/robo-delivery/maps_robo-delivery2.png',
      '/robo-delivery/maps_robo-delivery2.png',
      '/maps_robo-delivery2.png'
    ];
    let mapBgSrcIdx = 0;

    mapBgImg.onload = () => {
      mapBgLoaded = true;
      if (typeof computeCamera === 'function') computeCamera();
    };
    mapBgImg.onerror = () => {
      mapBgSrcIdx++;
      if (mapBgSrcIdx < mapBgSrcs.length) {
        mapBgImg.src = mapBgSrcs[mapBgSrcIdx];
      }
    };
    mapBgImg.src = mapBgSrcs[0];
"""

old_image_loader = """    /* ==========================================================================
       MAP BACKGROUND IMAGE (maps_robo-delivery.jpg)
       ========================================================================== */
    const mapBgImg = new Image();
    let mapBgLoaded = false;
    mapBgImg.onload = () => {
      mapBgLoaded = true;
      if (typeof computeCamera === 'function') computeCamera();
    };
    mapBgImg.src = 'maps_robo-delivery2.png';"""

for target in html_targets:
    if os.path.exists(target):
        with open(target, "r", encoding="utf-8") as f:
            code = f.read()

        if old_image_loader in code:
            code = code.replace(old_image_loader, new_image_loader)

        with open(target, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"Updated image loader in {target}")

