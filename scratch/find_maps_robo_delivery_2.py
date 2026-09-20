import os, glob

d = r"C:\Users\Acer\.gemini\antigravity-ide\brain\70cfde80-26df-43a3-94f1-f604809b42f2\.user_uploaded"
files = glob.glob(os.path.join(d, "*"))
files.sort(key=os.path.getmtime, reverse=True)

for f in files[:10]:
    print(f"{f} ({os.path.getsize(f)} bytes)")
