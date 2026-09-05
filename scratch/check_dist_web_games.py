import os

dist_html = os.path.join("dist", "web-games", "robo-pose", "index.html")
print(f"Checking {dist_html}: {os.path.exists(dist_html)}")

if os.path.exists(dist_html):
    with open(dist_html, "r", encoding="utf-8") as f:
        content = f.read(300)
    print(f"Content snippet:\n{content}")
