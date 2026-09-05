import os
import re

def update_html_modal(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    orig_content = content

    # 1. Remove bracketed text from button texts
    content = content.replace("[ Kembali Ke Peta Utama ]", "Kembali Ke Peta Utama")
    content = content.replace("[ Kembali Ke Menu Utama ]", "Kembali Ke Menu Utama")
    content = content.replace("[ CONTINUE (Lanjut Level) ➔ ]", "Lanjut Level ➔")
    content = content.replace("[ CONTINUE (Lanjut Level) → ]", "Lanjut Level ➔")
    content = content.replace("[ MAIN LAGI 🎮 ]", "Main Lagi 🎮")
    content = re.sub(r'\[\s*Kembali[^\n\]]*\]', 'Kembali Ke Peta Utama', content)
    content = re.sub(r'\[\s*CONTINUE[^\n\]]*\]', 'Lanjut Level ➔', content)

    # 2. Add max-h-[92vh] overflow-y-auto to resultModal cards if Tailwind or CSS inline
    # For inline style result modal cards:
    content = re.sub(
        r'(id="resultModal"[^>]*>[\s\n]*<div style=")([^"]*)',
        lambda m: m.group(1) + "max-height: 92vh; overflow-y: auto; " + m.group(2) if "max-height" not in m.group(2) else m.group(0),
        content
    )
    content = re.sub(
        r'(id="gameModal"[^>]*class="[^"]* backdrop-blur-[^"]* hidden [^"]*">[\s\n]*<div class=")([^"]*)',
        lambda m: m.group(1) + "max-h-[92vh] overflow-y-auto " + m.group(2) if "max-h" not in m.group(2) else m.group(0),
        content
    )
    content = re.sub(
        r'(id="resultModal"[^>]*class="[^"]* hidden [^"]*">[\s\n]*<div class=")([^"]*)',
        lambda m: m.group(1) + "max-h-[92vh] overflow-y-auto " + m.group(2) if "max-h" not in m.group(2) else m.group(0),
        content
    )

    if content != orig_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated HTML modal in {file_path}")

html_files = [
    "d:/project-26/RoboMind/public/robo-bros/index.html",
    "d:/project-26/RoboMind/public/robo-jek/index.html",
    "d:/project-26/RoboMind/public/robo-maze/index.html",
    "d:/project-26/RoboMind/public/robo-delivery/index.html",
    "d:/project-26/RoboMind/public/robo-pose/index.html",
    "d:/project-26/RoboMind/robo-bros/index.html",
    "d:/project-26/RoboMind/robo-jek/index.html",
    "d:/project-26/RoboMind/robo-maze/index.html",
    "d:/project-26/RoboMind/robo-delivery/index.html",
    "d:/project-26/RoboMind/robo-pose/index.html",
    "d:/project-26/RoboMind/app/PickAndDrop.html"
]

for hf in html_files:
    update_html_modal(hf)

# Also copy public versions of html games to root folder counterparts so both are perfectly synced
import shutil

sync_pairs = [
    ("d:/project-26/RoboMind/public/robo-bros", "d:/project-26/RoboMind/robo-bros"),
    ("d:/project-26/RoboMind/public/robo-jek", "d:/project-26/RoboMind/robo-jek"),
    ("d:/project-26/RoboMind/public/robo-maze", "d:/project-26/RoboMind/robo-maze"),
    ("d:/project-26/RoboMind/public/robo-delivery", "d:/project-26/RoboMind/robo-delivery"),
    ("d:/project-26/RoboMind/public/robo-pose", "d:/project-26/RoboMind/robo-pose"),
]

for src, dst in sync_pairs:
    if os.path.exists(src) and os.path.exists(dst):
        for item in os.listdir(src):
            s = os.path.join(src, item)
            d = os.path.join(dst, item)
            if os.path.isfile(s):
                shutil.copy2(s, d)
        print(f"Synced {src} -> {dst}")
