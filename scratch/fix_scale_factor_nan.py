import os, shutil

src_html = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_html, "r", encoding="utf-8") as f:
    code = f.read()

# Fix computeCamera so scaleFactor is ALWAYS 1.0 and never NaN or Infinity
old_compute_camera = """    function computeCamera() {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      const touch = (x, y, z, extraY = 0) => {
        const wx = (x - y) * UNIT_X;
        const wy = (x + y) * UNIT_Y - z * HEIGHT_STEP;
        minX = Math.min(minX, wx - 30);
        maxX = Math.max(maxX, wx + 30);
        minY = Math.min(minY, wy - 30);
        maxY = Math.max(maxY, wy + 30 + extraY);
      };
      MAZE_PLATFORMS.forEach(p => {
        p.pts.forEach(([x, y]) => touch(x, y, p.z, p.wall * HEIGHT_STEP + 20));
      });
      MAZE_STAIRS.forEach(s => { touch(s.x1, s.y1, s.z1); touch(s.x2, s.y2, s.z2); });
      MAZE_BRIDGES.forEach(b => { touch(b.x1, b.y1, b.z); touch(b.x2, b.y2, b.z); });
      MAZE_GARDENS.forEach(g => touch(g.x, g.y, g.z));
      MAZE_CHARACTERS.forEach(c => touch(c.x, c.y, c.z));
      MAZE_COLLECTIBLES.forEach(c => touch(c.x, c.y, c.z));
      (currentLevelData ? currentLevelData.nodes : []).forEach(n => touch(n.x, n.y, n.z));

      camCx = (minX + maxX) / 2;
      camCy = (minY + maxY) / 2;
      const worldW = Math.max(maxX - minX, 1);
      const worldH = Math.max(maxY - minY, 1);
      const baseScale = Math.min(canvas.width / (worldW * 1.06), canvas.height / (worldH * 1.12));
      scaleFactor = baseScale * (isZoomedIn ? 1.3 : 1.0);
    }"""

new_compute_camera = """    function computeCamera() {
      scaleFactor = isZoomedIn ? 1.3 : 1.0;
    }"""

if old_compute_camera in code:
    code = code.replace(old_compute_camera, new_compute_camera)
    print("SUCCESS: Replaced computeCamera with clean scaleFactor = 1.0!")
else:
    # Alternative replace if computeCamera was slightly modified
    start_cam = "function computeCamera() {"
    end_cam = "function toggleZoom() {"
    if start_cam in code and end_cam in code:
        parts = code.split(start_cam)
        rest = parts[1].split(end_cam)
        code = parts[0] + "function computeCamera() {\n      scaleFactor = isZoomedIn ? 1.3 : 1.0;\n    }\n\n    " + end_cam + rest[1]
        print("SUCCESS: Replaced computeCamera via regex fallback!")

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
    print(f"Synchronized fixed scaleFactor HTML to {t}")
