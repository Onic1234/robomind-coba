from PIL import Image, ImageDraw
import os
import math
import random

# Directories to update
target_dirs = [
    r"d:\project-26\RoboMind\public\robo-bros\assets",
    r"d:\project-26\RoboMind\robo-bros\assets"
]

def ensure_dirs():
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)

ensure_dirs()

# ----------------------------------------------------
# 1. GENERATE bg.png (128x128 tileable sci-fi background)
# ----------------------------------------------------
def create_cyber_bg():
    img = Image.new("RGBA", (128, 128), (11, 19, 43, 255))
    draw = ImageDraw.Draw(img)

    # Distant digital grid
    grid_color = (28, 42, 86, 120)
    for x in range(0, 128, 16):
        draw.line([(x, 0), (x, 128)], fill=grid_color, width=1)
    for y in range(0, 128, 16):
        draw.line([(0, y), (128, y)], fill=grid_color, width=1)

    # Stars / Constellations
    random.seed(42)
    for _ in range(24):
        sx = random.randint(0, 127)
        sy = random.randint(0, 127)
        brightness = random.randint(150, 255)
        color = (56, 189, 248, brightness) if random.random() > 0.4 else (168, 85, 247, brightness)
        draw.point((sx, sy), fill=color)

    # Neon Horizon Glow Lines
    for y in range(112, 128, 4):
        alpha = int((y - 112) / 16.0 * 180)
        draw.line([(0, y), (128, y)], fill=(0, 229, 255, alpha), width=1)

    return img

# ----------------------------------------------------
# 2. GENERATE terrain.png (512x512 tileset)
# ----------------------------------------------------
def create_cyber_terrain(base_img_path=None):
    # Create 512x512 tileset
    if base_img_path and os.path.exists(base_img_path):
        img = Image.open(base_img_path).convert("RGBA")
    else:
        img = Image.new("RGBA", (512, 512), (0, 0, 0, 0))

    draw = ImageDraw.Draw(img)

    # Tile size is 32x32
    # Recolor top grass tiles (rows 0..3) to Dark Tech Metallic with Cyan Glow Top
    tile_w, tile_h = 32, 32
    cols, rows = 16, 16

    for r in range(rows):
        for c in range(cols):
            x0, y0 = c * tile_w, r * tile_h
            x1, y1 = x0 + tile_w - 1, y0 + tile_h - 1

            # Top surface grass-replacement tiles (rows 0..2)
            if r <= 3:
                # Dark Tech Plate Base
                draw.rectangle([x0, y0, x1, y1], fill=(15, 23, 42, 255))

                # Metallic Rivets / Bevel
                draw.rectangle([x0, y0 + 6, x1, y1], fill=(30, 41, 59, 255))
                draw.line([(x0, y0 + 6), (x1, y0 + 6)], fill=(71, 85, 105, 255), width=1)

                # Top LED Cyan Glowing Circuit Bar
                draw.rectangle([x0, y0, x1, y0 + 5], fill=(0, 229, 255, 255))
                draw.rectangle([x0, y0 + 1, x1, y0 + 3], fill=(255, 255, 255, 255))

                # Circuit nodes
                for i in range(x0 + 4, x1 - 2, 8):
                    draw.point((i, y0 + 10), fill=(56, 189, 248, 255))
                    draw.line([(i, y0 + 10), (i, y0 + 16)], fill=(56, 189, 248, 180), width=1)

            # Deeper dirt-replacement tiles (rows 4..15)
            else:
                draw.rectangle([x0, y0, x1, y1], fill=(15, 23, 42, 255))
                # Tech Grid Lines
                draw.rectangle([x0 + 2, y0 + 2, x1 - 2, y1 - 2], fill=(24, 34, 53, 255), outline=(47, 63, 94, 255))
                # Center rivets
                draw.point((x0 + 4, y0 + 4), fill=(100, 116, 139, 255))
                draw.point((x1 - 4, y0 + 4), fill=(100, 116, 139, 255))
                draw.point((x0 + 4, y1 - 4), fill=(100, 116, 139, 255))
                draw.point((x1 - 4, y1 - 4), fill=(100, 116, 139, 255))

    return img

