import os
import re

files = [
    "d:/project-26/RoboMind/index.html",
    "d:/project-26/RoboMind/app/index.html",
    "d:/project-26/RoboMind/public/index.html",
    "d:/project-26/RoboMind/public/app-home.html"
]

for fpath in files:
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    # Remove remnant Master Pose card block up to Robo Pose card
    pattern = r'\s*<!--\s*Info & Action\s*-->\s*<div class="flex flex-col gap-1 w-full">\s*<span[^>]*>AI Kamera</span>\s*<h4[^>]*>Master Pose</h4>\s*<button onclick="openGame\(\'/pose-master\'\)"[^>]*>.*?</button>\s*</div>\s*</div>'
    content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    # Also cleanup leftover closing divs if any
    pattern2 = r'</div>\s*</div>\s*<!-- Info & Action -->\s*<div class="flex flex-col gap-1 w-full">\s*<span[^>]*>AI Kamera</span>.*?</button>\s*</div>\s*</div>'
    content = re.sub(pattern2, '', content, flags=re.DOTALL)

    # Simple fallback: if "Master Pose" is still present
    lines = content.splitlines()
    new_lines = []
    skip = False
    for line in lines:
        if 'alt="Master Pose"' in line or 'Master Pose</h4>' in line or "openGame('/pose-master')" in line or "AI Kamera</span>" in line:
            continue
        new_lines.append(line)
    
    final_content = "\n".join(new_lines)
    with open(fpath, "w", encoding="utf-8") as f:
        f.write(final_content)
    print(f"Cleaned {fpath}")
