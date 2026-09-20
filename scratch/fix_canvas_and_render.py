import os
import shutil
import re

html_file = r"d:\project-26\RoboMind\robo-delivery\index.html"

with open(html_file, "r", encoding="utf-8") as f:
    code = f.read()

setup_code = """<script>
    /* ==========================================================================
       CANVAS & SYSTEM SETUP
       ========================================================================== */
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    let scaleFactor = 1.0;
    let hoveredNodeId = null;

    function resizeCanvas() {
      if (!canvas) return;
      const w = window.innerWidth || 800;
      const h = window.innerHeight || 600;
      canvas.width = w;
      canvas.height = h;
      scaleFactor = Math.min(w / 800, h / 600);
      if (typeof computeCamera === 'function') computeCamera();
    }
    window.addEventListener('resize', resizeCanvas);"""

if "const canvas =" not in code:
    code = code.replace("<script>", setup_code)

targets = [
    r"d:\project-26\RoboMind\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\robo-delivery\index.html",
    r"d:\project-26\RoboMind\dist\web-games\robo-delivery\index.html",
]

for t in targets:
    os.makedirs(os.path.dirname(t), exist_ok=True)
    with open(t, "w", encoding="utf-8") as f:
        f.write(code)
    print(f"Fixed canvas & resizeCanvas in {t}")

print("CANVAS AND RENDER SETUP FIXED!")
