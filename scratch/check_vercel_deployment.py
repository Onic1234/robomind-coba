import urllib.request
import time

url = "https://robomind-coba.vercel.app/"

print("Checking Vercel site...")
for i in range(5):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8')
            print(f"Fetch {i+1} status: {resp.status}")
            import re
            matches = re.findall(r'_expo/static/js/web/entry-[a-f0-9]+\.js', html)
            if matches:
                print(f"Current deployed JS entry hash: {matches[0]}")
    except Exception as e:
        print(f"Fetch {i+1} error: {e}")
    time.sleep(3)
