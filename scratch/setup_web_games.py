import os
import shutil

public_dir = os.path.join("public")
web_games_dir = os.path.join("public", "web-games")

game_folders = ["robo-pose", "robo-jek", "robo-delivery", "robo-maze", "robo-bros"]

os.makedirs(web_games_dir, exist_ok=True)

for folder in game_folders:
    src = os.path.join(public_dir, folder)
    dest = os.path.join(web_games_dir, folder)
    if os.path.exists(src):
        if os.path.exists(dest):
            shutil.rmtree(dest)
        shutil.copytree(src, dest)
        print(f"Copied {src} -> {dest}")

print("web-games setup complete!")
