from PIL import Image, ImageDraw
import os
import math

target_dirs = [
    r"d:\project-26\RoboMind\public\robo-bros\assets",
    r"d:\project-26\RoboMind\robo-bros\assets"
]

def create_vibrant_enemy_frame(frame_idx, total_frames, action="idle"):
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi

    cx, cy = 16, 18
    y_off = int(round(math.sin(t) * 1.2)) if action == "idle" else 0
    is_hit = action == "hit"

    cy += y_off

    # 1. Soft Outer Neon Glow Aura
    aura_color = (255, 0, 85, 90) if not is_hit else (255, 255, 255, 120)
    draw.ellipse([cx - 10, cy - 8, cx + 10, cy + 9], fill=aura_color)

    # 2. Shadow underneath
    draw.ellipse([7, 27, 25, 31], fill=(0, 0, 0, 160))

    # 3. Cyber Treads / Wheels with Glowing Neon Orbs
    tread_dx = int(round(math.sin(t * 3) * 1.5)) if action == "run" else 0
    draw.rectangle([7, cy + 4, 25, cy + 8], fill=(15, 23, 42, 255), outline=(0, 245, 255, 255))
    for wx in range(9 + tread_dx, 24, 5):
        if 7 <= wx <= 24:
            draw.ellipse([wx - 1, cy + 5, wx + 1, cy + 7], fill=(255, 215, 0, 255))

    # 4. Vibrant Electric Neon Pink/Crimson Drone Body
    body_fill = (255, 0, 85, 255) if not is_hit else (153, 27, 27, 255)
    body_outline = (255, 255, 255, 255)
    draw.rectangle([7, cy - 6, 25, cy + 4], fill=body_fill, outline=body_outline)

    # 3D Highlight line
    draw.line([(8, cy - 5), (24, cy - 5)], fill=(255, 102, 153, 255), width=1)

    # 5. Electric Gold Horns / Spikes on Top
    spike_color = (255, 215, 0, 255)
    draw.polygon([(9, cy - 6), (11, cy - 12), (13, cy - 6)], fill=spike_color, outline=(255, 255, 255, 255))
    draw.polygon([(15, cy - 6), (16, cy - 14), (17, cy - 6)], fill=(0, 245, 255, 255), outline=(255, 255, 255, 255))
    draw.polygon([(19, cy - 6), (21, cy - 12), (23, cy - 6)], fill=spike_color, outline=(255, 255, 255, 255))

    # 6. GLOWING NEON LASER EYE VISOR
    visor_fill = (0, 245, 255, 255) if not is_hit else (255, 255, 255, 255)
    draw.rectangle([9, cy - 4, 23, cy + 2], fill=(15, 23, 42, 255), outline=(255, 255, 255, 255))
    draw.rectangle([11, cy - 3, 21, cy + 1], fill=visor_fill)

    # Glowing White Lens Reflection / Pupils
    if not is_hit:
        draw.rectangle([13, cy - 2, 15, cy], fill=(255, 255, 255, 255))
        draw.rectangle([17, cy - 2, 19, cy], fill=(255, 255, 255, 255))
    else:
        # Cross eyes when hit
        draw.line([(12, cy - 2), (14, cy)], fill=(255, 0, 85, 255), width=1)
        draw.line([(12, cy), (14, cy - 2)], fill=(255, 0, 85, 255), width=1)
        draw.line([(18, cy - 2), (20, cy)], fill=(255, 0, 85, 255), width=1)
        draw.line([(18, cy), (20, cy - 2)], fill=(255, 0, 85, 255), width=1)

    return img

def generate_vibrant_enemy_sheet(num_frames, action):
    sheet = Image.new("RGBA", (32 * num_frames, 32), (0, 0, 0, 0))
    for i in range(num_frames):
        f = create_vibrant_enemy_frame(i, num_frames, action)
        sheet.paste(f, (i * 32, 0))
    return sheet

idle_sheet = generate_vibrant_enemy_sheet(14, "idle")
run_sheet = generate_vibrant_enemy_sheet(16, "run")
hit_sheet = generate_vibrant_enemy_sheet(5, "hit")

for target_dir in target_dirs:
    if os.path.exists(target_dir):
        idle_sheet.save(os.path.join(target_dir, "enemy1Idle.png"))
        run_sheet.save(os.path.join(target_dir, "enemy1Run.png"))
        hit_sheet.save(os.path.join(target_dir, "enemy1Hit.png"))
        print(f"Updated vibrant enemy drone sheets in {target_dir}")

print("VIBRANT ENEMY ASSETS CREATED SUCCESSFULLY!")
