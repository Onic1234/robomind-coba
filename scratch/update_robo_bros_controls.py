import os
import shutil

# 1. Update public/robo-bros/index.html
with open('public/robo-bros/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace <div class="touch-controls"> with <div class="touch-controls" id="touchControls" style="display: none;">
html = html.replace('<div class="touch-controls">', '<div class="touch-controls" id="touchControls" style="display: none;">')

with open('public/robo-bros/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated public/robo-bros/index.html")

# 2. Update public/robo-bros/js/game.js
with open('public/robo-bros/js/game.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Helper definition
touch_ctrl_helper = """
function setTouchControlsVisible(visible) {
	var ctrl = document.getElementById("touchControls");
	if (ctrl) {
		ctrl.style.display = visible ? "flex" : "none";
	}
}
"""

if 'function setTouchControlsVisible' not in js:
    # insert before startScreen
    js = js.replace('function startScreen(){', touch_ctrl_helper + '\nfunction startScreen(){\n\tsetTouchControlsVisible(false);')
    js = js.replace('function halamanCover(){', 'function halamanCover(){\n\tsetTouchControlsVisible(false);')
    js = js.replace('function mulaiPermainan(){', 'function mulaiPermainan(){\n\tsetTouchControlsVisible(true);')
    js = js.replace('function ulangiPermainan(){\t', 'function ulangiPermainan(){\t\n\tsetTouchControlsVisible(true);')
    js = js.replace('function showBrosResultModal(isWin) {', 'function showBrosResultModal(isWin) {\n\tsetTouchControlsVisible(false);')
    js = js.replace('function exitToCover() {', 'function exitToCover() {\n\tsetTouchControlsVisible(false);')
    
    with open('public/robo-bros/js/game.js', 'w', encoding='utf-8') as f:
        f.write(js)
    print("Updated public/robo-bros/js/game.js")

# 3. Synchronize files across all targets
sync_targets = [
    ('public/robo-bros/index.html', 'robo-bros/index.html'),
    ('public/robo-bros/js/game.js', 'robo-bros/js/game.js'),
    ('public/robo-bros/index.html', 'public/web-games/robo-bros/index.html'),
    ('public/robo-bros/js/game.js', 'public/web-games/robo-bros/js/game.js'),
    ('public/robo-bros/index.html', 'dist/robo-bros/index.html'),
    ('public/robo-bros/js/game.js', 'dist/robo-bros/js/game.js'),
    ('public/robo-bros/index.html', 'dist/web-games/robo-bros/index.html'),
    ('public/robo-bros/js/game.js', 'dist/web-games/robo-bros/js/game.js'),
]

for src, dest in sync_targets:
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    shutil.copy2(src, dest)
    print(f"Synced {src} -> {dest}")

print("All Robo Bros files synced successfully!")
