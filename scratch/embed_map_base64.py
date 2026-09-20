import os, base64

img_path = r"d:\project-26\RoboMind\public\robo-delivery\maps_robo-delivery2.png"

if not os.path.exists(img_path):
    img_path = r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2\.user_uploaded\media_1788617894779.png"

with open(img_path, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode("utf-8")

data_uri = f"data:image/png;base64,{img_b64}"
print(f"Generated Data URI of size {len(data_uri)} chars.")

html_targets = [
    r"d:\project-26\RoboMind\public\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
    r"d:\project-26\RoboMind\robo-delivery\index.html"
]

new_image_loader = f"""    /* ==========================================================================
       MAP BACKGROUND IMAGE (Base64 Instant Guaranteed Load - No 404 Possible)
       ========================================================================== */
    const mapBgImg = new Image();
    let mapBgLoaded = false;

    mapBgImg.onload = () => {{
      mapBgLoaded = true;
      if (typeof computeCamera === 'function') computeCamera();
    }};
    mapBgImg.src = "{data_uri}";
"""

# Also clean renderGame() so fallback procedural platforms are NEVER drawn if mapBgLoaded is true, and if false we don't double draw
old_render_game = """    function renderGame() {
      // Sky Horizon Background (Matching reference image diagonal split)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#ffffff');
      skyGrad.addColorStop(0.65, '#f0f9ff');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Diagonal Sky Blue Horizon Cut at Bottom
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.78);
      ctx.lineTo(canvas.width, canvas.height * 0.68);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      if (!currentLevelData) return;

      // RENDER MAP BACKGROUND IMAGE (maps_robo-delivery2.png)
      if (mapBgLoaded && mapBgImg) {
        ctx.save();
        const imgW = mapBgImg.width;
        const imgH = mapBgImg.height;
        const imgAspect = imgW / imgH;
        const canvasAspect = canvas.width / canvas.height;

        let dw, dh, dx, dy;
        if (canvasAspect > imgAspect) {
          dh = canvas.height * 0.94;
          dw = dh * imgAspect;
        } else {
          dw = canvas.width * 0.94;
          dh = dw / imgAspect;
        }
        dx = (canvas.width - dw) / 2;
        dy = (canvas.height - dh) / 2 - 10;

        ctx.drawImage(mapBgImg, dx, dy, dw, dh);
        ctx.restore();
      } else {
        // Fallback procedural platform renderer if image is loading
        const platforms = [...MAZE_PLATFORMS].sort((a, b) => {
          const ka = a.pts.reduce((s, p) => s + p[0] + p[1], 0) / a.pts.length;
          const kb = b.pts.reduce((s, p) => s + p[0] + p[1], 0) / b.pts.length;
          return (ka * 1000 + a.z) - (kb * 1000 + b.z);
        });
        platforms.forEach(plat => drawPlatform(plat));
        drawStairs();
        drawBridges();
        drawGardens();
        MAZE_CHARACTERS.forEach(c => {
          const p = P(c.x, c.y, c.z);
          drawMiniCharacter(p.x, p.y, scaleFactor);
        });
        MAZE_COLLECTIBLES.forEach(c => drawCollectible(c));
      }"""

new_render_game = """    function renderGame() {
      // Sky Horizon Background (Matching reference image diagonal split)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGrad.addColorStop(0, '#ffffff');
      skyGrad.addColorStop(0.65, '#f0f9ff');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Diagonal Sky Blue Horizon Cut at Bottom
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.78);
      ctx.lineTo(canvas.width, canvas.height * 0.68);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.closePath();
      ctx.fill();

      if (!currentLevelData) return;

      // RENDER MAP BACKGROUND IMAGE (maps_robo-delivery2.png)
      if (mapBgLoaded && mapBgImg && mapBgImg.complete && mapBgImg.naturalWidth > 0) {
        ctx.save();
        const imgW = mapBgImg.width || 1000;
        const imgH = mapBgImg.height || 1000;
        const imgAspect = imgW / imgH;
        const canvasAspect = canvas.width / canvas.height;

        let dw, dh, dx, dy;
        if (canvasAspect > imgAspect) {
          dh = canvas.height * 0.94;
          dw = dh * imgAspect;
        } else {
          dw = canvas.width * 0.94;
          dh = dw / imgAspect;
        }
        dx = (canvas.width - dw) / 2;
        dy = (canvas.height - dh) / 2 - 10;

        ctx.drawImage(mapBgImg, dx, dy, dw, dh);
        ctx.restore();
      }"""

for target in html_targets:
    if os.path.exists(target):
        with open(target, "r", encoding="utf-8") as f:
            code = f.read()

        # Replace image loader block
        start_marker = "/* ==========================================================================\n       MAP BACKGROUND IMAGE"
        end_marker = "mapBgImg.src = mapBgSrcs[0];"
        if start_marker in code and end_marker in code:
            parts = code.split(start_marker)
            rest = parts[1].split(end_marker)
            code = parts[0] + new_image_loader + rest[1]

        if old_render_game in code:
            code = code.replace(old_render_game, new_render_game)

        with open(target, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"Updated Base64 loader in {target}")