# ----------------------------------------------------
# 3. GENERATE ENEMY BOTS (enemy1Idle.png, enemy1Run.png, enemy1Hit.png)
# ----------------------------------------------------
def create_enemy_frame(frame_idx, total_frames, action="idle"):
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi

    cx, cy = 16, 16
    y_off = int(round(math.sin(t) * 1.5)) if action == "idle" else 0
    is_hit = action == "hit"

    cy += y_off

    # Shadow
    draw.ellipse([6, 27, 26, 30], fill=(15, 23, 42, 120))

    # Treads / Treads Wheels
    tread_dx = int(round(math.sin(t * 3) * 2)) if action == "run" else 0
    draw.rectangle([6, 22, 26, 27], fill=(30, 41, 59, 255), outline=(15, 23, 42, 255))
    for wx in range(8 + tread_dx, 25, 6):
        if 6 <= wx <= 24:
            draw.ellipse([wx - 2, 23, wx + 2, 26], fill=(245, 158, 11, 255))

    # Drone Mecha Body
    body_color = (220, 38, 38, 255) if not is_hit else (153, 27, 27, 255)
    draw.rectangle([6, cy - 6, 26, cy + 6], fill=body_color, outline=(127, 29, 29, 255))

    # Top Spikes
    draw.polygon([(8, cy - 6), (11, cy - 12), (14, cy - 6)], fill=(71, 85, 105, 255))
    draw.polygon([(14, cy - 6), (16, cy - 14), (18, cy - 6)], fill=(245, 158, 11, 255))
    draw.polygon([(18, cy - 6), (21, cy - 12), (24, cy - 6)], fill=(71, 85, 105, 255))

    # Evil Red/Magenta Visor
    eye_color = (255, 255, 255, 255) if is_hit else (239, 68, 68, 255)
    draw.rectangle([10, cy - 3, 22, cy + 2], fill=(15, 23, 42, 255))
    draw.rectangle([12, cy - 2, 20, cy + 1], fill=eye_color)

    # Glitch sparks on hit
    if is_hit:
        draw.line([(4, 4), (12, 12)], fill=(255, 255, 255, 255), width=2)
        draw.line([(20, 4), (28, 12)], fill=(239, 68, 68, 255), width=2)

    return img

def generate_enemy_sheet(num_frames, action):
    sheet = Image.new("RGBA", (32 * num_frames, 32), (0, 0, 0, 0))
    for i in range(num_frames):
        f = create_enemy_frame(i, num_frames, action)
        sheet.paste(f, (i * 32, 0))
    return sheet

# ----------------------------------------------------
# 4. GENERATE ITEMS (Strawberry.png -> Energy Crystal, Kiwi.png -> Microchip)
# ----------------------------------------------------
def create_item_crystal_frame(frame_idx, total_frames):
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi

    y_off = int(round(math.sin(t) * 2))
    cx, cy = 16, 16 + y_off

    # Outer Energy Glow Ring
    draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], outline=(56, 189, 248, 180), width=1)

    # Diamond Energy Crystal
    draw.polygon([
        (cx, cy - 10),
        (cx + 8, cy),
        (cx, cy + 10),
        (cx - 8, cy)
    ], fill=(6, 182, 212, 255), outline=(224, 242, 254, 255))

    draw.polygon([
        (cx, cy - 10),
        (cx + 3, cy),
        (cx, cy + 10),
        (cx - 3, cy)
    ], fill=(255, 255, 255, 220))

    return img

