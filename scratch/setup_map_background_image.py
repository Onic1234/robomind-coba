import os, shutil

src_img = r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2\.user_uploaded\media_1788617503669.jpg"

dest1 = r"d:\project-26\RoboMind\public\robo-delivery\maps_robo-delivery.jpg"
dest2 = r"d:\project-26\RoboMind\public\web-games\robo-delivery\maps_robo-delivery.jpg"
dest3 = r"d:\project-26\RoboMind\assets\images\maps_robo-delivery.jpg"

if os.path.exists(src_img):
    shutil.copy(src_img, dest1)
    shutil.copy(src_img, dest2)
    shutil.copy(src_img, dest3)
    print("Successfully copied map illustration image to public/robo-delivery, public/web-games/robo-delivery, and assets!")
else:
    print(f"Source image not found: {src_img}")

