import os, shutil

src_img = r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2\.user_uploaded\media_1788617894779.png"

dest1 = r"d:\project-26\RoboMind\public\robo-delivery\maps_robo-delivery2.png"
dest2 = r"d:\project-26\RoboMind\public\web-games\robo-delivery\maps_robo-delivery2.png"
dest3 = r"d:\project-26\RoboMind\assets\images\maps_robo-delivery2.png"

if os.path.exists(src_img):
    shutil.copy(src_img, dest1)
    shutil.copy(src_img, dest2)
    shutil.copy(src_img, dest3)
    print("Successfully copied maps_robo-delivery2.png to public/robo-delivery, public/web-games/robo-delivery, and assets!")
else:
    print(f"Source image not found: {src_img}")

html_targets = [
    r"d:\project-26\RoboMind\public\robo-delivery\index.html",
    r"d:\project-26\RoboMind\public\web-games\robo-delivery\index.html",
]

for target in html_targets:
    if os.path.exists(target):
        with open(target, "r", encoding="utf-8") as f:
            code = f.read()

        code = code.replace('maps_robo-delivery.jpg', 'maps_robo-delivery2.png')

        with open(target, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"Updated image src in {target}")

