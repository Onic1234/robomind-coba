import os
import re

files = [
    "d:/project-26/RoboMind/index.html",
    "d:/project-26/RoboMind/app/index.html",
    "d:/project-26/RoboMind/public/index.html",
    "d:/project-26/RoboMind/public/app-home.html"
]

# Exact regex targeting only the Master Pose game-item div block
pattern = re.compile(
    r'\s*<!--\s*Square Game Card:\s*Master Pose\s*-->\s*<div[^>]*class="game-item[^>]*>.*?alt="Master Pose".*?</div>\s*</div>\s*</div>',
    re.DOTALL
)

for fpath in files:
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    new_content, count = pattern.subn('', content)
    if count > 0:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Safely removed Master Pose ({count} match) from {fpath}")
    else:
        print(f"No match for regex in {fpath}")
