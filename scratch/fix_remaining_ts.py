import os

# 1. parent-mode.tsx
with open("d:/project-26/RoboMind/app/parent-mode.tsx", "r", encoding="utf-8") as f:
    pm = f.read()
pm = pm.replace("height: '94%'", "height: '94%' as any")
pm = pm.replace('height: "94%"', 'height: "94%" as any')
with open("d:/project-26/RoboMind/app/parent-mode.tsx", "w", encoding="utf-8") as f:
    f.write(pm)

# 2. robo-bros.tsx
with open("d:/project-26/RoboMind/app/robo-bros.tsx", "r", encoding="utf-8") as f:
    rb = f.read()
rb = rb.replace("...FONTS.h2,", "...FONTS.heading,")
with open("d:/project-26/RoboMind/app/robo-bros.tsx", "w", encoding="utf-8") as f:
    f.write(rb)

# 3. robo-charge.tsx
with open("d:/project-26/RoboMind/app/robo-charge.tsx", "r", encoding="utf-8") as f:
    rc = f.read()
rc = rc.replace('name="coin"', 'name="currency-usd"')
with open("d:/project-26/RoboMind/app/robo-charge.tsx", "w", encoding="utf-8") as f:
    f.write(rc)

# 4. robo-circle.tsx
with open("d:/project-26/RoboMind/app/robo-circle.tsx", "r", encoding="utf-8") as f:
    rci = f.read()
rci = rci.replace('name="coin"', 'name="currency-usd"')
with open("d:/project-26/RoboMind/app/robo-circle.tsx", "w", encoding="utf-8") as f:
    f.write(rci)

# 5. rogue-soul.tsx - add resultsScrollContent style
with open("d:/project-26/RoboMind/app/rogue-soul.tsx", "r", encoding="utf-8") as f:
    rs = f.read()
if "resultsScrollContent:" not in rs:
    rs = rs.replace(
        "const styles = StyleSheet.create({",
        "const styles = StyleSheet.create({\n  resultsScrollContent: {\n    alignItems: 'center',\n    justifyContent: 'center',\n    paddingVertical: 16,\n  },"
    )
with open("d:/project-26/RoboMind/app/rogue-soul.tsx", "w", encoding="utf-8") as f:
    f.write(rs)

print("Applied remaining TS fixes")
