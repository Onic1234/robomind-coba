import os

with open('robo-delivery/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

old_track_code = """      // 7. Track Jalur Node (Clean & Minimalist - Only connected paths near Robot)
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

new_track_code = """      // 7. Track Jalur Node & Path Polyline (Following exact maze corridors & stairs)
      currentLevelData.edges.forEach(edge => {
        const n1 = currentLevelData.nodes.find(n => n.id === edge[0]);
        const n2 = currentLevelData.nodes.find(n => n.id === edge[1]);
        const isConnectedToRobot = (robotState.currentNodeId === n1.id || robotState.currentNodeId === n2.id);

        if (isConnectedToRobot) {
          const p1 = P(n1.x, n1.y, n1.z);
          const p2 = P(n2.x, n2.y, n2.z);

          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 2.5 * scaleFactor;
          ctx.setLineDash([4 * scaleFactor, 4 * scaleFactor]);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw active queued path polyline (if path exists)
      const fullPath = [robotState.currentNodeId, ...(robotState.pathQueue || [])];
      if (robotState.isMoving && robotState.targetNodeId !== null && !fullPath.includes(robotState.targetNodeId)) {
        fullPath.splice(1, 0, robotState.targetNodeId);
      }

      if (fullPath.length >= 2) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 4 * scaleFactor;
        ctx.setLineDash([6 * scaleFactor, 4 * scaleFactor]);
        ctx.beginPath();
        
        for (let i = 0; i < fullPath.length; i++) {
          const node = currentLevelData.nodes.find(n => n.id === fullPath[i]);
          if (node) {
            const p = P(node.x, node.y, node.z);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }"""

if old_track_code in html:
    html = html.replace(old_track_code, new_track_code)
    with open('robo-delivery/index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Updated track rendering code in index.html!")
else:
    print("WARNING: Could not find exact old track code block in index.html")
