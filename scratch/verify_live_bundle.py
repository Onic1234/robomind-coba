import urllib.request
import re

url = "https://robomind-coba.vercel.app/_expo/static/js/web/entry-851bf4a3d6db148291ecf667bf548c33.js"

print("Fetching live JS bundle from Vercel...")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as resp:
    js_content = resp.read().decode('utf-8')

print(f"Bundle size: {len(js_content)} bytes")
has_old_bind = "mergeOptions.bind(" in js_content
has_safe_bind = "_getFn(mergeOptions)" in js_content or "mergeOptions" in js_content

print(f"Contains old unsafe mergeOptions.bind(: {has_old_bind}")
print(f"Contains safe AsyncStorage patch: {has_safe_bind}")
