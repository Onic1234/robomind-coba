import os

targets = [
    r"d:\project-26\RoboMind\public\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
]

# Code snippet to add image loading & background image rendering
image_load_code = """
    /* ==========================================================================
       MAP BACKGROUND IMAGE (maps_robo-delivery.jpg)
       ========================================================================== */
    const mapBgImg = new Image();
    let mapBgLoaded = false;
    mapBgImg.onload = () => {
      mapBgLoaded = true;
      if (typeof computeCamera === 'function') computeCamera();
    };
    mapBgImg.src = 'maps_robo-delivery.jpg';
"""

old_render_start = """    function renderGame() {
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

      // 1. Platform poligon arsitektural (urut painter: x+y, z tiebreak)
      const platforms = [...MAZE_PLATFORMS].sort((a, b) => {
        const ka = a.pts.reduce((s, p) => s + p[0] + p[1], 0) / a.pts.length;
        const kb = b.pts.reduce((s, p) => s + p[0] + p[1], 0) / b.pts.length;
        return (ka * 1000 + a.z) - (kb * 1000 + b.z);
      });
      platforms.forEach(plat => drawPlatform(plat));

      // 2. Tangga
      drawStairs();

      // 3. Jembatan biru
      drawBridges();

      // 4. Taman & pohon
      drawGardens();

      // 5. Karakter kecil
      MAZE_CHARACTERS.forEach(c => {
        const p = P(c.x, c.y, c.z);
        drawMiniCharacter(p.x, p.y, scaleFactor);
      });

      // 6. Collectibles
      MAZE_COLLECTIBLES.forEach(c => drawCollectible(c));"""

new_render_start = """    function renderGame() {
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

      // RENDER MAP BACKGROUND IMAGE (maps_robo-delivery.jpg)
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

for target in targets:
    if os.path.exists(target):
        with open(target, "r", encoding="utf-8") as f:
            code = f.read()

        if 'maps_robo-delivery.jpg' not in code:
            code = code.replace("/* ==========================================================================\n       CANVAS CORE ENGINE & RENDERER", image_load_code + "\n/* ==========================================================================\n       CANVAS CORE ENGINE & RENDERER")

        if old_render_start in code:
            code = code.replace(old_render_start, new_render_start)

        with open(target, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"Updated {target}")

