from PIL import Image, ImageDraw
import os
import math
import random

target_dirs = [
    r"d:\project-26\RoboMind\public\robo-bros\assets",
    r"d:\project-26\RoboMind\robo-bros\assets"
]

def ensure_dirs():
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)

ensure_dirs()

# ----------------------------------------------------
# 1. VIBRANT DEEP CYBER BLUE SKY BACKGROUND (bg.png - 128x128)
# ----------------------------------------------------
def create_vibrant_blue_bg():
    img = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rich Deep Cyber Blue Gradient: #0B192C -> #1D4ED8 -> #3B82F6
    for y in range(128):
        factor = y / 128.0
        r = int(11 + (29 - 11) * factor)
        g = int(25 + (78 - 25) * factor)
        b = int(44 + (216 - 44) * factor)
        draw.line([(0, y), (128, y)], fill=(r, g, b, 255))

    # Glowing Vibrant City Skyline Silhouette
    city_buildings = [
        (0, 70, 20, 128),
        (15, 55, 35, 128),
        (32, 65, 52, 128),
        (48, 45, 70, 128),
        (66, 60, 88, 128),
        (84, 50, 105, 128),
        (100, 68, 128, 128),
    ]

    for bx0, by0, bx1, by1 in city_buildings:
        draw.rectangle([bx0, by0, bx1, by1], fill=(15, 30, 60, 255), outline=(56, 189, 248, 150))
        # Windows with neon cyan, gold, and pink!
        for wy in range(by0 + 6, by1 - 6, 8):
            for wx in range(bx0 + 4, bx1 - 4, 6):
                if (wx + wy) % 3 == 0:
                    win_color = (0, 245, 255, 220) if (wx % 2 == 0) else (255, 215, 0, 220)
                    draw.rectangle([wx, wy, wx + 3, wy + 4], fill=win_color)

    # Glowing Cyan & Gold Stars
    random.seed(101)
    for _ in range(28):
        sx = random.randint(0, 127)
        sy = random.randint(0, 45)
        scolor = (0, 245, 255, random.randint(180, 255)) if random.random() > 0.3 else (255, 215, 0, 220)
        draw.point((sx, sy), fill=scolor)

    return img

# ----------------------------------------------------
# 2. VIBRANT ELECTRIC BLUE TILES (terrain.png - 512x512 = 16x16 grid of 32x32 tiles)
# ----------------------------------------------------
def create_vibrant_blue_terrain():
    img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    tile_w, tile_h = 32, 32
    cols, rows = 16, 16

    for r in range(rows):
        for c in range(cols):
            x0, y0 = c * tile_w, r * tile_h
            x1, y1 = x0 + tile_w - 1, y0 + tile_h - 1

            # TOP SURFACE TILES (Row 0 has vibrant Electric Cyan & Emerald Techno Grass)
            if r == 0:
                # Body: Rich Metallic Sapphire Slate
                draw.rectangle([x0, y0, x1, y1], fill=(15, 32, 67, 255))
                draw.rectangle([x0 + 1, y0 + 1, x1 - 1, y1 - 1], fill=(30, 58, 110, 255), outline=(10, 20, 45, 255))

                # TOP SURFACE GLOWING ELECTRIC CYAN & LIME GREEN RIM
                draw.rectangle([x0, y0, x1, y0 + 9], fill=(16, 185, 129, 255)) # Emerald Green
                draw.rectangle([x0, y0, x1, y0 + 5], fill=(34, 211, 238, 255)) # Vibrant Cyan
                draw.rectangle([x0, y0, x1, y0 + 2], fill=(255, 255, 255, 255)) # White Core Specular Highlight!

                # Hanging Tech Grass Tufts
                for g in range(x0 + 2, x1 - 2, 5):
                    draw.polygon([(g, y0 + 9), (g + 2, y0 + 14), (g + 4, y0 + 9)], fill=(16, 185, 129, 255))

                # Glowing Side Trim Lines
                draw.line([(x0, y0), (x0, y1)], fill=(0, 245, 255, 255), width=2)
                draw.line([(x1, y0), (x1, y1)], fill=(0, 245, 255, 255), width=2)

            # INNER FILLER TILES (Rows 1 to 15: Rich Sapphire Blue Tech Brick with Electric Outlines)
            else:
                # Body Base: Deep Sapphire Tech Metal
                draw.rectangle([x0, y0, x1, y1], fill=(15, 32, 67, 255))
                draw.rectangle([x0 + 1, y0 + 1, x1 - 1, y1 - 1], fill=(28, 52, 98, 255), outline=(10, 20, 45, 255))

                # Circuit Brick seam lines with Electric Cyan Accents
                if (r + c) % 2 == 0:
                    draw.line([(x0 + 16, y0 + 1), (x0 + 16, y1 - 1)], fill=(10, 20, 45, 255), width=1)
                
                draw.line([(x0 + 1, y0 + 16), (x1 - 1, y0 + 16)], fill=(10, 20, 45, 255), width=1)

                # Vibrant Blue Specular Edge Line
                draw.line([(x0 + 2, y0 + 2), (x1 - 2, y0 + 2)], fill=(56, 189, 248, 200), width=1)

                # Glowing Side Borders
                draw.line([(x0, y0), (x0, y1)], fill=(0, 245, 255, 255), width=2)
                draw.line([(x1, y0), (x1, y1)], fill=(0, 245, 255, 255), width=2)

            # Outer Border
            draw.rectangle([x0, y0, x1, y1], outline=(10, 20, 45, 255), width=1)

    return img

bg_img = create_vibrant_blue_bg()
terrain_img = create_vibrant_blue_terrain()

for target_dir in target_dirs:
    if os.path.exists(target_dir):
        bg_img.save(os.path.join(target_dir, "bg.png"))
        terrain_img.save(os.path.join(target_dir, "terrain.png"))
        print(f"Updated vibrant blue world assets into {target_dir}")

print("VIBRANT BLUE WORLD ASSETS CREATED SUCCESSFULLY!")
