import os
import re

def update_tsx_file(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    orig = content

    # 1. Replace bracketed button texts
    content = content.replace("[ Kembali Ke Menu Utama ]", "Kembali Ke Menu Utama")
    content = content.replace("[ Kembali Ke Peta Utama ]", "Kembali Ke Peta Utama")
    content = content.replace("[ CONTINUE (Lanjut Level) ➔ ]", "Lanjut Level ➔")
    content = content.replace("[ CONTINUE (Lanjut Level) → ]", "Lanjut Level ➔")
    content = content.replace("[ MAIN LAGI 🎮 ]", "Main Lagi 🎮")
    content = content.replace("[ CONTINUE ]", "Lanjut Level ➔")

    # Regex for remaining [ Text ] button labels in JSX
    content = re.sub(r'>\s*\[\s*Kembali([^\n\]]*)\s*\]\s*<', r'>Kembali\1<', content)
    content = re.sub(r'>\s*\[\s*CONTINUE([^\n\]]*)\s*\]\s*<', r'>Lanjut Level ➔<', content)

    # 2. Check modalOverlay wrapped in ScrollView if needed
    # Ensure ScrollView is imported
    if "ScrollView" not in content and "react-native" in content:
        content = re.sub(r'import\s*\{\s*', 'import { ScrollView, ', content, count=1)

    if content != orig:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated TSX file: {file_path}")

tsx_files = [
    "d:/project-26/RoboMind/app/robo-link.tsx",
    "d:/project-26/RoboMind/app/screw-spin.tsx",
    "d:/project-26/RoboMind/app/robo-circle.tsx",
    "d:/project-26/RoboMind/app/robo-charge.tsx",
    "d:/project-26/RoboMind/app/robot-circuit-puzzle.tsx",
    "d:/project-26/RoboMind/app/energy-core.tsx",
    "d:/project-26/RoboMind/app/robot-escape.tsx",
    "d:/project-26/RoboMind/app/pick-and-drop.tsx",
    "d:/project-26/RoboMind/app/rogue-soul.tsx"
]

for tf in tsx_files:
    update_tsx_file(tf)
