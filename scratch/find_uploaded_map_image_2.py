import os, glob

dirs = [
    r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2\.user_uploaded",
    r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2\.tempmediaStorage"
]

for d in dirs:
    if os.path.exists(d):
        for f in os.listdir(d):
            full = os.path.join(d, f)
            print(f"{full} ({os.path.getsize(full)} bytes)")
