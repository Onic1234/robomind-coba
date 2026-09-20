import os, shutil

src_html = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_html, "r", encoding="utf-8") as f:
    code = f.read()

# Replace ellipse drawing lines in obstacles loop to prevent negative radius DOMException
old_ellipse_code = """        const hazardPulse = Math.sin(Date.now() * 0.01) * 2 * scaleFactor;
        const ringRadius = (14 * scaleFactor) + hazardPulse;
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.beginPath();
        ctx.ellipse(ox, oy + 3 * scaleFactor, ringRadius, ringRadius * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5 * scaleFactor;
        ctx.beginPath();
        ctx.ellipse(ox, oy + 3 * scaleFactor, ringRadius, ringRadius * 0.55, 0, 0, Math.PI * 2);
        ctx.stroke();"""

new_ellipse_code = """        const sf = Math.max(0.2, scaleFactor || 1.0);
        const hazardPulse = Math.sin(Date.now() * 0.01) * 2 * sf;
        const rx = Math.max(4, (14 * sf) + hazardPulse);
        const ry = Math.max(2, rx * 0.55);
        
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.beginPath();
        try { ctx.ellipse(ox, oy + 3 * sf, rx, ry, 0, 0, Math.PI * 2); } catch(e) {}
        ctx.fill();

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5 * sf;
        ctx.beginPath();
        try { ctx.ellipse(ox, oy + 3 * sf, rx, ry, 0, 0, Math.PI * 2); } catch(e) {}
        ctx.stroke();"""

if old_ellipse_code in code:
    code = code.replace(old_ellipse_code, new_ellipse_code)
    print("SUCCESS: Replaced ellipse code in obstacles loop!")

# Wrap renderGame body in try-catch block for absolute safety
old_render_start = "    function renderGame() {"
new_render_start = """    function renderGame() {
      try {
        _renderGameInternal();
      } catch(e) {
        console.error("Error in renderGame:", e);
      }
    }

    function _renderGameInternal() {"""

if old_render_start in code and "_renderGameInternal" not in code:
    code = code.replace(old_render_start, new_render_start, 1)
    print("SUCCESS: Wrapped renderGame in error-handling try-catch!")

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
    print(f"Synchronized safe HTML to {t}")
