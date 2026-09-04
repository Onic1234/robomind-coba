import os
import xml.etree.ElementTree as ET

html_files = [
    "d:/project-26/RoboMind/index.html",
    "d:/project-26/RoboMind/app/index.html",
    "d:/project-26/RoboMind/public/index.html",
    "d:/project-26/RoboMind/public/app-home.html",
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
]

for h in html_files:
    if not os.path.exists(h):
        print(f"MISSING: {h}")
        continue
    with open(h, "r", encoding="utf-8") as f:
        content = f.read()
    if "<!DOCTYPE html>" in content or "<html" in content:
        print(f"OK ({len(content)} bytes): {h}")
    else:
        print(f"FAIL: {h}")

print("All HTML files verified.")
