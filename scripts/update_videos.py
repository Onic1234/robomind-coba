import re
import os

def update_html_strict_videos(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Exact 1-to-1 video map only
    strict_video_map = {
        'Screw_Spin.png': 'screw_spin_preview.mp4',
        'cover.jpg': 'robo_bros_preview.mp4',
        'modul_retro.png': 'robo_bros_preview.mp4',
        'jakartaMapNewest.png': 'robo_jek_preview.mp4',
        'modul_robot.png': 'robo_delivery_preview.mp4',
        'rbt_link.png': 'robo_link_preview.mp4',
        'rbt_maze.png': 'robo_maze_preview.mp4',
        'rbt_ct.png': 'robo_circuit_preview.mp4',
        'enrg_cr.png': 'energy_core_preview.mp4',
        'rbt_escp.png': 'robo_escape_preview.mp4',
        'rbt_circle.png': 'robo_circle_preview.mp4',
        'rbt_chrg.png': 'robo_charge_preview.mp4'
    }

    # Static images (no video created yet)
    static_images = ['rgsl.png', 'modul_coding.png', 'bule_character.png', 'robomind_character_2d.png']

    # First, restore static images that don't have dedicated videos
    for poster in static_images:
        pattern = rf'<div class="relative w-full h-full video-preview-box">\s*<video [^>]*poster="{re.escape(poster)}"[^>]*>[\s\S]*?</video>\s*</div>'
        replacement = f'''<div class="relative w-full h-full overflow-hidden bg-slate-950">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="{poster}" />
          </div>'''
        content = re.sub(pattern, replacement, content)

    # Second, ensure strict video tags for games that have exact video files
    for poster, video_file in strict_video_map.items():
        pattern_img = rf'<div class="relative w-full h-full overflow-hidden bg-slate-950">\s*<img [^>]*src="{re.escape(poster)}"[^>]*>\s*</div>'
        replacement_vid = f'''<div class="relative w-full h-full video-preview-box">
            <video muted loop playsinline autoplay poster="{poster}" class="w-full h-full object-cover">
              <source src="{video_file}?v=4" type="video/mp4">
            </video>
          </div>'''
        content = re.sub(pattern_img, replacement_vid, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Strict video matching updated in {filepath}")

update_html_strict_videos(r"C:\Users\miftah\Desktop\project\robomind-coba\public\index.html")
update_html_strict_videos(r"C:\Users\miftah\Desktop\project\robomind-coba\public\app-home.html")
