from PIL import Image, ImageDraw, ImageFilter
import math
import random
import os

W, H = 2400, 600
CELL = 300
NC = W // CELL

target_dirs = [
    r"D:\project-26\RoboMind\public\robo-bros\assets",
    r"D:\project-26\RoboMind\robo-bros\assets",
]


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def make_sky():
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    stops = [
        (0,   (16, 118, 200)),
        (200, (56, 189, 248)),
        (380, (110, 205, 250)),
        (470, (175, 228, 252)),
        (530, (214, 242, 255)),
        (600, (190, 233, 252)),
    ]
    draw = ImageDraw.Draw(img)
    for y in range(H):
        c = stops[-1][1]
        for i in range(len(stops) - 1):
            y0, c0 = stops[i]
            y1, c1 = stops[i + 1]
            if y0 <= y <= y1:
                t = (y - y0) / max(1, y1 - y0)
                c = lerp_color(c0, c1, t)
                break
        draw.line([(0, y), (W, y)], fill=c + (255,))
    return img


def add_sun(base):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    cx, cy, r = 1750, 150, 54
    for i in range(r * 6, 0, -1):
        t = 1 - i / (r * 6)
        alpha = int(60 * (1 - t) ** 3)
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], outline=(255, 236, 170, alpha))
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(255, 226, 120, 255))
    draw.ellipse([cx - r * 0.72, cy - r * 0.72, cx + r * 0.72, cy + r * 0.72], fill=(255, 244, 190, 255))
    draw.ellipse([cx - r * 0.38, cy - r * 0.38, cx + r * 0.38, cy + r * 0.38], fill=(255, 252, 230, 255))
    return overlay


def add_clouds(base):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    rng = random.Random(17)
    for _ in range(16):
        x = rng.uniform(0, W)
        y = rng.uniform(40, 430)
        s = rng.uniform(0.8, 1.6)
        alpha = rng.randint(200, 245)
        for dx in (-W, 0, W):
            cx = x + dx
            w0, h0 = 150 * s, 26 * s
            draw.ellipse([cx - w0, y, cx + w0, y + h0 * 2.2], fill=(255, 255, 255, alpha))
            draw.ellipse([cx - w0 * 0.55, y - h0, cx + w0 * 0.55, y + h0 * 1.2], fill=(255, 255, 255, alpha))
            draw.ellipse([cx - w0 * 0.25, y - h0 * 1.4, cx + w0 * 0.25, y + h0 * 0.8], fill=(255, 255, 255, alpha))
    return overlay.filter(ImageFilter.GaussianBlur(2.5))


def add_mountains(base):
    draw = ImageDraw.Draw(base)
    rng = random.Random(23)
    # far mountains (soft blue)
    far = []
    freqs = [1, 2, 3]
    amps = [rng.uniform(55, 90) for _ in freqs]
    phases = [rng.uniform(0, 2 * math.pi) for _ in freqs]
    base_far = 510
    for x in range(0, W + 1):
        y = base_far
        for f, a, p in zip(freqs, amps, phases):
            y -= (math.sin(x / CELL * f * 2 * math.pi + p) * 0.5 + 0.5) * a
        far.append((x, y))
    far += [(W, H), (0, H)]
    draw.polygon(far, fill=(148, 198, 226, 255))

    # near hills (soft green-teal)
    near = []
    freqs2 = [1, 2]
    amps2 = [rng.uniform(35, 60) for _ in freqs2]
    phases2 = [rng.uniform(0, 2 * math.pi) for _ in freqs2]
    base_near = 535
    for x in range(0, W + 1):
        y = base_near
        for f, a, p in zip(freqs2, amps2, phases2):
            y -= (math.sin(x / CELL * f * 2 * math.pi + p) * 0.5 + 0.5) * a
        near.append((x, y))
    near += [(W, H), (0, H)]
    draw.polygon(near, fill=(118, 200, 168, 255))


def add_birds(base):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    rng = random.Random(31)
    for _ in range(8):
        x = rng.uniform(0, W)
        y = rng.uniform(80, 250)
        s = rng.uniform(5, 9)
        col = (70, 110, 150, rng.randint(140, 200))
        draw.line([(x - s, y), (x, y - s * 0.55)], fill=col, width=2)
        draw.line([(x, y - s * 0.55), (x + s, y)], fill=col, width=2)
    return overlay


def add_haze(base):
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for i in range(70):
        y = 530 + i
        t = i / 70.0
        draw.line([(0, y), (W, y)], fill=(255, 255, 255, int(90 * (1 - t))))
    return overlay


def build():
    img = make_sky()
    img = Image.alpha_composite(img, add_sun(img.size))
    img = Image.alpha_composite(img, add_birds(img.size))
    add_mountains(img)
    img = Image.alpha_composite(img, add_clouds(img.size))
    img = Image.alpha_composite(img, add_haze(img.size))
    return img


def main():
    for d in target_dirs:
        os.makedirs(d, exist_ok=True)
        img = build()
        img.convert("RGB").save(os.path.join(d, "bg.png"))
        print("saved", os.path.join(d, "bg.png"), img.size)


if __name__ == "__main__":
    main()
