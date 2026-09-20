import os, shutil

src_html = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_html, "r", encoding="utf-8") as f:
    code = f.read()

old_nodes = """    const MAP_NODES_BASE = [
      { id: 0, x: 22, y: 17 }, // Top-Left Start / Food Platform
      { id: 1, x: 35, y: 26 }, // Upper Landing 1
      { id: 2, x: 52, y: 33 }, // Center High Bridge
      { id: 3, x: 62, y: 20 }, // Upper Landing 2
      { id: 4, x: 83, y: 11 }, // Top-Right Peak Customer 1
      { id: 5, x: 33, y: 43 }, // Mid-Left Terrace Food 2
      { id: 6, x: 50, y: 52 }, // Center Low Platform
      { id: 7, x: 73, y: 36 }, // Mid-Right Terrace Customer 2
      { id: 8, x: 18, y: 78 }, // Lower-Left Gift Platform
      { id: 9, x: 48, y: 78 }, // Lower-Center Terrace
      { id: 10, x: 75, y: 84 }  // Lower-Right Customer 3
    ];"""

new_nodes = """    const MAP_NODES_BASE = [
      { id: 0, x: 20.5, y: 22 }, // Top-Left Start / Food Platform
      { id: 1, x: 35, y: 27 },   // Upper Landing 1
      { id: 2, x: 52, y: 34 },   // Center High Bridge
      { id: 3, x: 62, y: 20 },   // Upper Landing 2
      { id: 4, x: 84, y: 10 },   // Top-Right Peak Customer 1
      { id: 5, x: 33, y: 43 },   // Mid-Left Terrace Food 2
      { id: 6, x: 50, y: 52 },   // Center Low Platform
      { id: 7, x: 73, y: 36 },   // Mid-Right Terrace Customer 2
      { id: 8, x: 18, y: 78 },   // Lower-Left Gift Platform
      { id: 9, x: 48, y: 78 },   // Lower-Center Terrace
      { id: 10, x: 75, y: 84 }    // Lower-Right Customer 3
    ];"""

if old_nodes in code:
    code = code.replace(old_nodes, new_nodes)
    print("SUCCESS: Micro-tuned MAP_NODES_BASE coordinates!")

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
    print(f"Synchronized micro-tuned HTML to {t}")
