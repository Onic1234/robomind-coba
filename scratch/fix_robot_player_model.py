import os, shutil

src_html = r"d:\project-26\RoboMind\public\robo-delivery\index.html"

with open(src_html, "r", encoding="utf-8") as f:
    code = f.read()

robot_model_code = """    // Cute Robot Player Model (Cyan & Gold Futuristic Delivery Bot)
    function drawRobotPlayerModel(rx, ry) {
      ctx.save();
      const s = scaleFactor || 1.0;
      const hoverBob = Math.sin(Date.now() * 0.008) * 3 * s;
      const x = rx;
      const y = ry + hoverBob;

      // Robot Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      try { ctx.ellipse(rx, ry + 4 * s, 10 * s, 4.5 * s, 0, 0, Math.PI * 2); } catch(e) {}
      ctx.fill();

      // Robot Body (Cyan/Sky Blue Futuristic Capsule)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(x - 9 * s, y - 24 * s, 18 * s, 22 * s, 6 * s);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.8 * s;
      ctx.stroke();

      // Screen Face / Visor (Dark Blue)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(x - 7 * s, y - 20 * s, 14 * s, 10 * s, 3 * s);
      ctx.fill();

      // Glowing Cyan Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(x - 3.5 * s, y - 15 * s, 2 * s, 0, Math.PI * 2);
      ctx.arc(x + 3.5 * s, y - 15 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();

      // Antenna
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(x, y - 24 * s);
      ctx.lineTo(x, y - 29 * s);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x, y - 30 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // Carrying Food Icon Bubble
      if (robotState && robotState.carryingFood) {
        ctx.font = `${Math.round(18 * s)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(robotState.carryingFood.icon, x, y - 34 * s);
      }

      ctx.restore();
    }"""

# Insert drawRobotPlayerModel before _renderGameInternal
render_marker = "function _renderGameInternal() {"
if render_marker in code and "drawRobotPlayerModel" not in code:
    code = code.replace(render_marker, robot_model_code + "\n\n    " + render_marker)
    print("SUCCESS: Added drawRobotPlayerModel function!")

# Replace line 1703: drawRobotPlayer(robotState.x, robotState.y, robotState.z);
old_player_draw = "      // 12. Player robot\n      drawRobotPlayer(robotState.x, robotState.y, robotState.z);"

new_player_draw = """      // 12. Player robot (Map Aligned Movement)
      const fromNode = currentLevelData.nodes.find(n => n.id === robotState.currentNodeId);
      const toNode = (robotState.targetNodeId !== null && robotState.targetNodeId !== undefined) ? currentLevelData.nodes.find(n => n.id === robotState.targetNodeId) : fromNode;

      let currX = fromNode ? fromNode.x : 20.5;
      let currY = fromNode ? fromNode.y : 22;

      if (robotState.isMoving && fromNode && toNode) {
        currX = fromNode.x + (toNode.x - fromNode.x) * robotState.moveProgress;
        currY = fromNode.y + (toNode.y - fromNode.y) * robotState.moveProgress;
      }

      const rp = P(currX, currY);
      drawRobotPlayerModel(rp.x, rp.y);"""

if old_player_draw in code:
    code = code.replace(old_player_draw, new_player_draw)
    print("SUCCESS: Replaced old drawRobotPlayer with map-aligned player draw!")
else:
    # Fallback search for drawRobotPlayer
    for line in code.splitlines():
        if "drawRobotPlayer(" in line:
            code = code.replace(line, new_player_draw)
            print(f"SUCCESS: Replaced '{line.strip()}' with new_player_draw!")
            break

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
    print(f"Synchronized robot player model HTML to {t}")
