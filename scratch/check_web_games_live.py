import urllib.request
import time

url = "https://robomind-coba.vercel.app/web-games/robo-pose/index.html"

print("Checking Vercel deployment for /web-games/robo-pose/index.html...")

for i in range(10):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            print(f"Fetch {i+1} status: {resp.status}")
            if "Robo Pose" in content and "Menginisialisasi" in content:
                print("SUCCESS! Standalone Robo Pose HTML game is live and serving from Vercel!")
                break
    except Exception as e:
        print(f"Fetch {i+1} error (waiting for Vercel build...): {e}")
    time.sleep(3)
