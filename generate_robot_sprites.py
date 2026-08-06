from PIL import Image, ImageDraw
import os
import math

def create_robot_frame(
    frame_idx=0,
    total_frames=1,
    action="idle"
):
    # 32x32 RGBA canvas
    img = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Motion calculations
    t = (frame_idx / float(max(1, total_frames))) * 2 * math.pi
    
    y_offset = 0
    leg1_dx, leg1_dy = 0, 0
    leg2_dx, leg2_dy = 0, 0
    arm1_dx, arm1_dy = 0, 0
    arm2_dx, arm2_dy = 0, 0
    show_thruster = False
    is_hit = False

    if action == "idle":
        y_offset = int(round(math.sin(t) * 1.2))
    elif action == "run":
        y_offset = int(round(abs(math.sin(t * 2)) * 1.5))
        leg1_dx = int(round(math.sin(t) * 4))
        leg2_dx = -leg1_dx
        arm1_dx = -leg1_dx
        arm2_dx = leg1_dx
    elif action == "jump":
        y_offset = -2
        show_thruster = True
        leg1_dy = 2
        leg2_dy = 2
    elif action == "fall":
        y_offset = 1
        show_thruster = True
        leg1_dy = 3
        leg2_dy = 1
    elif action == "hit":
        y_offset = int(round(math.sin(t * 3) * 2))
        is_hit = True

    # 1. Shadow underneath
    if not show_thruster:
        draw.ellipse([8, 28, 24, 31], fill=(15, 23, 42, 100))

    # 2. Thruster Flame (for Jump / Fall)
    if show_thruster:
        flame_h = 4 + (frame_idx % 3) * 2
        draw.polygon([(14, 26), (16, 26 + flame_h), (18, 26)], fill=(56, 189, 248, 255))
        draw.polygon([(15, 26), (16, 26 + flame_h - 2), (17, 26)], fill=(255, 255, 255, 255))

    # Center coordinates adjusted by y_offset
    cx, cy = 16, 16 + y_offset

    # 3. LEGS & BOOTS
    boot_color = (15, 23, 42, 255)
    leg_color = (56, 189, 248, 255)

    # Left Leg
    lx1 = cx - 6 + leg1_dx
    ly1 = cy + 6 + leg1_dy
    draw.line([(cx - 4, cy + 4), (lx1, ly1 + 4)], fill=leg_color, width=2)
    draw.rectangle([lx1 - 2, ly1 + 3, lx1 + 2, ly1 + 6], fill=boot_color)

    # Right Leg
    lx2 = cx + 6 + leg2_dx
    ly2 = cy + 6 + leg2_dy
    draw.line([(cx + 4, cy + 4), (lx2, ly2 + 4)], fill=leg_color, width=2)
    draw.rectangle([lx2 - 2, ly2 + 3, lx2 + 2, ly2 + 6], fill=boot_color)

    # 4. TORSO / BODY
    body_bbox = [cx - 7, cy - 4, cx + 7, cy + 6]
    draw.rectangle(body_bbox, fill=(14, 165, 233, 255), outline=(2, 132, 199, 255))

    # Utility Belt
    draw.rectangle([cx - 7, cy + 3, cx + 7, cy + 5], fill=(245, 158, 11, 255))
    draw.rectangle([cx - 2, cy + 2, cx + 2, cy + 6], fill=(254, 240, 138, 255))

    # Power Core Emblem
    core_color = (52, 211, 153, 255) if not is_hit else (239, 68, 68, 255)
    draw.ellipse([cx - 3, cy - 2, cx + 3, cy + 2], fill=core_color)
    draw.ellipse([cx - 1, cy - 1, cx + 1, cy + 1], fill=(255, 255, 255, 255))

    # 5. ARMS & HANDS
    arm_color = (38, 134, 230, 255)
    ax1 = cx - 9 + arm1_dx
    ay1 = cy + arm1_dy
    draw.line([(cx - 6, cy - 2), (ax1, ay1 + 2)], fill=arm_color, width=2)
    draw.ellipse([ax1 - 2, ay1, ax1 + 2, ay1 + 4], fill=(245, 158, 11, 255))

    ax2 = cx + 9 + arm2_dx
    ay2 = cy + arm2_dy
    draw.line([(cx + 6, cy - 2), (ax2, ay2 + 2)], fill=arm_color, width=2)
    draw.ellipse([ax2 - 2, ay2, ax2 + 2, ay2 + 4], fill=(245, 158, 11, 255))

    # 6. HEAD & HELMET
    head_bbox = [cx - 8, cy - 15, cx + 8, cy - 4]
    draw.rectangle(head_bbox, fill=(15, 23, 42, 255), outline=(0, 229, 255, 255))

    # Antenna
    draw.line([(cx, cy - 15), (cx, cy - 19)], fill=(0, 229, 255, 255), width=2)
    draw.ellipse([cx - 2, cy - 22, cx + 2, cy - 18], fill=(245, 158, 11, 255))

    # Visor
    visor_bbox = [cx - 6, cy - 13, cx + 6, cy - 7]
    visor_fill = (0, 229, 255, 255) if not is_hit else (239, 68, 68, 255)
    draw.rectangle(visor_bbox, fill=visor_fill)

    # Eyes
    if is_hit:
        # Spiral / X eyes when hit
        draw.line([(cx - 4, cy - 12), (cx - 1, cy - 9)], fill=(255, 255, 255, 255), width=1)
        draw.line([(cx - 4, cy - 9), (cx - 1, cy - 12)], fill=(255, 255, 255, 255), width=1)
        draw.line([(cx + 1, cy - 12), (cx + 4, cy - 9)], fill=(255, 255, 255, 255), width=1)
        draw.line([(cx + 1, cy - 9), (cx + 4, cy - 12)], fill=(255, 255, 255, 255), width=1)
    else:
        draw.rectangle([cx - 4, cy - 12, cx - 2, cy - 9], fill=(255, 255, 255, 255))
        draw.rectangle([cx + 2, cy - 12, cx + 4, cy - 9], fill=(255, 255, 255, 255))

    # Cheek blushes
    if not is_hit:
        draw.point((cx - 6, cy - 6), fill=(244, 63, 94, 255))
        draw.point((cx + 6, cy - 6), fill=(244, 63, 94, 255))

    return img

def generate_sprite_sheet(num_frames, action, output_path):
    sheet = Image.new("RGBA", (32 * num_frames, 32), (0, 0, 0, 0))
    for i in range(num_frames):
        frame = create_robot_frame(i, num_frames, action)
        sheet.paste(frame, (i * 32, 0))
    sheet.save(output_path)
    print(f"Generated {output_path} ({sheet.width}x{sheet.height})")

target_dirs = [
    r"d:\project-26\RoboMind\public\robo-bros\assets",
    r"d:\project-26\RoboMind\robo-bros\assets"
]

actions_info = {
    "Idle.png": (11, "idle"),
    "Run.png": (12, "run"),
    "Jump.png": (1, "jump"),
    "Fall.png": (1, "fall"),
    "Hit.png": (7, "hit"),
}

for d in target_dirs:
    if os.path.exists(d):
        for filename, (num_frames, action) in actions_info.items():
            out_file = os.path.join(d, filename)
            generate_sprite_sheet(num_frames, action, out_file)

print("ALL ROBOT SPRITE SHEETS SUCCESSFULLY CREATED!")
