import os, shutil

src_html = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_html, "r", encoding="utf-8") as f:
    code = f.read()

# Replace roundRect calls with polyfill/fallback
code = code.replace("ctx.roundRect(", "(ctx.roundRect ? ctx.roundRect : function(x,y,w,h,r){ctx.rect(x,y,w,h);}).call(ctx, ")

# Fix the return order in _renderGameInternal
old_render_block = """      if (!currentLevelData) return;

      // RENDER MAP BACKGROUND IMAGE (maps_robo-delivery2.png)
      const b = getMapBounds();
      if (mapBgImg) {
        ctx.save();
        try {
          ctx.drawImage(mapBgImg, b.dx, b.dy, b.dw, b.dh);
        } catch(e) {}
        ctx.restore();
      }"""

new_render_block = """      // RENDER MAP BACKGROUND IMAGE (maps_robo-delivery2.png) ALWAYS
      const b = getMapBounds();
      if (mapBgImg) {
        ctx.save();
        try {
          ctx.drawImage(mapBgImg, b.dx, b.dy, b.dw, b.dh);
        } catch(e) {}
        ctx.restore();
      }

      if (!currentLevelData) return;"""

if old_render_block in code:
    code = code.replace(old_render_block, new_render_block)
    print("SUCCESS: Moved mapBgImg draw ABOVE if(!currentLevelData) return!")

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
    print(f"Synchronized fixed return order HTML to {t}")
