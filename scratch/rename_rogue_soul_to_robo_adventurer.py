import os
import re

# 1. Update app/rogue-soul.tsx
with open("d:/project-26/RoboMind/app/rogue-soul.tsx", "r", encoding="utf-8") as f:
    rs = f.read()

rs = rs.replace('<Text style={styles.titleTextMain}>ROBO SOUL</Text>', '<Text style={styles.titleTextMain}>ROBO ADVENTURER</Text>')
rs = rs.replace('ROBO SOUL', 'ROBO ADVENTURER')
rs = rs.replace('Rogue Soul adalah game aksi 2D', 'Robo Adventurer adalah game petualangan aksi 2D')
rs = rs.replace('title="Cara Main Rogue Soul"', 'title="Cara Main Robo Adventurer"')
rs = rs.replace('Memuat Rogue Soul...', 'Memuat Robo Adventurer...')

with open("d:/project-26/RoboMind/app/rogue-soul.tsx", "w", encoding="utf-8") as f:
    f.write(rs)
print("Updated app/rogue-soul.tsx to Robo Adventurer")

# 2. Update dashboard html files
dashboard_files = [
    "d:/project-26/RoboMind/index.html",
    "d:/project-26/RoboMind/app/index.html",
    "d:/project-26/RoboMind/public/index.html",
    "d:/project-26/RoboMind/public/app-home.html"
]

for df in dashboard_files:
    if not os.path.exists(df): continue
    with open(df, "r", encoding="utf-8") as f:
        c = f.read()

    c = c.replace('Square Game Card: Rogue Soul 2', 'Square Game Card: Robo Adventurer')
    c = c.replace('alt="Rogue Soul 2"', 'alt="Robo Adventurer"')
    c = c.replace('>Rogue Soul 2</h4>', '>Robo Adventurer</h4>')
    c = c.replace('title: "Rogue Soul II"', 'title: "Robo Adventurer"')

    with open(df, "w", encoding="utf-8") as f:
        f.write(c)
    print(f"Updated dashboard file {df} to Robo Adventurer")
