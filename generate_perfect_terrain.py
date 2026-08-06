from PIL import Image, ImageDraw
import os
import math

target_dirs = [
    r"d:\project-26\RoboMind\public\robo-bros\assets",
    r"d:\project-26\RoboMind\robo-bros\assets"
]

def ensure_dirs():
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)

ensure_dirs()

# ----------------------------------------------------
# 1. PERFECT SKY & CLOUDS BACKGROUND (bg.png - 128x128)
# Clear sky with soft cyber clouds so gaps & platforms are 100% visible!
# ----------------------------------------------------
def create_perfect_bg():
    img = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Rich Sky Blue / Cyber Twilight Gradient
    for y in range(128):
        # Gradient from #0284C7 to #38BDF8
        r = int(2 + (56 - 2) * (y / 128.0))
        g = int(132 + (189 - 132) * (y / 128.0))
        b = int(199 + (248 - 199) * (y / 128.0))
        draw.line([(0, y), (128, y)], fill=(r, g, b, 255))

    # Soft Stylized Floating Cyber Clouds
    cloud_color = (255, 255, 255, 110)
    # Cloud 1
    draw.ellipse([10, 20, 50, 40], fill=cloud_color)
    draw.ellipse([30, 15, 70, 45], fill=cloud_color)
    # Cloud 2
    draw.ellipse([70, 70, 110, 90], fill=cloud_color)
    draw.ellipse([85, 65, 125, 95], fill=cloud_color)

    return img

# ----------------------------------------------------
# 2. PERFECT PLATFORM TILESET (terrain.png - 512x512 = 16x16 grid of 32x32 tiles)
# ----------------------------------------------------
def create_perfect_terrain():
    img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    tile_w, tile_h = 32, 32
    cols, rows = 16, 16

    # 16x16 Grid
    for r in range(rows):
        for c in range(cols):
            x0, y0 = c * tile_w, r * tile_h
            x1, y1 = x0 + tile_w - 1, y0 + tile_h - 1

            # TOP SURFACE TILES (Only row 0 has the top green/cyan grass layer!)
            if r == 0:
                # Body: Rich Tech Slate Stone
                draw.rectangle([x0, y0, x1, y1], fill=(30, 41, 59, 255))
                # Stone Bevel Lines
                draw.rectangle([x0 + 1, y0 + 1, x1 - 1, y1 - 1], fill=(51, 65, 85, 255), outline=(15, 23, 42, 255))

                # TOP SURFACE GRASS / CYBER GREEN RIM (Only on top 10px!)
                draw.rectangle([x0, y0, x1, y0 + 9], fill=(22, 163, 74, 255)) # Rich Emerald Green
                draw.rectangle([x0, y0, x1, y0 + 4], fill=(34, 197, 94, 255)) # Vibrant Lime Green
                draw.rectangle([x0, y0, x1, y0 + 1], fill=(56, 189, 248, 255)) # Cyan Highlight Edge!

                # Grass Tufts hanging down
                for g in range(x0 + 2, x1 - 2, 6):
                    draw.polygon([(g, y0 + 9), (g + 3, y0 + 14), (g + 5, y0 + 9)], fill=(22, 163, 74, 255))

            # MIDDLE FILLER TILES (Rows 1 to 15: NO TOP GRASS LINES! Pure Solid Stone Bricks)
            else:
                # Body Base: Dark Slate Stone
                draw.rectangle([x0, y0, x1, y1], fill=(30, 41, 59, 255))
                # Brick Pattern
                draw.rectangle([x0 + 1, y0 + 1, x1 - 1, y1 - 1], fill=(47, 63, 94, 255), outline=(15, 23, 42, 255))

                # Brick seam lines
                if (r + c) % 2 == 0:
                    draw.line([(x0 + 16, y0 + 1), (x0 + 16, y1 - 1)], fill=(15, 23, 42, 255), width=1)
                
                draw.line([(x0 + 1, y0 + 16), (x1 - 1, y0 + 16)], fill=(15, 23, 42, 255), width=1)
                
                # Subtle Stone texture highlights
                draw.line([(x0 + 2, y0 + 2), (x1 - 2, y0 + 2)], fill=(71, 85, 105, 255), width=1)

            # Outer border line for maximum gap/hole visibility!
            draw.rectangle([x0, y0, x1, y1], outline=(15, 23, 42, 255), width=1)

    return img

# ----------------------------------------------------
# 3. HIGH-VISIBILITY ENEMY OBSTACLES (enemy1Idle, enemy1Run, enemy1Hit)
# ----------------------------------------------------
def create_enemy_frame(frame_idx, total_frames, action="idle"):
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi

    cx, cy = 16, 18
    y_off = int(round(math.sin(t) * 1.0)) if action == "idle" else 0
    is_hit = action == "hit"

    cy += y_off

    # Shadow (compact)
    draw.ellipse([8, 27, 24, 30], fill=(0, 0, 0, 140))

    # Treads / Small Wheels
    tread_dx = int(round(math.sin(t * 3) * 1.5)) if action == "run" else 0
    draw.rectangle([8, cy + 4, 24, cy + 8], fill=(15, 23, 42, 255), outline=(245, 158, 11, 255))
    for wx in range(10 + tread_dx, 23, 5):
        if 8 <= wx <= 23:
            draw.ellipse([wx - 1, cy + 5, wx + 1, cy + 7], fill=(245, 158, 11, 255))

    # Compact Red Mecha Drone Body (width: 16px, height: 10px)
    body_bbox = [8, cy - 5, 24, cy + 4]
    draw.rectangle(body_bbox, fill=(239, 68, 68, 255), outline=(255, 255, 255, 255))

    # Single Top Antenna Spike
    draw.polygon([(14, cy - 5), (16, cy - 10), (18, cy - 5)], fill=(245, 158, 11, 255), outline=(255, 255, 255, 255))

    # Glowing Yellow Visor Eye
    eye_color = (255, 255, 255, 255) if is_hit else (254, 240, 138, 255)
    draw.rectangle([10, cy - 3, 22, cy + 2], fill=(15, 23, 42, 255), outline=(255, 255, 255, 255))
    draw.rectangle([12, cy - 2, 20, cy + 1], fill=eye_color)

    # Pupil
    if not is_hit:
        draw.rectangle([15, cy - 1, 17, cy + 1], fill=(239, 68, 68, 255))

    return img

