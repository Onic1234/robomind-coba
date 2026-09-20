import os, glob

brain_dir = r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2"
files = glob.glob(os.path.join(brain_dir, "**", "*"), recursive=True)

for f in files:
    if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        size = os.path.getsize(f)
        print(f"{f} ({size} bytes)")
