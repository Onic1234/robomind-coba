import os, shutil, base64

real_map_source = r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2\.user_uploaded\media_1788617503669.jpg"

with open(real_map_source, "rb") as f:
    img_b64 = base64.b64encode(f.read()).decode("utf-8")

data_uri = f"data:image/jpeg;base64,{img_b64}"

src_html = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_html, "r", encoding="utf-8") as f:
    code = f.read()

# Replace mapBgImg loader & getMapBounds & proj
bulletproof_engine = f"""    /* ==========================================================================
       MAP BACKGROUND IMAGE & BULLETPROOF PROJECTION ENGINE
       ========================================================================== */
    const mapBgImg = new Image();
    let mapBgLoaded = false;
    mapBgImg.onload = () => {{
      mapBgLoaded = true;
      if (typeof computeCamera === 'function') computeCamera();
    }};
    mapBgImg.src = "{data_uri}";

    function getMapBounds() {{
      const imgAspect = (mapBgImg && mapBgImg.width && mapBgImg.height) ? (mapBgImg.width / mapBgImg.height) : 1.0;
      const canvasAspect = canvas.width / canvas.height;

      let dw, dh, dx, dy;
      if (canvasAspect > imgAspect) {{
        dh = canvas.height * 0.94;
        dw = dh * imgAspect;
      }} else {{
        dw = canvas.width * 0.94;
        dh = dw / imgAspect;
      }}
      dx = (canvas.width - dw) / 2;
      dy = (canvas.height - dh) / 2 - 10;

      return {{ dx, dy, dw, dh }};
    }}

    function proj(x, y, z = 0) {{
      const b = getMapBounds();
      return {{
        x: b.dx + (x / 100.0) * b.dw,
        y: b.dy + (y / 100.0) * b.dh
      }};
    }}"""

# Replace old proj and mapBgImg block if present
start_loader = "/* ==========================================================================\n       MAP BACKGROUND IMAGE"
end_proj = "function proj(x, y, z = 0) {"

if start_loader in code:
    parts = code.split(start_loader)
    # Find end of proj function
    proj_idx = parts[1].find("/* ==========================================================================\n       GAME LOAD")
    if proj_idx != -1:
        code = parts[0] + bulletproof_engine + "\n\n    " + parts[1][proj_idx:]
        print("SUCCESS: Replaced mapBgImg and proj function with Bulletproof Engine!")

# Also replace renderGame background image draw logic
old_render_draw = """      // RENDER MAP BACKGROUND IMAGE (maps_robo-delivery2.png)
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

new_render_draw = """      // RENDER MAP BACKGROUND IMAGE (maps_robo-delivery2.png)
      const b = getMapBounds();
      if (mapBgImg) {
        ctx.save();
        try {
          ctx.drawImage(mapBgImg, b.dx, b.dy, b.dw, b.dh);
        } catch(e) {}
        ctx.restore();
      }"""

if old_render_draw in code:
    code = code.replace(old_render_draw, new_render_draw)
    print("SUCCESS: Replaced renderGame background draw logic with getMapBounds!")

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
    print(f"Synchronized bulletproof engine HTML to {t}")
