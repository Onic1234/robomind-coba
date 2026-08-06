from PIL import Image, ImageDraw
import os

TILE = 32

target_dirs = [
    r"D:\project-26\RoboMind\public\robo-bros\assets",
    r"D:\project-26\RoboMind\robo-bros\assets",
]

# 4 platform themes, matched to the rows the maps actually use
THEMES = [
    {"row": 0, "accent": (0, 229, 255), "hi": (56, 189, 248)},     # cyan  - main ground
    {"row": 4, "accent": (52, 211, 153), "hi": (110, 231, 183)},   # green - raised zone
    {"row": 8, "accent": (167, 139, 250), "hi": (196, 181, 253)},  # violet
    {"row": 12, "accent": (251, 191, 36), "hi": (253, 224, 71)},   # amber
]

BODY = (13, 21, 39, 255)
BODY_TOP = (16, 25, 46, 255)
SEAM = (8, 12, 26, 255)


def darken(c, f):
    return tuple(int(v * f) for v in c) + (255,)


def new_tile():
    return Image.new("RGBA", (TILE, TILE), (0, 0, 0, 0))


def rivets(draw, color=(92, 108, 130, 255)):
    for rx, ry in [(5, 5), (25, 5), (5, 25), (25, 25)]:
        draw.rectangle([rx, ry, rx + 1, ry + 1], fill=color)


def panel_lines(draw):
    draw.line([(10, 3), (10, 28)], fill=SEAM)
    draw.line([(21, 3), (21, 28)], fill=SEAM)
    draw.line([(3, 15), (28, 15)], fill=SEAM)


def edge_caps(draw, accent, is_left, is_right):
    if is_left:
        draw.rectangle([0, 0, 2, 31], fill=accent + (255,))
        draw.line([(3, 0), (3, 31)], fill=darken(accent, 0.6))
    if is_right:
        draw.rectangle([29, 0, 31, 31], fill=accent + (255,))
        draw.line([(28, 0), (28, 31)], fill=darken(accent, 0.6))


def lip(draw, accent, hi):
    draw.rectangle([0, 0, 31, 0], fill=(235, 247, 255, 255))
    draw.rectangle([0, 1, 31, 1], fill=hi + (255,))
    draw.rectangle([0, 2, 31, 3], fill=accent + (255,))
    draw.rectangle([0, 4, 31, 4], fill=darken(accent, 0.72))
    draw.rectangle([0, 5, 31, 5], fill=darken(accent, 0.5))


def bottom_shadow(draw):
    for i in range(6):
        f = 0.92 - i * 0.12
        draw.rectangle([0, 26 + i, 31, 26 + i], fill=darken((13, 21, 39), f))


def make_top(accent, hi, is_left, is_right):
    img = new_tile()
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 31, 31], fill=BODY_TOP)
    lip(draw, accent, hi)
    draw.line([(0, 6), (31, 6)], fill=(58, 72, 102, 255))
    draw.line([(0, 7), (31, 7)], fill=(20, 30, 54, 255))
    panel_lines(draw)
    for gx in (9, 16, 23):
        draw.rectangle([gx, 13, gx + 1, 14], fill=accent + (200,))
    rivets(draw)
    edge_caps(draw, accent, is_left, is_right)
    draw.rectangle([0, 30, 31, 31], fill=(6, 10, 22, 255))
    return img


def make_body(accent, is_left, is_right):
    img = new_tile()
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 31, 31], fill=BODY)
    panel_lines(draw)
    draw.line([(2, 2), (29, 2)], fill=(42, 54, 76, 255))
    rivets(draw)
    draw.rectangle([3, 27, 28, 28], fill=accent + (120,))
    edge_caps(draw, accent, is_left, is_right)
    draw.rectangle([0, 30, 31, 31], fill=(6, 10, 22, 255))
    return img


def make_bottom(accent, is_left, is_right):
    img = new_tile()
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 31, 31], fill=(10, 16, 30, 255))
    panel_lines(draw)
    draw.rectangle([3, 3, 28, 4], fill=accent + (110,))
    rivets(draw)
    bottom_shadow(draw)
    edge_caps(draw, accent, is_left, is_right)
    draw.rectangle([0, 30, 31, 31], fill=(4, 7, 16, 255))
    return img


def make_generic_panel():
    img = new_tile()
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 31, 31], fill=BODY)
    panel_lines(draw)
    rivets(draw)
    return img


def make_front_panel():
    img = new_tile()
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, 31, 31], fill=(14, 20, 38, 255))
    draw.line([(0, 1), (31, 1)], fill=(62, 76, 104, 255))
    draw.rectangle([0, 2, 31, 4], fill=(56, 189, 248, 255))
    draw.rectangle([0, 5, 31, 6], fill=(14, 34, 66, 255))
    for gx in (6, 14, 22, 30):
        draw.line([(gx, 8), (gx, 30)], fill=(8, 12, 26, 255))
    draw.rectangle([0, 30, 31, 31], fill=(4, 7, 16, 255))
    return img


def make_crate():
    img = new_tile()
    draw = ImageDraw.Draw(img)
    draw.rectangle([1, 1, 30, 30], fill=(17, 26, 47, 255))
    draw.rectangle([0, 0, 31, 31], outline=(66, 80, 108, 255))
    draw.rectangle([2, 2, 29, 29], outline=(30, 40, 66, 255))
    draw.rectangle([3, 13, 28, 15], fill=(32, 44, 72, 255))
    draw.rectangle([3, 20, 28, 22], fill=(32, 44, 72, 255))
    draw.rectangle([15, 22, 17, 24], fill=(0, 229, 255, 255))
    rivets(draw, (70, 84, 112, 255))
    return img


def build_tileset():
    sheet = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    # platform themes
    for th in THEMES:
        base = th["row"]
        accent, hi = th["accent"], th["hi"]
        for c in range(16):
            is_left = c == 6
            is_right = c == 8
            sheet.paste(make_top(accent, hi, is_left, is_right), (c * TILE, base * TILE))
            sheet.paste(make_body(accent, is_left, is_right), (c * TILE, (base + 1) * TILE))
            sheet.paste(make_bottom(accent, is_left, is_right), (c * TILE, (base + 2) * TILE))
    # spare rows 3, 7, 11
    for r in (3, 7, 11):
        for c in range(16):
            sheet.paste(make_generic_panel(), (c * TILE, r * TILE))
    # row 15
    for c in range(16):
        if c == 11:
            sheet.paste(make_front_panel(), (c * TILE, 15 * TILE))
        elif c == 12:
            sheet.paste(make_crate(), (c * TILE, 15 * TILE))
        else:
            sheet.paste(make_generic_panel(), (c * TILE, 15 * TILE))
    return sheet


def main():
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        sheet = build_tileset()
        sheet.save(os.path.join(d, "terrain.png"))
        print("saved", os.path.join(d, "terrain.png"), sheet.size)


if __name__ == "__main__":
    main()
