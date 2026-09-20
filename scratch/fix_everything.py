import os
import json
import subprocess

# 1. Read robo-delivery/index.html
with open('robo-delivery/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Check missing global variable declarations
missing_vars = []
if 'const robotState =' not in html and 'let robotState =' in html and 'var robotState =' not in html:
    missing_vars.append('robotState')

print("Checking index.html...")

# Let's inspect where robotState should be declared.
# Near top of script:
globals_block = """
    /* ==========================================================================
       GLOBAL GAME VARIABLES & STATE
       ========================================================================== */
    let isGameRunning = false;
    let timerInterval = null;
    let currentLevelIndex = 0;
    let currentLevelData = null;

    const robotState = {
      currentNodeId: 0,
      prevNodeId: 0,
      targetNodeId: null,
      isMoving: false,
      moveProgress: 0,
      carryingFood: null,
      bumpAnim: 0,
      x: 0,
      y: 0,
      z: 0
    };
"""

# Let's check if robotState is in html
if 'const robotState =' not in html and 'let robotState =' not in html:
    print("Adding robotState and global variables to robo-delivery/index.html...")
    target_substr = "let hoveredNodeId = null;\n"
    if target_substr in html:
        html = html.replace(target_substr, target_substr + globals_block)
    else:
        # insert after <script>
        script_idx = html.find('<script>') + len('<script>')
        html = html[:script_idx] + globals_block + html[script_idx:]

with open('robo-delivery/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated robo-delivery/index.html successfully!")
