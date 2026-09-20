import os

targets = [
    r"d:\project-26\RoboMind\public\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
]

# Replacement for node track drawing in renderGame()
# Instead of drawing spiderweb lines across the entire map, only draw subtle connection lines from the robot's CURRENT node to available adjacent nodes!

old_track_block = """      // 7. Track Jalur Node
      currentLevelData.edges.forEach(edge => {
        const n1 = currentLevelData.nodes.find(n => n.id === edge[0]);
        const n2 = currentLevelData.nodes.find(n => n.id === edge[1]);
        const p1 = P(n1.x, n1.y, n1.z);
        const p2 = P(n2.x, n2.y, n2.z);

        ctx.strokeStyle = 'rgba(15, 23, 42, 0.20)';
        ctx.lineWidth = 2 * scaleFactor;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        const pulseT = ((Date.now() * 0.0018) % 1);
        const px = p1.x + (p2.x - p1.x) * pulseT;
        const py = p1.y + (p2.y - p1.y) * pulseT;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(px, py, 2.2 * scaleFactor, 0, Math.PI * 2);
        ctx.fill();
      });"""

new_track_block = """      // 7. Track Jalur Node (Clean & Minimalist - Only connected paths near Robot)
      currentLevelData.edges.forEach(edge => {
        const n1 = currentLevelData.nodes.find(n => n.id === edge[0]);
        const n2 = currentLevelData.nodes.find(n => n.id === edge[1]);
        const isCurrentEdge = (robotState.currentNodeId === n1.id || robotState.currentNodeId === n2.id);

        if (isCurrentEdge) {
          const p1 = P(n1.x, n1.y, n1.z);
          const p2 = P(n2.x, n2.y, n2.z);

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 3.5 * scaleFactor;
          ctx.setLineDash([6 * scaleFactor, 4 * scaleFactor]);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.setLineDash([]);

          const pulseT = ((Date.now() * 0.0025) % 1);
          const px = p1.x + (p2.x - p1.x) * pulseT;
          const py = p1.y + (p2.y - p1.y) * pulseT;
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(px, py, 3.5 * scaleFactor, 0, Math.PI * 2);
          ctx.fill();
        }
      });"""

# Also enhance drawPlatform colors to match maps_robo-delivery.png (Soft Lavender 3D Walls + Clean White Walkways)
old_platform_colors = "const shade = isFront ? '#b4c6fd' : '#9db0f5';"
new_platform_colors = "const shade = isFront ? '#c7d2fe' : '#a5b4fc';"

for target in targets:
    if os.path.exists(target):
        with open(target, "r", encoding="utf-8") as f:
            content = f.read()

        if old_track_block in content:
            content = content.replace(old_track_block, new_track_block)

        if old_platform_colors in content:
            content = content.replace(old_platform_colors, new_platform_colors)

        with open(target, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {target}")