def generate_enemy_sheet(num_frames, action):
    sheet = Image.new("RGBA", (32 * num_frames, 32), (0, 0, 0, 0))
    for i in range(num_frames):
        f = create_enemy_frame(i, num_frames, action)
        sheet.paste(f, (i * 32, 0))
    return sheet

# ----------------------------------------------------
# 4. HIGH-VISIBILITY ITEMS (Strawberry -> Energy Gem, Kiwi -> Gold Microchip)
# ----------------------------------------------------
def create_item_gem_frame(frame_idx, total_frames):
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi

    y_off = int(round(math.sin(t) * 2))
    cx, cy = 16, 16 + y_off

    # Outer Glow Ring
    draw.ellipse([cx - 11, cy - 11, cx + 11, cy + 11], fill=(56, 189, 248, 80))

    # Vibrant Cyan Gem with White Border
    draw.polygon([
        (cx, cy - 11),
        (cx + 9, cy),
        (cx, cy + 11),
        (cx - 9, cy)
    ], fill=(6, 182, 212, 255), outline=(255, 255, 255, 255))

    draw.polygon([
        (cx, cy - 11),
        (cx + 4, cy),
        (cx, cy + 11),
        (cx - 4, cy)
    ], fill=(255, 255, 255, 220))

    return img

def create_item_chip_frame(frame_idx, total_frames):
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi

    y_off = int(round(math.cos(t) * 2))
    cx, cy = 16, 16 + y_off

    # Shiny Gold Microchip with White Outline
    draw.rectangle([cx - 9, cy - 9, cx + 9, cy + 9], fill=(245, 158, 11, 255), outline=(255, 255, 255, 255))

    # Gold Pins
    for p in range(cx - 7, cx + 8, 4):
        draw.line([(p, cy - 12), (p, cy - 9)], fill=(254, 240, 138, 255), width=2)
        draw.line([(p, cy + 9), (p, cy + 12)], fill=(254, 240, 138, 255), width=2)

    # Green Core
    draw.rectangle([cx - 5, cy - 5, cx + 5, cy + 5], fill=(16, 185, 129, 255))
    draw.rectangle([cx - 2, cy - 2, cx + 2, cy + 2], fill=(255, 255, 255, 255))

    return img

def generate_item_sheet(num_frames, item_type):
    sheet = Image.new("RGBA", (32 * num_frames, 32), (0, 0, 0, 0))
    for i in range(num_frames):
        if item_type == "gem":
            f = create_item_gem_frame(i, num_frames)
        else:
            f = create_item_chip_frame(i, num_frames)
        sheet.paste(f, (i * 32, 0))
    return sheet

# ----------------------------------------------------
# 5. FLAG BEACON (Flag.png)
# ----------------------------------------------------
def create_flag_frame(frame_idx, total_frames):
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi

    # Base
    draw.ellipse([14, 50, 50, 62], fill=(15, 23, 42, 255), outline=(255, 255, 255, 255))
    draw.ellipse([20, 54, 44, 58], fill=(56, 189, 248, 255))

    # Pole
    draw.line([(32, 8), (32, 54)], fill=(255, 255, 255, 255), width=4)
    draw.ellipse([28, 4, 36, 12], fill=(245, 158, 11, 255))

    # Flag
    wave = math.sin(t) * 4
    draw.polygon([(32, 10), (58 + wave, 18), (54 + wave, 36), (32, 28)], fill=(6, 182, 212, 230), outline=(255, 255, 255, 255))

    return img

def generate_flag_sheet(num_frames=10):
    sheet = Image.new("RGBA", (64 * num_frames, 64), (0, 0, 0, 0))
    for i in range(num_frames):
        f = create_flag_frame(i, num_frames)
        sheet.paste(f, (i * 64, 0))
    return sheet

# Execute Generation
bg_img = create_perfect_bg()
terrain_img = create_perfect_terrain()
enemy_idle = generate_enemy_sheet(14, "idle")
enemy_run = generate_enemy_sheet(16, "run")
enemy_hit = generate_enemy_sheet(5, "hit")
gem_items = generate_item_sheet(17, "gem")
chip_items = generate_item_sheet(17, "chip")
flag_img = generate_flag_sheet(10)

for target_dir in target_dirs:
    bg_img.save(os.path.join(target_dir, "bg.png"))
    terrain_img.save(os.path.join(target_dir, "terrain.png"))
    enemy_idle.save(os.path.join(target_dir, "enemy1Idle.png"))
    enemy_run.save(os.path.join(target_dir, "enemy1Run.png"))
    enemy_hit.save(os.path.join(target_dir, "enemy1Hit.png"))
    gem_items.save(os.path.join(target_dir, "Strawberry.png"))
    chip_items.save(os.path.join(target_dir, "Kiwi.png"))
    flag_img.save(os.path.join(target_dir, "Flag.png"))
    print(f"Updated perfect platformer assets into {target_dir}")

print("PERFECT PLATFORMER ASSETS SUCCESSFULLY CREATED!")
