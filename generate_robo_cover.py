from PIL import Image, ImageDraw, ImageFont
import os
import math

target_dirs = [
    r"d:\project-26\RoboMind\public\robo-bros\assets",
    r"d:\project-26\RoboMind\robo-bros\assets"
]

def create_robo_cover():
    width, height = 1200, 600
    img = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # 1. Sky Gradient Background
    for y in range(height):
        r = int(15 + (2 - 15) * (y / float(height)))
        g = int(23 + (132 - 23) * (y / float(height)))
        b = int(42 + (199 - 42) * (y / float(height)))
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Floating Cyber Clouds
    cloud_color = (255, 255, 255, 120)
    clouds = [
        (100, 80, 220, 140),
        (180, 60, 320, 150),
        (850, 100, 990, 160),
        (950, 80, 1120, 170),
    ]
    for c in clouds:
        draw.ellipse(c, fill=(255, 255, 255))

    # 2. Sci-Fi Mecha Platforms
    # Left Platform
    draw.rectangle([60, 340, 420, 600], fill=(30, 41, 59), outline=(15, 23, 42))
    draw.rectangle([60, 340, 420, 360], fill=(22, 163, 74)) # Grass
    draw.rectangle([60, 340, 420, 346], fill=(56, 189, 248)) # Cyan Edge

    # Right Platform
    draw.rectangle([760, 320, 1140, 600], fill=(30, 41, 59), outline=(15, 23, 42))
    draw.rectangle([760, 320, 1140, 340], fill=(22, 163, 74)) # Grass
    draw.rectangle([760, 320, 1140, 326], fill=(56, 189, 248)) # Cyan Edge

    # Middle Platform
    draw.rectangle([480, 440, 720, 600], fill=(30, 41, 59), outline=(15, 23, 42))
    draw.rectangle([480, 440, 720, 456], fill=(22, 163, 74)) # Grass
    draw.rectangle([480, 440, 720, 444], fill=(56, 189, 248)) # Cyan Edge

    # 3. Draw Hero Cyber Robot Mascot on Left Platform
    rx, ry = 240, 260
    # Head
    draw.rectangle([rx - 36, ry - 70, rx + 36, ry - 10], fill=(15, 23, 42), outline=(0, 229, 255), width=4)
    # Antenna
    draw.line([(rx, ry - 70), (rx, ry - 95)], fill=(0, 229, 255), width=4)
    draw.ellipse([rx - 8, ry - 110, rx + 8, ry - 94], fill=(245, 158, 11))
    # Visor
    draw.rectangle([rx - 26, ry - 58, rx + 26, ry - 26], fill=(0, 229, 255))
    draw.ellipse([rx - 18, ry - 50, rx - 6, ry - 34], fill=(255, 255, 255))
    draw.ellipse([rx + 6, ry - 50, rx + 18, ry - 34], fill=(255, 255, 255))

    # Body
    draw.rectangle([rx - 30, ry - 10, rx + 30, ry + 50], fill=(14, 165, 233), outline=(2, 132, 199), width=3)
    # Belt & Power Core
    draw.rectangle([rx - 30, ry + 30, rx + 30, ry + 42], fill=(245, 158, 11))
    draw.ellipse([rx - 12, ry + 4, rx + 12, ry + 28], fill=(52, 211, 153))
    draw.ellipse([rx - 5, ry + 11, rx + 5, ry + 21], fill=(255, 255, 255))

    # Boots
    draw.rectangle([rx - 26, ry + 50, rx - 6, ry + 80], fill=(15, 23, 42))
    draw.rectangle([rx + 6, ry + 50, rx + 26, ry + 80], fill=(15, 23, 42))

    # 4. TITLE TYPOGRAPHY ("ROBOMIND BROS ADVENTURE")
    tx, ty = 600, 110

    # 3D Shadow Text
    draw.text((tx - 246, ty + 6), "ROBOMIND", fill=(9, 20, 40))
    draw.text((tx - 250, ty), "ROBOMIND", fill=(0, 229, 255))

    # Subtitle Badge "BROS ADVENTURE"
    draw.rectangle([tx - 220, ty + 90, tx + 220, ty + 150], fill=(15, 23, 42), outline=(245, 158, 11), width=4)
    draw.text((tx - 200, ty + 98), "BROS ADVENTURE", fill=(245, 158, 11))

    # Sub-tagline
    draw.text((tx - 250, ty + 175), "PETUALANGAN BELAJAR ROBOT", fill=(255, 255, 255))

    return img

cover_img = create_robo_cover()
for target_dir in target_dirs:
    out_path = os.path.join(target_dir, "cover.jpg")
    cover_img.save(out_path, quality=95)
    print(f"Generated new RoboMind cover.jpg into {out_path}")

print("COVER JPG GENERATION COMPLETED!")