def create_item_chip_frame(frame_idx, total_frames):
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi

    y_off = int(round(math.cos(t) * 2))
    cx, cy = 16, 16 + y_off

    # Gold Microchip
    draw.rectangle([cx - 8, cy - 8, cx + 8, cy + 8], fill=(245, 158, 11, 255), outline=(254, 240, 138, 255))

    # Pins
    for p in range(cx - 6, cx + 7, 4):
        draw.line([(p, cy - 11), (p, cy - 8)], fill=(217, 119, 6, 255), width=1)
        draw.line([(p, cy + 8), (p, cy + 11)], fill=(217, 119, 6, 255), width=1)

    # Green Circuit Core
    draw.rectangle([cx - 4, cy - 4, cx + 4, cy + 4], fill=(16, 185, 129, 255))
    draw.rectangle([cx - 1, cy - 1, cx + 1, cy + 1], fill=(255, 255, 255, 255))

    return img

def generate_item_sheet(num_frames, item_type):
    sheet = Image.new("RGBA", (32 * num_frames, 32), (0, 0, 0, 0))
    for i in range(num_frames):
        if item_type == "crystal":
            f = create_item_crystal_frame(i, num_frames)
        else:
            f = create_item_chip_frame(i, num_frames)
        sheet.paste(f, (i * 32, 0))
    return sheet

# ----------------------------------------------------
# 5. GENERATE FLAG (Flag.png -> 640x64 - 10 frames of 64x64)
# ----------------------------------------------------
def create_flag_frame(frame_idx, total_frames):
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi

    # Teleport Metallic Base
    draw.ellipse([16, 52, 48, 62], fill=(30, 41, 59, 255), outline=(0, 229, 255, 255))
    draw.ellipse([22, 55, 42, 59], fill=(0, 229, 255, 255))

    # Pole
    draw.line([(32, 10), (32, 55)], fill=(148, 163, 184, 255), width=3)
    draw.ellipse([29, 6, 35, 12], fill=(245, 158, 11, 255))

    # Holographic Sci-Fi Flag Banner
    wave = math.sin(t) * 4
    flag_pts = [
        (32, 12),
        (56 + wave, 18),
        (52 + wave, 34),
        (32, 28)
    ]
    draw.polygon(flag_pts, fill=(6, 182, 212, 200), outline=(255, 255, 255, 255))
    draw.text((36, 18), "ROBO", fill=(255, 255, 255, 255))

    # Pulsing Beam
    draw.line([(32, 12), (32, 55)], fill=(255, 255, 255, 200), width=1)

    return img

def generate_flag_sheet(num_frames=10):
    sheet = Image.new("RGBA", (64 * num_frames, 64), (0, 0, 0, 0))
    for i in range(num_frames):
        f = create_flag_frame(i, num_frames)
        sheet.paste(f, (i * 64, 0))
    return sheet

# ----------------------------------------------------
# MAIN GENERATION PROCESS
# ----------------------------------------------------
bg_img = create_cyber_bg()
enemy_idle = generate_enemy_sheet(14, "idle")
enemy_run = generate_enemy_sheet(16, "run")
enemy_hit = generate_enemy_sheet(5, "hit")
crystal_items = generate_item_sheet(17, "crystal")
chip_items = generate_item_sheet(17, "chip")
flag_img = generate_flag_sheet(10)

for target_dir in target_dirs:
    base_terrain_path = os.path.join(target_dir, "terrain.png")
    terrain_img = create_cyber_terrain(base_terrain_path)

    bg_img.save(os.path.join(target_dir, "bg.png"))
    terrain_img.save(os.path.join(target_dir, "terrain.png"))
    enemy_idle.save(os.path.join(target_dir, "enemy1Idle.png"))
    enemy_run.save(os.path.join(target_dir, "enemy1Run.png"))
    enemy_hit.save(os.path.join(target_dir, "enemy1Hit.png"))
    crystal_items.save(os.path.join(target_dir, "Strawberry.png"))
    chip_items.save(os.path.join(target_dir, "Kiwi.png"))
    flag_img.save(os.path.join(target_dir, "Flag.png"))
    print(f"Generated all cyber world assets into {target_dir}")

print("ALL CYBER WORLD ASSETS CREATED SUCCESSFULLY!")
