import urllib.request

url = "https://robomind-coba.vercel.app/robo-pose/index.html"

print("Fetching /robo-pose/index.html from Vercel...")
try:
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
        print(f"Status: {resp.status}")
        print(f"Content length: {len(content)} bytes")
        print(f"Content snippet (first 300 chars):\n{content[:300]}")
except Exception as e:
    print(f"Error fetching /robo-pose/index.html: {e}")
